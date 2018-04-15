angular.module('myApp.insuranceControllers', [])
    .controller('InsuranceCtrl', ['$filter', 'ControllerInfoPasser', '$scope', '$timeout', 'SelectedProperty', '$location', 'TaskPasser', '$route', 'RoleService', 'PropertyLookup', 'contextPath', function ($filter, ControllerInfoPasser, $scope, $timeout, SelectedProperty, $location, TaskPasser, $route, RoleService, PropertyLookup, contextPath) {

        $scope.$on('event:insuranceRefresh', function () {
            $route.reload();
        });

        $scope.currentProperty = SelectedProperty.getSelectedProperty();

        $scope.writeNotAllowed = !$scope.currentUserHaveWritePermissionToModule($scope.moduleEnums.insurance);
        $scope.hasInsuranceAdminPermission = $scope.currentUserHaveAdminPermissionToModule($scope.moduleEnums.insurance);

        $scope.insuranceTaskAssignmentRoleNames = [];
        $scope.propertiesForExtraction = [];
        $scope.selectedPropertiesForExtraction = [];
        $scope.statusesForExtraction = [];
        $scope.selectedStatusesForExtraction = [];
        $scope.fromDueDateForExtraction = new Date();
        $scope.toDueDateForExtraction = new Date();
        $scope.insuranceTaskExtractModalAlerts = [];
        $scope.insuranceTaskExcelExtractEventCode = 'event:insuranceTaskExcelExtract';

        $scope.insuranceTaskStatusEnum = {
            IN_PROGRESS: 'IN_PROGRESS',
            REOPENED: 'REOPENED',
            PENDING: 'PENDING',
            CLOSED: 'CLOSED'
        };

        var insuranceTaskAssignmentRoles = [];

        RoleService.query({}, function (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].isSelectedForInsurance) {
                    $scope.insuranceTaskAssignmentRoleNames.push(data[i].roleName);
                }
            }
        }, function () {
            $scope.addAlert('An error has occurred loading the roles!', 'danger', 10000);
        });

        $scope.isCurrentUserAssignedToInsuranceTask = function () {
            var currentUser = $scope.getCurrentUser();
            var roles = currentUser.userProfile.roles;

            // Sorting roles by rank
            roles.sort(function (a, b) {
                return a.rank - b.rank;
            });

            for (var x = 0; x < roles.length; x++) {
                for (var y = 0; y < $scope.insuranceTaskAssignmentRoleNames.length; y++) {
                    if (roles[x].roleName == $scope.insuranceTaskAssignmentRoleNames[y]) {
                        return true;
                    }
                }
            }

            return false;
        };

        $scope.isCurrentUserNotAllowedTaskCreation = function() {
            if ($scope.hasInsuranceAdminPermission === false) {
                return $scope.taskCreationNotAllowed();
            } else {
                return false;
            }
        };

        if ($scope.insuranceEnabled == false) {
            $location.url("/");
        }

        $scope.refreshPropertyInfo = function () {
            $scope.currentProperty = SelectedProperty.getSelectedProperty();
        };

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, category) {
            $scope.refreshPropertyInfo();
        });

        $scope.refreshPropertyInfo();

        $scope.main = 'partials/insurance/insuranceMain.html';
        $scope.insuranceTasks = 'partials/insurance/insuranceTasks.html';
        $scope.propertyDetails = 'partials/propertyInformation/detailedPropertyInformation.html';

        $scope.taskToSubmit = TaskPasser.getTask();

        if (ControllerInfoPasser.get('selectedTask')) {
            $scope.selection = 'insuranceTasks';
        } else {
            $scope.selection = 'main';
        }

        $scope.goToPropertyDetail = function () {
            if ($scope.propertyAccess === $scope.moduleAccessTypes.RW) {
                $scope.changeSelection('propertyDetails');
            }
        };

        $scope.selectedYear = new Date().getFullYear();

        $scope.changeSelection = function (selection) {
            $scope.selection = selection;
        };

        $scope.changeSelectedProperty = function (property) {
            SelectedProperty.setSelectedProperty(property);
            $scope.refreshPropertyInfo();
        };


        $scope.myProperties = ControllerInfoPasser.get('favorites');

        if (!$scope.currentProperty) {
            $location.url('/');
        }

        var setDefaultSelectedPropertiesForExtraction = function() {
            $scope.selectedPropertiesForExtraction.length = 0;

            var currentProperty = SelectedProperty.getSelectedProperty();

            var defaultSelectedProperty = $scope.searchArrayForProperty($scope.propertiesForExtraction, 'propertyNumber', currentProperty.propertyNumber)[0];
            if (angular.isDefined(defaultSelectedProperty)) {
                $scope.selectedPropertiesForExtraction.push(defaultSelectedProperty);
            }
        };

        var setDefaultStatusesForExtraction = function() {
            $scope.selectedStatusesForExtraction.length = 0;
            $scope.statusesForExtraction = $scope.dropboxes['taskStatus'].itemMap;

            for (var x = 0; x < $scope.statusesForExtraction.length; x++) {
                var status = $scope.statusesForExtraction[x];

                if (status.value === $scope.insuranceTaskStatusEnum.IN_PROGRESS ||
                    status.value === $scope.insuranceTaskStatusEnum.REOPENED ||
                    status.value === $scope.insuranceTaskStatusEnum.PENDING) {

                    $scope.selectedStatusesForExtraction.push(status);
                }
            }
        };

        $scope.populatePropertyListForExtraction = function () {
            if ($scope.propertiesForExtraction.length <= 0) {
                PropertyLookup.findAllAsDTO(function (data, ignoreHeaders) {
                    $scope.propertiesForExtraction = data;
                    setDefaultSelectedPropertiesForExtraction();
                });
            }
        };

        $scope.populatePropertyListForExtraction();

        var getSelectedInsuranceTaskStatuses = function (statusObjects) {
            var statuses = [];
            angular.forEach(statusObjects, function (statusObject, ignoreIndex) {
                statuses.push(statusObject.value);
            });

            return statuses;
        };

        $scope.extractInsuranceTasks = function(form) {
            var propertyNumbersToSend = $scope.getPropertyNumbers($scope.selectedPropertiesForExtraction);
            var statuses = getSelectedInsuranceTaskStatuses($scope.selectedStatusesForExtraction);

            if (angular.isUndefined(propertyNumbersToSend) || propertyNumbersToSend.length <= 0) {
                $scope.addExtractionModalAlert('Please make sure to select at least one property..', 'warning');
                return;

            }

            if (angular.isUndefined(statuses) || statuses.length <= 0) {
                $scope.addExtractionModalAlert('Please make sure to select at least one status..', 'warning');
                return;

            }

            if (form.$valid) {
                var url = contextPath + '/webapi/tasks/insurance/extract/excel';

                var from = $filter('date')($scope.fromDueDateForExtraction, 'yyyy-MM-dd', $scope.getTimezoneOffset());
                var to = $filter('date')($scope.toDueDateForExtraction, 'yyyy-MM-dd', $scope.getTimezoneOffset());

                if (angular.isUndefined(from) || from === null) {
                    from = '';
                }

                if (angular.isUndefined(to) || to === null) {
                    to = '';
                }

                if (new Date(from) > new Date(to)) {
                    $scope.addExtractionModalAlert('From Due Date can not be past To Due Date', 'warning');
                    return;
                }

                var data = {
                    propertyNumbers: propertyNumbersToSend,
                    statuses: statuses
                };

                if (angular.isDefined($scope.fromDueDateForExtraction) && $scope.fromDueDateForExtraction !== null) {
                    data['fromDueDate'] = $scope.fromDueDateForExtraction;
                }

                if (angular.isDefined($scope.toDueDateForExtraction) && $scope.toDueDateForExtraction !== null) {
                    data['toDueDate'] = $scope.toDueDateForExtraction;
                }

                $scope.openInNewWindow('POST', url, data);

            } else {
                $scope.addExtractionModalAlert('Invalid input detected, please make sure you fill in all required fields.', 'warning');
                return;
            }
        };

        $scope.addExtractionModalAlert = function (msg, type, duration) {
            if ($scope.insuranceTaskExtractModalAlerts.length > 0) {
                $scope.insuranceTaskExtractModalAlerts.splice(0, 1);
            }

            $scope.insuranceTaskExtractModalAlerts.push({msg: msg, type: type});

            if (angular.isDefined(duration)) {
                $scope.closeExtractionModalAlert(0, duration);
            }
        };

        $scope.closeExtractionModalAlert = function (index, duration) {
            $timeout(function () {
                $scope.insuranceTaskExtractModalAlerts.splice(index, 1);
            }, duration);
        };

        $scope.$on('event:openTask', function () {
            $scope.selection = 'insuranceTasks';
        });

        $scope.$on($scope.insuranceTaskExcelExtractEventCode, function(ignoreEvent, data) {
            if (angular.isDefined(data)) {
                if (angular.isDefined(data.fromDueDate)) {
                    $scope.fromDueDateForExtraction = data.fromDueDate;
                }

                if (angular.isDefined(data.toDueDate)) {
                    $scope.toDueDateForExtraction = data.toDueDate;
                }
            }

            $scope.extractInsuranceTasks(data.form);

        });

        $scope.loadDropboxes(['taskStatus'], setDefaultStatusesForExtraction);

    }])
    .controller('InsuranceMainCtrl', ['$rootScope', 'ControllerInfoPasser', '$scope', '$http', 'SelectedProperty', '$location', function ($rootScope, ControllerInfoPasser, $scope, $http, SelectedProperty, $location) {

        $scope.standardInsuranceCrudButtonsPartial = 'partials/insurance/standardInsuranceCrudButtons.html';

        $scope.currentProperty = SelectedProperty.getSelectedProperty();

        if (!$scope.currentProperty) {
            $location.url('/');
        }

        $scope.persisting = false;

        $scope.removeExternalMenuHighlights = function () {
            // Implement this if there are external menus aside from the menus in the angular tree view
        };

        $scope.isSelected = function (link) {
            $rootScope.$broadcast('event:externalMenuSelected', "");
            // Implement this if there are external menus aside from the menus in the angular tree view
            // This function is called by the external menu aside from the menus in the angular tree view
        };

        $scope.isViewingData = function () {
            if ($scope.middleSection != 'partials/moduleLandingPropertyInfo.html' && $scope.middleSection != '' && $scope.action == "") {
                return true;
            } else {
                return false;
            }
        };

        $http.get('json/insuranceMenus.json').success(function (data) {
            $scope.items = data;
        });

        $scope.middleSection = 'partials/moduleLandingPropertyInfo.html';


        $scope.changeMiddleSectionTo = function (section) {
            $scope.persisting = false;
            $scope.middleSection = section;
            if ($scope.middleSection == '') {
                $scope.ohsMenuItem = undefined;
            }
        };


        $scope.changeMenuItem = function (menuItem) {
            $scope.showMainCRUD();
            if (menuItem.type == "menu") {
                $scope.selectedInsuranceMenuItem = menuItem;
                $scope.action = "";
                $scope.changeMiddleSectionTo(menuItem.overviewPartialHTML);
                ControllerInfoPasser.put("selectedInsuranceMenuItem", $scope.selectedInsuranceMenuItem);
            } else {
                $scope.changeMiddleSectionTo(menuItem.overviewPartialHTML);
            }
        };

        $scope.addNewRecord = function () {
            $scope.nextAction = 'Save';
            $scope.action = 'Add';
            $scope.changeMiddleSectionTo($scope.selectedInsuranceMenuItem.inputPartialHTML);
        };


        $scope.deleteRecord = function () {
            $scope.nextAction = '';
            // $scope.action = 'Delete';
            $scope.persisting = true;
            ControllerInfoPasser.broadcast("event:deleteInsuranceRecord");
        };

        $scope.cancelDataEntry = function () {
            $scope.changeMenuItem($scope.selectedInsuranceMenuItem);
        };

        $scope.isEditingData = function () {
            if ($scope.action == "Edit") {
                return true;
            } else {
                return false;
            }
        };


        $scope.isEnteringData = function () {
            if ($scope.action == "Add" || $scope.action == "Edit") {
                return true;
            } else {
                return false;
            }
        };

        $scope.persistRecord = function () {
            $scope.persisting = true;
            ControllerInfoPasser.put("selectedInsuranceMenuItem", $scope.selectedInsuranceMenuItem);
            ControllerInfoPasser.broadcast("event:persistInsuranceRecord");
        };

        $scope.$on('event:editInsuranceRecord', function () {
            $scope.nextAction = 'Update';
            $scope.action = 'Edit';
        });

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, category) {
            $scope.refreshPropertyInfo();
        });

        $scope.$on('event:disableCRUD', function () {
            $scope.persisting = true;
        });

        $scope.$on('event:enableCRUD', function () {
            $scope.persisting = false;
        });

        $scope.$on('event:errorPersisting', function () {
            $scope.persisting = false;
        });

        $scope.$on('event:viewingRecommendationPropertyTasks', function () {
            $scope.nextAction = '';
            $scope.action = '';
            $scope.viewingInsurancePolicy = true;
        });

        $scope.refreshPropertyInfo = function () {
            $scope.currentProperty = SelectedProperty.getSelectedProperty();
        };

        $scope.resetRecord = function () {
            // alert( "reset triggered" );
            ControllerInfoPasser.broadcast("event:resetRecord");
        };

        $scope.propertyInformationLink = {
            label: 'Property Information',
            type: 'menu',
            overviewPartialHTML: 'partials/moduleLandingPropertyInfo.html'
        };

        $scope.isPropInfoSelected = function () {
            if ($scope.selectedInsuranceMenuItem.label == $scope.propertyInformationLink.label) {
                return true;
            } else {
                return false;
            }
        };

        $scope.viewingInsurancePolicyEventString = 'event:viewingInsurancePolicyEventString';
        $scope.insurancePolicyViewPartial = 'partials/insurance/insurancePolicyView.html';

        $scope.viewingInsurancePolicy = false;
        $scope.$on($scope.viewingInsurancePolicyEventString, function () {
            $scope.viewingInsurancePolicy = true;
        });

        $scope.showInsurancePolicyListEventString = 'event:showInsurancePolicyList';
        $scope.$on($scope.showInsurancePolicyListEventString, function () {
            $scope.viewingInsurancePolicy = false;
        });

        $scope.$on('event:errorPersisting', function () {
            $scope.persisting = false;
        });

        $scope.hideMainCRUD = function () {
            $scope.disabledMainCRUD = true;
        };

        $scope.showMainCRUD = function () {
            $scope.disabledMainCRUD = false;
        }
    }])
    .controller('InsuranceDocumentListCtrl', ['$scope', '$http', 'ControllerInfoPasser', 'InsuranceService', 'SelectedProperty', function ($scope, $http, ControllerInfoPasser, InsuranceService, SelectedProperty) {

        $scope.currentProperty = SelectedProperty.getSelectedProperty();

        $scope.selectedInsuranceMenuItem = ControllerInfoPasser.get('selectedInsuranceMenuItem');

        $scope.records = [];
        $scope.loadingInsuranceRecords = false;

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (ignoreEvent, ignoreCategory) {
            $scope.currentProperty = SelectedProperty.getSelectedProperty();
            $scope.loadRecordList();
        });

        $scope.loadRecordList = function () {
            $scope.loadingInsuranceRecords = true;
            InsuranceService.findInsuranceRecords({servicePath: $scope.selectedInsuranceMenuItem.id}, function (value, ignoreResponseHeaders) {
                // Success
                $scope.loadingInsuranceRecords = false;
                $scope.setRecordList(value);
            }, function (ignoreHttpResponse) {
                // Error
                $scope.loadingInsuranceRecords = false;
            });
        };

        $scope.hasTableRows = function () {
            var numberOfRows = document.getElementById('insuranceListTable').getElementsByTagName('tbody')[0].getElementsByTagName('tr').length;
            if (numberOfRows > 0) {
                return true;
            } else {
                return false;
            }
        };

        $scope.setRecordList = function (records) {
            $scope.records = records;
            // alert( JSON.stringify( $scope.records ) );
        };

        $scope.editRecord = function (record) {
            ControllerInfoPasser.put('selectedRecord', record);
            ControllerInfoPasser.broadcast('event:editInsuranceRecord');
            $scope.changeMiddleSectionTo($scope.selectedInsuranceMenuItem.inputPartialHTML);
        };

        $scope.loadRecordList();

    }])
    .controller('InsuranceRecommendationsFormCtrl', ['$scope', '$http', 'GeoService', 'ControllerInfoPasser', 'InsuranceService', function ($scope, $http, GeoService, ControllerInfoPasser, InsuranceService) {

        $scope.taskPriorityList = [];

        $scope.selectedTaskPriorityId = null;

        $scope.$on('event:resetRecord', function () {
            $scope.clearFormObject();
        });

        $scope.setTaskPriorityList = function (list) {
            $scope.taskPriorityList = list;
        };

        $scope.loadTaskPriorities = function () {
            InsuranceService.findInsuranceRecords({servicePath: 'taskpriority'}, function (value, responseHeaders) {
                // Success
                $scope.setTaskPriorityList(value);
            }, function (httpResponse) {
                // Error
                $scope.addAlert('There was an error loading task priorities!', 'danger');
            });
        };

        $scope.clearFormObject = function () {
            $scope.refreshPropertyInfo();
            if ($scope.form) {
                $scope.clearForm($scope.form, $scope.record);
            }

            if (ControllerInfoPasser.get('selectedRecord')) {
                var selectedRecord = ControllerInfoPasser.get('selectedRecord');
                $scope.record = {};
                $scope.record = selectedRecord;
                $scope.selectedTaskPriorityId = $scope.record.taskPriority.id;
                ControllerInfoPasser.clear('selectedRecord');
                $scope.action = 'Edit';
            } else {
                if ($scope.nextAction != null) {
                    InsuranceService.createInsuranceRecord({servicePath: $scope.selectedInsuranceMenuItem.id}, function (value, responseHeaders) {
                        // Success
                        $scope.record = value;
                    }, function (httpResponse) {
                        $scope.addAlert('There was an error initializing the recommendations form!', 'danger');
                    });
                    $scope.action = 'Add';
                }
            }
        };

        $scope.searchTaskPriorityArrayById = function (taskId) {
            var taskPriority = null;
            for (var x = 0; x < $scope.taskPriorityList.length; x++) {
                if (taskId == $scope.taskPriorityList[x].id) {
                    taskPriority = $scope.taskPriorityList[x];
                    break;
                }
            }
            return taskPriority;
        };

        $scope.submitRecord = function () {
            if ($scope.form.$valid) {
                $scope.record.taskPriority = $scope.searchTaskPriorityArrayById($scope.selectedTaskPriorityId);
                InsuranceService.addInsuranceRecord({servicePath: $scope.selectedInsuranceMenuItem.id}, $scope.record, function (value, responseHeaders) {
                    // Success
                    $scope.addAlert('Successfully created the recommendation.', 'success');
                    $scope.nextAction = null;
                    $scope.action = 'Saved';
                    $scope.clearFormObject();
                    $scope.changeMenuItem($scope.selectedInsuranceMenuItem);
                }, function (httpResponse) {
                    // Error
                    errorPersisting();
                    $scope.addAlert('There was an error creating the recommendation!', 'danger');
                });
            } else {
                errorPersisting();
                $scope.addAlert('Invalid input. Please check the form fields', 'warning');
            }
        };

        $scope.updateRecord = function () {
            if ($scope.form.$valid) {
                $scope.record.taskPriority = $scope.searchTaskPriorityArrayById($scope.selectedTaskPriorityId);
                InsuranceService.updateInsuranceRecord({servicePath: $scope.selectedInsuranceMenuItem.id}, $scope.record, function (value, responseHeaders) {
                    // Success
                    $scope.addAlert('Successfully updated the recommendation.', 'success');
                    $scope.nextAction = null;
                    $scope.action = 'Saved';
                    $scope.clearFormObject();
                    $scope.changeMenuItem($scope.selectedInsuranceMenuItem);
                }, function (httpResponse) {
                    // Error
                    errorPersisting();
                    $scope.addAlert('There was an error updating the recommendation!', 'danger');
                });
            } else {
                errorPersisting();
                $scope.addAlert('Invalid input. Please check the form fields', 'warning');
            }
        };

        $scope.deleteRecord = function () {
            InsuranceService.deleteInsuranceRecord({
                servicePath: $scope.selectedInsuranceMenuItem.id,
                id: $scope.record.id
            }, function (value, responseHeaders) {
                // Success
                $scope.addAlert('Successfully deleted the recommendation.', 'success');
                $scope.nextAction = null;
                $scope.action = 'Deleted';
                $scope.clearFormObject();
                $scope.changeMenuItem($scope.selectedInsuranceMenuItem);
            }, function (httpResponse) {
                // Error
                errorPersisting();
                switch (httpResponse.status) {
                    case 405:
                        $scope.addAlert('The recommendation cannot be deleted because it is being used by an insurance task', 'warning');
                        break;
                    case 304:
                        $scope.addAlert('The recommendation to be deleted does not exist anymore', 'warning');
                        break;
                    default:
                        $scope.addAlert('There was an error deleting the recommendation!', 'danger');
                        break;
                }
            });
        };

        $scope.$on('event:persistInsuranceRecord', function () {
            $scope.selectedInsuranceMenuItem = ControllerInfoPasser.get("selectedInsuranceMenuItem");
            if ($scope.nextAction == 'Save') {
                $scope.submitRecord();
            } else {
                if ($scope.nextAction == 'Update') {
                    $scope.updateRecord();
                }
            }

        });

        $scope.$on('event:deleteInsuranceRecord', function () {
            $scope.selectedInsuranceMenuItem = ControllerInfoPasser.get('selectedInsuranceMenuItem');
            $scope.deleteRecord();
        });

        var errorPersisting = function () {
            ControllerInfoPasser.broadcast('event:errorPersisting');
        };

    }])
    .controller('InsuranceRecommendationsListCtrl', ['$scope', 'InsuranceRecommendationService', 'ControllerInfoPasser', function ($scope, InsuranceRecommendationService, ControllerInfoPasser) {

        $scope.currentPage = 0;
        $scope.itemsPerPage = 12;

        var recommendationPropertyTaskPartial = 'partials/insurance/recommendationPropertyTasks.html';

        $scope.viewPropertyTasks = function (recommendation) {
            ControllerInfoPasser.put('recommendation', recommendation);
            $scope.changeMiddleSectionTo(recommendationPropertyTaskPartial)
        }

    }])
    .controller('InsuranceRecommendationsPropertyTasksCtrl', ['$scope', 'InsuranceRecommendationService', 'PropertyLookup', 'ControllerInfoPasser', function ($scope, InsuranceRecommendationService, PropertyLookup, ControllerInfoPasser) {

        var recommendationsPartial = 'partials/insurance/recommendations.html';

        $scope.propertyTasksData = [];
        $scope.currentPage = 0;
        $scope.itemsPerPage = 15;

        $scope.propertyTypesOpt = [];

        // default values for select filters
        $scope.propertyTypeMode = null;
        $scope.propertyStatusMode = null;
        $scope.assignedTaskMode = null;
        $scope.taskStatusMode = null;
        $scope.overdueTaskMode = null;

        $scope.propertyTasksLoading = false;


        $scope.initializeRecommendationPropertyTasks = function () {
            ControllerInfoPasser.broadcast('event:viewingRecommendationPropertyTasks');

            $scope.recommendation = ControllerInfoPasser.get('recommendation');
            ControllerInfoPasser.clear('recommendation');

            $scope.loadPropertyTasks();
            $scope.loadFilters();
        };

        $scope.loadPropertyTasks = function () {
            $scope.propertyTasksLoading = true;

            // get Property Tasks for the associated recommendationID
            InsuranceRecommendationService.findById({recommendationId: $scope.recommendation.id},
                function (propertyTasks, ignoreResponseHeaders) {
                    $scope.propertyTasksData = propertyTasks;
                    $scope.propertyTasksLoading = false;
                }, function (ignoreHttpResponse) {
                    $scope.addAlert("There was an error retrieving the property tasks");
                    $scope.propertyTasksLoading = false;
                }
            );
        };

        $scope.loadFilters = function () {
            $scope.loadPropertyTypeValues();
            $scope.loadDropBoxValues();
            $scope.loadYesNoValues();
        };

        $scope.loadDropBoxValues = function () {
            $scope.loadDropboxes(['propertyStatus', 'taskStatus'])
        };

        $scope.loadPropertyTypeValues = function () {
            // get the Types of properties in the Database
            PropertyLookup.findPropertyTypes({},
                function (propertyTypes, ignoreResponseHeader) {
                    $scope.propertyTypesOpt = propertyTypes;
                }, function (ignoreHttpResponse) {
                    $scope.addAlert("There was an error retrieving the property types");
                }
            );
        };

        $scope.loadYesNoValues = function () {
            $scope.booleanAnswerEnum = {
                Yes: 'YES',
                No: 'NO'
            };
        };

        $scope.propertyTypeFilter = function (propertyTasks) {
            if (propertyTasks.propertyType === $scope.propertyTypeMode) {
                return true;
            } else {
                return $scope.isEmptyString($scope.propertyTypeMode) || $scope.propertyTypeMode === null;
            }
        };

        $scope.propertyStatusFilter = function (propertyTasks) {
            if (propertyTasks.propertyStatus === $scope.propertyStatusMode) {
                return true;
            } else {
                return $scope.isEmptyString($scope.propertyStatusMode) || $scope.propertyStatusMode === null;
            }
        };

        $scope.assignedTaskFilter = function (propertyTasks) {
            if ($scope.assignedTaskMode === $scope.booleanAnswerEnum.Yes) {
                return propertyTasks.taskTitle != null;
            } else {
                if ($scope.assignedTaskMode === $scope.booleanAnswerEnum.No) {
                    return propertyTasks.taskTitle === null;
                } else {
                    return true;
                }
            }
        };

        $scope.taskStatusFilter = function (propertyTasks) {
            if (propertyTasks.taskStatus === $scope.taskStatusMode) {
                return true;
            } else {
                return $scope.isEmptyString($scope.taskStatusMode) || $scope.taskStatusMode === null;
            }
        };


        $scope.overdueTaskFilter = function (propertyTasks) {
            if ($scope.overdueTaskMode === $scope.booleanAnswerEnum.Yes) {
                return propertyTasks.taskDueDate < new Date();
            } else {
                if ($scope.overdueTaskMode === $scope.booleanAnswerEnum.No) {
                    return propertyTasks.taskDueDate > new Date();
                } else {
                    return true;
                }
            }
        };

        $scope.hasTableRows = function () {
            return $scope.propertyTasksLoading == false && $scope.propertyTasksData.length > 0;
        };

        $scope.backToRecommendations = function () {
            $scope.changeMiddleSectionTo(recommendationsPartial);
        };

        $scope.initializeRecommendationPropertyTasks()

    }])
    .controller('InsurancePolicyListCtrl', ['$scope', 'ControllerInfoPasser', function ($scope, ControllerInfoPasser) {

        $scope.viewRecord = function (record) {
            ControllerInfoPasser.put('selectedInsurancePolicyRecord', record);
            ControllerInfoPasser.broadcast('event:viewInsuranceRecord');
            ControllerInfoPasser.broadcast($scope.viewingInsurancePolicyEventString);
            $scope.changeMiddleSectionTo($scope.insurancePolicyViewPartial);

        };

        ControllerInfoPasser.broadcast($scope.showInsurancePolicyListEventString);

    }])
    .controller('InsurancePolicyViewCtrl', ['$scope', 'ControllerInfoPasser', 'InsurancePolicyTermService', 'InsurancePolicyRevisionService', 'InsurancePolicyCoverageService', 'InsuranceService', function ($scope, ControllerInfoPasser, InsurancePolicyTermService, InsurancePolicyRevisionService, InsurancePolicyCoverageService, InsuranceService) {

        var insurancePolicyRevisionViewPartial = 'partials/insurance/insurancePolicyRevisionView.html';
        var selectedInsuranceMenuItem = ControllerInfoPasser.get('selectedInsuranceMenuItem');

        $scope.insurancePolicyRevisions = [];
        $scope.insurancePolicyToView = undefined;
        $scope.insuredList = [];
        $scope.ownerList = [];
        $scope.revisionViewSection = '';
        $scope.showCurrentPolicyRevisionRecord = false;
        $scope.policyCoverageList = [];
        $scope.insurancePolicyCoverageViewModalPartial = 'partials/insurance/insurancePolicyCoverageViewModal.html';
        $scope.revisionsLoadCompleteEventString = 'event:loadingInsurancePolicyRevisionsComplete';

        var originalPolicy = undefined;

        $scope.clearInsurancePolicyFormObject = function () {
            $scope.refreshPropertyInfo();
            // clear form object here
        };

        var prePopulateInsuredList = function(policyRevision) {
            if (angular.isDefined(policyRevision)) {
                $scope.insuredList = policyRevision.insured;
            }
        };

        var prePopulatePropertyOwnersList = function(policyRevision) {
            if (angular.isDefined(policyRevision)) {
                $scope.ownerList = policyRevision.propertyOwners;
            }
        };

        var loadPolicyCoverages = function() {
            if (angular.isDefined($scope.policyRevision.id)) {
                InsurancePolicyCoverageService.findByRevisionId({revisionid: $scope.policyRevision.id}, function (coverages, ignoreHeaders) {
                    $scope.policyCoverageList = angular.copy(coverages);
                });
            } else {
                $scope.policyCoverageList.length = 0;
            }
        };

        // Owl carousel jQuery specific code - start
        $scope.$on($scope.revisionsLoadCompleteEventString, function () {

            $scope.owl = $('#policyRevisionsCarousel');

            // Destroy the carousel data to initialize it with fresh data.
            if ($scope.owl.data('owlCarousel')) {

                // The call to removeItem is done twice here because the carousel creates an item and wraps the last
                // set of items in it.  The first call to removeItem removes the last set of items from parent item,
                // and the second call to removeItem removes the empty parent ite.
                $scope.owl.data('owlCarousel').removeItem();
                $scope.owl.data('owlCarousel').removeItem();

                // Destroy only comments out the data but when the carousel is initialized again, it resurrects the
                // last data.  That's why we call the removeItem first before doing this destroy - to make sure that
                // the data was indeed removed.
                $scope.owl.data('owlCarousel').destroy();
            }

            $scope.owl.owlCarousel({
                itemsCustom: [
                    [0, 4],
                    [450, 4],
                    [600, 7],
                    [700, 7],
                    [1000, 7],
                    [1200, 7],
                    [1400, 7],
                    [1600, 7]
                ],
                navigation: false,
                afterInit: function (ignoreElem) {
                    this.goTo(this.$owlItems.length - 1);
                }
            });
            ControllerInfoPasser.broadcast('event:carouselInitializationComplete');
        });

        $scope.moveListCarouselLeft = function () {
            $scope.owl.trigger('owl.prev');
        };

        $scope.moveListCarouselRight = function () {
            $scope.owl.trigger('owl.next');
        };

        $scope.lastRevisionItemViewed = undefined;
        $scope.highlightActivePolicyRevision = function (revision) {
            var revisionItem = document.getElementById(revision.id);
            if ($scope.lastRevisionItemViewed) {
                $scope.lastRevisionItemViewed.setAttribute('class', 'ng-binding');
            }

            revisionItem.setAttribute('class', 'ng-binding label label-default');
            $scope.lastRevisionItemViewed = revisionItem;
        };

        $scope.policyRevision = undefined;
        $scope.viewPolicyRevision = function (revision) {
            $scope.highlightActivePolicyRevision(revision);

            $scope.policyRevision = revision;
            $scope.initializePolicyRevisionToView(revision);

            $scope.revisionViewSection = insurancePolicyRevisionViewPartial;
        };

        $scope.initializePolicyRevisionToView = function (revisionToView) {
            $scope.policyRevision = revisionToView;

            if (angular.isDefined($scope.policyRevision)) {
                prePopulateInsuredList($scope.policyRevision);
                prePopulatePropertyOwnersList($scope.policyRevision);
                loadPolicyCoverages();

            } else {
                // show error message
                $scope.addAlert('There was a problem showing the policy revision data..', 'danger');
            }
        };

        $scope.editRevision = function () {
            $scope.clearAllAlertsInPage();
            $scope.lastComplianceRecordViewed = $scope.policyRevision;
            ControllerInfoPasser.put('editComplianceRecord', $scope.policyRevision);
            $scope.inputting = true;
            $scope.changeMiddleSectionTo('partials/compliance/complianceInput.html');
        };

        $scope.$on('event:carouselInitializationComplete', function (ignoreEvent, ignoreAttachment) {
            if ($scope.showCurrentPolicyRevisionRecord == true) {
                $scope.showCurrentPolicyRevisionRecord = false;
                // $scope.viewPolicyRevision($scope.currentComplianceToShowAfterCRUD);
            } else {
                // This is where the default view should be implemented.
                $scope.loadDefaultView();
            }
        });

        $scope.loadDefaultView = function () {
            if (angular.isDefined($scope.policyTerm)) {
                if (angular.isDefined($scope.policyTerm.id)) {
                    InsurancePolicyRevisionService.findActiveRevision({
                        termid : $scope.policyTerm.id
                    }, function (data, ignoreHeaders) {
                        $scope.viewPolicyRevision(data);

                    }, function (ignoreHttpResponse) {
                        // On Error
                        $scope.addAlert('Cannot load active insurance policy revision: a server problem has been detected.', 'danger');
                    });
                }
            }
        };

        $scope.isCarouselArrowsHidden = function () {
            if ($scope.window_width < 700) {
                return true;
            } else {
                return false;
            }
        };

        $scope.getWidth = function () {
            return $(window).width();
        };

        $scope.$watch($scope.getWidth, function (newValue, ignoreOldValue) {
            $scope.window_width = newValue;
        });

        window.onresize = function () {
            $scope.$apply();
        };
        // Owl carousel jQuery specific code - end

        var loadPolicyRevisionFormObject = function() {
            if (angular.isDefined($scope.policyRevisionForm)) {
                $scope.clearInsurancePolicyFormObject($scope.policyRevisionForm, $scope.policyRevision);
            }

            if (angular.isDefined($scope.policyTerm.id)) {
                InsurancePolicyRevisionService.findByTermId({termid: $scope.policyTerm.id}, function (revisions, ignoreHeaders) {
                    var indexOfFirstRevision = 0;
                    $scope.insurancePolicyRevisions = revisions;

                    if ($scope.insurancePolicyRevisions.length <= 1) {
                        ControllerInfoPasser.broadcast($scope.disablePolicyRevisionDeleteEventString);
                    } else {
                        ControllerInfoPasser.broadcast($scope.enablePolicyRevisionDeleteEventString);
                    }

                    $scope.initializePolicyRevisionToView($scope.insurancePolicyRevisions[indexOfFirstRevision]);
                    loadPolicyCoverages();
                });

            } else {
                // show error message
                $scope.addAlert('There was a problem loading the policy revision data, the policy term is not recognized.', 'warning');
            }

        };

        var loadPolicyTermFormObject = function() {
            if (angular.isDefined($scope.policy.id)) {
                InsurancePolicyTermService.findByInsurancePolicyId({policyid: $scope.policy.id}, function (terms, ignoreHeaders) {
                    var indexOfFirstTerm = 0;
                    var term = terms[indexOfFirstTerm];

                    if (angular.isDefined(term)) {
                        $scope.policyTerm = term;
                        loadPolicyRevisionFormObject();

                    } else {
                        // show error message
                        $scope.addAlert('There was a problem loading the policy revision data, the policy term is not recognized.', 'warning');
                    }
                });
            } else {
                // show error message
                $scope.addAlert('There was a problem loading the policy data, the policy is not recognized.', 'warning');
            }
        };

        var loadPolicyDetails = function() {
            if (angular.isDefined($scope.policyForm)) {
                $scope.clearInsurancePolicyFormObject($scope.policyForm, $scope.policy);
            }

            $scope.policy = ControllerInfoPasser.get('selectedInsurancePolicyRecord');

            if (angular.isDefined($scope.policy)) {
                if (angular.isDefined($scope.policy.id)) {

                    ControllerInfoPasser.clear('selectedInsurancePolicy');
                    loadPolicyTermFormObject();

                } else {
                    // show error message
                    $scope.addAlert('Cannot load policy, ID is not defined!', 'warning');
                }

            } else {
                // show error message
                $scope.addAlert('Cannot load policy, it is not defined!', 'warning');
            }
        };

        var errorPersisting = function () {
            ControllerInfoPasser.broadcast('event:errorPersisting');
        };

        $scope.showPolicyCoverageView = function(policyCoverageIndex) {
            $scope.selectedPolicyCoverageIndex = policyCoverageIndex;
            $scope.selectedPolicyCoverage = $scope.policyCoverageList[policyCoverageIndex];
            $scope.currentPolicyCoverageToView = angular.copy($scope.selectedPolicyCoverage);
        };

        $scope.deleteInsurancePolicy = function () {
            InsuranceService.deleteInsuranceRecord({
                servicePath: $scope.selectedInsuranceMenuItem.id,
                id: $scope.policy.id
            }, function (ignoreValue, ignoreResponseHeaders) {
                // Success
                $('#deletePolicyModal').modal('hide');
            }, function (ignoreHttpResponse) {
                // Error
                errorPersisting();
                $scope.displayMessageInElement('.delete-modal-error', 'There was an error deleting the policy!', 10000);
            });
        };

        $scope.backToPolicyList = function() {
            $scope.selectedInsuranceMenuItem = ControllerInfoPasser.get('selectedInsuranceMenuItem');
            $scope.changeMenuItem($scope.selectedInsuranceMenuItem);
        };

        $scope.createNewPolicyRevision = function() {
            ControllerInfoPasser.put('selectedInsurancePolicy', $scope.policy);
            ControllerInfoPasser.put('selectedInsurancePolicyTerm', $scope.policyTerm);
            $scope.changeMiddleSectionTo(selectedInsuranceMenuItem.inputPartialHTML);
        };

        $scope.editPolicyRevision = function() {
            ControllerInfoPasser.put('selectedInsurancePolicy', $scope.policy);
            ControllerInfoPasser.put('selectedInsurancePolicyTerm', $scope.policyTerm);
            ControllerInfoPasser.put('selectedInsurancePolicyRevision', $scope.policyRevision);

            var allowedPolicyRevisionDelete = true;
            if ($scope.insurancePolicyRevisions.length <= 1) {
                allowedPolicyRevisionDelete = false;
            }
            ControllerInfoPasser.put('allowedPolicyRevisionDelete', allowedPolicyRevisionDelete);
            $scope.changeMiddleSectionTo(selectedInsuranceMenuItem.inputPartialHTML);
        };

        $scope.deletePolicy = function() {
            $scope.deleteInsurancePolicy();
        };

        $('#deletePolicyModal').on('hidden.bs.modal', function () {
            $scope.addAlert('Successfully deleted the insurance policy.', 'success');
            $scope.selectedInsuranceMenuItem = ControllerInfoPasser.get('selectedInsuranceMenuItem');
            $scope.changeMenuItem($scope.selectedInsuranceMenuItem);
        });

        loadPolicyDetails();

    }])
    .controller('InsurancePolicyFormCtrl', ['$scope', 'ControllerInfoPasser', 'InsuranceService', 'BusinessContactService', 'InsurancePolicyTermService', 'InsurancePolicyRevisionService', 'InsurancePolicyCoverageService', 'IntegratedInsurancePolicyService', function ($scope, ControllerInfoPasser, InsuranceService, BusinessContactService, InsurancePolicyTermService, InsurancePolicyRevisionService, InsurancePolicyCoverageService, IntegratedInsurancePolicyService) {

        var indexOfInsured = -1;
        var indexOfOwner = -1;
        var originalInsured;
        var originalOwner;

        $scope.insurancePolicyCoverageFormModalPartial = 'partials/insurance/insurancePolicyCoverageInputModal.html';

        $scope.policyInformationPanelState = true;
        $scope.policyDetailsPanelState = true;
        $scope.policyCoveragePanelState = true;
        $scope.policyCoverageSummaryPanelState = true;

        $scope.insuredList = [];
        $scope.propertyOwnersList = [];

        $scope.businessContacts = [];

        $scope.businessContactsForBroker = [];
        $scope.businessContactsForInsured = [];
        $scope.businessContactsForPropertyOwners = [];
        $scope.businessContactsForInsurer = [];

        $scope.businessContactNames = [];
        $scope.insurerNotFound = false;

        $scope.policyCoverage = {};
        $scope.currentPolicyCoverageToView = undefined;
        $scope.selectedPolicyCoverage = undefined;
        $scope.selectedPolicyCoverageIndex = undefined;
        $scope.policyCoverageList = [];

        $scope.policyRevision = {};
        $scope.policyTerm = {};
        $scope.selectedRevision = {};

        $scope.allowPolicyRevisionDeletion = true;

        var errorPersisting = function () {
            ControllerInfoPasser.broadcast('event:errorPersisting');
        };

        var prePopulateInsuredList = function(list) {
            $scope.insuredList.length = 0;
            if (angular.isDefined(list)) {
                for (var x = 0; x < list.length; x++) {
                    var insured = list[x];

                    var contact = $scope.searchArrayForProperty($scope.businessContactsForInsured, 'name', insured.name)[0];
                    if (angular.isDefined(contact)) {
                        contact['edit'] = false;
                        $scope.insuredList.push(contact);
                    }
                }
            }
        };

        var prePopulatePropertyOwnersList = function(list) {
            $scope.propertyOwnersList.length = 0;
            if (angular.isDefined(list)) {
                for (var x = 0; x < list.length; x++) {
                    var owner = list[x];

                    var contact = $scope.searchArrayForProperty($scope.businessContactsForPropertyOwners, 'name', owner.name)[0];
                    if (angular.isDefined(contact)) {
                        contact['edit'] = false;
                        $scope.propertyOwnersList.push(contact);
                    }
                }
            }
        };

        $scope.removeCoverageItem = function(policyCoverageIndex) {
            if (angular.isDefined(policyCoverageIndex)) {
                $scope.policyCoverageList.splice(policyCoverageIndex, 1);
            }
        };

        $scope.revertPolicyCoverageEdit = function() {
            $scope.currentPolicyCoverageToView = angular.copy($scope.selectedPolicyCoverage);
        };

        $scope.applyPolicyCoverageEdit = function() {
            if (angular.isDefined($scope.selectedPolicyCoverageIndex)) {
                $scope.policyCoverageList[$scope.selectedPolicyCoverageIndex] = $scope.currentPolicyCoverageToView;
                $scope.selectedPolicyCoverage = $scope.policyCoverageList[$scope.selectedPolicyCoverageIndex];
            }
        };

        $scope.showPolicyCoverageForm = function(policyCoverageIndex) {
            $scope.selectedPolicyCoverageIndex = policyCoverageIndex;
            $scope.selectedPolicyCoverage = $scope.policyCoverageList[policyCoverageIndex];
            $scope.currentPolicyCoverageToView = angular.copy($scope.selectedPolicyCoverage);
        };

        var processNewlyCreatedCoverage = function(coverage) {
            if (angular.isDefined(coverage)) {
                $scope.policyCoverageList.push(coverage);
                var newPolicyCoverageIndex = ($scope.policyCoverageList.length - 1);
                $scope.showPolicyCoverageForm(newPolicyCoverageIndex);
            }
        };

        $scope.createNewPolicyCoverage = function() {
            if (angular.isDefined($scope.policyRevision)) {
                if (angular.isDefined($scope.policyRevision.id)) {
                    InsurancePolicyCoverageService.createByRevisionId({revisionid: $scope.policyRevision.id}, function (coverage, ignoreHeaders) {
                        processNewlyCreatedCoverage(coverage);
                    });
                } else {
                    InsurancePolicyCoverageService.create({}, function (coverage, ignoreHeaders) {
                        processNewlyCreatedCoverage(coverage);
                    });
                }
            }

        };

        var loadPolicyCoverages = function() {
            if (angular.isDefined($scope.policyRevision.id)) {
                InsurancePolicyCoverageService.findByRevisionId({revisionid: $scope.policyRevision.id}, function (coverages, ignoreHeaders) {
                    $scope.policyCoverageList = angular.copy(coverages);
                });
            } else {
                $scope.policyCoverageList.length = 0;
            }
        };

        var loadPolicyRevisionFormObject = function() {
            $scope.allowPolicyRevisionDeletion = ControllerInfoPasser.get('allowedPolicyRevisionDelete');
            if (angular.isUndefined($scope.allowPolicyRevisionDeletion)) {
                $scope.allowPolicyRevisionDeletion = true;
            }

            ControllerInfoPasser.clear('allowedPolicyRevisionDelete');

            if (angular.isDefined($scope.policyRevisionForm)) {
                $scope.clearForm($scope.policyRevisionForm, $scope.policyRevision);
            }

            if (angular.isDefined(ControllerInfoPasser.get('selectedInsurancePolicyRevision'))) {
                var selectedRecord = ControllerInfoPasser.get('selectedInsurancePolicyRevision');
                $scope.policyRevision = {};
                $scope.policyRevision = selectedRecord;
                ControllerInfoPasser.clear('selectedInsurancePolicyRevision');
                prePopulateInsuredList($scope.policyRevision.insured);
                prePopulatePropertyOwnersList($scope.policyRevision.propertyOwners);
                loadPolicyCoverages();

            } else {
                if (angular.isDefined($scope.policyTerm.id)) {
                    InsurancePolicyRevisionService.createByTermId({termid: $scope.policyTerm.id}, function (revision, ignoreHeaders) {
                        $scope.policyRevision = revision;
                    });

                } else {
                    InsurancePolicyRevisionService.create({}, function (revision, ignoreHeaders) {
                        $scope.policyRevision = revision;
                        prePopulateInsuredList($scope.policyRevision.insured);
                        prePopulatePropertyOwnersList($scope.policyRevision.propertyOwners);
                        loadPolicyCoverages();
                    });
                }
            }

        };

        var loadPolicyTermFormObject = function() {
            if (angular.isDefined($scope.policyTermForm)) {
                $scope.clearForm($scope.policyTermForm, $scope.policyTerm);
            }

            if (angular.isDefined(ControllerInfoPasser.get('selectedInsurancePolicyTerm'))) {
                var selectedRecord = ControllerInfoPasser.get('selectedInsurancePolicyTerm');
                $scope.policyTerm = {};
                $scope.policyTerm = selectedRecord;
                ControllerInfoPasser.clear('selectedInsurancePolicyTerm');

                loadPolicyRevisionFormObject();

            } else {
                if (angular.isDefined($scope.policy.id)) {
                    InsurancePolicyTermService.findByInsurancePolicyId({policyid: $scope.policy.id}, function (terms, ignoreHeaders) {
                        var indexOfFirstTerm = 0;
                        var term = terms[indexOfFirstTerm];

                        if (angular.isDefined(term)) {
                            $scope.policyTerm = term;
                            loadPolicyRevisionFormObject();

                        } else {
                            InsurancePolicyTermService.createByPolicyId({policyid: $scope.policy.id}, function (term, ignoreHeaders) {
                                $scope.policyTerm = term;

                                InsurancePolicyTermService.add({}, $scope.policyTerm, function (termWithId, ignoreHeaders) {
                                    $scope.policyTerm = termWithId;
                                    loadPolicyRevisionFormObject();
                                });
                            });
                        }
                    });
                } else {
                    InsurancePolicyTermService.create({}, function (term, ignoreHeaders) {
                        $scope.policyTerm = term;
                        loadPolicyRevisionFormObject();
                    });
                }
            }
        };

        var loadPolicyFormObject = function() {
            if (angular.isDefined($scope.policyForm)) {
                $scope.clearForm($scope.policyForm, $scope.policy);
            }

            if (angular.isDefined(ControllerInfoPasser.get('selectedInsurancePolicy'))) {
                var selectedRecord = ControllerInfoPasser.get('selectedInsurancePolicy');
                $scope.policy = {};
                $scope.policy = selectedRecord;

                if (angular.isDefined($scope.policy.primaryInsurer)) {
                    $scope.assignContactAsInsurer($scope.policy.primaryInsurer.name);
                }

                ControllerInfoPasser.clear('selectedInsurancePolicy');
                $scope.action = 'Edit';
                loadPolicyTermFormObject();

            } else {
                if ($scope.nextAction != null) {
                    InsuranceService.createInsuranceRecord({servicePath: $scope.selectedInsuranceMenuItem.id}, function (value, ignoreResponseHeaders) {
                        // Success
                        $scope.policy = value;
                        loadPolicyTermFormObject();

                    }, function (ignoreHttpResponse) {
                        $scope.addAlert('There was an error initializing the insurance policy form!', 'danger');
                    });
                    $scope.action = 'Add';
                }
            }
        };

        $scope.determineIfContactNameIsValid = function (contact) {
            if (angular.isUndefined(contact)) {
                return false;
            }

            if ($scope.isEmptyString(contact.name)) {
                return false;
            }

            return true;
        };

        $scope.newInsured = function() {
            if (indexOfInsured > -1) {
                $scope.displayMessageInElement('#insuredInfoMessage', 'Please save or discard changes before adding a new insured', 5000);

            } else {
                BusinessContactService.create({}, function (contact, ignoreHeaders) {
                    contact['edit'] = true;
                    $scope.insuredList.push(contact);
                    indexOfInsured = $scope.insuredList.length - 1;
                });
            }
        };

        $scope.newOwner = function() {
            if (indexOfOwner > -1) {
                $scope.displayMessageInElement('#ownerInfoMessage', 'Please save or discard changes before adding a new owner', 5000);

            } else {
                BusinessContactService.create({}, function (contact, ignoreHeaders) {
                    contact['edit'] = true;
                    $scope.propertyOwnersList.push(contact);
                    indexOfOwner = $scope.propertyOwnersList.length - 1;
                });
            }
        };

        $scope.addContactAsInsured = function (insured) {
            if ($scope.determineIfContactNameIsValid(insured)) {
                var contactToInsure = $scope.searchArrayForProperty($scope.businessContactsForInsured, 'name', insured.name)[0];
                if (angular.isDefined(contactToInsure)) {
                    insured = contactToInsure;
                    insured['edit'] = false;
                    indexOfInsured = -1;

                } else {
                    // warn that contact cannot be added because it doesn't exist
                    $scope.addAlert('Non-existent contact cannot be added.', 'warning');
                }
            }
        };

        $scope.addContactAsOwner = function (owner) {
            if ($scope.determineIfContactNameIsValid(owner)) {
                var ownerToAdd = $scope.searchArrayForProperty($scope.businessContactsForPropertyOwners, 'name', owner.name)[0];
                if (angular.isDefined(ownerToAdd)) {
                    owner = ownerToAdd;
                    owner['edit'] = false;
                    indexOfOwner = -1;

                } else {
                    // warn that contact cannot be added because it doesn't exist
                    $scope.addAlert('Non-existent contact cannot be added.', 'warning');
                }
            }
        };

        $scope.markInsuredForRemoval = function(index) {
            indexOfInsured = index;

            $scope.insuredList.splice(indexOfInsured, 1);
            indexOfInsured = -1;
        };

        $scope.markOwnerForRemoval = function(index) {
            indexOfOwner = index;

            $scope.propertyOwnersList.splice(indexOfOwner, 1);
            indexOfOwner = -1;
        };

        $scope.getAllBusinessContacts = function () {
            BusinessContactService.query({}, function (contacts, ignoreHeaders) {
                $scope.businessContactsForInsurer = angular.copy(contacts);
                $scope.businessContactsForBroker = angular.copy(contacts);
                $scope.businessContactsForInsured = angular.copy(contacts);
                $scope.businessContactsForPropertyOwners = angular.copy(contacts);

                $scope.businessContactNames.length = 0;
                angular.forEach(contacts, function (contact) {
                    $scope.businessContactNames.push(contact.name);
                });

                loadPolicyFormObject();

            }, function(ignoreHttpResponse){
                // error
                loadPolicyFormObject();
            });
        };

        $scope.searchTaskPriorityArrayById = function (taskId) {
            var taskPriority = null;
            for (var x = 0; x < $scope.taskPriorityList.length; x++) {
                if (taskId == $scope.taskPriorityList[x].id) {
                    taskPriority = $scope.taskPriorityList[x];
                    break;
                }
            }
            return taskPriority;
        };

        var getPolicyDataToSubmit = function() {
            $scope.policyTerm['insurancePolicy'] = $scope.policy;
            $scope.policyRevision.propertyOwners = $scope.propertyOwnersList;
            $scope.policyRevision.insured = $scope.insuredList;
            $scope.policyRevision['insurancePolicyTerm'] = $scope.policyTerm;

            for (var x = 0; x < $scope.policyCoverageList.length; x++) {
                var coverage = $scope.policyCoverageList[x];
                if (angular.isUndefined(coverage['insurancePolicyRevision']) || coverage['insurancePolicyRevision'] === null) {
                    coverage['insurancePolicyRevision'] = $scope.policyRevision;
                }
            }

            var policyData = {
                insurancePolicy: $scope.policy,
                insurancePolicyTerm: $scope.policyTerm,
                insurancePolicyRevision: $scope.policyRevision,
                insurancePolicyCoverageList: $scope.policyCoverageList
            };

            return policyData;
        };

        $scope.submitInsurancePolicy = function () {
            var insurerDefined = angular.isDefined($scope.policy.primaryInsurer);

            if ($scope.policyForm.$valid && insurerDefined) {

                var policyData = getPolicyDataToSubmit();
                IntegratedInsurancePolicyService.add({}, policyData, function (ignoreData, ignoreResponseHeaders) {
                    // Success
                    $scope.addAlert('Successfully created the insurance policy.', 'success');
                    $scope.nextAction = null;
                    $scope.action = 'Saved';
                    $scope.changeMenuItem($scope.selectedInsuranceMenuItem);

                }, function (ignoreHttpResponse) {
                    // Error
                    errorPersisting();
                    $scope.addAlert('There was an error creating the insurance policy!', 'danger');
                });

            } else {
                errorPersisting();
                $scope.addAlert('Invalid input. Please check the form fields', 'warning');
            }
        };

        $scope.submitNewPolicyRevision = function() {
            var insurerDefined = angular.isDefined($scope.policy.primaryInsurer);

            if ($scope.policyForm.$valid && insurerDefined) {

                var policyData = getPolicyDataToSubmit();
                IntegratedInsurancePolicyService.addNewPolicyRevision({}, policyData, function (ignoreData, ignoreResponseHeaders) {
                    // Success
                    $scope.addAlert('Successfully created the insurance policy revision.', 'success');
                    ControllerInfoPasser.put('selectedInsurancePolicy', policyData.insurancePolicy);
                    $scope.changeMiddleSectionTo($scope.insurancePolicyViewPartial);

                }, function (ignoreHttpResponse) {
                    // Error
                    errorPersisting();
                    $scope.addAlert('There was an error creating the insurance policy!', 'danger');
                });

            } else {
                errorPersisting();
                $scope.addAlert('Invalid input. Please check the form fields', 'warning');
            }
        };

        $scope.updatePolicyRevision = function() {
            var insurerDefined = angular.isDefined($scope.policy.primaryInsurer);

            if ($scope.policyForm.$valid && insurerDefined && $scope.policyRevisionForm.$valid) {

                var policyData = getPolicyDataToSubmit();
                IntegratedInsurancePolicyService.updatePolicyRevision({}, policyData, function (ignoreData, ignoreResponseHeaders) {
                    // Success
                    $scope.addAlert('Successfully updated the insurance policy revision.', 'success');
                    ControllerInfoPasser.put('selectedInsurancePolicy', policyData.insurancePolicy);
                    $scope.changeMiddleSectionTo($scope.insurancePolicyViewPartial);

                }, function (ignoreHttpResponse) {
                    // Error
                    errorPersisting();
                    $scope.addAlert('There was an error updating the insurance policy revision!', 'danger');
                });

            } else {
                errorPersisting();
                $scope.addAlert('Invalid input. Please check the form fields', 'warning');
            }
        };

        $scope.deleteRevision = function() {
            if (angular.isDefined($scope.policyRevision) && angular.isDefined($scope.policyRevision.id)) {
                InsurancePolicyRevisionService.delete({id: $scope.policyRevision.id}, function (ignoreData, ignoreResponseHeaders) {
                    // Success
                    $scope.addAlert('Successfully deleted the insurance policy revision.', 'success');
                    ControllerInfoPasser.put('selectedInsurancePolicy', $scope.policy);
                    $scope.changeMiddleSectionTo($scope.insurancePolicyViewPartial);

                }, function (ignoreHttpResponse) {
                    // Error
                    errorPersisting();
                    $scope.addAlert('There was an error creating the insurance policy!', 'danger');
                });
            } else {
                $scope.addAlert('Cannot delete an invalid revision, please check the the revision ID is correct and that the revision is defined.', 'warning');
            }
        };

        $scope.assignContactAsInsurer = function (suggestion) {
            if ($scope.determineIfContactNameIsValid(suggestion) === false) {
                var contact = $scope.searchArrayForProperty($scope.businessContactsForInsurer, 'name', suggestion)[0];
                $scope.policy['primaryInsurer'] = contact;
            } else {
                $scope.insurerNotFound = true;
            }
        };

        $scope.assignContactAsBroker = function (suggestion) {
            if ($scope.determineIfContactNameIsValid(suggestion) === false) {
                var contact = $scope.searchArrayForProperty($scope.businessContactsForBroker, 'name', suggestion)[0];
                $scope.policyRevision['broker'] = contact;
            } else {
                $scope.brokerNotFound = true;
            }
        };

        $scope.assignContactAsInsured = function (suggestion) {
            var contact = $scope.searchArrayForProperty($scope.businessContactsForInsured, 'name', suggestion)[0];
            $scope.insuredList[indexOfInsured] = contact;
            $scope.insuredList[indexOfInsured].edit = true;
        };

        $scope.assignContactAsOwner = function (suggestion) {
            var contact = $scope.searchArrayForProperty($scope.businessContactsForPropertyOwners, 'name', suggestion)[0];
            $scope.propertyOwnersList[indexOfOwner] = contact;
            $scope.propertyOwnersList[indexOfOwner].edit = true;
        };

        $scope.determineIfContactNameIsNotFound = function(name) {
            return ($.inArray(name, $scope.businessContactNames) > -1);
        };

        $scope.loadInsuredList = function () {
            $scope.insuredList.length = 0;
            if (angular.isDefined($scope.policy.insured)) {
                $scope.insuredList = angular.copy($scope.policy.insured);
            }

            for (var x = 0; x < $scope.insuredList.length; x++) {
                $scope.insuredList[x]['edit'] = false;
            }
        };

        $scope.cancelEditInsured = function (insured, index) {
            if (angular.isDefined(originalInsured)) {
                insured = angular.copy(originalInsured);
                insured.edit = false;
                $scope.insuredList[index] = angular.copy(insured);
                originalInsured = undefined;
            } else {
                $scope.insuredList.pop();
            }

            indexOfInsured = -1;
        };

        $scope.cancelEditOwner = function (owner, index) {
            if (angular.isDefined(originalOwner)) {
                owner = angular.copy(originalOwner);
                owner.edit = false;
                $scope.propertyOwnersList[index] = angular.copy(owner);
                originalOwner = undefined;
            } else {
                $scope.propertyOwnersList.pop();
            }

            indexOfOwner = -1;
        };

        $scope.loadAllInsurancePolicyTerms = function(policyID) {
            if (angular.isDefined(policyID)) {
                InsuranceService.findByInsurancePolicyId({policyid: policyID}, function (value, responseHeaders) {
                    // Success
                    $scope.insurancePolicyRevisions = undefined;
                    $scope.insurancePolicyRevisions = value;

                }, function (httpResponse) {
                    // Error
                    switch (httpResponse.status) {
                        case 405:
                            $scope.addAlert('Insurance policy terms cannot be loaded, policy id is not recognized..', 'warning');
                            break;

                        default:
                            $scope.addAlert('Oops! there was an problem loading all terms for this insurance policy..', 'danger');
                            break;
                    }
                });
            }
        };

        $scope.editInsured = function (insured, index) {
            if (indexOfInsured > -1) {
                $scope.cancelEditInsured({}, indexOfInsured);
            }

            insured.edit = true;
            originalInsured = angular.copy(insured);
            indexOfInsured = index;
        };

        $scope.editOwner = function (owner, index) {
            if (indexOfOwner > -1) {
                $scope.cancelEditOwner({}, indexOfOwner);
            }

            owner.edit = true;
            originalOwner = angular.copy(owner);
            indexOfOwner = index;
        };

        $scope.$on('event:persistInsuranceRecord', function () {
            $scope.selectedInsuranceMenuItem = ControllerInfoPasser.get('selectedInsuranceMenuItem');
            if ($scope.nextAction == 'Save') {
                $scope.submitInsurancePolicy();
            } else {
                if ($scope.nextAction == 'Update') {
                    $scope.updateRecord();
                }
            }
        });

        $scope.$on('event:resetRecord', function () {
            $scope.clearFormObject();
        });

        $scope.cancelInputtingPolicyRevision = function() {
            ControllerInfoPasser.put('selectedInsurancePolicy', $scope.policy);
            $scope.changeMiddleSectionTo($scope.insurancePolicyViewPartial);
        };

        $scope.$on($scope.deletePolicyRevisionEventString, function() {
            $scope.deleteRevision();
        });

        $scope.loadDropboxes(['insurancePolicyTypes']);
        $scope.getAllBusinessContacts();

    }])
    .controller('TaskPriorityFormCtrl', ['$scope', '$http', 'ControllerInfoPasser', 'InsuranceService', function ($scope, $http, ControllerInfoPasser, InsuranceService) {
        $scope.hideMainCRUD();

        $scope.clearFormObject = function () {
            $scope.refreshPropertyInfo();
            if ($scope.form) {
                $scope.clearForm($scope.form, $scope.record);
            }

            if (ControllerInfoPasser.get('selectedRecord')) {
                var selectedRecord = ControllerInfoPasser.get('selectedRecord');
                $scope.record = {};
                $scope.record = selectedRecord;
                ControllerInfoPasser.clear('selectedRecord');
                $scope.action = 'Edit';
            } else {
                if ($scope.nextAction != null) {
                    InsuranceService.createInsuranceRecord({servicePath: $scope.selectedInsuranceMenuItem.id}, function (value, responseHeaders) {
                        // Success
                        $scope.record = value;
                    }, function (httpResponse) {
                        $scope.addAlert('There was an error initializing the form!', 'danger', 10000);
                    });
                    $scope.action = 'Add';
                }
            }
        };

        $scope.successCRUDCallback = function (action) {
            $scope.nextAction = null;
            $scope.action = action;
            $scope.clearFormObject();
            $scope.changeMenuItem($scope.selectedInsuranceMenuItem);
        };

        $scope.submitRecord = function () {
            if ($scope.form.$valid) {
                InsuranceService.addInsuranceRecord({servicePath: $scope.selectedInsuranceMenuItem.id}, $scope.record, function (value, responseHeaders) {
                    // Success
                    $scope.addAlert('Successfully saved insurance record.', 'success', 10000);
                    $scope.successCRUDCallback('Saved');
                }, function (httpResponse) {
                    // Error
                    errorPersisting();
                    $scope.addAlert('There was an error saving the record!', 'danger', 10000);
                });
            } else {
                errorPersisting();
                $scope.addAlert('Invalid input. Please check the form fields', 'warning', 10000);
            }
        };

        $scope.updateRecord = function () {
            if ($scope.form.$valid) {
                InsuranceService.updateInsuranceRecord({servicePath: $scope.selectedInsuranceMenuItem.id}, $scope.record, function (value, responseHeaders) {
                    // Success
                    $scope.addAlert('Successfully updated insurance record.', 'success', 10000);
                    $scope.successCRUDCallback('Saved');
                }, function (httpResponse) {
                    // Error
                    errorPersisting();
                    $scope.addAlert('There was an error updating the record!', 'danger', 10000);
                });
            } else {
                errorPersisting();
                $scope.addAlert('Invalid input. Please check the form fields', 'warning', 10000);
            }
        };

        $scope.deleteTaskPriority = function () {
            $scope.deletingTaskPriority = true;
            $scope.persisting = true;

            InsuranceService.deleteInsuranceRecord({
                servicePath: $scope.selectedInsuranceMenuItem.id,
                id: $scope.record.id
            }, function () {
                $scope.deletingTaskPriority = false;
                $scope.persisting = false;
                // Success
                $('#deleteTaskPriorityModal').modal('hide');
                $scope.successCRUDCallback('Deleted');
                $scope.addAlert('Successfully deleted the task priority', 'success', 10000);
                $scope.hideModalAndClearCSS('#deleteTaskPriorityModal');
            }, function (httpResponse) {
                $scope.deletingTaskPriority = false;
                $scope.persisting = false;

                // Error
                errorPersisting();
                switch (httpResponse.status) {
                    case 417:
                        $scope.displayMessageInElement('.modal-error', 'The record cannot be deleted because it is being used as a value in an existing insurance record', 5000);
                        break;
                    case 304:
                        $scope.displayMessageInElement('.modal-error', 'The record to be deleted does not exist anymore', 5000);
                        break;
                    default:
                        $scope.displayMessageInElement('.modal-error', 'There was an error deleting the record!', 5000);
                        break;
                }
            });
        };

        $scope.$on('event:persistInsuranceRecord', function () {
            $scope.selectedInsuranceMenuItem = ControllerInfoPasser.get("selectedInsuranceMenuItem");
            if ($scope.nextAction == 'Save') {
                $scope.submitRecord();
            } else {
                if ($scope.nextAction == 'Update') {
                    $scope.updateRecord();
                }
            }

        });

        $scope.$on('event:deleteInsuranceRecord', function () {
            $scope.persisting = false;
            $scope.selectedInsuranceMenuItem = ControllerInfoPasser.get("selectedInsuranceMenuItem");
            $('#deleteTaskPriorityModal').modal('show');
        });

        $scope.$on('event:resetRecord', function () {
            $scope.clearFormObject();
        });

        var errorPersisting = function () {
            ControllerInfoPasser.broadcast('event:errorPersisting');
        };

        var initializeTaskPrioritiesInput = function () {
            $scope.loadDropboxes(['module', 'recurrenceType'], $scope.clearFormObject);
        };

        initializeTaskPrioritiesInput();

    }])
    .controller('InsuranceTasksCtrl', ['$scope', 'InsuranceTasksService', 'ControllerInfoPasser', 'contextPath', '$http', function ($scope, InsuranceTasksService, ControllerInfoPasser, contextPath, $http) {
        $scope.InsuranceTasksCtrl = {
            persisting: false
        };

        $scope.currentPage = 0;
        $scope.itemsPerPage = 10;
        $scope.tasks = [];
        $scope.closedFilter = 'NOT_CLOSED';
        $scope.inputting = false;
        $scope.isEditing = false;

        $scope.systemHasNoRolesForInsurance = false;
        $scope.extractionModalToDueDate = $scope.toDueDateForExtraction;
        $scope.extractionModalFromDueDate = $scope.fromDueDateForExtraction;
        $scope.changeInsuranceDueDateValue = undefined;
        $scope.changeInsuranceDueDateReason = undefined;

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, category) {
            $scope.refreshTaskList();
        });

        $scope.$on('event:fileUploadRejected', function (event, message) {
            $scope.addAlert(message, 'warning');
        });

        $scope.determineIfSystemHasNoRolesForInsurance = function() {
            $http({
                method: 'GET',
                url: contextPath + '/webapi/roles',
                params: {names: false}
            }).success(function (data, status, headers, config) {
                var roles = data;
                $scope.systemHasNoRolesForInsurance = true;

                for (var x = 0; x < roles.length; x++) {
                    if (roles[x].isSelectedForInsurance == true) {
                        $scope.systemHasNoRolesForInsurance = false;
                        break;
                    }
                }
            });
        };

        $scope.determineIfSystemHasNoRolesForInsurance();

        $scope.refreshTaskList = function () {
            $scope.tasks.length = 0;
            $scope.loading = true;

            if ($scope.closedFilter === $scope.recordStatusEnums.DELETED) {
                InsuranceTasksService.queryDeleted({propertyNumber: $scope.currentProperty.propertyNumber}, function (data) {
                    $scope.tasks = data;
                }).$promise.then(function () {
                        $scope.loading = false;
                    });

            } else {
                if ($scope.closedFilter == $scope.taskStatusEnum.CLOSED) {
                    InsuranceTasksService.queryClosed({propertyNumber: $scope.currentProperty.propertyNumber}, function (data) {
                        $scope.tasks = data;
                    }).$promise.then(function () {
                            $scope.loading = false;
                        });

                } else {
                    InsuranceTasksService.query({propertyNumber: $scope.currentProperty.propertyNumber}, function (data) {
                        if (ControllerInfoPasser.get('selectedTask')) {
                            $scope.editTask(ControllerInfoPasser.get('selectedTask'));
                        } else {
                            $scope.tasks = data;
                        }

                    }).$promise.then(function () {
                            $scope.loading = false;
                        });
                }
            }
        };

        $scope.submitTask = function () {
            $scope.InsuranceTasksCtrl.persisting = true;
            ControllerInfoPasser.broadcast('event:persistInsuranceTask');
        };

        $scope.editTask = function (task) {
            $scope.inputting = true;
            $scope.isEditing = true;
            $scope.taskToSubmit = undefined;

            // This variable is only local for this module (Insurance Module)
            $scope.currentUserAssignedToInsuranceTask = $scope.isCurrentUserAssignedToInsuranceTask();

            // $scope.persisting = true;
            ControllerInfoPasser.broadcast('event:editInsuranceTask', task);
        };

        $scope.createTask = function () {
            $scope.inputting = true;
            $scope.isEditing = false;
            ControllerInfoPasser.broadcast('event:createInsuranceTask');
        };

        $scope.$on('event:finishedInputting', function () {
            $scope.inputting = false;
            $scope.isEditing = false;
            $scope.InsuranceTasksCtrl.persisting = false;
            $scope.refreshTaskList();
        });

        $scope.deleteTask = function () {
            $scope.InsuranceTasksCtrl.persisting = true;
            ControllerInfoPasser.broadcast('event:deleteInsuranceTask');
        };

        $scope.cancel = function () {
            ControllerInfoPasser.broadcast('event:cancelInputting');
        };

        $scope.$on('event:taskLoaded', function (event, task) {
            $scope.taskToSubmit = task;
        });


        $scope.refreshTaskList();

        $scope.recoverDeletedTask = function () {
            InsuranceTasksService.recoverDeletedTask({id: $scope.taskToSubmit.id}, function (data) {
                ControllerInfoPasser.broadcast("event:recoveredDeletedTask", data);
                $scope.taskToSubmit = data;

            }, function (httpResponse) {
                $scope.addAlert('An error has occurred while trying to recover already deleted insurance task!', 'danger', 5000);

            });
        };


        $scope.startTask = function () {
            InsuranceTasksService.startTask({id: $scope.taskToSubmit.id}, function (data) {
                ControllerInfoPasser.broadcast("event:changeTaskStatus", data);
                $scope.taskToSubmit = data;
            }, changeTaskStatusError);
        };

        $scope.closeTask = function () {
            $scope.InsuranceTasksCtrl.persisting = true;
            ControllerInfoPasser.broadcast("event:closeInsuranceTask");
        };

        $scope.onTaskCloseSuccess = function (task) {
            $scope.taskToSubmit = task;
            $scope.InsuranceTasksCtrl.persisting = false;
        };

        $scope.reopenTask = function () {
            InsuranceTasksService.reopenTask({id: $scope.taskToSubmit.id}, function (data) {
                ControllerInfoPasser.broadcast("event:changeTaskStatus", data);
                $scope.taskToSubmit = data;
            }, changeTaskStatusError);
        };

        $scope.isDueDateChangeAllowed = function () {
            if (angular.isDefined($scope.taskToSubmit)) {
                if (angular.isDefined($scope.taskToSubmit.id)) {
                    if ($scope.taskToSubmit.recordStatus == $scope.recordStatusEnums.DELETED) {
                        return false;
                    }

                    if ($scope.taskToSubmit.status === $scope.taskStatusEnum.CLOSED) {
                        return false;
                    }

                    if (!$scope.isTaskCreatorOrAdmin()) {
                        if ($scope.hasWriteAccess($scope.insuranceTaskDueDateEditAccessType)) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }

                } else {
                    return false;
                }
            }
        };

        $scope.clearChangeInsuranceDueDate = function () {
            $scope.changeInsuranceDueDateValue = undefined;
            $scope.changeInsuranceDueDateReason = undefined;
        };

        $scope.applyOriginalInsuranceDueDateChange = function () {
            $scope.taskToSubmit.dueDate = $scope.changeInsuranceDueDateValue;
            $scope.taskToSubmit.pastDueWarningDate = $scope.changeInsuranceDueDateValue;
            $scope.taskToSubmit.reasonForOriginalDateChange = $scope.changeInsuranceDueDateReason;
        };

        $scope.isTaskCreatorOrAdmin = function () {
            if (angular.isDefined($scope.taskToSubmit)) {
                if (angular.isDefined($scope.taskToSubmit.id)) {
                    var isAdmin = ControllerInfoPasser.get('isAdmin');
                    if (isAdmin || $scope.taskToSubmit.createdBy == $scope.getCurrentUser().userProfile.username) {
                        return true;
                    }

                    return false;

                } else {
                    return true;
                }
            }
        };


        var changeTaskStatusError = function (httpResponse) {
            switch (httpResponse.status) {
                case 304:
                    $scope.addAlert('The task could not be modified, there is a recurring task with a non closed state', 'warning', 5000);
                    break;
                case 406:
                    $('#noAttachmentModal').modal('show');
                    break;
                default:
                    $scope.addAlert('An error has occurred while trying to reopen this task!', 'danger', 5000);
                    break;
            }
        };

        $scope.next = function () {
            if ($scope.currentPage >= $scope.filtered.length / $scope.itemsPerPage - 1) {
                return;
            } else {
                $scope.currentPage += 1;
            }
        };

        $scope.previous = function () {
            if ($scope.currentPage == 0) {
                return;
            } else {
                $scope.currentPage -= 1;
            }
        };

        $scope.last = function () {
            $scope.currentPage = Math.floor($scope.filtered.length / $scope.itemsPerPage) - 1;

            if ($scope.currentPage < 0) {
                $scope.currentPage = 0;
            }
        };

        $scope.first = function () {
            $scope.currentPage = 0;
        };

        $scope.callExtractionEventHandler = function(form) {
            var extractionEventData = {
                fromDueDate: $scope.extractionModalFromDueDate,
                toDueDate: $scope.extractionModalToDueDate,
                form: form
            };

            ControllerInfoPasser.broadcast($scope.insuranceTaskExcelExtractEventCode, extractionEventData);
        };
    }])
    .controller('InsuranceTaskInputCtrl', ['$scope', 'InsuranceTasksService', 'PropertyLookup', 'InsuranceRecommendationService', 'ControllerInfoPasser', '$http', 'contextPath', 'ProfileService', 'InsuranceService', 'RoleService', function ($scope, InsuranceTasksService, PropertyLookup, InsuranceRecommendationService, ControllerInfoPasser, $http, contextPath, ProfileService, InsuranceService, RoleService) {
        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function () {
            finishInput();
        });

        var user = $scope.getCurrentUser();

        $scope.roles = [];
        $scope.forms = {};

        $scope.NO_CONDITIONAL_LIMITATIONS = "None";

        $scope.selectedProperties = [];
        $scope.selectedRecommendation = [];
        $scope.tenants = [];
        $scope.selectedUsers = [];
        $scope.taskPriorities = [];
        $scope.assignedRoles = [];


        // Assigned To
        $scope.selectedAssignableRoles = [];
        $scope.userroles = $scope.getProfileRoles(user.userProfile);
        $scope.username = user.userProfile.username;
        $scope.canEditAssignedTo = false;


        $scope.enableTaskEditing = function (task){
            // Enable Assigned To input if user is admin or creator of task
            if( $scope.isCurrentUserAssignedToInsuranceTask() && $scope.hasInsuranceAdminPermission ){
                $scope.canEditAssignedTo = true;
            }
        };

        var spinnerTarget = document.getElementById('dueDateSpinner');
        var opts = {
            lines: 10, // The number of lines to draw
            length: 3, // The length of each line
            width: 2, // The line thickness
            radius: 5 // The radius of the inner circle
        };
        var spinner = new Spinner(opts);

        ProfileService.query({}, function (data) {
            $scope.users = data;
        }, function () {
            $scope.addAlert('An error has occurred getting a list of users!', 'danger');
        });


        RoleService.query({}, function (data) {
            $scope.roles = data;
        }, function () {
            $scope.addAlert('An error has occurred getting a list of roles!', 'danger');
        });



        var attachmentRequirementsMet = function () {
            var recommendation = $scope.taskToSubmit.recommendation;
            if (angular.isDefined(recommendation) && angular.isDefined(recommendation.attachmentsRequired)) {
                if (recommendation.attachmentsRequired === true) {
                    return $scope.taskToSubmit.attachments.length > 0;

                }

                if ($scope.taskToSubmit.conditionalLimitation === $scope.NO_CONDITIONAL_LIMITATIONS ||
                    angular.isUndefined($scope.taskToSubmit.conditionalLimitation)) {
                    if (angular.isDefined(recommendation.attachmentRequiredWithoutConditionalLimitation)) {
                        if (recommendation.attachmentRequiredWithoutConditionalLimitation === true) {
                            return $scope.taskToSubmit.attachments.length > 0;

                        }

                        return true;
                    }

                } else {
                    if (angular.isDefined(recommendation.attachmentRequiredWithConditionalLimitation)) {
                        if (recommendation.attachmentRequiredWithConditionalLimitation === true) {
                            return $scope.taskToSubmit.attachments.length > 0;

                        }

                        return true;
                    }
                }
            }

            return true;
        };

        var closeTask = function () {
            if (attachmentRequirementsMet()) {
                InsuranceTasksService.closeTask({id: $scope.taskToSubmit.id}, function (data, headers) {
                    $scope.taskToSubmit = data;
                    $scope.attachments = $scope.taskToSubmit.attachments;
                    $scope.onTaskCloseSuccess($scope.taskToSubmit);

                    if ($scope.taskToSubmit.recurrenceTaskId) {
                        $scope.addAlert('Successfully closed task ' + $scope.taskToSubmit.title + '. The next recurring task was created automatically. The rescheduled task is due on ' + new Date(data.nextDueDate).toDateString(), 'success');

                    } else {
                        $scope.addAlert('Successfully closed task ' + $scope.taskToSubmit.title + '.', 'success');
                    }

                }, function (httpResponse) {
                    switch (httpResponse.status) {
                        case 304:
                            $scope.addAlert('The task could not be modified, there is a recurring task with a non closed state', 'warning', 5000);
                            break;
                        case 406:
                            $('#noAttachmentModal').modal('show');
                            break;
                        default:
                            $scope.addAlert('An error has occurred while trying to close this task!', 'danger', 5000);
                            break;
                    }
                });
            } else {
                $scope.InsuranceTasksCtrl.persisting = false
                $('#noAttachmentModal').modal('show');
            }

        };

        var invokeCloseTask = function () {
            if (newCommentExists()) {
                createNewComment().then(function () {
                    if (isFormValid()) {
                        updateTask().then(function () {
                            closeTask();
                        });
                    } else {
                        showFormError();
                    }
                });
            } else {
                if (isFormValid()) {
                    updateTask().then(function () {
                        closeTask();
                    });
                } else {
                    showFormError();
                }
            }
        };

        $scope.createOrEditRecord = function (task) {
            //$scope.enableTaskEditing(task)
            $scope.changeStatusDisabled = true;
            $scope.changeAssignedUsersDisabled = true;
            $scope.changeDueDateDisabled = true;
            $scope.newComment = {
                comment: ''
            };

            InsuranceRecommendationService.query(function (data) {
                $scope.recommendations = data;
                $scope.populateForm(task);
            });

        };

        var populateAssignedRoles = function() {
            $scope.assignedRoles.length = 0;

            angular.forEach($scope.taskToSubmit.tags, function (tag) {
                if (tag.type === $scope.taskTagTypes.ASSIGNED_TO) {
                    $scope.assignedRoles = $scope.assignedRoles.concat($scope.roles.filter(function (role) {
                        return role.roleName === tag.value;
                    }));
                }
            });
        };

        $scope.populateForm = function (task) {
            if (angular.isUndefined(task)) {
                task = ControllerInfoPasser.get('selectedTask'); // Check if this exists, else leave undefined
            }

            $scope.selectedUsers.length = 0;

            if (angular.isDefined(task)) { // Edit
                $scope.taskToSubmit = task;
                $scope.selectedRecommendation.push($scope.taskToSubmit.recommendation);
                ControllerInfoPasser.broadcast('event:taskLoaded', $scope.taskToSubmit);
                $scope.attachments = task.attachments;
                processNotifyOnCloseTagsOnLoad();

                //Addigned To
                $scope.processAssignedToOnLoad();
                $scope.enableTaskEditing(task);

                populateAssignedRoles();
            } else { // Create
                InsuranceTasksService.getNewTask({
                    propertyNumber: $scope.currentProperty.propertyNumber
                }, function (data, headers) {
                    $scope.taskToSubmit = data;
                    ControllerInfoPasser.broadcast('event:taskLoaded', $scope.taskToSubmit);
                    $scope.attachments = $scope.taskToSubmit.attachments;
                    populateAssignedRoles();

                }, function (httpResponse) {
                    switch (httpResponse.status) {
                        case 417:
                            if ($scope.currentUserHaveAdminPermissionToModule($scope.moduleEnums.insurance)) {
                                $scope.addAlert('Creating insurance tasks has been disabled because there are no roles assigned. Use the insurance section in the Administration menu to configure the roles to assign.', 'warning', 10000);
                            }
                            break;
                        default:
                            $scope.addAlert('An error has occurred trying to determine the roles to assign to insurance tasks!', 'danger', 10000);
                    }
                });
                //Assigned To
                $scope.processAssignedToOnCreate();
            }
            $scope.getTenantList();
            ControllerInfoPasser.clear('selectedTask');
        };

        var createNewComment = function () {
            return InsuranceTasksService.createNewComment({}, function (data, headers) {
                // Success
                data.comment = $scope.newComment.comment;
                $scope.taskToSubmit.comments.push(data);
                $scope.newComment.comment = "";

            }, function (httpResponse) {
                // Error
            }).$promise;
        };

        var newCommentExists = function () {
            if ($scope.newComment) {
                if ($scope.newComment.comment != "" && $scope.newComment.comment != undefined) {
                    return true;
                }
                return false;
            }

            return false;
        };

        var invokeUpdateTask = function () {
            if (newCommentExists()) {
                createNewComment().then(function () {
                    if (isFormValid()) {
                        updateTask().then(function () {
                            finishInput();
                        });
                    } else {
                        showFormError();
                    }
                });
            } else {
                if (isFormValid()) {
                    updateTask().then(function () {
                        finishInput();
                    });
                } else {
                    showFormError();
                }
            }
        };

        $scope.hasAssignedRolesRequirement = function() {
            if ($scope.assignedRoles.length > 0) {
                return true;
            }

            return false;
        };

        var invokeCreateTask = function () {
            if ($scope.hasAssignedRolesRequirement() === false) {
                showFormError();
                return;
            }

            if (isFormValid()) {
                if (newCommentExists()) {
                    createNewComment().then(function () {
                        createTask();
                    });
                } else {
                    createTask();
                }
            } else {
                showFormError();
            }
        };

        $scope.$on("event:persistInsuranceTask", function () {
            if ($scope.taskToSubmit.id) {
                invokeUpdateTask();

            } else {
                invokeCreateTask();

            }
        });

        $scope.processAssignedToForSaving = function () {
            $scope.taskToSubmit.tags = $scope.taskToSubmit.tags.filter(function (tag) {
                return tag.type !== $scope.taskTagTypes.ASSIGNED_TO;
            });

            angular.forEach($scope.selectedAssignableRoles, function (role) {
                $scope.taskToSubmit.tags.push({
                    type: $scope.taskTagTypes.ASSIGNED_TO,
                    value: role
                });
            });
        };

        $scope.processAssignedToOnCreate = function () {
            $scope.selectedAssignableRoles.length = 0;
            angular.forEach($scope.insuranceTaskAssignmentRoleNames, function (name) {
                $scope.selectedAssignableRoles.push(name);
            });
        };

        $scope.processAssignedToOnLoad = function () {
            $scope.selectedAssignableRoles.length = 0;
            angular.forEach($scope.taskToSubmit.tags, function (tag) {
                if (tag.type === $scope.taskTagTypes.ASSIGNED_TO) {
                    $scope.selectedAssignableRoles.push(tag.value);
                }
            });
        };

        var processNotifyOnCloseTagsForSaving = function () {
            $scope.taskToSubmit.tags = $scope.taskToSubmit.tags.filter(function (tag) {
                return tag.type !== $scope.taskTagTypes.NOTIFY_ON_CLOSE;
            });

            angular.forEach($scope.selectedUsers, function (user) {
                $scope.taskToSubmit.tags.push({
                    type: $scope.taskTagTypes.NOTIFY_ON_CLOSE,
                    value: user.userProfile.username
                });
            });
        };

        var processRolesAssignedTagsForSaving = function () {
            $scope.taskToSubmit.tags = $scope.taskToSubmit.tags.filter(function (tag) {
                return tag.type !== $scope.taskTagTypes.ASSIGNED_TO;
            });

            angular.forEach($scope.assignedRoles, function (role) {
                $scope.taskToSubmit.tags.push({
                    type: $scope.taskTagTypes.ASSIGNED_TO,
                    value: role.roleName
                });
            });
        };

        var processNotifyOnCloseTagsOnLoad = function () {
            angular.forEach($scope.taskToSubmit.tags, function (tag) {
                if (tag.type === $scope.taskTagTypes.NOTIFY_ON_CLOSE) {
                    $scope.selectedUsers = $scope.selectedUsers.concat($scope.users.filter(function (userprofile) {
                        return userprofile.userProfile.username === tag.value;
                    }));
                }
            });
        };

        var createTask = function () {
            processNotifyOnCloseTagsForSaving();
            $scope.processAssignedToForSaving();
            $scope.taskToSubmit.assignedTo = $scope.selectedAssignableRoles.join(", ");
            processRolesAssignedTagsForSaving();
            $scope.taskToSubmit.recommendation = $scope.selectedRecommendation[0];
            $($scope.selectedProperties).each(function (index, entry) {
                $scope.taskToSubmit.tags.push({type: $scope.taskTagTypes.PROPERTY, value: entry.name});
            });
            $scope.taskToSubmit.attachments = $scope.attachments;
            return InsuranceTasksService.save($scope.taskToSubmit, function () {
                finishInput();
            }, function () {
                $scope.InsuranceTasksCtrl.persisting = false
            }).$promise;
        };

        var showFormError = function () {
            $scope.InsuranceTasksCtrl.persisting = false

            if ($scope.forms.taskForm.$error.required || !$scope.selectedRecommendation[0]) {
                $scope.addAlert('A missing field is required, please fill in all required fields', 'warning', 3000);
            } else {
                if ($scope.forms.taskForm.$error.pattern) {
                    $scope.addAlert('Invalid input was detected on one of the fields', 'warning', 3000);
                }
            }

            if ($scope.hasAssignedRolesRequirement() === false) {
                $scope.addAlert('Please assign at least one user role to the task.', 'warning', 3000);
            }
        };

        var isFormValid = function () {
            if ($scope.hasAssignedRolesRequirement() === false) {
                return false;
            }

            if ($scope.forms.taskForm.$valid && $scope.selectedRecommendation.length > 0) {
                return true;
            }

            return false;
        };

        var updateTask = function () {
            if ($scope.hasAssignedRolesRequirement() === false) {
                showFormError();
                return;
            }

            processRolesAssignedTagsForSaving();
            processNotifyOnCloseTagsForSaving();
            $scope.processAssignedToForSaving();
            $scope.taskToSubmit.assignedTo = $scope.selectedAssignableRoles.join(", ");
            $scope.taskToSubmit.attachments = $scope.attachments;
            return InsuranceTasksService.update($scope.taskToSubmit, function () {
                $scope.newComment.comment = "";
            }, function () {
                $scope.InsuranceTasksCtrl.persisting = false
            }).$promise;
        };

        var deleteTask = function () {
            InsuranceTasksService.delete({id: $scope.taskToSubmit.id}, function () {
                finishInput();
            }, function () {
                $scope.InsuranceTasksCtrl.persisting = false
            });
        };
        $scope.$on("event:editInsuranceTask", function (event, task) {
            $scope.createOrEditRecord(task);
        });

        $scope.$on("event:createInsuranceTask", function () {
            $scope.createOrEditRecord();
        });

        $scope.$on("event:deleteInsuranceTask", function () {
            deleteTask();
        });

        $scope.$on("event:cancelInputting", function () {
            finishInput();
        });

        $scope.$on("event:changeTaskStatus", function (event, task) {
            $scope.taskToSubmit = task;
        });

        $scope.$on("event:recoveredDeletedTask", function (event, task) {
            $scope.taskToSubmit = task;
        });

        $scope.$on("event:closeInsuranceTask", function () {
            invokeCloseTask();
        });

        var finishInput = function () {
            $scope.selectedProperties.length = 0;
            $scope.selectedRecommendation.length = 0;
            $scope.selectedAssignableRoles.length = 0;
            $scope.taskToSubmit = undefined;
            $scope.closeAlert(0, 0);
            ControllerInfoPasser.broadcast('event:finishedInputting');
        };

        $scope.isSelectedRecommendationNonRecurring = function() {
            var singleRecommendationIndex = 0;
            if (angular.isDefined($scope.selectedRecommendation[singleRecommendationIndex])) {
                if ($scope.selectedRecommendation[singleRecommendationIndex].isNonRecurring === true) {
                    return true;

                }
            }

            return false;
        };

        $scope.setRecommendationFields = function () {
            // Values defaulted to recommendation data, user is allowed to modify afterwards
            var singleRecommendationIndex = 0;
            var priority = $scope.selectedRecommendation[singleRecommendationIndex].taskPriority;

            if (priority) {
                var dueDateRefresh = $scope.taskToSubmit.recurrenceType != priority.recurrenceType;
                $scope.taskToSubmit.priority = priority.priorityName;
                $scope.taskToSubmit.recurrenceType = priority.recurrenceType;


                if (dueDateRefresh) {
                    $scope.getDueDateFromServer($scope.taskToSubmit.recurrenceType, $scope.taskToSubmit.recurrenceInterval, 'dueDate');
                    $scope.getDueDateFromServer('DAILY', priority.daysBeforePastDueReminder, 'pastDueWarningDate');
                }
            } else {
                $scope.taskToSubmit.priority = undefined;
                $scope.taskToSubmit.recurrenceType = undefined;
                $scope.taskToSubmit.recurrenceInterval = undefined;
            }

            if ($scope.isSelectedRecommendationNonRecurring() == true) {
                $scope.taskToSubmit.recurrenceType = "NONE";
                $scope.taskToSubmit.recurrenceInterval = 1;

            }
        };

        $scope.getDueDateFromServer = function (recurrence, interval, field) {
            if (recurrence && interval) { // undefined is passed in if the input doesn't match ng-pattern
                spinner.spin(spinnerTarget);
                InsuranceTasksService.getDueDate({
                    recurrence: recurrence,
                    interval: interval,
                    date: new Date().getTime()
                }, function (data, headers) {
                    spinner.stop();
                    $scope.taskToSubmit[field] = new Date(data.date);
                });
            }
        };

        $scope.isTaskClosed = function () {
            if ($scope.taskToSubmit) {
                return $scope.taskToSubmit.status == $scope.taskStatusEnum.CLOSED;
            } else {
                return false;
            }
        };

        $scope.getTenantList = function () {
            $scope.tenants.length = 0;
            $http.get(contextPath + '/webapi/properties/' + $scope.currentProperty.propertyNumber + "/tenants")
                .success(function (data) {
                    $scope.tenants = data;

                    if (angular.isDefined($scope.taskToSubmit) && angular.isDefined($scope.taskToSubmit.tenant)) {
                        var taskTenant = $scope.taskToSubmit.tenant.trim();
                        if (taskTenant.length > 0 && $scope.tenants.indexOf(taskTenant) < 0) {
                            $scope.tenants.unshift($scope.taskToSubmit.tenant);
                        }
                    }
                });
        };

        $scope.$on('event:localAttachmentOpen', function (event, attachment) {
            $scope.openInNewWindow('GET', contextPath + '/webapi/tasks/insurance/attachments/' + attachment.id, {}, '_blank');
        });

        $scope.newComment = {
            comment: ""
        };

        $scope.deleteTaskComment = function (taskCommentToDelete) {
            var index = $scope.taskToSubmit.comments.indexOf(taskCommentToDelete);
            $scope.taskToSubmit.comments.splice(index, 1);
        };

        $scope.isCurrentUserCommentAuthor = function (authorId) {
            var user = $scope.getCurrentUser();
            if (user.id == authorId) {
                return true;
            } else {
                return false;
            }
        };

        $scope.isLastCommentInTheTask = function (taskComment) {
            var index = $scope.taskToSubmit.comments.indexOf(taskComment);
            if ($scope.taskToSubmit.comments.length == ( index + 1 )) {
                return true;
            } else {
                return false;
            }
        };

        $scope.updateNotifyOnCloseList = function () {
            if ($scope.taskToSubmit.notifyPeopleOnClose === false) {
                $scope.selectedUsers.length = 0;
                processNotifyOnCloseTagsForSaving();
            }
        };

        $scope.loadTaskPriorities = function () {
            $scope.taskPriorities.length = 0;
            InsuranceService.findInsuranceRecords({servicePath: 'taskpriority'}, function (data) {
                // Success
                $scope.taskPriorities = angular.copy(data);
            }, function (httpResponse) {
                // Error
                $scope.addAlert('There was an error loading task priorities!', 'danger');
            });
        };

        $scope.loadTaskPriorities();

        $scope.createOrEditRecord();

    }]);