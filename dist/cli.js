#! /usr/bin/env node


var async = require('async');
var args = require('yargs').argv;
var CSProjCheck = require('./csproj-check.js');

var inputFiles = args._ && args._.length > 0 ? args._ : ['**/*.csproj'];
var options = {
  reverseCheck: args.reverseCheck,
  ignoreFiles: args.ignoreFiles
};

async.map(inputFiles, function (fileName, callback) {
  CSProjCheck.runCheck(fileName, options, callback);
}, function (err, results) {
  if (err != null) {
    console.log(err);
    process.exit(1);
  }

  if (results == null || results.length === 0) {
    return;
  }

  var errorCount = results.reduce(function (a, b) {
    return a + b;
  });

  if (errorCount > 0) {
    console.log(errorCount + ' errors');
    process.exit(1);
  }
});