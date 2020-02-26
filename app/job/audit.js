const logger = global.logger;
const config = global.config;

const fs = require('fs');
const csv = require('../util/csv');
const finder = require('../util/finder');
const report = require('../util/report');

class Job {
  constructor() {}

  start() {
    logger.send('Starting Audit Job...');
    finder.setup(config.csv.path.final, config.csv.path.final, config.csv.filenames.audit, config.csv.count);
    this.process(finder.get());
  }

  // CSV
  // ----------------------------------------------------------------
  process(payload) {
    if (payload.input) {
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

  iterate(records) {
    records.map(record => {
      report.process(record);
    });
  }
  
  next() {
    if (finder.hasNext()) {
      this.process(finder.next());
    } else {
      this.exit();
    }
  }

  exit() {
    logger.party(`Job Complete!`);
    report.output();
  }

}

module.exports = new Job();
