'use strict';

var gxFilters = angular.module("gxFilters", []);

gxFilters.filter('getNodeName', function () {
    return function (node) {
        if (node) {
            return node.title ? node.title : node.name;
        } else {
            return undefined;
        }
    };
});
