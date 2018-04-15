'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('SecurityAdministratorApp', ['ngRoute', 'SecurityAdministratorApp.filters', 'SecurityAdministratorApp.services',
    'SecurityAdministratorApp.directives', 'SecurityAdministratorApp.controllers', 'myApp.administrationControllers', 'ui.bootstrap.risk',
    'ngCookies', 'ng', 'ngFileUpload', 'ngSanitize', 'mgcrea.ngStrap.tooltip', 'mgcrea.ngStrap.popover', 'myApp.insuranceControllers', 'ngDragDrop',
    'ui.sortable', 'checklist-model', 'angular.filter', 'slick', 'autocomplete', 'textAngular', 'darthwade.loading', 'toaster']).
    config(['$httpProvider', '$routeProvider', '$locationProvider', function ($httpProvider, $routeProvider, $locationProvider) {
        /* PLACE ROUTE AND APP CONFIG HERE */


        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        // Add charset to default Accept header
        $httpProvider.defaults.headers.common = {Accept: 'administration/json;charset=utf-8, text/plain, */*'};

        $routeProvider
            .when('/', {
                controller: 'MainPageCtrl',
                templateUrl: 'partials/main.html',
                resolve: {user: resolveUser}
            })
            .when('/sustainability', {
                controller: 'SustainabilityCtrl',
                templateUrl: 'partials/sustainability.html',
                resolve: {user: resolveUser}
            })
            .otherwise({redirectTo: '/'});
    }]);


