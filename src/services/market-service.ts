import { Observable, BehaviorSubject, Subscription, timer, takeWhile, switchMap } from 'rxjs';
import { ExchangeService } from "./exchange-service";

export declare type OrderBookTickers = { [key in string]?: OrderBookTicker }
export declare type initOrderBookTicker = {
  ask: number,
  bid: number,
  last: number,
  percentage: number,
  timestamp: number,
  symbol: string,
};

export class OrderBookTicker {
  ask: number
  bid: number
  last: number
  percentage: number
  timestamp: number
  symbol: string

  constructor(init: initOrderBookTicker) {
    this.ask  = init.ask;
    this.bid  = init.bid;
    this.last  = init.last;
    this.percentage  = init.percentage;
    this.timestamp  = init.timestamp;
    this.symbol  = init.symbol;
  }
};

class marketService {
  exchange: any;
  watchInterval: number = 5000;
  symbol: string;

  Sub: Subscription;

  isRunning: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isRunningFlag: boolean = false;

  constructor() {
    this.exchange = ExchangeService.getExchange()
    this.startWatch();
  }

  $tickers = timer(0, this.watchInterval).pipe(
    takeWhile(() => this.isRunningFlag),
    switchMap(async () => {
      const exchange = ExchangeService.getExchange();
      const symbols = exchange.symbols;
      const tickersObj = (await exchange.fetchTickers(symbols)) as OrderBookTickers;
      return Object.keys(tickersObj).map(c =>  new OrderBookTicker(tickersObj[c]));
    }),
  );


  startWatch(){
    this.isRunningFlag = true;
    this.Sub = this.$tickers.subscribe(_ => {
      this.isRunning.next(true);
    });
  }

  stopWatch(){
    if (this.Sub) {
      this.Sub.unsubscribe();
    }
    this.isRunningFlag = false;
    this.isRunning.next(this.isRunningFlag);
  }

  GetOrderbookTickers(): Observable<OrderBookTicker[]> {
    return this.$tickers;
  }

  priceToPrecision(symbol, price) {  
    try {
      return price > 0 ? this.exchange.priceToPrecision(symbol, price) : 0;
    } catch (error) {
      return price > 0 ? price : 0;     
    }
  }

}


export const MarketService = new marketService();
