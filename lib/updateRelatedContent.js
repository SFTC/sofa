/* eslint-disable */
const esprima = require('esprima');
const estraverse = require('estraverse');
const escodegen = require('escodegen');
const chalk = require('chalk');
const format = require('prettier-eslint');
const fs = require('fs');

const ObjItem = require('./astGenerate');
const getUpdateData = require('./getUpdateData');

function updateRelatedContent(mode, data) {
  const insertArray = getUpdateData(mode, data);
  for (let i = 0; i < insertArray.length; i++) {
    const docPath = insertArray[i].path;
    if (!fs.existsSync(docPath)) {
      console.log(chalk.red('Can not find path: ' + docPath));
      console.log(chalk.red('更新失败', 'skiped'));
      continue;
    }
    const position = insertArray[i].position;
    const content = fs.readFileSync(docPath, 'utf-8');
    const ast = esprima.parseModule(content);

    if (position.type === 'ArrayExpression') {
      const insertContent = ObjItem['create' + position.type](insertArray[i].content);
      estraverse.traverse(ast, {
        enter: (node, parent) => {
          if (node.type === position.type && parent && ((parent.id && parent.id.name === position.name) || (parent.key && parent.key.name === position.name))) {
            let searchArray = node.elements;
            if (position.flag) {
              searchArray = position.flag(node, parent);
            }
            searchArray.push(insertContent);
            return estraverse.VisitorOption.Break;
          }
        }
      });
    } else if (position.type === 'ObjectExpression') {
      const insertContent = ObjItem['create' + position.type](insertArray[i].content);
      estraverse.traverse(ast, {
        enter: (node, parent) => {
          if (node.type === position.type) {
            if (node.properties) {
              node.properties = node.properties.concat(insertContent);
            }
            return estraverse.VisitorOption.Break;
          }
        },
      });
    } else if (position.type === 'ImportDeclaration') {
      const insertContent = ObjItem['create' + position.type](insertArray[i].content);
      const importCount = 0;
      estraverse.traverse(ast, {
        enter: (node, parent) => {
          if (node.type === position.type) {
            importCount++;
          }
          if (node.type !== position.type && parent && parent.body) {
            parent.body.splice(importCount, 0, insertContent);
            return estraverse.VisitorOption.Break;
          }
        },
      });
    } else if (position.type === 'Program') {
      const insertContent = ObjItem.createImportDeclaration(insertArray[i].content);
      estraverse.traverse(ast, {
        enter: (node, parent) => {
          if (node.type === position.type) {
            node.body = node.body.concat(insertContent);
            return estraverse.VisitorOption.Break;
          }
        },
      });
    }
    const result = escodegen.generate(ast);
    const options = {
      text: result,
    };
    try {
      const formatted = format(options);
      fs.writeFileSync(docPath, formatted);
      console.log('更新成功', docPath);
    } catch (error) {
      console.log(chalk.red('更新失败，请手动更新', docPath));
    }
  }
}

module.exports = updateRelatedContent;
