<img align='left' src="http://i.imgur.com/RhlrUuG.png" width="200">

<h3 align='center'>Stocks.js</h3>
<p align="center">
  Easy-to-use stocks API for Node.js and the browser</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/stocks.js">
  <img src="https://img.shields.io/npm/v/stocks.js.svg?style=flat-square"></a>
  <a href="https://travis-ci.org/wagenaartje/stocks.js">
  <img src="https://img.shields.io/travis/wagenaartje/stocks.js/master.svg?style=flat-square"></a>
</p>

&zwnj;

#

`stocks.js` allows easy retrieval of stock data - without having to pay a single
dollar. The library uses [Alpha Vantage](https://www.alphavantage.co/) as its
data source. Next to regular time series data, there are a bunch of technical
indicators that can be tracked with this library.

> :bulb: This library is very new, so you might experience issues. If you do,
please report them at the [issues](https://github.com/wagenaartje/stocks.js/issues)
section.

This is an example of regular stock time series retrieval
([click to run](https://jsfiddle.net/wagenaartje/2pph8rax/4/)):


```js
// Let's get the stock data of Tesla Inc. for the last 10 minutes
var result = await stocks.timeSeries({
  symbol: 'TSLA',
  interval: '1min',
  amount: 10
 });
```

And this is an example of how to retrieve a [technical
indicator](https://www.alphavantage.co/documentation/#technical-indicators)
([click to run](https://jsfiddle.net/wagenaartje/2pph8rax/5/)):

```js
// Let's get the directional movement index of Microsoft Corporation for the
// last 20 years, with 10 data points used to calculate every point
var result = await stocks.technicalIndicator({
  symbol: 'MSFT',
  interval: 'monthly',
  indicator: 'ADX',
  time_period: 10
});
```

## Getting started
The first step is downloading the `dist/stocks.js` file to your local machine.
Sadly, we don't host this file yet, but we will get to that soon. Link the file
in your `.html` file:

```html
<script src="stocks.js"></script>
```

You can also install stocks.js with [npm](https://www.npmjs.com/) (latest
version required):

```cmd
npm install stocks.js --save
```

Now you have to request your *personal API Key* at Alpha Vantage. Claim your
API Key [here](https://www.alphavantage.co/support/#api-key). Now in another
`.js` file, write the following code:

```js
var stocks = new Stocks('XXXX'); // replace XXXX with your API Key
```

Basically, you're good to go! You can use any of the functions without a hassle
now. View the *Usage* paragraph below to see how you can fetch data.

## Usage
At this moment, stocks.js supports 3 stock market data functions. Be sure to
read through the 'Getting Started' section before reading this!

### stocks.timeSeries()
This function allows you to retrieve data from now, up to 20 years to the past.
The basic usage is as follows:

```js
var result = await stocks.timeSeries(options);
```

where *options* is an object containing any of the following options:

* `REQ symbol`, the symbol of the stock you want to follow. An example of this
is 'TLSA'. There is no list of symbols, I have requested a list at Alpha
Vantage.
* `REQ interval`, the interval of the data points you want to retrieve. Choose
from any of the following intervals: '1min', '5min', '15min', '30min', '60min',
'daily', 'weekly' and 'monthly'. Intervals 1min-60min typically span back to the
past 10 to 15 active trading days. Intervals daily-monthly span up to 20 years.
* `amount`, the amount of data points to fetch. If not specified, will return
all possible data points up to a maximum twenty years ago.
* `start & end`, the start and end dates from which to get data from in between.
_Cannot_ be used in combination with the amount option. For any interval shorter
than daily, specify intraday dates.

So an example of options could be:

```js
var options = {
  symbol: 'AAPL',
  interval: 'weekly',
  amount: 52
};
```

Or to get data in between two dates ([click to run](https://jsfiddle.net/wagenaartje/2pph8rax/6/)):

```js
var options = {
  symbol: 'TSLA',
  interval: 'daily',
  start: new Date('2017-07-01'),
  end: new Date('2017-07-09')
}
```

The result of such a request is an array with `amount` elements (or every
element between `start` and `end`), every element is an object that includes the
following keys and corresponding values:

```js
close, high, low, open, volume, date
```

### stocks.technicalIndicator()

This function allows you to fetch certain technical indicators regarding the
stock. The basic usage is as follows:

```js
var result = await stocks.technicalIndicator(options);
```

where *options* is an object containing any of the following options:

* `REQ symbol`, the symbol of the stock you want to follow. An example of this
is 'TLSA'. There is no list of symbols, I have requested a list at Alpha
Vantage.
* `REQ indicator`, the indicator of which you want to fetch data. Currently,
only a handful of indicators are supported. Way more will follow soon. Supported
indicators: [ADX](https://www.alphavantage.co/documentation/#adx),
[ADXR](https://www.alphavantage.co/documentation/#adxr),
[BOP](https://www.alphavantage.co/documentation/#bop),
[CCI](https://www.alphavantage.co/documentation/#cci),
[AROON](https://www.alphavantage.co/documentation/#aroon),
[AROONOSC](https://www.alphavantage.co/documentation/#aroonosc),
[MFI](https://www.alphavantage.co/documentation/#mfi),
[DX](https://www.alphavantage.co/documentation/#dx),
[MINUS_DI](https://www.alphavantage.co/documentation/#minusdi),
[PLUS_DI](https://www.alphavantage.co/documentation/#plusdi),
[PLUS_DM](https://www.alphavantage.co/documentation/#plusdm),
[MIDPRICE](https://www.alphavantage.co/documentation/#midprice),
[TRANGE](https://www.alphavantage.co/documentation/#trange),
[ATR](https://www.alphavantage.co/documentation/#atr),
[NATR](https://www.alphavantage.co/documentation/#natr),
[AD](https://www.alphavantage.co/documentation/#ad) and
[OBV](https://www.alphavantage.co/documentation/#obv)
* `REQ interval`, the interval of the data points you want to retrieve. Choose
from any of the following intervals: '1min', '5min', '15min', '30min', '60min',
'daily', 'weekly' and 'monthly'. Any interval shorter than daily will only fetch
the data points of the current day.
* `REQ time_period`, the time period to calculate certain indicators from. For
example, if set to 10, the indicator value will be calculated using 10 data
points. Does not affect all indicators.
* `amount`, the amount of data points to fetch. If not specified, will return
all possible data points up to a maximum twenty years ago.
* `start & end`, the start and end dates from which to get data from in between.
_Cannot_ be used in combination with the amount option. For any interval shorter
than daily, specify intraday dates.
* `series_type`, can be either `close`, `open`, `high` or `low`. Not all
indicators require this

So an example of options could be:

```js
var options = {
  symbol: 'NOK',
  interval: '60min',
  amount: 24,
  time_period: 3,
  indicator: 'ADX'
};
```

The result of such a request is an array with `amount` elements, every element
is an object that includes the following keys and corresponding values:

```js
(indicator name), date
```

### stocks.sectorPerformance()
This function will fetch the US sector performance calculated from S&P500
incumbents. The basic usage is as follows:

```js
var result = await stocks.sectorPerformance(options);
```

where *options* is an object containing any of the following options:

* `REQ timespan`, the timespan of which to get the sector performance. Choose
from any of the following timespans: 'real-time', '1day', '5day', '1month',
'3month', 'year-to-date', '1year', '3year', '5year', '10year'

So an example of options could be
([click to run](https://jsfiddle.net/wagenaartje/up4nnr4a/2/)):

```js
var options = {
  timespan: 'year-to-date'
};
```

The result of such a request will be an object containing the following values:

```js
Utilities, Consumer Staples, Real Estate, Consumer Discretionary,
Communication Services, Materials, Financials, Health Care,
Information Technology, Industrials, Energy
```

## Contributing
If you want to contribute to this project, please read the [contributing guide](https://github.com/wagenaartje/stocks.js/blob/master/CONTRIBUTING.md)
over here. You can also participate in the discussions at the [issues
section](https://github.com/wagenaartje/stocks.js/issues), every opinion we can
get is useful.

## Further notices
All the data comes from [Alpha Vantage](https://www.alphavantage.co/), although
they exist for some time now, it is quite unclear what their business model is.
They also do not provide a lot of information on their sources and why an API
Key is needed. So please note the risk that from one day to the other their
service might stop.

<hr>

You made it all the way down! If you appreciate this repo and want to support the development of it, please consider donating :thumbsup:
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CXS3G8NHBYEZE)
