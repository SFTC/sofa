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

const path = require('path');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
function readSyncByRl(tips) {
  tips = tips + '>' || '> ';
  return new Promise((resolve) => {
    rl.question(tips, (answer) => {
      // rl.close();
      resolve(answer.trim());
    });
  });
}

function confirm(message) {
  message = message + '(y/n)' || '是否确认?' + '(y/n)';
  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      if (answer === 'y') {
        resolve(true);
      }
      resolve(false);
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
        console.log('*************创建完成***********');
        process.exit(0);
        return;
      }
      console.log('*************结束***************');
      process.exit(0);
    });
  }
});
