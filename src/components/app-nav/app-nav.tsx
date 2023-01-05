import { Component, h, State } from '@stencil/core';
import { Subscription } from 'rxjs';
import { OrderbookRegistry } from '../../services/orderbook-service';

@Component({
  tag: 'app-nav',
  styleUrl: 'app-nav.css',
  shadow: true,
})
export class AppNav {
  watchedSymbolsSubscription: Subscription;
  @State() watchedSymbols: string[] = [];

  connectedCallback() {
    this.watchedSymbolsSubscription = OrderbookRegistry.symbols.subscribe(sym => {
      this.watchedSymbols = sym;
    });
  }

  disconnectedCallback() {
    if (this.watchedSymbolsSubscription) {
      this.watchedSymbolsSubscription.unsubscribe();
    }
  }


  render() {
    return (
      <nav class="nav-item-container">
        <stencil-route-link activeClass="nav-item-active" class="nav-item" anchorClass="nav-item-anchor" exact={true} url="/">
          <svg xmlns="http://www.w3.org/2000/svg" class="nav-item-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
          </svg>
        </stencil-route-link>

        {this.watchedSymbols.map(symbol => (
          <stencil-route-link activeClass="nav-item-active" class="nav-item" anchorClass="nav-item-anchor" exact={true} url={`/orderbook/${symbol.replace('/', '-')}`}>
            {symbol}
          </stencil-route-link>
        ))}
      </nav>
    );
  }
}
