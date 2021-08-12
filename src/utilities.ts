import { hb } from "."

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

testDelay()
.then(x => console.log(x))