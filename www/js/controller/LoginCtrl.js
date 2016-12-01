angular.module('fittshot.controllers').controller('LoginCtrl', ['$scope', '$http', function($scope, $http) {
  $scope.registerMode = false;

  $scope.toggleMode = function () {
    $scope.registerMode = !$scope.registerMode;
  };
  $scope.login = function (username, password) {
    console.log('login with:  '+username+ ' and '+ password);
    $scope.from = null;
    console.log($scope);
  };
  $scope.register = function (username, password, email) {
    console.log('register  with:  '+username+ ', '+email+ ' and password: '+ password);
    $scope.from = null;
    console.log($scope);
  }




}]);
