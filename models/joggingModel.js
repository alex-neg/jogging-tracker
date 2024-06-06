const mongoose = require("mongoose");
const validator = require("validator");

const joggingTimeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    description: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual props

joggingTimeSchema.virtual("averageSpeed").get(function () {
  // Calc duration in hours
  const durationInHours =
    (new Date(this.endTime) - new Date(this.startTime)) / 3600000;

  // Calc average speed
  return this.distance / durationInHours + " km/h";
});

const JoggingTime = mongoose.model("JoggingTime", joggingTimeSchema);

module.exports = JoggingTime;
