'use strict'
const request = require('superagent');
const fileName = require('./fileName');
const sofaConfig = require('./sofaConfig');
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

const JsonStore = {};

/**
 * 查询
 * @param  {...any} searchKeys 
 * @return {Promise}
 */
JsonStore.search = (...searchKeys) => {

}

/**
 * 创建
 * @param {string} key 
 * @param {object} info 
 * @param {boolean} withGit 是否附加git信息
 * @return {Promise}
 */
JsonStore.create = (key, info, withGit) => {
  const pureName = fileName.getHeadLower(key);
  const path = `../../${info.projectName}`;
  const config = sofaConfig.getConfig(path);
  request
    .post(`https://www.jsonstore.io/${config.jsonStoreKey}/${pureName}`)
    .send({
      name: info.name,
      author: info.author,
      createDate: new Date(),
    })
    .end((err, res) => {
      console.log('jsonstoreCreate');
      if (err) throw err;
    })
}

/**
 * 删除
 * @param {string} key
 * @return {Promise}
 */
JsonStore.delete = (key) => {

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
