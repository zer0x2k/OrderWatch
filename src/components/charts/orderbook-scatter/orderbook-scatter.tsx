import { Component, h, Prop, Watch } from '@stencil/core';
import { OrderbookRegistry } from '../../../services/orderbook-service';
import Chart from 'chart.js/auto';
import { Subscription } from 'rxjs';
import { getChartConfig } from './orderbook-scatter-chart';

@Component({
  tag: 'orderbook-scatter',
  styleUrl: 'orderbook-scatter.css',
  shadow: true,
})
export class OrderbookScatter {
  @Prop() symbol: string;
  chartConfigChanged: boolean = false;
  invertAxes: boolean = false;
  watchSubscription: Subscription;
  containerRef?: HTMLCanvasElement;
  private chart: Chart;

  connectedCallback() {
    const orderBookService = OrderbookRegistry.tryGetService(this.symbol);
    this.watchSubscription = orderBookService.GetOrderbook().subscribe(async book => {
      if (!this.containerRef) {
        return; // just a fail-safe
      }

      const chartConf = getChartConfig(book, this.invertAxes);
      if (!this.chart) {
        this.chart = new Chart(this.containerRef, chartConf);
        this.chart.resize();
      } else {
        this.chart.data = chartConf.data;
        if (this.chartConfigChanged) {
          this.chart.options = chartConf.options;
          this.chartConfigChanged = false;
        }
        this.chart.update();
      }
    });
  }

  disconnectedCallback() {
    if (this.watchSubscription) {
      this.watchSubscription.unsubscribe();
    }

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  @Watch('symbol')
  watchMatch() {
    this.disconnectedCallback();
    this.connectedCallback();
  }

  onResetZoom() {
    this.chart.resetZoom();
  }

  onInvertAxes() {
    this.invertAxes = !this.invertAxes;
    this.chartConfigChanged = true;
  }

  render() {
    return (
      <div>
        <div class="flex justify-between items-center pb-2">
          <h3 class=" font-extralight text-white/50">Scatter</h3>
          <div class="inline-flex items-center space-x-2">
            <button class="bg-gray-900 text-sm text-white/50 p-2 rounded-md hover:text-white smooth-hover" onClick={()=> this.onResetZoom()}>
              Reset Zoom
            </button>

            <label class="relative inline-flex items-center cursor-pointer">
              <input onChange={() => this.onInvertAxes()} defaultChecked={this.invertAxes} type="checkbox" class="sr-only peer" />
              <div class="w-9 h-5 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 peer-focus:ring-blue-800 rounded-full peer bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all border-gray-600 peer-checked:bg-blue-600"></div>
              <span class="ml-3 text-sm font-medium text-white/50">Invert Axes</span>
            </label>
          </div>
        </div>
        <div class="chart">
          <canvas ref={el => (this.containerRef = el)} />
        </div>
      </div>
    );
  }
}
