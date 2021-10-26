import express from "express"
import { observer } from "./bot_observer"
import { handlers } from "./handlers"

const app = express()
app.use(express.static('./dist/page'))

observer.start()

app.get('/hello', function (req, res) {
    res.json('hello')
})

for (const hander of handlers) {
    if (hander.type == 'GET') {
        app.get(hander.name, hander.handler(observer))
    }
    if (hander.type == 'POST') {
        app.post(hander.name, hander.handler(observer))
    }
}

const port = process.env.PORT || 30000
app.listen(port)

