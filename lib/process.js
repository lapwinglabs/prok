/**
 * Module dependencies
 */

var platform = require('os').platform();
var cp = require('child_process');
var pstree = require('ps-tree');
var extend = require('extend.js');
var debug = require('debug');
var split = require('split');
var fmt = require('util').format;

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
      .replace(/  (\u001b\[\d+;1m)prok:([^ ]+) \u001b/, padding + '$1$2: \u001b');
    console.error(str);
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

  var prok = this.prok;
  var cwd = prok.cwd;
  var child = cp.spawn(file, args, { cwd: cwd, env: this.env });
  var name = this.name;
  var self = this;

  this.running = true;

  this.debug(fmt('PID = %s', child.pid));

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

  child.on('exit', function(code, signal) {
    prok.emit('kill all', signal);
  });

  child.on('close', function(code, signal) {
    self.running = false;

    0 == code
      ? prok.emit('done', code)
      : prok.emit('error', code);
  });

  prok.on('kill all', function(signal) {
    killChildren(name, child.pid, function() { child.kill(signal) });
  });

  prok.on('kill', function(signal) {
    killChildren(name, child.pid, function() { child.kill(signal) });
  });
};

function killChildren(name, pid, done) {
  pstree(pid, function (err, children) {
    children.forEach(function (p) {
      cp.spawn('kill', ['-9', p.PID])
    });
    done();
  })
}

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
