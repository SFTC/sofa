const path = require('path');

module.exports = {
  prefix: 'sofa',
  templatePackage: 'sofa-template',
  projectName: 'sofa',
  port: 8080,
  theme: 'black',
  i18n: false,

  pageTemplatePath: path.join(__dirname, 'src/pages'),
  componentTemplatePath: path.join(__dirname, '../..', 'src/components'),
  defaultComponentTemplateName: 'LanguageBar',

  jsonstoreKey: '94f0f3c9e704c6c7626e117daa563cfb633a0944c0e285366487cddabbab4ab0',
}
