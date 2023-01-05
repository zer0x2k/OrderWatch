import { Component, h } from '@stencil/core';
import {ExchangeService} from '../../services/exchange-service'
@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css',
  shadow: true,
})
export class AppHome {
  render() {
    return [
      <div>
        <div class="header-wrapper">
          <p class="header-title">OrderWatch</p>
          <img alt={ExchangeService.getName()} src={ExchangeService.getLogoUrl()}></img>
        </div>
        <market-table></market-table>
      </div>
    ];
  }
}
