import { MAINNET, BSC, HECO, NETWORK_TYPE_RPC } from "../../../shared/constants/network"
import { NETWORK_EVENTS } from "../controllers/network"
import chainlist from "../../../shared/chainlist.json"
export default class DetectChainController {
    constructor(opt) {
        this.networkController = opt.networkController;
        this.type = this.networkController.getProviderConfig().type;

        this.networkController.on(NETWORK_EVENTS.NETWORK_DID_CHANGE, (type) => {
          this.type = type;
        });
    }

    test(hostname) {
        const type = chainlist[hostname];
        return Boolean(type !== NETWORK_TYPE_RPC && type !== this.type)
    }

    switch (hostname) {
      const type = chainlist[hostname];
      if (type && [MAINNET, BSC, HECO].includes(type)) {
        this.networkController.setProviderType(type)
      }
    }
}