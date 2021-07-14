import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Observer, observer } from 'mobx-react-lite';
import classnames from 'classnames';
import { useTimeout } from '../../../ui/app/hooks/useTimeout';
import styles from './index.css';

function PreloadScreen({ children }) {
  const [loading, setLoading] = useState(true);
  const [hide, setHide] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  let doneStyle = {};
  if (!loading) {
    doneStyle = {
      opacity: 0,
    };
  }
  if (hide) {
    return null;
  }
  return (
    <div
      onTransitionEnd={() => {
        !loading && setHide(true);
      }}
      style={{
        opacity: 1,
        transition: 'all 0.5s',
        position: 'fixed',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white',
        ...doneStyle,
      }}
    >
      <img src="images/loading-n.svg" style={{ width: 80 }} />
    </div>
  );
}

PreloadScreen.propTypes = {
  children: PropTypes.any,
};

export default observer(PreloadScreen);
