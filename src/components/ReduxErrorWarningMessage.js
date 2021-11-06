import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import { getWarningMessage } from '../../ui/app/selectors';
import * as actions from '../../ui/app/store/actions';

// actions.js
//    displayWarning(text)
//    hideWarning()

function ReduxErrorWarningMessage({ className, autoClear = true }) {
  const dispatch = useDispatch();
  useEffect(() => {
    return () => {
      if (autoClear) {
        dispatch(actions.hideWarning());
      }
    };
  }, [dispatch, autoClear]);

  const warning = useSelector(getWarningMessage);
  return warning && <span className={className}>{warning}</span>;
}
export default ReduxErrorWarningMessage;
