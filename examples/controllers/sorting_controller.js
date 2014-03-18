angular.module('mwCollectionExamples')

    .controller('SortingController', function ($scope, MwCollection) {

      var Apps = MwCollection.extend({
        url: '/relution/api/v1/apps/baseInfo'
      });

      var apps = $scope.apps = new Apps();

      apps.fetch();

      $scope.sort = function() {
        var prefix = '+';
        if(apps.getSortOrder() === '+defaultName') {
          prefix = '-';
        }
        apps.setSortOrder(prefix + 'defaultName');
        apps.fetch();
      };
    })

;