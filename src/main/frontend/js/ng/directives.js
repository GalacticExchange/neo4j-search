'use strict';

var directives = angular.module('directives', []);

directives.directive('mdcButton', function () {
    return {
        restrict: 'C',
        link: {
            pre: angular.noop,
            post: function ($scope, el) {
                mdc.ripple.MDCRipple.attachTo(el[0]);
            }
        }
    };
});
