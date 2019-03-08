/**
 * 注释操作相关
 */
/* eslint-disable */
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
  });
  return `${commentStr} */\n`;
};

module.exports = comment;
