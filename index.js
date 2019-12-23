'use strict';
global.copy = require('./app/data/copy.json');
const config = global.config = require('./app/data/config.json');
const logger = global.logger = require('./app/util/logger');

const jobs = {
  yir: require('./app/job/yir'),
  samples: require('./app/job/samples'),
  email: require('./app/job/email')
};

const mode = process.argv[2];

class Clementine {
  constructor() {
    logger.send('Initialize');
    this.getJob(mode).start();
  }
  getJob(mode) {
    console.log(config);
    switch (mode) {
      case 'samples':
        return new jobs.samples();
      case 'email':
        return new jobs.email(
          config.csv.path.input,
          config.csv.path.output,
          config.csv.source.email,
          config.csv.count
        );
      default:
        return new jobs.yir(config.csv.path.input, config.csv.path.output, config.csv.source.member, config.csv.count);
    }
  }
}

const clementine = new Clementine();
