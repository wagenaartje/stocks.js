/** Import */
var fetch;
if (typeof window === 'undefined') {
  // Seems like we are using Node.js
  fetch = require('node-fetch');
} else {
  fetch = window.fetch;
}

/*******************************************************************************
                                  STOCKS
*******************************************************************************/

function Stocks (apiKey) {
  this.apiKey = apiKey;
}

Stocks.prototype = {
  /** Constants */
  DEFAULT_URL: 'https://www.alphavantage.co/query?',
  API_KEY_URL: 'https://www.alphavantage.co/support/#api-key',

  INTERVALS: [
    '1min', '5min', '15min', '30min', '60min', 'daily', 'weekly', 'monthly'
  ],
  PERFORMANCES: [
    'real-time', '1day', '5day', '1month', '3month', 'year-to-date', '1year',
    '3year', '5year', '10year'
  ],

  INDICATORS: [
    'SMA', 'EMA', 'WMA', 'DEMA', 'TEMA', 'TRIMA', 'KAMA', 'MAMA', 'VWAP', 'T3',
    'MACD', 'MACDEXT', 'STOCH', 'STOCHF', 'RSI', 'STOCHRSI', 'WILLR', 'ADX',
    'ADXR', 'APO', 'PPO', 'MOM', 'BOP', 'CCI', 'CMO', 'ROC', 'ROCR', 'AROON',
    'AROONOSC', 'MFI', 'TRIX', 'ULTOSC', 'DX', 'MINUS_DI', 'PLUS_DI', 'MINUS_DM',
    'PLUS_DM', 'BBANDS', 'MIDPOINT', 'MIDPRICE', 'SAR', 'TRANGE', 'ATR', 'NATR',
    'AD', 'ADOSC', 'OBV', 'HT_TRENDLINE', 'HT_SINE', 'HT_TRENDMODE',
    'HT_DCPERIOD', 'HT_DCPHASE', 'HT_PHASOR'
  ],

  INDICATORS_ST: [
    'SMA', 'EMA', 'WMA', 'DEMA', 'TEMA', 'TRIMA', 'KAMA', 'MAMA', 'T3', 'MACD',
    'MACDEXT', 'RSI', 'STOCHRSI', 'APO', 'PPO', 'MOM', 'CMO', 'ROC', 'ROCR',
    'TRIX', 'BBANDS', 'MIDPOINT', 'HT_TRENDLINE', 'HT_SINE', 'HT_TRENDMODE',
    'HT_DCPERIOD', 'HT_DCPHASE', 'HT_PHASOR'
  ],

  /** Private functions */
  _createUrl: function (params) {
    params.apikey = this.apiKey;

    var encoded = Object.keys(params).map(
      key => `${key}=${params[key]}`
    ).join('&');

    return this.DEFAULT_URL + encoded;
  },

  _doRequest: function (params) {
    if (typeof this.apiKey === 'undefined') {
      this._throw(0, 'error');
    }

    var self = this;

    return new Promise((resolve, reject) => {
      var url = this._createUrl(params);

      fetch(url).then(function (response) {
        return response.json();
      }).then(function (data) {
        if (typeof data['Error Message'] !== 'undefined') {
          self._throw(9, 'error');
        }

        resolve(data);
      });
    });
  },

  _throw: function (code, type) {
    if (type === 'error') {
      throw new Error(`${code}: ${this.MESSAGES[code]}`);
    } else if (type === 'warning') {
      console.warn(`${code}: ${this.MESSAGES[code]}`);
    }
  },

  _checkOptions: function (options, type) {
    if (typeof options === 'undefined') {
      this._throw(1, 'error');
    } else if (typeof options.symbol === 'undefined') {
      this._throw(2, 'error');
    } else if (typeof options.interval === 'undefined' ||
               !this.INTERVALS.includes(options.interval)) {
      this._throw(3, 'error');
    } else if (typeof options.start !== 'undefined' &&
               typeof options.amount !== 'undefined') {
      this._throw(4, 'error');
    }

    if (typeof options.amount === 'undefined' &&
        typeof options.start === 'undefined') {
      this._throw(8, 'warning');
    }

    if (typeof options.start === 'object' &&
        typeof options.end === 'undefined') {
      this._throw(10, 'warning');
      options.end = Date.now();
    }

    if (type === 'technical') {
      if (typeof options.indicator === 'undefined') {
        this._throw(5, 'error');
      } else if (typeof options.time_period === 'undefined') {
        this._throw(6, 'error');
      } else if (!this.INDICATORS.includes(options.indicator)) {
        this._throw(12, 'error');
      } else if (typeof options.series_type === 'undefined' &&
                 this.INDICATORS_ST.includes(options.indicator)) {
        this._throw(11, 'error');
      }
    }
  },

  _convertData: function (data, amount) {
    // Strip meta data
    var key = Object.keys(data).find(
      key => key.indexOf('Time Series') !== -1 ||
      key.indexOf('Technical') !== -1
    );
    data = data[key];

    var newData = [];

    // Process all elements
    for (key in data) {
      if (typeof amount !== 'undefined' && newData.length === amount) break;

      // Smoothen up the keys and values in each sample
      let newSample = {};
      for (var sampleKey in data[key]) {
        let newSampleKey = sampleKey.replace(/.+. /, '');
        newSample[newSampleKey] = Number(data[key][sampleKey]);
      }

      // Convert date to local time (dates from AV should be EDT)
      newSample['date'] = new Date(
        Date.parse(key) + (240 - new Date().getTimezoneOffset()) * 60000
      );

      // Insert in new data
      newData.push(newSample);
    }

    return newData;
  },

  _getBetween: function (data, start, end) {
    // Can be optimized by calculating index of start and end dates in list
    return data.filter(sample => start <= sample.date && sample.date <= end);
  },

  /** Public functions */
  timeSeries: async function (options = {}) {
    this._checkOptions(options, 'timeseries');

    if (this.INTERVALS.slice(0, 5).includes(options.interval)) {
      var interval = options.interval;
      options.interval = 'intraday';
    }

    var params = {
      function: `TIME_SERIES_${options.interval}`,
      symbol: options.symbol,
      outputsize: 'full'
    };

    if (options.interval === 'intraday') {
      params.interval = interval;
    }

    if (this.INTERVALS.indexOf(options.interval) <= 5 && options.amount <= 100) {
      params.outputsize = 'compact';
    }

    // Get result
    var result = await this._doRequest(params);
    var converted = this._convertData(result, options.amount);

    if (typeof options.start !== 'undefined') {
      converted = this._getBetween(converted, options.start, options.end);
    }

    return converted;
  },

  technicalIndicator: async function (options = {}) {
    this._checkOptions(options, 'technical');

    var params = {
      function: options.indicator,
      symbol: options.symbol,
      interval: options.interval,
      time_period: options.time_period,
      series_type: options.series_type
    };

    // Get result
    var result = await this._doRequest(params);
    var converted = this._convertData(result, options.amount);

    if (typeof options.start !== 'undefined') {
      converted = this._getBetween(converted, options.start, options.end);
    }

    return converted;
  },

  sectorPerformance: async function (options = {}) {
    if (typeof options.timespan === 'undefined' ||
               !this.PERFORMANCES.includes(options.timespan)) {
      this._throw(7, 'error');
    }

    var params = {
      function: 'SECTOR'
    };

    var result = await this._doRequest(params);

    var found = Object.keys(result).find(key => {
      let noSpace = key.replace(/ /g, '').toLowerCase();
      return noSpace.includes(options.timespan);
    });

    result = result[found];
    for (var j in result) {
      result[j] = parseFloat(result[j]);
    }

    return result;
  }
};

