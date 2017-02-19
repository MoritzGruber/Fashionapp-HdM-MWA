angular.module('fittshot.controllers').controller('LoginCtrl', ['$scope', '$http', '$localStorage', '$location', 'AuthService', function ($scope, $http, $localStorage, $location, AuthService) {

    $scope.registerMode = false;
    $scope.form = {};
    $scope.form.text = "asdf";
    $scope.toggleMode = function () {
        $scope.registerMode = !$scope.registerMode;
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
            $location.path('/profile');

            $localStorage.username = result.loginName;
            $localStorage.email = result.email;
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
                console.log('Registration ' + result);

                $scope.form = null;
            });

        } else {
            //else we want a error to show up
            $scope.form.error = "Please provide a valid email";
            console.log("please provide a valid email");
        }
    };

}]);
