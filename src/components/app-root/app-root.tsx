import { Component, h, State } from '@stencil/core';
import { Subscription } from 'rxjs';
import { OrderbookRegistry } from '../../services/orderbook-service';
import { APP_VERSION } from '../../version';
@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: true,
})
export class AppRoot {
  watchedSymbolsSubscription: Subscription;
  @State() watchedSymbols: string[] = [];

  connectedCallback() {
    document.title = "OrderWatch " + APP_VERSION; 
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
      <div class="app-wrapper">
        <div class="app-grid">
          <div class="app-nav-container">
            <app-nav></app-nav>
          </div>
          <div class="app-page-container">
            <stencil-router>
              <stencil-route-switch scrollTopOffset={0}>
                <stencil-route url="/" component="app-home" exact={true} />
                <stencil-route url="/orderbook/:symbol" component="app-orderbook" exact={true} />
              </stencil-route-switch>
            </stencil-router>
          </div>
        </div>
      </div>
    );
  }
}
