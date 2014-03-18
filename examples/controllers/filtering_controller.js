angular.module('mwCollectionExamples')

    .controller('FilteringController', function ($scope, MwCollection, MwCollectionFilter) {

      var Apps = MwCollection.extend({
        url: '/relution/api/v1/apps/baseInfo',
        filterValues: {
          name: '',
          platform: ''
        },
        filterDefinition: function() {
          return MwCollectionFilter.and([
            MwCollectionFilter.containsString('defaultName', this.filterValues.name),
            MwCollectionFilter.like('platforms', this.filterValues.platform)
          ])
        }
      });

      var apps = $scope.apps = new Apps();

      apps.fetch();
    })

;