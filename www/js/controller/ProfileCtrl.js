angular.module('fittshot.controllers').controller('ProfileCtrl', ['$scope', '$http', '$localStorage', function($scope, $http, $localStorage){

    $scope.$on('$ionicView.enter', function() {
     // Code you want executed every time view is opened
     $scope.username = $localStorage.username;
     $scope.email = $localStorage.email;
  })
    $scope.logout = function(){
      $localStorage.username = null;
      $localStorage.email = null;
    }

}]);
