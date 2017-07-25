import fetch from 'node-fetch';

const INTERVALS =  {
  '1min': '1min',
  '5min': '5min',
  '15min': '15min',
  '30min': '30min',
  '60min': '60min',
  'daily': 'daily',
  'weekly': 'weekly',
  'monthly': 'monthly',
};
Object.freeze(INTERVALS);

const PERFORMANCES = {
  'real-time': 'real-time',
  '1day': '1day',
  '5day': '5day',
  '1month': '1month',
  '3month': '3month',
  'year-to-date': 'year-to-date',
  '1year': '1year',
  '3year': '3year',
  '5year': '5year',
  '10year': '10year',
}
Object.freeze(PERFORMANCES);

const SERIES = {
  'TIME_SERIES_INTRADAY': 'TIME_SERIES_INTRADAY',
  'TIME_SERIES_DAILY': 'TIME_SERIES_DAILY',
  'TIME_SERIES_DAILY_ADJUSTED': 'TIME_SERIES_DAILY_ADJUSTED',
  'TIME_SERIES_WEEKLY': 'TIME_SERIES_WEEKLY',
  'TIME_SERIES_MONTHLY': 'TIME_SERIES_MONTHLY',
};
Object.freeze(SERIES);

const OUTPUTSIZE = {
  'compact': 'compact',
  'full': 'full',
};
Object.freeze(OUTPUTSIZE);

const DATATYPE = {
  'json': 'json',
  'csv': 'csv',
};
Object.freeze(DATATYPE);

export default  class Stock {

  static DEFAULT_URL = 'https://www.alphavantage.co/query?';
  static API_KEY_URL = 'https://www.alphavantage.co/support/#api-key';
  static INTERVALS = INTERVALS;
  static OUTPUTSIZE = OUTPUTSIZE;
  static DATATYPE = DATATYPE;
  static SERIES = SERIES;
  static PERFORMANCES = PERFORMANCES;

  static fetch = fetch;

  constructor(props){
    this.setProps({
      symbol: 'AAPL',
      apiKey: 'demo',
      interval: Stock.INTERVALS['1min'],
      outputsize: Stock.OUTPUTSIZE['full'],
      datatype: Stock.DATATYPE['json'],
      ...props
    });
  }

  get series(){
    switch (this.interval){
      case '1min':
      case '5min':
      case '15min':
      case '30min':
      case '60min':
        return Stock.SERIES['TIME_SERIES_INTRADAY'];
      case 'daily':
        return Stock.SERIES['TIME_SERIES_DAILY'];
      case 'weekly':
        return Stock.SERIES['TIME_SERIES_WEEKLY'];
      case 'monthly':
        return Stock.SERIES['TIME_SERIES_MONTHLY'];
      default:
        throw new Error(
          `${this.interval} is not compatible with intervals.`
          + `One of the folowing are accepted: ${Object.keys(Stock.INTERVALS)}`
        );
    }
  }

  get params(){
    const params = {
      function: this.series,
      symbol: this.symbol,
      apikey: this.apiKey,
    };
    if( this.series === Stock.SERIES['TIME_SERIES_INTRADAY'] ){
      params.interval = this.interval;
    }
    return params;
  }

  get url(){
    const params = Object.keys(this.params)
      .map( key => `${key}=${this.params[key]}` )
      .join('&');
    return `${Stock.DEFAULT_URL}${params}`
  }

  setProps(props = {}){
    this.symbol = props.symbol || 'AAPL';
    this.apiKey = props.apiKey || 'demo';
    this.interval = props.interval || Stock.INTERVALS['1min'];
    this.outputsize = props.outputsize || Stock.OUTPUTSIZE['full'];
    this.datatype = props.datatype || Stock.DATATYPE['json'];
  }

  async fetch(){
    return Stock.fetch(this.url)
      .then( data => data.json() )
      .then( Serializer.getOptions );
  }
  listen(){}
}

class Serializer {
  static getMeta(data){
    const meta = data['Meta Data'];
    return {
      information: meta["1. Information"],
      symbol: meta["2. Symbol"],
      refreshed: meta["3. Last Refreshed"],
      interval: meta["4. Interval"],
      outputsize: meta["5. Output Size"],
      timeZone: meta["6. Time Zone"],
    };
  }
  static getOptions(data){
    const seriesKey = Object.keys(data).find( key => key.includes('Time Series') );
    const series = data[seriesKey];
    const meta = Serializer.getMeta(data);
    const options = [];
    for(let date in series){
      const serie = series[date];
      options.push({
        date,
        meta,
        open: serie['1. open'],
        high: serie['2. high'],
        low: serie['3. low'],
        close: serie['4. close'],
        volume: serie['5. volume'],
      })
    }
    return options;
  }
}