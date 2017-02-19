angular.module('fittshot.services').service('AuthService', function ($q, $http, API_ENDPOINT) {

    var LOCAL_TOKEN_KEY = 'myTokenKey';
    var isAuthenticated = false;
    var authToken;

    var login = function (user) {
        return $q(function (resolve, reject) {
            $http.post(API_ENDPOINT.url + '/user/login', {
                email: user.email,
                loginName: user.loginName,
                nickname: user.nickname,
                password: user.password
            }).then(function (result) {
                if (result.data.success) {
                    storeUserCredentials(result.data, user);
                    resolve(result.data);
                } else {
                    reject(result.data.response);
                }
            });
        });
    };

    var logout = function () {
        destroyUserCredentials();
    };

    var register = function (user) {
        return $q(function (resolve, reject) {
            $http.post(API_ENDPOINT.url + '/user/register', user).then(function (result) {
                if (result.data.success) {
                    resolve(result.data.response);
                } else {
                    reject(result.data.response);
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

    function storeUserCredentials(data) {
        window.localStorage.setItem(LOCAL_TOKEN_KEY, data.token);
        window.localStorage.setItem('user._id', data.id);
        window.localStorage.setItem('user.name', data.loginName);
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
