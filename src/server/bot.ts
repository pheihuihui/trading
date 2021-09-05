import { CronJob } from 'cron'
import { hb } from './hb'
import { TTrendings, THoldingState, TRank, THolding } from '../meta'
import {
    added,
    initialTrending,
    initialTrendings,
    newTrending,
    ranking,
    removed,
    _floor,
    log
} from "../utilities"

export class Bot {

    private quote: string
    private symbols: string[]
    private trendings: TTrendings
    private state: THoldingState
    private prices: Record<string, number>
    private ranks: TRank

    private _unit: number
    private _high: number
    private _low: number
    private _reserved: number

    private schedule_updateSymbols: CronJob
    private schedule_updateOrdersStatus: CronJob
    private schedule_updateHoldings: CronJob
    private updating_trendings: boolean

    constructor(quote: string) {
        this.quote = quote
        this.symbols = []
        this.trendings = {}
        this.prices = {}
        this.ranks = {}
        this.state = {
            reserved: 0,
            holdings: {}
        }

        let unit = process.env['UNIT']
        let high = process.env['HIGH']
        let low = process.env['LOW_RATE']
        let reserved = process.env['RESERVED']
        this._unit = unit ? Number(unit) : 10
        this._high = high ? Number(high) : 0.015
        this._low = low ? Number(low) : -0.009
        this._reserved = reserved ? Number(reserved) : 15

        this.schedule_updateSymbols = new CronJob('0 50 * * * *', () => {
            this.updateSymbols()
        }, null, false)
        this.schedule_updateOrdersStatus = new CronJob('*/5 * * * * *', () => {
            this.queryOrders()
        }, null, false)
        this.schedule_updateHoldings = new CronJob('*/3 * * * * *', () => {
            this.updateHoldings()
        }, null, false)
        this.updating_trendings = false
    }

    status() {
        return {
            quote: this.quote,
            symbols: this.symbols,
            holdings: this.state,
            parameters: {
                UNIT: this._unit,
                HIGH: this._high,
                LOW: this._low,
                RESERVED: this._reserved
            }
        }
    }

    getRanks() {
        return this.ranks
    }

    start() {
        this.fetchSymbols(this.quote)
            .then(x => {
                this.symbols = x
                this.trendings = initialTrendings(this.symbols)
                return this.fetchHoldings()
            })
            .then(x => {
                this.state = {
                    holdings: {},
                    reserved: x.reserved
                }
                this.schedule_updateSymbols.start()
                this.schedule_updateOrdersStatus.start()
                this.schedule_updateHoldings.start()
                this.updating_trendings = true
                this.updateTrendings()
            })
    }

    stop() {
        this.schedule_updateSymbols.stop()
        this.updating_trendings = false
    }

    updateParameters(paras: { unit?: number, high?: number, low?: number, reserved?: number }) {
        if (paras.unit) this._unit = paras.unit
        if (paras.high) this._high = paras.high
        if (paras.low) this._low = paras.low
        if (paras.reserved) this._reserved = paras.reserved
    }

    private async fetchSymbols(quote: string) {
        let markets = await hb.fetchMarkets()
        return markets
            .filter(z => z.quote == quote)
            .filter(z => z.info['api-trading'] == 'enabled')
            .map(z => z.symbol)
    }

    private updateSymbols() {
        this.fetchSymbols(this.quote)
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

    private async fetchHoldings() {
        return Promise.all([hb.fetchBalance(), hb.fetchTickers(this.symbols)])
            .then(vals => {
                let quoteAmt = vals[0][this.quote].free
                let hlds = {} as Record<string, [number, number]>
                let tcks = vals[1]
                for (const u of this.symbols) {
                    let tck = tcks[u]
                    if (tck && tck.close) {
                        let cls = tck.close
                        let base = u.split('/')[0]
                        let amt = vals[0][base]
                        if (amt && amt.free) {
                            let prc = cls * amt.free
                            if (prc > this._unit / 5) {
                                hlds[base] = [amt.free, prc]
                            }
                        }
                    }
                }
                let res = {
                    reserved: quoteAmt,
                    holdings: hlds
                }
                console.log(res)
                return res
            })
    }

    @log
    private updateHoldings() {
        let ks = Object.keys(this.state.holdings)
        hb.fetchBalance()
            .then(x => {
                let q = x[this.quote].free
                if (q) {
                    this.state.reserved = q
                }
                for (const k of ks) {
                    let fr = x[k]?.free
                    if (fr) {
                        this.state.holdings[k].amount = fr
                    }
                }
            })
            .then(() => {
                this.restoreReserved()
            })
    }

    private async updateTrendings() {
        console.log(this.updating_trendings)
        while (this.updating_trendings) {
            console.log('hi')
            this.trade()
            await this._updateTrendings()
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
                let len = Object.keys(rk).length
                console.log(rk[0])
                console.log(rk[len - 1])
            }, rej => {
                console.error(rej)
            })
    }

    private restoreReserved() {
        if (this.state.reserved < this._reserved) {
            let ks = Object.keys(this.ranks).map(x => Number(x))
            let ks2 = Object.keys(this.state.holdings)
            let len = ks.length
            let res: string | undefined
            for (let u = len - 1; u >= 0; u--) {
                let sb = this.ranks[u].symbol
                let curr = sb.split('/')[0]
                if (ks2.includes(curr)) {
                    res = curr
                    break
                }
            }
            if (res) {
                this.sell(res)
            }
        }
    }

    private trade() {
        let ks = Object.keys(this.ranks).map(x => Number(x))
        for (const u of ks) {
            let rt = this.ranks[u].rate
            let sb = this.ranks[u].symbol
            if (rt > this._high) {
                if (this.state.holdings[sb] == undefined) {
                    let curr = sb.split('/')[0]
                    this.buy(curr)
                }
            } else if (rt < this._low) {
                if (this.state.holdings[sb]) {
                    let curr = sb.split('/')[0]
                    this.sell(curr)
                }
            }
        }
    }

    @log
    private buy(curr: string) {
        let sb = curr + '/' + this.quote
        if (!this.state.holdings[curr]) {
            this.state.holdings[curr] = {} as THolding
        }
        this.state.holdings[curr].status = 'buying'
        hb.createMarketOrder(sb, 'buy', this._unit)
            .then(x => {
                this.state.holdings[curr].orderID = x.id
            }, y => {
                console.log(y)
            })
    }

    @log
    private sell(curr: string) {
        let sb = curr + '/' + this.quote
        let amt = this.state.holdings[curr].amount
        this.state.holdings[curr].status = 'selling'
        if (amt) {
            let _amt = _floor(amt)
            hb.createMarketOrder(sb, 'sell', _amt)
                .then(x => { }, y => {
                    console.log(y)
                })
        }
    }

    @log
    private queryOrders() {
        let currs = Object.keys(this.state.holdings)
        for (const cur of currs) {
            let _cur = this.state.holdings[cur]
            let stt = _cur.status
            let id = _cur.orderID
            let sb = cur + '/' + this.quote
            if (id) {
                switch (stt) {
                    case 'buying':
                        hb.fetchOrder(id, sb)
                            .then(x => {
                                if (x.status == 'closed') _cur.status = 'holding'
                                if (x.status == 'canceled') { delete this.state.holdings[cur] }
                            })
                        break
                    case 'selling':
                        hb.fetchOrder(id, sb)
                            .then(x => {
                                if (x.status == 'closed') _cur.status = 'sold'
                            })
                        break
                    case 'sold':
                        delete this.state.holdings[cur]
                        break
                    default:
                        break
                }
            }
        }
    }
}
