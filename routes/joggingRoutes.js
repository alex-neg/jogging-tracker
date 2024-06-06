const express = require("express");
const router = express.Router();
const joggingController = require("./../controllers/joggingController");
const authController = require("./../controllers/authController");
const JoggingTime = require("../models/joggingModel");

router.use(authController.protect);

router.route("/stats").get(joggingController.getStats);

router
  .route("/")
  .get(joggingController.getAllEntries)
  .post(joggingController.createEntry);

router
  .route("/:id")
  .get(authController.checkOwnership(JoggingTime), joggingController.getEntry)
  .patch(
    authController.checkOwnership(JoggingTime),
    joggingController.editEntry
  )
  .delete(
    authController.checkOwnership(JoggingTime),
    joggingController.deleteEntry
  );

router.route("/stats").get(joggingController.getStats);

module.exports = router;
