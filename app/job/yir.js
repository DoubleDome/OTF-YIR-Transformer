const logger = global.logger;
const config = global.config;

const fs = require('fs');
const csv = require('../csv');

class YIR {
  constructor(input, output, filename, count) {
    this.name = 'Member';
    this.setupFinder(input, output, filename, count);
    this.setupTransformer();
  }

  setupFinder(input, output, filename, count) {
    this.finder = require('../finder');
    this.finder.setup(input, output, filename, count);
  }
  setupTransformer() {
    this.transformer = require('../transformer/yir');
  }

  start() {
    logger.send(`Start ${this.name} Job...`);
    this.process(this.finder.get());
  }
  // CSV
  // ----------------------------------------------------------------
  process(payload) {
    if (payload.input && payload.output) {
      console.log(payload.input);
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
    if (this.finder.hasNext()) {
      this.process(this.finder.next());
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

module.exports = YIR;
