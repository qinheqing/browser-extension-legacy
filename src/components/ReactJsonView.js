import React from 'react';
import ReactJson from 'react-json-view';

function ReactJsonView({ src, ...others }) {
  return (
    <div>
      <button
        onClick={() => {
          const globalVarName = `ReactJsonView_${new Date().getTime()}`;
          console.log(`window.${globalVarName} = `, src);
          global[globalVarName] = src;
        }}
      >
        print json
      </button>
      <ReactJson src={src} collapsed {...others} />
    </div>
  );
}

export default ReactJsonView;
