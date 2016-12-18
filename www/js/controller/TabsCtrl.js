angular.module('fittshot.controllers').controller('TabsCtrl', function ($scope, $rootScope, $location, $localStorage) {
  if ($localStorage.username === null ){
    $location.path('/login);');

  }
  console.log($localStorage.username);
  $scope.redirectTo = function (dest) {
    $location.path('/'+dest);
  };
});
