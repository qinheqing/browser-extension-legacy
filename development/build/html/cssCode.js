const ts = `_ts=${Date.now()}`;

// always set title="ltr"
//   check ui/app/helpers/utils/switch-direction.js

const cssCode = `
<link rel="stylesheet" type="text/css" href="./index.css?__${ts}" title="ltr" >
<link rel="stylesheet" type="text/css" href="./index-rtl.css?__${ts}" title="rtl" disabled="true" >
<link rel="stylesheet" type="text/css" href="./tailwind.css?__${ts}" title="ltr" >
<!-- standalone page css at new home -->
<link rel="stylesheet" type="text/css" href="./index.new.css?__${ts}" title="ltr" >
`;

module.exports = cssCode;
