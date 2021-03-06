import PropTypes from 'prop-types';
import React from 'react';
import qrCode from 'qrcode-generator';
import { connect } from 'react-redux';
import { isHexPrefixed } from 'ethereumjs-util';
import ReadOnlyInput from '../readonly-input/readonly-input';
import { checksumAddress } from '../../../helpers/utils/util';
import CopyHandle from '../../../../../src/components/CopyHandle';

export default connect(mapStateToProps)(QrCodeView);

function mapStateToProps(state) {
  const { buyView, warning } = state.appState;
  return {
    // Qr code is not fetched from state. 'message' and 'data' props are passed instead.
    buyView,
    warning,
  };
}

function QrCodeView(props) {
  const { Qr, warning } = props;
  const { message, data } = Qr;
  const address = `${checksumAddress(data)}`;
  const qrImage = qrCode(4, 'M');
  qrImage.addData(address);
  qrImage.make();
  const addressCheckSum = checksumAddress(data);
  return (
    <div className="qr-code">
      {Array.isArray(message) ? (
        <div className="qr-code__message-container">
          {message.map((msg, index) => (
            <div className="qr_code__message" key={index}>
              {msg}
            </div>
          ))}
        </div>
      ) : (
        message && <div className="qr-code__header">{message}</div>
      )}
      {warning && <span className="qr_code__error">{warning}</span>}
      <div
        className="qr-code__wrapper"
        dangerouslySetInnerHTML={{
          __html: qrImage.createTableTag(4),
        }}
      />
      <div className="ellip-address-wrapper text-center">
        <CopyHandle text={addressCheckSum}>{addressCheckSum}</CopyHandle>
      </div>
    </div>
  );
}

QrCodeView.propTypes = {
  warning: PropTypes.node,
  Qr: PropTypes.shape({
    message: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
    data: PropTypes.string.isRequired,
  }).isRequired,
};
