angular.module("fittshot",["ui.router","mobile-angular-ui","fittshot.controllers","fittshot.services","ngStorage"]).config(["$stateProvider","$urlRouterProvider",function(t,e){t.state("tab",{url:"/tab","abstract":!0,templateUrl:"templates/tabs.html"}).state("tab.community",{url:"/community",views:{"tab-community":{templateUrl:"templates/tab-community.html",controller:"CommunityCtrl"}}}).state("tab.community-detail",{url:"/community-detail/:imageId",views:{"tab-community":{templateUrl:"templates/tap-community-detail.html",controller:"CommunityCtrl"}}}).state("tab.collection",{url:"/collection",views:{"tab-collection":{templateUrl:"templates/tab-collection.html",controller:"CollectionCtrl"}}}).state("tab.collection-detail",{url:"/collection-detail/:imageId",views:{"tab-collection":{templateUrl:"templates/tap-collection-detail.html",controller:"CollectionCtrl"}}}).state("tab.profile",{url:"/profile",views:{"tab-profile":{templateUrl:"templates/tab-profile.html",controller:"ProfileCtrl"}}}).state("tab.feedback",{url:"/profile/feedback",views:{"tab-profile":{templateUrl:"templates/tap-profile-feedback.html",controller:"FeedbackCtrl"}}}).state("login",{url:"/login",templateUrl:"templates/login.html",controller:"LoginCtrl"}),e.otherwise("/login")}]),angular.module("fittshot.controllers",[]),angular.module("fittshot.services",[]),angular.module("fittshot.controllers").controller("CollectionCtrl",["$scope","$http",function(t,e){}]),angular.module("fittshot.controllers").controller("CommunityCtrl",["$scope","$http",function(t,e){}]),angular.module("fittshot.controllers").controller("FeedbackCtrl",["$scope","$http",function(t,e){}]),angular.module("fittshot.controllers").controller("LoginCtrl",["$scope","$http","$state","$localStorage",function(t,e,l,o){null!=o.username&&null!=o.email&&l.go("tab.community"),t.registerMode=!1,t.form={},t.form.text="asdf",t.toggleMode=function(){t.registerMode=!t.registerMode},t.login=function(){console.log("login with:  "+t.form.username+" and "+t.form.password),o.username=t.form.username,o.email="some@mail.fromserver",setTimeout(function(){t.form=null},0),l.go("tab.profile"),l.go("tab.community")},t.register=function(){console.log("register  with:  "+t.form.username+", "+t.form.email+" and password: "+t.form.password),void 0!=t.form.email&&null!=t.form.email?t.from=null:(t.form.error="Please provide a valid email",console.log("please provide a valid email"))}}]),angular.module("fittshot.controllers").controller("ProfileCtrl",["$scope","$http","$localStorage",function(t,e,l){t.$on("$ionicView.enter",function(){t.username=l.username,t.email=l.email}),t.logout=function(){l.username=null,l.email=null}}]),angular.module("fittshot.controllers").controller("TabsCtrl",["$scope","$rootScope","$state",function(t,e,l){e.$on("$ionicView.beforeEnter",function(){e.hideTabs=!1,"tab.login"===l.current.name&&(e.hideTabs=!0)})}]),angular.module("fittshot.services").service("authService",function(){this.login=function(){return!0},this.logout=function(){return!0},this.register=function(){return!0}}),angular.module("fittshot.services").service("pullImageService",function(){});