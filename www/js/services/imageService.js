angular.module('fittshot.services').service('imageService', function ($q, $http, $localStorage, API_ENDPOINT) {

    var serverUrl = API_ENDPOINT.url;
    console.log('image service si s runnu=imng');

    var urlBase = serverUrl + '/image';
    var imageService = {};


    var socket = io.connect('http://10.31.32.142:3000');


    socket.on('connect', function() {
      var delivery = new Delivery(socket);

        var userId = "58a96f45253d7a000fbac123";
        var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfYnNvbnR5cGUiOiJPYmplY3RJRCIsImlkIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbODgsMTY5LDExMSw2OSwzNyw2MSwxMjIsMCwxNSwxODYsMTkzLDM1XX0sImlhdCI6MTQ4NzYwODAwMywiZXhwIjoxNDg4MjEyODAzfQ.2XbBefZW9clyAN0Ee5wOPQhD3uigR7dAlTAj3lMti0s";
        console.log('token:'+ token);
        delivery.on('receive.start',function(userId, token ) {
        console.log('receiving a file!');
        });

        delivery.on('receive.success',function(file){
            var params = file.params;
            console.log('file receive:'+file);
            if (file.isImage()) {
                $('img').attr('src', file.dataURL());
            };
        });
    });

    imageService.createImage = function (image) {
        return $http.post(urlBase, {
            creatorId: image.creatorId,
            productId: image.productId,
            source: image.source
        });
    };

    imageService.getImages = function () {
        return $http.get(urlBase);
    };

    imageService.getImage = function (id) {
        return $http.get(urlBase + '/' + id);
    };

    imageService.deleteImage = function (id, editor) {
        return $http.delete(urlBase + '/' + id, {params: {'editor': editor}});
    };

    return imageService;
});
