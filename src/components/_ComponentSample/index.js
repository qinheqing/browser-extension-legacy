import React from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';

// const ComponentSample = observer(ComponentSamplePure);

function ComponentSample({ children }) {
  return (
    <Observer>
      {() => {
        return <div>{children}</div>;
      }}
    </Observer>
  );
}

ComponentSample.propTypes = {
  children: PropTypes.any,
};

export default ComponentSample;
