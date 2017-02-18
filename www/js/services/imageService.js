angular.module('fittshot.services').service('imageService', function ($q, $http, API_ENDPOINT) {

    var serverUrl = API_ENDPOINT.url;

    var urlBase = serverUrl + '/image';
    var imageService = {};

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
