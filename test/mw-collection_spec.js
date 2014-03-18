(function () {

  'use strict';

  describe('mwCollection', function () {

    beforeEach(module('mwCollection'));

    describe('mwCollection service', function () {

      var $httpBackend,
          collectionWithModel,
          mwCollectionFilter,
          filter;

      beforeEach(inject(function (MwCollection, MwModel, $injector, MwCollectionFilter) {

        mwCollectionFilter = MwCollectionFilter;

        collectionWithModel = new (MwCollection.extend({
          perPage: 5,
          model: MwModel,
          url: '/path/to/collection',
          filterValues: {
            name: null,
            category1: null,
            category2: null
          },
          filterDefinition: function () {
            return mwCollectionFilter.and([
              mwCollectionFilter.containsString('name', this.filterValues.name),
              mwCollectionFilter.or([
                mwCollectionFilter.containsString('category', this.filterValues.category1),
                mwCollectionFilter.containsString('category', this.filterValues.category2)
              ])
            ]);
          }
        }))();

        $httpBackend = $injector.get('$httpBackend');
        expect(collectionWithModel).toBeDefined();
      }));

      afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });

      it('should create a blank instance of a model', inject(function (MwModel) {
        var Foo = MwModel.extend({
          defaults: function () {
            return {
              name: {},
              description: {}
            };
          }
        });
        var model1 = new Foo();
        model1.attributes.name.de_DE = 'bar';

        var model2 = new Foo();
        expect(model2.attributes.name.de_DE).not.toBeDefined();
      }));

      it('should make a response with $http to the url specified in the model', function () {
        $httpBackend.expectGET('/path/to/collection?limit=5&offset=0').respond(200, { results: [] });
        collectionWithModel.fetch();
        $httpBackend.flush();
      });

      it('should append custom URL parameters', function () {
        $httpBackend.expectGET('/path/to/collection?foo=bar&limit=5&offset=0').respond(200, { results: [] });
        collectionWithModel.customUrlParams = { foo: 'bar' };
        collectionWithModel.fetch();
        $httpBackend.flush();
      });

      describe('Filtering', function () {

        it('should have a null filter after initialization', function () {
          expect(collectionWithModel.getFilters()).toEqual(null);
        });

        it('should set the filter if a value has been provided', function () {
          expect(collectionWithModel.getFilters()).toEqual(null);
          collectionWithModel.setFilters({ name: '' });
          expect(collectionWithModel.getFilters()).toEqual(null);
          collectionWithModel.setFilters({ name: 'Office' });
          expect(collectionWithModel.getFilters()).toEqual(mwCollectionFilter.and([
            mwCollectionFilter.containsString('name', 'Office')
          ]));

          var encodedFilter = "%7B%22type%22:%22logOp%22,%22operation%22:%22AND%22,%22filters%22:%5B%7B%22type%22:%22containsString%22,%22fieldName%22:%22name%22,%22contains%22:%22Office%22%7D%5D%7D&limit=5&offset=0";
          $httpBackend.expectGET('/path/to/collection?filter=' + encodedFilter).respond(200, { results: [] });
          collectionWithModel.fetch();

          $httpBackend.flush();
        });

        it('should set filter as an object for custom filters', function () {
          expect(collectionWithModel.getFilters()).toEqual(null);
          collectionWithModel.setCustomFilters(mwCollectionFilter.containsString('name', 'Office'));
          expect(collectionWithModel.getFilters()).toEqual(mwCollectionFilter.containsString('name', 'Office'));

          var encodedFilter = "%7B%22type%22:%22containsString%22,%22fieldName%22:%22name%22,%22contains%22:%22Office%22%7D&limit=5&offset=0";
          $httpBackend.expectGET('/path/to/collection?filter=' + encodedFilter).respond(200, { results: [] });
          collectionWithModel.fetch();

          $httpBackend.flush();
        });

        it('should reset custom filters', function () {
          expect(collectionWithModel.getFilters()).toEqual(null);
          collectionWithModel.setCustomFilters(mwCollectionFilter.containsString('name', 'Foobar'));
          expect(collectionWithModel.getFilters()).toEqual(mwCollectionFilter.containsString('name', 'Foobar'));
          collectionWithModel.resetFilters();
          expect(collectionWithModel.getFilters()).toEqual(null);
        });

        it('shoud reset predefined filters', function () {
          expect(collectionWithModel.getFilters()).toEqual(null);
          collectionWithModel.setFilters({ name: 'Foobar' });
          expect(collectionWithModel.getFilters()).toEqual(mwCollectionFilter.and([
            mwCollectionFilter.containsString('name', 'Foobar')
          ]));
          collectionWithModel.resetFilters();
        });
      });

      describe('Pagination', function () {
        it('should add parameters limit and offset with the initial values', function () {
          $httpBackend.expectGET('/path/to/collection?limit=5&offset=0').respond(200, { results: [] });
          collectionWithModel.fetch();
          $httpBackend.flush();
        });

        it('should calculate offset according to page', function () {
          $httpBackend.expectGET('/path/to/collection?limit=5&offset=5').respond(200, { results: [] });
          collectionWithModel.perPage = 5;
          collectionWithModel.page = 2;
          collectionWithModel.fetch();
          $httpBackend.flush();
        });

        it('should calculate offset according to page and per page', function () {
          $httpBackend.expectGET('/path/to/collection?limit=2&offset=4').respond(200, { results: [] });
          collectionWithModel.perPage = 2;
          collectionWithModel.page = 3;
          collectionWithModel.fetch();
          $httpBackend.flush();
        });

        it('should not send limit and offset if perPage is null', function () {
          $httpBackend.expectGET('/path/to/collection').respond(200, { results: [] });
          collectionWithModel.perPage = null;
          collectionWithModel.fetch();
          $httpBackend.flush();
        });

        it('should set settings for limit and offset manually ', function () {
          $httpBackend.expectGET('/path/to/collection?limit=18&offset=20').respond(200, { results: [] });
          collectionWithModel.limit = 18;
          collectionWithModel.offset = 20;
          collectionWithModel.fetch();
          $httpBackend.flush();
        });

        it('should override settings for pages if limit or offset have been provided', function () {
          $httpBackend.expectGET('/path/to/collection?limit=18&offset=20').respond(200, { results: [] });
          collectionWithModel.perPage = 5;
          collectionWithModel.page = 3;

          collectionWithModel.limit = 18;
          collectionWithModel.offset = 20;
          collectionWithModel.fetch();
          $httpBackend.flush();
        });

        it('should override settings for pages if limit or offset have been provided, regardless of order', function () {
          $httpBackend.expectGET('/path/to/collection?limit=18&offset=20').respond(200, { results: [] });
          collectionWithModel.limit = 18;
          collectionWithModel.offset = 20;

          collectionWithModel.perPage = 5;
          collectionWithModel.page = 3;
          collectionWithModel.fetch();
          $httpBackend.flush();
        });
      });

    });

    describe('mwCollection ng-model binding', function () {

      var elm,
          scope,
          mwModel,
          form;

      beforeEach(inject(function ($rootScope, $compile, MwModel) {

        // Use form element to make ngModel accessible
        elm = angular.element(
            '<form name="form">' +
                '<input ng-model="foobar.mwModel.attributes.name.de_DE" name="name" />' +
                '</form>'
        );

        scope = $rootScope;

        scope.foobar = {
          mwModel: new MwModel({
            name: { de_DE: 'Foobar', en_US: 'English' }
          })
        };

        $compile(elm)(scope);
        scope.$digest();

        // Expose form as helper to access model
        form = scope.form;
      }));

      it('should be bound to a model', function () {
        expect(form.name.$modelValue).toEqual('Foobar');
      });

      it('should have a binding with ng-model from scope', function () {
        scope.foobar.mwModel.set('name', {
          de_DE: 'Barfoo'
        });
        expect(form.name.$modelValue).toEqual('Barfoo');
      });

      it('should have a binding with ng-model from element', function () {
        form.name.$setViewValue('AnotherValue');
        expect(scope.foobar.mwModel.get('name')).toEqual({
          de_DE: 'AnotherValue',
          en_US: 'English'
        });
      });

    });

    describe('mwCollection selectable', function () {

      var mwCollection,
          obj1,
          obj2;

      beforeEach(inject(function (MwModel, MwCollection) {
        mwCollection = new MwCollection();
        obj1 = new MwModel({ name: 'obj1' });
        obj2 = new MwModel({ name: 'obj2' });
        mwCollection.add([obj1, obj2]);
        expect(mwCollection.length).toBe(2);
      }));

      it('should have no models selected by default', function () {
        expect(mwCollection.selectedModels().length).toBe(0);
      });

      it('should return selected models', function () {
        obj1.toggleSelect();
        expect(obj1.selected).toBe(true);
        expect(mwCollection.selectedModels().length).toBe(1);
      });

      it('should return if all models are selected', function () {
        expect(mwCollection.selectedModels().length).toBe(0);
        expect(mwCollection.allSelected()).toBe(false);
        obj1.toggleSelect();
        obj2.toggleSelect();
        expect(mwCollection.selectedModels().length).toBe(2);
        expect(mwCollection.allSelected()).toBe(true);
      });

      it('should select all', function () {
        expect(mwCollection.selectedModels().length).toBe(0);
        expect(mwCollection.allSelected()).toBe(false);
        mwCollection.selectAll();
        expect(mwCollection.selectedModels().length).toBe(2);
        expect(mwCollection.allSelected()).toBe(true);
      });

      it('should unselect all', function () {
        mwCollection.selectAll();
        expect(mwCollection.selectedModels().length).toBe(2);
        expect(mwCollection.allSelected()).toBe(true);
        mwCollection.unselectAll();
        expect(mwCollection.selectedModels().length).toBe(0);
        expect(mwCollection.allSelected()).toBe(false);
      });

      it('should toggle selection for all', function () {
        obj1.selected = true;
        expect(mwCollection.selectedModels().length).toBe(1);
        expect(mwCollection.allSelected()).toBe(false);
        mwCollection.toggleSelectAll();
        expect(mwCollection.selectedModels().length).toBe(2);
        expect(mwCollection.allSelected()).toBe(true);
        mwCollection.toggleSelectAll();
        expect(mwCollection.selectedModels().length).toBe(0);
        expect(mwCollection.allSelected()).toBe(false);
      });

      it('should return if all models are disabled', inject(function (MwCollection, MwModel) {
        expect(mwCollection.allSelected()).toBe(false);

        var AnotherModel = MwModel.extend({
          selectDisabled: function () {
            return true;
          }
        });

        var another = new MwCollection();
        obj1 = new AnotherModel({ name: 'obj1' });
        obj2 = new AnotherModel({ name: 'obj2' });
        mwCollection.add([obj1, obj2]);

        expect(another.allDisabled()).toBe(true);
      }));

    });

  });


})();