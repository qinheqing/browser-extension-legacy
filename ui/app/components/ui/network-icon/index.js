import React, { PureComponent } from 'react';

const colorMaps = {
  mainnet: '#454E5D',
  bsc: '#EBAF00',
  matic: '#8247E5',
  heco: '#01943F',
  xdai: '#62A7A5',
  fantom: '#1969FF',
  oec: '#205FEC',
  okex: '#205FEC',
  avalanche: '#E84142',
  solana: '#111111',
};

const iconMaps = {
  mainnet: './images/network/mainnet.svg',
  bsc: './images/network/bsc.svg',
  matic: './images/network/matic.svg',
  heco: './images/network/heco.svg',
  xdai: './images/network/xdai.svg',
  fantom: './images/network/fantom.svg',
  oec: './images/network/oec.svg',
  okex: './images/network/okex.svg',
  avalanche: './images/network/avalanche.svg',
  solana: './images/network/solana.svg',
};

export class NetworkIcon extends PureComponent {
  render() {
    const { networkType } = this.props;
    return (
      <div
        className="network_icon"
        style={{ backgroundColor: colorMaps[networkType] || '#454E5D' }}
      >
        <img src={iconMaps[networkType] || iconMaps.mainnet} />
      </div>
    );
  }
}
