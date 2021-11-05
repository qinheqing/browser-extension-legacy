import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Popover from '../../../components/ui/popover';
import Button from '../../../components/ui/button';
import Identicon from '../../../components/ui/identicon';

export default class TokenItemDetail extends Component {
  static propTypes = {
    onCancel: PropTypes.func,
    onSubmit: PropTypes.func,
    onClose: PropTypes.func.isRequired,
    token: PropTypes.object,
  };

  render() {
    const { onClose, onSubmit, token } = this.props;
    const { address, decimals, logoURI, name, symbol } = token;
    return (
      <Popover title="Add Token" onClose={onClose}>
        <div className="token-item-details">
          <div className="token-item-details__preview">
            <Identicon
              className="token-item-details__token-icon"
              diameter={48}
              address={address}
              image={logoURI}
            />
          </div>
          <div className="token-item-details__list">
            {name && (
              <div className="token-item-details__item">
                <div>Name</div>
                <div>{name}</div>
              </div>
            )}
            <div className="token-item-details__item">
              <div>Symbol</div>
              <div>{symbol}</div>
            </div>
            <div className="token-item-details__item">
              <div>Contract</div>
              <div className="token-item-details__item--address">{address}</div>
            </div>
            <div className="token-item-details__item">
              <div>Decimal</div>
              <div>{decimals}</div>
            </div>
          </div>
          <div className="token-item-details__footer">
            <Button type="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="primary" onClick={onSubmit}>
              Add
            </Button>
          </div>
        </div>
      </Popover>
    );
  }
}
