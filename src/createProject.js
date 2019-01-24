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
const commander = require('commander');
var Git = require("nodegit");

// const user = require('../lib/user');
const config = require('../conf/default.config');
const toolConfig = require('../conf/tool.config');
// const runGenerateProject = require('./page');
// const Template = require('../../utils/template');


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
        message: 'Please enter the subject color of the project',
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

function generateProject(pageName) {
  inquireUser().then((projectConfig) => {
    // step2. 读取tool.config.js中的projectTemplatePath；
    const gitPath = toolConfig.projectTemplatePath;
    // step3. 拉取模板文件，拷贝文件，获取用户git信息，嵌入注释；
    console.log(chalk.red(`正在从${gitPath}上拉取代码，请稍后......`));
    Git.Clone(gitPath, `./${projectConfig.projectName}`).then(function(repo) {
      console.log(chalk.red('代码下载完毕！'));
      console.log('repo: ', repo);
      return repo.getMasterCommit();
    })
  });


  // user.getUserInfo().then((author) => {
  //   const templatesInfo = Template.getTemplateInfo(Template.checkTemplateVersion(), config.pagePath);
  //   if (templatesInfo && templatesInfo.templates) {
  //     inquirer.prompt([{
  //       type: 'list',
  //       message: 'Please choose the template',
  //       default: config.defaultPageTemplate,
  //       choices: templatesInfo.templates,
  //       name: 'template',
  //     }]).then(({ template }) => {
  //       const templateInfo = {
  //         template: template,
  //         packagePath: templatesInfo.packagePath,
  //       };

  //       inquirer.prompt([{
  //         type: 'confirm',
  //         message: 'Does it has a parent module?',
  //         name: 'type'
  //       }]).then(({ type }) => {
  //         if (type) {
  //           inquirer.prompt([{
  //             type: 'input',
  //             message: 'Please enter the parent module key: ',
  //             name: 'parent'
  //           }]).then(({ parent }) => {
  //             if (parent) {
  //               runGenerateProject(templateInfo, parent, pageName, author, parent)
  //             }
  //           })
  //         } else {
  //           runGenerateProject(templateInfo, null, pageName, author, '无')
  //         }
  //       })
  //     })
  //   }
  // })
}

module.exports = generateProject;

