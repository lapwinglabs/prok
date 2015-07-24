/**
 * Module dependencies
 */

var parseProcfile = require('./lib/procfile.js');
var Emitter = require('component-emitter');
var Process = require('./lib/process.js');
var parseEnv = require('./lib/env.js');
var read = require('fs').readFileSync;
var dirname = require('path').dirname;
var resolve = require('path').resolve;
var extend = require('extend.js');
var debug = require('debug');

/**
 * Proxy LOG=... to DEBUG=...
 */

var debugs = process.env.DEBUG ? process.env.DEBUG.split(',') : [];
debugs[debugs.length] = 'prok:' + (process.env.LOG || '*');
debug.enable(debugs.join(','));

/**
 * Export `Prok`
 */

module.exports = Prok;

/**
 * Initialize `Prok`
 *
 * @return {Prok}
 * @api public
 */

function Prok(root) {
  if (!(this instanceof Prok)) return new Prok(root);
  this.cwd = root || process.cwd();
  this._processes = {};
  this.running = [];
  this.padding = 0;
  this._env = {}

  // set the colors explicitly for child processes,
  // so DEBUG commands are easier to read
  this._env['DEBUG_COLORS'] = 1;
}

/**
 * Mixin `Emitter`
 */

Emitter(Prok.prototype);

/**
 * processes
 */

Prok.prototype.processes = function(obj) {
  if (!arguments.length) return this._processes;

  this._processes = obj || {};

  // set the padding
  for (var process in obj) {
    this.padding = this.padding < process.length
      ? process.length
      : this.padding;
  }

  return this;
};


/**
 * Procfile `path`
 *
 * @param {String} path
 * @return {Prok|Object}
 * @api public
 */

Prok.prototype.procfile = function(path) {
  if (!arguments.length) return this.processes();
  path = resolve(this.cwd, path);
  var processes = parseProcfile(read(path, 'utf8'));
  this.processes(processes);
  return this;
};

/**
 * Environment variable `path`
 *
 * @param {String} path
 * @return {Prok|Object}
 * @api public
 */

Prok.prototype.env = function(path) {
  if (!arguments.length) return this._env;
  this._env = extend(this._env, parseEnv(read(path, 'utf8')));
  return this;
};


/**
 * Start the processes
 *
 * @return {Prok}
 * @api public
 */

Prok.prototype.start = function() {
  var processes = this.processes();
  var running = this.running;
  for (var name in processes) {
    var process = running[running.length] = Process(name, processes[name], this);
    process.start();
  }
  return this;
};

/**
 * Stop all the processes
 *
 * @return {Prok}
 * @api public
 */

Prok.prototype.stop = function(signal) {
  this.emit('kill all', signal || 'SIGTERM');
  return this;
};
