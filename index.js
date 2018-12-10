#!/usr/bin/env node
'use strict'

const commander = require('commander');
const generatePage = require('./src/createPage');
const generateComponent = require('./src/createComponent');
const generateProject = require('./src/createPage');

commander
  .version('0.1.9')
  .option('-c, --component [componentName]', 'create a new component')
  .option('-p, --page [pageName]', 'create a new page')
  .option('-P, --project [projectName]', 'create a new project')
  .option('-d, --delete [componentName]', 'delete a component')
  .parse(process.argv);


if (commander.page) {
  generatePage(commander.page);
}

if (commander.component) {
  generateComponent(commander.component);
}

if (commander.project) {
  generateProject(commander.project);
}

