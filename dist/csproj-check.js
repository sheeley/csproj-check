Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var fs = require('fs');
var XmlStream = require('xml-stream');
var path = require('path');
var Glob = require('glob').Glob;
var async = require('async');

var CS_PROJ = '.csproj';

var CSProjCheck = (function () {
  function CSProjCheck(fileName, options) {
    _classCallCheck(this, CSProjCheck);

    options = options || {};
    this.fileName = fileName;
    this.reverseCheck = options.reverseCheck;
    this.ignoreFiles = options.ignoreFiles;
    this.paths = {};
    this.count = 0;
    this.errors = 0;
    this.parsed = path.parse(fileName);
  }

  _createClass(CSProjCheck, [{
    key: 'run',
    value: function run(callback) {
      var self = this;

      fs.exists(this.fileName, function (exists) {
        if (!exists) {
          callback(-1);
          return;
        }

        var stream = fs.createReadStream(self.fileName);
        var xml = new XmlStream(stream);

        xml.on('updateElement: Compile', self.fileExists.bind(self));
        xml.on('updateElement: Content', self.fileExists.bind(self));
        xml.on('end', function () {
          if (self.reverseCheck) {
            self.checkFileTree.call(self, callback);
          } else {
            callback(null, self.errors);
          }
        });
      });
    }
  }, {
    key: 'fileExists',
    value: function fileExists(item) {
      var self = this;
      this.count++;
      var filePath = path.join(this.parsed.dir, unescape(item.$.Include.replace(/\\/g, path.sep)));
      if (this.reverseCheck) {
        this.paths[filePath] = true;
      }

      fs.exists(filePath, function (exists) {
        if (!exists) {
          self.log(filePath + ' doesn\'t exist!');
          self.errors++;
        }
      });
    }
  }, {
    key: 'checkFileTree',
    value: function checkFileTree(callback) {
      var _this = this;

      this.log('checking ' + this.fileName);
      var self = this;
      var globStr = this.parsed.dir + '/**/*';
      if (this.ignoreFiles != null && this.ignoreFiles.length > 0) {
        globStr = this.parsed.dir + '/**/!(*' + this.ignoreFiles.join('*|*') + ')';
      }
      this.log('globstr', globStr);
      var glob = new Glob(globStr);
      glob.on('match', function (filePath) {
        if (filePath.indexOf('node_modules') !== -1) {
          return;
        }
        var resolvedPath = filePath.replace(self.parsed.dir + '/', '');
        _this.log(resolvedPath);
        if (self.paths[resolvedPath] !== true) {
          self.errors++;
          self.log(filePath + ' is missing from csproj');
        }
      });
      glob.on('end', function () {
        callback(null, self.errors);
      });
    }
  }, {
    key: 'log',
    value: function log(message) {
      console.log(this.fileName + ': ' + message);
    }
  }], [{
    key: 'runCheck',
    value: function runCheck(inputFile, options, callback) {
      if (typeof options == 'function' && callback == null) {
        callback = options;
        options = {};
      }

      if (callback == null) {
        return;
      }

      if (inputFile == null || inputFile === '') {
        callback(-1);
        return;
      }

      var glob = new Glob(inputFile);
      glob.on('end', function (files) {
        if (files.length > 0) {
          async.map(files, function (fileName, cb) {
            var checker = new CSProjCheck(fileName, options);
            checker.run(cb);
          }, function (err, errorCounts) {
            callback(errorCounts.reduce(function (a, b) {
              return a + b;
            }));
          });
        } else {
          callback(-1);
        }
      });
    }
  }]);

  return CSProjCheck;
})();

exports['default'] = CSProjCheck;
module.exports = exports['default'];