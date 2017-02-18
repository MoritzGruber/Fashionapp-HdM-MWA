angular.module('fittshot.services').service('authService', function ($q, $http, API_ENDPOINT) {

    var LOCAL_TOKEN_KEY = 'myTokenKey';
    var isAuthenticated = false;
    var authToken;

    this.login = function (user) {
        return $q(function (resolve, reject) {
            $http.post(API_ENDPOINT.url + '/authenticate', user).then(function (result) {
                console.log(result.data);
                if (result.data.success) {
                    storeUserCredentials(result.data, user);
                    resolve(result.data.user);
                } else {
                    reject(result.data.message);
                }
            });
        });
    };

    this.logout = function () {
        destroyUserCredentials();
    };

    this.register = function (user) {
        return $q(function (resolve, reject) {
            $http.post(API_ENDPOINT.url + '/register', user).then(function (res) {
                if (res.data.success) {
                    resolve(res.data.message);
                } else {
                    reject(res.data.message);
                }
            });
        });
    };

    function loadUserCredentials() {
        var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
        if (token) {
            useCredentials(token);
        }
    }

    function storeUserCredentials(data, user) {
        window.localStorage.setItem(LOCAL_TOKEN_KEY, data.token);
        window.localStorage.setItem('user._id', user._id);
        window.localStorage.setItem('user.name', user.name);
        window.localStorage.setItem('user.password', user.password);
        useCredentials(data.token);
    }

    function useCredentials(token) {
        isAuthenticated = true;
        authToken = token;

        // Set the token as header for your requests!
        $http.defaults.headers.common.Authorization = authToken;
    }

    function destroyUserCredentials() {
        authToken = undefined;
        isAuthenticated = false;
        $http.defaults.headers.common.Authorization = undefined;
        window.localStorage.removeItem(LOCAL_TOKEN_KEY);
        window.localStorage.removeItem('user._id');
        window.localStorage.removeItem('user.name');
        window.localStorage.removeItem('user.password');
    }

    return {
        login: login,
        register: register,
        logout: logout,
        isAuthenticated: function () {
            return isAuthenticated;
        }
    };

});
