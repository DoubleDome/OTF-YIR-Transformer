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
    this.setupCharacters();
    this.setupRegEx();
    this.setupStudios();
    this.process();
  }

  setupCharacters() {
    global.config.replacements.characters = global.config.replacements.characters.split('');
  }
  setupRegEx() {
    global.config.replacements.patterns.map((pattern, index) => {
      global.config.replacements.patterns[index] = new RegExp(pattern);
    });
  }
  setupStudios() {
    let studioIDs;
    Object.keys(global.config.language.studios).map(key => {
      studioIDs = global.config.language.studios[key].split(',');
      studioIDs.map(id => {
        global.config.language.studios[id] = key;
      });
      delete global.config.language.studios[key];
    });
  }

  process() {
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
