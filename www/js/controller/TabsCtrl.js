angular.module('fittshot.controllers').controller('TabsCtrl', function ($scope, $rootScope, $location, $localStorage) {

    $scope.bannerImage = 'img/banners/community.png';
    $scope.showNavigation = false;
    $scope.redirectTo = function (dest) {
        $location.path('/' + dest);
        switch (dest) {
            case 'community':
                $scope.indicatorMargin = '0';
                $scope.bannerImage = 'img/banners/community.png';
                $scope.bannerHeadline = 'Community';
                break;
            case 'collection':
                $scope.indicatorMargin = '33.333%';
                $scope.bannerImage = 'img/banners/collection.png';
                $scope.bannerHeadline = 'Collection';
                break;
            case 'profile':
                $scope.indicatorMargin = '66.666%';
                $scope.bannerImage = 'img/banners/profile.png';
                $scope.bannerHeadline = 'Profile';
        }
    };

    var navPages = ['/community', '/collection', '/profile'];

    $scope.$on('$routeChangeSuccess', function () {
        $scope.showNavigation = navPages.indexOf($location.$$path) != -1;
    });
});
