angular.module('myApp.propertyReportsControllers', [])
    .controller('PropertyReportsCtrl', ['$rootScope', '$window', 'ControllerInfoPasser', '$scope', '$http', '$timeout', 'SelectedProperty', '$location', 'contextPath', '$uibModal', '$q', 'PropertyReportTypeService', 'PropertyReportService',
        function ($rootScope, $window, ControllerInfoPasser, $scope, $http, $timeout, SelectedProperty, $location, contextPath, $modal, $q, PropertyReportTypeService, PropertyReportService) {

            /* Variable Declarations - Start */
            $scope.propertyReportTypeList = [];
            $scope.propertyReportList = [];

            $scope.user = $scope.getCurrentUser();
            $scope.writeNotAllowed = !$scope.currentUserHaveWritePermissionToModule($scope.moduleEnums.sustainability);
            $scope.currentProperty = SelectedProperty.getSelectedProperty();
            /* Variable Declarations - End */


            /* Functions - Start */
            $scope.refreshPropertyInfo = function () {
                $scope.currentProperty = SelectedProperty.getSelectedProperty();
                $scope.currentBuilding = undefined;
            };

            $scope.changePropertyReportData = function () {
                ControllerInfoPasser.broadcast("event:selectedPropertyReportChanged");
            };

            $scope.loadPropertyReportTypeList = function (propertyReportType) {
                PropertyReportTypeService.query({}, function (data, headers) {
                    $scope.propertyReportTypeList = data;
                    if ($scope.propertyReportTypeList.length <= 0) {
                        $scope.selectedPropertyReportType = undefined;
                    } else {
                        if(angular.isDefined(propertyReportType)){
                            for(var i = 0; i < $scope.propertyReportTypeList.length; i++) {
                                if($scope.propertyReportTypeList[i].name === propertyReportType.name){
                                    $scope.selectedPropertyReportType = $scope.propertyReportTypeList[i];
                                    break;
                                }
                            }
                        } else {
                            $scope.selectedPropertyReportType = $scope.propertyReportTypeList[0];
                        }
                        $scope.initializePropertyReportList();
                    }

                }, function (httpResponse) {
                    // Error here
                    $scope.showToast('There was an error loading all property report types', 'error');
                });
            };

            $scope.sortPropertyReportList = function () {
                $scope.propertyReportList.sort(function (a, b) {
                    return a.name.localeCompare(b.name);
                });

                $scope.propertyReportList.sort(function (a, b) {
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
            };

            $scope.initializePropertyReportList = function () {
                if (angular.isDefined($scope.selectedPropertyReportType) && $scope.selectedPropertyReportType != null) {
                    PropertyReportService.findByPropertyReportType({typeId: $scope.selectedPropertyReportType.id}, function (data, headers) {
                        $scope.propertyReportList = data;
                        $scope.sortPropertyReportList();
                        $scope.selectedPropertyReport = $scope.propertyReportList[0];
                        ControllerInfoPasser.broadcast("event:selectedPropertyReportChanged");

                    }, function (httpResponse) {
                        // Error here
                        $scope.showToast("There was an error loading all property reports for the selected property report type", 'error');
                    });
                } else {
                    $scope.selectedPropertyReport = undefined;
                }
            };

            // The commented section below is needed to upgrade the compliance module's carousel from a JQuery one to an AngularJS directive

            /*$scope.addSomething = function() {
             var newList = angular.copy($scope.sampleReportList);
             newList.push('report 9');
             $scope.slickApply(function() {
             $scope.sampleReportList = newList;
             });
             };

             $scope.numberOfReportsToShow = 0;

             $scope.determineNumberOfReportsToShow = function() {
             var width =  $window.innerWidth;

             if (width >= 0 && width <= 450) {
             $scope.numberOfReportsToShow = 4;

             } else if (width > 450 && width <= 600) {
             $scope.numberOfReportsToShow = 6;

             } else if (width > 600 && width <= 700) {
             $scope.numberOfReportsToShow = 7;

             } else if(width > 700 && width <= 1200) {
             $scope.numberOfReportsToShow = 8;

             } else if(width > 1200) {
             $scope.numberOfReportsToShow = 10;

             }
             };

             $scope.determineNumberOfReportsToShow();

             $(window).resize(function(){
             // alert(window.innerWidth);
             $scope.determineNumberOfReportsToShow();

             $scope.$apply(function(){
             //do something to update current scope based on the new innerWidth and let angular update the view.
             var newList = angular.copy($scope.sampleReportList);
             $scope.slickApply(function() {
             $scope.sampleReportList = newList;
             });
             });
             });*/

            $scope.persistPropertyReportType = function (propertyReportType) {
                if (angular.isDefined(propertyReportType.id)) {
                    PropertyReportTypeService.update({}, propertyReportType, function (ignoreData, ignoreHeaders) {
                        $scope.loadPropertyReportTypeList(propertyReportType);

                    }, function (ignoreHttpResponse) {
                        // Error here
                        $scope.showToast('There was an error updating property report type', 'error');
                    });

                } else {
                    PropertyReportTypeService.add({}, propertyReportType, function (data, headers) {
                        $scope.loadPropertyReportTypeList(propertyReportType);

                    }, function (ignoreHttpResponse) {
                        // Error here
                        $scope.showToast('There was an error adding property report type', 'error');
                    });
                }
            };

            $scope.completePropertyReportPersistTransaction = function (propertyReport) {
                if (angular.isDefined($scope.selectedPropertyReportType) && $scope.selectedPropertyReportType != null) {
                    PropertyReportService.findByPropertyReportType({typeId: $scope.selectedPropertyReportType.id}, function (data, headers) {
                        $scope.propertyReportList = data;
                        $scope.sortPropertyReportList();
                        $scope.selectedPropertyReport = $scope.propertyReportList[0];
                        for (var x = 0; x < $scope.propertyReportList.length; x++) {
                            if ($scope.propertyReportList[x].name == propertyReport.name) {
                                $scope.selectedPropertyReport = $scope.propertyReportList[x];
                            }
                        }
                        $scope.changePropertyReportData();

                    }, function (httpResponse) {
                        // Error here
                        $scope.showToast('There was an error loading updated list of property reports for the selected property report type', 'error');
                    });
                }
            };

            $scope.persistPropertyReport = function (propertyReport) {
                if (angular.isDefined(propertyReport.id)) {
                    PropertyReportService.update({}, propertyReport, function (data, headers) {
                        $scope.completePropertyReportPersistTransaction(propertyReport);

                    }, function (ignoreHttpResponse) {
                        // Error here
                        $scope.showToast('There was an error updating property report', 'error');
                    });

                } else {
                    PropertyReportService.add({}, propertyReport, function (data, headers) {
                        $scope.completePropertyReportPersistTransaction(propertyReport);

                    }, function (httpResponse) {
                        // Error here
                        switch (httpResponse.status) {
                            case 417:
                                $scope.showToast('The report cannot be created, an existing report already have the same name.', 'warning');
                                break;

                            default:
                                $scope.addAlert('There was an error adding property report', 'error');
                                break;
                        }

                    });
                }
            };

            $scope.openPropertyReportTypeModalForm = function (transactionType, propertyReportType) {

                var modalInstance = $modal.open({
                    templateUrl: 'propertyReportTypeFormModal.html',
                    controller: 'PropertyReportTypeFormModalCtrl',
                    windowClass: 'standalone-report-modal-window-small',
                    resolve: {
                        transactionType: function () {
                            return transactionType;
                        },
                        propertyReportType: function () {
                            return propertyReportType;
                        }
                    }
                });

                modalInstance.result.then(function (data) {
                    $scope.persistPropertyReportType(data);
                }, function () {
                    // modal closed
                });
            };

            $scope.openPropertyReportModalForm = function (transactionType, propertyReport) {

                var modalInstance = $modal.open({
                    templateUrl: 'propertyReportFormModal.html',
                    controller: 'PropertyReportFormModalCtrl',
                    windowClass: 'standalone-report-modal-window-small',
                    resolve: {
                        transactionType: function () {
                            return transactionType;
                        },
                        propertyReport: function () {
                            return propertyReport;
                        }
                    }
                });

                modalInstance.result.then(function (data) {
                    $scope.persistPropertyReport(data);
                }, function () {
                    // modal closed
                });
            };

            $scope.newPropertyReportType = function () {
                var propertyReportTypeTransactionType = 'New';
                PropertyReportTypeService.create({}, function (data, headers) {
                    $scope.openPropertyReportTypeModalForm(propertyReportTypeTransactionType, data);

                }, function (httpResponse) {
                    // Error here
                    $scope.showToast("There was an error creating property report type", 'error');
                });
            };

            $scope.editPropertyReportType = function () {
                var propertyReportTypeTransactionType = "Edit";
                $scope.openPropertyReportTypeModalForm(propertyReportTypeTransactionType, $scope.selectedPropertyReportType);
            };

            $scope.newPropertyReport = function () {
                if (angular.isDefined($scope.selectedPropertyReportType)) {
                    var propertyReportTransactionType = 'New';
                    PropertyReportService.create({typeId: $scope.selectedPropertyReportType.id}, function (data, headers) {
                        $scope.openPropertyReportModalForm(propertyReportTransactionType, data);

                    }, function (httpResponse) {
                        // Error here
                        $scope.showToast("There was an error creating property report", 'error');
                    });
                }
            };

            $scope.editPropertyReport = function () {
                var propertyReportTypeTransactionType = "Edit";
                $scope.openPropertyReportModalForm(propertyReportTypeTransactionType, $scope.selectedPropertyReport);
            };

            $scope.changePropertyReportStatus = function () {
                PropertyReportService.changeStatus({id: $scope.selectedPropertyReport.id}, null, function (data, headers) {
                    $scope.completePropertyReportPersistTransaction($scope.selectedPropertyReport);

                }, function (httpResponse) {
                    // Error here
                    $scope.showToast("There was an error updating property report", 'error');
                });
            };

            $scope.hasAdminRightsToPropertyReports = function () {
                if ($scope.currentUserHaveAdminPermissionToModule($scope.moduleEnums.propertyReports)) {
                    return true;
                }

                return false;
            };

            $scope.completePropertyReportDeleteTransaction = function () {
                if (angular.isDefined($scope.selectedPropertyReportType) && $scope.selectedPropertyReportType != null) {
                    PropertyReportService.findByPropertyReportType({typeId: $scope.selectedPropertyReportType.id}, function (data, headers) {
                        $scope.propertyReportList = data;
                        $scope.sortPropertyReportList();
                        $scope.selectedPropertyReport = $scope.propertyReportList[0];
                        $scope.changePropertyReportData();

                    }, function (httpResponse) {
                        // Error here
                        $scope.showToast("There was an error loading updated list of property reports for the selected property report type", 'error');
                    });
                }
            };

            $scope.deletePropertyReport = function () {
                if (angular.isDefined($scope.selectedPropertyReport) && $scope.selectedPropertyReport != null && angular.isDefined($scope.selectedPropertyReport.id)) {
                    PropertyReportService.delete({id: $scope.selectedPropertyReport.id}, function (data, headers) {
                        $scope.completePropertyReportDeleteTransaction();
                        $('#deleteReportModal').modal('hide');
                    }, function (httpResponse) {
                        $('#deleteReportModal').modal('hide');
                        // Error here
                        switch (httpResponse.status) {
                            case 417:
                                $scope.showToast("The report cannot be deleted, there is still data associated with this report.", 'warning', 10000);
                                break;

                            default:
                                $scope.showToast("A problem occurred while trying to delete the property report", 'error', 10000);
                                break;
                        }
                    });
                }
            };

            $scope.deletePropertyReportType = function () {
                if (angular.isDefined($scope.selectedPropertyReportType) && $scope.selectedPropertyReportType != null && angular.isDefined($scope.selectedPropertyReportType.id)) {
                    PropertyReportTypeService.delete({id: $scope.selectedPropertyReportType.id}, function (data, headers) {
                        $('#deleteReportTypeModal').modal('hide');
                        $scope.loadPropertyReportTypeList();
                    }, function (httpResponse) {
                        $('#deleteReportTypeModal').modal('hide');
                        // Error here
                        switch (httpResponse.status) {
                            case 417:
                                $scope.showToast("The report type cannot be deleted, there is still data associated for this report type", 'warning', 10000);
                                break;

                            default:
                                $scope.showToast("A problem occurred while trying to delete the property report type", 'error', 10000);
                                break;
                        }
                    });
                }
            };

            $scope.exportPropertyReport = function() {
                var selectedOwners = $scope.getSelectedBusinessContacts();
                var ownerIds = [];
                for (var x = 0; x < selectedOwners.length; x++) {
                    ownerIds.push(selectedOwners[x].id);
                }

                var url = contextPath + '/webapi/propertyreport/report/export/'
                    + $scope.selectedPropertyReportType.id + '/' + $scope.selectedPropertyReport.id;

                $scope.openInNewWindow('POST', url, {businessContactIds: ownerIds});
            };
            /* Functions - End */


            /* Event Listeners - Start */
            $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, category) {
                $scope.refreshPropertyInfo();
                $scope.loadPropertyReportTypeList();
            });
            /* Event Listeners - End */


            /* Directly Executed Code - Start */
            if (angular.isUndefined($scope.currentProperty)) {
                $location.url('/');
            }

            if ($scope.propertyReportsEnabled == false) {
                $location.url("/");
            }
            /* Directly Executed Code - End */


            /* Controller Initialization Function Calls - Start */
            $scope.loadBusinessContacts();
            $scope.refreshPropertyInfo();
            $scope.loadPropertyReportTypeList();
            /* Controller Initialization Function Calls - End */

        }
    ])
    .controller('PropertyReportDataCtrl', ["$scope", "PropertyReportDataService", "PropertyReportService",
        function ($scope, PropertyReportDataService, PropertyReportService) {

            /* Variable Declarations - Start */
            $scope.propertyReportDataHistoryList = [];
            $scope.propertyReportHistoryList = [];
            $scope.propertyReportDataEditor = undefined;
            $scope.propertyReportDataEditorDOM = undefined;
            $scope.editorTextLoading = true;
            var textBoxId = "#textboxio";
            /* Variable Declarations - End */


            /* Functions - Start */
            var initializeTextBox = function() {
                $scope.propertyReportDataEditor = textboxio.replace(textBoxId, {
                    codeview: {
                        enabled: false
                    }
                });
            };

            $scope.loadPropertyReportDataText = function () {
                if (angular.isUndefined($scope.propertyReportDataEditor)) {
                    initializeTextBox();
                }

                var propertyReportDataText = angular.copy($scope.propertyReportData.text);
                if (angular.isDefined(propertyReportDataText) && propertyReportDataText != null) {
                    if (propertyReportDataText.trim() == "") {
                        $scope.propertyReportDataEditor.content.set("");
                    } else {
                        $scope.propertyReportDataEditor.content.set(propertyReportDataText);
                    }
                } else {
                    $scope.propertyReportDataEditor.content.set("");
                }
            };

            $scope.initializePropertyReportDataEditorState = function() {
                if (angular.isDefined($scope.propertyReportDataEditor)) {
                    var documentBody = $scope.propertyReportDataEditor.element().querySelector("iframe").contentWindow.document.body;
                    var textBoxEditableAttributeName = "contenteditable";

                    if ($scope.isReportDataEditable()) {
                        documentBody.setAttribute(textBoxEditableAttributeName, true);

                    } else {
                        documentBody.setAttribute(textBoxEditableAttributeName, false);

                    }
                }
            };

            $scope.loadHistory = function () {
                if (angular.isDefined($scope.propertyReportData.id)) {
                    PropertyReportDataService.getHistory({id: $scope.propertyReportData.id}, function (data, ignoreHeaders) {
                        $scope.propertyReportDataHistoryList = data;

                    }, function (ignoreHttpResponse) {
                        // Error here
                        $scope.showToast("A problem occurred while trying to load edit work history on property report data...", 'error');
                    });
                } else {
                    $scope.propertyReportDataHistoryList = [];
                }

            };

            $scope.loadReportHistory = function () {
                if (angular.isDefined($scope.selectedPropertyReport.id)) {
                    PropertyReportService.getHistory({id: $scope.selectedPropertyReport.id}, function (data, ignoreHeaders) {
                        $scope.propertyReportHistoryList = data;

                    }, function (ignoreHttpResponse) {
                        // Error here
                        $scope.showToast("A problem occurred while trying to load lock history on property report...", "danger");
                    });

                } else {
                    $scope.propertyReportHistoryList = [];
                }

            };

            $scope.loadPropertyReportData = function () {
                if (angular.isDefined($scope.selectedPropertyReport) && $scope.selectedPropertyReport != null) {
                    PropertyReportDataService.open({
                        propertyNumber: $scope.currentProperty.propertyNumber,
                        propertyReportId: $scope.selectedPropertyReport.id
                    }, function (data, ignoreHeaders) {
                        $scope.propertyReportData = data;
                        $scope.editStatus = $scope.propertyReportData.status;
                        $scope.loadPropertyReportDataText();
                        $scope.loadHistory();
                        $scope.loadReportHistory();
                        $scope.initializePropertyReportDataEditorState();

                    }, function (ignoreHttpResponse) {
                        // Error here
                        $scope.showToast("A problem occurred while opening the property report data", 'error');
                    });
                }
            };


            $scope.submitPropertyReportData = function () {
                if ($scope.propertyReportDataForm.$valid) {
                    $scope.propertyReportData.status = $scope.editStatus;
                    var editorTextContent = angular.copy($scope.propertyReportDataEditor.content.get());
                    $scope.propertyReportData.text = editorTextContent;
                    PropertyReportDataService.submitPropertyReportData({
                        propertyNumber: $scope.currentProperty.propertyNumber,
                        editStatus: $scope.propertyReportData.status
                    }, $scope.propertyReportData, function (data, headers) {
                        $scope.loadPropertyReportData();

                    }, function (ignoreHttpResponse) {
                        // Error here
                        $scope.showToast('A problem occurred while saving the property report data.', 'error');
                    });

                } else {
                    $scope.showToast('The form is invalid, please check to see if data entered is correct and if required fields are filled.', 'warning');
                }
            };

            $scope.isReportDataEditable = function () {
                if (angular.isDefined($scope.selectedPropertyReport) && $scope.selectedPropertyReport != null) {
                    if ($scope.selectedPropertyReport.status == "LOCKED") {
                        return false;
                    }

                    if ($scope.currentUserHaveAdminPermissionToModule($scope.moduleEnums.propertyReports)) {
                        return true;
                    }

                    if (angular.isDefined($scope.propertyReportData)) {
                        if ($scope.propertyReportData.status == "Finalized") {
                            for (var x = 0; x < $scope.propertyReportDataHistoryList.length; x++) {
                                if ($scope.propertyReportDataHistoryList[x].profile.id == $scope.user.id && $scope.propertyReportDataHistoryList[x].editStatus == "Finalized") {
                                    return true;
                                }
                            }
                            return false;

                        } else {
                            return true;

                        }
                    }

                    return false;
                }
                return false;
            };
            /* Functions - End */


            /* Event Listeners - Start */
            $scope.$on('event:selectedPropertyReportChanged', function() {
                $scope.loadPropertyReportData();
            });
            /* Event Listeners - End */


            /* Controller Initialization Function Calls - Start */
            /* Controller Initialization Function Calls - End */

        }
    ])
    .controller('PropertyReportTypeFormModalCtrl', ['$scope', '$uibModalInstance', 'transactionType', 'propertyReportType', function ($scope, $modalInstance, transactionType, propertyReportType) {

        /* Variable Declarations - Start */
        $scope.propertyReportTypeTransactionType = transactionType;
        $scope.propertyReportType = propertyReportType;
        /* Variable Declarations - End */


        /* Functions - Start */
        $scope.submitPropertyReportType = function (propertyReportTypeModalForm) {
            if (propertyReportTypeModalForm.$valid) {
                $modalInstance.close($scope.propertyReportType);
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
        /* Functions - End */

        /* Controller Initialization Function Calls - Start */
        /* Controller Initialization Function Calls - End */
    }])
    .controller('PropertyReportFormModalCtrl', ['$scope', '$uibModalInstance', 'transactionType', 'propertyReport', function ($scope, $modalInstance, transactionType, propertyReport) {

        /* Variable Declarations - Start */
        $scope.propertyReportTransactionType = transactionType;
        $scope.propertyReport = propertyReport;
        /* Variable Declarations - End */

        /*if(angular.isDefined($scope.propertyReport.dueDate)) {
         $scope.dueDate = new Date($scope.propertyReport.dueDate);
         }*/

        /* Functions - Start */
        $scope.submitPropertyReport = function (propertyReportModalForm) {
            if (propertyReportModalForm.$valid) {
                // $scope.propertyReport.dueDate = $scope.dueDate;
                $modalInstance.close($scope.propertyReport);
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
        /* Functions - End */
    }]);