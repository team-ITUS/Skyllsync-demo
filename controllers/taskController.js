const { TaskModel } = require("../models/taskModel");
const { log, warn, error, info } = require('../utils/logger');

const createTask = async (req, res) => {
  const { taskTitle, trainerId } = req.body;

  try {
    if (!taskTitle) {
      return res
        .status(400)
        .json({ message: "Title is required", success: false });
    }

    if (!trainerId) {
      return res
        .status(400)
        .json({ message: "Trainer Id is required", success: false });
    }

    const taskModel = new TaskModel({
      taskTitle: req.body.taskTitle,
      taskDesc: req.body.taskDesc,
      status: req.body.status,
      startDate: req.body.startDate,
      dueDate: req.body.dueDate,
      trainerId: req.body.trainerId,
      trainerName: req.body.trainerName,
    });

    await taskModel.save();

    return res.status(201).json({ message: "Task created", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getAllTaskList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;

    const status = req.query.status;
    const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null;
    const toDate = req.query.toDate ? new Date(req.query.toDate) : null;
    const searchName = req.query.search || "";

    if (toDate) {
      toDate.setDate(toDate.getDate() + 1);
    }

    const skip = Math.max(0, (page - 1) * limit);

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (fromDate && toDate) {
      filter.startDate = { $gte: new Date(fromDate) };
      filter.dueDate = { $lte: new Date(toDate) };
    }

    if (searchName) {
      filter.taskTitle = { $regex: searchName, $options: "i" };
    }

    const taskList = await TaskModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-createdAt -updatedAt");

    const totalTasks = await TaskModel.countDocuments(filter);

    if (!taskList || taskList.length === 0) {
      return res
        .status(404)
        .json({ message: "Tasks not available", success: false });
    }

    return res.status(200).json({
      taskList,
      currentPage: page,
      totalPages: Math.ceil(totalTasks / limit),
      totalTasks,
      message: "Successfully retrieved trainer's task list",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getTrainerTask = async (req, res) => {
  try {
    const { trainerId } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const { status, startDate, dueDate } = req.query;

    const defaultStartDate = new Date();
    defaultStartDate.setDate(1);

    const query = {
      trainerId,
    };

    if (status) {
      query.status = status;
    }

    if (startDate && dueDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.dueDate = { $lte: new Date(dueDate) };
    }

    const trainerTask = await TaskModel.find(query).sort({createdAt:-1}).skip(skip).limit(limit);

    const totalTasks = await TaskModel.countDocuments(query);

    if (!trainerTask || trainerTask.length === 0) {
      return res
        .status(404)
        .json({ message: "Task not available", success: false });
    }

    return res.status(200).json({
      trainerTask,
      currentPage: page,
      totalPages: Math.ceil(totalTasks / limit),
      totalTasks,
      message: "Successfully get trainer task",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await TaskModel.findOne({ taskId });

    if (!task) {
      return res
        .status(404)
        .json({ message: "Task not available", success: false });
    }

    return res
      .status(200)
      .json({ task, message: "Successfully get task", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const deleteTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const isDelete = await TaskModel.findOneAndDelete({ taskId });

    if (!isDelete) {
      return res
        .status(404)
        .json({ message: "Task not available", success: false });
    }

    return res
      .status(200)
      .json({ message: "Task deleted successfully", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const updateTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const isUpdate = await TaskModel.findOneAndUpdate({ taskId }, req.body, {
      new: true,
    });

    if (!isUpdate) {
      return res
        .status(404)
        .json({ message: "Task not available", success: false });
    }
    return res
      .status(200)
      .json({ message: "Task updated successfully", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

module.exports = {
  createTask,
  getAllTaskList,
  getTrainerTask,
  getTaskById,
  deleteTaskById,
  updateTaskById,
};
