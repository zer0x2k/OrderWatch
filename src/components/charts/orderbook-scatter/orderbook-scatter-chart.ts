import { ChartConfiguration, ScaleOptions } from 'chart.js';
import { FormatterService } from '../../../services/formatter-service';
import { OrderBook } from '../../../services/orderbook-service';

const transformData = (data: any[], reverseScale: boolean) => {
  return data
    .map(a => {
      if (reverseScale) {
        return { x: a[1], y: a[0] };
      }
      return { x: a[0], y: a[1] };
    })
    .filter(a => a.x > 0 && a.y > 0);
};

const getScale = (_symbol: string, _tickFormatter: any): ScaleOptions => {
  return {
    display: true,
    grid:{
      display:true
    },
    border:{
      display:false
    },
    ticks: {
      color: 'hsla(0,0%,100%,.5)',
      callback: function (value) {
        return _tickFormatter(_symbol, value);
      },
    },
  };
};

export const getChartConfig = (orderbook: OrderBook, reverseScale: boolean): ChartConfiguration => {
  const data = [
    {
      label: 'Bid',
      data: transformData(orderbook.bids, reverseScale),
      formatter: (symbol, value) => {
        return FormatterService.formatBaseCurrency(symbol, orderbook.priceToPrecision(value));
      },
    },
    {
      label: 'Ask',
      data: transformData(orderbook.asks, reverseScale),
      formatter: (symbol, value) => {
        return FormatterService.formatCurrency(symbol, orderbook.amountToPrecision(value));
      },
    },
  ];

  if(reverseScale){
    data.reverse();
  }

  return {
    type: 'scatter',
    data: {
      datasets: data.map(d => { return { label: d.label, data: d.data} }),
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        zoom:{
          limits:{
            x: { min: -10 },
            y: { min: -10 }
          },
          pan:{
            enabled: true,
          },
          zoom:{
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true
            },
            mode: 'x',
          }
        },
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              label += FormatterService.formatCurrency(orderbook.symbol, orderbook.amountToPrecision(context.parsed.y));
              label += ', ';
              label += FormatterService.formatBaseCurrency(orderbook.symbol, orderbook.priceToPrecision(context.parsed.x));
              label += ' Vol: ';
              label += FormatterService.formatBaseCurrency(orderbook.symbol, orderbook.priceToPrecision(context.parsed.x * context.parsed.y));
              return label;
            },
          },
        },
      },
      scales: {
        x: getScale(orderbook.symbol, data[0].formatter),
        y: getScale(orderbook.symbol, data[1].formatter),
      },
    },
  };
};
