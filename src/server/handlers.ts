import express from "express"
import { Bot } from "./bot"
import { TClientReqAndRespMap } from "../meta"

type THandlerInfo<T extends keyof TClientReqAndRespMap> = {
    name: T,
    type: TClientReqAndRespMap[T]['requestType'],
    handler: (bot: Bot)
        => (req: express.Request<TClientReqAndRespMap[T]['requestPath'], {}, TClientReqAndRespMap[T]['requestBody']>,
            res: express.Response<TClientReqAndRespMap[T]['response']>)
            => void
}

const query_ranking: THandlerInfo<'/query/rank'> = {
    name: '/query/rank',
    type: 'GET',
    handler: bot => (req, res) => {
        let ret = bot.getRanks()
        res.json(ret)
    }
}

const query_status: THandlerInfo<'/query/status'> = {
    name: '/query/status',
    type: 'GET',
    handler: bot => (req, res) => {
        let ret = bot.status()
        res.json(ret)
    }
}

const query_holdings: THandlerInfo<'/query/holdings'> = {
    name: '/query/holdings',
    type: 'GET',
    handler: bot => (req, res) => {
        let ret = bot.status()?.holdings
        res.json(ret)
    }
}

const query_tops: THandlerInfo<'/query/tops'> = {
    name: '/query/tops',
    type: 'GET',
    handler: bot => (req, res) => {
        let ret = bot.tops()
        res.json(ret)
    }
}

const clear_tops: THandlerInfo<'/clear/tops'> = {
    name: '/clear/tops',
    type: 'POST',
    handler: bot => (req, res) => {
        bot.clearTops()
        res.sendStatus(200)
    }
}

export const handlers: THandlerInfo<any>[] = [
    query_ranking,
    query_status,
    query_holdings,
    query_tops,
    clear_tops
]