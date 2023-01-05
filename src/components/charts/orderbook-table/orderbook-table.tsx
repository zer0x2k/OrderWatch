import { Component, h, Prop, State, Watch } from '@stencil/core';
import { Subscription } from 'rxjs';
import { FormatterService } from '../../../services/formatter-service';
import { OrderbookRegistry, OrderBook, getEmptyOrderBook } from '../../../services/orderbook-service';

@Component({
  tag: 'orderbook-table',
  styleUrl: 'orderbook-table.css',
  shadow: true,
})
export class OrderbookTable {
  @Prop() symbol: string;
  watchSubscription: Subscription;

  @State() orderbook: OrderBook = getEmptyOrderBook();

  connectedCallback() {
    if (this.watchSubscription) {
      this.watchSubscription.unsubscribe();
    }
    const orderBookService = OrderbookRegistry.tryGetService(this.symbol);
    this.watchSubscription = orderBookService.GetOrderbook().subscribe(orderbook => {
      this.orderbook = orderbook;
    });
  }

  disconnectedCallback() {
    if (this.watchSubscription) {
      this.watchSubscription.unsubscribe();
    }
    this.orderbook = getEmptyOrderBook();
  }

  @Watch('symbol')
  watchMatch() {
    this.disconnectedCallback();
    this.connectedCallback();
  }

  getTable(orders: any[], size: number = 10) {
    return (
      <div>
        <table class="min-w-full">
          <thead class="border-b">
            <tr>
              <th scope="col" class="text-sm font-medium text-white/50 text-left">
                Price
              </th>
              <th scope="col" class="text-sm font-medium text-white/50 text-right">
                Amount 
              </th>
            </tr>
            <tr>
              <th scope="col" class="text-sm font-medium text-white/50 py-4 text-left">
                {FormatterService.getBaseCurrency(this.symbol)}
              </th>
              <th scope="col" class="text-sm font-medium text-white/50 py-4 text-right">
                {FormatterService.getCurrency(this.symbol)}
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, size).map(order => (
              <tr>
                <td class="whitespace-nowrap text-xs font-light text-white/50 py-1 text-left">{this.orderbook.priceToPrecision(order[0])}</td>
                <td class="whitespace-nowrap text-xs font-light text-white/50 py-1 text-right">{this.orderbook.amountToPrecision(order[1])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    return (
      <div class="inline-flex items-center space-x-2 w-full">
        <div class="w-full">
          <h4 class="text-blue-500 text-2xl font-bold capitalize text-center">Bids</h4>
          {this.getTable(this.orderbook.bids)}
        </div>
        <div class="w-full">
          <h4 class="text-red-500 text-2xl font-bold capitalize text-center">Asks</h4>
          {this.getTable(this.orderbook.asks)}
        </div>
      </div>
    );
  }
}
