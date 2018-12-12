'use strict'
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
SofaConfig.getConfig = (params) => {
    return 'src/containers';
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

}

module.exports = SofaConfig;
