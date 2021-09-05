import { TTrending, TTrendings, TRank } from "./meta"

export const initialTrending: () => TTrending = () => {
    let res = {} as TTrending
    for (const u of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
        res[u] = { ts: 0, price: -1 }
    }
    return res
}

export const newTrending: (pre: TTrending, ts: number, price: number) => TTrending = (pre, ts, price) => {
    let res = {} as TTrending
    for (let u = 0; u < 9; u++) {
        res[u + 1] = pre[u]
    }
    res[0] = { ts: ts, price: price }
    return res
}

export const initialTrendings: (arr: string[]) => TTrendings = arr => {
    return arr.reduce((pre, cur, i) => {
        pre[cur] = initialTrending()
        return pre
    }, {} as TTrendings)
}

export const rate: (trend: TTrending) => number = trend => {
    let _9 = trend[9]
    let _0 = trend[0]
    if (_9.ts != -1 && _0.ts != -1) {
        let gap = _0.ts - _9.ts
        if (gap != 0) {
            return _0.price / _9.price - 1
        }
    }
    return -1
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
                rate: rt
            }
        }
    })
    return res
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

export const _floor: (val: number) => number = val => {
    if (val > 1) {
        return Math.floor(val)
    } else {
        return _floor(val * 10) / 10
    }
}

export function log(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
        console.log(`${originalMethod.name}(${args.join(', ')})`)
    }
    return descriptor
}