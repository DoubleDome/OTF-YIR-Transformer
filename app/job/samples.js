const logger = global.logger;
const config = global.config;

const fs = require('fs');

const timestamp = require('../util/timestamp');
const csv = require('../csv');

const Transformer = require('../util/transformer');

class Samples {
  constructor() {
    this.transformer = new Transformer();
    this.setupMiddleware();
  }

  start() {
    logger.send('Start Sample Job...');
    this.process({
      input: `${config.csv.path.input}${config.csv.source.sample}.csv`,
      output: `${config.csv.path.output}${config.csv.source.sample}_${timestamp.get()}.csv`
    });
  }

  // Middleware
  setupMiddleware() {
    this.transformer.addMiddleware('remapFields');
    this.transformer.addMiddleware('determinePerformanceType');
    this.transformer.addMiddleware('calculateAfterburn');
    this.transformer.addMiddleware('assignTotalsAndRanges');
    this.transformer.addMiddleware('determineHR');
    this.transformer.addMiddleware('determineChallenges');
    this.transformer.addMiddleware('remapLanguages');
    this.transformer.addMiddleware('appendCopy');
    this.transformer.addMiddleware('applyPerformanceCopy');
    this.transformer.addMiddleware('applyChallengeCopy');
    this.transformer.addMiddleware('sanitizeBooleans');
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

  import(path, complete) {
    csv.initialize();
    csv.import(path, records => complete(records));
    logger.notice(`Importing from ${path}...`);
  }

  iterate(records) {
    let count = { approved: 0, rejected: 0 };

    records = this.duplicate(records);

    records.map(record => {
      let result = this.transformer.process(record);
      if (result) {
        csv.convert(result);
        count.approved++;
      } else {
        count.rejected++;
      }
    });
    logger.info(`Records processed: ${count.approved}`);
  }

  duplicate(records){
    let result = [];
    config.language.options.map(language => {
      records.map(record => {
        record.language = language;
        result.push(JSON.parse(JSON.stringify(record)));
      });
    });
    return result;
  }

  export(path) {
    logger.notice(`Exporting to ${path} ...`);
    csv.close();
    csv.export(path, this.complete.bind(this));
  }
  complete() {
    logger.success(`Export Complete!`);
    this.closed();
  }

  closed() {
    logger.party(`Job Complete!`);
  }
}

module.exports = new Samples();
