
declare global {
    interface Window {
      ccxt: any;
    }
  }
  
  class exchangeService {
    exchange: any;
    constructor() {
      this.exchange = new window.ccxt.pro.kucoin({ enableRateLimit: true });
      console.log(this.exchange)
      this.exchange.loadMarkets();
    }
    getExchange():any{
        return this.exchange;
    }
    getName():string{
      return this.getExchange().name;
    }

    getLogoUrl():string{
      return this.getExchange().urls.logo;
    }
  }
  
  export const ExchangeService = new exchangeService();
  