const path = require('path');
const chalk = require('chalk');
const fileName = require('./fileName');

function getUpdateData(mode, data) {
  const pageNameLower = fileName.getHeadLower(data.pageName);
  const pageNavChineseName = data.pageChineseName;
  if (mode === 'module') {
    return [{
      path: path.resolve(process.cwd(), 'src/config/menu.conf.js'),
      position: {
        name: 'menu',
        type: 'ArrayExpression',
        only: true,
      },
      content: JSON.stringify({
        key: pageNameLower,
        icon: 'setting',
      }),
    }, {
      path: path.resolve(process.cwd(), 'src/utils/commonMessages.js'),
      position: {
        name: 'defaultMessages',
        type: 'ObjectExpression',
        only: true,
      },
      content: JSON.stringify({[pageNameLower]: {
        id: 'sofa.config.' + pageNameLower,
        defaultMessage: pageNavChineseName,
      }}),
    }]
  }
  if (mode === 'page') {
    return [{
      path: path.resolve(process.cwd(), 'src/config/menu.conf.js'),
      position: {
        name: 'menu',
        type: 'ArrayExpression',
        only: false,
        flag: function (key) {
          return function(node, parent) {
            if (node.elements) {
              for (let i = 0; i < node.elements.length; i++) {
                if (node.elements[i].properties && node.elements[i].properties[0].value && node.elements[i].properties[0].value.value === key) {
                  const props = node.elements[i].properties;
                  for (let j = 1; j < props.length; j ++) {
                    if (props[j].key && props[j].key.name === 'children' && props[j].value) {
                      return props[j].value.elements;
                    }
                  }
                }
              }
            }
            console.log(chalk.yellow('warning: can not find parent module, please add it manually'))
            return [];
          }
        }(data.moduleName)
      },
      content: JSON.stringify({
        key: pageNameLower,
      }),
    }, {
      path: path.resolve(process.cwd(), 'src/utils/commonMessages.js'),
      position: {
        name: 'defaultMessages',
        type: 'ObjectExpression',
        only: true,
      },
      content: JSON.stringify({[pageNameLower]: {
        id: 'sofa.config.' + pageNameLower,
        defaultMessage: pageNavChineseName,
      }}),
    }]
  }
}

module.exports = getUpdateData;
