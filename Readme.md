
# prok

  Run multiple processes, simply.

  A lighter, more focused alternative to  [node-forman](strongloop/node-foreman). This is not aiming to have feature parity with [foreman](ddollar/foreman). I would only use this in development.

  This is a **WIP** and the API may evolve or change.

  ![screenshot](https://cldup.com/2QVRE_WvTz.png)

## Installation

```bash
npm install prok
```

## Features

* Processes live and die as a group. This makes it easier to manage multiple processes.
* Filter logs by process name (ex. `LOG=web:*`)
* Procfile parser and environment parser well tested from `node-foreman`
* Supports arbitrary `Procfile` and environment configurations
* API for running processes
* Much cleaner logging
* Doesn't ruin `DEBUG`

## Not supported

* Exporting configuration to upstart, systemd, etc.
* Starting multiple jobs of the same type (accepting PRs)

## CLI

```
Usage: prok [options] [Procfile]

Options:

  -h, --help        output usage information
  -V, --version     output the version number
  -e, --env <file>  specify an environment configuration file

Example:

  $ prok -e .env Procfile
```

## Why the fragmentation?

Node Foreman does a good job getting processes to run together. It does not
do a good job with logging. Spacing gets trimmed, timestamps take up too much
space, etc.

## Troubleshooting

### In-memory databases

Don't put in memory databases in this process manager unless you want to lose
your changes on restart. However, if you're working with redis, you can
specify a development configuration with the property:

```
SAVE 1 1
```

This will check the database every second and if one or more keys
have changed, it will update. I don't think I have to say this, but this is not
suitable for production.

### Restart node on development changes

If you don't like killing all the processes for each change you make to a file,
place `node-dev` or `nodemon` in your Procfile.

## License

(The MIT License)

Copyright (c) 2014 Lapwing Labs &lt;matt@lapwinglabs.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
