const logger = global.logger;

class Report {
  constructor() {
    this.result = {
      count: 0,
      languages: {}
    };
  }
  process(payload) {
    this.result.count++;
    logger.update(`Records processed: ${this.result.count}`);
    if (this.result.languages[payload.Language]) {
      this.result.languages[payload.Language]++;
    } else {
      this.result.languages[payload.Language] = 1;
    }
  }
  output() {
    logger.info(`Records processed: ${this.result.count}`);
    Object.keys(this.result.languages).map(key => {
      console.log(`             - ${key}: ${this.result.languages[key]}`);
    });
    this.result.languages.map;
  }
}

module.exports = new Report();
