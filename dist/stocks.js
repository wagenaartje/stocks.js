/*!
 * MIT License
 * 
 * Copyright (c) 2017 Thomas Wagenaar
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("XMLHttpRequest"));
	else if(typeof define === 'function' && define.amd)
		define(["XMLHttpRequest"], factory);
	else if(typeof exports === 'object')
		exports["stocks"] = factory(require("XMLHttpRequest"));
	else
		root["stocks"] = factory(root["XMLHttpRequest"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/** Import */
if (typeof window === 'undefined') {
  // Seems like we are using Node.js
  var NodeXMLHttpRequest = __webpack_require__(1).XMLHttpRequest;
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
      var request = typeof window !== 'undefined'
        ? new XMLHttpRequest() : new NodeXMLHttpRequest();
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
if (typeof module !== 'undefined' && module.exports) {
  module.exports = stocks; // Node.js
} else {
  window['stocks'] = stocks; // Browser
}


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ })
/******/ ]);
});