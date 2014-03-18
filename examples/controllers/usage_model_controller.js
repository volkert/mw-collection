angular.module('mwCollectionExamples')

    .controller('UsageModelController', function ($scope, MwModel) {

      var Category = MwModel.extend({
        urlRoot: '/relution/api/v1/categories',
        defaults: function() {
          return {
            name: {},
            description: {}
          }
        }
      });

      $scope.category = new Category();
    })

;