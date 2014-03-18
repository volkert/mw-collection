angular.module('mwCollectionExamples')

    .controller('UsageCollectionController', function ($scope, MwCollection) {

      var Categories = MwCollection.extend({
        url: '/relution/api/v1/categories'
      });

      var categories = $scope.categories = new Categories();

      categories.fetch();
    })

;