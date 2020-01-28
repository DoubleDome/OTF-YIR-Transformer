
class Finder {
  constructor() {
    this.index = 0;
  }
  setup(input, output, prefix, count) {
    this.path = { input: input, output: output };
    this.prefix = prefix;
    this.count = count;
  }
  get() {
    return {
      input: `${this.path.input}${this.prefix}${this.index}.csv`,
      output: `${this.path.output}${this.prefix}${this.index}.csv`
    };
  }
  next() {
    this.index++;
    return this.get();
  }
  hasNext() {
    return (this.index + 1) < this.count;
  }
}

module.exports = new Finder();
