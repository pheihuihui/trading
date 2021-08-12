type TMethod = 'GET' | 'POST'
type TBaseClient2Azure<M extends TMethod, ReqPath, ReqBody, Resp> = {
    requestType: M
    requestPath: ReqPath,
    requestBody: ReqBody,
    response: Resp
}

type TFilter<Base, Condition> = {
    [K in keyof Base]: Base[K] extends Condition ? Base[K] : never
}

type TQueryDelay = TBaseClient2Azure<'GET', never, never, any>

type TBaseMap = {
    '/query/delay': TQueryDelay
}

export type TClientReqAndRespMap = TFilter<TBaseMap, TBaseClient2Azure<TMethod, any, any, any>>