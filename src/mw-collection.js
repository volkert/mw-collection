(function () {

  'use strict';

  // Add { wait: true } to options, don't overwrite the value that's already set!
  var addWaitToOptions = function (opts) {
    opts = opts || {};
    opts.wait = angular.isDefined(opts.wait) ? opts.wait : true;
    return opts;
  };

  // Call the fn on the prototype of klass, adds global options
  var callSuperAndAddGlobalOptions = function (klass, fn) {
    return function (opts) {
      opts = addWaitToOptions(opts);
      return klass.prototype[fn].apply(this, [opts]);
    };
  };

  angular.module('mwCollection', [])

      .run(function ($http) {
        Backbone.ajax = function (options) {

          // Ignore notifications for given response codes
          if(options.data) {
            var requestData = JSON.parse(options.data);
            options.ignoreHandleResponseCodes = requestData.ignoreHandleResponseCodes;
          }

          // Set HTTP Verb as 'method'
          options.method = options.type;
          // Use angulars $http implementation for requests
          return $http.apply(angular, [options]).then(options.success, options.error);
        };
      })

      .factory('MwCollection', function (MwModel) {

        return Backbone.Collection.extend({
          model: MwModel,
          create: callSuperAndAddGlobalOptions(Backbone.Collection, 'create'),
          _filters: null,
          initialize: function() {
            // Copy initial filter values into variable where it can be recovered on resetFilters()
            this.__initialFilterValues = angular.copy(this.filterValues);

            // TODO: load persisted filters into this.filterValues and sortOrder here
            // ....
          },
          getFilters: function () {
            // Custom filter definition existing?
            if (angular.isFunction(this.filterDefinition) && this._filters === null) {
              return this.filterDefinition();
            } else {
              return this._filters;
            }
          },
          filterValues: {},
          setFilters: function (filterMap) {
            // TODO: persist filters here
            // ....

            angular.forEach(filterMap, function (value, key) {
              if (_.has(this.filterValues, key)) {
                this.filterValues[key] = value;
              } else {
                throw new Error('Filter named \'' + key + '\' not found, did you add it to filterValues of the model?');
              }
            }, this);
          },
          setCustomFilters: function (customFilter) {
            this._filters = customFilter;
          },
          resetFilters: function () {
            this.filterValues = angular.copy(this.__initialFilterValues);
            this._filters = null;
          },
          sync: function (method, model, options) {
            options.params = options.params || {};

            if (method === 'read') {
              // Filter functionality
              var filter = this.getFilters();
              if (filter) {
                options.params.filter = filter;
              }

              // Pagination functionality
              if (this.perPage && this.page) {
                options.params.limit = this.perPage;

                // Calculate offset
                options.params.offset = this.page > 1 ? this.perPage * (this.page - 1) : 0;
              }

              // Sort order
              if (this._sortOrder) {
                options.params.sortOrder = this._sortOrder;
              }

              // Fallback to limit and offset if they're set manually, overwrites pagination settings
              if (this.limit || this.offset) {
                options.params.limit = this.limit;
                options.params.offset = this.offset;
              }

              // Custom URL parameters
              if (this.customUrlParams) {
                angular.extend(options.params, this.customUrlParams);
              }
            }

            return Backbone.Collection.prototype.sync.apply(this, [method, model, options]);
          },
          parse: function (response) {
            this.total = response.data.total;
            return response.data.results;
          },
          selectedModels: function () {
            var selectedModels = [];

            angular.forEach(this.models, function (model) {
              if (model.selected) {
                selectedModels.push(model);
              }
            });

            return selectedModels;
          },
          allSelected: function () {
            var allSelected = true;
            angular.forEach(this.models, function (model) {
              if (allSelected) {
                allSelected = model.selected;
              }
            });
            return allSelected;
          },
          toggleSelectAll: function () {
            if (this.allSelected()) {
              this.unselectAll();
            } else {
              this.selectAll();
            }
          },
          selectAll: function () {
            angular.forEach(this.models, function (model) {
              model.selected = true;
            });
          },
          unselectAll: function () {
            angular.forEach(this.models, function (model) {
              model.selected = false;
            });
          },
          allDisabled: function () {
            var allDisabled = true;
            angular.forEach(this.models, function (model) {
              if (allDisabled) {
                allDisabled = model.selectDisabled();
              }
            });
            return allDisabled;
          },
          limit: null,
          offset: null,
          page: 1,
          perPage: 30,
          nextPage: function () {
            this.page += 1;
            this.fetch({remove: false});
          },
          _sortOrder: null,
          setSortOrder: function(sortOrder) {
            // TODO: persist sortOrder here
            // ....
            this._sortOrder = sortOrder;
          },
          getSortOrder: function() {
            return this._sortOrder;
          },
          customUrlParams: null
        });

      })

      .factory('MwModel', function ($rootScope) {

        return Backbone.Model.extend({
          idAttribute: 'uuid',
          destroy: callSuperAndAddGlobalOptions(Backbone.Model, 'destroy'),
          save: callSuperAndAddGlobalOptions(Backbone.Model, 'save'),
          initialize: function() {
            // When a model gets removed, make sure to decrement the total count on the collection
            this.on('destroy', function() {
              if(this.collection.total && this.collection.total > 0) {
                this.collection.total--;
              }
            }, this);
          },
          parse: function (response) {
            // For standalone models, parse the response
            if (response.data && response.data.results) {
              return response.data.results[0];
              // If Model is embedded in collection, it's already parsed correctly
            } else {
              return response;
            }
          },
          set: function () {
            var callSet = Backbone.Model.prototype.set.apply(this, arguments);

            // Trigger digest cycle to make calls to set recognizable by angular
            if (!$rootScope.$$phase) {
              $rootScope.$apply();
            }
            return callSet;
          },
          selected: false,
          toggleSelect: function () {
            if (!this.selectDisabled()) {
              this.selected = !this.selected;
            }
          },
          selectDisabled: function () {
            return false;
          }
        });

      })

      .factory('MwCollectionFilter', function () {

        // If it is an invalid value return null otherwise the provided object
        var returnNullOrObjectFor = function (value, object) {
          return (!angular.isDefined(value) || value === null || value === '') ? null : object;
        };

        // See https://wiki.mwaysolutions.com/confluence/display/mCAPTECH/mCAP+REST+API#mCAPRESTAPI-Filter
        // for more information about mcap filter api
        return {
          containsString: function (fieldName, value) {
            return returnNullOrObjectFor(value, {
              type: 'containsString',
              fieldName: fieldName,
              contains: value
            });
          },

          and: function (filters) {
            return this.logOp(filters, 'AND');
          },

          nand: function (filters) {
            return this.logOp(filters, 'NAND');
          },

          or: function (filters) {
            return this.logOp(filters, 'OR');
          },

          logOp: function (filters, operator) {
            filters = _.without(filters, null); // Removing null values from existing filters

            return filters.length === 0 ? null : { // Ignore logOps with empty filters
              type: 'logOp',
              operation: operator,
              filters: filters
            };
          },

          boolean: function (fieldName, value) {
            return returnNullOrObjectFor(value, {
              type: 'boolean',
              fieldName: fieldName,
              value: value
            });
          },

          like: function (fieldName, value) {
            return returnNullOrObjectFor(value, {
              type: 'like',
              fieldName: fieldName,
              like: value
            });
          }
        };

      })
  ;

})();