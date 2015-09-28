var Prok = require('..');

var prok = Prok(__dirname)
  .processes(require('./package.json').processes[process.argv[2] || 'default'])
  .env(__dirname + '/.env');

prok.start();

prok.on('stderr', function(name, err) {
  // console.log('stderr', err);
})

prok.on('stdout', function(name, out) {
  // console.log('stdout', out);
  // console.log(name, out);
})

process.on('SIGINT', function() {
  prok.stop('SIGINT');
})

