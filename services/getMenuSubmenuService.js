const { MenuModel } = require("../models/menuModel");
const { SubmenuModel } = require("../models/submenuModel");
const { log, warn, error, info } = require('../utils/logger');

const getMenuSubmenu = async (roleId) => {
    try {
      const menus = await MenuModel.find({ roleId: { $in: roleId } }).sort({ index: 1 });
  
      const menuDtl = await Promise.all(
        menus.map(async (menu) => {
          const submenus = await SubmenuModel.find({
            menuId: menu.menuId, // Link using menuId
            roleId: { $in: roleId }
          }).sort({ index: 1 });
  
          // Construct the menu and submenu response
          return {
            component: menu.component,
            name: menu.name,
            to: menu.to,
            // icon: `<${menu.icon} className='nav-icon' />`,
            icon: menu.icon,
            items: submenus.length > 0 ? submenus.map((submenu) => ({
              component: submenu.component,
              name: submenu.name,
              to: submenu.to,
            })) : undefined, // Include submenu only if it exists
          };
        })
      );
  
      return menuDtl;
    } catch (error) {
     
      throw new Error('Failed to retrieve menu and submenu details');
    }
  };

module.exports = { getMenuSubmenu };


