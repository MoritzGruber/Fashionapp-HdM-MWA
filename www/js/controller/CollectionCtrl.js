angular.module('fittshot.controllers').controller('CollectionCtrl', ['$scope', '$http', '$location', '$routeParams',  function($scope, $http, $location, $routeParams){
  $scope.openDetail = function (imageId) {
    console.log('get fired2');

    $location.path('/collection-detail/'+imageId);
  }
  $scope.goBack = function () {
    $location.path('/collection');
  }
  console.log($routeParams);

}]);
