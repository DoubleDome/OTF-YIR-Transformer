const logger = global.logger;
const config = global.config;

const fs = require('fs');
const csv = require('../util/csv');
const finder = require('../util/finder');
const report = require('../util/report');

const Transformer = require('../util/transformer');

class Failure {
  constructor() {
    this.recordIndex = 0;
    this.failureIndex = 0;
    this.batches = require('../data/failed.json');

    csv.prepare();

    this.transformer = this.setupMiddleware(new Transformer());
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
    target.addMiddleware('sanitizeBooleans');
    return target;
  }

  start() {
    logger.send('Starting Failure Job...');
    finder.setup(config.csv.path.input, config.csv.path.output, config.csv.filenames.member, config.csv.count);
    this.process(finder.get());
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
    this.reset();
    csv.import(path, records => done(records));
    logger.notice(`Importing from ${path}...`);
  }

  export(path) {
    logger.notice(`Exporting to ${path} ...`);
    csv.export(path, this.onExportComplete.bind(this));
  }

  iterate(records) {
    records.map(record => {
      this.recordIndex++;
      if (this.isMatch(finder.index, this.recordIndex)) {
        let result = this.transformer.process(record);
        csv.convert(result);
        report.process(result);
      }
    });
  }

  next() {
    if (finder.hasNext()) {
      this.process(finder.next());
    } else {
      this.export(`${config.csv.path.output}${config.csv.filenames.errors}.csv`);
    }
  }

  exit() {
    logger.party(`Job Complete!`);
    report.output();
  }

  // Trash
  // ----------------------------------------------------------------

  isMatch(batch, index) {
    let result = index === Number(this.batches[batch][this.failureIndex]);
    if (result) this.failureIndex++;
    return result;
  }
  reset() {
    this.recordIndex = 0;
    this.failureIndex = 0;
  }
  
  // Event Handlers
  // ----------------------------------------------------------------
  onExportComplete() {
    logger.success(`Export Complete!`);
    this.exit();
  }
  
}

module.exports = new Failure();
