import { huobipro } from "ccxt"
import { existsSync, readFileSync } from "fs"
import { EOL } from "os"

function getKeys() {
    let txt = 'D:\\key.txt'
    if (existsSync(txt)) {
        let buff = readFileSync('D:\\key.txt')
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
    secret: keys.secret,
    options: {
        createMarketBuyOrderRequiresPrice: false
    }
})
