import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputAdornment from '@material-ui/core/InputAdornment';

import TextField from '../../../components/ui/text-field';

export default class TokenSearch extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  static defaultProps = {
    error: null,
  };

  static propTypes = {
    tokens: PropTypes.arrayOf(PropTypes.object),
    fuse: PropTypes.object,
    onSearch: PropTypes.func,
    error: PropTypes.string,
  };

  state = {
    searchQuery: '',
  };

  handleSearch(searchQuery) {
    this.setState({ searchQuery });
    const { fuse, tokens } = this.props;
    const fuseSearchResult = fuse.search(searchQuery);
    const addressSearchResult = tokens.filter((token) => {
      return token.address.toLowerCase() === searchQuery.toLowerCase();
    });
    const results = [...addressSearchResult, ...fuseSearchResult];
    this.props.onSearch({ searchQuery, results });
  }

  renderAdornment() {
    return (
      <InputAdornment position="start" style={{ marginRight: '12px' }}>
        <img src="images/search.svg" width="17" height="17" alt="" />
      </InputAdornment>
    );
  }

  render() {
    const { error } = this.props;
    const { searchQuery } = this.state;

    return (
      <TextField
        id="search-tokens"
        placeholder={this.context.t('searchTokens')}
        type="text"
        value={searchQuery}
        onChange={(e) => this.handleSearch(e.target.value)}
        error={error}
        fullWidth
        autoFocus
        className="add-token__token-search"
        startAdornment={this.renderAdornment()}
      />
    );
  }
}
