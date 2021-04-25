import { MAINNET, BSC, HECO, NETWORK_TYPE_RPC } from "../../../shared/constants/network"
import { NETWORK_EVENTS } from "../controllers/network"

const chains = {
    "app.uniswap.org": MAINNET,
    "exchange.pancakeswap.finance": BSC,
    "ht.mdex.com": HECO
}

export default class DetectChainController {
    constructor(opt) {
        this.networkController = opt.networkController;
        this.type = this.networkController.getProviderConfig().type;

        this.networkController.on(NETWORK_EVENTS.NETWORK_DID_CHANGE, (type) => {
          this.type = type;
        });
    }

    test(hostname) {
        const type = chains[hostname];
        return Boolean(type !== NETWORK_TYPE_RPC && type !== this.type)
    }

    switch (hostname) {
      const type = chains[hostname];
      if (type) {
        this.networkController.setProviderType(type)
      }
    }
}