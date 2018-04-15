/*
 *
 *  * Copyright (c) 2015. Refined Data Solutions. All Rights Reserved
 *
 */

'use strict';

/* Controllers */

angular.module('myApp.administrationControllers', [])
    .controller('AdminCtrl', ['$rootScope', '$location', '$scope', '$http', '$timeout', 'Upload', 'UserService', 'RoleService', 'contextPath', 'ControllerInfoPasser', 'ProfileService', '$route', 'RecordAlertConfigService', 'UnitConversionService', function ($rootScope, $location, $scope, $http, $timeout, Upload, UserService, RoleService, contextPath, ControllerInfoPasser, ProfileService, $route, RecordAlertConfigService, UnitConversionService) {
        $scope.$on('event:adminRefresh', function () {
            $route.reload();
        });

        if ($rootScope.isAdmin == false) {
            $location.url('/');
        }

        var spinner = new Spinner();
        var spinnerTarget = document.getElementById("spinTarget");

        $scope.moduleSecurityList = [];

        $scope.addAlert = function (msg, type) {

            if ($scope.alerts.length > 0) {
                $scope.alerts.splice(0, 1);
            }

            $scope.alerts.push({msg: msg, type: type});

            $timeout(function () {  // Close alert after 5000 ms (5s)
                $scope.alerts.splice(0, 1);
            }, 5000);
        };

        $scope.administration = {
            title: 'Administration'
        };

        $http.get('json/adminmenu.json').success(function (data) {
            $scope.adminmenu = data;
        });

        $scope.toggleCollapse = function (menuitem) {

            menuitem.collapsed = !menuitem.collapsed;

            if (menuitem.collapsed) {
                menuitem.collapseIcon = "icon-plus";
            } else {
                menuitem.collapseIcon = "icon-minus";
            }
        };

        $scope.changeUserSectionTo = function (section) {
            $scope.userSection = section;
        };

        $scope.changeMiddleSectionTo = function (section) {
            $scope.middleSection = section;
        };

        $scope.executeMiddleSection = function (subMenuItem) {
            if (subMenuItem.label === 'Add Role') {
                $scope.userRoleFormMode = 'Add';
                $scope.addRoleMode = true;
                $scope.editMode = true;
                // $scope.selected = undefined;

            } else {
                if (subMenuItem.label === 'Edit Role') {
                    $scope.addRoleMode = false;
                    $scope.editMode = false;
                    // $scope.selected = undefined;

                } else {
                    $scope.selected = subMenuItem;
                }
            }
            $scope.changeMiddleSectionTo(subMenuItem.partialHTML);
        };

        $scope.changeMenuItem = function (subMenuItem) {
            if (angular.isDefined(subMenuItem.onClick)) {

                if (angular.isDefined(subMenuItem.partialHTML)) {
                    $scope.executeMiddleSection(subMenuItem);
                }

                $scope[subMenuItem.onClick]();

            } else {
                $scope.executeMiddleSection(subMenuItem);
            }
        };

        $scope.isSelected = function (subMenuItem) {
            return subMenuItem === $scope.selected ? '' : 'text-muted';
        };

        $scope.isSelectedIcon = function (subMenuItem) {
            return subMenuItem === $scope.selected ? 'i-blue' : 'i-grey';
        };

        $scope.deleteRecord = function () {
            ControllerInfoPasser.broadcast("event:deleteAdminRecord")
        };

        /* Notifications Implementation */

        $scope.moduleNotification = [];
        $scope.recordAlertConfigs = [];

        $scope.loadRecordAlertConfigs = function () {
            RecordAlertConfigService.query(function (value, responseHeaders) {
                    // Success
                    $scope.recordAlertConfigs = value;
                },
                function (httpResponse) {
                    // Error {
                    //console.log('Error');
                }
            );
        };

        $scope.filterModuleColor = function (module) {
            var position = $scope.moduleNotification.indexOf(module);

            if (position < 0) {
                return 'i-button-disabled';
            } else {
                return 'i-button-' + $scope.getModuleColor(module);
            }
        };

        $scope.backToNotificationList = function () {
            $scope.middleSection = "partials/administration/notification/notificationsAdmin.html";
        };

        /* User Role Implementations */

        $scope.userRoleFormMode = "Add";

        $scope.addRole = function () {
            var menuItem = {
                "label": "Add Role",
                "partialHTML": "partials/viewRole.html"
            };
            $scope.activeModules = angular.copy($scope.$parent.activeModulesAll);
            $scope.changeMenuItem(menuItem);
        };

        $scope.isLastAdmin = false;
        $scope.determineIfLastAdmin = function () {
            var isAdminCount = 0;
            for (var x = 0; x < $scope.allRoles.length; x++) {
                if ($scope.allRoles[x].isAdministratorRole == true) {
                    isAdminCount++;
                }
            }

            if (isAdminCount == 1) {
                $scope.isLastAdmin = true;
            } else {
                $scope.isLastAdmin = false;
            }
        };

        $scope.allRoles = [];

        $scope.getAllRoles = function () {
            $scope.loading = true;

            return RoleService.query(function (data, response){
                $scope.allRoles = data;
                $scope.determineIfLastAdmin();
                $scope.loading = false;
            }, function (response) {
                $scope.loading = false;
                $scope.addAlert("Error getting all roles", 'error');
            }).$promise;
        };

        $scope.getAllRoleNames = function(){
            var roleNames = [];
            for(var i = 0; i < $scope.allRoles.length; i++){
                roleNames.push($scope.allRoles[i].roleName);
            }
            return roleNames;
        };

        $scope.isRoleRemovable = function (role) {
            var isAdminAndLastAdmin = role.isAdministratorRole && $scope.isLastAdmin;
            if (role.isDefaultSystemRole) {
                return false;
            } else {
                if (isAdminAndLastAdmin) {
                    return false;
                } else {
                    return true;
                }
            }
        };

        $scope.addToOverallRemoveRoleErrorMessage = function (errorMessage) {
            $scope.overallRemoveRoleErrorMessage += "\n";
            $scope.overallRemoveRoleErrorMessage += errorMessage;
        };

        $scope.cannotBeRemoved = false;

        $scope.setCannotBeRemoved = function (boolean) {
            $scope.cannotBeRemoved = boolean;
        };

        $scope.executeRoleRemovalDecision = function (role) {
            var roleName = role.roleName;
            if ($scope.cannotBeRemoved == true) {
                $scope.addAlert($scope.overallRemoveRoleErrorMessage, 'error');
            } else {
                // alert( "Role to be deleted!" );
                RoleService.delete({rolename: role.roleName}, function () {
                    $scope.addAlert("Successfully deleted role: " + roleName, 'success');
                    $scope.getAllRoles();
                    $scope.backToRoleList();
                }, function (response) {
                    spinner.stop();
                    $scope.addAlert("Error deleting role: " + roleName, 'error');
                });
            }
        };

        $scope.roleToDelete = {};

        $scope.setRoleToDelete = function (role) {
            $scope.roleToDelete = role;
        };

        $scope.removeRole = function () {
            var roleName = $scope.roleToDelete.roleName;
            spinner.spin(spinnerTarget);
            $scope.overallRemoveRoleErrorMessage = "The role '" + roleName + "' cannot be deleted due to the following reasons:";
            $scope.cannotBeRemoved = false;

            $http.put(contextPath + '/webapi/roles/doesthisrolehavepermissions', $scope.roleToDelete).success(function (data) { //$http much better than $resource at handling plain text responses
                //reverse result so that if property being writable = false, we use true for disabling buttons with ng-disabled
                if (data == 'true') {
                    var errorMessage = " - The role has exisiting property permissions associated with it.";
                    $scope.addToOverallRemoveRoleErrorMessage(errorMessage);
                    $scope.setCannotBeRemoved(true);
                }

                $http.put(contextPath + '/webapi/roles/doesthisrolehaveuserprofiles', $scope.roleToDelete).success(function (data) { //$http much better than $resource at handling plain text responses
                    //reverse result so that if property being writable = false, we use true for disabling buttons with ng-disabled
                    if (data == 'true') {
                        var errorMessage = " - The role has exisiting users associated with it.";
                        $scope.addToOverallRemoveRoleErrorMessage(errorMessage);
                        $scope.setCannotBeRemoved(true);
                    }
                    $scope.executeRoleRemovalDecision($scope.roleToDelete);
                });
            });
        };

        $scope.selectedUserRole = {};

        $scope.viewRole = function (role) {
            $scope.selectedUserRole = role;
            $scope.moduleSecurityList = $scope.selectedUserRole.moduleSecurityList;

            $scope.activeModules = $scope.$parent.activeModulesAll.filter(function (activeModule) {
                for (var i = 0; i < $scope.moduleSecurityList.length; i++) {
                    if ($scope.moduleSecurityList[i].module.indexOf(activeModule.moduleEnum) > -1) {
                        return false;
                    }
                }
                return true;
            });

            $scope.addMode = false;
            var menuItem = {
                "label": "Edit Role",
                "icon": "icon-pencil-2",
                "partialHTML": "partials/viewRole.html"
            };
            $scope.userRoleFormMode = "View";
            $scope.changeMenuItem(menuItem);
        };

        $scope.backToRoleList = function () {
            $scope.selectedUserRole = {};
            var menuItem = {
                "label": "Roles",
                "icon": "icon-profile",
                "partialHTML": "partials/listroles.html"
            };
            $scope.changeMenuItem(menuItem);
        };

        /* User Profile and Profile Implementations */

        $scope.currentUsersPage = 0;
        $scope.usersPageSize = 10;
        $scope.profilesList = [];

        $scope.resetCurrentUsersPage = function () {
            $scope.currentUsersPage = 0;
        };

        $scope.loadProfiles = function () {
            $scope.loadingUsers = true;
            $scope.profilesList.length = 0;
            ProfileService.lightQuery(function (value, responseHeaders) {
                    // Success
                    //console.log('Success');
                    $scope.setGeneralProfilesList(value);
                },
                function (httpResponse) {
                    // Error {
                    //console.log('Error');
                }
            );
        };

        $scope.setGeneralProfilesList = function (profilesList) {
            $scope.loadingUsers = false;
            $scope.profilesList = profilesList;
        };

        $scope.addUser = function () {
            $scope.changeUserSectionTo("partials/adduserInput.html");
        };


        $scope.profileToDelete = {};

        $scope.setProfileToDelete = function (profile) {
            if (angular.isDefined(profile.id)) {
                ProfileService.findById({id: profile.id}, function (data, ignoreResponseHeaders) {
                    $scope.profileToDelete = data;

                }, function (ignoreHttpResponse) {
                    $scope.addAlert('An error has occurred trying to setup user profile for removal.', 'danger');

                });
            }
        };

        $scope.processingDeletingUser = false;

        $scope.removeUser = function () {

            $scope.processingDeletingUser = true;
            ProfileService.deleteUserProfile({}, $scope.profileToDelete,
                function (ignoreValue, ignoreResponseHeaders) {
                    // Success
                    $http({
                        method: 'POST',
                        url: contextPath + '/webapi/reports/deleteUser',
                        data: $scope.profileToDelete // set the headers so angular passing info as form data (not request payload)
                    }).success(function () {
                        // Clear all dirty flags and the data entered into the fields
                        //console.log("Delete Success");
                        $scope.processingDeletingUser = false;
                        $scope.addAlert('Successfully deleted user: ' + $scope.profileToDelete.userProfile.username, 'success');
                        $scope.loadProfiles();
                    }).error(function () {
                        // Clear all dirty flags and the data entered into the fields
                        $scope.processingDeletingUser = false;
                        $scope.addAlert('An error has occurred trying to delete user to report service.', 'danger');
                        $scope.loadProfiles();
                    });

                },
                function (httpResponse) {
                    // Error
                    //console.log(httpResponse);
                    $scope.processingDeletingUser = false;
                    switch (httpResponse.status) {
                        case 304:
                            var alert = {};
                            alert.type = 'warning';
                            alert.msg = "Cannot delete current logged in user.";
                            $scope.addAlert(alert.msg, alert.type);
                            break;
                        case 401:
                        case 403:
                            var alert = {};
                            alert.type = 'warning';
                            alert.msg = "Delete failed-Insufficient Permissions";
                            $scope.addAlert(alert.msg, alert.type);
                            break;
                        default:
                            var alert = {};
                            alert.type = 'danger';
                            alert.msg = "Delete failed";
                            $scope.addAlert(alert.msg, alert.type);
                            break;
                    }
                }
            );
        };

        $scope.selectedProfile = {};
        $scope.selectedUserProfile = {};
        $scope.viewUser = function (profile) {
            if (angular.isDefined(profile.id)) {
                ProfileService.findById({id: profile.id}, function (data, ignoreResponseHeaders) {
                    $scope.selectedProfile = data;
                    $scope.selectedUserProfile = data.userProfile;
                    $scope.changeUserSectionTo('partials/viewUserProfile.html');

                }, function (ignoreHttpResponse) {
                    $scope.addAlert('An error has occurred trying to open user details.', 'danger');
                });
            }

        };

        $scope.editLoginDetails = function (profile) {
            if (angular.isDefined(profile.id)) {
                ProfileService.findById({id: profile.id}, function (data, ignoreResponseHeaders) {
                    $scope.selectedProfile = data;
                    $scope.selectedUserProfile = data.userProfile;
                    $scope.changeUserSectionTo('partials/editUserLoginDetails.html');

                }, function (ignoreHttpResponse) {
                    $scope.addAlert('An error has occurred trying to open user login details.', 'danger');
                });
            }
        };

        $scope.editPropertyAssignments = function (profile) {
            if (angular.isDefined(profile.id)) {
                ProfileService.findById({id: profile.id}, function (data, ignoreResponseHeaders) {
                    $scope.selectedProfile = data;
                    $scope.selectedUserProfile = data.userProfile;
                    $scope.changeUserSectionTo('partials/propertyAssignment.html');

                }, function (ignoreHttpResponse) {
                    $scope.addAlert('An error has occurred trying to open user property assignment details.', 'danger');
                });
            }
        };

        $scope.addAlert = function (msg, type) {

            if ($scope.alerts.length > 0) {
                $scope.alerts.splice(0, 1);
            }

            $scope.alerts.push({msg: msg, type: type});

            $timeout(function () {  // Close alert after 5000 ms (5s)
                $scope.alerts.splice(0, 1);
            }, 5000);
        };

        $scope.Logo = function () {
            $scope.companyLogo = ControllerInfoPasser.get('companyLogo');
        };

        $scope.uploadCompanyLogo = function ($files) {
            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                Upload.upload({
                    url: contextPath + '/webapi/upload/companylogo', //upload.php script, node.js route, or servlet url
                    method: 'POST',
                    file: file
                }).progress(function (evt) {
                    ////console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    // file is uploaded successfully
                    $scope.successUpload = data;
                    $scope.errorUpload = undefined;
                    $scope.companyLogo = undefined;
                    ControllerInfoPasser.put('companyLogo', data);
                    $timeout(function () {
                        $scope.successUpload = undefined;
                        $scope.Logo();
                    }, 3000);
                }).error(function (status) {
                    $scope.errorUpload = "error!";
                    $scope.successUpload = undefined;
                });
            }
        };

        $scope.exitAdminMenu = function () {
            $scope.selected = undefined;
            $scope.changeMiddleSectionTo();
        };

        $scope.exitUserSection = function () {
            $scope.userSection = undefined;
            $scope.loadProfiles();
        };

        $scope.runPropertySecurityReport = function () {
            var url = contextPath + '/webapi/properties/securityreport';
            $scope.openInNewWindow('GET', url);
        };

        $scope.runUserRoleReport = function () {
            $scope.openInNewWindow('GET', contextPath + '/webapi/roles/report')
        };

        $scope.Logo();
    }])
    .controller('ViewRoleFormCtrl', ['$scope', 'contextPath', 'RoleService', '$uibModal', 'DashboardService', function ($scope, contextPath, RoleService, $modal, DashboardService) {

        var alertItem;
        $scope.selectedEditableRoles = [];

        $scope.systemDefaultRoleConfirmationModalTitle = 'Assign as Default System Role';
        $scope.systemDefaultRoleConfirmationModalBody = 'Checking this box will mark this role as the new default system role, are you sure?';

        var loadSelectedEditableRoles = function() {
            $scope.selectedEditableRoles.length = 0;
            var editableRoleNames = angular.copy($scope.selectedUserRole.editableRoles);

            var editableRoles = $scope.allRolesForTaskAssignment.filter(function(role) {
                if (editableRoleNames.indexOf(role.roleName) > -1) {
                    return true;
                }
            });

            // push.apply() is used here because array is smaller than 100k and it's faster than concat().
            // If array is bigger than 100k, don't follow this code construct.
            $scope.selectedEditableRoles.push.apply($scope.selectedEditableRoles, editableRoles);

        };

        var initializeRoleLists = function() {
            $scope.getAllRoles().then( function() {
                $scope.allRolesForTaskAssignment = angular.copy($scope.allRoles);
                loadSelectedEditableRoles();
            });
        };

        var getSelectedRoleNames = function() {
            var selectedRoleNames = [];
            for (var x = 0; x < $scope.selectedEditableRoles.length; x++) {
                selectedRoleNames.push(angular.copy($scope.selectedEditableRoles[x].roleName));
            }

            return selectedRoleNames;
        };

        $scope.reset = function () {
            $scope.userRoleFormMode = "Add";
            $scope.addMode = true;
            $scope.editMode = true;
            $scope.roleName = '';
            $scope.description = '';
            $scope.assignedDashboard = {};
            $scope.isDefaultSystemRole = false;
            $scope.isAdministratorRole = false;
            $scope.allowPropertyEdit = false;
            $scope.seeAllProperties = false;
            $scope.rank = '';
            $scope.systemDefaultRoleConfirmationModalTitle = "Assign Default System Role";
            $scope.systemDefaultRoleConfirmationModalBody = "Checking this box will mark this role as the new default system role, are you sure?";
            $scope.selectedEditableRoles.length = 0;
            $scope.closeAlert(0);
        };

        $scope.clearAddRoleForm = function () {
            //console.log("Resetting...");
            $scope.viewroleform.$setPristine();
            $scope.assignedDashboard = '';
            // $scope.closeAlert(0);
        };

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        // Called when the user clicks Update
        $scope.updateRole = function () {

            if ($scope.isDefaultSystemRole == true) {
                for (var x = 0; x < $scope.allRoles.length; x++) {
                    if ($scope.allRoles[x].isDefaultSystemRole == true) {
                        var role = $scope.allRoles[x];
                        role.isDefaultSystemRole = false;
                        //console.log("Updating Current Default System Role..");
                        RoleService.update({rolename: role.roleName}, role,
                            function (value, responseHeaders) {
                                // Success
                                //console.log("Successfully updated current default system role..");

                                $scope.selectedUserRole.roleName = $scope.roleName;
                                $scope.selectedUserRole.description = $scope.description;
                                $scope.selectedUserRole.assignedDashboard = $scope.assignedDashboard;
                                $scope.selectedUserRole.isDefaultSystemRole = $scope.isDefaultSystemRole;
                                $scope.selectedUserRole.isAdministratorRole = $scope.isAdministratorRole;
                                $scope.selectedUserRole.allowPropertyEdit = $scope.allowPropertyEdit;
                                $scope.selectedUserRole.seeAllProperties = $scope.seeAllProperties;
                                $scope.selectedUserRole.rank = $scope.rank;
                                $scope.selectedUserRole.moduleSecurityList = $scope.moduleSecurityList;
                                $scope.selectedUserRole.editableRoles = getSelectedRoleNames();

                                //console.log("Updating Role");
                                RoleService.update({rolename: $scope.selectedUserRole.roleName}, $scope.selectedUserRole,
                                    function (value, responseHeaders) {
                                        // Success
                                        $scope.addAlert('Successfully updated role: ' + $scope.selectedUserRole.roleName, 'success');
                                        $scope.updateRoleAssignedDashboard();
                                    }, function (httpResponse) {
                                        // Error
                                        //console.log(httpResponse);

                                        switch (httpResponse.status) {
                                            case 401:
                                            case 403:
                                                alertItem = {};
                                                alertItem.type = 'danger';
                                                alertItem.msg = "Update failed-Insufficient Permissions";
                                                $scope.addAlert(alert.msg, alert.type);
                                                break;
                                            default:
                                                alertItem = {};
                                                alertItem.type = 'danger';
                                                alertItem.msg = "Update failed";
                                                $scope.addAlert(alertItem.msg, alertItem.type);
                                                break;
                                        }
                                    }
                                );
                            }, function (httpResponse) {
                                // Error
                                //console.log(httpResponse);

                                switch (httpResponse.status) {
                                    case 401:
                                    case 403:
                                        alertItem = {};
                                        alertItem.type = 'danger';
                                        alertItem.msg = "Delete failed-Insufficient Permissions";
                                        $scope.addAlert(alert.msg, alert.type);
                                        break;
                                    default:
                                        alertItem = {};
                                        alertItem.type = 'danger';
                                        alertItem.msg = "Delete failed";
                                        $scope.addAlert(alertItem.msg, alertItem.type);
                                        break;
                                }
                            }
                        );
                        // $scope.reset();
                    }
                }
            } else {
                $scope.selectedUserRole.roleName = $scope.roleName;
                $scope.selectedUserRole.description = $scope.description;
                $scope.selectedUserRole.assignedDashboard = $scope.assignedDashboard;
                $scope.selectedUserRole.isDefaultSystemRole = $scope.isDefaultSystemRole;
                $scope.selectedUserRole.isAdministratorRole = $scope.isAdministratorRole;
                $scope.selectedUserRole.allowPropertyEdit = $scope.allowPropertyEdit;
                $scope.selectedUserRole.seeAllProperties = $scope.seeAllProperties;
                $scope.selectedUserRole.rank = $scope.rank;
                $scope.selectedUserRole.moduleSecurityList = $scope.moduleSecurityList;
                $scope.selectedUserRole.editableRoles = getSelectedRoleNames();

                //console.log("Updating Role");
                RoleService.update({rolename: $scope.selectedUserRole.roleName}, $scope.selectedUserRole,
                    function (value, responseHeaders) {
                        // Success
                        $scope.addAlert('Successfully updated role: ' + $scope.selectedUserRole.roleName, 'success');
                        $scope.updateRoleAssignedDashboard();
                    }, function (httpResponse) {
                        // Error
                        //console.log(httpResponse);

                        switch (httpResponse.status) {
                            case 401:
                            case 403:
                                alertItem = {};
                                alertItem.type = 'danger';
                                alertItem.msg = "Update failed-Insufficient Permissions";
                                $scope.addAlert(alert.msg, alert.type);
                                break;
                            default:
                                alertItem = {};
                                alertItem.type = 'danger';
                                alertItem.msg = "Update failed";
                                $scope.addAlert(alertItem.msg, alertItem.type);
                                break;
                        }
                    }
                );
            }
        };

        // Called when the user clicks Save
        $scope.userRole = {};
        $scope.submit = function () {
            if ($scope.isDefaultSystemRole == true) {
                for (var x = 0; x < $scope.allRoles.length; x++) {
                    if ($scope.allRoles[x].isDefaultSystemRole == true) {
                        var role = $scope.allRoles[x];
                        role.isDefaultSystemRole = false;
                        //console.log("Updating Current Default System Role..");
                        RoleService.update({rolename: role.roleName}, role, function (value, responseHeaders) {
                            // Success
                            //console.log("Successfully updated current default system role..");

                            $scope.userRole.roleName = $scope.roleName;
                            $scope.userRole.description = $scope.description;
                            $scope.userRole.assignedDashboard = $scope.assignedDashboard;
                            $scope.userRole.isDefaultSystemRole = $scope.isDefaultSystemRole;
                            $scope.userRole.isAdministratorRole = $scope.isAdministratorRole;
                            $scope.userRole.allowPropertyEdit = $scope.allowPropertyEdit;
                            $scope.userRole.seeAllProperties = $scope.seeAllProperties;
                            $scope.userRole.rank = $scope.rank;
                            $scope.userRole.moduleSecurityList = $scope.moduleSecurityList;
                            $scope.userRole.editableRoles = $scope.selectedEditableRoles;
                            //console.log("Submitting new Role");

                            RoleService.save($scope.userRole, function (value, responseHeaders) {
                                // Success
                                $scope.addAlert('Successfully added new role: ' + $scope.userRole.roleName, 'success');
                                $scope.clearAddRoleForm();
                                $scope.backToRoleList();
                            }, function (httpResponse) {
                                // Error
                                //console.log(httpResponse);

                                switch (httpResponse.status) {
                                    case 401:
                                    case 403:
                                        alertItem = {};
                                        alertItem.type = 'danger';
                                        alertItem.msg = "Add failed-Insufficient Permissions";
                                        $scope.addAlert(alertItem.msg, alertItem.type);
                                        break;
                                    default:
                                        alertItem = {};
                                        alertItem.type = 'danger';
                                        alertItem.msg = "Add failed";
                                        $scope.addAlert(alertItem.msg, alertItem.type);
                                        break;
                                }
                            });
                            // $scope.reset();

                        }, function (httpResponse) {
                            // Error
                            //console.log(httpResponse);

                            switch (httpResponse.status) {
                                case 401:
                                case 403:
                                    alertItem = {};
                                    alertItem.type = 'danger';
                                    alertItem.msg = "Update failed-Insufficient Permissions";
                                    $scope.addAlert(alert.msg, alert.type);
                                    break;
                                default:
                                    alertItem = {};
                                    alertItem.type = 'danger';
                                    alertItem.msg = "Update failed";
                                    $scope.addAlert(alertItem.msg, alertItem.type);
                                    break;
                            }
                        });
                        // $scope.reset();
                    }
                }
            } else {
                $scope.userRole.roleName = $scope.roleName;
                $scope.userRole.description = $scope.description;
                $scope.userRole.assignedDashboard = $scope.assignedDashboard;
                $scope.userRole.isDefaultSystemRole = $scope.isDefaultSystemRole;
                $scope.userRole.isAdministratorRole = $scope.isAdministratorRole;
                $scope.userRole.allowPropertyEdit = $scope.allowPropertyEdit;
                $scope.userRole.seeAllProperties = $scope.seeAllProperties;
                $scope.userRole.rank = $scope.rank;
                $scope.userRole.moduleSecurityList = $scope.moduleSecurityList;
                $scope.userRole.editableRoles = $scope.selectedEditableRoles;

                //console.log("Submitting new Role");
                RoleService.save($scope.userRole,
                    function (value, responseHeaders) {
                        // Success
                        $scope.addAlert('Successfully added new role: ' + $scope.userRole.roleName, 'success');
                        $scope.clearAddRoleForm();
                        $scope.backToRoleList();
                    },
                    function (httpResponse) {
                        // Error
                        //console.log(httpResponse);

                        switch (httpResponse.status) {
                            case 401:
                            case 403:
                                alertItem = {};
                                alertItem.type = 'danger';
                                alertItem.msg = "Add failed-Insufficient Permissions";
                                $scope.addAlert(alertItem.msg, alertItem.type);
                                break;
                            default:
                                alertItem = {};
                                alertItem.type = 'danger';
                                alertItem.msg = "Add failed";
                                $scope.addAlert(alertItem.msg, alertItem.type);
                                break;
                        }
                    }
                );

            }
        };

        $scope.onDragModuleStart = function (event, ui, item) {
            $scope.whatIsDragged = item;
        };

        $scope.onModuleDrop = function (event, ui) {

            if ($scope.searchArrayForProperty($scope.moduleSecurityList, 'module', $scope.moduleNameToEnum($scope.whatIsDragged.moduleName)).length == 0) {
                var access = {
                    module: $scope.whatIsDragged.moduleEnum,
                    accessType: $scope.moduleAccessTypes.RW,
                    userRole_FK: angular.isDefined($scope.selectedUserRole.id) ? $scope.selectedUserRole.id : undefined,
                    userProfile_FK: angular.isDefined($scope.selectedProfile.id) ? $scope.selectedProfile.id : undefined
                };

                $scope.moduleSecurityList.pop(); //prevent default behavior
                $scope.moduleSecurityList.push(access);

                $scope.activeModules.splice($scope.activeModules.indexOf($scope.whatIsDragged), 1);

            } else {
                $scope.moduleSecurityList.pop(); //prevent default behavior
            }

        };

        // Called when the user clicks Reset- to clear the form and re-initialize all arrays
        $scope.cancelRoleEdit = function () {

            if (angular.isDefined($scope.moduleSecurityListCopy)) {
                $scope.moduleSecurityList = $scope.moduleSecurityListCopy;
            }

            $scope.activeModules = $scope.$parent.activeModulesAll.filter(function (activeModule) {
                for (var i = 0; i < $scope.moduleSecurityList.length; i++) {
                    if ($scope.moduleSecurityList[i].module.toUpperCase().indexOf(activeModule.moduleName.toUpperCase()) > -1) {
                        return false;
                    }
                }
                return true;
            });
            $scope.editMode = false;
            $scope.userRoleFormMode = "View";
            $scope.viewroleform.$setPristine();

            if ($scope.addRoleMode) {
                $scope.backToRoleList();
            }

        };

        $scope.removeModule = function (moduleSecurityObj) {
            var index = $scope.moduleSecurityList.indexOf(moduleSecurityObj);
            var moduleName = $scope.moduleSecurityList.splice(index, 1)[0].module;
            moduleName = moduleName.replace(/_/g, ' ');  // Replace all underscores with space

            var module = $scope.searchArrayForProperty($scope.$parent.activeModulesAll, 'moduleName', moduleName)[0];
            $scope.activeModules.push(module);
        };

        $scope.finishRoleUpdate = function () {
            $scope.getAllRoles();
            $scope.editMode = false;
            $scope.userRoleFormMode = "View";
            $scope.backToRoleList();
        };

        $scope.updateRoleAssignedDashboard = function () {
            RoleService.assignDashboard({
                roleId: $scope.selectedUserRole.id,
                dashboardId: $scope.selectedUserRole.assignedDashboard.id
            }, {}, function (data, headers) {
                $scope.finishRoleUpdate();
            }, function (httpResponse) {
                switch (httpResponse.status) {
                    case 401:
                        alertItem = {};
                        alertItem.type = 'warning';
                        alertItem.msg = "Cannot update dashboard assignment, current user is unauthorized!";
                        $scope.addAlert(alertItem.msg, alertItem.type);
                        break;
                    case 304:
                        alertItem = {};
                        alertItem.type = 'warning';
                        alertItem.msg = "Cannot update dashboard assignment, data for role or dashboard not found..!";
                        $scope.addAlert(alertItem.msg, alertItem.type);
                        break;
                    default:
                        alertItem = {};
                        alertItem.type = 'danger';
                        alertItem.msg = "Update failed";
                        $scope.addAlert(alertItem.msg, alertItem.type);
                        break;
                }
            });
        };

        $scope.setDashboardList = function (list) {
            $scope.dashboardList = list;
            for (var x = 0; x < $scope.dashboardList.length; x++) {
                if ($scope.selectedUserRole.assignedDashboard.id == $scope.dashboardList[x].id) {
                    $scope.assignedDashboard = $scope.dashboardList[x];
                }
            }
        };

        $scope.dashboardList = [];
        $scope.loadDashboards = function () {
            DashboardService.query({}, function (data, headers) {
                $scope.setDashboardList(data);
            });
        };

        $scope.editRole = function () {
            $scope.determineIfLastAdmin();
            $scope.userRoleFormMode = "Edit";
            $scope.editMode = true;
            $scope.roleName = $scope.selectedUserRole.roleName;
            $scope.description = $scope.selectedUserRole.description;
            // $scope.assignedDashboard = $scope.selectedUserRole.assignedDashboard;
            $scope.isDefaultSystemRole = $scope.selectedUserRole.isDefaultSystemRole;
            $scope.isAdministratorRole = $scope.selectedUserRole.isAdministratorRole;
            $scope.allowPropertyEdit = $scope.selectedUserRole.allowPropertyEdit;
            $scope.seeAllProperties = $scope.selectedUserRole.seeAllProperties;
            $scope.moduleSecurityListCopy = angular.copy($scope.moduleSecurityList);

            $scope.rank = $scope.selectedUserRole.rank;
            if ($scope.selectedUserRole.isDefaultSystemRole == false) {
                $scope.systemDefaultRoleConfirmationModalTitle = "Assign as Default System Role";
                $scope.systemDefaultRoleConfirmationModalBody = "Checking this box will mark this role as the new default system role, are you sure?";
            }
            initializeRoleLists();
            $scope.loadDashboards();

        };

        /*
         $scope.$on('event:userRoleAddMode', function (event, category) {
         alert( "add" );
         $scope.selectedUserRole.roleName = '';
         $scope.selectedUserRole.description = '';
         $scope.selectedUserRole.assignedDashboard = '';
         $scope.selectedUserRole.isDefaultSystemRole = false;
         $scope.selectedUserRole.isAdministratorRole = false;
         $scope.selectedUserRole.allowPropertyEdit = false;
         $scope.selectedUserRole.seeAllProperties = false;
         $scope.selectedUserRole.rank = '';
         $scope.isLastAdmin = false;
         $scope.initializeForm();
         });
         */

        $scope.initializeForm = function () {
            if ($scope.addRoleMode) {
                $scope.selectedUserRole.roleName = '';
                $scope.selectedUserRole.description = '';
                $scope.selectedUserRole.assignedDashboard = '';
                $scope.selectedUserRole.isDefaultSystemRole = false;
                $scope.selectedUserRole.isAdministratorRole = false;
                $scope.selectedUserRole.allowPropertyEdit = false;
                $scope.selectedUserRole.seeAllProperties = false;
                $scope.selectedUserRole.rank = '';
                $scope.isLastAdmin = false;
                $scope.moduleSecurityList.length = 0;
                $scope.loadDashboards();
                $scope.reset();
                initializeRoleLists();
            }
        };

        $scope.removeCurrentDefaultSystemRole = function () {

        };


        $scope.checkMarkDefaultAdminRole = function (putACheckMark) {
            if (putACheckMark == "Yes") {
                document.getElementById("isDefaultSystemRole").checked = true;
                $scope.isDefaultSystemRole = true;
                $scope.systemDefaultRoleConfirmationModalTitle = "Unmark as Default System Role";
                $scope.systemDefaultRoleConfirmationModalBody = "Are you sure?";
            } else {
                document.getElementById("isDefaultSystemRole").checked = false;
                $scope.isDefaultSystemRole = false;
                $scope.systemDefaultRoleConfirmationModalTitle = "Assign Default System Role";
                $scope.systemDefaultRoleConfirmationModalBody = "Checking this box will mark this role as the new default system role, are you sure?";
            }
        };

        initializeRoleLists();

    }])
    .controller('RecordAlertConfigAdminCtrl', ['$scope', 'ControllerInfoPasser', function ($scope, ControllerInfoPasser) {

        var RECORD_ALERT_CONFIG = 'recordAlertConfig';

        $scope.loadRecordAlertConfigs();

        $scope.viewConfig = function (recordAlertConfig) {

            var menuItem = {
                "label": "Notifications",
                "icon": "icon-envelop",
                "partialHTML": "partials/administration/notification/notificationsAdminInput.html"
            };
            $scope.changeMenuItem(menuItem);

            if (angular.isDefined(recordAlertConfig)) {
                ControllerInfoPasser.put(RECORD_ALERT_CONFIG, recordAlertConfig)
            }
        };

        $scope.addConfig = function () {
            $scope.viewConfig();
        };

    }])
    .controller('RecordAlertConfigCtrl', ['$scope', 'RecordAlertConfigService', 'contextPath', 'ControllerInfoPasser', '$filter', '$q', 'ProfileService', 'RoleService', function ($scope, RecordAlertConfigService, contextPath, ControllerInfoPasser, $filter, $q, ProfileService, RoleService) {

        var RECORD_ALERT_CONFIG = 'recordAlertConfig';

        $scope.selectedRoles = [];
        $scope.selectedUsers = [];
        $scope.fieldDropbox = [];
        var envDocTypes = 'environmentalDocumentTypes';

        $scope.loadDropboxes(['alertTypes', 'alertNotificationStatus', 'environmentalDocumentTypes', 'ohsDocumentTypes', 'fieldAlertCondition', 'applicationDocumentTypes']);

        $q.all([
            ProfileService.withUserProfile().$promise,
            RoleService.query().$promise
        ]).then(function (result) {
            $scope.users = result[0];
            $scope.roles = result[1];

            $scope.config = ControllerInfoPasser.get(RECORD_ALERT_CONFIG);
            if (angular.isDefined($scope.config)) {
                $scope.editing = true;
                $scope.titleLabel = 'Edit';
                $scope.filterRecordType($scope.config.module);
                $scope.getEntityFields();
                for (var i = 0; i < $scope.users.length; i++) {
                    for (var z = 0; z < $scope.config.profiles.length; z++) {
                        if (angular.isDefined($scope.users[i].userProfile) && $scope.config.profiles[z].username === $scope.users[i].userProfile.username) {
                            $scope.selectedUsers.push($scope.users[i]);
                            break;
                        }
                    }
                }
                for (var i = 0; i < $scope.roles.length; i++) {
                    for (var z = 0; z < $scope.config.roles.length; z++) {
                        if ($scope.config.roles[z].roleName === $scope.roles[i].roleName) {
                            $scope.selectedRoles.push($scope.roles[i]);
                        }
                    }
                }
                ControllerInfoPasser.clear(RECORD_ALERT_CONFIG);
            } else {
                $scope.titleLabel = 'Add';
                $scope.filterRecordType($scope.moduleEnums.environmental);
                RecordAlertConfigService.create(function (data) {
                    $scope.config = angular.copy(data);
                }, function () {
                    $scope.addAlert('An error has occurred creating a new alert!', 'danger', 10000);
                });
            }
        }, function (rejection) {
            // error
        });

        $scope.submitConfig = function () {
            var form = $scope.forms.configform;
            if (form.$error.required) {
                $scope.addAlert('Please fill in all required fields', 'warning');
                return;
            }

            $scope.config.module = $scope.moduleNotification[0];
            $scope.config.profiles = $scope.selectedUsers.map(function (entry) {
                return entry.userProfile;
            });
            $scope.config.roles = $scope.selectedRoles;

            var config = angular.copy($scope.config);
            config.status = config.status.toUpperCase();

            if ($scope.editing) {
                RecordAlertConfigService.update(config, function (data, headers) {
                    // Success
                    $scope.addAlert('The configuration for document type ' + $scope.config.documentType + ' was successfully updated', 'success');
                    $scope.backToNotificationList();

                }, function (httpResponse) {
                    // Error
                    switch (httpResponse.status) {
                        case 304:
                            $scope.addAlert('\'' + $filter('enumToString')($scope.config.alertType) + '\' configuration for document type \'' + $scope.config.documentType + '\' already exists.', 'warning');
                            break;
                        default:
                            $scope.addAlert('A problem occurred while trying to update the configuration!', 'danger');
                    }
                });
            } else {
                RecordAlertConfigService.add(config, function (data, headers) {
                    // Success
                    $scope.addAlert('The configuration for document type ' + $scope.config.documentType + ' was successfully added', 'success');
                    $scope.backToNotificationList();

                }, function (httpResponse) {
                    // Error
                    switch (httpResponse.status) {
                        case 304:
                            $scope.addAlert('\'' + $filter('enumToString')($scope.config.alertType) + '\' configuration for document type \'' + $scope.config.documentType + '\' already exists.', 'warning');
                            break;
                        default:
                            $scope.addAlert('A problem occurred when adding the configuration', 'danger');
                    }
                });
            }
        };

        $scope.removeConfig = function () {

            RecordAlertConfigService.delete({id: $scope.config.id}, function (data, headers) {
                // Success
                $scope.addAlert('The configuration for document type ' + $scope.config.documentType + ' was successfully removed', 'success');
                $scope.backToNotificationList();

            }, function (httpResponse) {
                // Error
                $scope.addAlert('A problem occurred when removing the configuration', 'danger');
            });

        };

        $scope.filterRecordType = function (module) {
            var position = $scope.moduleNotification.indexOf(module);

            if (position < 0) {
                // show in list view
                $scope.moduleNotification.length = 0;
                $scope.moduleNotification.push(module);
            }

            $scope.documentType = $scope.moduleNotification[0].toLowerCase() + 'DocumentTypes';
        };

        $scope.changeAlertModules = function () {
            $scope.clearFieldConditions();
            $scope.config.documentType = undefined;
        };

        $scope.getEntityFields = function () {
            $scope.fieldDropbox.length = 0;
            if ($scope.documentType === envDocTypes) {
                RecordAlertConfigService.findEnvironmentalFields({
                    docTypeName: $scope.config.documentType
                }, function (data) {
                    $scope.fieldDropbox = angular.copy(data);
                }, function () {
                    $scope.addAlert('An error has occurred getting the field list for \'' + $scope.config.documentType + '\' documents!', 'danger', 10000);
                });
            } else {
                RecordAlertConfigService.findFields({
                    className: $scope.config.documentType
                }, function (data) {
                    $scope.fieldDropbox = angular.copy(data);
                }, function () {
                    $scope.addAlert('An error has occurred getting the field list for \'' + $scope.config.documentType + '\' documents!', 'danger', 10000);
                });
            }
        };

        $scope.addFieldCondition = function () {
            $scope.config.fieldAlerts.push({});
        };

        $scope.removeFieldCondition = function (index) {
            $scope.config.fieldAlerts.splice(index, 1);
        };

        $scope.clearFieldConditions = function () {
            $scope.config.fieldAlerts.length = 0;
        };

    }])
    .controller('AddUserProfileFormCtrl', ['$scope', 'contextPath', 'ProfileService', '$http', function ($scope, contextPath, ProfileService, $http) {

        $scope.setSelectedExistingProfile = function (existingProfile) {
            $scope.profile = existingProfile;
        };

        $scope.profileTableHasRows = function () {
            var numberOfRows = document.getElementById("availableProfileListTable").getElementsByTagName("tbody")[0].getElementsByTagName("tr").length;
            if (numberOfRows > 0) {
                return true;
            } else {
                return false;
            }
        };

        $scope.password2 = '';
        $scope.roleAssigned = '';

        $scope.profileMaster = {
            name: '',
            emailAddress: '',
            phoneNumber: '',
            photoUrl: '',
            isPerson: true,
            userProfile: {}
        };

        $scope.userProfileMaster = {
            username: '',
            password: '',
            password2: '',
            active: false,
            authenticationSource: 0
        };

        $scope.profile = angular.copy($scope.profileMaster);

        $scope.userProfile = angular.copy($scope.userProfileMaster);

        $scope.alerts = [];

        $scope.addAlert = function (msg, type) {
            //$scope.alerts.push( alert );
            if ($scope.alerts.length > 0) {
                $scope.alerts.splice(0, 1);
            }

            $scope.alerts.push({msg: msg, type: type});

        };

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };


        $scope.submit = function (profile, userProfile) {
            //console.log("Submitting new user");

            $scope.userProfileToSave = {
                username: '',
                password: '',
                active: false,
                authenticationSource: 0,
                roles: [],
                favorites: [],
                history: []
            };

            $scope.userProfileToSave.username = userProfile.username;
            $scope.userProfileToSave.password = userProfile.password;
            $scope.userProfileToSave.active = userProfile.active;
            $scope.userProfileToSave.authenticationSource = userProfile.authenticationSource;

            if ($scope.roleAssigned != '') {
                for (var x = 0; x < $scope.allRoles.length; x++) {
                    var role = $scope.allRoles[x];
                    if (role.roleName == $scope.roleAssigned) {
                        $scope.userProfileToSave.roles.push(role);
                        break;
                    }
                }
            }

            profile.userProfile = $scope.userProfileToSave;
            $scope.profileToSave = profile;
            $scope.profileToSaveInReportServer = profile;

            ProfileService.addUserProfile({}, $scope.profileToSave,
                function (value, responseHeaders) {
                    // Success
                    $http({
                        method: 'POST',
                        url: contextPath + '/webapi/reports/addUser',
                        data: $scope.profileToSave // set the headers so angular passing info as form data (not request payload)
                    }).success(function () {
                        // Clear all dirty flags and the data entered into the fields
                        //console.log("Add Success");
                        $scope.addAlert('Successfully added new user:' + userProfile.username, 'success');
                        $scope.reset();
                    }).error(function () {
                        // Clear all dirty flags and the data entered into the fields
                        $scope.addAlert('An error has occurred trying to add user to report service.', 'danger');
                    });
                },
                function (httpResponse) {
                    // Error
                    //console.log(httpResponse);

                    switch (httpResponse.status) {
                        case 302:
                        case 401:
                        case 403:
                            var alert = {};
                            alert.type = 'error';
                            alert.msg = "Add failed-Insufficient Permissions";
                            $scope.addAlert(alert.msg, alert.type);
                            break;
                        default:
                            var alert = {};
                            alert.type = 'error';
                            alert.msg = "Add failed";
                            $scope.addAlert(alert.msg, alert.type);
                            break;
                    }
                }
            );
        };

        $scope.resetProfile = function () {
            //console.log("Resetting..." + $scope.profile);
            $scope.profile = angular.copy($scope.profileMaster);
        };

        $scope.resetUserProfile = function () {
            //console.log("Resetting..." + $scope.userProfile);
            $scope.userProfile = angular.copy($scope.userProfileMaster);
        };

        $scope.reset = function () {
            $scope.adduserform.uPass2.$setValidity('pwmatch', true);
            $scope.resetProfile();
            $scope.resetUserProfile();
            $scope.filteredProfiles = [];
            $scope.adduserform.$setPristine();
        };

        $scope.isUnchanged = function (user) {
            return angular.equals(user, $scope.master);
        };

    }])
    .controller('DataMappingCtrl', ['$scope', 'DataMappingService', '$filter', function ($scope, DataMappingService, $filter) {
        $scope.mappings= [];
        $scope.mappingToDelete = {};
        $scope.processingDeletingMappings = false;
        $scope.loadingMappings = false;
        $scope.mappingOrder = ['entityName', 'mappingType', 'fieldName'];

        $scope.loadDataMappings= function () {
            $scope.mappings.length = 0;
            $scope.loadingMappings = true;
            DataMappingService.query(function (data, responseHeaders) {
                    // Success
                    $scope.loadingMappings = false;
                    $scope.mappings = data;
                },
                function (httpResponse) {
                    // Error
                    switch (httpResponse.status) {
                        case 404:
                            $scope.addAlert('There are no field mappings to load!', 'warning');
                            break;
                        default:
                            $scope.addAlert('There was an error loading the field mappings!', 'danger');
                    }
                    $scope.loadingMappings = false;
                }
            );
        };

        $scope.viewMapping = function (mapping) {
            $scope.mapping = mapping;
            $scope.editDataMappingMode = true;
        };

        $scope.addMapping = function () {
            $scope.mapping = undefined;
            $scope.editDataMappingMode = true;
        };

        $scope.cancelDataMappingEdit = function () {
            $scope.editDataMappingMode = false;
            $scope.mapping = undefined;
            $scope.loadDataMappings();
        };

        $scope.setMappingToDelete = function (mapping) {
            $scope.mappingToDelete = mapping;
        };

        $scope.saveDataMapping = function () {
            if (angular.isDefined($scope.mapping.id)) {
                $scope.updateDataMapping();
            } else {
                $scope.addDataMapping();
            }

        };

        $scope.addDataMapping = function () {

            var tempName = $scope.mapping.entityName;

            DataMappingService.add({}, $scope.mapping,
                function (value, responseHeaders) {
                    // Success
                    $scope.addAlert('Successfully added field mapping for entry \'' + tempName + '\'', 'success', 5000);
                    $scope.cancelDataMappingEdit();
                },
                function (httpResponse) {
                    // Error
                    switch (httpResponse.status) {
                        case 302:
                        case 401:
                        case 304:
                            $scope.addAlert('The field mapping for entry \'' + tempName + '\' was not updated!', 'danger');
                            break;
                        case 409:
                            $scope.addAlert('The field mapping entry \'' + tempName + '\' was not added! A default mapping may already exist for this field.', 'danger');
                            break;
                        case 403:
                            var alert = {};
                            alert.type = 'error';
                            alert.msg = "Add failed-Insufficient Permissions";
                            $scope.addAlert(alert.msg, alert.type);
                            break;
                        default:
                            var alert = {};
                            alert.type = 'error';
                            alert.msg = "Add failed";
                            $scope.addAlert(alert.msg, alert.type);
                            break;
                    }
                }
            );
        };

        $scope.updateDataMapping = function () {
            var tempName = $scope.mapping.entityName;
            DataMappingService.update({}, $scope.mapping, function (value, responseHeaders) {
                // on success
                $scope.cancelDataMappingEdit();
                $scope.addAlert('Successfully updated field mapping for entry  \'' + tempName + '\'', 'success')
            }, function (httpResponse) {
                // on Error
                $scope.editDataMappingMode = true;
                switch (httpResponse.status) {
                    case 404:
                    {
                        $scope.addAlert('The field mapping for entry \'' + tempName + '\' was not found!', 'danger');
                        break;
                    }
                    case 304:
                    {
                        $scope.addAlert('The field mapping for entry \'' + tempName + '\' was not updated! A default mapping may already exist for this field.', 'danger');
                        break;
                    }
                    case 500:
                    {
                        $scope.addAlert('There was an error updating this field mapping!', 'danger');
                        break;
                    }
                }

            });
        };

        $scope.removeDataMapping = function () {
            $scope.processingDeletingMappings = true;
            var tempName = $scope.mappingToDelete.entityName;
            DataMappingService.delete({id: $scope.mappingToDelete.id},
                function (value, responseHeaders) {
                    // Success
                    $scope.processingDeletingMappings = false;
                    $scope.addAlert('Successfully deleted field mapping entry \'' + tempName + '\'', 'success');
                    $scope.loadDataMappings();
                },
                function (httpResponse) {
                    // Error
                    $scope.processingDeletingMappings = false;
                    var alert = {};
                    alert.type = 'danger';
                    alert.msg = "Delete failed";
                    $scope.addAlert(alert.msg, alert.type);
                    $scope.loadDataMappings();
                }
            );
        };

        $scope.loadDropboxes(['mappingType','isDefaultMappedValue']);
        $scope.loadDataMappings();

    }])
    .controller('UnitConversionCtrl', ['$scope', 'UnitConversionService', '$filter', function ($scope, UnitConversionService, $filter) {
        $scope.conversions = [];
        $scope.conversionToDelete = {};
        $scope.processingDeletingConversion = false;
        $scope.loadingConversions = false;
        $scope.conversionOrder = ['utilityType', 'fromUnit', 'toUnit'];

        $scope.loadUnitConversions = function () {
            $scope.conversions.length = 0;
            $scope.loadingConversions = true;
            UnitConversionService.query(function (data, responseHeaders) {
                    // Success
                    $scope.loadingConversions = false;
                    $scope.conversions = data;
                },
                function (httpResponse) {
                    // Error {
                    $scope.loadingConversions = false;
                }
            );
        };

        $scope.setConversionToDelete = function (conversion) {
            $scope.conversionToDelete = conversion;
        };


        $scope.removeUnitConversion = function () {
            $scope.processingDeletingConversion = true;
            UnitConversionService.delete({id: $scope.conversionToDelete.id},
                function (value, responseHeaders) {
                    // Success
                    $scope.processingDeletingConversion = false;
                    $scope.addAlert('Successfully deleted unit conversion with factor \'' + $scope.conversionToDelete.conversionFactor + '\'', 'success');
                    $scope.loadUnitConversions();
                },
                function (httpResponse) {
                    // Error
                    $scope.processingDeletingConversion = false;
                    var alert = {};
                    alert.type = 'danger';
                    alert.msg = "Delete failed";
                    $scope.addAlert(alert.msg, alert.type);
                    $scope.loadUnitConversions();
                }
            );
        };

        $scope.viewConversion = function (conversion) {
            $scope.conversion = conversion;
            $scope.unitDropbox = $scope.dropboxes[$scope.conversion.utilityType.toLowerCase() + '_units'];
            $scope.editUnitConversionMode = true;
        };

        $scope.addConversion = function () {
            $scope.conversion = undefined;
            $scope.editUnitConversionMode = true;
        };

        $scope.changeUtilityType = function () {
            $scope.unitDropbox = $scope.dropboxes[$scope.conversion.utilityType.toLowerCase() + '_units'];
            $scope.conversion.fromUnit = '';
            $scope.conversion.toUnit = '';
            $scope.addconversionform.$setPristine();
        };

        $scope.saveUnitConversion = function () {
            if (angular.isDefined($scope.conversion.id)) {
                $scope.updateUnitConversion();
            } else {
                $scope.addUnitConversion();
            }
        };

        $scope.addUnitConversion = function () {
            UnitConversionService.add({}, $scope.conversion,
                function (value, responseHeaders) {
                    // Success
                    $scope.addAlert('Unit conversation for utility type \'' + $filter('enumToString')($scope.conversion.utilityType) + '\' was successfully added.', 'success', 5000);
                    $scope.cancelUnitConversionEdit();
                },
                function (httpResponse) {
                    // Error
                    switch (httpResponse.status) {
                        case 302:
                        case 401:
                        case 403:
                            var alert = {};
                            alert.type = 'error';
                            alert.msg = "Add failed-Insufficient Permissions";
                            $scope.addAlert(alert.msg, alert.type);
                            break;
                        default:
                            var alert = {};
                            alert.type = 'error';
                            alert.msg = "Add failed";
                            $scope.addAlert(alert.msg, alert.type);
                            break;
                    }
                }
            );
        };

        $scope.updateUnitConversion = function () {
            UnitConversionService.update({}, $scope.conversion, function (value, responseHeaders) {
                // on success
                $scope.cancelUnitConversionEdit();
                $scope.addAlert('Successfully updated unit conversion with factor \'' + $scope.conversion.conversionFactor + '\'', 'success')
            }, function (httpResponse) {
                // on Error
                $scope.editUnitConversionMode = true;
                switch (httpResponse.status) {
                    case 404:
                    {
                        $scope.addAlert('The unit conversion with factor \'' + $scope.conversion.conversionFactor + '\' was not found!', 'danger');
                        break;
                    }
                    case 500:
                    {
                        $scope.addAlert('There was an error updating this unit conversion!', 'danger');
                        break;
                    }
                }

            });
        };

        $scope.cancelUnitConversionEdit = function () {
            $scope.editUnitConversionMode = false;
            $scope.conversion = undefined;
            $scope.loadUnitConversions();
        };

        $scope.loadDropboxes(['utilityType', 'electricity_units', 'natural_gas_units', 'water_units', 'steam_units', 'chilled_water_units', 'heating_oil_units', 'diesel_units']);
        $scope.loadUnitConversions();
    }])
    .controller('EditUserLoginDetailsFormCtrl', ['$scope', 'contextPath', 'ProfileService', '$http', 'ControllerInfoPasser', function ($scope, contextPath, ProfileService, $http, ControllerInfoPasser) {

        $scope.formDataMaster = {
            username: '',
            newPassword: '',
            newPasswordAgain: ''
        };

        $scope.authenticationSource = $scope.selectedProfile.userProfile.authenticationSource;

        $scope.formData = angular.copy($scope.formDataMaster);

        $scope.updateUserLoginDetails = function () {
            if ($scope.authenticationSource == 0) {
                $scope.formData.username = $scope.selectedProfile.userProfile.username;
                $http({
                    method: 'POST',
                    url: contextPath + '/webapi/profiles/changeuserpassword',
                    data: $.param($scope.formData),  // pass in data as strings
                    headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
                })
                    .success(function () {
                        $scope.editUserProfileMode = false;
                        $scope.addAlert('Successfully updated user: \'' + $scope.selectedProfile.name + '\'', 'success', 10000);
                    })
                    .error(function (data, status) {
                        $scope.passwordSaveSuccess = false;
                        $scope.passwordSaveError = true;
                        switch (status) {
                            case 310:
                            {
                                $scope.addAlert('The new password is the same as your old password. Please try again.', 'warning');
                                break;
                            }
                            case 311:
                            {
                                $scope.addAlert('The new passwords do not match. Please try again.', 'warning');
                                break;
                            }
                            case 312:
                            {
                                $scope.addAlert('The new password is too short. Please try again.', 'warning');
                                break;
                            }
                            case 404:
                            {
                                $scope.addAlert('The user \'' + $scope.formData.username + '\' was not found!', 'danger');
                                break;
                            }
                            case 500:
                            {
                                $scope.addAlert('An error has occurred trying to change user password.', 'danger');
                                break;
                            }
                        }
                        $scope.edituserlogindetailsform.$setPristine();
                        $scope.formData = angular.copy($scope.formDataMaster);
                    });
            } else {
                $scope.selectedProfile.userProfile.authenticationSource = $scope.authenticationSource;
                ProfileService.update({}, $scope.selectedProfile, function (value, responseHeaders) {
                    // on success
                    $scope.editUserProfileMode = false;
                    $scope.addAlert('Successfully updated user: \'' + $scope.selectedProfile.name + '\'', 'success', 10000);
                }, function (httpResponse) {
                    // on Error
                    $scope.editUserProfileMode = true;
                    switch (status) {
                        case 404:
                        {
                            $scope.addAlert('The user \'' + $scope.selectedProfile.userProfile.username + '\' was not found!', 'danger');
                            break;
                        }
                        case 500:
                        {
                            $scope.addAlert('There was an error updating this user!', 'danger');
                            break;
                        }
                    }

                });
            }

        };

        $scope.reset = function () {
            if ($scope.authenticationSource == 0) {
                $scope.edituserlogindetailsform.uPass2.$setValidity('pwmatch', true);
                $scope.edituserlogindetailsform.uPass1.$setValidity('pwmatch', true);
            }
            $scope.authenticationSource = $scope.selectedProfile.userProfile.authenticationSource;
            $scope.formData = angular.copy($scope.formDataMaster);
            $scope.edituserlogindetailsform.$setPristine();
        };


    }])
    .controller('ViewUserProfileFormCtrl', ['$scope', 'contextPath', 'ProfileService', '$http', function ($scope, contextPath, ProfileService, $http) {

        var alertItem;
        $scope.alerts = [];

        $scope.editUserProfileMode = false;
        $scope.editUserPasswordMode = false;

        $scope.currentPassword = '';
        $scope.newPassword = '';
        $scope.newPassword2 = '';

        $scope.addingLogin = false;

        $scope.addLogin = function (addingLogin) {
            $scope.addingLogin = addingLogin;
            if (addingLogin) {
                $scope.userProfile = {authenticationSource: 0};
            }
        };

        $scope.addAlert = function (msg, type) {
            //$scope.alerts.push( alert );
            if ($scope.alerts.length > 0) {
                $scope.alerts.splice(0, 1);
            }

            $scope.alerts.push({msg: msg, type: type});


        };

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.cancelUserProfileEdit = function () {
            $scope.editUserProfileMode = false;
            $scope.editUserPasswordMode = false;
            $scope.addingLogin = false;
            $scope.selectedProfile = $scope.originalSelectedProfile;
            $scope.viewuserprofileform.$setPristine();
        };

        $scope.editUser = function () {
            $scope.editUserProfileMode = true;
            $scope.originalSelectedProfile = angular.copy($scope.selectedProfile);

            if (angular.isDefined($scope.selectedProfile.userProfile)) {
                $scope.active = $scope.selectedProfile.userProfile.active;
                $scope.roleAssigned = $scope.selectedProfile.userProfile.roles[0].roleName;
            }
        };

        $scope.setAuthenticationSource = function (source) {
            if (source == 'local') {
                $scope.authenticationSource = 0;
            } else {
                $scope.authenticationSource = 1;
            }
        };

        $scope.isAuthenticationSourceLocal = function () {
            if ($scope.authenticationSource == 0) {
                return true;
            } else {
                return false;
            }
        };

        $scope.updateUser = function () {

            if (angular.isDefined($scope.userProfile)) {
                $scope.selectedProfile.userProfile = $scope.userProfile;
            }

            if (angular.isDefined($scope.selectedProfile.userProfile)) {

                $scope.selectedProfile.userProfile.active = $scope.active;

                if ($scope.roleAssigned != '') {
                    for (var x = 0; x < $scope.allRoles.length; x++) {
                        var role = $scope.allRoles[x];
                        if (role.roleName == $scope.roleAssigned) {
                            var roles = [];
                            roles.push(role);
                            $scope.selectedProfile.userProfile.roles = roles;
                            break;
                        }
                    }
                } else {
                    var roles = [];
                    $scope.selectedProfile.userProfile.roles = roles;
                }
            }

            ProfileService.update({}, $scope.selectedProfile, function (value, responseHeaders) {
                // on success
                $scope.editUserProfileMode = false;
                $scope.addingLogin = false;
                $scope.addAlert('Successfully updated user: \'' + $scope.selectedProfile.name + '\'', 'success')
            }, function (httpResponse) {
                // on Error
                $scope.editUserProfileMode = true;
                switch (status) {
                    case 404:
                    {
                        $scope.addAlert('The user \'' + $scope.selectedProfile.userProfile.username + '\' was not found!', 'danger');
                        break;
                    }
                    case 500:
                    {
                        $scope.addAlert('There was an error updating this user!', 'danger');
                        break;
                    }
                }

            });
        }
    }])
    .controller('EmissionFactorsCtrl', ['$scope', 'contextPath', 'EmissionFactorService', '$uibModal', 'ControllerInfoPasser', function ($scope, contextPath, EmissionFactorService, $modal, ControllerInfoPasser) {

        $scope.emissionFactorsList = [];
        $scope.persisting = false;
        $scope.loadingFactorsList = false;
        $scope.currentAction = "";
        $scope.emissionsOrder = ['-year', 'emissionSource', 'country', 'province'];


        $scope.loadEmissionFactorsList = function () {
            $scope.loadingFactorsList = true;
            EmissionFactorService.query({}, function (value, responseHeaders) {
                $scope.emissionFactorsList = value;
                $scope.loadingFactorsList = false;
            }, function (httpResponse) {
                // On Error
                $scope.loadingFactorsList = false;
                $scope.addAlert('There was an error loading the emission factors!', 'danger');
            });
        };

        $scope.createEmissionFactor = function () {
            EmissionFactorService.create({}, function (value, responseHeaders) {
                // On Success
                ControllerInfoPasser.put('emissionFactorToCreate', value);
                $scope.changeMiddleSectionTo("partials/administration/ghg/emissionFactorInput.html");

            }, function (httpResponse) {
                // On Error
                switch (httpResponse.status) {
                    case 501:
                        $scope.addAlert('Creation of new emission factor is not supported by the administration.', 'warning');
                        break;
                    default:
                        $scope.addAlert('There was an error adding the record!', 'danger');
                        break;
                }
            });
        };

        $scope.editEmissionFactor = function (factor) {
            ControllerInfoPasser.put('emissionFactorToEdit', factor);
            ControllerInfoPasser.broadcast("event:editingEmissionFactor");
            $scope.changeMiddleSectionTo("partials/administration/ghg/emissionFactorInput.html");
        };

    }])
    .controller('EmissionFactorsInputCtrl', ['$scope', 'contextPath', 'EmissionFactorService', '$uibModal', 'ControllerInfoPasser', function ($scope, contextPath, EmissionFactorService, $modal, ControllerInfoPasser) {

        $scope.emissionFactorsList = [];
        $scope.persisting = false;
        $scope.co2_uncertaintyPercentage = 0;
        $scope.ch4_uncertaintyPercentage = 0;
        $scope.n20_uncertaintyPercentage = 0;
        $scope.combinedUncertaintyPercentage = 0;


        $scope.addEmissionFactor = function () {
            if ($scope.form.$valid) {
                if ($scope.emissionFactor) {
                    $scope.persisting = true;
                    EmissionFactorService.save({}, $scope.emissionFactor, function (value, responseHeaders) {
                        // On Success
                        $scope.persisting = false;
                        $scope.currentAction = "";
                        $scope.changeMiddleSectionTo("partials/administration/ghg/emissionFactors.html");

                    }, function (httpResponse) {
                        // On Error
                        switch (httpResponse.status) {
                            case 405:
                                $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
                                break;

                            case 417:
                                $scope.addAlert("Duplicate detected.  There's already an existing emission factor for the same location, please enter a different one.", 'warning');
                                break;

                            default:
                                $scope.addAlert('There was an error adding the new emission factor!', 'danger');
                                break;
                        }
                        $scope.persisting = false;
                    });
                }
            } else {
                $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
            }
        };

        $scope.updateEmissionFactor = function () {
            if ($scope.form.$valid) {
                if ($scope.emissionFactor) {
                    $scope.persisting = true;
                    EmissionFactorService.update({}, $scope.emissionFactor, function (value, responseHeaders) {
                        // On Success
                        $scope.persisting = false;
                        $scope.currentAction = "";
                        $scope.addAlert('Successfully updated emission factor with ID ' + $scope.emissionFactor.id, 'success');
                        $scope.changeMiddleSectionTo("partials/administration/ghg/emissionFactors.html");

                    }, function (httpResponse) {
                        // On Error
                        switch (httpResponse.status) {
                            case 405:
                                $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
                                break;

                            case 417:
                                $scope.addAlert("Duplicate detected.  There's already an existing emission factor for the same location, please enter a different one.", 'warning');
                                break;

                            default:
                                $scope.addAlert('There was an error updating the emission factor!', 'danger');
                                break;
                        }
                        $scope.persisting = false;
                    });
                }

            } else {
                $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
            }
        };

        $scope.deleteEmissionFactor = function () {
            if ($scope.emissionFactor.id) {
                $scope.persisting = true;
                EmissionFactorService.delete({id: $scope.emissionFactor.id}, function (value, responseHeaders) {
                    // On Success
                    $scope.persisting = false;
                    $scope.currentAction = "";
                    $scope.addAlert('Successfully deleted emission factor with ID ' + $scope.emissionFactor.id, 'success');
                    $scope.changeMiddleSectionTo("partials/administration/ghg/emissionFactors.html");

                }, function (httpResponse) {
                    // On Error
                    $scope.persisting = false;
                    $scope.addAlert('There was an error deleting the emission factor!', 'danger');

                });
            } else {
                $scope.addAlert('Cannot delete emission factor that does not exist!', 'warning');
            }
        };

        $scope.initializeEmissionFactorForm = function () {
            if ($scope.form) {
                $scope.form.$setPristine();
            }

            if (ControllerInfoPasser.get('emissionFactorToEdit')) {
                $scope.emissionFactor = ControllerInfoPasser.get('emissionFactorToEdit');
                ControllerInfoPasser.clear('emissionFactorToEdit');
                $scope.currentAction = 'Edit';

            } else {
                $scope.emissionFactor = ControllerInfoPasser.get('emissionFactorToCreate');
                ControllerInfoPasser.clear('emissionFactorToCreate');
                $scope.currentAction = 'Add';

            }
        };

        $scope.cancelFormInput = function () {
            $scope.initializeEmissionFactorForm();
            $scope.changeMiddleSectionTo("partials/administration/ghg/emissionFactors.html");
        };

        $scope.getUtilityUnitDropboxName = function (utilityName) {
            var dropboxName;
            if (utilityName) {
                dropboxName = utilityName.toLocaleLowerCase() + "_units";
            }
            return dropboxName;
        };

        $scope.clearAllAlertsInPage = function () {
            // alert( $scope.alerts.length );
            for (var x = 0; x < $scope.alerts.length; x++) {
                $scope.alerts.splice(x, 1);
            }
        };

    }])
    .controller("UtilityBenchmarksCtrl", ["$scope", "UtilityBenchmarkService", "ControllerInfoPasser", function ($scope, UtilityBenchmarkService, ControllerInfoPasser) {

        $scope.utilityBenchmarksList = [];
        $scope.persisting = false;
        $scope.loadingUtilityBenchmarksList = false;
        $scope.currentAction = "";
        $scope.utilityBenchmarksOrder = ["-year"];
        var UTILITY_BENCHMARK_FORM_HTML_PARTIAL = "partials/administration/sustainability/utilityBenchmarkInput.html";

        $scope.loadUtilityBenchmarksList = function () {
            $scope.loadingUtilityBenchmarksList = true;

            UtilityBenchmarkService.query({}, function (value, ignoreResponseHeaders) {
                $scope.utilityBenchmarksList = value;
                $scope.loadingUtilityBenchmarksList = false;
            }, function (ignoreHttpResponse) {
                // On Error
                $scope.loadingUtilityBenchmarksList = false;
                $scope.addAlert("There was an error loading the utility benchmarks!", "danger");
            });
        };

        $scope.createUtilityBenchmark = function () {
            UtilityBenchmarkService.create({}, function (value, ignore) {
                // On Success
                ControllerInfoPasser.put("utilityBenchmarkToCreate", value);
                $scope.changeMiddleSectionTo(UTILITY_BENCHMARK_FORM_HTML_PARTIAL);

            }, function (httpResponse) {
                // On Error
                switch (httpResponse.status) {
                    case 501:
                        $scope.addAlert("Creation of new utility benchmark is not supported by the administration.", "warning");
                        break;
                    default:
                        $scope.addAlert("There was an error adding the new utility benchmark!", "danger");
                        break;
                }
            });
        };

        $scope.editUtilityBenchmark = function (benchmark) {
            ControllerInfoPasser.put("utilityBenchmarkToEdit", benchmark);
            ControllerInfoPasser.broadcast("event:editingUtilityBenchmark");
            $scope.changeMiddleSectionTo(UTILITY_BENCHMARK_FORM_HTML_PARTIAL);
        };

        $scope.loadUtilityBenchmarksList();
    }])
    .controller("UtilityBenchmarkInputCtrl", ["$scope", "$http", "contextPath", "UtilityBenchmarkService", "ControllerInfoPasser", function ($scope, $http, contextPath, UtilityBenchmarkService, ControllerInfoPasser) {

        $scope.utilityBenchmarkList = [];
        $scope.persisting = false;
        $scope.propertyTypesList = [];
        $scope.propertyRegionsList = [];
        $scope.benchmarkTypes = [];

        var ENERGY_BENCHMARK_TYPE_NAME = "ENERGY";
        var WASTE_BENCHMARK_TYPE_NAME = "WASTE";
        var MAIN_UTILITY_BENCHMARK_HOME_HTML_PARTIAL = "partials/administration/sustainability/utilityBenchmarks.html";

        var utilityTypesDropboxName = "utilityType";
        var baseBenchmarkTypes = [
            {key: "Energy", value: ENERGY_BENCHMARK_TYPE_NAME},
            {key: "Waste", value: WASTE_BENCHMARK_TYPE_NAME}
        ];

        var benchmarkEnergyTypeUnits = [
            {key: "ekWh", value: "ekWh"}
        ];

        var benchmarkWasteTypeUnits = [
            {key: "Tonnes", value: "Tonnes"}
        ];

        var showSaveErrorMessage = function(httpResponse) {
            switch (httpResponse.status) {
                case 405:
                    $scope.addAlert("Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.", "warning");
                    break;

                case 417:
                    $scope.addAlert("Duplicate detected.  There's already an existing utility benchmark with the same information, please enter a different one.", "warning");
                    break;

                default:
                    $scope.addAlert("There was an error saving the utility benchmark!", "danger");
                    break;
            }
        };

        var showInvalidInputMessage = function() {
            $scope.addAlert("Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.", "warning");
        };

        $scope.addUtilityBenchmark = function () {
            if ($scope.form.$valid) {
                if ($scope.utilityBenchmark) {
                    $scope.persisting = true;
                    UtilityBenchmarkService.save({}, $scope.utilityBenchmark, function (ignoreValue, ignoreResponseHeaders) {
                        // On Success
                        $scope.persisting = false;
                        $scope.currentAction = "";
                        $scope.addAlert("Successfully added utility benchmark!", "success");
                        $scope.changeMiddleSectionTo(MAIN_UTILITY_BENCHMARK_HOME_HTML_PARTIAL);

                    }, function (httpResponse) {
                        // On Error
                        showSaveErrorMessage(httpResponse);
                        $scope.persisting = false;
                    });
                }
            } else {
                showInvalidInputMessage();
            }
        };

        $scope.updateUtilityBenchmark = function () {
            if ($scope.form.$valid) {
                if ($scope.utilityBenchmark) {
                    $scope.persisting = true;
                    UtilityBenchmarkService.update({}, $scope.utilityBenchmark, function (ignoreValue, ignoreResponseHeaders) {
                        // On Success
                        $scope.persisting = false;
                        $scope.currentAction = "";
                        $scope.addAlert("Successfully updated utility benchmark with ID " + $scope.utilityBenchmark.id, "success");
                        $scope.changeMiddleSectionTo(MAIN_UTILITY_BENCHMARK_HOME_HTML_PARTIAL);

                    }, function (httpResponse) {
                        // On Error
                        showSaveErrorMessage(httpResponse);
                        $scope.persisting = false;
                    });
                }

            } else {
                showInvalidInputMessage();
            }
        };

        $scope.deleteUtilityBenchmark = function () {
            if ($scope.utilityBenchmark.id) {
                $scope.persisting = true;
                UtilityBenchmarkService.delete({id: $scope.utilityBenchmark.id}, function (ignoreValue, ignoreResponseHeaders) {
                    // On Success
                    $scope.persisting = false;
                    $scope.currentAction = "";
                    $scope.addAlert("Successfully deleted utility benchmark with ID " + $scope.utilityBenchmark.id, "success");
                    $scope.changeMiddleSectionTo(MAIN_UTILITY_BENCHMARK_HOME_HTML_PARTIAL);

                }, function (ignoreHttpResponse) {
                    // On Error
                    $scope.persisting = false;
                    $scope.addAlert("There was an error deleting the utility benchmark!", "danger");

                });
            } else {
                $scope.addAlert("Cannot delete utility benchmark that does not exist!", "warning");
            }
        };

        var initializeUtilityBenchmarkForm = function () {
            if ($scope.form) {
                $scope.form.$setPristine();
            }

            if (ControllerInfoPasser.get("utilityBenchmarkToEdit")) {
                $scope.utilityBenchmark = ControllerInfoPasser.get("utilityBenchmarkToEdit");
                ControllerInfoPasser.clear("utilityBenchmarkToEdit");
                $scope.currentAction = "Edit";

            } else {
                $scope.utilityBenchmark = ControllerInfoPasser.get("utilityBenchmarkToCreate");
                ControllerInfoPasser.clear("utilityBenchmarkToCreate");
                $scope.currentAction = "Add";

            }
        };

        $scope.cancelFormInput = function () {
            initializeUtilityBenchmarkForm();
            $scope.changeMiddleSectionTo(MAIN_UTILITY_BENCHMARK_HOME_HTML_PARTIAL);
        };

        var loadPropertyTypes = function() {
            $http.get(contextPath + "/webapi/properties/types").success(function (data, ignoreStatus) {
                $scope.propertyTypesList = data;

            }).error(function (ignoreStatus) {
            });
        };

        var loadPropertyRegions = function() {
            $http.get(contextPath + "/webapi/properties/units").success(function (data, ignoreStatus) {
                $scope.propertyRegionsList = data;

            }).error(function (ignoreStatus) {
            });
        };

        var getUtilityUnitDropboxName = function (utilityName) {
            var dropboxName;
            if (utilityName) {
                dropboxName = utilityName.toLocaleLowerCase() + "_units";
            }
            return dropboxName;
        };

        $scope.getBenchmarkTypeUnits = function (benchmarkType) {
            var units = [];
            if (benchmarkType) {
                if (benchmarkType === ENERGY_BENCHMARK_TYPE_NAME) {
                    units = benchmarkEnergyTypeUnits;

                } else {
                    if (benchmarkType === WASTE_BENCHMARK_TYPE_NAME) {
                        units = benchmarkWasteTypeUnits;

                    } else {
                        units = $scope.dropboxes[ getUtilityUnitDropboxName(benchmarkType) ].itemMap;

                    }
                }
            }
            return units;
        };

        var appendUtilityTypesToBenchmarkTypes = function() {
            $scope.benchmarkTypes = angular.copy(baseBenchmarkTypes);

            var utilityDropboxes = $scope.dropboxes[utilityTypesDropboxName].itemMap;
            $scope.benchmarkTypes = $scope.benchmarkTypes.concat(utilityDropboxes);
        };

        var loadUtilityBenchmarkDropboxes = function() {
            var dropboxesToLoad = [
                utilityTypesDropboxName,
                "electricity_units",
                "natural_gas_units",
                "water_units",
                "steam_units",
                "chilled_water_units",
                "heating_oil_units",
                "diesel_units"
            ];

            $scope.loadDropboxes(dropboxesToLoad, appendUtilityTypesToBenchmarkTypes);
            $scope.loadCountries();

            loadPropertyRegions();
            loadPropertyTypes();
        };

        loadUtilityBenchmarkDropboxes();
        initializeUtilityBenchmarkForm();
        $scope.clearAllAlertsInPage();

    }])
    .controller('DropboxAdminCtrl', ['$scope', 'contextPath', 'DropboxService', '$uibModal', 'ControllerInfoPasser', 'Upload', function ($scope, contextPath, DropboxService, $modal, ControllerInfoPasser, Upload) {
        $scope.isQuestionnaireDropboxes = $scope.selected.label.search('Questionnaire') > -1;

        $scope.adminDropboxes = [];
        $scope.loadingDropboxes = false;

        $scope.contentSection = "partials/administration/dropbox/dropboxes.html";

        $scope.setAdminDropboxes = function (list) {
            $scope.adminDropboxes = undefined;
            $scope.adminDropboxes = list;
        };

        $scope.changeContentSection = function (section) {
            $scope.contentSection = section;
        };


        $scope.loadAdminDropboxes = function () {
            $scope.loadingDropboxes = true;

            if ($scope.isQuestionnaireDropboxes) {
                return DropboxService.findQuestionnaireDropboxes({}, function (data, headers) {
                    $scope.loadingDropboxes = false;
                    $scope.setAdminDropboxes(data);

                }, function (httpResponse) {
                    // On Error
                    $scope.loadingDropboxes = false;
                    $scope.addAlert("Cannot load dropboxes: a server problem has been detected.", "danger");
                }).$promise;
            } else {
                return DropboxService.query({}, function (data, headers) {
                    $scope.loadingDropboxes = false;
                    $scope.setAdminDropboxes(data);

                }, function (httpResponse) {
                    // On Error
                    $scope.loadingDropboxes = false;
                    $scope.addAlert("Cannot load dropboxes: a server problem has been detected.", "danger");
                }).$promise;
            }

        };

        $scope.openDropbox = function (selectedDropbox) {
            if (angular.isDefined(selectedDropbox)) {
                DropboxService.findByID({id: selectedDropbox.id}, function (data, headers) {
                    ControllerInfoPasser.put('dropboxToView', data);
                    $scope.changeContentSection("partials/administration/dropbox/dropboxAdminInput.html");

                }, function (httpResponse) {
                    // On Error
                    $scope.addAlert("Cannot open dropbox: a server problem has been detected.", "danger");
                });
            } else {
                // Create a questionnaire dropbox
                var dropbox = {
                    name: '',
                    type: 'USER',
                    questionnaireDropbox: true
                };

                ControllerInfoPasser.put('dropboxToView', dropbox);
                $scope.changeContentSection("partials/administration/dropbox/dropboxAdminInput.html");
            }
        };

        $scope.exportAllDropboxes = function () {
            if ($scope.isQuestionnaireDropboxes) {
                $scope.openInNewWindow('GET', contextPath + "/webapi/dropboxes/export/questionnaires");
            } else {
                $scope.openInNewWindow('GET', contextPath + "/webapi/dropboxes/export");
            }
        };

        $scope.exportDropbox = function (id) {
            $scope.openInNewWindow('GET', contextPath + "/webapi/dropboxes/" + id + "/export");
        };

        $scope.importDropbox = function ($files) {
            if ($files.length == 0) {
                return;
            }

            // alert( "entered" );
            $scope.loadingDropboxes = true;
            for (var i = 0; i < $files.length; i++) {
                Upload.upload({
                    url: contextPath + '/webapi/upload/dropbox',
                    method: 'POST',
                    file: $files[i]
                }).progress(function (evt) {
                    //// console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    $scope.loadingDropboxes = false;
                    $scope.addAlert('Successfully imported dropbox(es)', 'success', 10000);
                    $scope.loadAdminDropboxes();
                }).error(function (data, status, headers, config) {
                    $scope.loadingDropboxes = false;
                    switch (status) {
                        case 406:
                            $scope.addAlert('The XML file uploaded is invalid. Please check the file and try again', 'warning', 10000);
                            break;
                        case 405:
                            $scope.addAlert('The XML file uploaded is valid but the content values are invalid. Please check the file and try again', 'warning', 10000);
                            break;
                        case 417:
                            $scope.addAlert('The XML file uploaded is valid but content values are conflicting with the system rules. Please check the file and try again', 'warning', 10000);
                            break;

                        default:
                            $scope.addAlert('An error has occurred while trying to import the dropbox(es)!', 'danger', 10000);
                            break;
                    }

                });
            }
        };

    }])
    .controller('DropboxAdminInputCtrl', ['$scope', 'contextPath', 'DropboxService', '$uibModal', 'ControllerInfoPasser', '$filter', function ($scope, contextPath, DropboxService, $modal, ControllerInfoPasser, $filter) {

        $scope.dropbox = null;
        $scope.dropboxItems = [];
        $scope.selectedDropboxItem = null;
        $scope.dropboxItemToAdd = {};

        var defaultPredicates = [];

        $scope.tableDataOrder = [];

        $scope.initializeDropboxAdminInput = function () {
            /*if( $scope.complianceForm ) {
             $scope.complianceForm.$setPristine();
             }*/

            if (ControllerInfoPasser.get('newComplianceRecord')) {
                $scope.complianceRecord = ControllerInfoPasser.get('newComplianceRecord');
                ControllerInfoPasser.clear('newComplianceRecord');
                $scope.currentAction = 'Add';
                $scope.transactionName = "New Compliance Record";

            } else {
                $scope.dropbox = ControllerInfoPasser.get('dropboxToView');
                $scope.dropboxItems = $scope.dropbox.itemMap;
                ControllerInfoPasser.clear('dropboxToView');
            }
        };

        $scope.resetTableDataOrder = function () {
            $scope.tableDataOrder = angular.copy(defaultPredicates);
        };

        $scope.openDropbox = function (selectedDropbox) {
            $scope.dropbox = selectedDropbox;
        };

        $scope.sortOptions = {
            placeholder: 'sortable-accept',
            stop: function (event, ui) {
                sequenceArray($scope.dropboxItems);
            }
        };

        var sequenceArray = function (array) {
            angular.forEach(array, function (item, index) {
                item.sequence = index + 1;
            });
        };

        $scope.deleteDropboxItem = function () {
            if ($scope.selectedDropboxItem) {
                var position = $scope.dropboxItems.indexOf($scope.selectedDropboxItem);
                $scope.dropboxItems.splice(position, 1);
            }
        };

        $scope.setItemToDelete = function (item) {
            $scope.selectedDropboxItem = item;
        };

        $scope.addItem = function () {
            if (angular.isUndefined($scope.dropboxItems)) {
                $scope.dropboxItems = [];
            }

            if ($scope.dropboxItemToAdd.key != null && $scope.dropboxItemToAdd.value != null) {
                $scope.dropboxItemToAdd.sequence = $scope.dropboxItems.length + 1;
                $scope.dropboxItems.push($scope.dropboxItemToAdd);
                $scope.dropboxItemToAdd = {};
                $('#newDropboxItemForm').collapse('hide');
            } else {

            }
        };

        $scope.saveDropbox = function () {
            $scope.dropbox.itemMap = $scope.dropboxItems;
            $scope.isEditingDropboxInformation = false;

            if (angular.isDefined($scope.dropbox.id)) {
                updateDropbox();
            } else {
                createDropbox();
            }
        };

        $scope.isEditingDropboxInformation = false;
        $scope.editDropboxInformation = function () {
            if ($scope.isEditingDropboxInformation == false) {
                $scope.isEditingDropboxInformation = true;
            } else {
                $scope.isEditingDropboxInformation = false;
            }

        };

        var updateDropbox = function () {
            DropboxService.update({}, $scope.dropbox, function (data, headers) {
                $scope.addAlert("Dropbox successfully saved", "success");
                DropboxService.findByID({id: $scope.dropbox.id}, function (data, headers) {
                    ControllerInfoPasser.put('dropboxToView', data);
                    $scope.initializeDropboxAdminInput();

                }, function (httpResponse) {
                    // On Error
                    $scope.addAlert("Cannot load dropbox: a server problem has been detected.", "danger");
                });

            }, function (httpResponse) {
                // On Error
                $scope.addAlert("Cannot save dropbox: a server problem has been detected.", "danger");
            });
        };

        var createDropbox = function () {
            DropboxService.save({}, $scope.dropbox, function (data, headers) {
                $scope.addAlert("Dropbox successfully saved", "success");
                ControllerInfoPasser.put('dropboxToView', data);
                $scope.initializeDropboxAdminInput();
            }, function (httpResponse) {
                // On Error
                $scope.addAlert("Cannot save dropbox: a server problem has been detected.", "danger");
            });
        };

        $scope.deleteDropbox = function () {
            DropboxService.delete({id: $scope.dropbox.id}, function () {
                $scope.addAlert("Dropbox deleted successfully", "success");

                // We need to give the modal animation time to clear before switching screens.
                // Otherwise the backdrop of the modal does not get removed and the page becomes unclickable
                $scope.timeout(function () {
                    $scope.changeContentSection('partials/administration/dropbox/dropboxes.html');
                }, 100);
            }, function (httpResponse) {
                switch (httpResponse.status) {
                    case 409:
                        $scope.addAlert("Cannot delete this dropbox. It is being used on a questionnaire!", "info");
                        break;
                    default:
                        $scope.addAlert("An error has occurred trying to delete this dropbox!", "danger");
                }
            });
        };

        $scope.$watch('tableDataOrder', function (newValue, oldValue) {
            if ($scope.tableDataOrder.length > 0) {
                $scope.dropboxItems = $filter('orderBy')($scope.dropboxItems, $scope.tableDataOrder);
                sequenceArray($scope.dropboxItems);
            }
        }, true);

        $scope.resetTableDataOrder();

    }])
    .controller('PropertyAssignmentCtrl', ['$scope', 'contextPath', 'PropertyLookup', 'PropertyAssignmentsService', 'PropertyGroupService', 'UserService', '$filter', function ($scope, contextPath, PropertyLookup, PropertyAssignmentsService, PropertyGroupService, UserService, $filter) {
        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.propertiesOrGroups = 'Properties';

        $scope.propertyGroups = [];

        $scope.isPropertyGroupAssigned = function(propertyGroup) {
            var isAssigned = false;
            for (var i = 0; i < $scope.assignedPropertyGroups.length; i++) {
                if (propertyGroup.id === $scope.assignedPropertyGroups[i].id) {
                    isAssigned = true;
                    break;
                }
            }

            return isAssigned;
        };

        $scope.initializeAssignedPropertyGroups = function () {
            $scope.assignedPropertyGroups = [];

            if (angular.isDefined($scope.selectedProfile.userProfile)) {
                PropertyGroupService.getByUserId({id: $scope.selectedProfile.id}, function (data) {
                    $scope.assignedPropertyGroups = data;
                }, function (ignoreHttpResponse) {
                    $scope.addAlert("There was a problem retrieving the assigned property groups...", "danger");
                });
            }
        };

        $scope.sortOrder = ['propertyNumber'];


        var spinner = new Spinner();
        var spinner2 = new Spinner();
        $scope.assignedPropertyList = [];

        var target = document.getElementById("spinTarget");
        var target2 = document.getElementById("assignedPropertiesTableSpinTarget");

        $scope.propertyList = undefined;
        $scope.loadProperties = function () {
            $scope.propertyList = undefined;
            $scope.assignedPropertyList = [];
            if (!$scope.propertyList) {
                spinner.spin(target);
                spinner2.spin(target2);
                PropertyAssignmentsService.getAssignedProperties({username: $scope.selectedProfile.userProfile.username}, function (assignedPropertyList, headers) {
                    // $scope.assignedPropertyList = data;
                    PropertyLookup.query({}, function (data, headers) {
                        // $scope.propertyList = data;
                        $scope.determineAvailableProperties(assignedPropertyList, data);
                    }, function (httpResponse) {
                        // alert( JSON.stringify( httpResponse ) );
                        $scope.propertyList = [];
                    }).$promise.then(function () {
                            spinner.stop();
                    });
                }, function (ignoreHttpResponse) {
                    $scope.assignedPropertyList = [];
                });

            }

            PropertyGroupService.query({}, function (data) {
                $scope.propertyGroups = angular.copy(data);
            });
        };

        $scope.determineAvailableProperties = function (assignedProperties, listOfProperties) {
            $scope.assignedPropertyList = assignedProperties;
            for (var x = 0; x < assignedProperties.length; x++) {
                for (var i = 0; i < listOfProperties.length; i++) {
                    if (assignedProperties[x].propertyNumber == listOfProperties[i].propertyNumber) {
                        listOfProperties.splice(i, 1);
                        break;
                    }
                }
            }
            $scope.propertyList = listOfProperties;
            spinner2.stop();
        };


        $scope.loadAssignedProperties = function () {
            // $scope.selectedProfile;
            var target2 = document.getElementById("assignedPropertiesTableSpinTarget");
            spinner2.spin(target2);
            PropertyAssignmentsService.getAssignedProperties({username: $scope.selectedProfile.userProfile.username}, function (data, headers) {
                $scope.assignedPropertyList = data;
            }, function (httpResponse) {
                $scope.assignedPropertyList = [];
            }).$promise.then(function () {
                    spinner2.stop();
                });
        };

        $scope.assignProperty = function (property) {
            PropertyAssignmentsService.assign({
                username: $scope.selectedProfile.userProfile.username,
                propertyNumber: property.propertyNumber
            }, function (data, headers) {
                $scope.assignedPropertyList.push(property);
                for (var i = 0; i < $scope.propertyList.length; i++) {
                    if (property.propertyNumber == $scope.propertyList[i].propertyNumber) {
                        $scope.propertyList.splice(i, 1);
                        break;
                    }
                }
            }, function (httpResponse) {
                $scope.addAlert("There was a problem assigning the property", "warning");
            });
        };

        $scope.unassignProperty = function (property) {

            PropertyAssignmentsService.unassign({
                username: $scope.selectedProfile.userProfile.username,
                propertyNumber: property.propertyNumber
            }, function (data, headers) {
                $scope.propertyList.push(property);
                for (var i = 0; i < $scope.assignedPropertyList.length; i++) {
                    if (property.propertyNumber == $scope.assignedPropertyList[i].propertyNumber) {
                        $scope.assignedPropertyList.splice(i, 1);
                        break;
                    }
                }
            }, function (httpResponse) {
                $scope.addAlert("There was a problem unassigning the property", "warning");
            });

        };

        $scope.assignPropertyGroup = function (group) {
            UserService.assignPropertyGroup({
                username: $scope.selectedProfile.userProfile.username,
                groupName: group.groupName
            }, {}, function () {
                $scope.assignedPropertyGroups.push(group);
            }, function () {
                $scope.addAlert('An error has occurred while trying to assign the group to the user!', 'danger', 10000);
            });
        };

        $scope.unassignPropertyGroup = function (group) {
            UserService.unassignPropertyGroup({
                username: $scope.selectedProfile.userProfile.username,
                groupName: group.groupName
            }, {}, function () {
                var index = $scope.assignedPropertyGroups.indexOf(group);
                $scope.assignedPropertyGroups.splice(index, 1);
            }, function () {
                $scope.addAlert('An error has occurred while trying to unassign the group to the user!', 'danger', 10000);
            });
        };

        $scope.groupToViewProperties = [];
        $scope.viewPropertyGroup = function (group) {
            $scope.groupToView = group;
            $scope.groupToViewProperties.length = 0;
            PropertyGroupService.getProperties({id: $scope.groupToView.id}, function (data) {
                $scope.groupToViewProperties = angular.copy(data);

            }, function (ignoreHttpResponse) {
                // Error
            });
        };

        $scope.initializeAssignedPropertyGroups();
        $scope.loadProperties();

    }])
    .controller('WasteStreamsCtrl', ['$scope', 'contextPath', 'PropertyLookup', 'WasteStreamsService', 'ControllerInfoPasser', function ($scope, contextPath, PropertyLookup, WasteStreamsService, ControllerInfoPasser) {
        $scope.wasteStreamsList = [];
        $scope.wasteStreamOrder = ['name'];

        $scope.loadingWasteStreamsList = false;

        $scope.setWasteStreamsList = function (list) {
            $scope.wasteStreamsList = list;
        };

        $scope.loadWasteStreamsList = function () {
            $scope.loadingWasteStreamsList = true;
            WasteStreamsService.query(function (value, responseHeaders) {
                    // Success
                    $scope.loadingWasteStreamsList = false;
                    $scope.setWasteStreamsList(value);
                },
                function (httpResponse) {
                    // Error
                    $scope.loadingWasteStreamsList = false;
                }
            );
        };

        $scope.editWasteStream = function (wasteStream) {

        };

        $scope.createWasteStream = function () {
            WasteStreamsService.create({}, function (value, responseHeaders) {
                // On Success
                ControllerInfoPasser.put('wasteStreamToCreate', value);
                $scope.changeMiddleSectionTo("partials/administration/wastemanagement/wasteStreamInput.html");

            }, function (httpResponse) {
                // On Error
                switch (httpResponse.status) {
                    case 501:
                        $scope.addAlert('Creation of new waste stream is not supported by the administration.', 'warning');
                        break;
                    default:
                        $scope.addAlert('There was an error creating the waste stream!', 'danger');
                        break;
                }
            });
        };

        $scope.editWasteStream = function (factor) {
            ControllerInfoPasser.put('wasteStreamToEdit', factor);
            ControllerInfoPasser.broadcast("event:editingWasteStream");
            $scope.changeMiddleSectionTo("partials/administration/wastemanagement/wasteStreamInput.html");
        };

    }])
    .controller('WasteStreamInputCtrl', ['$scope', '$http', 'contextPath', 'PropertyLookup', 'WasteStreamsService', 'ControllerInfoPasser', function ($scope, $http, contextPath, PropertyLookup, WasteStreamsService, ControllerInfoPasser) {
        $scope.streamTypesList = [];
        $scope.streamSubTypesList = [];

        $scope.persisting = false;

        $scope.addWasteStream = function () {
            if ($scope.form.$valid) {
                if ($scope.wasteStream) {
                    $scope.persisting = true;
                    WasteStreamsService.save({}, $scope.wasteStream, function (value, responseHeaders) {
                        // On Success
                        $scope.persisting = false;
                        $scope.currentAction = "";
                        $scope.changeMiddleSectionTo("partials/administration/wastemanagement/wasteStreams.html");

                    }, function (httpResponse) {
                        // On Error
                        switch (httpResponse.status) {
                            case 405:
                                $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
                                break;

                            case 417:
                                $scope.addAlert("Duplicate detected.  A waste stream of the same name already exists.", 'warning');
                                break;

                            default:
                                $scope.addAlert('There was an error adding the new waste stream!', 'danger');
                                break;
                        }
                        $scope.persisting = false;
                    });
                }
            } else {
                $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
            }
        };

        $scope.updateWasteStream = function () {
            if ($scope.form.$valid) {
                if ($scope.wasteStream) {
                    $scope.persisting = true;
                    WasteStreamsService.update({}, $scope.wasteStream, function (value, responseHeaders) {
                        // On Success
                        $scope.persisting = false;
                        $scope.currentAction = "";
                        $scope.addAlert('Successfully updated waste stream with ID ' + $scope.wasteStream.id, 'success');
                        $scope.changeMiddleSectionTo("partials/administration/wastemanagement/wasteStreams.html");

                    }, function (httpResponse) {
                        // On Error
                        switch (httpResponse.status) {
                            case 405:
                                $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
                                break;

                            case 417:
                                $scope.addAlert("Duplicate detected.  A waste stream of the same name already exists.", 'warning');
                                break;

                            default:
                                $scope.addAlert('There was an error updating the waste stream!', 'danger');
                                break;
                        }
                        $scope.persisting = false;
                    });
                }

            } else {
                $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
            }
        };

        $scope.$on('event:deleteAdminRecord', function () {
            $scope.deleteWasteStream();
        });

        $scope.deleteWasteStream = function () {
            if ($scope.wasteStream.id) {
                $scope.persisting = true;
                WasteStreamsService.delete({id: $scope.wasteStream.id}, function (value, responseHeaders) {
                    // On Success
                    $scope.persisting = false;
                    $scope.currentAction = "";
                    $scope.addAlert('Successfully deleted waste stream with ID ' + $scope.wasteStream.id, 'success');
                    $scope.changeMiddleSectionTo("partials/administration/wastemanagement/wasteStreams.html");

                }, function (httpResponse) {
                    // On Error
                    $scope.persisting = false;
                    $scope.addAlert('There was an error deleting the waste stream!', 'danger');

                });
            } else {
                $scope.addAlert('Cannot delete waste stream that does not exist!', 'warning');
            }
        };

        $scope.initializeWasteStreamForm = function () {
            if ($scope.form) {
                $scope.form.$setPristine();
            }

            if (ControllerInfoPasser.get('wasteStreamToEdit')) {
                $scope.wasteStream = ControllerInfoPasser.get('wasteStreamToEdit');
                ControllerInfoPasser.clear('wasteStreamToEdit');
                $scope.currentAction = 'Edit';

            } else {
                $scope.wasteStream = ControllerInfoPasser.get('wasteStreamToCreate');
                ControllerInfoPasser.clear('wasteStreamToCreate');
                $scope.currentAction = 'Add';

            }
        };

        $scope.cancelFormInput = function () {
            $scope.initializeWasteStreamForm();
            $scope.clearForm($scope.form);
            $scope.changeMiddleSectionTo("partials/administration/wastemanagement/wasteStreams.html");
        };

        $scope.setStreamSubTypes = function (subTypes) {
            $scope.streamSubTypesList = subTypes;
        };

        $scope.loadSelectedTypeSubTypes = function (type) {
            $http.get(contextPath + '/webapi/waste/management/streams/' + type + '/subtypes').success(function (data, status) {
                $scope.setStreamSubTypes(data);

            }).error(function (status) {
                //console.log(status);
                $scope.addAlert('There was an error loading the stream sub types!', 'danger');
            });
        };

        $scope.setStreamTypes = function (types) {
            $scope.streamTypesList = types;
        };

        $scope.loadStreamTypes = function () {
            $http.get(contextPath + '/webapi/waste/management/streams/types').success(function (data, status) {
                $scope.setStreamTypes(data);

            }).error(function (status) {
                //console.log(status);
                $scope.addAlert('There was an error loading the stream types!', 'danger');
            });
        };
    }])
    .controller('HelpCatalogsAdminCtrl', ['$scope', 'contextPath', 'PropertyLookup', 'HelpService', 'ControllerInfoPasser', function ($scope, contextPath, PropertyLookup, HelpService, ControllerInfoPasser) {
        $scope.helpCatalogsList = [];
        $scope.loadingHelpCatalogsList = false;
        var helpCatalogAdminInputUIPath = "partials/administration/training/helpCatalogAdminInput.html";

        $scope.setHelpCatalogsList = function (list) {
            $scope.helpCatalogsList = list;
        };

        $scope.loadHelpCatalogsList = function () {
            $scope.loadingHelpCatalogsList = true;
            HelpService.query(function (value, responseHeaders) {
                    // Success
                    $scope.loadingHelpCatalogsList = false;
                    $scope.setHelpCatalogsList(value);
                },
                function (httpResponse) {
                    // Error
                    $scope.addAlert('There was an error loading the help catalogs!', 'danger');
                    $scope.loadingHelpCatalogsList = false;
                }
            );
        };

        $scope.createHelpCatalog = function () {
            HelpService.create({}, function (value, responseHeaders) {
                // On Success
                ControllerInfoPasser.put('helpCatalogToCreate', value);
                $scope.changeMiddleSectionTo(helpCatalogAdminInputUIPath);

            }, function (httpResponse) {
                // On Error
                switch (httpResponse.status) {
                    case 501:
                        $scope.addAlert('Creation of new help catalog is not supported by the administration.', 'warning');
                        break;
                    default:
                        $scope.addAlert('There was an error creating the help catalog!', 'danger');
                        break;
                }
            });
        };

        $scope.editHelpCatalog = function (helpCatalog) {
            HelpService.findById({id: helpCatalog.id}, function (value, responseHeaders) {
                // On Success
                ControllerInfoPasser.put('helpCatalogToEdit', value);
                ControllerInfoPasser.broadcast("event:editingHelpCatalog");
                $scope.changeMiddleSectionTo(helpCatalogAdminInputUIPath);

            }, function (httpResponse) {
                // On Error
                $scope.addAlert('There was an problem opening the help catalog...', 'danger');
            });
        };

        $scope.loadHelpCatalogsList();

    }])
    .controller('HelpCatalogAdminInputCtrl', ['$scope', '$http', 'contextPath', 'PropertyLookup', 'HelpService', 'ControllerInfoPasser', '$window', function ($scope, $http, contextPath, PropertyLookup, HelpService, ControllerInfoPasser, $window) {
        var mainHelpCatalogUIPath = "partials/administration/training/helpCatalogsAdmin.html";
        $scope.persisting = false;
        $scope.attachments = [];

        $scope.loadHelpModules = function () {
            $scope.loadDropboxes(['helpModules']);
        };

        $scope.areDataFieldsValid = function () {
            // This function checks if the upload file has been included in the input.
            // If either of these fields do not exist, it means that the upload file is not included.
            if (angular.isUndefined($scope.helpCatalog.fileName)) {
                return false;
            }

            if (angular.isUndefined($scope.helpCatalog.fileType)) {
                return false;
            }

            if (angular.isUndefined($scope.helpCatalog.fileContent)) {
                return false;
            }

            return true;
        };

        $scope.addHelpCatalog = function () {
            if ($scope.form.$valid && angular.isDefined($scope.helpCatalog.icon)) {
                if (angular.isDefined($scope.helpCatalog)) {
                    var dataValid = $scope.areDataFieldsValid();
                    if (dataValid === true) {
                        $scope.persisting = true;
                        HelpService.save({}, $scope.helpCatalog, function (value, responseHeaders) {
                            // On Success
                            $scope.persisting = false;
                            $scope.currentAction = "";
                            $scope.changeMiddleSectionTo(mainHelpCatalogUIPath);

                        }, function (httpResponse) {
                            // On Error
                            switch (httpResponse.status) {
                                case 405:
                                    $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
                                    break;

                                case 417:
                                    $scope.addAlert("Duplicate detected.  A similar help catalog already exists.", 'warning');
                                    break;

                                default:
                                    $scope.addAlert('There was an error adding the new help catalog!', 'danger');
                                    break;
                            }
                            $scope.persisting = false;
                        });
                    } else {
                        $scope.addAlert('Invalid input detected.  The file to upload as the content of the help catalog should be included.', 'warning');
                    }
                }
            } else {
                $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
            }
        };

        $scope.updateHelpCatalog = function () {
            var helpCatalogFileValid = angular.isDefined($scope.helpCatalog.fileName)
                && angular.isDefined($scope.helpCatalog.fileType)
                && angular.isDefined($scope.helpCatalog.fileContent);

            if ($scope.form.$valid && helpCatalogFileValid) {
                if ($scope.helpCatalog) {
                    $scope.persisting = true;
                    HelpService.update({}, $scope.helpCatalog, function (value, responseHeaders) {
                        // On Success
                        $scope.persisting = false;
                        $scope.currentAction = "";
                        $scope.addAlert('Successfully updated help catalog with ID ' + $scope.helpCatalog.id, 'success');
                        $scope.changeMiddleSectionTo(mainHelpCatalogUIPath);

                    }, function (httpResponse) {
                        // On Error
                        switch (httpResponse.status) {
                            case 405:
                                $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
                                break;

                            default:
                                $scope.addAlert('There was an error updating the help catalog!', 'danger');
                                break;
                        }
                        $scope.persisting = false;
                    });
                }

            } else {
                $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
            }
        };

        $scope.$on('event:deleteAdminRecord', function () {
            $scope.deleteHelpCatalog();
        });

        $scope.deleteHelpCatalog = function () {
            if (angular.isDefined($scope.helpCatalog.id)) {
                $scope.persisting = true;
                HelpService.delete({id: $scope.helpCatalog.id}, function (value, responseHeaders) {
                    // On Success
                    $scope.persisting = false;
                    $scope.currentAction = "";
                    $scope.addAlert('Successfully deleted help catalog with ID ' + $scope.helpCatalog.id, 'success');
                    $scope.changeMiddleSectionTo(mainHelpCatalogUIPath);

                }, function (httpResponse) {
                    // On Error
                    $scope.persisting = false;
                    $scope.addAlert('There was an error deleting the help catalog!', 'danger');

                });
            } else {
                $scope.addAlert('Cannot delete help catalog that does not exist!', 'warning');
            }
        };

        $scope.initializeHelpCatalogForm = function () {
            if (angular.isDefined($scope.form)) {
                $scope.form.$setPristine();
            }

            if (angular.isDefined(ControllerInfoPasser.get('helpCatalogToEdit'))) {
                $scope.helpCatalog = ControllerInfoPasser.get('helpCatalogToEdit');

                var attachment = {};
                attachment['fileName'] = $scope.helpCatalog.fileName;
                attachment['mimeType'] = $scope.helpCatalog.fileType;
                attachment['data'] = $scope.helpCatalog.fileContent;
                $scope.attachments.push(attachment);

                ControllerInfoPasser.clear('helpCatalogToEdit');
                $scope.currentAction = 'Edit';

            } else {
                $scope.helpCatalog = ControllerInfoPasser.get('helpCatalogToCreate');
                ControllerInfoPasser.clear('helpCatalogToCreate');
                $scope.currentAction = 'Add';

            }
        };

        $scope.cancelFormInput = function () {
            $scope.initializeHelpCatalogForm();
            $scope.clearForm($scope.form);
            $scope.changeMiddleSectionTo(mainHelpCatalogUIPath);
        };


        var isFileTypeAllowed = function (fileType) {
            var allowed = false;

            switch (fileType) {
                case $scope.allowedFileTypeEnums.DOC:
                case $scope.allowedFileTypeEnums.DOCX:
                case $scope.allowedFileTypeEnums.PDF:
                case $scope.allowedFileTypeEnums.MP4:
                case $scope.allowedFileTypeEnums.VIDEO_MP4:
                    allowed = true;
                    break;
                default:
                    allowed = false;
                    break;
            }

            return allowed;
        };

        $scope.$on('event:localAttachmentOpen', function (event, attachment) {
            if (angular.isDefined($scope.helpCatalog.id)) {
                var url = contextPath + '/webapi/help/' + $scope.helpCatalog.id + '/file';
                $scope.openInNewWindow('GET', url);
            }
        });

        $scope.extractAttachmentInformation = function(attachments) {
            if (angular.isDefined(attachments)) {
                var attachment = attachments[0];
                if (angular.isDefined(attachment)) {
                    if (isFileTypeAllowed(attachment.mimeType)) {
                        $scope.helpCatalog.fileName = attachment.fileName;
                        $scope.helpCatalog.fileType = attachment.mimeType;
                        $scope.helpCatalog.fileContent = attachment.data;
                    } else {
                        $scope.addAlert('Cannot upload: the file you selected is not supported.', 'warning');
                    }
                }
            }

        };

        $scope.removeAttachmentInformation = function() {
            $scope.helpCatalog.fileName = undefined;
            $scope.helpCatalog.fileType = undefined;
            $scope.helpCatalog.fileContent = undefined;
        };

        $scope.$on('event:helpFileUploadRejected', function (event, message) {
            $scope.addAlert(message, 'warning');
        });

        $scope.loadHelpModules();
        $scope.initializeHelpCatalogForm();
        $scope.clearForm($scope.form);
    }])
    .controller('ActiveDirectorySettingsCtrl', ['$scope', 'SysConfigService', function ($scope, SysConfigService) {

        $scope.activeDirectory = {};

        $scope.saving = true;
        SysConfigService.getMultipleKeys({}, ["DOMAIN_NAME", "LDAP_URL_ADDRESS", "LDAP_ROOT_CONTEXT"], function (data) {
            $scope.activeDirectory = angular.copy(data);
            $scope.saving = false;
        }, function () {
            $scope.saving = false;
        });

        $scope.saveActiveDirectorySettings = function () {
            $scope.saving = true;
            SysConfigService.setMultipleKeys({}, $scope.activeDirectory, function () {
                // Success
                $scope.saving = false;
                $scope.addAlert("Successfully saved active directory settings", "success", 5000);
            }, function () {
                // Error
                $scope.saving = false;
                $scope.addAlert("An error has occurred saving active directory settings!", "danger", 5000);
            });
        };

    }])
    .controller('PropertyGroupsCtrl', ['$scope', '$filter', 'PropertyGroupService', 'PropertyLookup', 'contextPath', function ($scope, $filter, PropertyGroupService, PropertyLookup, contextPath) {
        $scope.currentProperties = [];
        $scope.filteredProperties = [];

        $scope.propertyGroups = [];
        $scope.selectedPropertyGroup = {};
        $scope.selectedPropertyNumbers = [];

        $scope.currentPage = 0;
        $scope.itemsPerPage = 10;

        $scope.loadingPropertyGroups = false;

        $scope.propertyFilterText = "";
        $scope.loadingFilteredProperties = true;

        $scope.newGroupAction = "";

        $scope.loadProperties = function () {
            PropertyLookup.query({}, function (data) {
                $scope.currentProperties = angular.copy(data);
                $scope.filteredProperties = angular.copy(data);
                $scope.loadingFilteredProperties = false;
            });
        };

        $scope.loadPropertyGroups = function () {
            $scope.loadingPropertyGroups = true;
            PropertyGroupService.query({}, function (data) {
                $scope.loadingPropertyGroups = false;
                $scope.propertyGroups = data;
            }, function () {
                $scope.loadingPropertyGroups = false;
                $scope.addAlert('An error has occurred loading the property groups!', 'danger', 10000);
            });
        };

        $scope.addPropertyGroup = function () {
            $scope.selectedPropertyGroup = {};
            $scope.clearSelectedPropertyNumbers();
            $scope.newGroupAction = "Add"
        };

        $scope.copyPropertyGroup = function () {
            $scope.newGroupAction = "Copy"
        };

        $scope.clearSelectedPropertyNumbers = function () {
            if (angular.isDefined($scope.selectedPropertyNumbers)) {
                $scope.selectedPropertyNumbers.length = 0;
            }
        };

        $scope.resetSelectedPropertyNumbers = function () {
            $scope.clearSelectedPropertyNumbers();
            if (angular.isDefined($scope.selectedPropertyGroup)) {
                $scope.selectedPropertyGroup.properties.map(function (p) {
                    $scope.selectedPropertyNumbers.push(p.propertyNumber);
                });
            }
        };

        $scope.selectGroup = function (group) {

            if (angular.isDefined(group)) {
                $scope.selectedPropertyGroup = angular.copy(group);
                $scope.clearSelectedPropertyNumbers();

                PropertyGroupService.getProperties({id: $scope.selectedPropertyGroup.id}, function (data) {
                    $scope.selectedPropertyGroup.properties = angular.copy(data);
                    $scope.selectedPropertyGroup.properties.map(function (p) {
                        $scope.selectedPropertyNumbers.push(p.propertyNumber);
                    });

                }, function (ignoreHttpResponse) {
                    $scope.displayMessageInElement("#updateProblemText", "An error has occurred retrieving the list of properties for selected group!", 10000);
                });
            } else {
                $scope.selectedPropertyGroup = {};
            }

        };

        $scope.savePropertyGroup = function () {
            $scope.saving = true;
            PropertyGroupService.save({}, $scope.selectedPropertyGroup, function (data) {
                $scope.saving = false;
                $scope.selectedPropertyGroup = data;
                $('#newGroupModal').modal('hide');
                $scope.loadPropertyGroups();
            }, function (httpResponse) {
                $scope.saving = false;

                switch (httpResponse.status) {
                    case 405:
                        $scope.displayMessageInElement('#addProblemText', 'A property group with the name \'' + $scope.selectedPropertyGroup.groupName + '\' already exists. Please choose a different name', 10000);
                        break;
                    default:
                        $scope.displayMessageInElement('#addProblemText', 'An error has occurred creating the property group!', 10000);
                }
            });
        };

        var expandPropertyNumbers = function () {
            $scope.selectedPropertyGroup.properties = $scope.filteredProperties.filter(function (p) {
                return $scope.selectedPropertyNumbers.indexOf(p.propertyNumber) > -1;
            });
        };

        $scope.updatePropertyGroup = function () {
            $scope.saving = true;
            expandPropertyNumbers();
            PropertyGroupService.update({}, $scope.selectedPropertyGroup, function () {
                $scope.saving = false;
                $scope.loadPropertyGroups();
                $('#addPropertiesModal').modal('hide');
            }, function () {
                $scope.saving = false;
                $scope.displayMessageInElement('#updateProblemText', 'An error has occurred updating the property group!', 10000);
            });
        };

        $scope.deletePropertyGroup = function () {
            $scope.saving = true;
            PropertyGroupService.delete({id: $scope.selectedPropertyGroup.id}, function () {
                $scope.saving = false;
                $scope.selectGroup();
                $scope.loadPropertyGroups();
            }, function () {
                $scope.saving = false;
                $scope.displayMessageInElement('#deleteProblemText', 'An error has occurred deleting the property group!', 10000);
            });
        };

        $scope.filterPropertyList = function () {
            $scope.filteredProperties = $filter('filterBy')($scope.properties, ['propertyNumber', 'name'], $scope.propertyFilterText);
        };

        $scope.exportPropertyGroups = function () {
            $scope.openInNewWindow('GET', $scope.getContextPath() + '/webapi/propertygroups/report');
        };

        $scope.loadProperties();
        $scope.loadPropertyGroups();

    }])
    .controller('SupportContactCtrl', ['$scope', '$http', 'SysConfigService', 'contextPath', function ($scope, $http, SysConfigService, contextPath) {
        var supportKey = 'SUPPORT_CONTACT_INFO';
        $scope.supportContactText = '';

        $scope.getSupportText = function () {
            $http.get(contextPath + '/webapi/systemconfig/' + supportKey).success(function (data, status, headers, config) {
                $scope.supportContactText = angular.copy(data);
            }).error(function () {
                $scope.addAlert('An error has occurred getting the support text!', 'danger', 10000);
            });
        };

        $scope.saveSupportText = function () {
            SysConfigService.save({key: supportKey}, $scope.supportContactText, function () {
                $scope.addAlert('Successfully saved the support text', 'success', 5000);
            }, function () {
                $scope.addAlert('An error has occurred saving the support text!', 'danger', 5000);
            });
        };

        $scope.getSupportText();

    }])
    .controller('InsuranceRolesAssignmentCtrl', ['$scope', 'RoleService', function ($scope, RoleService) {

        $scope.loadRoles = function () {
            RoleService.query({}, function (data) {
                $scope.roles = data;
            }, function () {
                $scope.addAlert('An error has occurred loading the roles!', 'danger', 10000);
            });
        };

        $scope.selectForInsurance = function (role) {
            RoleService.selectForInsurance({roleId: role.id}, null, function (data, responseHeaders) {
                role.isSelectedForInsurance = data.isSelectedForInsurance;
            }, function (httpResponse) {
                $scope.addAlert('There was an error selecting/deselecting the Role!', 'danger');
            });
        };

        $scope.loadRoles();

    }])
    .controller('PortfolioManagerAdminCtrl', ['$scope', 'PortfolioManagerAccountsService', 'PortfolioManagerService', 'PropertyLookup', '$q', function ($scope, PortfolioManagerAccountsService, PortfolioManagerService, PropertyLookup, $q) {

        $scope.accounts = [];
        $scope.selectedAccount = {};
        $scope.inputting = false;
        $scope.details = false;
        $scope.pmProperties = [];
        $scope.riskProperties = [];

        $scope.modalListPage = 0;
        $scope.modalListPageSize = 10;

        $scope.pendingShareList = [];
        $scope.shareAction = {
            ACCEPT: 'Accept',
            REJECT: 'Reject'
        };

        $scope.shareView = false;

        $scope.possibleMappings = [];
        $scope.dataMappingSelections = {};

        PropertyLookup.findAllAsDTO({}, function (data) {
            $scope.riskProperties = angular.copy(data);
        }, function () {
            $scope.addAlert('An error has occurred retrieving the system properties!', 'danger', 10000);
        });


        $scope.addAccount = function () {
            $scope.inputting = true;
            var indexProduction = 0;
            $scope.selectedAccount.environmentUrl = $scope.dropboxes['energyStarEnvironment'].itemMap[indexProduction].value;
        };

        $scope.getLabel = function (environmentUrl) {
            for (var i = 0; i < $scope.dropboxes['energyStarEnvironment'].itemMap.length; i++) {
                if ($scope.dropboxes['energyStarEnvironment'].itemMap[i].value === environmentUrl) {
                    return $scope.dropboxes['energyStarEnvironment'].itemMap[i].key;
                }
            }
        };

        $scope.findAll = function () {
            $scope.accounts.length = 0;
            $scope.loading = true;
            PortfolioManagerAccountsService.query({}, function (data) {
                $scope.loading = false;
                $scope.accounts = angular.copy(data);
            }, function (httpResponse) {
                $scope.addAlert('An error has occurred getting the Portfolio Manager accounts!', 'danger', 10000);
            });

        };

        $scope.addPortfolioManagerAccount = function () {
            $scope.loading = true;
            PortfolioManagerAccountsService.save({}, $scope.selectedAccount, function () {
                $scope.loading = false;
                $scope.addAlert("Successfully saved the new Portfolio Manager account", 'success', 10000);
                $scope.closeAccount();
            }, function (httpResponse) {
                $scope.loading = false;
                switch (httpResponse.status) {
                    case 401:
                        $scope.addAlert("The account name and password provided was not authorized on Portfolio Manager!", 'warning', 10000);
                        break;
                    case 405:
                        $scope.addAlert("An account named " + $scope.selectedAccount.accountName + " is already registered with the system", 'warning', 10000);
                        break;
                    default:
                        $scope.addAlert("An error has occurred adding the Portfolio Manager Account!", 'danger', 10000);
                }
            });
        };

        $scope.updatePortfolioManagerAccount = function () {
            $scope.loading = true;
            PortfolioManagerAccountsService.update({}, $scope.selectedAccount, function () {
                $scope.loading = false;
                $scope.addAlert("Successfully saved the Portfolio Manager account", 'success', 10000);
                $scope.closeAccount();
            }, function (httpResponse) {
                $scope.addAlert("An error has occurred updating the Portfolio Manager Account!", 'danger', 10000);
            });
        };

        $scope.savePortfolioManagerAccount = function () {
            if (angular.isDefined($scope.selectedAccount.id)) {
                $scope.updatePortfolioManagerAccount();
            } else {
                $scope.addPortfolioManagerAccount();
            }

        };

        $scope.deletePortfolioManagerAccount = function () {
            $scope.loading = true;
            PortfolioManagerAccountsService.delete({id: $scope.selectedAccount.id}, function () {
                $scope.loading = false;
                $('#deleteAccountModal').modal('hide');
                $scope.addAlert("Successfully deleted the Portfolio Manager account", 'success', 10000);
                $scope.closeAccount();
            }, function (httpResponse) {
                $scope.displayMessageInElement("#errormsg", "An error has occurred deleting the Portfolio Manager Account!", 10000);
            });
        };

        $scope.openAccount = function (account) {
            $scope.selectedAccount = account;
            $scope.inputting = true
        };

        $scope.closeAccount = function () {
            $scope.selectedAccount = {};
            $scope.inputting = false;
            $scope.details = false;
            $scope.findAll();
        };
        $scope.setToDelete = function (account) {
            $scope.selectedAccount = account;
        };

        $scope.launchImportModal = function (account, property) {
            if (angular.isUndefined(property.riskPropertyNumber)) {
                $scope.propertyToImport = property;
                $scope.importForm.$setPristine();
                $scope.importPropertyNumber = undefined;
                $("#importPropertyModal").modal('show');
            }
        };

        $scope.importProperty = function () {
            $scope.modalLoading = true;

            PortfolioManagerService.importProperty({
                accountId: $scope.selectedAccount.accountId,
                pmPropertyId: $scope.propertyToImport.id,
                riskPropertyNumber: $scope.importPropertyNumber
            }, $scope.dataMappingSelections, function () {
                $scope.modalLoading = false;
                $("#importPropertyModal").modal('hide');
                $('#importErrorModal').modal('hide');

                $scope.addAlert("Successfully imported the Portfolio Manager property as property number " + $scope.importPropertyNumber, 'success', 10000);
                $scope.propertyToImport = undefined;
                $scope.importPropertyNumber = undefined;
                $scope.dataMappingSelections = {};
                $scope.findPropertiesForSelectedAccount();
            }, function (httpResponse) {
                $scope.modalLoading = false;

                switch (httpResponse.status) {
                    case 400:
                        $scope.displayMessageInElement("#importerrormsg", httpResponse.data.error, 10000);
                        break;
                    case 449:
                        $("#importPropertyModal").modal('hide');
                        $scope.dataMappingSelections = angular.copy(httpResponse.data.dataMappingUISelections);
                        $scope.possibleMappings = angular.copy(httpResponse.data.mappings);
                        $('#importErrorModal').modal('show');
                        break;
                    default:
                        $scope.displayMessageInElement("#importerrormsg", "An error has occurred importing the Portfolio Manager property!", 10000);
                }
            })
        };

        $scope.findPropertiesForSelectedAccount = function () {
            $scope.loading = true;

            $scope.pmProperties.length = 0;
            return PortfolioManagerService.getPropertiesForAccount({
                accountId: $scope.selectedAccount.accountId,
                includeRiskPropertyLinks: true
            }, function (data) {
                $scope.pmProperties = angular.copy(data);
                $scope.loading = false;
            }, function (httpResponse) {
                $scope.loading = false;
                $scope.addAlert('An error has occurred retrieving the properties associated with the account ' + $scope.selectedAccount.accountName, 'danger', 10000);
            }).$promise;
        };

        $scope.openAccountDetails = function (account) {
            $scope.selectedAccount = account;
            $scope.details = true;
            $scope.loading = true;
            $q.all([
                $scope.findPropertiesForSelectedAccount(),
                $scope.getPendingShareList()
            ]).then(function () {
                $scope.loading = false;
            }, function () {
                $scope.loading = false;
            });
        };

        $scope.linkPropertyWithPm = function () {
            $scope.modalLoading = true;
            PortfolioManagerService.linkProperty({
                riskPropertyNumber: $scope.riskPropertyToLink.propertyNumber,
                pmAccountId: $scope.selectedAccount.accountId,
                pmPropertyNumber: $scope.propertyToLinkOrUnlink.id
            }, {}, function () {
                $scope.modalLoading = false;
                $('#confirmLinkPropertyModal').modal('hide');
                $scope.propertyToLinkOrUnlink = undefined;
                $scope.riskPropertyToLink = undefined;
                $scope.findPropertiesForSelectedAccount();
            }, function () {
                $scope.modalLoading = false;
                $scope.displayMessageInElement('#linkError', 'An error has occurred linking the property from the system!', 10000);
            });
        };

        $scope.unlinkPropertyWithPm = function () {
            $scope.modalLoading = true;
            PortfolioManagerService.unlinkProperty({
                riskPropertyNumber: $scope.propertyToLinkOrUnlink.riskPropertyNumber
            }, {}, function (data) {
                $scope.modalLoading = false;
                $('#unlinkPropertyModal').modal('hide');
                $scope.propertyToLinkOrUnlink = undefined;
                $scope.findPropertiesForSelectedAccount();
            }, function () {
                $scope.modalLoading = false;
                $scope.displayMessageInElement('#unlinkError', 'An error has occurred unlinking the property from the system!', 10000);
            });
        };

        $scope.launchLinkModal = function (property) {
            $scope.resetModalPagination();
            if (angular.isUndefined(property.riskPropertyNumber)) {
                $scope.propertyToLinkOrUnlink = property;
                $('#linkPropertyModal').modal('show');
            }
        };

        $scope.confirmLink = function (riskProperty) {
            $scope.riskPropertyToLink = riskProperty;
            $('#linkPropertyModal').modal('hide');
            $('#confirmLinkPropertyModal').modal('show');
        };

        $scope.confirmLinkCancel = function () {
            $scope.riskPropertyToLink = undefined;
            $('#confirmLinkPropertyModal').modal('hide');
            $('#linkPropertyModal').modal('show');
        };


        $scope.launchUnLinkModal = function (property) {
            if (angular.isDefined(property.riskPropertyNumber)) {
                $scope.propertyToLinkOrUnlink = property;
                $('#unlinkPropertyModal').modal('show');
            }
        };

        $scope.getPendingShareList = function () {
            $scope.pendingShareList.length = 0;
            return PortfolioManagerService.getPendingPropertyShares({accountId: $scope.selectedAccount.accountId}, function (data) {
                $scope.pendingShareList = angular.copy(data);
            }, function () {
                $scope.addAlert("An error has occurred getting the pending property shares for the account " + $scope.selectedAccount.accoutName, 'danger', 10000);
            }).$promise;
        };

        $scope.acceptOrRejectProperty = function (propertyId, action) {
            $scope.modalLoading = true;
            PortfolioManagerService.acceptOrRejectShareForProperty({
                accountId: $scope.selectedAccount.accountId,
                propertyId: propertyId,
                action: action
            }, {}, function () {
                $scope.modalLoading = false;
                $scope.displayMessageInElement('.shareInfo', 'Successfully ' + action.toLowerCase() + 'ed share request', 10000);
                $scope.pendingShareList = $scope.pendingShareList.filter(function (item) {
                    return item.propertyId !== propertyId;
                });
            }, function () {
                $scope.modalLoading = false;
                $scope.displayMessageInElement('.shareError', 'An error has occurred ' + action.toLowerCase() + 'ing the share request!', 10000);
            });
        };

        $scope.acceptOrRejectAllPropertyShares = function (action) {
            $scope.modalLoading = true;

            var propertyIds = $scope.pendingShareList.map(function (item) {
                return item.propertyId;
            });

            PortfolioManagerService.acceptOrRejectShareForAllProperties({
                accountId: $scope.selectedAccount.accountId,
                action: action
            }, propertyIds, function () {
                $scope.modalLoading = false;
                $('#allActionConfirmation').modal('hide');
                $scope.addAlert('Successfully ' + action.toLowerCase() + 'ed all share requests for ' + $scope.selectedAccount.accountName, 10000);
                $scope.findPropertiesForSelectedAccount();
            }, function () {
                $scope.modalLoading = false;
                $scope.displayMessageInElement('.shareInfo', 'An error has occurred ' + action.toLowerCase() + 'ing all the share requests for ' + $scope.selectedAccount.accountName + '!', 10000);
            });
        };

        $scope.confirmAllAction = function (action) {
            $scope.selectedAction = action;
            $('#pendingSharesModal').modal('hide');
            $('#allActionConfirmation').modal('show');
        };

        $scope.cancelAllAction = function () {
            $('#allActionConfirmation').modal('hide');
            $('#pendingSharesModal').modal('show');
            $scope.selectedAction = undefined;
        };

        $scope.resetModalPagination = function () {
            $scope.modalListPage = 0;
        };

        $scope.viewPendingShareList = function () {
            $scope.shareView = true;
        };

        $scope.cancelAction = function () {
            if ($scope.shareView) {
                $scope.shareView = false;
            } else {
                $scope.closeAccount();
            }
        };

        $scope.uncheckOtherMappings = function (index) {
            for (var i = 0; i < $scope.possibleMappings.length; i++) {
                if (i !== index) {
                    $scope.possibleMappings[i].isDefaultMappedValue = false;
                }
            }
        };

        $scope.addToDataMappingSelections = function (mapping) {
            $scope.dataMappingSelections[mapping.fieldName] = mapping;

            $scope.importProperty();
        };

        $scope.loadDropboxes(['energyStarEnvironment'], $scope.findAll);
    }])
    .controller('WeatherStationCtrl', ['$scope', 'contextPath', 'WeatherStationService', '$uibModal','Upload', 'ControllerInfoPasser', function ($scope, contextPath, WeatherStationService, $modal, Upload, ControllerInfoPasser) {

        $scope.weatherStationInputPartial = "partials/administration/weather/weatherStationInput.html";
        $scope.weatherDataPartial = "partials/administration/weather/weatherData.html";
        $scope.weatherStaionList = [];
        $scope.persisting = false;
        $scope.loadingStationList = false;
        $scope.currentAction = "";
        $scope.stationOrder = ['stationName', 'stationNumber', 'transportationCanadaID', 'worldMeteorologicalID'];
        $scope.isLoaded = false;

        $scope.loadWeatherStationsList = function () {
            $scope.loadingStationList = true;
            WeatherStationService.query({}, function (value, responseHeaders) {
                $scope.weatherStaionList = value;
                $scope.isLoaded = true;
            }, function (httpResponse) {
                // On Error
                switch (httpResponse.status) {
                    case 404:
                        $scope.addAlert('There are no weather stations to load!', 'warning');
                        break;
                    default:
                        $scope.addAlert('There was an error loading the weather stations!', 'danger');
                }
            });
            $scope.loadingStationList = false;
        };

        $scope.createWeatherStation = function () {
            WeatherStationService.create({}, function (value, responseHeaders) {
                // On Success
                ControllerInfoPasser.put('weatherStationToCreate', value);
                $scope.changeMiddleSectionTo($scope.weatherStationInputPartial);

            }, function (httpResponse) {
                // On Error
                switch (httpResponse.status) {
                    case 501:
                        $scope.addAlert('Creation of new weather station is not supported by the administration.', 'warning');
                        break;
                    default:
                        $scope.addAlert('There was an error adding the record!', 'danger');
                        break;
                }
            });
        };

        $scope.editWeatherStation = function (station) {
            ControllerInfoPasser.put('weatherStationToEdit', station);
            ControllerInfoPasser.broadcast("event:editingWeatherStation");
            $scope.changeMiddleSectionTo($scope.weatherStationInputPartial);
        };

        $scope.viewWeatherData = function (station) {
            ControllerInfoPasser.put('weatherStationToView', station);
            ControllerInfoPasser.broadcast("event:viewWeatherData");
            $scope.changeMiddleSectionTo($scope.weatherDataPartial);
        };

        $scope.importWeatherStation = function ($files) {
            if ($files.length == 0) {
                return;
            }

            $scope.loadingStation = true;
            for (var i = 0; i < $files.length; i++) {
                Upload.upload({
                    url: contextPath + '/webapi/sustainability/weather/station/fromfile',
                    method: 'POST',
                    file: $files[i]
                }).progress(function (evt) {
                    ////console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    $scope.loadingStation = false;
                    $scope.addAlert('Successfully imported weather station(s).', 'success', 10000);
                    $scope.loadWeatherStationsList();
                }).error(function (data, status, headers, config) {
                    $scope.loadingStation = false;

                    var msg = "";
                    if (angular.isDefined(data.error)) {
                        msg = data.error;
                    }

                    switch (status) {
                        case 405:
                            $scope.addAlert('Cannot import weather station: ' + msg,'danger',10000);
                            //$scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
                            break;
                        case 406:
                            $scope.addAlert('The XML file uploaded is invalid. Please check the file and try again', 'warning', 10000);
                            break;
                        case 417:
                            $scope.addAlert("Duplicate detected.  There's already a weather station with these credentials.", 'warning');
                            break;
                        default:
                            $scope.addAlert('An error has occurred while trying to import the weather data!', 'danger', 10000);
                            break;
                    }

                });
            }
        };

        $scope.initialize = function () {
            $scope.getSystemConfigKey('AUTOMATIC_WEATHER_DATA_UPDATE_ENABLED', function (response) {
                $scope.weatherDataImportEnabled = response.data === 'true';
            }, function () {
                $scope.weatherDataImportEnabled = false;
            });

            $scope.loadWeatherStationsList()
        };

        $scope.initialize();
}])
    .controller('WeatherStationInputCtrl', ['$scope', 'contextPath', 'WeatherStationService', '$uibModal', 'Upload', 'ControllerInfoPasser', function ($scope, contextPath, WeatherStationService, $modal, Upload, ControllerInfoPasser) {

        $scope.weatherStationPartial = "partials/administration/weather/weatherStations.html";
        $scope.persisting = false;

        $scope.initializeWeatherStationForm = function () {
            if (angular.isDefined($scope.form)) {
                $scope.form.$setPristine();
            }

            if (ControllerInfoPasser.get('weatherStationToEdit')) {
                $scope.weatherStation = ControllerInfoPasser.get('weatherStationToEdit');
                ControllerInfoPasser.clear('weatherStationToEdit');
                $scope.currentAction = 'Edit';
                $scope.editing = true;

            } else {
                $scope.weatherStation = ControllerInfoPasser.get('weatherStationToCreate');
                ControllerInfoPasser.clear('weatherStationToCreate');
                $scope.currentAction = 'Add';
                $scope.editing = false;

            }
        };

        $scope.addWeatherStation = function () {
            if ($scope.form.$valid) {
                if (angular.isDefined($scope.weatherStation)) {
                    $scope.persisting = true;
                    WeatherStationService.add({}, $scope.weatherStation, function (value, responseHeaders) {
                        // On Success
                        $scope.persisting = false;
                        $scope.currentAction = "";
                        $scope.addAlert('Successfully added weather station: ' + $scope.weatherStation.stationName, 'success');
                        $scope.changeMiddleSectionTo($scope.weatherStationPartial);

                    }, function (httpResponse) {
                        // On Error
                        switch (httpResponse.status) {
                            case 405:
                                $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
                                break;

                            case 417:
                                $scope.addAlert("Duplicate detected.  There's already an existing weather station for the same location, please enter a different one.", 'warning');
                                break;

                            default:
                                $scope.addAlert('There was an error adding the new weather station!', 'danger');
                                break;
                        }
                        $scope.persisting = false;
                    });
                }
            } else {
                $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
            }
        };

        $scope.updateWeatherStation = function () {
            if ($scope.form.$valid) {
                if (angular.isDefined($scope.weatherStation)) {
                    $scope.persisting = true;
                    WeatherStationService.update({}, $scope.weatherStation, function (value, responseHeaders) {
                        // On Success
                        $scope.persisting = false;
                        $scope.currentAction = "";
                        $scope.addAlert('Successfully updated weather station: ' + $scope.weatherStation.stationName, 'success');
                        $scope.changeMiddleSectionTo($scope.weatherStationPartial);

                    }, function (httpResponse) {
                        // On Error
                        switch (httpResponse.status) {
                            case 405:
                                $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
                                break;
                            case 417:
                                $scope.addAlert("Duplicate detected.  There's already a weather station with these credentials.", 'warning');
                                break;
                            default:
                                $scope.addAlert('There was an error updating the weather station!', 'danger');
                                break;
                        }
                        $scope.persisting = false;
                    });
                }

            } else {
                $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
            }
        };

        $scope.deleteWeatherStation = function () {
            if (angular.isDefined($scope.weatherStation.id)) {
                $scope.persisting = true;
                WeatherStationService.delete({id: $scope.weatherStation.id}, function (value, responseHeaders) {
                    // On Success
                    $scope.persisting = false;
                    $scope.currentAction = "";
                    $scope.addAlert('Successfully deleted weather station with ID ' + $scope.weatherStation.id, 'success');
                    $scope.changeMiddleSectionTo($scope.weatherStationPartial);

                }, function (httpResponse) {
                    // On Error
                    $scope.persisting = false;
                    $scope.addAlert('There was an error deleting the weather station!', 'danger');

                });
            } else {
                $scope.addAlert('Cannot delete weather station that does not exist!', 'warning');
            }
        };

        $scope.cancelFormInput = function () {
            $scope.initializeWeatherStationForm();
            $scope.changeMiddleSectionTo($scope.weatherStationPartial);
        };

        $scope.importWeatherData = function ($files) {
            if ($files.length == 0) {
                return;
            }

            $scope.loading = true;
            for (var i = 0; i < $files.length; i++) {
                Upload.upload({
                    url: contextPath + '/webapi/sustainability/weather/station/' + $scope.weatherStation.id + '/weatherdata',
                    method: 'POST',
                    file: $files[i]
                }).progress(function (evt) {
                    ////console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    $scope.loading = false;
                    $scope.addAlert('Successfully imported weather data for station: ' + $scope.weatherStation.stationName, 'success', 10000);
                }).error(function (data, status, headers, config) {
                    $scope.loading = false;

                    var msg = "";
                    if (angular.isDefined(data.error)) {
                        msg = data.error;
                    }
                    switch (status) {
                        case 405:
                            $scope.addAlert('Cannot import weather data: '+ msg,'danger',10000);
                            break;
                        case 406:
                            $scope.addAlert('The XML file uploaded is invalid. Please check the file and try again', 'warning', 10000);
                            break;
                        default:
                            $scope.addAlert('An error has occurred while trying to import the weather data!', 'danger', 10000);
                            break;
                    }

                });
            }
        };

        $scope.initializeWeatherStationForm();
        $scope.clearAllAlertsInPage();

    }])
    .controller('WeatherDataCtrl', ['$scope', 'contextPath', 'WeatherDataService', '$uibModal', 'Upload', 'ControllerInfoPasser', function ($scope, contextPath, WeatherDataService, $modal, Upload, ControllerInfoPasser) {

        $scope.weatherStationPartial = "partials/administration/weather/weatherStations.html";
        $scope.weatherDataList = [];
        $scope.persisting = false;
        $scope.isDataLoaded = false;
        $scope.currentPage = 0;
        $scope.pageSize = 15;

        $scope.initializeDataView = function () {
            if (ControllerInfoPasser.get('weatherStationToView')) {
                $scope.weatherStation = ControllerInfoPasser.get('weatherStationToView');
                ControllerInfoPasser.clear('weatherStationToView');
                $scope.currentAction = 'View';
            }

            $scope.getSystemConfigKey('AUTOMATIC_WEATHER_DATA_UPDATE_ENABLED', function (response) {
                $scope.weatherDataImportEnabled = response.data === 'true';
            }, function () {
                $scope.weatherDataImportEnabled = false;
            });
        };

        $scope.cancelView = function () {
            $scope.changeMiddleSectionTo($scope.weatherStationPartial);
        };


        $scope.loadWeatherDataList = function () {
            $scope.isDataLoaded = false;
            $scope.loadingDataList = true;
            WeatherDataService.findByStation({stationId: $scope.weatherStation.id}, function (value, responseHeaders) {
                $scope.weatherDataList = value;
                $scope.isDataLoaded = true;
            }, function (httpResponse) {
                // On Error
                switch (httpResponse.status) {
                    case 404:
                        $scope.addAlert('There is no weather data for this station!', 'warning');
                        break;
                    default:
                        $scope.addAlert('There was an error loading the weather data!', 'danger');
                }
                $scope.isDataLoaded = false;
            });
            $scope.loadingDataList = false;
        };

        $scope.importDataFromXml = function ($files) {
            if ($files.length == 0) {
                return;
            }

            $scope.loading = true;
            for (var i = 0; i < $files.length; i++) {
                Upload.upload({
                    url: contextPath + '/webapi/sustainability/weather/station/' + $scope.weatherStation.id + '/weatherdata',
                    method: 'POST',
                    file: $files[i]
                }).progress(function (evt) {
                    ////console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    $scope.loading = false;
                    $scope.addAlert('Successfully imported weather data for station: ' + $scope.weatherStation.stationName, 'success', 10000);
                    $scope.loadWeatherDataList();
                }).error(function (data, status, headers, config) {
                    $scope.loading = false;

                    var msg = "";
                    if (angular.isDefined(data.error)) {
                        msg = data.error;
                    }
                    switch (status) {
                        case 405:
                            $scope.addAlert('Cannot import weather data: '+ msg,'danger',10000);
                            break;
                        case 406:
                            $scope.addAlert('The XML file uploaded is invalid. Please check the file and try again', 'warning', 10000);
                            break;
                        default:
                            $scope.addAlert('An error has occurred while trying to import the weather data!', 'danger', 10000);
                            break;
                    }

                });
            }
        };

        $scope.initializeDataView();
        $scope.loadWeatherDataList();


    }])
    .controller('BatchProcessCtrl', ['$scope', 'contextPath', 'BatchProcessService', '$uibModal', 'Upload', 'ControllerInfoPasser', function ($scope, contextPath, BatchProcessService, $modal, Upload, ControllerInfoPasser) {

        $scope.batchPartial = "partials/administration/batchprocess/batchProcess.html";
        $scope.batchInputPartial = "partials/administration/batchprocess/batchProcessInput.html";
        $scope.batchLogPartial = "partials/administration/batchprocess/batchProcessLog.html";
        $scope.batchProcessList = [];
        $scope.batchOrder = ['processName', 'description'];
        $scope.persisting = false;
        $scope.loadingBatches = false;
        $scope.isLoaded = false;

        $scope.selectedProcessToRun = undefined;
        var confirmRunModal = '#confirmRunModal';

        $scope.loadBatchList= function () {
            $scope.loadingBatches = true;
            $scope.batchProcessList.length = 0;
            BatchProcessService.query({}, function (value, responseHeaders) {
                    $scope.batchProcessList = value;
                    $scope.isLoaded = true;
                }, function (httpResponse) {
                    // On Error
                    switch (httpResponse.status) {
                        case 404:
                            $scope.addAlert('There are no batch processes to load!', 'warning');
                            break;
                        default:
                            $scope.addAlert('There was an error loading the batch processes!', 'danger');
                    }
                });
            $scope.loadingBatches = false;
        };


        $scope.createBatch = function () {
            BatchProcessService.create({}, function (value, responseHeaders) {
                // On Success
                ControllerInfoPasser.put('batchToCreate', value);
                $scope.changeMiddleSectionTo($scope.batchInputPartial);

            }, function (httpResponse) {
                // On Error
                switch (httpResponse.status) {
                    case 501:
                        $scope.addAlert('Creation of new batch process is not supported by the administration.', 'warning');
                        break;
                    default:
                        $scope.addAlert('There was an error adding the record!', 'danger');
                        break;
                }
            });
        };

        $scope.editBatch = function (batch) {
            ControllerInfoPasser.put('batchToEdit', batch);
            ControllerInfoPasser.broadcast("event:editingBatch");
            $scope.changeMiddleSectionTo($scope.batchInputPartial);
        };

        $scope.viewBatch = function (batch) {
            ControllerInfoPasser.put('batchToView', batch);
            ControllerInfoPasser.broadcast("event:viewBatch");
            $scope.changeMiddleSectionTo($scope.batchLogPartial);
        };

        $scope.confirmRunProcess = function (batchProcess) {
            $scope.selectedProcessToRun = angular.copy(batchProcess);
            $(confirmRunModal).modal('show');
        };

        $scope.runBatch = function () {
            $scope.runningBatches = true;
            BatchProcessService.runBatchProcess({id: $scope.selectedProcessToRun.id}, {}, function () {
                $scope.runningBatches = false;
                $scope.addAlert('The process has been submitted. Use the log screen to view start/stop status', 'info', 10000);
                $(confirmRunModal).modal('hide');
            }, function () {
                $scope.runningBatches = false;
                $scope.displayMessageInElement('.run-error', 'The process has been submitted. Use the log screen to view start/stop status', 10000);
            });
        };

        $scope.loadBatchList();

    }])
    .controller('BatchProcessInputCtrl', ['$scope', 'contextPath', 'BatchProcessService', '$uibModal', 'Upload', 'ControllerInfoPasser', function ($scope, contextPath, BatchProcessService, $modal, Upload, ControllerInfoPasser) {

        $scope.batchPartial = "partials/administration/batchprocess/batchProcess.html";
        $scope.persisting = false;
        $scope.roleList = [];
        $scope.emailsOnStart = [];
        $scope.emailsOnFinish = [];
        $scope.emailsOnFail = [];


        $scope.getAllRoles().then( function() {
            $scope.roleList = $scope.getAllRoleNames();
        });

        $scope.initializeBatchForm = function () {

            if (angular.isDefined($scope.batchForm)) {
                $scope.batchForm.$setPristine();
            }

            if (ControllerInfoPasser.get('batchToEdit')) {
                $scope.batch = ControllerInfoPasser.get('batchToEdit');
                $scope.processEmailsForLoading();
                ControllerInfoPasser.clear('batchToEdit');
                $scope.currentAction = 'Edit';
                $scope.editing = true;

            } else {
                $scope.batch = ControllerInfoPasser.get('batchToCreate');
                ControllerInfoPasser.clear('batchToCreate');
                $scope.currentAction = 'Add';
                $scope.editing = false;

            }

        };

        $scope.addBatch = function () {
            if ($scope.batchForm.$valid) {
                if (angular.isDefined($scope.batch)) {
                    $scope.persisting = true;

                    $scope.processEmailsForSaving();

                    BatchProcessService.add({}, $scope.batch, function (value, responseHeaders) {
                        // On Success
                        $scope.persisting = false;
                        $scope.currentAction = "Add";
                        $scope.addAlert('Successfully added batch process: ' + $scope.batch.beanName, 'success');
                        $scope.changeMiddleSectionTo($scope.batchPartial);

                    }, function (httpResponse) {
                        // On Error
                        switch (httpResponse.status) {
                            case 405:
                                $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
                                break;
                            case 409:
                                $scope.addAlert('Batch Process "' + $scope.batch.beanName + '" already exists! Please choose another name.', 'warning');
                                break;
                            default:
                                $scope.addAlert('There was an error adding the new batch process!', 'danger');
                                break;
                        }
                        $scope.persisting = false;
                    });
                }
            } else {
                $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
            }
        };

        $scope.updateBatch = function () {
            if ($scope.batchForm.$valid) {
                if (angular.isDefined($scope.batch)) {
                    $scope.persisting = true;

                    $scope.processEmailsForSaving();

                    BatchProcessService.update({}, $scope.batch, function (value, responseHeaders) {
                        // On Success
                        $scope.persisting = false;
                        $scope.currentAction = "";
                        $scope.addAlert('Successfully updated batch process: ' + $scope.batch.beanName, 'success');
                        $scope.changeMiddleSectionTo($scope.batchPartial);

                    }, function (httpResponse) {
                        // On Error
                        switch (httpResponse.status) {
                            case 405:
                                $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
                                break;
                            default:
                                $scope.addAlert('There was an error updating the batch process!', 'danger');
                                break;
                        }
                        $scope.persisting = false;
                    });
                }

            } else {
                $scope.addAlert('Invalid input detected.  Please check fields and make sure the data you entered in the form is correct.', 'warning');
            }
        };

        $scope.deleteBatch = function () {
            if (angular.isDefined($scope.batch.id)) {
                $scope.persisting = true;

                $scope.processEmailsForSaving();

                BatchProcessService.delete({id: $scope.batch.id}, function (value, responseHeaders) {
                    // On Success
                    $scope.persisting = false;
                    $scope.currentAction = "";
                    $scope.addAlert('Successfully deleted batch process with ID ' + $scope.batch.id, 'success');
                    $scope.changeMiddleSectionTo($scope.batchPartial);

                }, function (httpResponse) {
                    // On Error
                    $scope.persisting = false;
                    $scope.addAlert('There was an error deleting the batch process!', 'danger');

                });
            } else {
                $scope.addAlert('Cannot delete batch process that does not exist!', 'warning');
            }
        };

        $scope.cancelBatchInput = function () {
            //$scope.initializeBatchForm();
            $scope.changeMiddleSectionTo($scope.batchPartial);
        };

        $scope.processEmailsForLoading = function(){
            $scope.emailsOnStart = $scope.batch.emailsOnStart.join(";");
            $scope.emailsOnFinish = $scope.batch.emailsOnFinish.join(";");
            $scope.emailsOnFail = $scope.batch.emailsOnFail.join(";");
        };

        $scope.processEmailsForSaving = function(){
            if($scope.emailsOnStart.length > 0){
                $scope.batch.emailsOnStart = $scope.emailsOnStart.split(";");
            }
            if($scope.emailsOnFinish.length > 0){
                $scope.batch.emailsOnFinish = $scope.emailsOnFinish.split(";");
            }
            if($scope.emailsOnFail.length > 0){
                $scope.batch.emailsOnFail = $scope.emailsOnFail.split(";");
            }
        };

        $scope.clearAllAlertsInPage();
        $scope.initializeBatchForm();


    }])
    .controller('BatchProcessLogCtrl', ['$scope', 'contextPath', 'BatchProcessLogService', '$uibModal', 'Upload', 'ControllerInfoPasser', function ($scope, contextPath, BatchProcessLogService, $modal, Upload, ControllerInfoPasser) {

        $scope.showDetailView = false;
        $scope.batchPartial = "partials/administration/batchprocess/batchProcess.html";
        $scope.logList = [];
        $scope.persisting = false;
        $scope.isDataLoaded = false;
        $scope.selectedData = {};
        $scope.currentPage = 0;
        $scope.pageSize = 15;

        $scope.initializeLogView = function () {
            if (ControllerInfoPasser.get('batchToView')) {
                $scope.batch = ControllerInfoPasser.get('batchToView');
                ControllerInfoPasser.clear('batchToView');
                $scope.currentAction = 'View';
            }
        };

        $scope.cancelView = function () {
            if ($scope.showDetailView === true) {
                $scope.showDetailView = false;
            } else {
                $scope.changeMiddleSectionTo($scope.batchPartial);
            }
        };

        $scope.showDetail = function (data) {
            $scope.showDetailView = true;
            $scope.selectedData = data;
        };

        $scope.loadLogList = function () {
            $scope.isDataLoaded = false;
            $scope.loadingLogList = true;
            BatchProcessLogService.findByBatch({batchId: $scope.batch.id}, function (value, responseHeaders) {
                $scope.logList = value;
                $scope.isDataLoaded = true;
            }, function (httpResponse) {
                // On Error
                switch (httpResponse.status) {
                    case 404:
                        $scope.addAlert('There are no logs for this batch process!', 'warning');
                        break;
                    case 304:
                        $scope.addAlert('There are no logs for this batch process!', 'warning');
                        break;
                    default:
                        $scope.addAlert('There was an error loading the logs!', 'danger');
                        break;
                }
                $scope.isDataLoaded = false;
            });
            $scope.loadingLogList = false;
        };

        $scope.initializeLogView();
        $scope.loadLogList();

    }])
    .controller('WeatherNormalizationAdminCtrl', ['$scope', 'SysConfigService', function ($scope, SysConfigService) {


        SysConfigService.getMultipleKeys({}, WEATHER_NORMALIZE_SYS_CONFIG_KEYS, function (data) {
            $scope.defaultHeatingBase = data[DEFAULT_HEATING_BASE_TEMP];
            $scope.defaultCoolingBase = data[DEFAULT_COOLING_BASE_TEMP];
            $scope.defaultTemperatureUnits = data[DEFAULT_TEMP_UNIT];
        }, function () {
            $scope.addAlert('There was an error getting the system defaults for weather normalization!', 'danger', 10000);
        });

        $scope.saveWeatherNormalizationOptions = function () {

            if ($scope.weatherDefaults.$invalid) {
                $scope.addAlert('Fill in all required fields', 'warning', 10000);
                return;
            }

            var data = {
                DEFAULT_HEATING_BASE_TEMPERATURE: $scope.defaultHeatingBase,
                DEFAULT_COOLING_BASE_TEMPERATURE: $scope.defaultCoolingBase,
                DEFAULT_TEMPERATURE_NORMALIZE_UNIT: $scope.defaultTemperatureUnits
            };

            SysConfigService.setMultipleKeys({}, data, function () {
                $scope.addAlert('Successfully saved all information', 'success', 10000);
            }, function () {
                $scope.addAlert('There was an error saving the weather normalization options!', 'danger', 10000);
            });
        };

        $scope.loadDropboxes(['temperatureUnits']);
    }])
    .controller('SecuritySettingsCtrl', ['$scope', '$http', 'ControllerInfoPasser', 'SecuritySettingsService', function ($scope, $http, ControllerInfoPasser, SecuritySettingsService) {

        // add partials to scope
        var securityEditPartial = "partials/administration/securitysettings/securitySettingEditor.html";

        // set table order property
        $scope.settingOrder = ['title'];

        // set initial state of switch variables
        $scope.loadingSettings = false;
        $scope.isLoaded = false;

        // pagination settings
        $scope.currentPage = 0;
        $scope.pageSize = 15;

        // initialize data store
        $scope.securitySettingsList = [];

        $scope.loadSecuritySettings = function () {
            $scope.loadingSettings = true;
            // get the security settings from REST API
            SecuritySettingsService.getAll({}, function (securitySettings) {
                // get titles from json file
                $http.get('json/securitySettings.json').success(function (titles) {
                    // con
                    angular.forEach(securitySettings, function (value, key) {
                        if (!key.startsWith('$')) {
                            this.push({
                                key: key,
                                title: titles[key],
                                roles: value ? value.toString().split(ROLE_DELIMETER) : [] // convert string into string array
                            });
                        }
                    }, $scope.securitySettingsList);
                    $scope.isLoaded = true;
                    $scope.loadingSettings = false;
                });
            }, function () {
                $scope.addAlert('There was an error getting security settings', 'danger', 10000);
            });
        };

        $scope.isSecuritySettingsEmpty = function () {
            for (var key in $scope.securitySettingsList) {
                if ($scope.securitySettingsList.hasOwnProperty(key)) {
                    return false;
                }
            }
            return true;
        };

        $scope.editSetting = function (setting) {
            ControllerInfoPasser.put('settingToEdit', setting);
            $scope.changeMiddleSectionTo(securityEditPartial);
        };

        $scope.loadSecuritySettings();

    }])
    .controller('SecuritySettingsEditorCtrl', ['$scope', 'ControllerInfoPasser', 'SecuritySettingsService', function ($scope, ControllerInfoPasser, SecuritySettingsService) {

        var securityPartial = "partials/administration/securitysettings/securitySettings.html";

        // Initialize data store
        $scope.roleList = [];

        $scope.initializeSecuritySettingForm = function () {

            if (angular.isDefined($scope.settingForm)) {
                $scope.settingForm.$setPristine();
            }

            if (ControllerInfoPasser.get('settingToEdit')) {
                $scope.setting = ControllerInfoPasser.get('settingToEdit');
                ControllerInfoPasser.clear('settingToEdit');
                $scope.currentAction = 'Edit';
                $scope.editing = true;
            }
        };

        $scope.saveSecuritySetting = function () {
            SecuritySettingsService.set(
                {key: $scope.setting.key},
                $scope.setting.roles.join(ROLE_DELIMETER),
                function () {
                    $scope.addAlert('Successfully saved security setting', 'success', 10000);
                }, function () {
                    $scope.addAlert('There was an error saving the security setting!', 'danger', 10000);
                });
        };

        $scope.exitSecuritySettingEditor = function () {
            $scope.changeMiddleSectionTo(securityPartial);
        };

        // Initialize page 
        $scope.clearAllAlertsInPage();
        $scope.getAllRoles().then(function () {
            $scope.roleList = $scope.getAllRoleNames()
        });
        $scope.initializeSecuritySettingForm();

    }]);