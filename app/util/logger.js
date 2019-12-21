const colors = require('colors/safe');
const name = '[Clementine]';

const labels = {
  default: `${colors.grey(name)}`,
  success: `${colors.green(name)}`,
  notice: `${colors.cyan(name)}`,
  alert: `${colors.red(name)}`,
  info: `${colors.yellow(name)}`,
  party: `${colors.rainbow(name)}`
};

const log = function(args, mode) {
  args.unshift(labels[mode]);
  console.log.apply(this, args);
};

class Logger {
  constructor() {}

  send() {
    log(Array.prototype.slice.call(arguments), 'default');
  }
  notice() {
    log(Array.prototype.slice.call(arguments), 'notice');
  }
  alert() {
    log(Array.prototype.slice.call(arguments), 'alert');
  }
  info() {
    log(Array.prototype.slice.call(arguments), 'info');
  }
  update(message) {
    process.stdout.clearLine();
    process.stdout.write(`${labels.info} ${message}`);
    process.stdout.cursorTo(0);
  }
  success() {
    log(Array.prototype.slice.call(arguments), 'success');
  }
  party() {
    log(Array.prototype.slice.call(arguments), 'party');
  }
}

module.exports = new Logger();
