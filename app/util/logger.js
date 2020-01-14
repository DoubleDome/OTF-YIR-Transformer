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

const print = function(args, mode) {
  args.unshift(labels[mode]);
  console.log.apply(this, args);
};

class Logger {
  constructor() {}
  log() {
    console.log.apply(this, Array.prototype.slice.call(arguments));
  }
  send() {
    print(Array.prototype.slice.call(arguments), 'default');
  }
  notice() {
    print(Array.prototype.slice.call(arguments), 'notice');
  }
  alert() {
    print(Array.prototype.slice.call(arguments), 'alert');
  }
  info() {
    print(Array.prototype.slice.call(arguments), 'info');
  }
  update(message) {
    process.stdout.clearLine();
    process.stdout.write(`${labels.info} ${message}`);
    process.stdout.cursorTo(0);
  }
  success() {
    print(Array.prototype.slice.call(arguments), 'success');
  }
  party() {
    print(Array.prototype.slice.call(arguments), 'party');
  }

  outputAsList(target) {
    Object.keys(target).map(key => {
      console.log(` - ${key}: ${target[key]}`);
    });
  }
}

module.exports = new Logger();
