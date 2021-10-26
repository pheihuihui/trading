import { Bot } from "./bot";

class Bot1 extends Bot {

    constructor(quote: string) {
        super(quote)
    }

    status(): unknown {
        throw new Error("Method not implemented.");
    }

    start() {

    }

    stop() {

    }

    updateParameters(paras: string) {

    }
    
}

export const bot1 = new Bot1('USDT')