# ginkgo-lens README

CodeLens provider and test runner for Visual Studio Code that supports [Ginkgo](https://onsi.github.io/ginkgo/) tests.

## Features

Run Ginkgo tests from:
* Files - Run all the tests in a file via a CodeLens or the Command Palette
* Its - Run individual tests via CodeLenses
* Explorer context menu - Run all tests in a file via a context menu

## Requirements

* [Go](https://golang.org/)
* [Ginkgo](https://onsi.github.io/ginkgo/)

## Extension Settings

This extension contributes the following settings:
* `ginkgolens.args`: additional arguments to pass to the invocation of `ginkgo`
* `ginkgolens.showCommand`: display the `ginkgo` command being run in the test ouput
* `ginkgolens.includeFile`: show CodeLenses for test files
* `ginkgolens.includeIts`: show CodeLenses for `It` specs in test files

## Known Issues

* Interaction with programmatic focus uninvestigated

## Release Notes

### 1.0.0

Initial release!  Proof of concept used to gather user feedback.