angular.module('fittshot.controllers').controller('LoginCtrl', ['$scope', '$rootScope', '$http', '$localStorage', '$location', 'AuthService', function ($scope, $rootScope, $http, $localStorage, $location, AuthService) {

    $scope.registerMode = false;
    $scope.form = {};
    $scope.form.text = "asdf";
    $scope.toggleMode = function () {
        $scope.registerMode = !$scope.registerMode;
        $rootScope.modalContent = "";
    };
    $scope.login = function () {

        var user = {
            email: $scope.form.email,
            loginName: $scope.form.username,
            nickname: $scope.form.username,
            password: $scope.form.password
        };

        AuthService.login(user).then(function (result) {
            setTimeout(function () {
                $scope.form = null;
            }, 0);
            $location.path('/community');

            $localStorage.username = result.loginName;
            $localStorage.email = result.email;
        }, function (error) {
            $rootScope.modalContent = "Login data incorrect!";
            $rootScope.Ui.turnOn('loginModal');
        });


    };
    $scope.register = function () {
        if ($scope.form.email != undefined && $scope.form.email != null) {
            //make sure all data is set correctly

            var user = {
                email: $scope.form.email,
                loginName: $scope.form.username,
                nickname: $scope.form.username,
                password: $scope.form.password
            };

            AuthService.register(user).then(function (result) {
                $scope.toggleMode();
                $rootScope.modalContent = "Registration successful!";
                $rootScope.Ui.turnOn('loginModal');
            }, function (error) {
                console.log('error');
                console.log(error);
                $rootScope.modalContent = "This username is not available any more!";
                $rootScope.Ui.turnOn('loginModal');
            });

        } else {
            //else we want a error to show up
            $rootScope.modalContent = "Please provide a valid email";
            $rootScope.Ui.turnOn('loginModal');
        }
    };

    $scope.closeModal = function(modal) {
        $rootScope.Ui.turnOff(modal);
    };

}]);
