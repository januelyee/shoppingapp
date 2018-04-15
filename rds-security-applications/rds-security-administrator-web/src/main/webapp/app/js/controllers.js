'use strict';

/* Controllers */

angular.module('SecurityAdministratorApp.controllers', [])
    .controller('LogonCtrl', ['$scope', '$window', '$http', 'LogonService', 'contextPath', 'ReportLoginService', '$location', '$route', function ($scope, $window, $http, LogonService, contextPath, ReportLoginService, $location, $route) {
        $scope.submit = function (user) {
            if (!$scope.user) {
                $scope.addLogonAlert('Please specify a username and password', 'danger');
                return;
            }

            $scope.loading = true;

            $http({
                method: 'POST',
                url: RESTContextPath + '/webapi/logon',
                data: jQuery('#logonForm').serialize(),  // pass in data as strings
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (jwtData, ignoreStatus, ignoreHeaders, ignoreConfig) {

            }).error(function (data, status, headers, config) {
                //console.log('user logon error');
                // Error
                $scope.loading = false;

                switch (status) {
                    case 401:
                    case 404:
                        $scope.addLogonAlert('Logon failed-Invalid Credentials', 'warning');
                        break;
                    default:
                        $scope.addLogonAlert('System is currently down  or not available.  Please try later', 'danger');
                }


            });

        };

    }])
    .controller('GlobalCtrl', ['$scope', 'ControllerInfoPasser', 'FavoriteAndHistoryService', '$http', 'contextPath', 'DropboxLookup', 'SelectedProperty', '$window', '$timeout', 'TaskPasser',
        '$location', '$filter', 'QuestionnaireService', 'GeoService', 'AppModuleService', '$uibModal', '$q', 'PropertyLookup', 'DashboardService', 'ComplianceService', 'Upload', '$loading', 'BusinessContactService',
        'toaster',
        function ($scope, ControllerInfoPasser, FavoriteAndHistoryService, $http, contextPath, DropboxLookup, SelectedProperty, $window, $timeout, TaskPasser,
                  $location, $filter, QuestionnaireService, GeoService, AppModuleService, $modal, $q, PropertyLookup, DashboardService, ComplianceService, Upload, $loading, BusinessContactService, toaster) {

            var BYTES_PER_MEGABYTE = 1024 * 1024;

        }]);