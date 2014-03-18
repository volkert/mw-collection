angular.module('mwCollectionExamples')

    .controller('PaginationController', function ($scope, MwCollection) {

      var Categories = MwCollection.extend({
        perPage: 3,
        url: '/relution/api/v1/categories'
      });

      var categories = $scope.categories = new Categories();

      categories.fetch();
    })

;