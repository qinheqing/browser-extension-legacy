import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import trim from 'lodash/trim';
import Button from '../../../components/ui/button';
import {
  INITIALIZE_CREATE_PASSWORD_ROUTE,
  INITIALIZE_SELECT_ACTION_ROUTE,
} from '../../../helpers/constants/routes';
import { CONST_FIRST_TIME_FLOW_TYPES } from '../../../helpers/constants/common';
import { getNextRouteOfFirstTimeFlow } from '../../../selectors';
import LanguageDropdown from '../../settings/settings-tab/language-dropdown';

export default class Welcome extends PureComponent {
  static propTypes = {
    history: PropTypes.object,
    welcomeScreenSeen: PropTypes.bool,
    hwOnlyMode: PropTypes.bool,
    setFirstTimeFlowType: PropTypes.func,
    actionSetHwOnlyModeAsync: PropTypes.func,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  componentDidMount() {
    const { history, welcomeScreenSeen } = this.props;

    if (welcomeScreenSeen) {
      // history.push(INITIALIZE_CREATE_PASSWORD_ROUTE);
      history.push(INITIALIZE_SELECT_ACTION_ROUTE);
    }
  }

  handleContinue = async () => {
    await this.props.actionSetHwOnlyModeAsync(false);
    this.props.history.push(INITIALIZE_SELECT_ACTION_ROUTE);
  };

  handleContinueHwOnly = async () => {
    await this.props.actionSetHwOnlyModeAsync(true);
    const flowType = CONST_FIRST_TIME_FLOW_TYPES.CONNECT_HW;
    this.props.setFirstTimeFlowType(flowType);
    this.props.history.push(getNextRouteOfFirstTimeFlow(flowType));
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
          <div className="welcome-page__lang">
            <LanguageDropdown hideLabel showIcon />
          </div>
          <svg
            width="129"
            height="129"
            viewBox="0 0 129 129"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M64.5 129C109.028 129 129 109.028 129 64.5C129 19.972 109.028 0 64.5 0C19.972 0 0 19.972 0 64.5C0 109.028 19.972 129 64.5 129ZM52.3842 27.3503H70.3278V56.9196H59.2026V36.8691H49.2362L52.3842 27.3503ZM64.5004 101.65C75.8023 101.65 84.9642 92.4877 84.9642 81.1859C84.9642 69.884 75.8023 60.7221 64.5004 60.7221C53.1986 60.7221 44.0366 69.884 44.0366 81.1859C44.0366 92.4877 53.1986 101.65 64.5004 101.65ZM64.5004 92.3593C70.6713 92.3593 75.6739 87.3568 75.6739 81.1858C75.6739 75.0149 70.6713 70.0123 64.5004 70.0123C58.3294 70.0123 53.3269 75.0149 53.3269 81.1858C53.3269 87.3568 58.3294 92.3593 64.5004 92.3593Z"
              fill="#00B812"
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
