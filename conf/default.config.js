const path = require('path');

module.exports = {
  projectName: 'sofa',
  port: 8080,
  theme: 'black',
  i18n: false,

  pageTemplatePath: path.join(__dirname, 'src/pages'),
  componentTemplatePath: path.join(__dirname, 'src/components'),

  jsonStoreKey: '',
}