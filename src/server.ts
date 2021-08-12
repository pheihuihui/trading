import express from "express"
import { handlers } from "./handlers"

const app = express()

app.get('/', function (req, res) {
    res.send('hello')
})

for (const hander of handlers) {
    if (hander.type == 'GET') {
        app.get(hander.name, hander.handler)
    }
    if (hander.type == 'POST') {
        app.post(hander.name, hander.handler)
    }
}

const port = process.env.PORT || 3000
app.listen(port)