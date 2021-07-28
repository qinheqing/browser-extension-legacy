import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../ui/button';

export default class SignatureRequestFooter extends PureComponent {
  static propTypes = {
    cancelAction: PropTypes.func.isRequired,
    signAction: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  render() {
    const { cancelAction, signAction, disabled } = this.props;
    return (
      <div>
        {disabled && (
          <div className="signature-request-footer-tip">
            {this.context.t('notSupportSignTypedData')}
          </div>
        )}
        <div className="signature-request-footer">
          <Button onClick={cancelAction} type="default" large>
            {this.context.t('cancel')}
          </Button>
          {!disabled && (
            <Button onClick={signAction} type="primary" large>
              {this.context.t('sign')}
            </Button>
          )}
        </div>
      </div>
    );
  }
}
