type THolding = {
    time_in: Date
    price_in: number
    price_cur: number
    amount: number
}

type THoldings = Record<string, THolding>

type TTrending = Record<number, number>

type TTrendings = Record<string, TTrending>

type TRank = {
    high: TTrendings
    low: TTrendings
}

const _high = process.env['HIGH_RATE'] ?? 0.01
const _low = process.env['LOW_RATE'] ?? - 0.01

const initialTrending: () => TTrending = () => {
    let res = {} as TTrending
    for (const u of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
        res[u] = -1
    }
    return res
}

const newTrending: (pre: TTrending, price?: number) => TTrending = (pre, cur) => {
    let res = {} as TTrending
    for (let u = 0; u < 9; u++) {
        res[u + 1] = pre[u]
    }
    res[0] = cur ?? -1
    return res
}

const initialTrendings: (arr: string[]) => TTrendings = arr => {
    return arr.reduce((pre, cur, i) => {
        pre[cur] = initialTrending()
        return pre
    }, {} as TTrendings)
}

const rate: (trend: TTrending) => number = trend => {
    if (trend[9] != -1 && trend[0] != -1) {
        return trend[0] / trend[9] - 1
    } else {
        return -1
    }
}

const ranking: (trends: TTrendings) => TRank = trends => {
    let keys = Object.keys(trends)
    let high = keys.reduce((pre, cur, i) => {
        if (rate(trends[cur]) > _high) {
            pre[cur] = trends[cur]
        }
        return pre
    }, {} as TTrendings)
    let low = keys.reduce((pre, cur, i) => {
        let rt = rate(trends[cur])
        if (rt < _low && rt > -1) {
            pre[cur] = trends[cur]
        }
        return pre
    }, {} as TTrendings)
    return {
        high: high,
        low: low
    }
}

export class Bot {

    private trendings: TTrendings

    constructor(symbols: string[]) {
        this.trendings = initialTrendings(symbols)
    }

    recieve(data: { symbol: string, price: number }[]) {
        data.forEach(x => {
            let pre = this.trendings[x.symbol]
            this.trendings[x.symbol] = newTrending(pre, x.price)
        })
        let rank = ranking(this.trendings)
        console.log(rank)
    }

}
