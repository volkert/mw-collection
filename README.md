[![Build Status](https://travis-ci.org/volkert/mw-collection.png?branch=master)](https://travis-ci.org/volkert/mw-collection)

# mwCollection for AngularJS and mCAP

mwCollection adds a model layer for mCAP backends to AngularJS which uses Backbone.Model and Backbone.Collection. 

# Features
* Waits for successful requests before removing/adding models by default
* Uses $http for xhr requests
* Promises for all actions (fetch, save, destroy ...)
* Allows ngModel bindings via model.attributes.myAttribute
* Functionality of Backbone.Collection and Backbone.Model wrapped into AngularJS
* Pagination support for mCAP backends
* Easy-to-use filter and sort API for mCAP backends
* Manage selections on collection/model 
* Calling setters on a model triggers an AngularJS digest

# Installation
	$ bower install https://github.com/volkert/mw-collection.git
	
Reference from your html file:

	<script src="bower_components/mw-collection/dist/mw-collection.min.js"	
	
Declare this module as a dependency in your AngularJS app:

	angular.module('yourModule, ['mwCollection'])

# Usage

See `examples/` folder for some code. To see examples in action, run `grunt serve` and go to [http://localhost:9010/examples](http://localhost:9010/examples)

# API

## MwCollection

### Filtering

Methods/keys to override on collection level:

* `filterValues` (Object) should contain key value pairs which are used in `filterDefinition()
* `filterDefinition()` should return evaluated filter string

Instance methods:

* `getFilters()`
* `setFilters(object)`
* `setCustomFilters(customFilters<MwCollectionFilter>)`
* `resetFilters()`

### Selection

Instance methods:

* `selectedModels()` returns all currently selected models
* `allSelected()` returns true/false if all models are selected
* `toggleSelectAll()` toggles selection of all models
* `selectAll()`
* `unselectAll()`
* `allDisabled()` returns if selection of all models is disabled

### Pagination

Pagination on mCAP is done with `limit` and `offset` parameters. To make pagination more easier, this framework offers an API that automatically calculates the correct values for `limit` and `offset`. 

Keys to set on collection level:

* `page` (Integer) page number to fetch. Default: 1
* `perPage` (Integer) amount of models per page. Default: 30, set to `null` if you want to disable pagination.
* `limit` (Integer) sets value directly. Overrides values calculated by `page` and `perPage`
* `offset` (Integer) sets value directly. Overrides values calculated by `page` and `perPage`
* `total` total amount of entries coming from response (to set in `parse` function)

Instance methods:

* `nextPage()` sets values to display the next page and fetches new models and adds them into the existing collection.


### Sorting

* `setSortOrder(String)` 
* `getSortOrder()`

### Custom URL parameters

* `customUrlParams` (Object) appends parameters set as key with value to URL

## MwModel

### Selection

Methods/keys to override on model level:

* `selectDisabled()` should return true/false if selection of model is disabled

Instance methods:

* `toggleSelect()`
* `selected` (Boolean) indicates if a model is currently selected 

## MwCollectionFilter

Logical operators to link filters:

* `and(filtersArray)` connect given array of filters with AND operator
* `or(filtersArray)` connect given array of filters with OR operator
* `nand(filtersArray)` connect given array of filters with NAND (not AND) operator

Content filters:

* `containsString(fieldName, value)`
* `boolean(fieldName, value)`
* `like(fieldName, value)`
* ...

There are many more content filters available, but there is no implementation yet. See [Contributing](#contributing) for more information how to contribute!


# [Contributing](id:contributing)
Feel free to fork it on Github and send pull requests!

Run test specs with karma in chrome:

	$ grunt test 

Build minified version to dist folder

	$ grunt

# Todo
* Persist filter/sort settings and make it configurable as a feature
* Add all existing filters as functions to `MwCollectionFilter`. <br/>
  See: [Filter mechanism (mCAP REST API) - M-Way Solutions Wiki](https://wiki.mwaysolutions.com/confluence/display/mCAPTECH/mCAP+REST+API#mCAPRESTAPI-Filtermechanism)
* Make some options configurable. For example `{ wait: true }` as default request option
	
# License

The MIT License (MIT)

Copyright (c) 2014 M-Way Solutions GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
