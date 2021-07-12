import * as React from 'react';
import PropTypes from 'prop-types';

function SvgQuestion(props) {
  return (
    <svg
      width={11}
      viewBox="0 0 11 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4.173 12.297h2.601v-.203c.016-1.656.555-2.414 1.829-3.196 1.437-.859 2.335-2.03 2.335-3.82 0-2.64-2.054-4.297-5.039-4.297C3.165.781.946 2.297.87 5.266h2.78c.07-1.47 1.133-2.172 2.235-2.172 1.195 0 2.156.797 2.156 2.023 0 1.094-.727 1.844-1.672 2.438-1.383.86-2.18 1.726-2.195 4.539v.203zm1.367 4.875a1.74 1.74 0 001.719-1.719A1.736 1.736 0 005.54 13.75c-.953 0-1.727.766-1.719 1.703a1.709 1.709 0 001.719 1.719z"
        fill="currentColor"
      />
    </svg>
  );
}

SvgQuestion.propTypes = {
  className: PropTypes.any,
};
export default SvgQuestion;
