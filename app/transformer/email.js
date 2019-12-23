class Finale {
  process(payload) {
    let result = payload;
    result.landingPage = result.landingPage + result.language;
    return result;
  }
}

module.exports = new Finale();