import { TRank } from "./utilities"

type TMethod = 'GET' | 'POST'
type TBaseClient2Azure<TMethod, ReqPath, ReqBody, Resp> = {
    requestType: TMethod
    requestPath: ReqPath,
    requestBody: ReqBody,
    response: Resp
}

type TFilter<Base, Condition> = {
    [K in keyof Base]: Base[K] extends Condition ? Base[K] : never
}

type TQueryDelay = TBaseClient2Azure<'GET', never, never, unknown>

type TQueryRank = TBaseClient2Azure<'GET', never, never, TRank>

type TQueryStatus = TBaseClient2Azure<'GET', never, never, unknown>

type TBaseMap = {
    '/query/delay': TQueryDelay
    '/query/rank': TQueryRank
    '/query/status': TQueryStatus
}

export type TClientReqAndRespMap = TFilter<TBaseMap, TBaseClient2Azure<TMethod, any, any, any>>