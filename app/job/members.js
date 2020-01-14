const logger = global.logger;
const config = global.config;

const fs = require('fs');
const csv = require('../csv');
const finder = require('../finder');
const report = require('../report');

const Transformer = require('../util/transformer');

class Member {
  constructor() {
    this.transformer = new Transformer();
    this.setupMiddleware(this.transformer);
  }

  start() {
    logger.send('Start Member Job...');
    finder.setup(config.csv.path.input, config.csv.path.output, config.csv.source.member, config.csv.count);
    this.process(finder.get());
  }

  // Middleware
  // ----------------------------------------------------------------
  setupMiddleware(target) {
    target.addMiddleware('remapFields');
    target.addMiddleware('determinePerformanceType');
    target.addMiddleware('calculateAfterburn');
    target.addMiddleware('assignTotalsAndRanges');
    target.addMiddleware('determineHR');
    target.addMiddleware('determineChallenges');
    target.addMiddleware('remapCountries');
    target.addMiddleware('remapLanguages');
    target.addMiddleware('remapStudios');
    target.addMiddleware('sanitizeFirstName');
    // target.addMiddleware('appendCopy');
    // target.addMiddleware('applyPerformanceCopy');
    // target.addMiddleware('applyChallengeCopy');
    target.addMiddleware('sanitizeBooleans');
  }

  // CSV
  // ----------------------------------------------------------------
  process(payload) {
    if (payload.input && payload.output) {
      if (fs.existsSync(payload.input)) {
        this.import(payload.input, records => {
          logger.info(`Loaded ${payload.input}...`);
          this.iterate(records);
          this.export(payload.output);
        });
      }
    }
  }
  import(path, complete) {
    csv.initialize();
    csv.import(path, records => complete(records));
    logger.notice(`Importing from ${path}...`);
  }
  export(path) {
    logger.notice(`Exporting to ${path} ...`);
    csv.close();
    csv.export(path, this.complete.bind(this));
  }

  iterate(records) {
    records.map(record => {
      let result = this.transformer.process(record);
      // logger.log(result);
      csv.convert(result);
      report.process(result);
    });
  }
  next() {
    if (finder.hasNext()) {
      this.process(finder.next());
    } else {
      this.closed();
    }
  }
  complete() {
    logger.success(`Export Complete!`);
    this.next();
  }

  closed() {
    logger.party(`Job Complete!`);
    report.output();
  }
}

module.exports = new Member();
