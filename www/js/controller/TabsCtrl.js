angular.module('fittshot.controllers').controller('TabsCtrl', function ($scope, $rootScope, $state) {

  //this controller disables the tab navigation bar for certain views/tabs
  $rootScope.$on('$ionicView.beforeEnter', function () {
    //on default we see the tabbar
    $rootScope.hideTabs = false;
    //disable tabbar when you enter the welcome screen start/welcome screen
    if ($state.current.name === 'tab.login') {
      $rootScope.hideTabs = true;
    }
  });
});
