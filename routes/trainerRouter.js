const express = require("express");
const {
  loginTrainer,
  getTrainerList,
  deleteTrainerById,
  updateTrainerById,
  getTrainerDropdown,
  getTrainerById,
  getMyTrainerList,
  getMyTrainer
} = require("../controllers/trainerController");
const { upload } = require("../services/fileUploadService");

const trainerRouter = express.Router();

trainerRouter.post("/loginTrainer", loginTrainer); //trainer login
trainerRouter.get("/getTrainerList", getTrainerList); // get all trainer list
trainerRouter.delete("/deleteTrainerById/:trainerId", deleteTrainerById); //delete trainer by trainerId
trainerRouter.put(
  "/updateTrainerById/:trainerId",
  upload.single("file"),
  updateTrainerById
); //update trainer by trainerId
trainerRouter.get("/getTrainerDropdown", getTrainerDropdown); //get trainer dropdown list
// trainerRouter.get('/getTrainerById/:trainerId', getTrainerById); //get single trainer by trainerId
trainerRouter.get("/getTrainerById/:trainerId", getTrainerById); //
trainerRouter.get("/getMyTrainerList/:studentId", getMyTrainerList); //get student assign trainer list
trainerRouter.get('/getMyTrainer', getMyTrainer)// get student's trainer by 

module.exports = { trainerRouter };
