'use strict';

angular.module('components').component('leftMenu', {
    templateUrl: '/html/left_menu.html',
    controller: ['$scope', '$rootScope',
        function ($scope, $rootScope) {
            $scope.activeView = 'search';

            var showInfoListener = $rootScope.$on('showNodeInfoLeft', function (event, data) {
                $scope.selectedNodeId = data.id;
                $scope.activeView = 'nodeInfo';
            });

            var showSearchListener = $rootScope.$on('showSearchLeft', function (event, data) {
                $scope.activeView = 'search';
                if (data && data.reset) {
                    $scope.$broadcast('resetSearch');
                }
            });

            $scope.$on('$destroy', function (event) {
                showInfoListener();
                showSearchListener();
            });
        }
    ]
});