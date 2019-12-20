'use strict';
const fs = require('fs');

const colors = require('colors/safe');
const csv = require('./app/csv');
const transformer = require('./app/transformer');
const inputRoot = './input/';
const outputRoot = './output/';
const finder = require('./app/finder');

const mode = process.argv[2];

class Clementine {
  constructor() {
    this.name = '[Clementine]';
    console.log(`${colors.grey(this.name)} Initialize`);
    finder.setup(inputRoot, outputRoot, 'Member_YIR_2019_', 2);
    this.process(finder.get());
  }

  process(payload) {
    if (payload.input && payload.output) {
      this.transform(payload.input, payload.output);
    }
  }

  // CSV
  // ----------------------------------------------------------------
  transform(inputPath, outputPath) {
    if (fs.existsSync(inputPath)) {
      this.import(inputPath, records => {
        console.log(`${colors.yellow(this.name)} Loaded ${inputPath}...`);
        this.iterate(records);
        this.export(outputPath);
      });
    }
  }
  import(path, complete) {
    csv.initialize();
    csv.import(path, records => complete(records));
    console.log(`${colors.cyan(this.name)} Importing from ${path}...`);
  }

  iterate(records) {
    let count = { approved: 0, rejected: 0 };

    records.map(record => {
      let result = transformer.process(record);
      // console.log(result);
      if (result) {
        csv.convert(result);
        count.approved++;
      } else {
        count.rejected++;
      }
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`${colors.yellow(this.name)} Records processed: ${count.approved}`);
    });
    process.stdout.cursorTo(0);
    console.log(`${colors.yellow(this.name)} Records processed: ${count.approved}`);
    console.log(`${colors.red(this.name)} Records rejected: ${count.rejected}`);
  }
  export(path) {
    console.log(`${colors.cyan(this.name)} Exporting to ${path} ...`);
    csv.close();
    csv.export(path, this.complete.bind(this));
  }
  complete() {
    console.log(`${colors.green(this.name)} Export Complete!`);
    this.next();
  }
  next() {
    if (finder.hasNext()) {
      this.process(finder.next());
    } else {
      this.closed();
    }
  }
  closed() {
    console.log(`${colors.rainbow(this.name)} Job Complete!`);
  }
}

const clementine = new Clementine();
