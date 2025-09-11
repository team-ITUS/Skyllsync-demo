const { RoleModel } = require('../models/roleModel');
const { AdminModel } = require('../models/adminModel');

async function seedDefaultRoles() {
  const defaults = [
    { name: 'Admin', description: 'Full access', permissions: ['*'] },
  ];
  for (const item of defaults) {
    const existing = await RoleModel.findOne({ name: item.name.toLowerCase() });
    if (!existing) {
      await RoleModel.create({ ...item, name: item.name.toLowerCase() });
    }
  }
}

module.exports = { seedDefaultRoles };

async function seedStaffAdmin() {
  const name = process.env.STAFF_ADMIN_NAME || 'admin';
  const pwd = process.env.STAFF_ADMIN_PASSWORD || 'Admin@123';
  // roleId '1' to keep same menu as admin
  const existing = await AdminModel.findOne({ adminName: name });
  if (!existing) {
    // Create a deterministic unique mobile to satisfy unique index on admins.mobile
    const uniqueMobile = '99999' + String(Math.floor(Math.random()*1e5)).padStart(5,'0');
    await AdminModel.create({ adminName: name, adminPassword: pwd, role: 'admin', roleId: '1', userName: name, mobile: uniqueMobile });
  }
}

module.exports.seedStaffAdmin = seedStaffAdmin;
