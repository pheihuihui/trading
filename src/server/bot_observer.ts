import { initialTrendings, newTrending, ranking, _sleep } from "../utilities"
import { Bot } from "./bot"
import { hb } from "./hb"

class ObserverBot extends Bot {

    private updating_trendings: boolean
    private high_rates: Array<{ ts: number, symbol: string, rate: number }>

    constructor(quote: string) {
        super(quote)
        this._high = 0.02
        this.updating_trendings = false
        this.high_rates = []
    }

    status(): string {
        return 'hello world'
    }

    start(): void {
        this.updating_trendings = true
        this.fetchSymbols('USDT')
            .then(x => {
                this.symbols = x
                this.trendings = initialTrendings(x)
            })
            .then(() => this.startUpdateTrendings())
    }

    stop(): void {
        throw new Error("Method not implemented.");
    }

    updateParameters(paras: unknown): void {
        throw new Error("Method not implemented.");
    }

    private async fetchSymbols(quote: string) {
        let markets = await hb.fetchMarkets()
        return markets
            .filter(z => z.quote == quote)
            .filter(z => z.info['api-trading'] == 'enabled')
            .map(z => z.symbol)
    }

    private async startUpdateTrendings() {
        while (this.updating_trendings) {
            console.log('tick')
            await this._updateTrendings()
            await _sleep(2000)
        }
    }

    private async _updateTrendings() {
        return hb.fetchTickers(this.symbols)
            .then(tcks => {
                let arr = Object.keys(tcks)
                for (const k of arr) {
                    let tck = tcks[k]
                    let np = tck.close
                    if (np) {
                        this.prices[k] = np
                        this.trendings[k] = newTrending(this.trendings[k], tck.timestamp, np)
                    } else {
                        this.prices[k] = -1
                        this.trendings[k] = newTrending(this.trendings[k], tck.timestamp, -1)
                    }
                }
                let rk = ranking(this.trendings)
                this.ranks = rk
                for (const key in rk) {
                    if (Object.prototype.hasOwnProperty.call(rk, key)) {
                        const element = rk[key];
                        if (element.rate > this._high) {
                            this.high_rates.push({ ts: Date.now(), symbol: element.symbol, rate: element.rate })
                        }
                    }
                }
            }, rej => {
                console.error(rej)
            })
    }

    tops() {
        return this.high_rates.sort((a, b) => b.rate - a.rate)
    }

    clearTops() {
        this.high_rates = []
    }

}

export const observer = new ObserverBot('USDT')
