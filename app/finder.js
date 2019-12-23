
class Finder {
  constructor() {
    this.index = 0;
  }
  setup(input, output, base, count) {
    this.path = { input: input, output: output };
    this.base = base;
    this.count = count;
  }
  get() {
    return this.generate();
  }
  next() {
    this.index++;
    return this.get();
  }
  hasNext() {
    return (this.index + 1) < this.count;
  }
  generate() {
    return {
      input: `${this.path.input}${this.base}${this.index}.csv`,
      output: `${this.path.output}${this.base}${this.index}.csv`
    };
  }
}

module.exports = new Finder();
