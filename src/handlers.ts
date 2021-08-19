import express from "express"
import { usdt_bot } from "./bot"
import { TClientReqAndRespMap } from "./meta"
import { testDelay } from "./utilities"

type THandlerInfo<T extends keyof TClientReqAndRespMap> = {
    name: T,
    type: TClientReqAndRespMap[T]['requestType'],
    handler: (req: express.Request<TClientReqAndRespMap[T]['requestPath'], {}, TClientReqAndRespMap[T]['requestBody']>, res: express.Response<TClientReqAndRespMap[T]['response']>) => void
}

const query_server_delay: THandlerInfo<'/query/delay'> = {
    name: '/query/delay',
    type: 'GET',
    handler: async (req, res) => {
        let ret = await testDelay()
        res.json(ret)
    }
}

const query_ranking: THandlerInfo<'/query/rank'> = {
    name: '/query/rank',
    type: 'GET',
    handler: (req, res) => {
        let ret = usdt_bot.rank()
        res.json(ret)
    }
}

const query_status: THandlerInfo<'/query/status'> = {
    name: '/query/status',
    type: 'GET',
    handler: (req, res) => {
        let ret = usdt_bot.status()
        res.json(ret)
    }
}

export const handlers: THandlerInfo<any>[] = [
    query_server_delay,
    query_ranking,
    query_status
]