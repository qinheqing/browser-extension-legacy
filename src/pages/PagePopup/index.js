import React from 'react';
import { Observer, observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import AppFrame from '../../components/AppFrame';

// const PageSample = observer(PageSamplePure);

function PagePopup() {
  // TODO use urijs parse url query
  return (
    <Observer>
      {() => {
        return (
          <AppFrame>
            <div className="u-wrap-text">{window.location.href}</div>
          </AppFrame>
        );
      }}
    </Observer>
  );
}

PagePopup.propTypes = {
  // children: PropTypes.any,
};

export default PagePopup;
