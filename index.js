'use strict';
global.copy = require('./app/data/copy.json');
global.config = require('./app/data/config.json');
global.logger = require('./app/util/logger');

const members = require('./app/job/members');
const samples = require('./app/job/samples');

const mode = process.argv[2];



class Clementine {
  constructor() {
    logger.send('Initialize');
    switch (mode) {
      case 'samples':
        samples.start();
        break;
      default:
        members.start();
        break;
    }
  }
}

const clementine = new Clementine();
