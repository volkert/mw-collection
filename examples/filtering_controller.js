angular.module('mwCollectionExamples')

    .controller('FilteringController', function ($scope, MwCollection, MwCollectionFilter) {

      var Categories = MwCollection.extend({
        url: '/relution/api/v1/categories',
        filterValues: {
          name: ''
        },
        filterDefinition: function() {
          return MwCollectionFilter.containsString('name', this.filterValues.name)
        }
      });

      var categories = $scope.categories = new Categories();

      categories.fetch();
    })

;