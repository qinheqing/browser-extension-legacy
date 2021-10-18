import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import AppIcons from '../AppIcons';

class EditableLabel extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    defaultValue: PropTypes.string,
    className: PropTypes.string,
    maxLength: PropTypes.number,
  };

  static defaultProps = {
    maxLength: Infinity,
  };

  state = {
    isEditing: false,
    value: this.props.defaultValue || '',
  };

  handleSubmit() {
    const { value } = this.state;

    if (value.trim() === '') {
      return;
    }

    Promise.resolve(this.props.onSubmit(value)).then(() =>
      this.setState({ isEditing: false }),
    );
  }

  renderEditing() {
    const { value } = this.state;
    const { maxLength } = this.props;

    return [
      <input
        key={1}
        type="text"
        required
        dir="auto"
        maxLength={maxLength}
        value={this.state.value}
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            this.handleSubmit();
          }
        }}
        onChange={(event) => this.setState({ value: event.target.value })}
        className={classnames(
          'p-2 border border-solid h-9 mr-2 text-center focus:outline-none',
          {
            'border-red-500': value === '',
          },
        )}
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
      <div>
        <div
          className={classnames(
            'flex flex-row justify-center items-center',
            className,
          )}
        >
          {isEditing ? this.renderEditing() : this.renderReadonly()}
        </div>
      </div>
    );
  }
}

export default EditableLabel;
