const path = require('path');

// https://react-svgr.com/docs/custom-templates/

function defaultIndexTemplate(filePaths) {
  const exportEntries = filePaths.map((filePath) => {
    const basename = path.basename(filePath, path.extname(filePath));
    const exportName = /^\d/.test(basename) ? `Svg${basename}` : basename;
    return `export { default as ${exportName}Icon } from './${basename}';\n`;
  });
  return exportEntries.join('\n');
}

function defaultTemplate(
  { template },
  opts,
  { imports, interfaces, componentName, props, jsx, exports },
) {
  const plugins = ['jsx'];
  if (opts.typescript) {
    plugins.push('typescript');
  }
  const typeScriptTpl = template.smart({ plugins });
  return typeScriptTpl.ast`${imports}
import PropTypes from 'prop-types';
${interfaces}

function ${componentName}(${props}) {
  return ${jsx};
}

${componentName}.propTypes = {
  className: PropTypes.any,
};


${exports}
  `;
}

module.exports = {
  template: defaultTemplate,
  indexTemplate: defaultIndexTemplate,
};
