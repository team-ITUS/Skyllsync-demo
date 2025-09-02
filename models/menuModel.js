const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const Menu = new mongoose.Schema({
  menuId: {
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
    required: false,
  },

  icon: {
    type: String,
    required: true,
  },

  roleId: {
    type: [Number],
    required: true,
  },

  isSubmenu: {
    type: Boolean,
    required: true,
  },

  index: {
    type: Number,
    required: true,
  },
});

const MenuModel = mongoose.model("menus", Menu);

module.exports = { MenuModel };
