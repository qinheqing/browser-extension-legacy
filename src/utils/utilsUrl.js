import URI from 'urijs';
import { isArray } from 'lodash';
// http://medialize.github.io/URI.js/docs.html

function toUriObject({ url }) {
  if (url instanceof URI) {
    return url;
  }
  return new URI(url);
}

function getQuery({ url }) {
  const uri = toUriObject({ url });
  return uri.query(true);
}

function addQuery({ url, query = {}, arrayToCommaString = true }) {
  const uri = toUriObject({ url });
  if (arrayToCommaString) {
    Object.entries(query).forEach(([k, v]) => {
      if (isArray(v)) {
        query[k] = v.join(',');
      }
    });
  }
  uri.addQuery(query);
  return uri.toString();
}

const utilsUrl = {
  toUriObject,
  getQuery,
  addQuery,
};
global.$$utilsUrl = utilsUrl;
export default utilsUrl;
