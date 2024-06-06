const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const appError = require("./../utils/appError");

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      newUser,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new appError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  console.log(req.params.id);
  console.log(req.body);
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    return next(new appError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      updatedUser,
    },
  });
});

// Does not behave as expected
exports.deleteUser = catchAsync(async (req, res, next) => {
  console.log("User ID to delete:", req.params.id);

  const deletedUser = await User.findByIdAndDelete(req.params.id);

  console.log("Delete operation result:", deletedUser);

  if (!deletedUser) {
    return next(new appError("No user found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
