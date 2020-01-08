class Timestamp {
  constructor() {
  }
  get() {
    const date = new Date();
    return `${date.getFullYear()}${this.format(date.getMonth() + 1)}${this.format(date.getDate())}_${this.format(date.getHours())}${this.format(date.getMinutes())}`;
  }

  format(number) {
    if (number < 10) {
      return `0${number}`;
    } else {
      return number;
    }
  }
}
module.exports = new Timestamp();
