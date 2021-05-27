import EventEmitter from 'events';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import trim from 'lodash/trim';
import Mascot from '../../../components/ui/mascot';
import Button from '../../../components/ui/button';
import {
  INITIALIZE_CREATE_PASSWORD_ROUTE,
  INITIALIZE_METAMETRICS_OPT_IN_ROUTE,
  INITIALIZE_SELECT_ACTION_ROUTE,
} from '../../../helpers/constants/routes';
import { CONST_FIRST_TIME_FLOW_TYPES } from '../../../helpers/constants/common';

export default class Welcome extends PureComponent {
  static propTypes = {
    history: PropTypes.object,
    participateInMetaMetrics: PropTypes.bool,
    welcomeScreenSeen: PropTypes.bool,
    hwOnlyMode: PropTypes.bool,
    setFirstTimeFlowType: PropTypes.func,
    setHwOnlyModeAsync: PropTypes.func,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.animationEventEmitter = new EventEmitter();
  }

  componentDidMount() {
    const { history, participateInMetaMetrics, welcomeScreenSeen } = this.props;

    if (welcomeScreenSeen && participateInMetaMetrics !== null) {
      history.push(INITIALIZE_CREATE_PASSWORD_ROUTE);
    } else if (welcomeScreenSeen) {
      history.push(INITIALIZE_SELECT_ACTION_ROUTE);
    }
  }

  handleContinue = () => {
    this.props.setHwOnlyModeAsync(false);
    this.props.history.push(INITIALIZE_SELECT_ACTION_ROUTE);
  };

  handleContinueHwOnly = () => {
    this.props.setHwOnlyModeAsync(true);
    this.props.setFirstTimeFlowType(CONST_FIRST_TIME_FLOW_TYPES.CONNECT_HW);
    this.props.history.push(INITIALIZE_METAMETRICS_OPT_IN_ROUTE);
  };

  getOnBoardingStartChoices() {
    const choiceStr =
      process.env.ENV_ON_BOARDING_START_CHOICE || 'normal,hardware';
    return choiceStr.split(',').map(trim);
  }

  render() {
    const { t } = this.context;
    const choices = this.getOnBoardingStartChoices();

    return (
      <div className="welcome-page__wrapper">
        <div className="welcome-page">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="60" cy="60" r="60" fill="#00B812" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M60 59.026C69.4677 59.026 77.1429 66.4394 77.1429 75.5845C77.1429 84.7294 69.4677 92.1429 60 92.1429C50.5323 92.1429 42.8571 84.7294 42.8571 75.5845C42.8571 66.4394 50.5323 59.026 60 59.026ZM60.0001 66.543C54.8306 66.543 50.6399 70.5909 50.6399 75.5842C50.6399 80.5774 54.8306 84.6253 60.0001 84.6253C65.1696 84.6253 69.3603 80.5774 69.3603 75.5842C69.3603 70.5909 65.1696 66.543 60.0001 66.543ZM65.574 27.8571V53.863H55.4776V36.2288H46.4329L49.2898 27.8571H65.574Z"
              fill="white"
            />
          </svg>
          <div className="welcome-page__header">{t('welcome')}</div>
          <div className="welcome-page__description">
            <div>{t('metamaskDescription')}</div>
            <div>{t('happyToSeeYou')}</div>
          </div>
          <div className="welcome-page__buttons">
            {choices.includes('normal') && (
              <Button
                type="primary"
                className="first-time-flow__button"
                onClick={this.handleContinue}
              >
                {t('getStarted')}
              </Button>
            )}
            {choices.includes('hardware') && (
              <Button
                type="secondary"
                className="first-time-flow__button connect-hw-only__button"
                onClick={this.handleContinueHwOnly}
              >
                {t('hwOnlyStarted')}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
