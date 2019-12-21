const config = global.config;

class SampleTransformer {
  constructor() {
  }
  process(records) {
    let result = [];
    config.language.options.map(language => {
      records.map(record => {
        record.language = language;
        result.push(JSON.parse(JSON.stringify(record)));
      });
    });
    return result;
  }
}

module.exports = new SampleTransformer();
