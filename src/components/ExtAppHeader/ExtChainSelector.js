import {
  Account,
  AccountSelector,
  Badge,
  Token,
  Link,
} from '@onekeyhq/ui-components';
import React, { useCallback, useContext, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { compose } from 'redux';
import { useHistory, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import storeChain from '../../store/storeChain';
import { CONST_CHAIN_KEYS } from '../../consts/consts';
import utilsApp from '../../utils/utilsApp';
import useI18n from '../../hooks/useI18n';
import * as actions from '../../../ui/app/store/actions';
import storeHistory from '../../store/storeHistory';
import { isPrefixedFormattedHexString } from '../../../shared/modules/network.utils';
import evmChainsConfig from '../../config/chains/EVM';
import { openAlert } from '../../../ui/app/ducks/alerts/invalid-custom-network';
import { getEnvironmentType } from '../../../app/scripts/lib/util';
import { ENVIRONMENT_TYPE_FULLSCREEN } from '../../../shared/constants/app';
import {
  NETWORKS_FORM_ROUTE,
  NETWORKS_ROUTE,
} from '../../../ui/app/helpers/constants/routes';

function getEvmChainInfo(chain) {
  // eslint-disable-next-line no-param-reassign
  chain = (chain || '').toLowerCase();
  let chainInfo = evmChainsConfig.find((item) => item.chain === chain);
  chainInfo = chainInfo || { chain, chainName: chain, chainIcon: chain };
  const chainIcon = chainInfo?.chainIcon || chainInfo?.chain || chain;
  return {
    ...chainInfo,
    chainIcon,
  };
}

function ExtChainInfo({ chain, name, description, icon, ...rest }) {
  const t = useI18n();

  const chainInfo = getEvmChainInfo(chain);

  // eslint-disable-next-line no-param-reassign
  icon = icon ?? chainInfo.chainIcon;

  // eslint-disable-next-line no-param-reassign
  name =
    name ??
    (chainInfo.chainName || utilsApp.changeCase.capitalCase(chain || ''));

  // eslint-disable-next-line no-param-reassign
  description = description ?? (chain && t(chain));

  return (
    <Token
      chain={(icon || '').toLowerCase()}
      name={name && <div className="text-left">{name}</div>}
      description={
        // TODO alignLeft
        description && <div className="text-left">{description}</div>
      }
      {...rest}
    />
  );
}

function TestNetBadge() {
  return <Badge>TestNet</Badge>;
}

const ChainSelectorItem = observer(function ({
  chain = '',
  chainIcon,
  chainName,
  chainDesc,
  onSelect,
  isTestNet = false,
  isSelected = false,
}) {
  const t = useI18n();

  return (
    <AccountSelector.Option isSelected={isSelected} onAction={onSelect}>
      <ExtChainInfo
        chain={chain}
        chainIcon={chainIcon}
        name={chainName}
        description={chainDesc}
      />
      {isTestNet && <TestNetBadge />}
    </AccountSelector.Option>
  );
});

const EVMChainGroup = observer(function ({
  setRpcTarget,
  displayInvalidCustomNetworkAlert,
  frequentRpcListDetail,
  provider,
  onClose,
  setProviderType,
}) {
  /* provider
  chainId: "0xa"
  nickname: "Optimistic Ethereum"
  rpcUrl: "https://mainnet.optimism.io/"
  ticker: "OETH"
  type: "rpc"
   */

  /*  frequentRpcListDetail
  0:
  chainId: "0x539"
  nickname: "Localhost 8545"
  rpcPrefs: {}
  rpcUrl: "http://localhost:8545"
  ticker: "ETH"

  1:
  chainId: "0xa"
  nickname: "Optimistic Ethereum"
  rpcPrefs: {blockExplorerUrl: 'https://optimistic.etherscan.io'}
  rpcUrl: "https://mainnet.optimism.io/"
  ticker: "OETH"
   */
  return (
    <AccountSelector.OptionGroup title="EVM">
      {/* Built-in EVM chain */}
      {evmChainsConfig.map((chainInfo) => (
        <ChainSelectorItem
          key={chainInfo.chain}
          isSelected={utilsApp.isOldHome() && provider.type === chainInfo.chain}
          onSelect={() => {
            setProviderType(chainInfo.chain);
            storeHistory.goToHomeOld({ replace: true });
            onClose();
          }}
          {...chainInfo}
        />
      ))}

      {/* Custom EVM chain */}
      {frequentRpcListDetail.map((info) => {
        const { rpcUrl, chainId, ticker, nickname } = info;
        let chainName = ticker;
        if (rpcUrl === 'http://localhost:8545') {
          chainName = 'Local ETH';
        }
        return (
          <ChainSelectorItem
            key={chainId}
            isSelected={
              utilsApp.isOldHome() &&
              provider.type === 'rpc' &&
              provider.chainId === chainId
            }
            onSelect={() => {
              if (isPrefixedFormattedHexString(chainId)) {
                setRpcTarget(rpcUrl, chainId, ticker, nickname);
              } else {
                displayInvalidCustomNetworkAlert(nickname || rpcUrl);
              }
              // setProviderType(chainInfo.chain);
              storeHistory.goToHomeOld({ replace: true });
              onClose();
            }}
            chainName={chainName}
            chainDesc={nickname}
          />
        );
      })}
    </AccountSelector.OptionGroup>
  );
});

const NewChainGroup = observer(function ({ baseChain, onClose }) {
  const chains = storeChain.chainsList.filter(
    (item) => item.baseChain === baseChain,
  );
  const title = chains.find((item) => !item.isTestNet)?.shortname || baseChain;
  const onSelect = useCallback(
    (chainInfo) => {
      storeHistory.goToHomeNew({ replace: true, chainKey: chainInfo.key });
      onClose();
    },
    [onClose],
  );
  return (
    <AccountSelector.OptionGroup title={title}>
      {chains.map((chainInfo) => (
        <AccountSelector.Option
          key={chainInfo.key}
          isSelected={
            utilsApp.isNewHome() && storeChain.currentChainKey === chainInfo.key
          }
          onAction={() => onSelect(chainInfo)}
        >
          <ExtChainInfo
            chain={chainInfo.baseChain}
            name={chainInfo.shortname}
            description={chainInfo.name}
          />
          {chainInfo.isTestNet && <TestNetBadge />}
        </AccountSelector.Option>
      ))}
    </AccountSelector.OptionGroup>
  );
});

const ExtChainSelectorComponent = observer(function ({
  setRpcTarget,
  displayInvalidCustomNetworkAlert,
  frequentRpcListDetail,
  provider,
  setProviderType,
  setSelectedSettingsRpcUrl,
  setNetworksTabAddMode,
}) {
  const history = useHistory();
  const triggerBtnRef = useRef(null);
  const close = useCallback(() => {
    triggerBtnRef?.current?.click();
  }, []);
  let chain = provider.type;
  if (utilsApp.isNewHome()) {
    chain = storeChain.currentBaseChain;
  }
  chain = getEvmChainInfo(chain).chainIcon;

  return (
    // TODO ChainSelector
    <AccountSelector
      triggerButtonRef={(ref) => (triggerBtnRef.current = ref)}
      place="bottom-start"
      trigger={{
        token: {
          chain,
        },
      }}
      actions={[
        {
          content: (
            <div>
              Customize this list in <Link color> Networks</Link>
            </div>
          ),
          iconName: 'CogSolid',
          onAction: () => {
            // history.push(
            //   getEnvironmentType() === ENVIRONMENT_TYPE_FULLSCREEN
            //     ? NETWORKS_ROUTE
            //     : NETWORKS_FORM_ROUTE, // show edit/create form besides
            // );
            history.push(NETWORKS_ROUTE);
            setSelectedSettingsRpcUrl('');
            setNetworksTabAddMode(false);
            close();
          },
        },
      ]}
    >
      {/* TODO max-height max-width popup */}
      <div className="max-h-[420px] overflow-y-auto">
        <EVMChainGroup
          setRpcTarget={setRpcTarget}
          displayInvalidCustomNetworkAlert={displayInvalidCustomNetworkAlert}
          frequentRpcListDetail={frequentRpcListDetail}
          provider={provider}
          onClose={close}
          setProviderType={setProviderType}
        />

        <NewChainGroup baseChain={CONST_CHAIN_KEYS.SOL} onClose={close} />
        <NewChainGroup baseChain={CONST_CHAIN_KEYS.CFX} onClose={close} />
      </div>
    </AccountSelector>
  );
});

function mapStateToProps(state) {
  return {
    provider: state.metamask.provider,
    frequentRpcListDetail: state.metamask.frequentRpcListDetail || [],
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setProviderType: (type) => {
      dispatch(actions.setProviderType(type));
    },
    setRpcTarget: (target, chainId, ticker, nickname) => {
      dispatch(actions.setRpcTarget(target, chainId, ticker, nickname));
    },
    displayInvalidCustomNetworkAlert: (networkName) => {
      dispatch(openAlert(networkName));
    },
    hideNetworkDropdown: () => dispatch(actions.hideNetworkDropdown()),
    setNetworksTabAddMode: (isInAddMode) => {
      dispatch(actions.setNetworksTabAddMode(isInAddMode));
    },
    setSelectedSettingsRpcUrl: (url) => {
      dispatch(actions.setSelectedSettingsRpcUrl(url));
    },
    showConfirmDeleteNetworkModal: ({ target, onConfirm }) => {
      return dispatch(
        actions.showModal({
          name: 'CONFIRM_DELETE_NETWORK',
          target,
          onConfirm,
        }),
      );
    },
  };
}

const ExtChainSelector = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(ExtChainSelectorComponent);

export { ExtChainSelector, ExtChainInfo };
