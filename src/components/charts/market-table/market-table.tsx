import { Component, h, State, Prop } from '@stencil/core';
import { Subscription } from 'rxjs';
import { MarketService, OrderBookTicker } from '../../../services/market-service';
import { injectHistory, RouterHistory } from '@stencil-community/router';
import { FormatterService } from '../../../services/formatter-service';

declare type TickerData = {
  coins: any[];
  ticker: any;
};

@Component({
  tag: 'market-table',
  styleUrl: 'market-table.css',
  shadow: true,
})
export class MarketTable {
  @Prop() history: RouterHistory;
  @State() tickerData: OrderBookTicker[] = [];
  @State() searchText: string = '';
  @State() onlyUSDT: boolean = false;
  watchSubscription: Subscription;

  connectedCallback() {
    this.watchSubscription = MarketService.GetOrderbookTickers().subscribe(tickers => {
      this.tickerData = tickers;
    });
  }

  disconnectedCallback() {
    if (this.watchSubscription) {
      this.watchSubscription.unsubscribe();
    }
  }

  getTable(coins: OrderBookTicker[], onlyUSDT: boolean, search?: string) {
    const ranked = coins.map((coin, idx) => {
      return { idx: idx + 1, coin };
    });

    let renderCoins = search && search.length > 2 ? ranked.filter(c => c.coin.symbol.toLowerCase().includes(search.toLowerCase())) : ranked;
    renderCoins = onlyUSDT ? renderCoins.filter(c => c.coin.symbol.toLowerCase().includes('usdt')) : renderCoins;

    return (
      <loading-spinner class="overflow-auto scrollbar app-scrollbar relative max-h-96 h-96" isLoading={coins.length == 0}>
        <table class="m-table">
          <thead class="border-b">
            <tr>
              <th scope="col" class="m-table-header-col text-left">
                #
              </th>
              <th scope="col" class="m-table-header-col text-left">
                Market
              </th>
              <th scope="col" class="m-table-header-col text-right">
                Price
              </th>
              <th scope="col" class="m-table-header-col text-center">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {renderCoins.map(rank => (
              <tr class="m-table-body-row" onClick={() => this.route(rank.coin.symbol)}>
                <td class="m-table-body-row-col text-left"> {rank.idx} </td>
                <td class="m-table-body-row-col text-left">
                  <span class="text-white">{rank.coin.symbol}</span>
                </td>
                <td class="m-table-body-row-col text-right">
                  {FormatterService.formatBaseCurrency(rank.coin.symbol, MarketService.priceToPrecision(rank.coin.symbol, rank.coin.last))}
                </td>
                <td class="m-table-body-row-col text-left">
                  <span class={`m-table-percent ${rank.coin.percentage > 0 ? 'm-table-percent-gainer' : 'm-table-percent-loser'}`}>{rank.coin.percentage.toFixed(2)} %</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </loading-spinner>
    );
  }

  route(symbol: string) {
    this.history.replace('/orderbook/' + symbol.replace('/', '-'), {});
  }

  onOnlyUSDT() {
    this.onlyUSDT = !this.onlyUSDT;
  }

  onSearchChanged(event) {
    this.searchText = event.target.value;
  }

  render() {
    const gainers = this.tickerData.filter(c => c.percentage > 0).sort((a, b) => b.percentage - a.percentage);
    const losers = this.tickerData.filter(c => c.percentage < 0).sort((a, b) => a.percentage - b.percentage);

    return (
      <div>
        <div class="flex justify-between items-center pb-4">
          <div class="font-extralight text-white/50"></div>
          <div class="inline-flex items-center space-x-2">
            <div>
              <label class="relative inline-flex items-center cursor-pointer my-2">
              <input onChange={() => this.onOnlyUSDT()} defaultChecked={this.onlyUSDT} type="checkbox" class="sr-only peer" />
                <div class="w-9 h-5 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 peer-focus:ring-blue-800 rounded-full peer bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all border-gray-600 peer-checked:bg-blue-600"></div>
                <span class="ml-3 text-sm font-medium text-white/50">Only USDT</span>
              </label>
            </div>
            <div>
              <div>
                  <label class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        aria-hidden="true"
                        class="w-5 h-5 text-gray-500 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </div>
                    <input type="search" value={this.searchText} onInput={(event) => this.onSearchChanged(event)} id="default-search" class="search-input" placeholder='Search...' required />
                  </div>
              </div>
            </div>
          </div>
        </div>
        <div class="grid gap-4 grid-cols-2 xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          <div class="card group">
            <p class="card-title">Gainers</p>
            {this.getTable(gainers, this.onlyUSDT, this.searchText)}
          </div>
          <div class="card group">
            <p class="card-title">Losers</p>
            {this.getTable(losers, this.onlyUSDT, this.searchText)}
          </div>
        </div>
      </div>
    );
  }
}
injectHistory(MarketTable);
