export type THolding = {
    time_in?: Date
    price_in?: number
    price_cur?: number
    amount?: number
    trendings: TTrending
    rate: number
    price_all?: number
    orderID?: string
    status?: 'buying' | 'holding' | 'sold' | 'selling'
}

export type THoldings = Record<string, THolding>

export type THoldingState = {
    reserved: number
    holdings: THoldings
}

export type TTrending = Record<number, { ts: number, price: number }>

export type TTrendings = Record<string, TTrending>

export type TRank = Record<number, {
    symbol: string
    rate: number
}>

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

type TQueryHoldings = TBaseClient2Azure<'GET', never, never, THoldingState>

type TBaseMap = {
    '/query/delay': TQueryDelay
    '/query/rank': TQueryRank
    '/query/status': TQueryStatus
    '/query/holdings': TQueryHoldings
    '/query/tops': any
    '/clear/tops': any
}

export type TClientReqAndRespMap = TFilter<TBaseMap, TBaseClient2Azure<TMethod, any, any, any>>