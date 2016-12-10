angular.module('fittshot.controllers').controller('LoginCtrl', ['$scope', '$http', '$state', '$localStorage', function($scope, $http, $state, $localStorage) {
  //check if already loged in
  if($localStorage.username != null && $localStorage.email != null){
    $state.go('tab.community');
  }

  $scope.registerMode = false;
  $scope.form = {};
  $scope.form.text = "asdf";
  $scope.toggleMode = function () {
    $scope.registerMode = !$scope.registerMode;
  };
  $scope.login = function () {
    console.log('login with:  '+$scope.form.username+ ' and '+ $scope.form.password);
        $localStorage.username = $scope.form.username;
        $localStorage.email = "some@mail.fromserver";

        setTimeout(function(){
          $scope.form = null;
        }, 0);
        $state.go('tab.profile');

        $state.go('tab.community');
  };
  $scope.register = function () {
    console.log('register  with:  '+$scope.form.username+ ', '+$scope.form.email+ ' and password: '+ $scope.form.password);
    if ($scope.form.email != undefined && $scope.form.email != null){
      //make sure all data is set correctly

      $scope.from = null;

    }else{
      //else we want a error to show up
      $scope.form.error = "Please provide a valid email";
      console.log("please provide a valid email");
    }
  }




}]);
