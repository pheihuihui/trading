import { TTrendings, THoldingState, TRank } from '../meta'

export abstract class Bot {

    protected quote: string
    protected symbols: string[]
    protected trendings: TTrendings
    protected state: THoldingState
    protected prices: Record<string, number>
    protected ranks: TRank

    protected _unit: number
    protected _high: number
    protected _low: number
    protected _reserved: number

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

    }

    abstract status(): any

    getRanks() {
        return this.ranks
    }

    abstract start(): void

    abstract stop(): void

    abstract updateParameters(paras: any): void

    tops() {

    }

    clearTops() {

    }

}
