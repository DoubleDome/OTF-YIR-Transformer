const { createReadStream, createWriteStream } = require('fs');

const config = global.config;
const options = { fields: config.csv.headers };

const transformOptions = { highWaterMark: 8192, encoding: 'utf-8' };
const { AsyncParser } = require('json2csv');

class CSV {
  constructor() {}

  prepare() {
    this.jsonParser = new AsyncParser(options, transformOptions);
  }
  convert(payload) {
    this.jsonParser.input.push(JSON.stringify(payload));
  }
  import(path, done) {
    this.csvParser = require('csvtojson');
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
    this.jsonParser.input.push(null);
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
