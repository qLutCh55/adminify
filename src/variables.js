const fs = require('fs');
const path = require('path');

let menuPath = path.resolve(__dirname, '../../../resources/js/menu.js');

if (!fs.existsSync(menuPath)) {
    menuPath = './menu.js';
}

let menu = require(menuPath);

let variables = {
    ADMINIFY_MENU: JSON.stringify(menu),
};

module.exports = variables;
