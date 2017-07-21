/** Import */
if (typeof window === 'undefined') {
  // Seems like we are using Node.js
  var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
}

/*******************************************************************************
                                  STOCKS
*******************************************************************************/

var stocks = {
  /** Constants */
  DEFAULT_URL: 'https://www.alphavantage.co/query?',
  API_KEY_URL: 'https://www.alphavantage.co/support/#api-key',
  INTERVALS: [
    '1min', '5min', '15min', '30min',
    '60min', 'daily', 'weekly', 'monthly'
  ],

  /** Private functions */
  _doRequest: function (url) {
    if (typeof stocks.API_KEY === 'undefined') {
      throw new Error(
        `You must first claim your API Key at ${stocks.API_KEY_URL}`
      );
    }

    return new Promise((resolve, reject) => {
      var request = new XMLHttpRequest();
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
        `No 'interval' option specified, please set to any of the following:` +
         stocks.INTERVALS.join(', ')
      );
    } else if (typeof options.amount === 'undefined') {
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

  /** Public functions */
  timeSeries: async function (options) {
    stocks._checkOptions(options, 'timeseries');

    if (stocks.INTERVALS.slice(0, 5).indexOf(options.interval) > -1) {
      var interval = options.interval;
      options.interval = 'intraday';
    }

    // Construct request
    var url = stocks.DEFAULT_URL;
    url += `function=TIME_SERIES_${options.interval}&`;
    url += `symbol=${options.symbol}&`;
    url += 'outputsize=full&';
    url += `apikey=${stocks.API_KEY}`;

    if (options.interval === 'intraday') {
      url += `&interval=${interval}`;
    }

    // Get result
    var result = await stocks._doRequest(url);
    console.log(result);
    return stocks._convertData(result, options.amount);
  },

  technicalIndicator: async function (options) {
    stocks._checkOptions(options, 'technical');

    // Construct request
    var url = stocks.DEFAULT_URL;
    url += `function=${options.indicator}&`;
    url += `symbol=${options.symbol}&`;
    url += `interval=${options.interval}&`;
    url += `time_period=${options.time_period}&`;
    url += `apikey=${stocks.API_KEY}`;

    // Get result
    var result = await stocks._doRequest(url);
    return stocks._convertData(result, options.amount);
  }
};

/** Export */
// Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = stocks;
}

// Browser
if (typeof window === 'object') {
  (function () {
    var old = window['stocks'];
    stocks.ninja = function () {
      window['stocks'] = old;
      return stocks;
    };
  })();

  window['stocks'] = stocks;
}
