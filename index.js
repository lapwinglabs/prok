/**
 * Module dependencies
 */

var parseProcfile = require('./lib/procfile.js');
var Emitter = require('component-emitter');
var Process = require('./lib/process.js');
var parseEnv = require('./lib/env.js');
var read = require('fs').readFileSync;
var dirname = require('path').dirname;
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

function Prok() {
  if (!(this instanceof Prok)) return new Prok();
  this.cwd = process.cwd();
  this.processes = [];
  this._procfile = {};
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
 * Procfile `path`
 *
 * @param {String} path
 * @return {Prok|Object}
 * @api public
 */

Prok.prototype.procfile = function(path) {
  if (!arguments.length) return this._procfile;
  this.cwd = dirname(path);
  this._procfile = parseProcfile(read(path, 'utf8'));

  // set the padding
  for (var process in this._procfile) {
    this.padding = this.padding < process.length
      ? process.length
      : this.padding;
  }

  return this;
};

/**
 * Set the root
 *
 * @param {String} root
 * @return {Prok}
 * @api public
 */

Prok.prototype.root = function(root) {
  if (!arguments.length) return this._root;
  this._root = root;
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
  var procfile = this.procfile();
  var processes = this.processes;
  for (var name in procfile) {
    var process = processes[processes.length] = Process(name, procfile[name], this);
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
