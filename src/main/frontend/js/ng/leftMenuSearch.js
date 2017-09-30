'use strict';

angular.module('components').component('leftMenuSearch', {
    templateUrl: '/html/left_menu_search.html',
    controller: ['$http', '$scope', '$rootScope',
        function ($http, $scope, $rootScope) {
            $scope.searchStr = undefined;

            $scope.searchNodes = function () {
                var searchStr = $scope.searchStr;
                if (_.isNil(searchStr) || searchStr.trim() === '') {
                    $scope.nodes = undefined;
                    return;
                }

                $http.get('/nodes/find', {
                    headers: {Accept: 'application/json'},
                    responseType: 'json',
                    params: {name: $scope.searchStr}
                }).then(function (response) {
                    $scope.nodes = response.data.nodes;
                }, function errorCallback(response) {
                    // if (GexUtils.isResponseCanceled(response)) {
                    //     return;
                    // }
                    // GexUtils.redirectIfSomeRespCodes(response);

                    //todo show errors
                });
            };

            $scope.getNodeLabel = function (node) {
                return node.properties.name ? node.properties.name : node.properties.title;
            };

            $scope.getNodeColor = function (node) {
                return randomColor({seed: node.types[0]});
            };

            $scope.addNodeWithNeighbours = function (node) {
                $rootScope.$emit('addNodeWithNeighbours', {node: node});
                $rootScope.$emit('showNodeInfoLeft', {id: node.id});
            };

            $scope.$on('resetSearch', function (event, data) {
                $scope.searchStr = undefined;
                $scope.nodes = undefined;
            });
        }
    ]
});