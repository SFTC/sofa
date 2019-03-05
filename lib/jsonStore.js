'use strict'

/**
 * jsonStore 存储服务
 *
 * 1、查询
 *  应用于，在生成component时，以componentName+projectName为维度查询是否存在，若不存在则以componentName维度查询是否存在;
 *
 * 2、新增
 *  应用于，组件新增记录；操作日志记录；
 *
 * 3、删除
 *  应用于，组件删除；
 *
 * 4、统计
 *  应用于查看日志总量、查看组件总信息等
 *
 * 注意：需要从config中获取jsonstore key；需要获取用户git账号信息
 */

const fileName = require('../utils/fileName');
const request = require('superagent');
const config = require('../conf/default.config');
const chalk = require('chalk');

const JsonStore = {};

/**
 * 查询
 * @param  {...any} searchKeys 【先只传组件名称？？？】
 * @return {Promise}
 */
// JsonStore.search = (...searchKeys) => {
JsonStore.search = (componentName) => {
  const pureName = fileName.getPureComponentName(componentName);
  return request
    .get(`https://www.jsonstore.io/${config.jsonstoreKey}/${pureName}`)
    .then((res) => {
      if (res.body && res.body.result) {
        console.log('****');
        console.log(chalk.green(`${componentName}:`), res.body.result);
        console.log('****');
        return false;
      } else if (res.body && res.body.ok) {
        return true;
      }
    return true;
  })
}

/**
 * 创建
 * @param {string} key
 * @param {object} info
 * @param {boolean} withGit 是否附加git信息【先不附加了】
 * @return {Promise}
 */
// JsonStore.create = (key, info, withGit) => {
JsonStore.create = (componentName) => {
  const pureName = fileName.getPureComponentName(componentName);
  request
    .post(`https://www.jsonstore.io/${config.jsonstoreKey}/${pureName}`)
    .send({
      name: pureName,
      createDate: new Date(),
    })
    .end((err, res) => {
      if (err) throw err;
    })
}

/**
 * 删除
 * @param {string} key
 * @return {Promise}
 */
// JsonStore.delete = (key) => {
JsonStore.delete = (componentName) => {
  const pureName = fileName.getPureComponentName(componentName);
  return request
    .del(`https://www.jsonstore.io/${config.jsonstoreKey}/${pureName}`)
    .then((res) => {
      console.log(chalk.green(`delete ${componentName} successfully`));
      return true;
    })
    .catch((err) => {
        return false;
    })
}

/**
 * 获取所有组件信息
 */
JsonStore.getAllComponents = () => {

}

/**
 * 获取所有Log信息
 */
JsonStore.getAllLogs = () => {

}

module.exports = JsonStore;
