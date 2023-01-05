import { Component, h, Prop, State, Watch } from '@stencil/core';
import { Subscription } from 'rxjs';
import { OrderbookRegistry, OrderBookService } from '../../services/orderbook-service';
//import { DataService } from '../../services/data-service';

@Component({
  tag: 'app-orderbook',
  styleUrl: 'app-orderbook.css',
  shadow: true,
})
export class AppOrderbook {
  @Prop() match: any;
  symbol: string;
  @State() isRunning: Boolean = false;
  orderBookService: OrderBookService;
  isRunningScubription: Subscription;

  connectedCallback() {
    this.symbol = this.matchToSymbol(this.match);
    this.orderBookService = OrderbookRegistry.tryGetService(this.symbol);
    this.isRunningScubription = this.orderBookService.IsRunning().subscribe(isRunning => {
     this.isRunning = isRunning;
    });
    this.orderBookService.startWatch();
  }

  disconnectedCallback() {
    this.isRunning = false;
    if (this.isRunningScubription) {
      this.isRunningScubription.unsubscribe();
    }
    this.orderBookService.stopWatch();
    this.orderBookService = null;
  }

  @Watch('match')
  watchMatch() {
    this.disconnectedCallback();
    this.connectedCallback();
  }

  matchToSymbol(match: any): string {
    return match.params.symbol.replace('-', '/');
  }

  render() {
    return [
      <div class="">
        <div class="flex justify-between items-center pb-2">
          <h3 class="text-3xl font-extralight text-white/50">{this.symbol}</h3>
          <div class="inline-flex items-center space-x-2">
            <orderbook-ticker symbol={this.symbol}></orderbook-ticker>
          </div>
        </div>
        <div class="relative group bg-gray-900 py-4 sm:py-4 px-4 flex-auto space-y-2 items-center rounded-md hover:bg-gray-900/80 hover:smooth-hover min-h-96">
          <loading-spinner isLoading={!this.isRunning}>
            <orderbook-scatter symbol={this.symbol}></orderbook-scatter>
          </loading-spinner>
        </div>
        <div class="mb-10 sm:mb-0 mt-5 grid gap-4 grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          <div class="relative group bg-gray-900 py-4 sm:py-4 px-4 flex flex-col space-y-2 items-center rounded-md hover:bg-gray-900/80 hover:smooth-hover w-full min-h-52">
          <loading-spinner isLoading={!this.isRunning}>
            <orderbook-table symbol={this.symbol}></orderbook-table>
          </loading-spinner>
          </div>
          <div class="relative group bg-gray-900 py-4 sm:py-4 px-4 flex flex-col space-y-2 items-center rounded-md hover:bg-gray-900/80 hover:smooth-hover w-full min-h-52">
            <loading-spinner isLoading={!this.isRunning}>
              <orderbook-volume symbol={this.symbol}></orderbook-volume>
            </loading-spinner>
          </div>
        </div>
      </div>,
    ];
  }
}
