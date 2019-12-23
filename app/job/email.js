const logger = global.logger;
const config = global.config;

const Members = require('./yir');

class EMail extends Members {
  constructor(input, output, filename, count) {
    super(input, output, filename, count);
    this.name = 'E-Mail';
  }
  setupTransformer() {
    this.transformer = require('../transformer/email');
  }
}

module.exports = EMail;
