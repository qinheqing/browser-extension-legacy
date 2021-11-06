import React from 'react';
import { IS_ENV_IN_TEST_OR_DEBUG } from '../../ui/app/helpers/constants/common';

function ErrorTestCase() {
  return (
    <>
      {IS_ENV_IN_TEST_OR_DEBUG && (
        <>
          <div onClick={() => console.log(window.aaaaaaaaa())}>
            show normal error
          </div>
          <div
            onClick={() =>
              setTimeout(() => {
                console.log(window.pppppppp());
              }, 1000)
            }
          >
            show promise error
          </div>
          <div
            onClick={() => {
              throw new Error(`Non-200 status code: '404'`);
            }}
          >
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            Non-200 status code: '404'
          </div>
          <div
            onClick={() => {
              throw new Error(`Non-200 status code: '409'`);
            }}
          >
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            Non-200 status code: '409'
          </div>
        </>
      )}
    </>
  );
}

export default ErrorTestCase;