Stocks.prototype.MESSAGES = {
  0: `You must first claim your API Key at ${Stocks.prototype.API_KEY_URL}`,
  1: 'No options specified!',
  2: 'No `symbol` option specified!',
  3: `No (correct) 'interval' option specified, please set to any of the ` +
     `following: ${Stocks.prototype.INTERVALS.join(', ')}`,
  4: `Only 'start'-'end' OR 'amount' can be specified!`,
  5: `No 'indicator' option specified!`,
  6: `No 'time_period' option specified!`,
  7: `No (correct) 'interval' option specified, please set to any of the ` +
     `following: ${Stocks.prototype.PERFORMANCES.join(', ')}`,
  8: `No 'amount' option specified, returning maximum amount of datapoints`,
  9: 'An error occured during the API request. Please create an issue at ' +
     'https://github.com/wagenaartje/stocks/issues with your code',
  10: `'start' specified, but 'end' not specified. Using today's date as ` +
      `end date!`,
  11: `No 'series_type' option specified`,
  12: `The indicator specified does not exist. Please check the Alpha Vantage
       list of indicators https://www.alphavantage.co/documentation/#technical-indicators`
};

/** Export */
if (typeof window === 'undefined') {
  module.exports = Stocks; // Node.js
} else {
  window['Stocks'] = Stocks; // Browser
}
