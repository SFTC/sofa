/**
 * 生成Component
 *
 * step1. 与用户交互获取ComponentName;
 * step2. 在config中读取ProjectName;
 * step3. 以ComponentName+ProjectName在JsonStore中做重复性检测；
 * step4. 以ComponentName进行查询，若存在，提示用户在某项目中已存在此组件，是否继续；
 * step5. 在config中读取componentTemplatePath;
 * step6. 拷贝文件，获取用户git信息，嵌入注释；
 * step7. 替换关键词ComponentName，这里需要注意替换 KeyWord、keyWord、keyword、KEYWORD等多种情形；
 * step8. 在Jsonstore中记录组件，ProjectName&ComponentName;
 * step9. 在Jsonstore中记录操作日志
 */
const Metalsmith = require('metalsmith');
const path = require('path');
const inquirer = require('inquirer');

const fileName = require('../utils/fileName');
const template = require('../utils/template');
const Utils = require('../utils/utils');
const config = require('../conf/default.config');
const fileOperates = require('../utils/fileOperates');
const gitInfo = require('../lib/git');

const chalk = require('chalk');
const JsonStore = require('../lib/jsonStore');

// 交互-输入
function readSyncByRl(tips) {
  // eslint-disable-next-line
  tips = tips + '>' || '> ';
  return new Promise((resolve) => {
    inquirer.prompt([{
      type: 'input',
      message: tips,
      name: 'name',
    }]).then((result) => {
      resolve(result.name);
    });
  });
}
// 交互-确认
function confirm(message) {
  // eslint-disable-next-line
  message = message + '(y/n)' || '是否确认?' + '(y/n)';
  return new Promise((resolve) => {
    inquirer.prompt([{
      type: 'confirm',
      message,
      name: 'name',
    }]).then((name) => {
      resolve(name);
    });
  });
}

function filter(files, metalsmith, callback) {
  fileOperates.filter(files);
  callback();
}

function generateComment(data) {
  const commentsData = {};
  commentsData.author = data.author;
  commentsData.date = data.date;
  commentsData.componentName = data.ComponentName;
  let commentStr = '/**\n';
  Object.keys(commentsData).forEach(item => {
    commentStr += ` * ${item}: ${commentsData[item]}\n`;
  })
  return `${commentStr} */\n`;
}

function updateContent(files, metalsmith, callback) {
  const data = metalsmith.metadata();
  // 加注释
  Object.keys(files).forEach(fileName => {
    let fileContentsString = files[fileName].contents.toString(); //Handlebar compile 前需要转换为字符串
    fileContentsString = generateComment(data).concat(fileContentsString);
    files[fileName].contents = new Buffer(fileContentsString);
  });
  fileOperates.replaceText(files, data, {
    [config.defaultComponentTemplateName]: data.ComponentName,
  }, callback);
}

function copyPackage(params) {
  const pureName = params.PureName;

  // const templatePackagePath = template.checkTemplateVersion();
  const templatePath = path.join(config.componentTemplatePath, config.defaultComponentTemplateName);
  const destPath = path.resolve(config.componentTemplatePath, params.ComponentName);

  const metalsmith = Metalsmith(templatePath);
  const metadata = metalsmith.metadata();

  metadata.PureName = params.PureName;
  metadata.ComponentName =params.ComponentName;
  metadata.HyphenComponentName = params.HyphenComponentName;
  metadata.author = params.author;
  metadata.date = Utils.formatDate(new Date());
  const p = function(resolve, reject) {
    metalsmith.clean(false)
      .use(filter)
      .use(updateContent)
      .source('.')
      .destination(destPath)
      .build((err, files) => {
        if (err) {
          reject(err);
        } else {
          console.log('Finish copy');
          resolve(true);
        }
      })
  }
  return new Promise(p);
}

function copyTemplate(componentName, author) {
  const params = {
    PureName: fileName.getPureComponentName(componentName),
    ComponentName: fileName.getHeadUpper(componentName),
    HyphenComponentName: fileName.getHyphenComponentName(componentName),
    author
  }
  return Promise.all([
    copyPackage(params),
    // copyTest(params),
  ])
}

function generateComponent() {
  let componentName;
  readSyncByRl('请输入组件名称').then((name) => {
    if (typeof (name) === 'string') {
      // eslint-disable-next-line
      confirm('是否确认组件名称为' + name + '?').then((result) => {
        if (result) {
          componentName = name;
          JsonStore.search(componentName).then((res) => {
            if (res) { // create
              gitInfo(['user'], (err, result) => {
                const user = result ? result.user : null;
                copyTemplate(componentName, user).then(() => {
                  JsonStore.createComponent(componentName);
                }).catch((err) => {
                  console.log(err);
                });
              });
            } else {
              console.log(chalk.yellow(`${componentName} is already exist, please change a other name , or run *sofa -d ${componentName}* to delete the declare`));
            }
          }).catch((err) => {
            console.log(err);
          });
        }
      });
    }
  });
}

module.exports = generateComponent;
