const logger = global.logger;
const config = global.config;

const fs = require('fs');
const csv = require('../util/csv');
const finder = require('../util/finder');
const report = require('../util/report');

const Transformer = require('../util/transformer');

class Foreign {
  constructor() {
    this.cunt = 0;
    this.transformer = new Transformer();
    this.setupMiddleware(this.transformer);
  }

  start() {
    csv.prepare();
    logger.send('Starting Foreign Job...');
    finder.setup(config.csv.path.input, config.csv.path.output, config.csv.filenames.member, config.csv.count);
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
    // target.addMiddleware('sanitizeFirstName');
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
          this.next();
        });
      }
    }
  }
  import(path, done) {
    csv.import(path, records => done(records));
    logger.notice(`Importing from ${path}...`);
  }
  export(path) {
    logger.notice(`Exporting to ${path} ...`);
    csv.export(path, this.onExportComplete.bind(this));
  }

  iterate(records) {
    records.map(record => {
      let result = this.transformer.process(record);
      if (result.Language !== 'English') {
        this.cunt++;
        csv.convert(result);
        report.process(result);
      }
    });
  }
  next() {
    if (finder.hasNext()) {
      this.process(finder.next());
    } else {
      this.export(`${config.csv.path.output}${config.csv.filenames.foreign}.csv`);
    }
  }
  exit() {
    console.log(this.cunt);
    logger.party(`Job Complete!`);
    report.output();
  }

  // Event Handlers
  // ----------------------------------------------------------------
  onExportComplete() {
    logger.success(`Export Complete!`);
    this.exit();
  }
}

module.exports = new Foreign();
