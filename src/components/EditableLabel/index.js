import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import AppIcons from '../AppIcons';

class EditableLabel extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    defaultValue: PropTypes.string,
    className: PropTypes.string,
  };

  state = {
    isEditing: false,
    value: this.props.defaultValue || '',
  };

  handleSubmit() {
    const { value } = this.state;

    if (value === '') {
      return;
    }

    Promise.resolve(this.props.onSubmit(value)).then(() =>
      this.setState({ isEditing: false }),
    );
  }

  renderEditing() {
    const { value } = this.state;

    return [
      <input
        key={1}
        type="text"
        required
        dir="auto"
        value={this.state.value}
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            this.handleSubmit();
          }
        }}
        onChange={(event) => this.setState({ value: event.target.value })}
        className={classnames('pr-2 border border-solid', {
          'border-red-500': value === '',
        })}
        autoFocus
      />,
      <AppIcons.CheckIcon
        key={2}
        className="w-4 h-4"
        onClick={() => this.handleSubmit()}
      />,
    ];
  }

  renderReadonly() {
    return [
      <div
        key={1}
        className="whitespace-nowrap overflow-ellipsis overflow-hidden pr-2"
        style={{ maxWidth: '250px' }}
      >
        {this.state.value}
      </div>,
      <AppIcons.PencilIcon
        role="button"
        key={2}
        className="w-4 h-4"
        onClick={() => this.setState({ isEditing: true })}
      />,
    ];
  }

  render() {
    const { isEditing } = this.state;
    const { className } = this.props;

    return (
      <div
        className={classnames(
          'flex flex-row justify-center items-center',
          className,
        )}
      >
        {isEditing ? this.renderEditing() : this.renderReadonly()}
      </div>
    );
  }
}

export default EditableLabel;
