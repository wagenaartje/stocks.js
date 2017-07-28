/* Import */
var Stocks = require('../dist/stocks');
var chai = require('chai');
chai.use(require('chai-datetime'));

/* Rename variables */
var assert = chai.assert;
var expect = chai.expect;

/* Set up some variables */
var symbols = ['TSLA', 'MSFT', 'AAPL', 'AEG', 'FB']; // must be listed >5 years
var indicators = ['ADX', 'BOP', 'CCI', 'DX', 'PLUS_DI', 'MIDPRICE', 'TRANGE'];

var stocks = new Stocks('SYTCQBUIU44BX2G4');

/* Run the tests (split with http://goo.gl/enN7P) */
describe('Stocks.js', function () {
  describe('.timeSeries() with amount', async function () {
    for (var i = 0; i < stocks.INTERVALS.length; i++) {
      timeSeriesAmount(i);
    }
  });
  describe('.timeSeries() with dates', async function () {
    var start = new Date('2017-01-01');
    var end = new Date('2017-12-31');

    for (var i = 0; i < stocks.INTERVALS.length; i++) {
      timeSeriesDates(start, end, i);
    }
  });
  describe('.technicalIndicator() with amount', async function () {
    for (var i = 0; i < stocks.INTERVALS.length; i++) {
      technicalIndicatorAmount(i);
    }
  });
  describe('.technicalIndicator() with dates', function () {
    var start = new Date('2017-01-01');
    var end = new Date('2017-12-31');

    for (var i = 0; i < stocks.INTERVALS.length; i++) {
      technicalIndicatorDates(start, end, i);
    }
  });
  describe('.sectorPerformance()', function () {
    for (var i = 0; i < stocks.PERFORMANCES.length; i++) {
      sectorPerformance(i);
    }
  });
});

function timeSeriesAmount (i) {
  it(stocks.INTERVALS[i], async function () {
    this.timeout(30000);

    var amount = Math.ceil(Math.random() * 60);

    var result = await stocks.timeSeries({
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      interval: stocks.INTERVALS[i],
      amount: amount
    });

    // Check if the actual amount is given
    assert.equal(amount, result.length, 'Output length incorrect');

    // Check if the first element has all values
    expect(result[0]).to.have.all.keys(
      'open', 'high', 'low', 'close', 'volume', 'date'
    );
  });
}

function timeSeriesDates (start, end, i) {
  it(stocks.INTERVALS[i], async function () {
    this.timeout(30000);

    var result = await stocks.timeSeries({
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      interval: stocks.INTERVALS[i],
      start: start,
      end: end
    });

    // Check if all dates are between start an end
    for (var j = 0; j < result.length; j++) {
      var date = result[j].date;

      assert.afterDate(date, start);
      assert.beforeDate(date, end);
    }

    // Check if the first element has all values
    expect(result[0]).to.have.all.keys(
      'open', 'high', 'low', 'close', 'volume', 'date'
    );
  });
}

function technicalIndicatorAmount (i) {
  it(stocks.INTERVALS[i], async function () {
    this.timeout(30000);

    var amount = Math.ceil(Math.random() * 60);
    var indicator = indicators[Math.floor(Math.random() * indicators.length)];

    var result = await stocks.technicalIndicator({
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      interval: stocks.INTERVALS[i],
      indicator: indicator,
      amount: amount,
      time_period: Math.ceil(Math.random() * 10) + 1
    });

    // Check if the actual amount is given
    assert.equal(amount, result.length, 'Output length incorrect');

    // Check if the first element has all values
    expect(result[0]).to.have.all.keys(indicator, 'date');
  });
}

function technicalIndicatorDates (start, end, i) {
  it(stocks.INTERVALS[i], async function () {
    this.timeout(30000);

    var indicator = indicators[Math.floor(Math.random() * indicators.length)];

    var result = await stocks.technicalIndicator({
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      interval: stocks.INTERVALS[i],
      indicator: indicator,
      start: start,
      end: end,
      time_period: Math.ceil(Math.random() * 10) + 1
    });

    // Check if all dates are between start an end
    for (var j = 0; j < result.length; j++) {
      var date = result[j].date;

      assert.afterDate(date, start);
      assert.beforeDate(date, end);
    }

    // Check if the first element has all values
    expect(result[0]).to.have.all.keys(indicator, 'date');
  });
}

function sectorPerformance (i) {
  it(stocks.PERFORMANCES[i], async function () {
    this.timeout(30000);

    var result = await stocks.sectorPerformance({
      timespan: stocks.PERFORMANCES[i]
    });

    // Check if the first element has all values
    expect(result).to.include.all.keys(
      'Utilities', 'Consumer Staples', 'Consumer Discretionary', 'Energy',
      'Telecommunication Services', 'Materials', 'Financials', 'Industrials',
      'Information Technology', 'Health Care'
    );

    if (i <= 5) {
      expect(result).to.include.all.keys('Real Estate');
    }
  });
}
