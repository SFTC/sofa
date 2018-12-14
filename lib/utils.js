const utils = {};
utils.getHeadUpperName = (name) => {
  if (name) {
    return name.substring(0, 1).toUpperCase() + name.substring(1);
  }
  return '';
}

utils.getHeadLower = function(name) {
  if (name) {
    return name.substring(0, 1).toLowerCase() + name.substring(1);
  }
  return '';
}

utils.getFullUpper = function(name) {
  if (name) {
    return name.toUpperCase();
  }
  return '';
}

utils.getFullLower = function(name) {
  if (name) {
    return name.toLowerCase();
  }
  return '';
}


module.exports = utils;
