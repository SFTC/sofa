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
const consolidate = require('consolidate');
const { exec } = require('child_process');

const config = require('../conf/default.config');
const toolConfig = require('../conf/tool.config');
const sofaConfig = require('../lib/sofaConfig');

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
        name: 'theme',
      }]).then(({ theme }) => {
        projectConfig.theme = theme;
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
  const README = `./${projectConfig.projectName}/README.md`;
  const package = `./${projectConfig.projectName}/package.json`;
  const files = [README, package];
  files.forEach((item) => {
    if (fs.existsSync(item)) { 
      let file = fs.readFileSync(item, 'utf-8');
      console.log('file: ', file);
      file = file.replace(new RegExp(toolConfig.templateName, 'g'), projectConfig.projectName);
      try {
        fs.writeFileSync(item, file);
        console.log('修改成功', item)
      } catch (error) {
        console.log('修改失败', item);
      }
    }
  })
}

// step5. 将用户交互信息生成并写入sofa.config.js；
function setUserConfig(projectConfig) {
  sofaConfig.setConfig('projectName', projectConfig.projectName);
  sofaConfig.setConfig('port', projectConfig.port);
  sofaConfig.setConfig('theme', projectConfig.theme);
}

// step6. 安装依赖；
function installDependencies(projectConfig) {
  return new Promise((resolve) => {
    // 在工程里执行npm install命令
    console.log(chalk.red('安装依赖...'));
    exec('npm install', { cwd: path.join(process.cwd(), projectConfig.projectName) }, (err, stdout, stderr) => {
        if(err) {
          console.log(err);
          resolve('fail');
          return;
        }
        console.log(chalk.red('依赖安装成功'));
        resolve('success');
        console.log(`stdout: ${stdout}`);
    });
  });
}

// step7. 运行npm run start命令；
function startProject(projectConfig) {
  return new Promise((resolve) => {
    // 在工程里执行npm install命令
    console.log(chalk.red('正在启动...'));
    exec('npm start', { cwd: path.join(process.cwd(), projectConfig.projectName) }, (err, stdout, stderr) => {
        if(err) {
          console.log(err);
          resolve('fail');
          return;
        }
        console.log(chalk.red('启动成功'));
        resolve('success');
        console.log(`stdout: ${stdout}`);
    });
  });
}

function generateProject() {
  inquireUser().then((projectConfig) => {
    // step2. 读取tool.config.js中的projectTemplatePath；
    const gitPath = toolConfig.projectTemplatePath;
    // step3. 拉取模板文件，拷贝文件，获取用户git信息，嵌入注释；
    console.log(chalk.red(`正在从${gitPath}上拉取代码，请稍后......`));
    Git.Clone(gitPath, `./${projectConfig.projectName}`).then(function(repo) {
      runGeneratePage(projectConfig);
      setUserConfig(projectConfig);
      installDependencies(projectConfig).then((msg) => {
        if (msg === 'success') {
          startProject(projectConfig);
        }
      });
    })
  });
}

module.exports = generateProject;

