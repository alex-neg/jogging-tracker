const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const joggingModel = require("./models/joggingModel");

dotenv.config({ path: "./config.env" });

// const DB = process.env.DATABASE.replace(
//   "PASSWORD",
//   process.env.DATABASE.PASSWORD
// );

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log("DB connection successfull!");
  })
  .catch((error) => {
    console.error(`Error connecting to DB: ${error}`);
  });

// Read JSON file
const joggings = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/joggingTimes.json`, "utf-8")
);

// Import data into DB
const importData = async () => {
  try {
    await joggingModel.create(joggings);
    console.log("Data successfully loaded!");
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

// Delete all data from DB
const deleteData = async () => {
  try {
    await joggingModel.deleteMany();
    console.log("Data succesfully deleted!");
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}

// console.log(process.argv);
