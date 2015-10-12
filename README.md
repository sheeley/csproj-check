# csproj-check
[![Travis build status](http://img.shields.io/travis/sheeley/csproj-check.svg?style=flat)](https://travis-ci.org/sheeley/csproj-check)
[![Code Climate](https://codeclimate.com/github/sheeley/csproj-check/badges/gpa.svg)](https://codeclimate.com/github/sheeley/csproj-check)
[![Test Coverage](https://codeclimate.com/github/sheeley/csproj-check/badges/coverage.svg)](https://codeclimate.com/github/sheeley/csproj-check)
[![Dependency Status](https://david-dm.org/sheeley/csproj-check.svg)](https://david-dm.org/sheeley/csproj-check)
[![devDependency Status](https://david-dm.org/sheeley/csproj-check/dev-status.svg)](https://david-dm.org/sheeley/csproj-check#info=devDependencies)

Check visual studio csproj files for errors. Useful as a git pre-commit hook.

## Installation
`npm i -g csproj-check`

## Usage
```
csproj-check # defaults to **/*
csproj-check a/specific/project.csproj another/project.csproj
```

## Add Git pre-commit hook
```
ln -s `which csproj-check` .git/hooks/pre-commit
```
