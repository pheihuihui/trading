import { huobipro } from "ccxt"
import { existsSync, readFileSync } from "fs"
import { EOL } from "os"

export async function testDelay() {
    let time1 = Date.now()
    let resp = await hb.fetchTicker('DOGE/USDT')
    let time2 = resp.timestamp
    let time3 = Date.now()
    return {
        responseSent: time2 - time1,
        responseReceived: time3 - time1
    }
}

export type THolding = {
    time_in: Date
    price_in: number
    price_cur: number
    amount: number
}

export type THoldings = Record<string, THolding>

export type THoldingState = {
    reserved: number
    holdings: THoldings
}

export type TTrending = Record<number, number>

export type TTrendings = Record<string, TTrending>

export type TRank = Record<number, {
    symbol: string
    rate: number
}>

export const initialTrending: () => TTrending = () => {
    let res = {} as TTrending
    for (const u of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
        res[u] = -1
    }
    return res
}

export const newTrending: (pre: TTrending, price?: number) => TTrending = (pre, cur) => {
    let res = {} as TTrending
    for (let u = 0; u < 9; u++) {
        res[u + 1] = pre[u]
    }
    res[0] = cur ?? -1
    return res
}

export const initialTrendings: (arr: string[]) => TTrendings = arr => {
    return arr.reduce((pre, cur, i) => {
        pre[cur] = initialTrending()
        return pre
    }, {} as TTrendings)
}

export const rate: (trend: TTrending) => number = trend => {
    if (trend[9] != -1 && trend[0] != -1) {
        return trend[0] / trend[9] - 1
    } else {
        return -1
    }
}

export const ranking: (trends: TTrendings) => TRank = trends => {
    let keys = Object.keys(trends)
    let sorted = keys.sort((a, b) => {
        let aa = rate(trends[a])
        let bb = rate(trends[b])
        return bb - aa
    })
    let res: TRank = {}
    sorted.forEach((v, i) => {
        let rt = rate(trends[v])
        if (rt != -1) {
            res[i] = {
                symbol: v,
                rate: rate(trends[v])
            }
        }
    })
    return res
}

function getKeys() {
    let txt = 'C:\\Users\\optim\\Desktop\\key.txt'
    if (existsSync(txt)) {
        let buff = readFileSync('C:\\Users\\optim\\Desktop\\key.txt')
        let accessKey = buff.toString().split(EOL)[0].split('::')[1]
        let secretKey = buff.toString().split(EOL)[1].split('::')[1]
        return {
            access: accessKey,
            secret: secretKey
        }
    } else {
        return {
            access: 'accessKey',
            secret: 'secretKey'
        }
    }
}

const _keys = getKeys()

const keys = {
    access: process.env['ACCESS'] ?? _keys.access,
    secret: process.env['SECRET'] ?? _keys.secret
}

export const hb = new huobipro({
    apiKey: keys.access,
    secret: keys.secret
})

export async function fetchSymbols(quote: string) {
    let markets = await hb.fetchMarkets()
    return markets
        .filter(z => z.quote == quote)
        .filter(z => z.info['api-trading'] == 'enabled')
        .map(z => z.symbol)
}

export async function fetchReserved() {
    return hb.fetchBalance()
        .then(x => x['USDT'].free)
}

export const added = <T>(prevArr: Array<T>, newArr: Array<T>) => {
    let res: Array<T> = []
    for (const u of newArr) {
        if (prevArr.findIndex(x => x == u) == -1) res.push(u)
    }
    return res
}

export const removed = <T>(prevArr: Array<T>, newArr: Array<T>) => {
    let res: Array<T> = []
    for (const u of prevArr) {
        if (newArr.findIndex(x => x == u) == -1) res.push(u)
    }
    return res
}