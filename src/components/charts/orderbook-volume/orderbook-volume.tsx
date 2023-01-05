import { Component, h, Prop, Watch } from '@stencil/core';
import { OrderbookRegistry } from '../../../services/orderbook-service';
import Chart, { ChartConfiguration } from 'chart.js/auto';
import { FormatterService } from '../../../services/formatter-service';
import { Subscription } from 'rxjs';

declare type VolumenData = {
  askVol: number;
  bidVol: number;
};

@Component({
  tag: 'orderbook-volume',
  styleUrl: 'orderbook-volume.css',
  shadow: true,
})
export class OrderbookVolume {
  @Prop() symbol: string;
  watchSubscription: Subscription;
  containerRef?: HTMLCanvasElement;
  private chart: Chart;

  connectedCallback() {
    const orderBookService = OrderbookRegistry.tryGetService(this.symbol);
    this.watchSubscription = orderBookService.$orderbook.subscribe(async book => {
      const askSum = book.asks
        .map(a => parseFloat(a[0]) * parseFloat(a[1]))
        .reduce(function (x, y) {
          return x + y;
        }, 0);

      const bidSum = book.bids
        .map(a => parseFloat(a[0]) * parseFloat(a[1]))
        .reduce(function (x, y) {
          return x + y;
        }, 0);


      let datasets = [
        {
          data: [bidSum, askSum],
          borderWidth: 1,
          backgroundColor: ['rgba(153, 102, 255, 0.2)', 'rgba(255, 99, 132, 0.2)'],
          borderColor: ['rgb(153, 102, 255)', 'rgb(255, 99, 132)'],
        },
      ];

      if (!this.containerRef) {
        return; // just a fail-safe
      }

      if (!this.chart) {
        const chartConfig:ChartConfiguration = {
          type: 'bar',
          data: {
            labels: ['Bid', 'Ask'],
            datasets: datasets,
          },
          options: {
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return FormatterService.formatBaseCurrency(orderBookService.getSymbol(), context.parsed.y.toFixed(2));
                  },
                },
              },
            },
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function (value) {
                    return FormatterService.formatBaseCurrency(orderBookService.getSymbol(), value);
                  },
                },
              },
            },
          },
        };

        this.chart = new Chart(this.containerRef, chartConfig);
        this.chart.resize();
      } else {
        this.chart.options.animation = false;
        this.chart.data.datasets = datasets;
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

  render() {
    return (
      <div class="h-55">
        <h4 class="text-white/50 text-2xl font-bold capitalize text-center">Volume</h4>
        <div class="chart">
          <canvas ref={el => (this.containerRef = el)} />
        </div>
      </div>
    );
  }
}
