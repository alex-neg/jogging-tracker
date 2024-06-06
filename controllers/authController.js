const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const appError = require("./../utils/appError");
const { log } = require("console");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create({
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   passwordConfirm: req.body.passwordConfirm,
  //   role: req.body.role,
  //   adminSecret: req.body.adminSecret,
  // });

  const { name, email, password, passwordConfirm, role, adminSecret } =
    req.body;

  // Default role to 'user' unless adminSecret is provided and matches
  let userRole = "user";
  if (adminSecret && adminSecret === process.env.ADMIN_SECRET) {
    userRole = role || "admin"; // Default to "admin" if no role is specified
  }

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role: userRole,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token: token,
    data: {
      newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new appError("Please provide you login credentials!", 400));
  }

  // const user = await User.findOne({ email });
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError("Incorrect email or paswword!", 401));
  }

  // console.log(user);

  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new appError("Please log in to get access.", 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Implement error handling for this controller

  const userExists = await User.findById(decoded.id);
  // console.log(`"userExists var: ${userExists}`);

  if (!userExists) {
    return next(new appError("The user does no longer exists.", 401));
  }

  req.user = userExists;
  next();
});

exports.restrictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new appError("You do not have permission to perform this action", 403)
      );
    }
    next();
  });
};

// exports.checkOwnership = (Model) => {
//   return catchAsync(async (req, res, next) => {
//     const doc = await Model.findById(req.params.id).populate("userId");
//     // console.log(`checkOwnership document: ${doc}`);
//     console.log(`checkOwnership document: ${JSON.stringify(doc, null, 2)}`);

//     if (!doc) {
//       return next(new appError("No document found with that ID", 404));
//     }

//     if (!doc.userId) {
//       return next(new appError("Document does not have a user reference", 400));
//     }

//     console.log(`Current user ID: ${req.user.id}`);
//     console.log(`Document user ID: ${doc.userId._id}`);

//     if (
//       doc.user.id._id.toString() !== req.user.id &&
//       req.user.role !== "admin"
//     ) {
//       return next(
//         new appError("You don not have permission to perform this action", 403)
//       );
//     }

//     next();
//   });
// };

// exports.checkOwnership = catchAsync(async (req, res, next) => {

// });

exports.checkOwnership = (Model) => {
  return catchAsync(async (req, res, next) => {
    // Find the document by ID and populate the userId field
    const doc = await Model.findById(req.params.id);
    // .populate("userId")
    // If the document does not exist, return 404 error
    if (!doc) {
      return next(new appError("No document found with that ID", 404));
    }

    // If the document does not have a userId reference, return a 400 error
    if (!doc.userId) {
      return next(new appError("Document does not have a user reference", 400));
    }

    // Log the document and current user information for debugging
    console.log(`checkOwnership document: ${JSON.stringify(doc, null, 2)}`);
    console.log(`Current user ID: ${req.user.id}`);
    console.log(`Document user ID: ${doc.userId._id}`);

    // Check if the current user is the owner of the document or an admin
    if (
      doc.userId._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return next(
        new appError("You do not have permission to perform this action", 403)
      );
    }

    // If the checks pass, proceed to the next middleware or route handler
    next();
  });
};
