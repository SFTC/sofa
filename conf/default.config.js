const path = require('path');

module.exports = {
  prefix: 'sofa',
  templatePackage: 'sofa-template',
  projectName: 'sofa',
  port: 8080,
  theme: 'black',
  i18n: false,
  componentTemplatePath: path.join(__dirname, '../..', 'src/components'),
  pageTemplatePath: 'src/containers',
  defaultComponentTemplateName: 'LanguageBar',
  jsonStoreKey: '0943a24130ba4c6054296bb7ff57e94a14df68665f817e73e5468dbbfa106a7f',
}
