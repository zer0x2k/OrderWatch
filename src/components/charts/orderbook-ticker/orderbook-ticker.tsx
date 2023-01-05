import { Component, h, Prop, State, Watch } from '@stencil/core';
import { Subscription } from 'rxjs';
import { FormatterService } from '../../../services/formatter-service';
import { MarketService, OrderBookTicker } from '../../../services/market-service';
import { OrderbookRegistry } from '../../../services/orderbook-service';
import { injectHistory, RouterHistory } from '@stencil-community/router';


@Component({
  tag: 'orderbook-ticker',
  styleUrl: 'orderbook-ticker.css',
  shadow: true,
})
export class OrderbookTicker {
  @Prop() symbol: string;
  @Prop() history: RouterHistory;
  @State() gainerIndex: number;
  @State() ticker: OrderBookTicker;

  watchSubscription: Subscription;

  connectedCallback() {
    this.watchSubscription = MarketService.GetOrderbookTickers().subscribe(tickers => {
      this.ticker = tickers.find(t => t.symbol == this.symbol);
      this.gainerIndex =
      tickers.sort((a, b) => b.percentage - a.percentage)
          .findIndex(x => x.symbol == this.symbol) + 1;
    });
  }

  disconnectedCallback() {
    if (this.watchSubscription) {
      this.watchSubscription.unsubscribe();
    }
    this.ticker = null;
  }

  @Watch('symbol')
  watchMatch() {
    this.disconnectedCallback();
    this.connectedCallback();
  }

  private close = () => {
    OrderbookRegistry.removeService(this.symbol);
    const lastService = OrderbookRegistry.getLastService();
    if(lastService){
      this.history.replace(`/orderbook/${lastService.getSymbol().replace('/', '-')}`, {});
    }else{
      this.history.replace('/', {});
    }
  }

  render() {
    return (
      <div class="inline-flex items-center space-x-2">
        <span class="w-full inline-block py-1.5 px-2.5 leading-none text-center whitespace-nowrap align-baseline text-sm text-white rounded">
          Last-Price {MarketService.priceToPrecision(this.symbol, this.ticker?.last)} {FormatterService.getBaseCurrency(this.symbol)}
        </span>
        <span class="w-full inline-block py-1.5 px-2.5 leading-none text-center whitespace-nowrap align-baseline text-sm text-white rounded">Gainer Index #{this.gainerIndex}</span>
        <span
          class={`w-full inline-block py-1.5 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold text-white rounded ${
            this.ticker?.percentage > 0 ? 'bg-green-500' : 'bg-red-400'
          }`}
        >
          {this.ticker?.percentage.toFixed(2)} %
        </span>
        <span class="inline-flex items-center space-x-2">
          <button class="bg-gray-900 text-white/50 p-2 rounded-md hover:text-white smooth-hover" onClick={this.close}>
            <svg class="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <g id="Layer_2" data-name="Layer 2">
                <g id="invisible_box" data-name="invisible box">
                  <rect width="48" height="48" fill="none" />
                </g>
                <g id="icons_Q2" data-name="icons Q2">
                  <path d="M26.8,24,37.4,13.5a2.1,2.1,0,0,0,.2-2.7,1.9,1.9,0,0,0-3-.2L24,21.2,13.4,10.6a1.9,1.9,0,0,0-3,.2,2.1,2.1,0,0,0,.2,2.7L21.2,24,10.6,34.5a2.1,2.1,0,0,0-.2,2.7,1.9,1.9,0,0,0,3,.2L24,26.8,34.6,37.4a1.9,1.9,0,0,0,3-.2,2.1,2.1,0,0,0-.2-2.7Z" />
                </g>
              </g>
            </svg>
          </button>
        </span>
      </div>
    );
  }
}

injectHistory(OrderbookTicker);
