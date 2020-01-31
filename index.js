'use strict';
global.copy = require('./app/data/copy.json');
global.config = require('./app/data/config.json');
global.logger = require('./app/util/logger');

const members = require('./app/job/members');
const samples = require('./app/job/samples');
const audit = require('./app/job/audit');
const failure = require('./app/job/failure');
const foreign = require('./app/job/foreign');
const language = require('./app/job/language');
const uuid = require('./app/job/uuid');
const avghr = require('./app/job/avghr');

const mode = process.argv[2];
const languageFilter = process.argv[3];

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
      case 'language':
        if (!languageFilter) {
          throw new Error('Missing language parameter!');
        } else {
          language.start(languageFilter);
        }
        break;
      case 'failure':
        failure.start();
        break;
      case 'audit':
        audit.start();
        break;
      case 'foreign':
        foreign.start();
        break;
      case 'uuid':
        uuid.start();
        break;
      case 'avghr':
        avghr.start();
        break;
      case 'member':
      default:
        members.start();
        break;
    }
  }
}

const clementine = new Clementine();
