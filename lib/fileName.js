/**
 * 多种fileName的生成方式
 * 
 * KeyWord、keyWord、keyword、KEYWORD
 */
const fileName = {};
fileName.getHeadUpperName = (name) => {
  if (name) {
    return name.substring(0, 1).toUpperCase() + name.substring(1);
  }
  return '';
};

fileName.getHeadLower = (name) => {
  if (name) {
    return name.substring(0, 1).toLowerCase() + name.substring(1);
  }
  return '';
};

fileName.getFullUpper = (name) => {
  if (name) {
    return name.toUpperCase();
  }
  return '';
};

fileName.getFullLower = (name) => {
  if (name) {
    return name.toLowerCase();
  }
  return '';
};

module.exports = fileName;
