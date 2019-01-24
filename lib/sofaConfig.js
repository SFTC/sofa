'use strict'
const path = require('path');
const fs = require('fs');
const esprima = require('esprima');
const estraverse = require('estraverse');
const escodegen = require("escodegen");
const defaultConfig = require('../conf/default.config.js');
const ObjItem = require('./astGenerate');

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
SofaConfig.getUserConfig = () => {
  const conf = path.join(process.cwd(), 'Sofa.config.js');
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
SofaConfig.getConfig = () => {
  const conf = path.join(process.cwd(), 'Sofa.config.js');
  if (fs.existsSync(conf)) {
    const userConfig = require(conf);
    return Object.assign({}, defaultConfig,userConfig);
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
SofaConfig.setConfig = (key, value) => {
  const conf = path.join(process.cwd(), 'Sofa.config.js');
  if (fs.existsSync(conf)) {
    const file = fs.readFileSync(conf, 'utf-8');
    console.log('file: ', file);
    const ast = esprima.parseScript(file);
    const content = {};
    content[key] = value;
    const insertContent = ObjItem['createObjectExpression'](JSON.stringify(content));
    estraverse.traverse(ast, {
      enter: function (node, parent) {
        console.log('parent: ', parent);
        if (node.type === 'ObjectExpression' && parent && ((parent.id && parent.id.name === 'config') || (parent.key && parent.key.name === position.name))) {
          if (node.properties) {
            node.properties = node.properties.concat(insertContent);
          }
          console.log(estraverse.VisitorOption.Break);
          return estraverse.VisitorOption.Break;
        }
      }
    });
    const result = escodegen.generate(ast)
    console.log('result: ', result);
    
    try {
      fs.writeFileSync(conf, result);
      console.log('配置设置成功', conf)
      const userConfig = require(conf);
      console.log('userConfig: ', userConfig);

    } catch (error) {
      console.log('配置设置失败', error);
    }
  }
}

module.exports = SofaConfig;
