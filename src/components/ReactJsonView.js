import React from 'react';
import ReactJson from 'react-json-view';

function ReactJsonView({ src, ...others }) {
  return (
    <div>
      <button
        onClick={() => {
          console.log('ReactJsonView', src);
        }}
      >
        print json
      </button>
      <ReactJson src={src} collapsed {...others} />
    </div>
  );
}

export default ReactJsonView;
