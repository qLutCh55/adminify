const fs = require('fs');
const path = require('path');

let menuPath = path.resolve(__dirname, '../../../resources/js/menu.js');

let leftTopBarItemsPath = path.resolve(__dirname, '../../../resources/js/leftTopBar.js');
let rightTopBarItemsPath = path.resolve(__dirname, '../../../resources/js/rightTopBar.js');

if (!fs.existsSync(menuPath)) {
    menuPath = './menu.js';
}

if (!fs.existsSync(leftTopBarItemsPath)) {
    leftTopBarItemsPath = './leftTopBar.js';
}

if (!fs.existsSync(rightTopBarItemsPath)) {
    rightTopBarItemsPath = './rightTopBar.js';
}

let menu = require(menuPath);
let leftTopBar = require(leftTopBarItemsPath);
let rightTopBar = require(rightTopBarItemsPath);

let variables = {
    ADMINIFY_MENU: JSON.stringify(menu),
    ADMINIFY_LEFT_TOP_MENU: JSON.stringify(leftTopBar),
    ADMINIFY_RIGHT_TOP_MENU: JSON.stringify(rightTopBar),
};

module.exports = variables;
