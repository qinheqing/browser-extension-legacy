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
};

export class NetworkIcon extends PureComponent {
  render() {
    const { chain } = this.props;
    return (
      <div
        className="networks-tab__network_icon"
        style={{ backgroundColor: colorMaps[chain] || '#454E5D' }}
      >
        <img
          src={`./images/network/${colorMaps[chain] ? chain : 'mainnet'}.svg`}
        />
      </div>
    );
  }
}
