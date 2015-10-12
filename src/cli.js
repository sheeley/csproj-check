#! /usr/bin/env node

let async = require('async')
let args = require('yargs').argv
let CSProjCheck = require('./csproj-check.js')

let inputFiles = (args._ && args._.length > 0) ? args._ : ['**/*.csproj']
let options = {
  reverseCheck: args.reverseCheck,
  ignoreFiles: args.ignoreFiles
}

async.map(inputFiles, (fileName, callback) => {
  CSProjCheck.runCheck(fileName, options, callback)
}, (err, results) => {
  if (err != null) {
    console.log(err)
    process.exit(1)
  }

  if (results == null || results.length === 0) {
    return
  }

  let errorCount = results.reduce((a, b) => a + b)

  if (errorCount > 0) {
    console.log(`${errorCount} errors`)
    process.exit(1)
  }
})
