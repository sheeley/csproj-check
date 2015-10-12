let fs = require('fs')
let XmlStream = require('xml-stream')
let path = require('path')
let Glob = require('glob').Glob
let async = require('async')

const CS_PROJ = '.csproj'

class CSProjCheck {
  constructor(fileName, options) {
    options = options || {}
    this.fileName = fileName
    this.reverseCheck = options.reverseCheck
    this.ignoreFiles = options.ignoreFiles
    this.paths = {}
    this.count = 0
    this.errors = 0
    this.parsed = path.parse(fileName)
  }

  run(callback) {
    let self = this

    fs.exists(this.fileName, (exists) => {
      if (!exists) {
        callback(-1)
        return
      }

      let stream = fs.createReadStream(self.fileName)
      let xml = new XmlStream(stream)

      xml.on('updateElement: Compile', self.fileExists.bind(self))
      xml.on('updateElement: Content', self.fileExists.bind(self))
      xml.on('end', () => {
        // if (self.reverseCheck) {
        //   self.checkFileTree.call(self, callback)
        // } else {
        callback(null, self.errors)
        // }
      })
    })
  }

  fileExists(item) {
    let self = this
    this.count++
    let filePath = path.join(this.parsed.dir, unescape(item.$.Include.replace(/\\/g, path.sep)))
    if (this.reverseCheck) {
      this.paths[filePath] = true
    }

    fs.exists(filePath, (exists) => {
      if (!exists) {
        self.log(`${filePath} doesn't exist!`)
        self.errors++
      }
    })
  }

  // checkFileTree(callback) {
  //   this.log(`checking ${this.fileName}`)
  //   let self = this
  //   let globStr = this.parsed.dir + '/**/*'
  //   if (this.ignoreFiles != null && this.ignoreFiles.length > 0) {
  //     globStr = this.parsed.dir + '/**/!(*' + this.ignoreFiles.join('*|*') + ')'
  //   }
  //   this.log('globstr', globStr)
  //   let glob = new Glob(globStr)
  //   glob.on('match', (filePath) => {
  //     if (filePath.indexOf('node_modules') !== -1) {
  //       return
  //     }
  //     let resolvedPath = filePath.replace(self.parsed.dir + '/', '')
  //     this.log(resolvedPath)
  //     if (self.paths[resolvedPath] !== true) {
  //       self.errors++
  //       self.log(`${filePath} is missing from csproj`)
  //     }
  //   })
  //   glob.on('end', () => {
  //     callback(null, self.errors)
  //   })
  // }

  log(message) {
    console.log(`${this.fileName}: ${message}`)
  }

  static runCheck(inputFile, options, callback) {
    if (typeof (options) == 'function' && callback == null) {
      callback = options
      options = {}
    }

    if (callback == null) {
      return
    }

    if (inputFile == null || inputFile === '') {
      callback(-1)
      return
    }

    let glob = new Glob(inputFile)
    glob.on('end', (files) => {
      if (files.length > 0) {
        async.map(files, (fileName, cb) => {
          let checker = new CSProjCheck(fileName, options)
          checker.run(cb)
        }, (err, errorCounts) => {
          callback(errorCounts.reduce((a, b) => a + b))
        })
      } else {
        callback(-1)
      }
    })
  }
}

export default CSProjCheck
