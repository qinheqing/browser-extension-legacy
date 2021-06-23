import React from 'react';
import { Observer, observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import AppFrame from '../../components/AppFrame';

// const PageSample = observer(PageSamplePure);

function PageSample() {
  return (
    <Observer>
      {() => {
        return <AppFrame>Hello PageSample</AppFrame>;
      }}
    </Observer>
  );
}

PageSample.propTypes = {
  // children: PropTypes.any,
};

export default PageSample;
