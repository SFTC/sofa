const chalk = require('chalk');

const log = {};

log.success = (msg) => {
  console.log(chalk.green(msg));
}

log.warning = (msg) => {
  console.log(msg);
}

log.error = (msg) => {
  console.log(chalk.red(msg));
}

log.tips = (msg) => {
  console.log(chalk.yellow(msg));
}

module.exports = log;
