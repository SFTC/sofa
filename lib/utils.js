const utils = {};
utils.getHeadUpperName = (name) => {
  if (name) {
    return name.substring(0, 1).toUpperCase() + name.substring(1);
  }
  return '';
}

module.exports = utils;
