const { CategoryModel } = require("../models/categoryModel");
const { log, warn, error, info } = require('../utils/logger');

const createCategory = async (req, res) => {
  try {
    const { catName } = req.body;

    if (!catName) {
      return res
        .status(400)
        .json({ message: "Category name require", success: false });
    }

    const catModel = new CategoryModel({
      catName: catName,
    });

    await catModel.save();

    return res
      .status(201)
      .json({ message: "Successfully add category", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

const getCatDropdown = async (req, res) => {
  try {
    const gategories = await CategoryModel.find(
      { status: "active" },
      {
        catName: 1,
        catId: 1,
        status: 1,
      }
    );

    if (!gategories) {
      return res
        .status(404)
        .json({ message: "Categories not available", success: false });
    }

    return res
      .status(200)
      .json({ gategories, message: "Successfully find all active categories", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

module.exports = { createCategory, getCatDropdown };
