import * as React from 'react';
import PropTypes from 'prop-types';

function SvgSpinner(props) {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g filter="url(#spinner_svg__filter0_i)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22 40c9.942 0 18-8.059 18-18 0-9.94-8.058-18-18-18-9.94 0-18 8.06-18 18 0 9.941 8.06 18 18 18zm0 4c12.15 0 22-9.85 22-22S34.15 0 22 0 0 9.85 0 22s9.85 22 22 22z"
          fill="#ccc"
        />
      </g>
      <g filter="url(#spinner_svg__filter1_i)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M27.846 41.23a2 2 0 011.077-2.615 17.999 17.999 0 009.692-23.538 2 2 0 013.693-1.539 22 22 0 01-11.846 28.77 2 2 0 01-2.616-1.077z"
          fill="currentColor"
        />
      </g>
      <defs>
        <filter
          id="spinner_svg__filter0_i"
          x={0}
          y={0}
          width={44}
          height={44}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation={2} />
          <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="shape" result="effect1_innerShadow" />
        </filter>
        <filter
          id="spinner_svg__filter1_i"
          x={27.692}
          y={12.307}
          width={16.308}
          height={30.155}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation={2} />
          <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="shape" result="effect1_innerShadow" />
        </filter>
      </defs>
    </svg>
  );
}

SvgSpinner.propTypes = {
  className: PropTypes.any,
};
export default SvgSpinner;
