angular.module('fittshot.controllers').controller('TabsCtrl', function ($scope, $rootScope, $location) {

  $scope.redirectTo = function (dest) {
    $location.path('/'+dest);
  };
});
