angular.module('fittshot.services').service('voteService', function ($q, $http, API_ENDPOINT) {

    var serverUrl = API_ENDPOINT.url;

    var urlBase = serverUrl + '/vote';
    var voteService = {};

    voteService.createVote = function (vote) {
        return $http.post(urlBase, {
            value: vote.value,
            userId: vote.userId,
            imageId: vote.imageId
        });
    };

    voteService.getVotes = function () {
        return $http.get(urlBase);
    };

    voteService.getVote = function (id) {
        return $http.get(urlBase + '/' + id);
    };

    voteService.getVotesOfImage = function (id) {
        return $http.get(urlBase + '/ofImage/' + id);
    };

    voteService.deleteVote = function (id, editor) {
        return $http.delete(urlBase + '/' + id, {params: {'editor': editor}});
    };

    voteService.hasUserVotedImage = function (userId, imageId) {
        return $http.get(urlBase + '/hasUserVotedImage', {params: {'userId': userId, 'imageId': imageId}});
    };

    return voteService;
});