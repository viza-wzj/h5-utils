const path = require('path');

const h5UtilsRoot = path.resolve(__dirname, '../../..');
const h5UtilsDist = path.resolve(h5UtilsRoot, 'packages/core/dist/index.esm.js');

/** @type {import('@tarojs/cli').UserConfigExport} */
const config = {
  projectName: 'taro-app',
  date: '2026-4-6',
  designWidth: 750,
  deviceRatio: { 640: 2.34 / 2, 750: 1, 375: 2, 828: 1.81 / 2 },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {},
  copy: { patterns: [], options: {} },
  framework: 'react',
  compiler: 'webpack5',
  h5: {
    devServer: {
      port: 10086,
      setupMiddlewares(middlewares, devServer) {
        devServer.app.get('/cors-proxy', (req, res) => {
          const targetUrl = req.query.url;
          if (!targetUrl) return res.status(400).send('Missing url');
          const client = targetUrl.startsWith('https') ? require('https') : require('http');
          client.get(targetUrl, (proxyRes) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/*');
            proxyRes.pipe(res);
          }).on('error', () => res.status(500).send('Proxy error'));
        });
        return middlewares;
      }
    },
    webpackChain(chain) {
      chain.output.merge({
        environment: { asyncFunction: true }
      });
      chain.merge({
        ignoreWarnings: [/webpackExports/]
      });
    }
  },
  alias: {
    '@i17hush/h5-utils': h5UtilsDist,
  },
};

module.exports = config;
