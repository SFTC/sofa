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
const jsonStore = require('../lib/jsonStore');
const user = require('../lib/user');

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

function runGeneratePage(projectConfig) {
  const README = `../${projectConfig.projectName}/README.md`;
  const package = `../${projectConfig.projectName}/package.json`;
  const files = [README, package];
  files.forEach((item) => {
    if (fs.existsSync(item)) { 
      let file = fs.readFileSync(item, 'utf-8');
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

function setUserConfig(projectConfig) {
  const path = `../${projectConfig.projectName}`;
  sofaConfig.setConfig('projectName', projectConfig.projectName, path);
  sofaConfig.setConfig('port', projectConfig.port, path);
  sofaConfig.setConfig('theme', projectConfig.theme, path);
}

function installDependencies(projectConfig) {
  return new Promise((resolve) => {
    // 在工程里执行npm install命令
    console.log(chalk.red('安装依赖......'));
    exec('npm install', { cwd: `../${projectConfig.projectName}` }, (err, stdout, stderr) => {
      if(err) {
        console.log(err);
        resolve('fail');
        return;
      }
      console.log(chalk.red('依赖安装成功!'));
      resolve('success');
      console.log(`stdout: ${stdout}`);
    });
  });
}

function startProject(projectConfig) {
  return new Promise((resolve) => {
    // 在工程里执行npm install命令
    console.log(chalk.red('正在启动...'));
    let workerProcess = exec('npm start', { cwd: `../${projectConfig.projectName}` }, (err, stdout, stderr) => {
      if(err) {
        console.log(err);
        resolve('fail');
        return;
      }
      resolve('success');
      console.log(`stdout: ${stdout}`);
    });
    workerProcess.stdout.on('data', function (data) {
      if (data.indexOf('webpack built') > -1) {
        console.log(chalk.red('启动成功'));
        resolve('success');
      }
      console.log('stdout: ' + data);
    });
  
    workerProcess.stderr.on('data', function (data) {
      console.log(chalk.red('启动失败'));
      console.log('stderr: ' + data);
    });
  });
}

function generateProject() {
  user.getUserInfo().then((author) => {
    // step1. 与用户交互获取，项目名称、主题色、开发端口等信息；
    inquireUser().then((projectConfig) => {
      // step2. 读取tool.config.js中的projectTemplatePath；
      const gitPath = toolConfig.projectTemplatePath;
      // step3. 拉取模板文件，拷贝文件，获取用户git信息，嵌入注释；
      console.log(chalk.red(`正在从${gitPath}上拉取代码，请稍后......`));
      Git.Clone(gitPath, `../${projectConfig.projectName}`).then((repo) => {
        console.log(chalk.red('代码下载完成！'));
        // step4. 替换关键词ProjectName，这里需要注意替换 KeyWord、keyWord、keyword、KEYWORD等多种情形；
        runGeneratePage(projectConfig);
        // step5. 将用户交互信息生成并写入sofa.config.js；
        setUserConfig(projectConfig);
        // step6. 安装依赖；
        installDependencies(projectConfig).then((msg) => {
          if (msg === 'success') {
            // step7. 运行npm run start命令；
            startProject(projectConfig).then((startMsg) => {
              projectConfig.author = author;
              projectConfig.name = projectConfig.projectName;
              jsonStore.create('projectName', projectConfig, false);
            });
          }
        });
      })
    });
  })
}

module.exports = generateProject;

