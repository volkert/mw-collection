angular.module('mwCollectionExamples', ['mwCollection', 'ngRoute'])

    .config(function ($routeProvider) {

      var resolve = {
        session: function($http) {
          return $http.get('/gofer/security-login?j_organization=vot&j_password=vot&j_username=vot')
        }
      };

      $routeProvider

          .when('/usageCollection', {
            templateUrl: 'templates/usage_collection.html',
            controller: 'UsageCollectionController',
            resolve: resolve
          })

          .when('/usageModel', {
            templateUrl: 'templates/usage_model.html',
            controller: 'UsageModelController',
            resolve: resolve
          })

          .when('/filtering', {
            templateUrl: 'templates/filtering.html',
            controller: 'FilteringController',
            resolve: resolve
          })

          .when('/pagination', {
            templateUrl: 'templates/pagination.html',
            controller: 'PaginationController',
            resolve: resolve
          })

          .when('/sorting', {
            templateUrl: 'templates/sorting.html',
            controller: 'SortingController',
            resolve: resolve
          })


          .otherwise({redirectTo: '/usageCollection'});
    })
;