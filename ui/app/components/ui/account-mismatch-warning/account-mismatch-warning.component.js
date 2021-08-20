import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Tooltip from '../tooltip';
import { getSelectedAccount } from '../../../selectors';
import InfoIcon from '../icon/info-icon.component';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { SEVERITIES } from '../../../helpers/constants/design-system';

export default function AccountMismatchWarning({
  address,
  showInfoBar = false,
}) {
  const [infoBarVisible, setInfoBarVisible] = useState(true);
  const selectedAccount = useSelector(getSelectedAccount);
  const t = useI18nContext();
  if (selectedAccount.address === address) {
    return null;
  }

  return (
    <>
      {showInfoBar && infoBarVisible && (
        <div
          onClick={() => setInfoBarVisible(false)}
          className="account-mismatch-warning__top-info-bar"
        >
          {t('notCurrentAccount')}
        </div>
      )}

      <Tooltip
        position="bottom"
        html={<p>{t('notCurrentAccount')}</p>}
        wrapperClassName="account-mismatch-warning__tooltip-wrapper"
        containerClassName="account-mismatch-warning__tooltip-container"
      >
        <div className="account-mismatch-warning__tooltip-container-icon">
          <InfoIcon severity={SEVERITIES.WARNING} />
        </div>
      </Tooltip>
    </>
  );
}

AccountMismatchWarning.propTypes = {
  address: PropTypes.string.isRequired,
  showInfoBar: PropTypes.bool,
};
