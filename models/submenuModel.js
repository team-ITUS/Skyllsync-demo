const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const Submenu = new mongoose.Schema({
  submenuId: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true,
  },

  component: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  to: {
    type: String,
    required: true,
  },

  roleId: {
    type: [Number], // Array of numbers for role IDs
    required: true,
  },

  index: {
    type: Number,
    required: true,
  },
});

const SubmenuModel = mongoose.model("submenus", Submenu);

module.exports = { SubmenuModel };
