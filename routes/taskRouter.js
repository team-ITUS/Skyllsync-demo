const express = require("express");
const {
  createTask,
  getAllTaskList,
  getTrainerTask,
  getTaskById,
  deleteTaskById,
  updateTaskById,
} = require("../controllers/taskController");

const taskRouter = express.Router();

taskRouter.post("/createTask", createTask); // create task
taskRouter.get("/getAllTaskList", getAllTaskList); //get all trainers task list
taskRouter.get("/getTrainerTask/:trainerId", getTrainerTask); // get task by trainer Id
taskRouter.get("/getTaskById/:taskId", getTaskById); // get task by taskId
taskRouter.delete("/deleteTaskById/:taskId", deleteTaskById); //delete task by taskId
taskRouter.put("/updateTaskById/:taskId", updateTaskById); // update task details by taskId

module.exports = { taskRouter };
