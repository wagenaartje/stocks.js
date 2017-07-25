/** Import */
if (typeof window === 'undefined') {
  // Seems like we are using Node.js
  var NodeXMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
}

/*******************************************************************************
                                  STOCKS
*******************************************************************************/

var stocks = {
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

    var url = `${stocks.DEFAULT_URL}apikey=${stocks.API_KEY}&`;
    var keys = Object.keys(params);
    keys.forEach(function (key) {
        url += `${key}=${params[key]}&`;
    });

    return url;
  },

  _doRequest: function (params) {
    if (typeof stocks.API_KEY === 'undefined') {
      throw new Error(
        `You must first claim your API Key at ${stocks.API_KEY_URL}`
      );
    }

    return new Promise((resolve, reject) => {
      var request = typeof window !== 'undefined'
        ? new XMLHttpRequest() : new NodeXMLHttpRequest();
      var url = stocks._createUrl(params);
      request.open('GET', url, true);

      request.onload = function (e) {
        if (request.readyState === 4) {
          if (request.status === 200) {
            var result = JSON.parse(request.responseText);
            if (typeof result['Error Message'] !== 'undefined') {
              throw new Error(
                'An error occured. Please create an issue at ' +
                'https://github.com/wagenaartje/stocks/issues with your code, ' +
                `and provide the following message: ${result['Error Message']}`
              );
            }

            resolve(result);
          } else {
            reject(e);
          }
        }
      };
      request.onerror = function (e) {
        reject(e);
      };

      request.send(null);
    });
  },

  _checkOptions: function (options, type) {
    if (typeof options === 'undefined') {
      throw new Error('You have not provided any options!');
    } else if (typeof options.symbol === 'undefined') {
      throw new Error('No `symbol` option specified!');
    } else if (typeof options.interval === 'undefined' ||
               stocks.INTERVALS.indexOf(options.interval) === -1) {
      throw new Error(
        `No (correct) 'interval' option specified, please set to any of the ` +
        `following: ${stocks.INTERVALS.join(', ')}`
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
    var keys = Object.keys(data);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf('Time Series') !== -1 ||
          keys[i].indexOf('Technical') !== -1) {
        data = data[keys[i]];
        break;
      }
    }

    var newData = [];

    // Process all elements
    keys = Object.keys(data);
    for (i = 0; i < keys.length; i++) {
      if (typeof amount !== 'undefined' && i === amount) break;

      let key = keys[i];

      // Convert date to local time (dates from AV should be EST)
      let date = new Date(key + ' EDT');

      // Smoothen up the keys and values in each sample
      let newSample = {};
      let sampleKeys = Object.keys(data[key]);
      for (var j = 0; j < sampleKeys.length; j++) {
        let sampleKey = sampleKeys[j];
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
    stocks._checkOptions(options, 'timeseries');

    if (stocks.INTERVALS.slice(0, 5).indexOf(options.interval) > -1) {
      var interval = options.interval;
      options.interval = 'intraday';
    }

    var params = {
      function: `TIME_SERIES_${options.interval}`,
      symbol: options.symbol,
      outputsize: 'full'
    };

    if (options.interval === 'intraday') {
      params[interval] += interval;
    }

    // Get result
    var result = await stocks._doRequest(params);
    var converted = stocks._convertData(result, options.amount);

    if (typeof options.start !== 'undefined') {
      converted = stocks._getBetween(converted, options.start, options.end);
    }

    return converted;
  },

  technicalIndicator: async function (options = {}) {
    stocks._checkOptions(options, 'technical');

    var params = {
      function: options.indicator,
      symbol: options.symbol,
      interval: options.interval,
      time_period: options.time_period
    };

    // Get result
    var result = await stocks._doRequest(params);
    var converted = stocks._convertData(result, options.amount);

    if (typeof options.start !== 'undefined') {
      converted = stocks._getBetween(converted, options.start, options.end);
    }

    return converted;
  },

  sectorPerformance: async function (options = {}) {
    if (typeof options.timespan === 'undefined' ||
               stocks.PERFORMANCES.indexOf(options.timespan) === -1) {
      throw new Error(`No (correct) 'interval' option specified, please set ` +
        `to any ofthe following: ${stocks.PERFORMANCES.join(', ')}`
      );
    }

    var params = {
      function: 'SECTOR'
    };

    var result = await stocks._doRequest(params);
    var keys = Object.keys(result);

    for (var i = 0; i < keys.length; i++) {
      let key = keys[i];
      key = key.replace(/ /g, '').toLowerCase();
      if (key.indexOf(options.timespan) !== -1) {
        result = result[keys[i]];
        for (var j in result) {
          result[j] = Number(result[j].replace('%', ''));
        }
        return result;
      }
    }
  }
};

/** Export */
if (typeof module !== 'undefined' && module.exports) {
  const Stock = require('./Stock.js').default;
  module.exports = stocks; // Node.js
  module.exports = {Stock};
} else {
  window['stocks'] = stocks; // Browser
}
