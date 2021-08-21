import { CronJob } from 'cron'
import {
    added,
    fetchReserved,
    fetchSymbols,
    hb,
    initialTrending,
    initialTrendings,
    newTrending,
    ranking,
    removed,
    THoldingState,
    TTrendings
} from "./utilities"

export class Bot {

    private quote: string
    private symbols: string[]
    private trendings: TTrendings
    private state: THoldingState
    private delay: number

    private _unit = process.env['UNIT'] ?? 10
    private _high = process.env['HIGH_RATE'] ?? 0.01
    private _low = process.env['LOW_RATE'] ?? - 0.005
    private _reserved = process.env['RESERVED'] ?? 15

    private schedule_updateSymbols: CronJob
    private schedule_updateTrendings: CronJob
    private schedule_trade: CronJob

    constructor(quote: string) {
        this.quote = quote
        this.symbols = []
        this.trendings = {}
        this.delay = -1
        this.state = {
            reserved: 0,
            holdings: {}
        }

        this.schedule_updateSymbols = new CronJob('1 0 * * * *', () => {
            this.updateSymbols()
        }, null, false)
        this.schedule_updateTrendings = new CronJob('* * * * * *', () => {
            this.updateTrendings()
        }, null, false)
        this.schedule_trade = new CronJob('* * * * * *', () => {

        }, null, false)
    }

    status() {
        return {
            quote: this.quote,
            symbols: this.symbols,
            holdings: this.state,
            Parameters: {
                UNIT: this._unit,
                HIGH: this._high,
                LOW: this._low,
                RESERVED: this._reserved
            }
        }
    }

    rank() {
        let rk = ranking(this.trendings)
        return rk
    }

    getDelay() {
        return this.delay
    }

    start() {
        fetchSymbols(this.quote)
            .then(x => {
                this.symbols = x
                this.trendings = initialTrendings(this.symbols)
                return fetchReserved()
            })
            .then(x => {
                this.state = {
                    holdings: {},
                    reserved: x
                }
                // this.schedule_updateSymbols.start()
                this.schedule_updateTrendings.start()
                // this.schedule_trade.start()
            })
    }

    stop() {
        this.schedule_updateSymbols.stop()
        this.schedule_updateTrendings.stop()
        this.schedule_trade.stop()
    }

    updateParameters(paras: { unit?: number, high?: number, low?: number, reserved?: number }) {
        if (paras.unit) this._unit = paras.unit
        if (paras.high) this._high = paras.high
        if (paras.low) this._low = paras.low
        if (paras.reserved) this._reserved = paras.reserved
    }

    private updateSymbols() {
        fetchSymbols(this.quote)
            .then(x => {
                let newSymbols = added(this.symbols, x)
                let removedSymbols = removed(this.symbols, x)
                for (const u of newSymbols) {
                    this.trendings[u] = initialTrending()
                }
                for (const u of removedSymbols) {
                    delete this.trendings[u]
                }
            })
    }

    private updateTrendings() {
        Promise.all([Date.now(), hb.fetchTickers(this.symbols)])
            .then(vals => {
                let ts = vals[0]
                let x = vals[1]
                let arr = Object.keys(x)
                let _ts = x['BTC/USDT'].timestamp
                this.delay = _ts - ts
                for (const k of arr) {
                    let ticker = x[k]
                    let newprice = ticker.close
                    this.trendings[k] = newTrending(this.trendings[k], newprice)
                }
            })
    }

    private restoreReserved() {
        if (this.state.reserved < this._reserved) {

        }
    }

    private sell() {

    }

    private buy() {

    }

    private _buy(symbol: string) {

    }

    private _sell(symbol: string) {

    }

}

export const usdt_bot = new Bot('USDT')
usdt_bot.start()