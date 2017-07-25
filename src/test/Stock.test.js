import {Stock} from '../stocks';

import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

it('create empty stock', () => {
  const stock = new Stock();
  expect(stock).to.deep.equal({
    "symbol": "AAPL",
    "interval": "1min",
    "apiKey": "demo",
    "datatype": "json",
    "outputsize": "full",
  })
});

it('create custom stock', () => {
  const props = {
    "symbol": "MSFT",
    "interval": "5min",
    "apiKey": "mykey",
    "datatype": "csv",
    "outputsize": "compact",
  };
  const stock = new Stock(props);
  expect(stock).to.deep.equal(props)
});

it('series depend on interval', () => {
  const interval = 'unsuported';
  const stock = new Stock();

  stock.interval = interval;
  expect( () => stock.series ).to.throw(
    `${interval} is not compatible with intervals.`
    + `One of the folowing are accepted: ${Object.keys(Stock.INTERVALS)}`
  );

  stock.interval = '1min';
  expect(stock.series).to.eq(Stock.SERIES['TIME_SERIES_INTRADAY']);

  stock.interval = '60min';
  expect(stock.series).to.eq(Stock.SERIES['TIME_SERIES_INTRADAY']);

  stock.interval = 'daily';
  expect(stock.series).to.eq(Stock.SERIES['TIME_SERIES_DAILY']);

  stock.interval = 'weekly';
  expect(stock.series).to.eq(Stock.SERIES['TIME_SERIES_WEEKLY']);

  stock.interval = 'monthly';
  expect(stock.series).to.eq(Stock.SERIES['TIME_SERIES_MONTHLY']);
});

it('params', () => {
  const stock = new Stock({
    "symbol": "AAPL",
    "interval": "1min",
    "apiKey": "demo",
    "datatype": "json",
    "outputsize": "full",
  });
  expect(stock.params).to.deep.eq({
    apikey: 'demo',
    function: 'TIME_SERIES_INTRADAY',
    symbol: 'AAPL',
    interval: '1min',
  });
  stock.interval = 'monthly';
  expect(stock.params).to.deep.eq({
    apikey: 'demo',
    function: 'TIME_SERIES_MONTHLY',
    symbol: 'AAPL',
  });
});

it('url combined from props', () => {
  const stock = new Stock({
    "symbol": "MSFT",
    "interval": "1min",
    "apiKey": "demo",
    "datatype": "json",
    "outputsize": "full",
  });
  expect(stock.url).to.eq(
    `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&apikey=demo&interval=1min`
  )
});

describe('fetch', () => {

  const stock = new Stock({
    "symbol": "MSFT",
    "interval": "1min",
    "apiKey": "demo",
    "datatype": "json",
    "outputsize": "full",
  });

  sinon.stub(Stock, 'fetch', () => {
    return Promise.resolve({
      json: () => {
        return {
          "Meta Data": {
            "1. Information": "Intraday (1min) prices and volumes",
            "2. Symbol": "MSFT",
            "3. Last Refreshed": "2017-07-24 16:00:00",
            "4. Interval": "1min",
            "5. Output Size": "Compact",
            "6. Time Zone": "US/Eastern"
          },
          "Time Series (1min)": {
            "2017-07-24 16:00:00": {
              "1. open": "73.7000",
              "2. high": "73.7500",
              "3. low": "73.5900",
              "4. close": "73.6000",
              "5. volume": "3692574"
            },
          }
        }
      },
    })
  });

  it('fetch', async () => {
    const results = await stock.fetch();
    expect( Stock.fetch ).to.have.been.calledWith(stock.url);
  });

  it('fetch convertes data to options', async () => {
    const results = await stock.fetch();
    expect( results ).to.deep.eq([
      {
        "close": "73.6000",
        "date": "2017-07-24 16:00:00",
        "high": "73.7500",
        "low": "73.5900",
        "meta": {
          "information": "Intraday (1min) prices and volumes",
          "interval": "1min",
          "outputsize": "Compact",
          "refreshed": "2017-07-24 16:00:00",
          "symbol": "MSFT",
          "timeZone": "US/Eastern",

        },
        "open": "73.7000",
        "volume": "3692574"

  }
    ]);
  });

});

