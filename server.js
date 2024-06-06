const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const joggingRouter = require("./routes/joggingRoutes");
const userRouter = require("./routes/userRoutes");
const testingRouter = require("./routes/testingRoutes");
const appError = require("./utils/appError");
const globalErrorController = require("./controllers/globalErrorController");

dotenv.config({ path: "./config.env" });

const app = express();

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! RUNTIME ERROR! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

// Middlewares
app.use(morgan("dev"));
app.use(bodyParser.json());

// Connecting to database
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then((con) => {
    console.log("DB connection successful!");
  })
  .catch((error) => {
    console.error(`Error connecting to DB: ${error}`);
  });

// Routes
app.use("/api/v1/joggings", joggingRouter);
app.use("/api/v1/users", userRouter);

// If no route matches, 404 error
app.all("*", (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling moiddleware
app.use(globalErrorController);

// Starting server

const port = process.env.PORT; //4000
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(
    "UNHANDLED REJECTION! UNCAUGHT PROMISE ERROR! 💥 Shutting down..."
  );
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
