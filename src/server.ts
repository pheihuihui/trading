import express from "express"
import { bot_usdt, handlers } from "./handlers"

const app = express()
app.use(express.static('./dist/page'))

// bot_usdt.start()

app.get('/hello', function (req, res) {
    res.json('hello')
})

for (const hander of handlers) {
    if (hander.type == 'GET') {
        app.get(hander.name, hander.handler)
    }
    if (hander.type == 'POST') {
        app.post(hander.name, hander.handler)
    }
}

const port = process.env.PORT || 30000
app.listen(port)