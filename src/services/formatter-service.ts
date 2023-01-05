class formatterService {
  getCurrency(symbol:string): string {
    return symbol.split('/')[0];
  }

  getBaseCurrency(symbol:string): string {
    return symbol.split('/')[1];
  }

  formatCurrency(symbol:string, value) {
    return `${value} ${this.getCurrency(symbol)}`;
  }

  formatBaseCurrency(symbol:string, value) {
    return `${value} ${this.getBaseCurrency(symbol)}`;
  }
}

export const FormatterService = new formatterService();
