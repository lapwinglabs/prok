// Parse a Key=Value File Containing Environmental Variables

module.exports = function(data) {
  var env = {};

  data.toString().replace(/^\s*\#.*$/gm,'')
                 .replace(/^\s*$/gm,'')
                 .split(/\n/)
                 .map(method('trim'))
                 .filter(notBlank)
                 .forEach(capturePair)
  return env

  function notBlank(str) {
    return str.length > 2
  }

  function capturePair(line) {
    var pair = line.split('=');
    var key = pair[0].trim();
    var rawVal = pair.slice(1).join('=').trim();
    env[key] = parseValue(rawVal);
  }

  function parseValue(val) {
    switch (val[0]) {
      case '"': return /^"([^"]*)"/.exec(val)[1];
      case "'": return /^'([^']*)'/.exec(val)[1];
      default : return val.replace(/\s*\#.*$/, '');
    }
  }
}

function method(name) {
  return function(o) {
    return o[name].apply(o)
  }
}
