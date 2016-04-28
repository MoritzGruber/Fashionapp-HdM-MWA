angular.module('starter.controllers', [])

.controller('EnquiresCtrl', function($scope) {})

// tab-enquires
.controller('ItemsController', ['$scope', '$http',  function($scope, $http){
  //http service to get a json file
  $http.get('js/data.json').success(function(data){
    //pass along data from http service to scope items
    $scope.items = data.items;
  });
}])

.controller('CollectionCtrl', ['$scope', '$http',  function($scope, $http){
  $http.get('js/data.json').success(function(data){
    
    //pass along data from http service to scope items
    $scope.collection = data.collection;

    // delete function
      $scope.remove = function(item) {
        $scope.collection.splice($scope.collection.indexOf(item), 1);
      };

  });
}])
