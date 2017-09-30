'use strict';

angular.module('components').component('leftMenuNodeInfo', {
    templateUrl: '/html/left_menu_node_info.html',
    bindings: {
        nodeId: '<'
    },
    controller: ['$http', '$scope', '$rootScope',
        function ($http, $scope, $rootScope) {
            this.$onChanges = function (changesObj) {
                fetchNode(changesObj.nodeId.currentValue);
            };


            function fetchNode(id) {
                $http.get('/nodes/' + id, {
                    headers: {Accept: 'application/json'},
                    responseType: 'json'
                }).then(function (response) {
                    $scope.node = response.data.node;
                }, function errorCallback(response) {
                    console.error(response);
                    // if (GexUtils.isResponseCanceled(response)) {
                    //     return;
                    // }
                    // GexUtils.redirectIfSomeRespCodes(response);
                    //todo show error
                });
            }

            $scope.closeView = function () {
                $rootScope.$emit('showSearchLeft');
            }
        }
    ]
});