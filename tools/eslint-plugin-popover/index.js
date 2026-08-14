'use strict';

const fs = require('fs');
const path = require('path');

const rulesDir = path.join(__dirname, 'rules');
const rules = {};

for (const file of fs.readdirSync(rulesDir)) {
  if (file.endsWith('.js')) {
    const ruleName = path.basename(file, '.js');
    rules[ruleName] = require(`./rules/${file}`);
  }
}

module.exports = {
  rules,
};
