'use strict'
const path = require('path');
const fs = require('fs');
const esprima = require('esprima');
const estraverse = require('estraverse');
const escodegen = require("escodegen");
const format = require("prettier-eslint");
const defaultConfig = require('../conf/default.config.js');
const ObjItem = require('./astGenerate');

const createFolder = function(to) { //文件写入
  var sep = path.sep
  var folders = path.dirname(to).split(sep);
  var p = '';
  while (folders.length) {
    p += folders.shift() + sep;
    if (!fs.existsSync(p)) {
        fs.mkdirSync(p);
    }
  }
};

function addConfig(key, value, conf) {
  const file = fs.readFileSync(conf, 'utf-8');
  const ast = esprima.parseScript(file);
  const content = {[key]: value};
  const insertContent = ObjItem['createObjectExpression'](JSON.stringify(content));
  estraverse.traverse(ast, {
    enter: function (node, parent) {
      if (node.type === 'ObjectExpression') {
        if (node.properties && node.properties.length) {
          node.properties.forEach((item, index) => {
            if (item.key.name === insertContent[0].key.value) {
              node.properties.splice(index, 1);
            }
          });
          node.properties = node.properties.concat(insertContent);
        }
        return estraverse.VisitorOption.Break;
      }
    }
  });
  const result = escodegen.generate(ast);
  return result;
}

/**
 * sofaConfig 操作
 */

const SofaConfig = {};

/**
 * 获取用户配置(同步调用)
 * 读取项目文件夹下是否存在Sofa.config.js文件
 * 
 * @return {object | null}
 */
SofaConfig.getUserConfig = (configPath) => {
  const conf = path.join(configPath, 'Sofa.config.js');
  if (fs.existsSync(conf)) {
    return require(conf);
  }
  return null;
}

/**
 * 获取配置(同步调用)
 * 
 * 首先获取用户配置
 * 若存在则返回用户配置与default.config.js的merge结果，以用户配置优先
 * 若不存在，则返回default.config.js
 *
 * @return {object}
 */
SofaConfig.getConfig = (configPath) => {
  const conf = path.join(configPath, 'Sofa.config.js');
  if (fs.existsSync(conf)) {
    const userConfig = require(conf);
    return Object.assign({}, defaultConfig, userConfig);
  }
  return defaultConfig;
}

/**
 * 设置配置
 * 
 * 寻找项目文件夹下是否存在Sofa.config.js文件，若存在，直接写入；
 * 若不存在，则在项目根路径下创建，而后写入
 * @param {*} key
 * @param {*} value
 */
SofaConfig.setConfig = (key, value, configPath) => {
  const conf = path.join(configPath, 'Sofa.config.js');
  if (!fs.existsSync(conf)) {
    createFolder(conf);
    fs.createWriteStream(conf);
    const file = fs.readFileSync(path.join(process.cwd(), 'conf/default.config.js'), 'utf-8');
    try {
      fs.writeFileSync(conf, file);
      console.log('新建Sofa.config.js成功')
    } catch (error) {
      console.log('新建Sofa.config.js失败');
    }
  }
  const options = {
    text: addConfig(key, value, conf)
  };
  try {
    const formatted = format(options);
    fs.writeFileSync(conf, formatted);
    console.log(`${key}配置设置成功`);
  } catch (error) {
    console.log(`${key}配置设置失败`, error);
  }
}

module.exports = SofaConfig;
