import { huobipro } from 'ccxt'
import { Bot } from './bot'
import { existsSync, readFileSync } from 'fs'
import { EOL } from 'os'

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

async function getAllQuotes() {
    let market = await hb.loadMarkets()
    let keys = Object.keys(market)
    let quotes = keys.map(k => k.split('/')[1]).reduce((pre, cur, i) => {
        let ret = pre.add(cur)
        return ret
    }, new Set<string>())
    return quotes
}

async function getSymbols(quote: string) {
    let market = await hb.loadMarkets()
    let keys = Object.keys(market)
    let arr = keys.filter(x => x.split('/')[1] == quote)
    return arr
}

async function run() {
    let arr = await getSymbols('USDT')
    let bot = new Bot(arr)
    setInterval(async function name() {
        let tickers = await hb.fetchTickers(arr)
        let res = arr.map(x => {
            return {
                symbol: x,
                price: tickers[x]?.close ?? -1
            }
        })
        let _res = res.filter(x => x.price != -1)
        bot.recieve(_res)
    }, 1000)
}

// hb.fetchBalance().then(x => console.log(x))

// hb.options['createMarketBuyOrderRequiresPrice'] = false
// hb.createMarketOrder('DOGE/USDT', 'buy', 40).then(x => console.log(x))

