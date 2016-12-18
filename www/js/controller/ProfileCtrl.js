angular.module('fittshot.controllers').controller('ProfileCtrl', ['$scope', '$http', '$localStorage', '$location', function ($scope, $http, $localStorage, $location) {

  $scope.username = $localStorage.username;
  $scope.email = $localStorage.email;

  $scope.logout = function () {
    $localStorage.username = null;
    $localStorage.email = null;
    $location.path('/login');
  };
  $scope.giveFeedback = function () {
    $location.path('/profile/feedback');
  };

  $scope.inviteFriends = function () {
    console.log('inviteFriends');
  };

}]);
