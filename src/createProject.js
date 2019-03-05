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
const { exec } = require('child_process');

const config = require('../conf/default.config');
const toolConfig = require('../conf/tool.config');
const sofaConfig = require('../lib/sofaConfig');
const jsonStore = require('../lib/jsonStore');
const user = require('../lib/user');

function inquireUser(projectName) {
  return new Promise((resolve) => {
    let projectConfig = { projectName };
    // 项目名称
    inquirer.prompt([{
      type: 'input',
      message: 'Please enter the name of the project',
      default: projectName,
      name: 'projectName',
    }]).then(({ projectName }) => {
      if (fs.existsSync(path.join(process.cwd(), projectName))) {
        console.log(chalk.red('当前路径下该工程已存在，请重新创建！'));
        return;
      }
      projectConfig.projectName = projectName;
      const templates = toolConfig.templates;
      inquirer.prompt([
      { // 模板选择
        type: 'list',
        message: 'Please choose a template:',
        choices: templates,
        name: 'templateName',
        default: 'sofa-react-ts-template',
      }, { // 主题色
        type: 'input',
        message: 'Please enter the theme color of the project',
        default: config.theme,
        name: 'theme',
      }, { // 开发端口
        type: 'input',
        message: 'Please enter the port of the project',
        default: config.port,
        name: 'port',
      }]).then((inputs) => {
        const templateInfo = templates.find((item) => {
          return item.name === inputs.templateName;
        });

        projectConfig = {
          ...projectConfig,
          ...inputs,
          templateInfo,
        }

        resolve(projectConfig);
      })
    });
  });
}

function runGeneratePage(projectConfig) {
  const README = path.join(process.cwd(), `./${projectConfig.projectName}/README.md`);
  const package = path.join(process.cwd(), `./${projectConfig.projectName}/package.json`);
  const files = [README, package];

  const replaceKey = projectConfig.templateInfo.key || projectConfig.templateName;
  files.forEach((item) => {
    if (fs.existsSync(item)) { 
      let file = fs.readFileSync(item, 'utf-8');
      file = file.replace(new RegExp(replaceKey, 'g'), projectConfig.projectName);
      try {
        fs.writeFileSync(item, file);
        console.log('配置成功', item)
      } catch (error) {
        console.log('配置失败', item);
      }
    }
  })
}

function setUserConfig(projectConfig) {
  const projectPath = path.join(process.cwd(), projectConfig.projectName);
  sofaConfig.setConfig('projectName', projectConfig.projectName, projectPath);
  sofaConfig.setConfig('port', projectConfig.port, projectPath);
  sofaConfig.setConfig('theme', projectConfig.theme, projectPath);
}

function installDependencies(projectConfig) {
  const projectPath = path.join(process.cwd(), projectConfig.projectName);
  return new Promise((resolve) => {
    // 在工程里执行npm install命令
    console.log(chalk.yellow('安装依赖，请稍后......'));
    exec('npm install', { cwd: projectPath }, (err, stdout, stderr) => {
      if(err) {
        console.log(err);
        resolve('fail');
        return;
      }
      console.log(chalk.green('依赖安装成功!'));
      resolve('success');
      console.log(`stdout: ${stdout}`);
    });
  });
}

function startProject(projectConfig) {
  const projectPath = path.join(process.cwd(), projectConfig.projectName);
  return new Promise((resolve) => {
    // 在工程里执行npm install命令
    console.log(chalk.yellow('正在启动...'));
    let workerProcess = exec('npm start', { cwd: projectPath }, (err, stdout, stderr) => {
      if(err) {
        console.log(err);
        resolve('fail');
        return;
      }
      resolve('success');
      console.log(`stdout: ${stdout}`);
    });
    workerProcess.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
      if (data.indexOf('webpack built') > -1) {
        console.log(chalk.green('启动成功'));
        resolve('success');
      }
    });
  
    workerProcess.stderr.on('data', function (data) {
      console.log(chalk.red('启动失败'));
      console.log('stderr: ' + data);
    });
  });
}

function generateProject(projectName) {
  user.getUserInfo().then((author) => {
    // step1. 与用户交互获取，项目名称、主题色、开发端口等信息；
    inquireUser(projectName).then((projectConfig) => {
      // step2. 读取tool.config.js中的projectTemplatePath；
      const projectPath = path.join(process.cwd(), projectConfig.projectName);
      const gitPath = projectConfig.templateInfo.path;
      // step3. 拉取模板文件，拷贝文件，获取用户git信息，嵌入注释；
      console.log(chalk.yellow(`代码构建中，请稍后......`));
      exec(`git clone ${gitPath} ${projectPath}`, {encoding: 'utf8' }, (err, stdout, stderr) => {
        console.log(chalk.green('代码初始化完成！'));
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
      });
    });
  })
}

module.exports = generateProject;

