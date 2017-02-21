angular.module('fittshot.controllers').controller('ProfileCtrl', ['$scope', '$http', '$localStorage', '$location', 'AuthService', function ($scope, $http, $localStorage, $location, AuthService) {

    $scope.username = $localStorage.username;
    $scope.email = $localStorage.email;

    $scope.logout = function () {
        AuthService.logout();

        $scope.id = null;
        $scope.username = null;
        $scope.email = null;

        $location.path('/login');
    };

    $scope.giveFeedback = function () {
        $location.path('/profile/feedback');
    };

    $scope.inviteFriends = function () {
        console.log('inviteFriends');
    };

}]);
