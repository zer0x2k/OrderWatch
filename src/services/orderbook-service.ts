import { ExchangeService } from './exchange-service';
import { Observable, BehaviorSubject, Subscription, timer, takeWhile, switchMap } from 'rxjs';

declare global {
  interface Window {
    ccxt: any;
  }
}


export declare type initOrderbook = {
  symbol: string;
  asks: any[];
  bids: any[];
}

export class OrderBook {
  symbol: string = "";
  asks: any[] = [];
  bids: any[] = [];

  constructor(init: initOrderbook) {
    this.symbol = init.symbol;
    this.asks = init.asks;
    this.bids = init.bids;
  } 

  exchange: any;
  setExchange(exchange: any) {
    this.exchange = exchange;
  }

  amountToPrecision(amount) { return amount > 0 ? this.exchange.amountToPrecision(this.symbol, amount) : 0; }
  priceToPrecision(price) { return price > 0 ? this.exchange.priceToPrecision(this.symbol, price) : 0; }
  currencyToPrecision(amount) { return amount > 0 ? this.exchange.currencyToPrecision(this.symbol, amount) : 0; }
}

export class OrderBookService {
  watchInterval: number = 300;
  symbol: string;

  Sub: Subscription;

  isRunning: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isRunningFlag: boolean = false;
  constructor(symbol: string) {
    this.symbol = symbol;
    this.startWatch();
  }

  $orderbook = timer(0, this.watchInterval).pipe(
    takeWhile(() => this.isRunningFlag),
    switchMap(async () => {
      const exchange = ExchangeService.getExchange();
      const initBook = (await ExchangeService.getExchange().watchOrderBook(this.symbol)) as initOrderbook;
      const orderBook = new OrderBook(initBook);
      orderBook.setExchange(exchange);
      return orderBook;
    }),
  );

  startWatch() {
    this.isRunningFlag = true;
    this.Sub = this.$orderbook.subscribe(_ => {
      this.isRunning.next(true);
    });
  }

  stopWatch() {
    if (this.Sub) {
      this.Sub.unsubscribe();
    }
    this.isRunningFlag = false;
    this.isRunning.next(this.isRunningFlag);
  }

  GetOrderbook(): Observable<OrderBook> {
    return this.$orderbook;
  }

  IsRunning(): BehaviorSubject<Boolean> {
    return this.isRunning;
  }

  getSymbol(): string {
    return this.symbol;
  }
}

class orderbookRegistry {
  bookServices: any = {};
  symbols: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  tryGetService(symbol: string): OrderBookService {
    if (!this.hasService(symbol)) {
      this.addService(symbol);
    }
    return this.getService(symbol);
  }

  addService(symbol: string): void {
    this.bookServices[symbol] = new OrderBookService(symbol);
    this.symbols.next(this.getServiceKeys());
  }

  removeService(symbol: string): void {
    this.getService(symbol).stopWatch();
    delete this.bookServices[symbol];
    this.symbols.next(this.getServiceKeys());
  }

  getService(symbol: string): OrderBookService {
    return this.bookServices[symbol];
  }

  getServiceKeys(): string[] {
    return Object.keys(this.bookServices);
  }

  getLastService(): OrderBookService {
    const last =this.getServiceKeys().pop();
    return last ? this.getService(last) : null;
  }


  hasService(symbol: string): boolean {
    return this.getServiceKeys().indexOf(symbol) > -1;
  }
}

export const OrderbookRegistry = new orderbookRegistry();
export const getEmptyOrderBook = (): OrderBook => { return new OrderBook({ symbol: '', asks: [], bids: [] }) };
