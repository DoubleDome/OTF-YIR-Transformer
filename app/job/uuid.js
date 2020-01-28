const logger = global.logger;
const config = global.config;

const fs = require('fs');
const csv = require('../util/csv');
const report = require('../util/report');

class UUID {
  constructor() {
    this.filteredIds = require('../data/uuid.json');
    csv.prepare();
  }

  // Start Job
  // ----------------------------------------------------------------
  start() {
    logger.send('Starting UUID Job...');
    this.process({
      input: `${config.csv.path.output}${config.csv.filenames.foreign}.csv`,
      output: `${config.csv.path.output}${config.csv.filenames.UUID}.csv`
    });
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
      if (this.isMatch(record)) {
        console.log(record.MemberUUId);
        csv.convert(record);
        report.process(record);
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

  isMatch(record) {
    let result = false;
    this.filteredIds.map(id => {
      if (record.MemberUUId === id) result = true;
    });
    return result;
  }
  // Event Handlers
  // ----------------------------------------------------------------
  onExportComplete() {
    logger.success(`Export Complete!`);
    this.exit();
  }
}

module.exports = new UUID();
