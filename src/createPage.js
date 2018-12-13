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

// 1，获取输入的页面名称
const readline = require('readline');
const sofaConfig = require('../lib/sofaConfig.js');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

readSyncByRl('请输入页面名称').then((name) => {
  if (typeof(name) === 'string') {
    confirm('是否确认页面名称为' + name + '?').then((result) => {
      if (result) {
        // 2, 借助sofaConfig获取pageTemplatePath;
        const templateFolderPath = path.resolve(process.cwd()) + '/' +sofaConfig.getConfig('pageTemplatePath');
        console.log(templateFolderPath);
        listTheTemplates(templateFolderPath);
        // console.log('*************创建完成***********');
        // process.exit(0);
        // return;
      }
      // console.log('*************结束***************');
      // process.exit(0);
    });
  }
});
// 3. 列出所有模板选择 4. 是否有父级，指定父级key
function listTheTemplates(templatePath) {
  const arr = [];
  const files = fs.readdirSync(templatePath);
  files.forEach(function (item, index) {
      const stat = fs.lstatSync(path.join(templatePath, item));
      if (stat.isDirectory() === true) { 
        arr.push(item)
      }
  });
  inquirer.prompt([{
    type: 'list',
    message: '请选择要复制的模板',
    choices: arr,
    name: 'template',
  }]).then(({ template }) => {
    console.log(path.join(templatePath, template));
    inquirer.prompt([{
      type: 'confirm',
      message: '该页面是否有父级？',
      name: 'type'
    }]).then(({ type }) => {
      console.log(type);
      if (type) {
        inquirer.prompt([{
          type: 'input',
          message: '请输入父模块的key值: ',
          name: 'parent'
        }]).then(({ parent }) => {
          if (parent) {
            // runGeneratePage(templateInfo, parent, pageName, author, parent)
            console.log(parent);
          }
        })
      } else {
        // runGeneratePage(templateInfo, null, pageName, author, '无')
      }
    })
  });
  // return arr;
}