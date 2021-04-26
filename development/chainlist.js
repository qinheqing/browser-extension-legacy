const fs = require("fs");
const fetch = require('node-fetch');
const url = require("url");
const path = require("path");


function fetchChains(chain) {
  return fetch('https://www.defibox.com/dgg/ranks/v3/all?lang=cn', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      page: 0,
      size: 50,
      chain: chain,
      vtoken: 'f54470dcb8b200bfbc1c5bd0d5572983',
      field: 'locked',
      direction: 'DESC',
    }),
  })
    .then((res) => res.json())
    .then((json) => {
        const { data, code }  = json;
        if (code === 200 && Array.isArray(data)) {
            return data.map(item => {
                const website = item.website;
                const { hostname } = url.parse(website)
                return hostname
            })
        }
        return
    });
}

async function run() {
    const result = {}
    const ethChains = await fetchChains("eth");
    const bscChains = await fetchChains("bsc");
    const hecoChains = await fetchChains("heco");
    ethChains.reduce((acc, e) => {
        acc[e] = 'mainnet'
        return acc
    }, result);
    bscChains.reduce((acc, e) => {
        acc[e] = 'bsc'
        return acc
    }, result);
    hecoChains.reduce((acc, e) => {
        acc[e] = 'heco'
        return acc
    }, result);
    fs.writeFileSync(path.join(__dirname, "../shared/chainlist.json"), JSON.stringify(result, null, 4))
}

run();


