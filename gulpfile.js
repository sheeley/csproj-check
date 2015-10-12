const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const del = require('del')
const path = require('path')
const mkdirp = require('mkdirp')
const isparta = require('isparta')

const manifest = require('./package.json')
const config = manifest.nodeBoilerplateOptions
const mainFile = manifest.main
const destinationFolder = path.dirname(mainFile)

// Remove the built files
gulp.task('clean', function(cb) {
  del([destinationFolder], cb)
})

function jscsNotify(file) {
  if (!file.jscs) { return }
  return file.jscs.success ? false : 'JSCS failed'
}

function createLintTask(taskName, files) {
  gulp.task(taskName, function() {
    return gulp.src(files)
      .pipe($.plumber())
      .pipe($.jscs())
      .pipe($.notify(jscsNotify))
  })
}

// Lint our source code
createLintTask('lint-src', ['src/**/*.js'])

// Lint our test code
createLintTask('lint-test', ['test/**/*.js'])

// Build two versions of the library
gulp.task('build', ['lint-src', 'clean'], function() {
  var filter = $.filter('src/cli.js')
  // Create our output directory
  mkdirp.sync(destinationFolder)
  return gulp.src('src/**/*.js')
    .pipe($.plumber())
    .pipe($.babel({blacklist: ['useStrict']}))
    .pipe(filter)
    .pipe($.chmod(755))
    .pipe(filter.restore())
    .pipe(gulp.dest(destinationFolder))

})

function test() {
  return gulp.src(['test/setup/node.js', 'test/unit/**/*.js'], {read: false})
    .pipe($.plumber())
    .pipe($.mocha({reporter: 'dot', globals: config.mochaGlobals}))
}

// Make babel preprocess the scripts the user tries to import from here on.
require('babel/register')

gulp.task('coverage', function(done) {
  gulp.src(['src/*.js'])
    .pipe($.plumber())
    .pipe($.istanbul({instrumenter: isparta.Instrumenter}))
    .pipe($.istanbul.hookRequire())
    .on('finish', function() {
      return test()
      .pipe($.istanbul.writeReports())
      .on('end', done)
    })
})

// Lint and run our tests
gulp.task('test', ['lint-src', 'lint-test'], test)

// Run the headless unit tests as you make changes.
gulp.task('watch', ['test'], function() {
  gulp.watch(['src/**/*', 'test/**/*', 'package.json', '**/.jshintrc', '.jscsrc'], ['test'])
})

// An alias of test
gulp.task('default', ['test'])
