'use strict';

var graphApp = angular.module('graphApp', ['ngRoute', 'components', 'directives', 'gxFilters']);

graphApp.constant('ROUTES', {
    ROOT: '/',

    getAddr: function (route) {
        var result = '#' + this[route];
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                result = result.replace(/:\w+\/{0}/, arguments[i]);
            }
        }
        return result;
    },

    getNgAddr: function (route) {
        var result = this[route];
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                result = result.replace(/:\w+\/{0}/, arguments[i]);
            }
        }
        return result;
    }
});

graphApp.config(['$routeProvider', 'ROUTES',
    function ($routeProvide, ROUTES) {
        $routeProvide.when(ROUTES.ROOT, {
            template: '<main-page></main-page>'
        }).when(undefined, {redirectTo: ROUTES.ROOT})
            .otherwise({
                template: '<h1>404 not found</h1>'
            });
    }
]);

