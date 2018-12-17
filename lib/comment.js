/**
 * 注释操作相关
 */
const comment = {};
// 新增注释
comment.generateComment = (file, createPageConfig) => {
  const data = {
      componentName: file.split('.')[0],
      date: new Date(),
      author: createPageConfig.author,
      templateName: createPageConfig.templateName,
      pageChineseName: createPageConfig.pageChineseName,
      moduleName: createPageConfig.key || '无',
  };
  const commentsData = {};
  commentsData.author = data.author;
  commentsData.date = data.date;
  commentsData.componentName = data.componentName;
  commentsData.templateName = data.templateName;
  commentsData.pageChineseName = data.pageChineseName;
  commentsData.moduleName = data.moduleName;
  let commentStr = '/**\n';
  Object.keys(commentsData).forEach(item => {
    commentStr += ` * ${item}: ${commentsData[item]}\n`;
  })
  return `${commentStr} */\n`;
}
// 解决双注释的问题
comment.removeDuplicate = (str) => {
  if (typeof str !== 'string') {
      console.log('error: 替换内容不是string类型');
      return false;
  }
  return str.indexOf('/**') === 0 ? str.split('\n').slice(8).join('\n') : str;
}

module.exports = comment;
