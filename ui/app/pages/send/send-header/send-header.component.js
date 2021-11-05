import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PageContainerHeader from '../../../components/ui/page-container-v2/page-container-header';

export default class SendHeader extends Component {
  static propTypes = {
    clearSend: PropTypes.func,
    history: PropTypes.object,
    mostRecentOverviewPage: PropTypes.string,
    titleKey: PropTypes.string,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  onClose() {
    const { clearSend, history, mostRecentOverviewPage } = this.props;
    clearSend();
    history.push(mostRecentOverviewPage);
  }

  render() {
    return (
      <PageContainerHeader
        onBackButtonClick={() => this.onClose()}
        onClose={() => this.onClose()}
        // title={this.context.t(this.props.titleKey)}
        title={this.context.t('send')}
        // title="Send"
        headerCloseText={this.context.t('cancel')}
      />
    );
  }
}
