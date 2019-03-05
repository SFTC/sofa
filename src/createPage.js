/**
 * 生成Page
 * 
 * step1. 与用户交互获取PageName；
 * step2. 借助sofaConfig获取pageTemplatePath;
 * step3. 列出所有可用模板，与用户交互选择模板；
 * step4. 与用户交互是否存在父级；
 * step5. 拷贝文件，获取用户git信息，嵌入注释；
 * step6. 替换关键词PageName，这里需要注意替换 KeyWord、keyWord、keyword、KEYWORD等多种情形；
 * step7. 处理Menu及国际化相关；
 * step8. 在Jsonstore中记录操作日志
 */
/* eslint-disable */
// 1，获取输入的页面名称
const readline = require('readline');
const sofaConfig = require('../lib/sofaConfig.js');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const Metalsmith = require('metalsmith');
const fileName = require('../lib/fileName');
const async = require('async');
const consolidate = require('consolidate');
const gitInfo = require('../lib/git');
const comment = require('../lib/comment');
const updateRelatedContent = require('../lib/updateRelatedContent');
const jsonStore = require('../lib/jsonStore');

// 与用户交互获取的配置值
const createPageConfig = {}; // pageName templatePath templateName parentKey

// 交互-输入
function readSyncByRl(tips) {
  tips = tips + '>' || '> ';
  return new Promise((resolve) => {
    inquirer.prompt([{
      type: 'input',
      message: tips,
      name: 'name'
    }]).then((result) => {
      resolve(result.name);
    });
  });
}
// 交互-确认
function confirm(message) {
  message = message + '(y/n)' || '是否确认?' + '(y/n)';
  return new Promise((resolve) => {
    inquirer.prompt([{
      type: 'confirm',
      message,
      name: 'name'
    }]).then((name) => {
      resolve(name);
    });
  });
}

// 3. 列出所有模板选择 4. 是否有父级，指定父级key
function listTheTemplates(templatePath) {
  return new Promise((resolve) => {
    const arr = [];
    const files = fs.readdirSync(templatePath);
    files.forEach((item) => {
      const stat = fs.lstatSync(path.join(templatePath, item));
      if (stat.isDirectory() === true) {
        arr.push(item);
      }
    });
    inquirer.prompt([{
      type: 'list',
      message: '请选择要复制的模板',
      choices: arr,
      name: 'template',
    }]).then(({ template }) => {
      createPageConfig.templatePath = templatePath;
      createPageConfig.templateName = template;
      inquirer.prompt([{
        type: 'confirm',
        message: '该页面是否有父级？',
        name: 'type',
      }]).then(({ type }) => {
        if (type) {
          inquirer.prompt([{
            type: 'input',
            message: '请输入父模块的key值: ',
            name: 'parent',
          }]).then(({ parent }) => {
            if (parent) {
              createPageConfig.parentKey = parent;
              resolve();
            }
          })
        } else {
          resolve();
        }
      })
    });
  });
}

// 5. 拷贝文件，获取用户git信息，嵌入注释；
function generatePage(pageName, templatePath, templateName, parentKey) {
  const templateFullPath = path.resolve(templatePath + '/' + templateName);
  const metalsmith = Metalsmith(templateFullPath);
  const metadata = metalsmith.metadata();
  const destination = path.resolve(templatePath + '/' + fileName.getHeadUpperName(pageName));
  metadata.templateName = templateName;
  metadata.pageNameUpper = fileName.getHeadUpperName(pageName);
  metadata.moduleName = parentKey;
  // 获取git信息
  gitInfo(['user'], (err, result) => {
    const user = result ? result.user : null;
    metadata.author = `<${user}>`;
    createPageConfig.author = `<${user}>`;
  }).then(() => {
    metalsmith.clean(false)
      .use(updateContent)
      .source('.')
      .destination(destination)
      .build((err, files) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Finish copy')
          // 7. 处理Menu及国际化相关
          updateRelatedContent(metadata.moduleName ? 'page' : 'module', createPageConfig);
          console.log(createPageConfig);
          jsonStore.create('key', createPageConfig, true);
          console.log('*************创建完成***********');
          process.exit(0);
        }
      });
  });
}

function updateContent(files, metalsmith, callback) {
  const keys = Object.keys(files);
  const metadata = metalsmith.metadata();
  async.each(keys, run, callback);

  function run(file, callback) {
    let str = files[file].contents.toString();
    str = comment.removeDuplicate(str);
    // 加注释
    str = comment.generateComment(file, createPageConfig).concat(str);
    consolidate.ejs.render(str, metadata, function(err, res) {
      if (err) {
        console.log('wrong', file, err);
        return callback(err);
      }
      console.log('success', file);
      // 6. 替换 KeyWord、keyWord、keyword、KEYWORD等多种情形
      res = res.replace(new RegExp(fileName.getHeadUpperName(metadata.templateName), 'g'), fileName.getHeadUpperName(createPageConfig.pageName))
               .replace(new RegExp(fileName.getHeadLower(metadata.templateName), 'g'), fileName.getHeadLower(metadata.pageNameUpper))
               .replace(new RegExp(fileName.getFullUpper(metadata.templateName), 'g'), fileName.getFullUpper(metadata.pageNameUpper))
               .replace(new RegExp(fileName.getFullLower(metadata.templateName), 'g'), fileName.getFullLower(metadata.pageNameUpper))
      files[file].contents = new Buffer(res);
      callback();
    });
  }
}

const generatePage = () => {
  readSyncByRl('请输入页面名称').then((name) => {
    if (typeof (name) === 'string') {
      confirm('是否确认页面名称为' + name + '?').then((result) => {
        if (result) {
          // 2, 借助sofaConfig获取pageTemplatePath;
          createPageConfig.pageName = name;
          readSyncByRl('请输入页面中文名称').then((pageChineseName) => {
            createPageConfig.pageChineseName = pageChineseName;
            const templateFolderPath = path.resolve(process.cwd()) + '/' + sofaConfig.getConfig('pageTemplatePath');
            listTheTemplates(templateFolderPath).then(() => {
              const { pageName, templatePath, templateName, parentKey } = createPageConfig;
              generatePage(pageName, templatePath, templateName, parentKey || null);
            });
          });
        }
      });
    }
  });
}

module.exports = generatePage;
/* eslint-enable */
