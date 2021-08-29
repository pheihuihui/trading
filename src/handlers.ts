import express from "express"
import { Bot } from "./bot"
import { TClientReqAndRespMap } from "./meta"

export const bot_usdt = new Bot('USDT')

type THandlerInfo<T extends keyof TClientReqAndRespMap> = {
    name: T,
    type: TClientReqAndRespMap[T]['requestType'],
    handler: (req: express.Request<TClientReqAndRespMap[T]['requestPath'], {}, TClientReqAndRespMap[T]['requestBody']>, res: express.Response<TClientReqAndRespMap[T]['response']>) => void
}

const query_ranking: THandlerInfo<'/query/rank'> = {
    name: '/query/rank',
    type: 'GET',
    handler: (req, res) => {
        let ret = bot_usdt.getRanks()
        res.json(ret)
    }
}

const query_status: THandlerInfo<'/query/status'> = {
    name: '/query/status',
    type: 'GET',
    handler: (req, res) => {
        let ret = bot_usdt.status()
        res.json(ret)
    }
}

export const handlers: THandlerInfo<any>[] = [
    query_ranking,
    query_status
]