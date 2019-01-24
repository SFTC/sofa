/**
 * 生成项目
 * 
 * step1. 与用户交互获取，项目名称、主题色、开发端口等信息；
 * step2. 读取tool.config.js中的projectTemplatePath；
 * step3. 拉取模板文件，拷贝文件，获取用户git信息，嵌入注释；
 * step4. 替换关键词ProjectName，这里需要注意替换 KeyWord、keyWord、keyword、KEYWORD等多种情形；
 * step5. 将用户交互信息生成并写入sofa.config.js；
 * step6. 安装依赖；
 * step7. 运行npm run start命令；
 * step8. 在Jsonstore中记录操作日志;
 */

const chalk = require('chalk')
const inquirer = require('inquirer')
const fs = require('fs');
const path = require('path');
const Git = require("nodegit");
const Metalsmith = require('metalsmith');
const async = require('async')
const consolidate = require('consolidate')
const config = require('../conf/default.config');
const toolConfig = require('../conf/tool.config');

// step1. 与用户交互获取，项目名称、主题色、开发端口等信息；
function inquireUser() {
  return new Promise((resolve) => {
    const projectConfig = {};
    // 项目名称
    inquirer.prompt([{
      type: 'input',
      message: 'Please enter the name of the project',
      default: config.projectName,
      name: 'projectName',
    }]).then(({ projectName }) => {
      projectConfig.projectName = projectName;
      // 主题色
      inquirer.prompt([{
        type: 'input',
        message: 'Please enter the theme color of the project',
        default: config.theme,
        name: 'subjectColor',
      }]).then(({ subjectColor }) => {
        projectConfig.subjectColor = subjectColor;
        // 开发端口
        inquirer.prompt([{
          type: 'input',
          message: 'Please enter the port of the project',
          default: config.port,
          name: 'port',
        }]).then(({ port }) => {
          projectConfig.port = port;
          resolve(projectConfig);
        });
      })
    });
  });
}

function updateContent(files, metalsmith, callback){
  var keys = Object.keys(files);
  var metadata = metalsmith.metadata();
  async.each(keys, run, callback);

  function run(file, callback){
    if (file.indexOf('src') === -1 && file.indexOf('.git') === -1) {
      var str = files[file].contents.toString();
      consolidate.ejs.render(str, metadata, function(err, res){
        if (err) {
          console.log('wrong', file, err);
          return callback(err);
        }
        console.log('success', file);
        res = res.replace(new RegExp(metadata.template, 'g'), metadata.projectName);
        files[file].contents = new Buffer(res);
        callback();
      });
    }
  }
}

function filter(files, metalsmith, callback) {
  var filter = ['.DS_Store'];
  delete files[filter[0]];
  callback()
}

// step4. 替换关键词ProjectName，这里需要注意替换 KeyWord、keyWord、keyword、KEYWORD等多种情形；
function runGeneratePage(projectConfig) {
  const projectPath = `./${projectConfig.projectName}`;
  const metalsmith = Metalsmith(projectPath);
  const metadata = metalsmith.metadata();
  const to =path.join(process.cwd(), projectConfig.projectName, 'public');
  console.log('to: ', to);
  metadata.template = toolConfig.templateName;
  console.log('metadata.template: ', metadata.template);
  metadata.projectName = projectConfig.projectName;
  console.log('metadata.projectName: ', metadata.projectName);
  if (metadata.template !== metadata.projectName) {
    metalsmith.clean(false)
    .use(filter)
    .use(updateContent)
    .source('./public')
    .destination(to)
    .build((err, files) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Finish copy')
        if (metadata.moduleName) {
          // updateAttachedContent('page', metadata)
        } else {
          // updateAttachedContent('module', metadata)
        }
      }
    })
  }
}

function generateProject() {
  inquireUser().then((projectConfig) => {
    // step2. 读取tool.config.js中的projectTemplatePath；
    const gitPath = toolConfig.projectTemplatePath;
    // step3. 拉取模板文件，拷贝文件，获取用户git信息，嵌入注释；
    console.log(chalk.red(`正在从${gitPath}上拉取代码，请稍后......`));
    // Git.Clone(gitPath, `./${projectConfig.projectName}`).then(function(repo) {
    //   runGeneratePage(projectConfig);
    //   console.log(chalk.red('代码下载完毕！'));
    // })
    runGeneratePage(projectConfig);
  });
}

module.exports = generateProject;

