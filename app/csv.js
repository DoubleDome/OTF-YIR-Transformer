const { createReadStream, createWriteStream } = require('fs');

const config = require('./config.json');
const options = { fields: config.csv.headers };

const transformOptions = { highWaterMark: 8192, encoding: 'utf-8' };
const { AsyncParser } = require('json2csv');

class CSV {
  constructor() {}

  initialize() {
    this.jsonParser = new AsyncParser(options, transformOptions);
    this.csvParser = require('csvtojson');
  }
  convert(payload) {
    this.jsonParser.input.push(JSON.stringify(payload));
  }
  close() {
    this.jsonParser.input.push(null);
  }
  import(path, done) {
    if (path !== undefined && done !== undefined) {
      this.csvParser()
        .fromFile(path)
        .then(result => {
          this.source = result;
          done(this.source);
        });
    } else {
      throw new Error('Missing parameter!');
    }
  }

  export(path, complete) {
    if (path !== undefined) {
      let output = createWriteStream(path, { encoding: 'utf8' });
      this.jsonParser
        .toOutput(output)
        .promise()
        .then(complete)
        .catch(err => console.error(err));
    } else {
      throw new Error('Missing parameter!');
    }
  }
  
}

module.exports = new CSV();
