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
        </>
      )}
    </>
  );
}

export default ErrorTestCase;
