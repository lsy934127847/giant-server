const path = require('path');
const isDev = think.env === 'development';
const access = require('../middleware/access');
const tof = require('../middleware/tof');
const payload = require('think-payload');
module.exports = [
  {
    handle: 'meta',
    options: {
      logRequest: isDev,
      sendResponseTime: isDev
    }
  },
  
  {
    handle: access,
    enable: isDev
  },
  {
    handle: tof,
    enable: true
  },
  {
    handle: payload,
    options: {}
  },
  {
    handle: 'resource',
    enable: true,  // 否则线上环境的静态资源解析不了
    options: {
      root: path.join(think.ROOT_PATH, 'www'),
      publicPath: /^\/(static|favicon\.ico)/
    }
  },
  {
    handle: 'trace',
    enable: !think.isCli,
    options: {
      debug: isDev
    }
  },
  {
    handle: 'payload',
    options: {
      keepExtensions: true,
      limit: '5mb'
    }
  },
  {
    handle: 'router',
    options: {}
  },
  'logic',
  'controller'
];
