const ts = `_ts=${Date.now()}`;

const cssCode = `
<link rel="stylesheet" type="text/css" href="./index.css?__${ts}" title="ltr" >
<link rel="stylesheet" type="text/css" href="./index-rtl.css?__${ts}" title="rtl" disabled="true" >
<link rel="stylesheet" type="text/css" href="./tailwind.css?__${ts}" >
<!-- standalone page css at new home -->
<link rel="stylesheet" type="text/css" href="./index.new.css?__${ts}" >
`;

module.exports = cssCode;
