const esprima = require('esprima');
const estraverse = require('estraverse');

const ObjItem = {
  createObjectExpression: (content) => {
    // eslint-disable-next-line
    const ast = esprima.parseScript('var a = ' + content);
    let result = [];
    estraverse.traverse(ast, {
      enter: (node, parent) => {
        if (node.type === 'ObjectExpression' && parent) {
          if (parent.id && parent.id.name === 'a') {
            result = node.properties;
            // eslint-disable-next-line
            estraverse.VisitorOption.Break;
          }
        }
      },
    });
    return result;
  },
  createArrayExpression: (content) => {
    // eslint-disable-next-line
    const ast = esprima.parseScript('var a = ' + content)
    let result;
    estraverse.traverse(ast, {
      enter: (node, parent) => {
        if (node.type === 'ObjectExpression' && parent) {
          if (parent.id && parent.id.name === 'a') {
            result = node;
            // eslint-disable-next-line
            estraverse.VisitorOption.Break;
          }
        }
      },
    });
    return result;
  },
  createImportDeclaration: (content) => {
    return esprima.parseModule(content);
  },
};

module.exports = ObjItem;
