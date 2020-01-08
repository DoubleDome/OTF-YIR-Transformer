const config = global.config;
let count = 0;

class Transformer {
  constructor() {
    this.middleware = [];
  }

  addMiddleware(func) {
    this.middleware.push(this[func].bind(this));
  }
  process(payload) {
    let result = JSON.parse(JSON.stringify(payload));
    this.middleware.map(func => {
      result = func(result);
    });
    return result;
  }

  // CSV Functions
  // ----------------------------------------------------------------
  remapFields(payload) {
    Object.keys(config.csv.mapping).map(key => {
      payload[config.csv.mapping[key]] = payload[key];
      delete payload[key];
    });
    return payload;
  }

  // Language Override
  // ----------------------------------------------------------------
  remapLanguages(payload) {
    if (config.language.mapping[payload.Language]) {
      payload.Language = config.language.mapping[payload.Language];
    }
    return payload;
  }

  // BPM Functions
  // ----------------------------------------------------------------
  determinePerformanceType(payload) {
    payload.performance = Number(payload.AvgHR) !== 0;
    return payload;
  }
  determineHR(payload) {
    payload.BPM = payload.AvgHR;
    payload.AvgHR = this.findBPM(payload.AvgHR);
    return payload;
  }
  findBPM(value) {
    value = Number(value);
    if (value == 0) {
      return 0;
    } else if (value <= 120) {
      return 120;
    } else if (value > 120 && value <= 124) {
      return 124;
    } else if (value > 124 && value <= 128) {
      return 128;
    } else if (value > 129 && value <= 132) {
      return 132;
    } else if (value > 159 && value <= 162) {
      return 162;
    } else if (value > 163 && value <= 166) {
      return 166;
    } else if (value > 167 && value <= 170) {
      return 170;
    } else if (value > 171 && value <= 174) {
      return 174;
    } else if (value > 174) {
      return 174;
    } else {
      return value;
    }
  }

  // Challenge Functions
  // ----------------------------------------------------------------
  determineChallenges(payload) {
    config.challenge.headers.map(header => {
      payload[header] = this.metCriteria(payload, header, config.challenge.thresholds[header]);
    });
    return payload;
  }
  metCriteria(payload, field, value) {
    if (payload[field] > value) {
      return true;
    } else {
      return false;
    }
  }

  hasCompletedChallenge(payload) {
    let completed = false;
    config.challenge.headers.map(header => {
      if (payload[header]) {
        completed = true;
      }
    });
    return completed;
  }

  // Sanitize Booleans
  // ----------------------------------------------------------------
  sanitizeBooleans(payload) {
    Object.keys(payload).map(key => {
      if (typeof payload[key] === 'boolean') {
        payload[key] = payload[key] ? 'Yes' : 'No';
      }
    });
    return payload;
  }
  // Range Functions
  // ----------------------------------------------------------------
  assignTotalsAndRanges(payload) {
    let result = { ...payload };
    result = this.sanitizeValue(result, 'TotalSplatPoints');
    result = this.sanitizeValue(result, 'TotalCalories');
    result = this.sanitizeValue(result, 'TotalAfterBurn');
    result = this.sanitizeValue(result, 'TotalClassesTaken');
    return result;
  }
  sanitizeValue(payload, field) {
    payload[`${field}_Range`] = this.findRange(payload[field]);
    return payload;
  }

  findRange(value) {
    if (value < 100) {
      return this.rounder(value, 10);
    } else if (value < 1000) {
      return this.rounder(value, 100);
    } else if (value < 10000) {
      return this.rounder(value, 1000);
    } else if (value < 100000) {
      return this.rounder(value, 10000);
    } else if (value < 1000000) {
      return this.rounder(value, 100000);
    }
  }
  rounder(value, floor) {
    return Math.floor(value / floor) * floor;
  }

  // Afterburn
  // ----------------------------------------------------------------
  calculateAfterburn(payload) {
    payload.TotalAfterBurn = payload.TotalClassesTaken * 36;
    return payload;
  }

  // Averages
  // ----------------------------------------------------------------
  calculateAverageCalories(payload) {
    return this.calculateAverage(payload, 'TotalCalories');
  }
  calculateAverageSplatPoints(payload) {
    return this.calculateAverage(payload, 'TotalSplatPoints');
  }
  calculateAverage(payload, field) {
    var total = payload[field];
    payload[`${field.replace('Total', 'Average')}PerClass`] = Math.round(total / payload.TotalClassesTaken);
    return payload;
  }

  // String Functions
  // ----------------------------------------------------------------
  sanitizeFirstName(payload) {
    payload = this.replacer(payload, config.replacements.phrases, 'FirstName');
    payload = this.replacer(payload, config.replacements.patterns, 'FirstName');
    payload = this.replacer(payload, config.replacements.characters, 'FirstName');
    payload = this.replacer(payload, ['  '], 'FirstName', ' ');
    payload = this.trimWhitespace(payload, 'FirstName');
    return payload;
  }
  replacer(payload, source, field, substitute) {
    source.map(query => {
      payload[field] = payload[field].replace(query, substitute || '');
    });
    return payload;
  }
  trimWhitespace(payload, field) {
    payload[field] = payload[field].trim();
    return payload;
  }
  // Copy Functions
  // ----------------------------------------------------------------
  appendCopy(payload) {
    let language = payload.Language.toLowerCase();
    if (copy[language] !== undefined) {
      return { ...payload, ...copy[language] };
    } else {
      return payload;
    }
  }
  applyChallengeCopy(payload) {
    let challengeCompleted = this.hasCompletedChallenge(payload);
    return this.applyConditionalCopy(payload, '10_title', challengeCompleted);
  }
  applyPerformanceCopy(payload) {
    payload = this.applyConditionalCopy(payload, '3_title', payload.performance);
    payload = this.applyConditionalCopy(payload, '7A_title', payload.performance);
    payload = this.applyConditionalCopy(payload, '7B_title', payload.performance);
    payload = this.applyConditionalCopy(payload, '9A_title', payload.performance);
    payload = this.applyConditionalCopy(payload, '9B_title', payload.performance);
    return payload;
  }
  applyConditionalCopy(payload, field, condition) {
    if (condition) {
      payload[field] = payload[`${field}_1`];
    } else {
      payload[field] = payload[`${field}_2`];
    }
    delete payload[`${field}_1`];
    delete payload[`${field}_2`];
    return payload;
  }
}

module.exports = Transformer;
