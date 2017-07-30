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

  /** Private functions */
  _createUrl: function (params) {
    if (!params) {
      throw new Error(`Params is undefined`);
    }

    params.apikey = this.apiKey;

    var encoded = Object.keys(params).map(
      key => `${key}=${params[key]}`
    ).join('&');

    return this.DEFAULT_URL + encoded;
  },

  _doRequest: function (params) {
    if (typeof this.apiKey === 'undefined') {
      throw new Error(
        `You must first claim your API Key at ${this.API_KEY_URL}`
      );
    }

    return new Promise((resolve, reject) => {
      var url = this._createUrl(params);

      fetch(url).then(function (response) {
        return response.json();
      }).then(function (data) {
        if (typeof data['Error Message'] !== 'undefined') {
          throw new Error(
            'An error occured. Please create an issue at ' +
            'https://github.com/wagenaartje/stocks/issues with your code, ' +
            `and provide the following message: ${data['Error Message']}`
          );
        }

        resolve(data);
      });
    });
  },

  _checkOptions: function (options, type) {
    if (typeof options === 'undefined') {
      throw new Error();
    } else if (typeof options.symbol === 'undefined') {
      throw new Error('No `symbol` option specified!');
    } else if (typeof options.interval === 'undefined' ||
               this.INTERVALS.indexOf(options.interval) === -1) {
      throw new Error(
        `No (correct) 'interval' option specified, please set to any of the ` +
        `following: ${this.INTERVALS.join(', ')}`
      );
    } else if (typeof options.start !== 'undefined' &&
               typeof options.amount !== 'undefined') {
      throw new Error(`Only 'start'-'end' OR 'amount' can be specified!`);
    }

    if (typeof options.amount === 'undefined' &&
        options.start === 'undefined') {
      console.warn(
        `No 'amount' option specified, returning maximum amount of datapoints`
      );
    }

    if (type === 'technical') {
      if (typeof options.indicator === 'undefined') {
        throw new Error(`No 'indicator' option specified!`);
      } else if (typeof options.time_period === 'undefined') {
        throw new Error(`No 'time_period' option specified!`);
      }
    }
  },

  _convertData: function (data, amount) {
    // Strip meta data
    for (var key in data) {
      if (key.indexOf('Time Series') !== -1 ||
          key.indexOf('Technical') !== -1) {
        data = data[key];
        break;
      }
    }

    var newData = [];

    // Process all elements
    for (key in data) {
      if (typeof amount !== 'undefined' && newData.length === amount) break;

      // Convert date to local time (dates from AV should be EST)
      let date = new Date(key + ' EDT');

      // Smoothen up the keys and values in each sample
      let newSample = {};
      for (var sampleKey in data[key]) {
        let newSampleKey = sampleKey.replace(/.+. /, '');
        newSample[newSampleKey] = Number(data[key][sampleKey]);
      }

      newSample['date'] = date;

      // Insert in new data
      newData.push(newSample);
    }

    return newData;
  },

  _getBetween: function (data, start, end) {
    // Can be optimized by calculating index of start and end dates in list
    var newData = [];
    for (var i = 0; i < data.length; i++) {
      let sample = data[i];

      if (start <= sample.date && sample.date <= end) {
        newData.push(sample);
      }
    }

    return newData;
  },

  /** Public functions */
  timeSeries: async function (options = {}) {
    this._checkOptions(options, 'timeseries');

    if (this.INTERVALS.slice(0, 5).indexOf(options.interval) > -1) {
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
      time_period: options.time_period
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
               this.PERFORMANCES.indexOf(options.timespan) === -1) {
      throw new Error(`No (correct) 'interval' option specified, please set ` +
        `to any of the following: ${this.PERFORMANCES.join(', ')}`
      );
    }

    var params = {
      function: 'SECTOR'
    };

    var result = await this._doRequest(params);

    var found = Object.keys(result).find(key => {
      let noSpace = key.replace(/ /g, '').toLowerCase();
      return noSpace.indexOf(options.timespan) !== -1;
    });

    result = result[found];
    for (var j in result) {
      result[j] = parseFloat(result[j]);
    }

    return result;
  }
};

/** Export */
if (typeof window === 'undefined') {
  module.exports = Stocks; // Node.js
} else {
  window['Stocks'] = Stocks; // Browser
}
