var embedly = require('embedly');
var util = require('util');

var api = new embedly({ key: '61b902092de344ef869159330ca9f5f9' });

module.exports = function (url, cb) {
  api.oembed({ url: url }, function (err, objs) {
    if (!!err) {
      console.error('request #1 failed');
      console.error(err.stack, objs);
      cb({ "error": true });
    }
    console.log('---------------------------------------------------------');
    console.log('1. ');
    console.log(util.inspect(objs[0]));
    cb(null, objs[0]);
  });
};
