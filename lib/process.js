/**
 * Module dependencies
 */

var platform = require('os').platform();
var cp = require('child_process');
var extend = require('extend.js');
var debug = require('debug');
var split = require('split');

/**
 * Export `Process`
 */

module.exports = Process;

/**
 * Initialize `Process`
 */

function Process(name, command, prok) {
  if (!(this instanceof Process)) return new Process(name, command, prok);
  this.env = extend(process.env, prok.env());
  this.debug = debug('prok:' + name);
  this.command = command;
  this.running = false;
  this.cwd = prok.cwd;
  this.name = name;
  this.prok = prok;

  // set the padding
  var padding = repeat(' ', prok.padding - name.length);

  // hack to remove the diff timestamp
  this.debug.log = function(str) {
    str = str
      .replace(/\u001b\[\d+m\s\+\d+m?s\u001b\[0m/, '')
      .replace(/  (\u001b\[\d+m)prok:([^ ]+) \u001b/, padding + '$1$2: \u001b');
    console.log(str);
  };
}

/**
 * Start the process
 */

Process.prototype.start = function() {
  if (platform === 'win32') {
    var file = process.env.comspec || 'cmd.exe';
    var args = ['/s', '/c', this.command];
  } else {
    var file = '/bin/sh';
    var args = ['-c', this.command];
  }

  var child = cp.spawn(file, args, { cwd: this.cwd, env: this.env });
  var prok = this.prok;
  var name = this.name;
  var self = this;


  this.running = true;

  child.stdout
    .pipe(split())
    .on('data', function(data) {
    data = data.toString();
    self.debug(data);
    prok.emit('stdout', name, data);
  });

  child.stderr
    .pipe(split())
    .on('data', function(data) {
      data = data.toString();
      self.debug(data);
      prok.emit('stderr', name, data);
    });

  child.on('close', function(code) {
    self.running = false;

    0 == code
      ? prok.emit('done', code)
      : prok.emit('error', code);
  });

  child.on('exit', function(code, signal) {
    prok.emit('kill all', signal);
  });

  prok.on('kill all', function(signal) {
    child.kill(signal);
  });

  prok.on('kill', function(signal) {
    child.kill(signal);
  });
};

/**
 * Stop the process
 */

Process.prototype.stop = function(signal) {
  if (!this.running) return this;
  this.prok.emit('kill', signal || 'SIGTERM');
  return this
};

/**
 * Repeat a string `n` times
 *
 * @param {String} str
 * @param {Number} n
 * @return {String}
 */

function repeat(str, n) {
  return new Array(+n + 1).join(str);
}
