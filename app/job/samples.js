const logger = global.logger;
const config = global.config;

const fs = require('fs');

const timestamp = require('../util/timestamp');
const csv = require('../util/csv');
const report = require('../util/report');

const Transformer = require('../util/transformer');

class Samples {
  constructor() {
    this.transformer = this.setupMiddleware(new Transformer());
  }

  start() {
    csv.prepare();
    logger.send('Starting Sample Job...');
    this.process({
      input: `${config.csv.path.input}${config.csv.filenames.sample}.csv`,
      output: `${config.csv.path.output}${config.csv.filenames.sample}_${timestamp.get()}.csv`
    });
  }

  // Middleware
  setupMiddleware(target) {
    target.addMiddleware('remapFields');
    target.addMiddleware('determinePerformanceType');
    target.addMiddleware('calculateAfterburn');
    target.addMiddleware('assignTotalsAndRanges');
    target.addMiddleware('determineHR');
    target.addMiddleware('determineChallenges');
    target.addMiddleware('generateSampleName');
    target.addMiddleware('sanitizeBooleans');
    return target;
  }

  process(payload) {
    if (fs.existsSync(payload.input)) {
      this.import(payload.input, records => {
        logger.info(`Loaded ${payload.input}...`);
        this.iterate(records);
        this.export(payload.output);
      });
    } else {
      logger.alert(`File '${payload.input}' not found!`);
    }
  }

  import(path, done) {
    csv.import(path, records => done(records));
    logger.notice(`Importing from ${path}...`);
  }

  iterate(records) {
    records = this.duplicate(records);
    records.map(record => {
      let result = this.transformer.process(record);
      csv.convert(result);
      report.process(result);
    });
  }

  duplicate(records) {
    let result = [];
    config.samples.map(sample => {
      records.map(record => {
        record.language = sample.language;
        record.country = sample.country;
        result.push(JSON.parse(JSON.stringify(record)));
      });
    });
    return result;
  }

  export(path) {
    logger.notice(`Exporting to ${path} ...`);
    csv.export(path, this.onExportComplete.bind(this));
  }

  exit() {
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

module.exports = new Samples();
