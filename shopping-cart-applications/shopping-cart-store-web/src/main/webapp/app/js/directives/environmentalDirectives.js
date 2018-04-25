/**
 * Created with JetBrains WebStorm.
 * User: Januel
 * Date: 13/11/13
 * Time: 4:23 PM
 * To change this template use File | Settings | File Templates.
 */

angular.module('myApp.environmentalDirectives', []).
    directive('appVersion', ['version', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    }])
    .directive('folder', function () {
        return {
            template: '<div ng-repeat="item in items">' +
            '<a href="">' +
            '<span ng-click="toggleCollapse(category)"><i class="{{ category.collapseIcon }} i-grey"></i>{{category.label }}</span>' +
            '</a>' +
            '<ul class="unstyled" style="margin-left: 15px" collapse="false">' +
            '<menu ></menu>' +
            '</ul>',
            restrict: 'E',
            replace: true,
            scope: {
                items: '=items'
            }
        };
    })
    .directive('menu', ['$compile', function ($compile) {
        return {
            restrict: 'E',
            template: '<li><a href="" ng-click="changeMenuItem( item )"><i class="{{ item.icon }}" ng-class="isSelected( item )"></i>{{ item.label }}</a></li>',
            link: function (scope, elm, attrs) {
                if (scope.item.menus.length > 0) {
                    var children = $compile('<folder items="item.menus"></folder>')(scope);
                    elm.append(children);
                }
            }
        };

    }]);
