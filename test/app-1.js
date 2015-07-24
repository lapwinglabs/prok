var debug = require('debug')('debug:app-1');
var debug2 = require('debug')('debug:app-1:log');

var i = 0;

setInterval(function() {
  debug('hi there!!!! %j', {
    omg: 'hi',
    lol: 'ok'
  });
  debug2('lol....')
}, 2000);
