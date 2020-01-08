const logger = global.logger;
const config = global.config;

const fs = require('fs');
const csv = require('../csv');
const finder = require('../finder');

const Transformer = require('../util/transformer');

class Member {
  constructor() {
    this.transformer = new Transformer();
    this.setupMiddleware();
  }

  start() {
    logger.send('Start Member Job...');
    finder.setup(config.csv.path.input, config.csv.path.output, config.csv.source.member, config.csv.count);
    this.process(finder.get());
  }

  // Middleware
  // ----------------------------------------------------------------
  setupMiddleware() {
    this.transformer.addMiddleware('remapFields');
    this.transformer.addMiddleware('determinePerformanceType');
    this.transformer.addMiddleware('calculateAfterburn');
    this.transformer.addMiddleware('assignTotalsAndRanges');
    this.transformer.addMiddleware('determineHR');
    this.transformer.addMiddleware('determineChallenges');
    this.transformer.addMiddleware('remapLanguages');
    this.transformer.addMiddleware('sanitizeFirstName');
    this.transformer.addMiddleware('appendCopy');
    this.transformer.addMiddleware('applyPerformanceCopy');
    this.transformer.addMiddleware('applyChallengeCopy');
    this.transformer.addMiddleware('sanitizeBooleans');
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
    let count = { approved: 0, rejected: 0 };

    records.map(record => {
      let result = this.transformer.process(record);
      // logger.log(result);
      if (result) {
        csv.convert(result);
        count.approved++;
      } else {
        count.rejected++;
      }
      logger.update(`Records processed: ${count.approved}`);
    });
    logger.info(`Records processed: ${count.approved}`);
    logger.alert(`Records rejected: ${count.rejected}`);
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
  }
}

module.exports = new Member();
