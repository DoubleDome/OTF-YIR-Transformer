const logger = global.logger;
const config = global.config;

const fs = require('fs');

const csv = require('../csv');
const memberTransformer = require('../transformer/yir');
const sampleTransformer = require('../transformer/sample');

class Samples {
  constructor() {}

  start(inputRoot, outputRoot) {
    logger.send('Start Sample Job...');
    this.process({
      input: `${config.csv.path.input}${config.csv.source.sample}.csv`,
      output: `${config.csv.path.output}${config.csv.source.sample}.csv`
    });
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

    // loop over records
    // with a single record
    // transform to language
    // write
    // next language

    records = sampleTransformer.process(records);

    records.map(record => {
      let result = memberTransformer.process(record);
      if (result) {
        csv.convert(result);
        count.approved++;
      } else {
        count.rejected++;
      }
    });
    logger.info(`Records processed: ${count.approved}`);
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

module.exports = Samples;
