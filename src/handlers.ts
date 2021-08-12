import express from "express"
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
        console.log(ret)
        res.json(ret)
    }
}

export const handlers: THandlerInfo<any>[] = [
    query_server_delay
]