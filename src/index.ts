import { huobipro, kraken } from 'ccxt'
import { Bot } from './bot'
import { readFileSync } from 'fs'
import { EOL } from 'os'

function getKeys() {
    let buff = readFileSync('C:\\Users\\optim\\Desktop\\key.txt')
    let accessKey = buff.toString().split(EOL)[0].split('::')[1]
    let secretKey = buff.toString().split(EOL)[1].split('::')[1]
    return {
        access: accessKey,
        secret: secretKey
    }
}

const keys = getKeys()

const hb = new huobipro({
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


async function testDelay() {
    let time1 = Date.now()
    let resp = await hb.fetchTicker('DOGE/USDT')
    let time2 = resp.timestamp
    let time3 = Date.now()
    console.log(time2 - time1)
    console.log(time3 - time1)
    console.log('------')
}

testDelay()