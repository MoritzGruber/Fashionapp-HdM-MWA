angular.module('fittshot.controllers').controller('CommunityCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams){

  $scope.openDetail = function (imageId) {
    console.log('get fired');
    $location.path('/community-detail/'+imageId);
  };
  $scope.goBack = function () {
    $location.path('/community');
  };

  console.log($routeParams);


}]);
