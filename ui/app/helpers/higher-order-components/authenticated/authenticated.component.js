import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';
import { UNLOCK_ROUTE, INITIALIZE_ROUTE } from '../../constants/routes';

export default function Authenticated(props) {
  const { isUnlocked, completedOnboarding, autoReturn, path, authDisabled } =
    props;

  switch (true) {
    case authDisabled || (isUnlocked && completedOnboarding):
      return <Route {...props} />;
    case !completedOnboarding:
      return <Redirect to={{ pathname: INITIALIZE_ROUTE }} />;
    default:
      return (
        <Redirect
          to={{
            pathname: UNLOCK_ROUTE,
            state: {
              returnRoute: autoReturn ? path : undefined,
            },
          }}
        />
      );
  }
}

Authenticated.propTypes = {
  path: PropTypes.string,
  autoReturn: PropTypes.bool,
  authDisabled: PropTypes.bool,
  isUnlocked: PropTypes.bool,
  completedOnboarding: PropTypes.bool,
};
