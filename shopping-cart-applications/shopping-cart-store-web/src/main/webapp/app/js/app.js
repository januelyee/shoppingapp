'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('MyShoppingApp', ['ngRoute', 'MyShoppingApp.filters', 'MyShoppingApp.services', 'MyShoppingApp.controllers', 'ngCookies', 'ng', 'ngSanitize', 'angular.filter'])
    .config(['$httpProvider', '$routeProvider', '$locationProvider', function ($httpProvider, $routeProvider, $locationProvider) {
        /* PLACE ROUTE AND APP CONFIG HERE */

        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        // Add charset to default Accept header
        $httpProvider.defaults.headers.common = {Accept: 'administration/json;charset=utf-8, text/plain, */*'};

        $routeProvider
            .when('/', {
                controller: 'GlobalCtrl',
                templateUrl: 'partials/index.html'
            })
            /*.when('/shop', {
                controller: 'ShopCtrl',
                templateUrl: 'partials/shop.html'
            })*/
            .when('/administration', {
                controller: 'AdminCtrl',
                templateUrl: 'partials/administration.html'
            })
            .otherwise({redirectTo: '/'});
    }]);


