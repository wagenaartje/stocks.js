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

"use strict";


function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
  INTERVALS: ['1min', '5min', '15min', '30min', '60min', 'daily', 'weekly', 'monthly'],

  _createUrl: function _createUrl(params) {
    if (!params) {
      throw new Error('Params is undefined');
    }

    var url = stocks.DEFAULT_URL + 'apikey=' + stocks.API_KEY + '&';
    var keys = Object.keys(params);
    keys.forEach(function (key) {
      url += key + '=' + params[key] + '&';
    });

    return url;
  },

  /** Private functions */
  _doRequest: function _doRequest(params) {
    if (typeof stocks.API_KEY === 'undefined') {
      throw new Error('You must first claim your API Key at ' + stocks.API_KEY_URL);
    }

    return new Promise(function (resolve, reject) {
      var request = typeof window !== 'undefined' ? new XMLHttpRequest() : new NodeXMLHttpRequest();
      var url = stocks._createUrl(params);
      request.open('GET', url, true);

      request.onload = function (e) {
        if (request.readyState === 4) {
          if (request.status === 200) {
            var result = JSON.parse(request.responseText);
            if (typeof result['Error Message'] !== 'undefined') {
              throw new Error('An error occured. Please create an issue at ' + 'https://github.com/wagenaartje/stocks/issues with your code, ' + ('and provide the following message: ' + result['Error Message']));
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

  _checkOptions: function _checkOptions(options, type) {
    if (typeof options === 'undefined') {
      throw new Error('You have not provided any options!');
    } else if (typeof options.symbol === 'undefined') {
      throw new Error('No `symbol` option specified!');
    } else if (typeof options.interval === 'undefined' || stocks.INTERVALS.indexOf(options.interval) === -1) {
      throw new Error('No \'interval\' option specified, please set to any of the following:' + stocks.INTERVALS.join(', '));
    } else if (typeof options.start !== 'undefined' && typeof options.amount !== 'undefined') {
      throw new Error('Only \'start\'-\'end\' OR \'amount\' can be specified!');
    }

    if (typeof options.amount === 'undefined' && options.start === 'undefined') {
      console.warn('No \'amount\' option specified, returning maximum amount of datapoints');
    }

    if (type === 'technical') {
      if (typeof options.indicator === 'undefined') {
        throw new Error('No \'indicator\' option specified!');
      } else if (typeof options.time_period === 'undefined') {
        throw new Error('No \'time_period\' option specified!');
      }
    }
  },

  _convertData: function _convertData(data, amount) {
    // Strip meta data
    var keys = Object.keys(data);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf('Time Series') !== -1 || keys[i].indexOf('Technical') !== -1) {
        data = data[keys[i]];
        break;
      }
    }

    var newData = [];

    // Process all elements
    keys = Object.keys(data);
    for (i = 0; i < keys.length; i++) {
      if (typeof amount !== 'undefined' && i === amount) break;

      var key = keys[i];

      // Convert date to local time (dates from AV should be EST)
      var date = new Date(key + ' EDT');

      // Smoothen up the keys and values in each sample
      var newSample = {};
      var sampleKeys = Object.keys(data[key]);
      for (var j = 0; j < sampleKeys.length; j++) {
        var sampleKey = sampleKeys[j];
        var newSampleKey = sampleKey.replace(/.+. /, '');
        newSample[newSampleKey] = Number(data[key][sampleKey]);
      }

      newSample['date'] = date;

      // Insert in new data
      newData.push(newSample);
    }

    return newData;
  },

  _getBetween: function _getBetween(data, start, end) {
    // Can be optimized by calculating index of start and end dates in list
    var newData = [];
    for (var i = 0; i < data.length; i++) {
      var sample = data[i];

      if (start <= sample.date && sample.date <= end) {
        newData.push(sample);
      }
    }

    return newData;
  },

  /** Public functions */
  timeSeries: function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(options) {
      var symbol, start, end, amount, _interval, params, result, converted;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              stocks._checkOptions(options, 'timeseries');
              symbol = options.symbol, start = options.start, end = options.end, amount = options.amount;


              if (stocks.INTERVALS.slice(0, 5).indexOf(options.interval) > -1) {
                _interval = options.interval;

                options.interval = 'intraday';
              }

              params = {
                function: 'TIME_SERIES_' + options.interval,
                symbol: symbol,
                outputsize: "full"
              };


              if (options.interval === 'intraday') {
                params[interval] += interval;
              }

              // Get result
              _context.next = 7;
              return stocks._doRequest(params);

            case 7:
              result = _context.sent;
              converted = stocks._convertData(result, amount);


              if (typeof start !== 'undefined') {
                converted = stocks._getBetween(converted, start, end);
              }

              return _context.abrupt('return', converted);

            case 11:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function timeSeries(_x) {
      return _ref.apply(this, arguments);
    }

    return timeSeries;
  }(),

  technicalIndicator: function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(options) {
      var indicator, symbol, interval, time_period, amount, params, result;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              stocks._checkOptions(options, 'technical');
              indicator = options.indicator, symbol = options.symbol, interval = options.interval, time_period = options.time_period, amount = options.amount;
              params = {
                function: indicator,
                symbol: symbol,
                interval: interval,
                time_period: time_period

                // Get result
              };
              _context2.next = 5;
              return stocks._doRequest(params);

            case 5:
              result = _context2.sent;
              return _context2.abrupt('return', stocks._convertData(result, options.amount));

            case 7:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function technicalIndicator(_x2) {
      return _ref2.apply(this, arguments);
    }

    return technicalIndicator;
  }()
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