const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    // Explicit permissions list for fine-grained control (optional – middleware can also use code map)
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

const RoleModel = mongoose.model('roles', RoleSchema);

module.exports = { RoleModel };
