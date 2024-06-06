const mongoose = require("mongoose");
const { error } = require("console");
const JoggingTime = require("../models/joggingModel");
const catchAsync = require("./../utils/catchAsync");
const fs = require("fs");
const appError = require("./../utils/appError");

// Importing data as JSON
// const joggingTimes = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/joggingTimes.json`)
// );

exports.getAllEntries = catchAsync(async (req, res, nenxt) => {
  const entries = await JoggingTime.find({ userId: req.user.id });

  if (entries.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: "No entries found",
    });
  }

  res.status(200).json({
    status: "success",
    results: entries.length,
    data: {
      entries,
    },
  });
});

exports.getEntry = catchAsync(async (req, res, next) => {
  const entry = await JoggingTime.findById(req.params.id).populate("userId");
  console.log(
    `getEntry document after population: ${JSON.stringify(entry, null, 2)}`
  );

  if (!entry) {
    return res.status(404).json({
      status: "fail",
      message: "Entry not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      entry,
    },
  });
});

exports.createEntry = catchAsync(async (req, res) => {
  req.body.userId = req.user.id; // Set userId to the current logged-in user

  const newEntry = await JoggingTime.create(req.body);
  // console.log(req.body);

  res.status(201).json({
    status: "success",
    data: {
      newEntry,
    },
  });
});

exports.editEntry = catchAsync(async (req, res, next) => {
  const entry = await JoggingTime.findByIdAndUpdate(
    req.params.id,
    req.body,

    {
      new: true, // Ensure returning of entry doc
      runValidators: true, // Ensure the update obeys schema validation rules
    }
  ).populate("userId");

  if (!entry) {
    return next(new appError("No entry found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      entry,
    },
  });
});

exports.deleteEntry = catchAsync(async (req, res, next) => {
  const entry = await JoggingTime.findByIdAndDelete(req.params.id);

  if (!entry) {
    return res.status(404).json({
      status: "fail",
      message: "No entry found with that ID",
    });
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getStats = catchAsync(async (req, res, next) => {
  console.log("User ID from request:", req.user.id);
  console.log("User ID type:", typeof req.user.id);

  const userId = new mongoose.Types.ObjectId(req.user.id.toString());
  console.log("User ID converted to ObjectId:", userId);

  const stats = await JoggingTime.aggregate([
    { $match: { userId: userId } },

    {
      $group: {
        _id: "$userId",
        numEntries: { $sum: 1 },
        totalDistance: { $sum: "$distance" },
        avgSpeed: {
          $avg: {
            $divide: ["$distance", { $subtract: ["$endTime", "$startTime"] }],
          },
        },
      },
    },
    // {
    //   $sort: { _id: 1 },
    // },
  ]);

  console.log(`Stats: ${stats}`);

  if (!stats || stats.length == 0) {
    return next(new appError("There are no statistics available"));
  }

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});
