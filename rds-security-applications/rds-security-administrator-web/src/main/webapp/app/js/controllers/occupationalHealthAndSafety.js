/**
 * Created by Januel on 10/02/14.
 */
angular.module('myApp.occupationalHealthAndSafetyControllers', [])
    .controller('OccupationalHealthAndSafetyCtrl', ['$rootScope', 'ControllerInfoPasser', '$scope', '$http', '$timeout', 'SelectedProperty', '$location', 'QuestionnaireService', '$uibModal', '$route', function ($rootScope, ControllerInfoPasser, $scope, $http, $timeout, SelectedProperty, $location, QuestionnaireService, $modal, $route) {

        $scope.$on('event:ohsRefresh', function () {
            $route.reload();
        });

        $scope.currentProperty = SelectedProperty.getSelectedProperty();

        if ($scope.ohsEnabled == false) {
            $location.url("/");
        }

        $scope.writeNotAllowed = !$scope.currentUserHaveWritePermissionToModule($scope.moduleEnums.ohs);

        $scope.refreshPropertyInfo = function () {
            $scope.currentProperty = SelectedProperty.getSelectedProperty();
        };

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, category) {
            $scope.refreshPropertyInfo();


            if ($scope.selection == 'yearlyQuestionnaire') {
                $scope.changeQuestionnaireName($scope.selectedQuestionnaireName, $scope.questionnaireSubTypes.YEARLY);

            } else {
                if ($scope.selection == 'monthlyQuestionnaire') {
                    $scope.changeQuestionnaireName($scope.selectedQuestionnaireName, 'MONTHLY');

                }
            }

        });

        $scope.refreshPropertyInfo();

        $scope.main = 'partials/ohs/occupationalHealthAndSafetyMain.html';
        $scope.yearlyQuestionnaire = 'partials/yearlyQuestionnaire.html';
        $scope.monthlyQuestionnaire = 'partials/yearlyQuestionnaire.html';
        $scope.checklistsSurvey = 'partials/checklists-surveys.html';
        $scope.propertyDetails = 'partials/propertyInformation/detailedPropertyInformation.html';

        $scope.selection = 'main';

        $scope.ohsSelectedTask = 'OhsSelectedTask';

        $scope.selectedYear = new Date().getFullYear();

        $scope.changeSelection = function (selection) {
            $scope.selection = selection;
        };

        $scope.goToPropertyDetail = function () {
            if ($scope.propertyAccess === $scope.moduleAccessTypes.RW) {
                $scope.changeSelection('propertyDetails');
            }
        };

        $scope.selectedQuestionnaireName = null;

        $scope.initSelectedQuestionnaireNameBasedOnSubType = function (questionnaireSubType) {
            if (questionnaireSubType == $scope.questionnaireSubTypes.YEARLY) {
                $scope.selectedQuestionnaireName = new Date().getFullYear() + "";
            } else {
                if ($scope.monthlyQuestionnaireList.length > 0) {
                    $scope.selectedQuestionnaireName = $scope.monthlyQuestionnaireList[0].questionnaireName;
                } else {
                    $scope.selectedQuestionnaireName = "";
                }

            }
        };

        $scope.changeQuestionnaireName = function (questionnaireName, questionnaireSubType) {
            // $scope.selectedYear = year;
            $scope.selectedQuestionnaireName = questionnaireName;
            $scope.selectedQuestionnaireSubType = questionnaireSubType;
            $scope.selectedQuestionnaireType = "OHS";
            ControllerInfoPasser.put("selectedQuestionnaireName", $scope.selectedQuestionnaireName);
            ControllerInfoPasser.put("selectedQuestionnaireSubType", $scope.selectedQuestionnaireSubType);
            ControllerInfoPasser.put("selectedQuestionnaireType", $scope.selectedQuestionnaireType);
            ControllerInfoPasser.broadcast("event:questionnaireNameChanged");
        };

        $scope.changeSelectedProperty = function (property) {
            SelectedProperty.setSelectedProperty(property);
            $scope.refreshPropertyInfo();
        };

        $scope.myProperties = ControllerInfoPasser.get('favorites');

        if (!$scope.currentProperty) {
            $location.url('/');
        }

        $scope.$on('event:gotoMainPage', function () {
            $scope.changeSelection('main');
        });

        $scope.$on('event:gotoQuestionnaire', function () {
            $scope.changeSelection('yearlyQuestionnaire');
        });

    }])
    .controller('OccupationalHealthAndSafetyMainCtrl', ['$rootScope', 'ControllerInfoPasser', '$scope', '$http', '$timeout', 'SelectedProperty', '$location', 'ComplianceService', function ($rootScope, ControllerInfoPasser, $scope, $http, $timeout, SelectedProperty, $location, ComplianceService) {

        $scope.currentProperty = SelectedProperty.getSelectedProperty();

        $scope.changeOhsDueDateValue = undefined;
        $scope.changeOhsDueDateReason = undefined;

        if (!$scope.currentProperty) {
            $location.url('/');
        }

        $http.get('json/ohsMenus.json').success(function (data) {
            $scope.items = data;
        });

        $scope.middleSection = 'partials/moduleLandingPropertyInfo.html';

        $scope.persisting = false;
        $scope.OHSTaskEdit = false;
        $scope.OHSTaskCreate = false;
        $scope.noWriteToTask = false;

        $scope.alerts = [];

        $scope.jumping = false;
        $scope.jumpToSection = ControllerInfoPasser.get('jumpToMenuItem');
        var backToQuestionnaire = ControllerInfoPasser.get('backToQuestionnaire');

        $scope.propertyInformationLink = {
            label: 'Property Information',
            type: 'menu',
            overviewPartialHTML: 'partials/moduleLandingPropertyInfo.html'
        };

        $scope.checklistSurveyLink = {
            label: 'Checklists/Surveys',
            type: 'menu',
            overviewPartialHTML: 'partials/checklists-surveys.html'
        };

        $scope.isOhsDueDateChangeAllowed = function () {
            if (angular.isDefined($scope.taskToSubmit)) {
                if (angular.isDefined($scope.taskToSubmit.id)) {
                    if ($scope.taskToSubmit.recordStatus == $scope.recordStatusEnums.DELETED) {
                        return false;
                    }

                    if ($scope.taskToSubmit.status === $scope.taskStatusEnum.CLOSED) {
                        return false;
                    }

                    if (!$scope.isTaskCreatorOrAdmin()) {
                        if ($scope.hasWriteAccess($scope.ohsTaskDueDateEditAccessType)) {
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

        $scope.clearChangeOhsDueDate = function () {
            $scope.changeOhsDueDateValue = undefined;
            $scope.changeOhsDueDateReason = undefined;
        };

        $scope.applyOriginalOhsDueDateChange = function () {
            $scope.taskToSubmit.dueDate = $scope.changeOhsDueDateValue;
            $scope.taskToSubmit.reasonForOriginalDateChange = $scope.changeOhsDueDateReason;
        };

        $scope.addAlert = function (msg, type) {
            if ($scope.alerts.length > 0) {
                $scope.alerts.splice(0, 1);
            }

            $scope.alerts.push({msg: msg, type: type});

            $timeout(function () {  // Close alert after 5000 ms (5s)
                $scope.closeAlert(0)
            }, 5000);
        };

        $scope.addNoTimeoutAlert = function (msg, type) {
            if ($scope.alerts.length > 0) {
                $scope.alerts.splice(0, 1);
            }

            $scope.alerts.push({msg: msg, type: type});
        };

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.removeAlert = function () {
            $scope.persisting = false;
            $scope.timeout(function () {
                $scope.alerts.splice(0, 1);
            }, 10000)
        };

        $scope.removeExternalMenuHighlights = function () {
            // Implement this if there are external menus aside from the menus in the angular tree view
        };

        $scope.isSelected = function (link) {
            $rootScope.$broadcast('event:externalMenuSelected', "");
            // Implement this if there are external menus aside from the menus in the angular tree view
            // This function is called by the external menu aside from the menus in the angular tree view
        };

        $scope.isViewingData = function () {
            if ($scope.middleSection != 'partials/moduleLandingPropertyInfo.html' && $scope.middleSection != 'partials/ohs/ohsCompliance.html' && $scope.middleSection != '' && $scope.action == "") {
                return true;
            } else {
                return false;
            }
        };

        $scope.changeMiddleSectionTo = function (section) {
            $scope.persisting = false;
            $scope.middleSection = section;
            if ($scope.middleSection == '') {
                $scope.ohsMenuItem = undefined;
            }
        };

        $scope.changeMenuItem = function (menuItem) {
            $scope.OHSTaskEdit = false;

            if (menuItem.type == "menu") {
                $scope.selectedOHSMenuItem = menuItem;
                $scope.action = "";
                $scope.changeMiddleSectionTo(menuItem.overviewPartialHTML);
                ControllerInfoPasser.put("selectedOHSMenuItem", $scope.selectedOHSMenuItem);
            } else {
                $scope.changeMiddleSectionTo(menuItem.overviewPartialHTML);
            }
        };

        $scope.addNewRecord = function () {
            $scope.nextAction = 'Save';
            $scope.action = 'Add';
            $scope.changeMiddleSectionTo($scope.selectedOHSMenuItem.inputPartialHTML);
        };

        $scope.deleteRecord = function () {
            if ($scope.OHSTaskEdit) {
                ControllerInfoPasser.broadcast("event:deleteOHSTask");
            } else {
                $scope.nextAction = '';
                // $scope.action = 'Delete';
                $scope.persisting = true;
                ControllerInfoPasser.broadcast("event:deleteOHSRecord");
            }
        };

        $scope.isEditingData = function () {
            if ($scope.action == "Edit" && !$scope.OHSTaskCreate) {
                return true;
            } else {
                return false;
            }
        };

        $scope.cancelDataEntry = function () {
            if ($scope.OHSTaskCreate || $scope.OHSTaskEdit) {
                $scope.OHSTaskCreate = false;
                $scope.OHSTaskEdit = false;
                ControllerInfoPasser.broadcast("event:cancelOHSTaskInput");
            } else {
                $scope.changeMenuItem($scope.selectedOHSMenuItem);
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
            ControllerInfoPasser.put("selectedOHSMenuItem", $scope.selectedOHSMenuItem);
            $scope.persisting = true;
            ControllerInfoPasser.broadcast("event:persistOHSRecord");
        };

        $scope.refreshPropertyInfo = function () {
            $scope.currentProperty = SelectedProperty.getSelectedProperty();
        };

        $scope.resetRecord = function () {
            // alert( "reset triggered" );
            ControllerInfoPasser.broadcast("event:resetRecord");
        };

        $scope.isPropInfoSelected = function (link) {
            if ($scope.selectedOHSMenuItem.label == link.label) {
                return true;
            }
            else {
                return false;
            }
        };

        $scope.broadcastTaskSave = function () {
            ControllerInfoPasser.broadcast("event:saveOHSTask");
        };

        $scope.broadcastStartTask = function () {
            ControllerInfoPasser.broadcast("event:startOHSTask");
        };

        $scope.broadcastReopenTask = function () {
            ControllerInfoPasser.broadcast("event:reopenOHSTask");
        };

        $scope.broadcastCloseTask = function () {
            ControllerInfoPasser.broadcast("event:closeOHSTask");
        };

        $scope.$on('event:editOHSRecord', function () {
            $scope.nextAction = 'Update';
            $scope.action = 'Edit';
        });

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, category) {
            $scope.refreshPropertyInfo();
        });

        $scope.$on('event:errorPersisting', function () {
            $scope.persisting = false;
        });

        $scope.$on('event:taskPersist', function () {
            $scope.persisting = true;
        });

        $scope.$on('event:OHSTaskEdit', function (event, taskInfo) {
            $scope.taskToSubmit = ControllerInfoPasser.get($scope.ohsSelectedTask);
            $scope.OHSTaskEdit = true;
            $scope.taskStatus = taskInfo.status;

            if (angular.isDefined(taskInfo.taskPermission)) {
                $scope.noWriteToTask = taskInfo.taskPermission;
            }
        });

        $scope.$on('event:OHSTaskCreate', function () {
            $scope.OHSTaskCreate = true;
        });

        $scope.$on('event:OHSTaskDelete', function () {
            $scope.OHSTaskEdit = false;
        });

        $scope.$on('event:savedOHSTask', function () {
            $scope.OHSTaskEdit = false;
            $scope.OHSTaskCreate = false;
        });

        $scope.$on('event:fileUploadRejected', function (event, message) {
            $scope.addAlert(message, 'warning');
        });

        $scope.$on('event:disableCRUD', function() {
            $scope.persisting = true;
        });

        $scope.$on('event:enableCRUD', function() {
            $scope.persisting = false;
        });

        $scope.changeMenuItem($scope.propertyInformationLink);

        if (angular.isDefined($scope.jumpToSection)) {
            $scope.jumping = true;
            $scope.changeMenuItem($scope.jumpToSection);
            ControllerInfoPasser.clear('jumpToMenuItem');
        }

        if (angular.isDefined(backToQuestionnaire)) {
            ControllerInfoPasser.clear('backToQuestionnaire');
            $scope.changeSelection('yearlyQuestionnaire');
        }

        if (angular.isDefined(ControllerInfoPasser.get('jumpFromDashboardMenuItem'))) {
            $scope.changeMenuItem(ControllerInfoPasser.get('jumpFromDashboardMenuItem'));
            ControllerInfoPasser.clear('jumpFromDashboardMenuItem');
        }

        $scope.errorPersisting = function () {
            ControllerInfoPasser.broadcast('event:errorPersisting');
        };

    }])
    .controller('OHSDocumentListCtrl', ['$scope', '$http', 'ControllerInfoPasser', 'OHSService', 'SelectedProperty', function ($scope, $http, ControllerInfoPasser, OHSService, SelectedProperty) {

        $scope.currentProperty = SelectedProperty.getSelectedProperty();

        $scope.selectedOHSMenuItem = ControllerInfoPasser.get("selectedOHSMenuItem");

        $scope.records = [];

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, category) {
            $scope.currentProperty = SelectedProperty.getSelectedProperty();
            $scope.loadRecordList();
        });

        $scope.loadRecordList = function () {
            $scope.records.length = 0;
            OHSService.getOHSRecordList({
                ohsMenuId: $scope.selectedOHSMenuItem.id,
                propertyNum: $scope.currentProperty.propertyNumber
            }, function (value, responseHeaders) {
                // Success
                $scope.setRecordList(value);
            }, function (httpResponse) {
                // Error
            });
        };


        $scope.hasTableRows = function () {
            var numberOfRows = document.getElementById("ohsRecordListTable").getElementsByTagName("tbody")[0].getElementsByTagName("tr").length;
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

            ControllerInfoPasser.put("selectedRecord", record);
            ControllerInfoPasser.broadcast("event:editOHSRecord");
            $scope.changeMiddleSectionTo($scope.selectedOHSMenuItem.inputPartialHTML);
        };

    }])
    .controller('OHSFormCtrl', ['$scope', '$http', 'GeoService', 'ControllerInfoPasser', 'OHSService', '$timeout', '$window', 'contextPath', '$uibModal', 'GeneralTasksService', function ($scope, $http, GeoService, ControllerInfoPasser, OHSService, $timeout, $window, contextPath, $modal, GeneralTasksService) {

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function () {
            $scope.changeMenuItem($scope.selectedOHSMenuItem);
        });

        $scope.linkedTasks = [];
        $scope.linkedTasksOrder = ['-dueDate'];
        $scope.attachments = [];

        $scope.timeFieldList = [];
        $scope.initiateTimeFields = function (timeFieldList) {
            $scope.timeFieldList = timeFieldList;
            if ($scope.action == 'Add') {

                if (!$scope.record) {
                    $scope.record = {};
                }

                for (var x = 0; x < timeFieldList.length; x++) {
                    $scope.record[timeFieldList[x]] = new Date();
                    // alert( $scope.record[ timeFieldList[ x ] ] );
                }
            }

        };

        $scope.dateFieldList = [];
        $scope.initiateDateFields = function (dateFieldList) {
            $scope.dateFieldList = dateFieldList;
            if ($scope.action == 'Add') {

                if (!$scope.record) {
                    $scope.record = {};
                }

                for (var x = 0; x < dateFieldList.length; x++) {
                    $scope.record[dateFieldList[x]] = new Date();
                    // alert( $scope.record[ timeFieldList[ x ] ] );
                }
            }
        };

        $scope.getLinkedTasks = function () {
            var recordType = $scope.getRecordType();

            if (angular.isDefined($scope.record) && angular.isDefined($scope.record.id)) {
                $scope.linkedTasks.length = 0;
                GeneralTasksService.findLinkedEntities({
                    linkedEntityId: $scope.record.id,
                    linkedEntityClass: recordType
                }, function (data) {
                    $scope.linkedTasks = data;
                }, function (httpResponse) {
                    // $scope.displayMessageInElement("#linkedTasksError", "An error has occurred getting the tasks associated with this record!");
                });
            }
        };

        $scope.clearFormObject = function () {
            $scope.refreshPropertyInfo();
            if ($scope.form) {
                $scope.clearForm($scope.form, $scope.record);
            }
            // $scope.document = angular.copy($scope.masterForm);

            $scope.initiateTimeFields($scope.timeFieldList);
            $scope.initiateDateFields($scope.dateFieldList);

            if (ControllerInfoPasser.get('selectedRecord')) {
                var selectedRecord = ControllerInfoPasser.get('selectedRecord');
                $scope.record = {};
                $scope.record = selectedRecord;
                $scope.attachments = $scope.record.attachments;
                ControllerInfoPasser.clear('selectedRecord');
                $scope.action = 'Edit';
                $scope.getLinkedTasks();
            } else {
                $scope.action = 'Add';
            }
        };

        $scope.submitRecord = function () {
            if ($scope.form.$valid) {
                if ($scope.currentProperty) {
                    $scope.record.propertyNumber = $scope.currentProperty.propertyNumber;
                    $scope.record.attachments = $scope.attachments;
                    OHSService.addOHSRecord({
                        ohsMenuId: $scope.selectedOHSMenuItem.id,
                        propertyNum: $scope.currentProperty.propertyNumber
                    }, $scope.record, function (value, responseHeaders) {
                        // Success
                        $scope.addAlert('Successfully saved record for property: ' + $scope.currentProperty.propertyNumber, 'success');
                        $scope.nextAction = null;
                        $scope.action = 'Saved';
                        $scope.clearFormObject();
                        $scope.changeMenuItem($scope.selectedOHSMenuItem);
                    }, function (httpResponse) {
                        // Error
                        $scope.errorPersisting();
                        $scope.addAlert('There was an error saving the record!', 'danger');
                    });
                }
            } else {
                $scope.errorPersisting();
                $scope.addAlert('Invalid input. Please check the form fields', 'warning');
            }
        };

        $scope.updateRecord = function () {
            // RQA-209 Temporary fix, need to find root cause as to why near misses have an issue updating
            if ($scope.form.$valid || $scope.selectedOHSMenuItem.id === 'nearmisses') {
                if ($scope.currentProperty) {
                    $scope.record.propertyNumber = $scope.currentProperty.propertyNumber;
                    $scope.record.attachments = $scope.attachments;
                    OHSService.updateOHSRecord({
                        ohsMenuId: $scope.selectedOHSMenuItem.id,
                        propertyNum: $scope.currentProperty.propertyNumber
                    }, $scope.record, function (value, responseHeaders) {
                        // Success
                        $scope.addAlert('Successfully updated record for property: ' + $scope.currentProperty.propertyNumber, 'success');
                        $scope.nextAction = null;
                        $scope.action = 'Saved';
                        $scope.clearFormObject();
                        $scope.changeMenuItem($scope.selectedOHSMenuItem);
                    }, function (httpResponse) {
                        // Error
                        $scope.errorPersisting();
                        $scope.addAlert('There was an error updating the record!', 'danger');
                    });
                }
            } else {
                $scope.errorPersisting();
                $scope.addAlert('Invalid input. Please check the form fields', 'warning');
            }
        };

        $scope.deleteRecord = function () {
            if ($scope.currentProperty) {
                $scope.record.propertyNumber = $scope.currentProperty.propertyNumber;
                $scope.record.attachments = $scope.attachments;
                OHSService.deleteOHSRecord({
                    ohsMenuId: $scope.selectedOHSMenuItem.id,
                    propertyNum: $scope.currentProperty.propertyNumber,
                    servicePath: $scope.record.id
                }, function (value, responseHeaders) {
                    // Success
                    $scope.addAlert('Successfully deleted record for property: ' + $scope.currentProperty.propertyNumber, 'success');
                    $scope.nextAction = null;
                    $scope.action = 'Deleted';
                    $scope.clearFormObject();
                    $scope.changeMenuItem($scope.selectedOHSMenuItem);
                }, function (httpResponse) {
                    // Error
                    $scope.errorPersisting();
                    $scope.addAlert('There was an error deleting the record!', 'danger');
                });
            }
        };

        $scope.$on('event:persistOHSRecord', function () {
            $scope.selectedOHSMenuItem = ControllerInfoPasser.get("selectedOHSMenuItem");
            if ($scope.nextAction == 'Save') {
                $scope.submitRecord();
            } else {
                if ($scope.nextAction == 'Update') {
                    $scope.updateRecord();
                }
            }

        });

        $scope.$on('event:deleteOHSRecord', function () {
            $scope.selectedOHSMenuItem = ControllerInfoPasser.get("selectedOHSMenuItem");
            $scope.deleteRecord();
        });

        $scope.openFilledPDFWindow = function (data) {
            $window.open(contextPath + '/webapi/accidentpdf/downloadFile/' + $scope.record.id);
        };

        $scope.appendAccidentRecordToGovernmentForm = function () {
            if ($scope.selectedOHSMenuItem.id == 'accidents') {
                $http.get(contextPath + '/webapi/accidentpdf/issupported/' + $scope.record.id).success(function (data) {
                    $scope.openFilledPDFWindow(data);
                }).error(function (data, status, headers, config) {
                    switch (status) {
                        case 501:
                            $scope.addNoTimeoutAlert("Printing the accident form for " + $scope.record.employerCountry + " with state/province of " + $scope.record.employerProvince + " is currently not supported.", "warning");
                            break;

                        case 404:
                            $scope.addNoTimeoutAlert("Accident form for " + $scope.record.employerCountry + " with state/province of " + $scope.record.employerProvince + " is currently not available.", "warning");
                            break;

                        case 405:
                            $scope.addNoTimeoutAlert("The system cannot determine how to print the accident report form, please make sure the record you're trying to print has country and province/state entered.");
                            break;
                        default:
                            $scope.addAlert("An error occurred while trying to print the record.", "danger");
                            break;

                    }
                });
            }
        };

        $scope.$on($scope.EVENT_OPEN_LOCAL_ATTACHMENT, function (event, attachment) {
            if ($scope.selectedOHSMenuItem.id == 'accidents') {
                $scope.openInNewWindow('GET', contextPath + '/webapi/accidents/attachments/' + attachment.id, {}, '_blank');
            }

            if ($scope.selectedOHSMenuItem.id == 'governmentlaborinspection') {
                $scope.openInNewWindow('GET', contextPath + '/webapi/governmentlaborinspection/attachments/' + attachment.id, {}, '_blank');
            }
        });

        $scope.getRecordType = function() {
            var recordType = undefined;
            if (angular.isDefined($scope.record)) {
                if ($scope.record['@type'] == 'accidentRecord') {
                    recordType = "AccidentRecord";

                } else if ($scope.record['@type'] == 'governmentLaborInspection') {
                    recordType = "GovernmentLaborInspection";

                } else if ($scope.record['@type'] == 'nearMissRecord') {
                    recordType = "NearMissRecord";

                }
            }

            return recordType;
        };

        $scope.openTaskCreateModal = function(task) {
            ControllerInfoPasser.put('selectedTask', task);

            var modalInstance = $modal.open({
                templateUrl: 'partials/taskFromRecordCreateModal.html',
                controller: 'TaskCreateModalCtrl',
                size: 'lg',
                windowClass: 'standalone-report-modal-window',
                scope: $scope,
                resolve: {
                    taskToCreate: function () {
                        return task;
                    }
                }
            });

            modalInstance.result.then(function (result) {
                $scope.addAlert("Successfully created task '" + result.title + "'", 'success', 5000);
                $scope.getLinkedTasks();
            }, function () {
                // On cancel -- Nothing to do
            });
        };

        $scope.createTaskForRecord = function () {
            var recordType = $scope.getRecordType();

            if (angular.isDefined(recordType)) {
                $http.get(contextPath + '/webapi/service/entity/fields/' + $scope.record.id + '/' + recordType).success(function (description, status) {

                    GeneralTasksService.create({username: $scope.getCurrentUser().userProfile.username, propertyNumber: $scope.currentProperty.propertyNumber}, function (data) {
                        var task = data;
                        task['linkedEntityId'] = $scope.record.id;
                        task['linkedEntityClass'] = recordType;
                        task['description'] = description;
                        task['module'] = $scope.moduleEnums.ohs;
                        task['hideFields'] = ["status", "createdBy", "module", "properties", "lastUpdated", "comments"];
                        $scope.openTaskCreateModal(task);

                    }, function (httpResponse) {
                        $scope.addNoTimeoutAlert('An error has occurred retrieving all existing users!', 'danger');

                    });

                }).error(function (status) {
                    $scope.addAlert('There was a problem trying to create a task for this record...', 'danger');
                });
            }
        };

        $scope.$on('event:resetRecord', function () {
            $scope.clearFormObject();
        });

    }])
    .controller('JointHealthAndSafetyFormCtrl', ['$scope', '$http', '$q', 'contextPath', 'ControllerInfoPasser', 'OHSService', 'SelectedProperty', 'OHSMeetingTasksService', 'PropertyLookup', '$uibModal', function ($scope, $http, $q, contextPath, ControllerInfoPasser, OHSService, SelectedProperty, OHSMeetingTasksService, PropertyLookup, $modal) {

        $scope.tasks = [];

        $scope.forms = {};

        $scope.attachments = [];

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function () {
            $scope.changeMenuItem($scope.selectedOHSMenuItem);
        });

        $scope.printCommitteeMeetingMinutes = function (propertyNumber, meetingDate) {

            if (propertyNumber && meetingDate) {

                var user = ControllerInfoPasser.get('currentUser');
                var meetingMinutesReportURI = '/reports/Risk_Application_Standalone_Reports/Workplace_Inspection_Form_JHSC_And_Safety_Reps';

                var reportURL = $scope.getProtocol() + '://' + window.location.host + '/jasperserver/flow.html?_flowId=viewReportFlow&reportUnit='
                    + meetingMinutesReportURI + '&j_username=' + user.userProfile.username + '&decorate=no&JHSC_MEETING_DATE='
                    + meetingDate + '&PROPERTY_NUMBER=' + propertyNumber;

                var modalInstance = $modal.open({
                    templateUrl: 'standaloneReportModal.html',
                    controller: 'StandaloneReportModalCtrl',
                    windowClass: 'standalone-report-modal-window',
                    resolve: {
                        reportURL: function () {
                            return reportURL;
                        }
                    }
                });

                modalInstance.result.then(function (selectedItem) {
                    // $scope.selected = selectedItem;
                }, function () {
                    // $log.info('Modal dismissed at: ' + new Date());
                });

            } else {
                $scope.addAlert("Cannot print current meeting record.  Please make sure you saved this record first before clicking the print button.")
            }
        };

        $scope.setTaskList = function (tasks) {
            $scope.tasks = [];
            var meetingMinutesDate = new Date(Date.parse($scope.record.date));
            $(tasks).each(function (index, entry) {
                var entryMeetingDate = new Date(Date.parse(entry.meetingDate));
                var entryMeetingClosedDate;
                if (entry.status == $scope.taskStatusEnum.CLOSED) {
                    entryMeetingClosedDate = new Date(Date.parse(entry.meetingTaskClosedDate));
                    if (( entryMeetingDate.getTime() <= meetingMinutesDate.getTime() && entryMeetingClosedDate.getTime() >= meetingMinutesDate.getTime() )) {
                        $scope.tasks.push(entry);
                    }
                } else {
                    if (entryMeetingDate.getTime() <= meetingMinutesDate.getTime()) {
                        $scope.tasks.push(entry);
                    }
                }
            });
        };

        $scope.loadTaskList = function () {
            OHSMeetingTasksService.getByModuleRecord({propertyname: $scope.currentProperty.name}, function (value, responseHeaders) {
                // Success
                $scope.setTaskList(value);
            }, function (httpResponse) {
                // Error
            });
        };

        $scope.hasTableRows = function () {
            var numberOfRows = document.getElementById("jhsRecordTable").getElementsByTagName("tbody")[0].getElementsByTagName("tr").length;
            return numberOfRows > 0;
        };


        $scope.getProfileEditableRoles = function(profile){
            var editableRoles = [];
            if(angular.isDefined(profile)){
                var roles = profile.roles;
                if(angular.isDefined(roles)){
                    for(var i = 0; i < roles.length; i++){
                        if(angular.isDefined(roles[i].editableRoles)){
                            for(var z = 0; z < roles[i].editableRoles.length; z++){
                                editableRoles.push(roles[i].editableRoles[z]);
                            }
                        }
                    }
                }
            }
            return editableRoles;
        };


        $scope.editTask = function (task) {
            var user = $scope.getCurrentUser();
            var roles = user.userProfile.roles;
            $scope.changeStatusDisabled = true;
            $scope.changeAssignedUsersDisabled = true;
            $scope.changeDueDateDisabled = true;
            $scope.taskNoWritePermission = true;
            $scope.attachments = task.attachments;

            $scope.newComment.comment = "";

            var dateCreated = new Date(task.createDate);
            task.createDate = dateCreated.toLocaleString();

            var updateDate = new Date(task.updateDate);
            task.updateDate = updateDate.toLocaleString();

            if (ControllerInfoPasser.get('isAdmin') === false) {
                for (var x = 0; x < task.tags.length; x++) {
                    if (task.tags[x].type == $scope.taskTagTypes.ASSIGNED_TO) {
                        if (task.tags[x].value == user.name) {
                            $scope.taskNoWritePermission = false;
                            break;
                        }

                        var breakTheLoop = false;
                        $(roles).each(function (index, role) {
                            if (task.tags[x].value == role.roleName) {
                                $scope.taskNoWritePermission = false;
                                breakTheLoop = true;
                            }
                        });

                        if (breakTheLoop) {
                            break;
                        }

                        if (task.createdBy == user.name) {
                            $scope.taskNoWritePermission = false;
                            break;
                        }
                    }
                }
            } else {
                $scope.taskNoWritePermission = false;
            }

            if (task.status === $scope.taskStatusEnum.CLOSED) {
                $scope.taskNoWritePermission = true;
            }

            $scope.users = [];

            $scope.existingTaskTags = task.tags;

            ControllerInfoPasser.put($scope.ohsSelectedTask, task);

            ControllerInfoPasser.broadcast("event:OHSTaskEdit", {
                status: task.status,
                taskPermission: $scope.taskNoWritePermission
            });

            $q.all([
                $http({method: 'GET', url: contextPath + '/webapi/roles'}),
                $http({method: 'GET', url: contextPath + '/webapi/profiles'}),
                PropertyLookup.query().$promise
            ]).then(function (result) {
                $(result[0].data).each(function (index, entry) {

                        //populate the popup with roles only visible to the current users role
                        var user = $scope.getCurrentUser();
                        var editable = $scope.getProfileEditableRoles(user.userProfile);
                        entry.name = entry.roleName;
                        //current user is admin so push all roles
                        if(ControllerInfoPasser.get('isAdmin') || editable.length === 0 ){
                            $scope.users.push(entry);

                        //current user is not admin so add role only if in current users editable roles
                        }else if(angular.isDefined(editable) && editable.length > 0){
                            if(editable.indexOf(entry.name) >= 0 ) {
                                $scope.users.push(entry);

                            }
                        }

                    }
                );

                $(result[1].data).each(function (index, entry) {
                    $scope.users.push(entry);
                });

                $scope.properties = result[2];
                $scope.selectedUsers = [];
                $scope.selectedUsersToNotify = [];
                $scope.selectedProperties = [];
                $scope.taskRecordAssociations = [];

                if (angular.isDefined(task)) {
                    $scope.taskAction = "Edit";
                    $(task.tags).each(function (index, entry) {
                        switch (entry.type) {
                            case $scope.taskTagTypes.RECORD :
                                $scope.taskRecordAssociations.push(entry.value);
                                break;
                            case $scope.taskTagTypes.ASSIGNED_TO :
                                var user = $scope.searchArrayForProperty($scope.users, 'name', entry.value)[0];

                                if (angular.isDefined(user)) {
                                    $scope.selectedUsers.push(user);
                                }
                                break;
                            case $scope.taskTagTypes.PROPERTY_NUMBER :
                                var property = $scope.searchArrayForProperty($scope.properties, 'propertyNumber', entry.value)[0];

                                if (angular.isDefined(property)) {
                                    $scope.selectedProperties.push(property);
                                }

                                break;
                            case $scope.taskTagTypes.NOTIFY_ON_CLOSE:
                                // Users
                                $scope.selectedUsersToNotify = $scope.selectedUsersToNotify.concat($scope.users.filter(function (user) {
                                    return angular.isDefined(user.userProfile) && user.userProfile.username === entry.value
                                }));

                                // Roles
                                $scope.selectedUsersToNotify = $scope.selectedUsersToNotify.concat($scope.users.filter(function (role) {
                                    return angular.isUndefined(role.userProfile) && role.name === entry.value
                                }));
                                break;
                            default :
                                // console.log('no match');
                                break;
                        }
                    });

                    // success
                    $(roles).each(function (index, role) {
                        if (role.isAdministratorRole || task.createdBy == user.name ||
                            $scope.selectedUsers.indexOf(role.roleName) > -1 || $scope.selectedUsers.indexOf(user.name) > -1) {
                            // alert( $scope.users.indexOf(role.roleName) );
                            $scope.changeStatusDisabled = false;
                        }
                        if (role.isAdministratorRole || task.createdBy == user.name) {
                            $scope.changeAssignedUsersDisabled = false;
                            $scope.changeDueDateDisabled = false;
                        }
                    });
                    $scope.task = task;
                }
            }, function (rejection) {
                // error
            });
        };


        $scope.createTask = function () {
            if (!$scope.record.year || !$scope.record.month) {
                $scope.addAlert('Please enter a value for year and month before creating a task.', 'warning');
            } else {
                $scope.taskNoWritePermission = false;
                $scope.taskAction = "Create";
                $scope.task = {};
                $scope.task.dueDate = new Date();
                var user = ControllerInfoPasser.get('currentUser');
                $scope.task.createdBy = user.userProfile.username;
                $scope.task.createdByFormalName = user.name;
                $scope.task.status = 'PENDING';
                $scope.attachments = [];
                $scope.task.attachments = $scope.attachments;
                $scope.task.comments = [];
                $scope.task.tags = [];

                $scope.newComment.comment = "";

                $scope.initiateTaskDateFields(['createDate', 'updateDate']);

                $scope.users = [];
                $scope.selectedUsers = [];
                $scope.selectedUsersToNotify = [];

                $scope.changeStatusDisabled = false;
                $scope.changeAssignedUsersDisabled = false;
                $scope.changeDueDateDisabled = false;

                ControllerInfoPasser.broadcast("event:OHSTaskCreate");

                $q.all([
                    $http({
                        method: 'GET',
                        url: contextPath + '/webapi/roles'
                    }).success(function (data, status, headers, config) {
                        $(data).each(function (index, entry) {

                            //populate the popup with roles only visible to the current users role
                            var user = $scope.getCurrentUser();
                            var editable = $scope.getProfileEditableRoles(user.userProfile);

                            entry.name = entry.roleName;

                            //current user is admin so push all roles
                            if(ControllerInfoPasser.get('isAdmin') || editable.length === 0 ){
                                $scope.users.push(entry);

                                //current user is not admin so add role only if in current users editable roles
                            }else if(angular.isDefined(editable) && editable.length > 0){
                                if(editable.indexOf(entry.name) >= 0) {
                                        $scope.users.push(entry);
                                }
                            }

                        })
                    }),
                    $http({
                        method: 'GET',
                        url: contextPath + '/webapi/profiles'
                    }).success(function (data, status, headers, config) {
                        $(data).each(function (index, entry) {
                            $scope.users.push(entry);
                        })
                    })
                ]).then(function (result) {
                    // success
                }, function (rejection) {
                    // error
                })
            }
        };

        $scope.cancelTaskInput = function () {
            $scope.task = {};
            $scope.taskAction = "";
            $scope.attachments = $scope.record.attachments;
            $scope.loadTaskList();
        };

        $scope.timeFieldList = [];
        $scope.initiateTimeFields = function (timeFieldList) {
            if ($scope.action == 'Add') {

                if (!$scope.record) {
                    $scope.record = {};
                }

                for (var x = 0; x < timeFieldList.length; x++) {
                    $scope.record[timeFieldList[x]] = new Date();
                }
            }
        };

        $scope.dateFieldList = [];
        $scope.initiateDateFields = function (dateFieldList) {
            if ($scope.action == 'Add') {

                if (!$scope.record) {
                    $scope.record = {};
                }

                for (var x = 0; x < dateFieldList.length; x++) {
                    $scope.record[dateFieldList[x]] = new Date();
                }
            }
        };

        $scope.taskDateFields = [];
        $scope.initiateTaskDateFields = function (dateFieldList) {
            $scope.taskDateFields = dateFieldList;
            if ($scope.taskAction == 'Create') {

                if (!$scope.task) {
                    $scope.task = {};
                }

                for (var x = 0; x < dateFieldList.length; x++) {
                    $scope.task[dateFieldList[x]] = new Date().toLocaleString();
                }
            }
        };

        $scope.$on('event:saveOHSTask', function () {
            $scope.saveTask();
        });

        $scope.$on('event:startOHSTask', function () {
            $scope.startTask();
        });

        $scope.$on('event:reopenOHSTask', function () {
            $scope.reopenTask();
        });

        $scope.$on('event:closeOHSTask', function () {
            $scope.closeTask();
        });

        $scope.$on('event:cancelOHSTaskInput', function () {
            $scope.cancelTaskInput();
        });

        $scope.$on('event:deleteOHSTask', function () {
            $('#deleteModal').modal('show');
        });

        $scope.$on('event:getJHSTaskWriteStatus', function () {
            return $scope.taskNoWritePermission;
        });

        $scope.saveTask = function () {
            if ($scope.forms.taskform.$error.required) {
                // console.log('invalid!');
                $scope.smoothScroll('#meetingMinutesDiv', 250);
                $scope.alerts.push({type: 'warning', msg: 'Please fill in all required fields'});
                $scope.removeAlert();
                return;
            }

            if ($scope.currentProperty) {
                var tags = [];
                $scope.task.module = "OHS";

                if ($scope.selectedUsers.length == 0) {
                    //console.log('invalid!');
                    $scope.smoothScroll('#meetingMinutesDiv', 250);
                    $scope.alerts.push({type: 'warning', msg: "Please select a value for the 'Assigned to' field."});
                    $scope.removeAlert();
                    return;
                }
                if ($scope.selectedUsers) {
                    $($scope.selectedUsers).each(function (index, entry) {
                        tags.push({type: $scope.taskTagTypes.ASSIGNED_TO, value: entry.name});

                        if (angular.isDefined(entry.userProfile)) {
                            tags.push({
                                type: $scope.taskTagTypes.ASSIGNED_TO_USERNAME,
                                value: entry.userProfile.username
                            });
                        }
                    });
                }

                if (angular.isDefined($scope.selectedUsersToNotify)) {
                    angular.forEach($scope.selectedUsersToNotify, function (user, index) {
                        if (angular.isDefined(user.userProfile)) {
                            tags.push({type: $scope.taskTagTypes.NOTIFY_ON_CLOSE, value: user.userProfile.username});
                        }
                    });
                }

                if ($scope.task.id) {
                    if ($scope.selectedProperties) {
                        $($scope.selectedProperties).each(function (index, entry) {
                            tags.push({type: $scope.taskTagTypes.PROPERTY, value: entry.name});
                            tags.push({type: $scope.taskTagTypes.PROPERTY_NUMBER, value: entry.propertyNumber});
                        });
                    }

                    if ($scope.taskRecordAssociations) {
                        $($scope.taskRecordAssociations).each(function (index, entry) {
                            tags.push({type: $scope.taskTagTypes.RECORD, value: entry});
                        });
                    }

                    if ($scope.existingTaskTags) {
                        $($scope.existingTaskTags).each(function (index, entry) {
                            if (entry.type != $scope.taskTagTypes.PROPERTY && entry.type != $scope.taskTagTypes.ASSIGNED_TO && entry.type != $scope.taskTagTypes.PROPERTY_NUMBER && entry.type != $scope.taskTagTypes.NOTIFY_ON_CLOSE) {
                                tags.push(entry);
                            }
                        });
                    }

                    var fieldsToCompare = ['type', 'value'];

                    // Add all new tags
                    angular.forEach(tags, function (tag) {
                        if (!$scope.arrayContainsBasedOnFields($scope.task.tags, tag, fieldsToCompare)) {
                            $scope.task.tags.push(tag);
                        }
                    });

                    // Remove tags not in the newly build list
                    $scope.task.tags = $scope.task.tags.filter(function (tag) {
                        return $scope.arrayContainsBasedOnFields(tags, tag, fieldsToCompare);
                    });

                    $scope.task.tags = tags;
                    $scope.task.attachments = $scope.attachments;

                    $scope.task.createDate = new Date($scope.task.createDate);
                    $scope.task.updateDate = new Date();
                    $scope.task.dueDate = new Date($scope.task.dueDate);
                    $scope.task.pastDueWarningDate = new Date($scope.task.pastDueWarningDate);
                    $scope.task.meetingDate = new Date(Date.parse($scope.record.date));

                    if ($scope.task.closedDate) {
                        $scope.task.closedDate = new Date($scope.task.closedDate);
                    }

                    if ($scope.task.meetingTaskClosedDate) {
                        $scope.task.meetingTaskClosedDate = new Date($scope.task.meetingTaskClosedDate);
                    }

                    if ($scope.task.status == $scope.taskStatusEnum.CLOSED) {
                        $scope.task.closedDate = new Date();
                        $scope.task.meetingTaskClosedDate = new Date(Date.parse($scope.record.date));
                    } else {
                        $scope.task.closedDate = null;
                        $scope.task.meetingTaskClosedDate = null;
                    }
                    ControllerInfoPasser.broadcast("event:taskPersist");
                    if ($scope.newComment) {
                        if ($scope.newComment.comment != "" && $scope.newComment.comment != undefined) {
                            OHSMeetingTasksService.createNewComment({}, function (data, headers) {
                                // Success
                                data.comment = $scope.newComment.comment;
                                $scope.task.comments.push(data);
                                $scope.newComment.comment = "";
                                $scope.executeOHSMeetingTaskUpdate();
                            }, function (httpResponse) {
                                // Error
                            });
                        } else {
                            $scope.executeOHSMeetingTaskUpdate();
                        }
                    } else {
                        $scope.executeOHSMeetingTaskUpdate();
                    }


                } else {
                    tags.push({type: $scope.taskTagTypes.PROPERTY, value: $scope.currentProperty.name});
                    tags.push({
                        type: $scope.taskTagTypes.PROPERTY_NUMBER,
                        value: $scope.currentProperty.propertyNumber
                    });
                    tags.push({type: $scope.taskTagTypes.RECORD, value: 'Joint Health and Safety Meeting Minutes'});
                    $scope.task.tags = tags;

                    if ($scope.task.status == $scope.taskStatusEnum.CLOSED) {
                        $scope.task.closedDate = new Date();
                        $scope.task.meetingTaskClosedDate = new Date(Date.parse($scope.record.date));
                    } else {
                        $scope.task.closedDate = null;
                        $scope.task.meetingTaskClosedDate = null;
                    }

                    $scope.task.meetingDate = new Date(Date.parse($scope.record.date));
                    $scope.task.createDate = new Date();
                    $scope.task.updateDate = new Date();
                    $scope.task.createdBy = $scope.getCurrentUser().name;

                    if ($scope.newComment) {
                        if ($scope.newComment.comment != "" && $scope.newComment.comment != undefined) {
                            OHSMeetingTasksService.createNewComment({}, function (data, headers) {
                                // Success
                                data.comment = $scope.newComment.comment;
                                $scope.task.comments.push(data);
                                $scope.newComment.comment = "";
                                $scope.executeOHSMeetingTaskSave();
                            }, function (httpResponse) {
                                // Error
                            });
                        } else {
                            $scope.executeOHSMeetingTaskSave();
                        }
                    } else {
                        $scope.executeOHSMeetingTaskSave();
                    }
                }
            }
        };

        $scope.executeOHSMeetingTaskSave = function () {
            OHSMeetingTasksService.save($scope.task, function (data, headers) {
                // Success
                ControllerInfoPasser.broadcast('event:savedOHSTask');
                $scope.loadTaskList();
                $scope.alerts.push({type: 'success', msg: 'Successfully created a new task: ' + $scope.task.title});
                $scope.taskAction = '';
                $scope.attachments = $scope.record.attachments;
                $scope.removeAlert();
            }, function (httpResponse) {
                //error
                // console.log('error creating');
                // console.log(httpResponse);
                $scope.errorPersisting();
                $scope.alerts.push({type: 'danger', msg: 'An error has occurred while trying to save task!'});
                $scope.removeAlert();
            });
        };

        $scope.executeOHSMeetingTaskUpdate = function (task) {
            $scope.task.attachments = $scope.attachments;
            OHSMeetingTasksService.update($scope.task, function (data, headers) {
                // Success
                ControllerInfoPasser.broadcast('event:savedOHSTask');
                $scope.loadTaskList();
                $scope.alerts.push({type: 'success', msg: 'Successfully updated task: ' + $scope.task.title});
                $scope.taskAction = '';
                $scope.attachments = $scope.record.attachments;
                $scope.newComment.comment = "";
                $scope.removeAlert();
            }, function (httpResponse) {
                // Error
                // console.log('error updating');
                // console.log(httpResponse);
                $scope.errorPersisting();
                $scope.alerts.push({type: 'danger', msg: 'An error has occurred while trying to update task!'});
                $scope.removeAlert();
            })
        };

        $scope.deleteTask = function () {
            $scope.forceClosePopupModal('deleteOHSRecordModal');
            OHSMeetingTasksService.delete({id: $scope.task.id}, function (data, headers) {
                $scope.alerts.push({type: 'success', msg: 'Successfully deleted task: ' + $scope.task.title});
                ControllerInfoPasser.broadcast("event:OHSTaskDelete");
                $scope.taskAction = '';
                $scope.attachments = $scope.record.attachments;
                $scope.removeAlert();
                $scope.loadTaskList();
                $scope.ohsTaskDelete = false;
            }, function (httpResponse) {
                // console.log('fail delete');
                $scope.errorPersisting();
                $scope.alerts.push({type: 'danger', msg: 'An error has occurred while trying to delete task!'});
                $scope.removeAlert();
            });
        };


        $scope.$on('event:resetRecord', function () {
            $scope.clearFormObject();
        });


        $scope.clearFormObject = function () {
            $scope.refreshPropertyInfo();
            if ($scope.form) {
                $scope.clearForm($scope.form, $scope.record);
            }

            $scope.initiateTimeFields($scope.timeFieldList);
            $scope.initiateDateFields($scope.dateFieldList);

            if (ControllerInfoPasser.get('selectedRecord')) {
                var selectedRecord = ControllerInfoPasser.get('selectedRecord');
                $scope.record = {};
                $scope.record = selectedRecord;
                $scope.attachments = $scope.record.attachments;
                ControllerInfoPasser.clear('selectedRecord');
                $scope.action = 'Edit';
            } else {
                $scope.action = 'Add';
            }
        };

        $scope.clearTaskFormObject = function () {
            $scope.refreshPropertyInfo();
            if ($scope.forms.taskform) {
                $scope.clearForm($scope.forms.taskform, $scope.task);
            }

            $scope.initiateTaskDateFields($scope.taskDateFields);
        };

        $scope.submitRecord = function () {
            if ($scope.form.$valid) {
                if ($scope.currentProperty) {
                    $scope.record.propertyNumber = $scope.currentProperty.propertyNumber;
                    $scope.record.attachments = $scope.attachments;
                    OHSService.addOHSRecord({
                        ohsMenuId: $scope.selectedOHSMenuItem.id,
                        propertyNum: $scope.currentProperty.propertyNumber
                    }, $scope.record, function (value, responseHeaders) {
                        // Success
                        $scope.addAlert('Successfully saved record for property: ' + $scope.currentProperty.propertyNumber, 'success');
                        $scope.nextAction = null;
                        $scope.action = 'Saved';
                        $scope.clearFormObject();
                        $scope.changeMenuItem($scope.selectedOHSMenuItem);
                    }, function (httpResponse) {
                        $scope.errorPersisting();
                        if ($scope.selectedOHSMenuItem.id == 'committeemeetingminutes') {
                            switch (httpResponse.status) {
                                case 405:
                                    var alert = new Object();
                                    alert.type = 'warning';
                                    alert.msg = "Problems trying to add meeting record, either the meeting date or the designated meeting month and year already exist";
                                    $scope.addAlert(alert.msg, alert.type);
                                    break;
                                default:
                                    var alert = new Object();
                                    alert.type = 'danger';
                                    alert.msg = "There was an error adding the record.";
                                    $scope.addAlert(alert.msg, alert.type);
                                    break;
                            }
                        } else {
                            var alert = new Object();
                            alert.type = 'danger';
                            alert.msg = "There was an error adding the record.";
                            $scope.addAlert(alert.msg, alert.type);
                        }
                    });
                }
            } else {
                $scope.errorPersisting();
                $scope.addAlert('Invalid input. Please check the form fields', 'warning');
            }
        };

        $scope.updateRecord = function () {
            if ($scope.form.$valid) {
                if ($scope.currentProperty) {
                    $scope.record.propertyNumber = $scope.currentProperty.propertyNumber;
                    $scope.record.attachments = $scope.attachments;
                    OHSService.updateOHSRecord({
                        ohsMenuId: $scope.selectedOHSMenuItem.id,
                        propertyNum: $scope.currentProperty.propertyNumber
                    }, $scope.record, function (value, responseHeaders) {
                        // Success
                        $scope.addAlert('Successfully updated record for property: ' + $scope.currentProperty.propertyNumber, 'success');
                        $scope.nextAction = null;
                        $scope.action = 'Saved';
                        $scope.clearFormObject();
                        $scope.changeMenuItem($scope.selectedOHSMenuItem);
                    }, function (httpResponse) {
                        // Error
                        $scope.errorPersisting();
                        $scope.addAlert('There was an error updating the record!', 'danger');
                    });
                }
            } else {
                $scope.errorPersisting();
                $scope.addAlert('Invalid input. Please check the form fields', 'warning');
            }
        };

        $scope.deleteRecord = function () {
            if ($scope.form.$valid) {
                if ($scope.currentProperty) {
                    $scope.record.propertyNumber = $scope.currentProperty.propertyNumber;
                    $scope.record.attachments = $scope.attachments;
                    OHSService.deleteOHSRecord({
                        ohsMenuId: $scope.selectedOHSMenuItem.id,
                        propertyNum: $scope.currentProperty.propertyNumber,
                        servicePath: $scope.record.id
                    }, function (value, responseHeaders) {
                        // Success
                        $scope.addAlert('Successfully deleted record for property: ' + $scope.currentProperty.propertyNumber, 'success');
                        $scope.nextAction = null;
                        $scope.action = 'Deleted';
                        $scope.clearFormObject();
                        $scope.changeMenuItem($scope.selectedOHSMenuItem);
                    }, function (httpResponse) {
                        // Error
                        $scope.errorPersisting();
                        switch (httpResponse.status) {
                            case 304:
                                $scope.addAlert('The current meeting has a closed task. You cannot delete this meeting', 'warning');
                                break;
                            default:
                                $scope.addAlert('There was an error deleting the record!', 'danger');
                                break;
                        }
                    });
                }
            }
        };

        $scope.$on('event:persistOHSRecord', function () {
            $scope.selectedOHSMenuItem = ControllerInfoPasser.get("selectedOHSMenuItem");
            if ($scope.nextAction == 'Save') {
                $scope.submitRecord();
            } else {
                if ($scope.nextAction == 'Update') {
                    $scope.updateRecord();
                }
            }

        });

        $scope.$on('event:deleteOHSRecord', function () {
            $scope.selectedOHSMenuItem = ControllerInfoPasser.get("selectedOHSMenuItem");
            $scope.deleteRecord();
        });

        $scope.sortBy = function (column) {
            // return;
            if ($scope.orderColumn == column && $scope.orderColumn.charAt(0) != '-') {
                $scope.orderColumn = '-' + column;
            } else {
                if ($scope.orderColumn == column && $scope.orderColumn.charAt(0) == '-') {
                    $scope.orderColumn = column.substr(1, column.length - 1);
                } else {
                    $scope.orderColumn = column;
                }
            }

        };

        $scope.getAccessIcon = function (task) {
            var user = $scope.getCurrentUser();
            var roles = user.userProfile.roles;
            var accessIcon = "icon-eye-2";

            $scope.isAdministrator = false;
            $(roles).each(function (index, role) {
                if (role.isAdministratorRole) {
                    $scope.isAdministrator = true;
                }
            });

            if (!$scope.isAdministrator) {
                for (var x = 0; x < task.tags.length; x++) {
                    if (task.tags[x].type == $scope.taskTagTypes.ASSIGNED_TO) {
                        if (task.tags[x].value == user.name) {
                            accessIcon = "icon-pencil-2";
                            break;
                        }

                        var breakTheLoop = false;
                        $(roles).each(function (index, role) {
                            if (task.tags[x].value == role.roleName) {
                                accessIcon = 'icon-pencil-2';
                                breakTheLoop = true;
                            }
                        });

                        if (breakTheLoop) {
                            break;
                        }

                        if (task.createdBy == user.name) {
                            accessIcon = 'icon-pencil-2';
                            break;
                        }

                    }
                }
            } else {
                accessIcon = "icon-pencil-2";
            }
            return accessIcon;
        };

        $scope.getAccessButtonType = function (task) {
            var user = $scope.getCurrentUser();
            var roles = user.userProfile.roles;
            var accessButtonType = "btn-warning";

            $scope.isAdministrator = false;
            $(roles).each(function (index, role) {
                if (role.isAdministratorRole) {
                    $scope.isAdministrator = true;
                }
            });

            if (!$scope.isAdministrator) {
                for (var x = 0; x < task.tags.length; x++) {
                    if (task.tags[x].type == $scope.taskTagTypes.ASSIGNED_TO) {
                        if (task.tags[x].value == user.name) {
                            accessButtonType = "btn-success";
                            break;
                        }

                        var breakTheLoop = false;
                        $(roles).each(function (index, role) {
                            if (task.tags[x].value == role.roleName) {
                                accessButtonType = 'btn-success';
                                breakTheLoop = true;
                            }
                        });

                        if (breakTheLoop) {
                            break;
                        }

                        if (task.createdBy == user.name) {
                            accessButtonType = 'btn-success';
                            break;
                        }
                    }
                }
            } else {
                accessButtonType = "btn-success";
            }
            return accessButtonType;
        };

        $scope.isTaskOverDue = function (task) {
            var dateToday = new Date();
            var taskDueDate = new Date(Date.parse(task.dueDate));
            dateToday.setHours(0, 0, 0, 0);
            taskDueDate.setHours(0, 0, 0, 0);
            if (taskDueDate.getTime() < dateToday.getTime() && task.status != $scope.taskStatusEnum.CLOSED) {
                return true;
            } else {
                return false;
            }
        };

        $scope.isTaskDueToday = function (task) {
            var dateToday = new Date();
            var taskDueDate = new Date(Date.parse(task.dueDate));
            dateToday.setHours(0, 0, 0, 0);
            taskDueDate.setHours(0, 0, 0, 0);
            if (taskDueDate.getTime() == dateToday.getTime() && task.status != $scope.taskStatusEnum.CLOSED) {
                return true;
            } else {
                return false;
            }
        };

        $scope.getDueDateStatusTextColor = function (task) {
            if ($scope.isTaskOverDue(task)) {
                return "text-danger";
            } else {
                if ($scope.isTaskDueToday(task)) {
                    return "text-warning";
                } else {
                    return "";
                }
            }
        };

        $scope.getDueDateStatusIcon = function (task) {
            if ($scope.isTaskOverDue(task)) {
                return "icon-warning i-red";
            } else {
                if ($scope.isTaskDueToday(task)) {
                    return "icon-alarm i-orange";
                } else {
                    return "";
                }
            }
        };

        $scope.getDueDatePopoverText = function (task) {
            if ($scope.isTaskOverDue(task)) {
                return "Task Overdue!";
            } else {
                if ($scope.isTaskDueToday(task)) {
                    return "Due Today";
                } else {
                    return "";
                }
            }
        };

        $scope.startTask = function () {
            if ($scope.task) {
                ControllerInfoPasser.broadcast("event:taskPersist");
                OHSMeetingTasksService.startTask({id: $scope.task.id}, function (value, responseHeaders) {
                    $scope.task = value;
                    ControllerInfoPasser.broadcast("event:OHSTaskEdit", {status: $scope.task.status});
                    $scope.alerts.push({type: 'success', msg: 'Task Started: ' + $scope.task.title});
                    $scope.removeAlert();
                }, function (httpResponse) {
                    $scope.errorPersisting();
                    $scope.alerts.push({type: 'danger', msg: 'An error has occurred while trying to start task!'});
                    $scope.removeAlert();
                });
            }
        };

        $scope.reopenTask = function () {
            if ($scope.task) {
                ControllerInfoPasser.broadcast("event:taskPersist");
                OHSMeetingTasksService.reopenTask({id: $scope.task.id}, function (value, responseHeaders) {
                    $scope.task = value;
                    ControllerInfoPasser.broadcast("event:OHSTaskEdit", {status: $scope.task.status});
                    $scope.alerts.push({type: 'success', msg: 'Task Reopened: ' + $scope.task.title});
                    $scope.removeAlert();
                }, function (httpResponse) {
                    $scope.errorPersisting();
                    $scope.alerts.push({type: 'danger', msg: 'An error has occurred while trying to reopen task!'});
                    $scope.removeAlert();
                });
            }
        };

        $scope.closeTask = function () {
            if ($scope.task) {
                ControllerInfoPasser.broadcast("event:taskPersist");
                OHSMeetingTasksService.closeTask({
                    id: $scope.task.id,
                    propertyNumber: $scope.currentProperty.propertyNumber
                }, function (value, responseHeaders) {
                    $scope.task = value;
                    ControllerInfoPasser.broadcast("event:OHSTaskEdit", {status: $scope.task.status});
                    if ($scope.task.recurrenceTaskId) {
                        $scope.addAlert('Successfully closed task ' + $scope.task.title + '. The next recurring task was created automatically. The rescheduled task is due on ' + new Date(value.nextDueDate).toDateString(), 'success', 10000);
                    } else {
                        $scope.addAlert('Successfully closed task ' + $scope.task.title, 'success', 10000);
                    }

                    $scope.removeAlert();
                }, function (httpResponse) {
                    $scope.errorPersisting();
                    $scope.alerts.push({type: 'danger', msg: 'An error has occurred while trying to close task!'})
                    $scope.removeAlert();
                });
            }
        };

        $scope.newComment = {
            comment: ""
        };

        $scope.deleteTaskComment = function (taskCommentToDelete) {
            var index = $scope.task.comments.indexOf(taskCommentToDelete);
            $scope.task.comments.splice(index, 1);
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
            var index = $scope.task.comments.indexOf(taskComment);
            if ($scope.task.comments.length == ( index + 1 )) {
                return true;
            } else {
                return false;
            }
        };


        $scope.$on('event:localAttachmentOpen', function (event, attachment) {
            if (angular.isUndefined(attachment.id)) {
                return;
            }

            if ($scope.OHSTaskCreate || $scope.OHSTaskEdit) {
                $scope.openInNewWindow('GET', contextPath + '/webapi/tasks/ohsmeeting/attachments/' + attachment.id, {}, '_blank');
            } else {
                $scope.openInNewWindow('GET', contextPath + '/webapi/committeemeetingminutes/attachments/' + attachment.id, {}, '_blank');
            }

        });


        $scope.updateNotifyOnCloseList = function () {
            if ($scope.task.notifyPeopleOnClose === false) {
                $scope.selectedUsersToNotify.length = 0;
            }
        };
    }])
    .controller('OHSComplianceCtrl', ['$scope', 'ComplianceService', 'SelectedProperty', 'ControllerInfoPasser', 'contextPath', '$uibModal', function ($scope, ComplianceService, SelectedProperty, ControllerInfoPasser, contextPath, $modal) {

        $scope.selectedCountryMenu = SelectedProperty.getSelectedProperty().country;
        $scope.selectedTerritoryMenu = SelectedProperty.getSelectedProperty().province;

        // Owl carousel jQuery specific code - start
        $scope.$on('event:loadingComplianceRevisionsComplete', function () {

            $scope.owl = $("#revisionCarousel");

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
                    [600, 4],
                    [700, 5],
                    [1000, 6],
                    [1200, 6],
                    [1400, 7],
                    [1600, 7]
                ],
                navigation: false,
                afterInit: function (elem) {
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
        $scope.highlightActiveRevisionMenu = function (revision) {
            var revisionItem = document.getElementById(revision.id);
            if (angular.isDefined($scope.lastRevisionItemViewed)) {
                $($scope.lastRevisionItemViewed).toggleClass("label label-default", false);
            }
            $(revisionItem).toggleClass("label label-default", true);
            $scope.lastRevisionItemViewed = revisionItem;
        };

        $scope.complianceRevisionToView = undefined;
        $scope.attachments = [];
        $scope.viewComplianceRevision = function (revision) {

            $scope.loading = true;

            $scope.highlightActiveRevisionMenu(revision);

            ComplianceService.find({id: revision.id}, function (data, headers) {
                $scope.initializeComplianceRevisionToView(data);

            }, function (httpResponse) {
                // On Error
                $scope.addAlert("Cannot load revision: a server problem has been detected.", "danger");
            });
        };

        $scope.initializeComplianceRevisionToView = function (revisionToView) {
            $scope.complianceRevisionToView = revisionToView;
            $scope.attachments = [];
            if ($scope.complianceRevisionToView.attachment) {
                $scope.attachments.push($scope.complianceRevisionToView.attachment);
            }

            $scope.loading = false;
        };

        $scope.setComplianceRevisionsList = function (list) {
            $scope.complianceRecordVersions = undefined;
            $scope.complianceRecordVersions = list;
        };

        $scope.loadComplianceRevisions = function () {

            var selectedModule = $scope.moduleEnums.ohs;
            var selectedCountry = $scope.selectedCountryMenu;
            var selectedTerritory = $scope.selectedTerritoryMenu;
            var selectedCategory = $scope.selectedCategoryMenu;

            $scope.complianceRevisionToView = undefined;

            // These variables cannot be blank because the REST call will fail with incomplete URL parameters.
            if ($scope.selectedCountryMenu == undefined || $scope.selectedCountryMenu == "") {
                selectedCountry = "None";
            }

            if ($scope.selectedTerritoryMenu == undefined || $scope.selectedTerritoryMenu == "") {
                selectedTerritory = "None";
            }

            if ($scope.selectedCategoryMenu == undefined || $scope.selectedCategoryMenu == "") {
                selectedCategory = "None";
            }

            return ComplianceService.query({
                module: selectedModule,
                country: selectedCountry,
                territory: selectedTerritory,
                category: selectedCategory
            }, function (data, headers) {
                $scope.setComplianceRevisionsList(data);
            }, function (httpResponse) {
                // On Error
                $scope.addAlert("Cannot load revisions: a server problem has been detected.", "danger");
            }).$promise.then(function () {
                    $scope.loading = false;
                });

        };

        $scope.restartView = function () {
            $scope.loading = true;
            $scope.loadComplianceRevisions();
        };

        $scope.changeComplianceSectionTo = function (section) {
            $scope.complianceSection = section;
        };

        $scope.$on('event:localAttachmentOpen', function (event, attachment) {
            $scope.initializeDocumentViewer();
        });

        $scope.$on('event:carouselInitializationComplete', function (event, attachment) {
            if ($scope.showCurrentComplianceRecord == true) {
                $scope.showCurrentComplianceRecord = false;
                $scope.viewComplianceRevision($scope.currentComplianceToShowAfterCRUD);
            } else {
                // This is where the default view should be implemented.
                $scope.loadDefaultView();
            }
            $scope.loading = false;
        });

        $scope.loadDefaultView = function () {
            if (angular.isDefined($scope.selectedTerritoryMenu) && $scope.selectedTerritoryMenu.length > 0 ||
                angular.isDefined($scope.selectedCountryMenu) && $scope.selectedCountryMenu.length > 0 ||
                angular.isDefined($scope.selectedCategoryMenu) && $scope.selectedCategoryMenu.length > 0) {

                ComplianceService.findActiveRevision({
                    module: $scope.moduleEnums.ohs,
                    country: $scope.selectedCountryMenu,
                    territory: $scope.selectedTerritoryMenu,
                    category: $scope.selectedCategoryMenu
                }, function (data, headers) {
                    $scope.highlightActiveRevisionMenu(data);
                    $scope.initializeComplianceRevisionToView(data);
                }, function (httpResponse) {
                    // On Error
                    $scope.addAlert("Cannot load compliance record: a server problem has been detected.", "danger");
                });

            }

        };

        $scope.initializeDocumentViewer = function (attachment) {
            var documentURL = $scope.getProtocol() + '://' + window.location.host + contextPath + '/webapi/compliancerecords/attachment/' + $scope.complianceRevisionToView.id;

            var backdrop = true;
            var keyboard = true;
            if ($scope.detectIE() === 9) {
                backdrop = "static";
                keyboard = false;
            }

            var modalInstance = $modal.open({
                templateUrl: 'complianceDocumentViewerModal.html',
                controller: 'ComplianceDocumentViewerModalCtrl',
                windowClass: 'standalone-report-modal-window',
                backdrop: backdrop,
                keyboard: keyboard,
                resolve: {
                    documentURL: function () {
                        return documentURL;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                // $scope.selected = selectedItem;
            }, function () {
                // $log.info('Modal dismissed at: ' + new Date());
            });
        };
    }]);
