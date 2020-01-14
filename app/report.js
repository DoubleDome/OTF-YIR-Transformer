const logger = global.logger;

class Report {
  constructor() {
    this.result = {
      count: 0,
      languages: {},
      countries: {}
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

    if (this.result.countries[payload.Country]) {
      this.result.countries[payload.Country]++;
    } else {
      this.result.countries[payload.Country] = 1;
    }
  }
  output() {
    console.log(`\nRecords processed: ${this.result.count}`);
    console.log('\nLanguage Count:');
    logger.outputAsList(this.result.languages);
    console.log('\nCountry Count:');
    logger.outputAsList(this.result.countries);
    console.log('');
  }
}

module.exports = new Report();
