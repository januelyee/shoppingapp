angular.module('myApp.complianceControllers', [])
    .controller('ComplianceCtrl', ['$rootScope', 'ControllerInfoPasser', '$scope', '$http', '$timeout', 'SelectedProperty', '$location', 'ComplianceService', 'contextPath', '$uibModal', '$q', '$route',
        function ($rootScope, ControllerInfoPasser, $scope, $http, $timeout, SelectedProperty, $location, ComplianceService, contextPath, $modal, $q, $route) {

            $scope.$on('event:complianceRefresh', function () {
                $route.reload();
            });

            if ($scope.complianceEnabled == false) {
                $location.url("/");
            }

            $scope.writeNotAllowed = !$scope.currentUserHaveWritePermissionToModule($scope.moduleEnums.compliance);

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
                        [600, 6],
                        [700, 7],
                        [1000, 8],
                        [1200, 8],
                        [1400, 10],
                        [1600, 10]
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
                if ($scope.lastRevisionItemViewed) {
                    $scope.lastRevisionItemViewed.setAttribute("class", "ng-binding");
                }

                revisionItem.setAttribute("class", "ng-binding label label-default");
                $scope.lastRevisionItemViewed = revisionItem;
            };

            $scope.complianceRevisionToView = undefined;
            $scope.attachments = [];
            $scope.viewComplianceRevision = function (revision) {
                $scope.highlightActiveRevisionMenu(revision);

                ComplianceService.find({id: revision.id}, function (data, headers) {
                    $scope.initializeComplianceRevisionToView(data);
                    $scope.changeMiddleSectionTo('partials/compliance/complianceView.html');

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
            };

            $scope.lastComplianceRecordViewed = undefined;
            $scope.createNewRevision = function () {
                $scope.clearAllAlertsInPage();
                $scope.lastComplianceRecordViewed = $scope.complianceRevisionToView;
                ControllerInfoPasser.put('newComplianceRecord', $scope.complianceRevisionToView);
                $scope.inputting = true;
                $scope.changeMiddleSectionTo('partials/compliance/complianceInput.html');
            };

            $scope.editRevision = function () {
                $scope.clearAllAlertsInPage();
                $scope.lastComplianceRecordViewed = $scope.complianceRevisionToView;
                ControllerInfoPasser.put('editComplianceRecord', $scope.complianceRevisionToView);
                $scope.inputting = true;
                $scope.changeMiddleSectionTo('partials/compliance/complianceInput.html');
            };

            $scope.$on('event:finishedDeletingComplianceRecord', function (event, category) {
                var moduleSelector = document.getElementById("moduleSelector");
                moduleSelector.disabled = false;
                $scope.inputting = false;
                $scope.showCurrentComplianceRecord = false;

                $q.all([
                    $scope.loadComplianceRevisions()
                ]).then(function (result) {
                    if ($scope.complianceRecordVersions.length < 1) {
                        $scope.changeMiddleSectionTo('');
                    }

                }, function (rejection) {
                    // error
                });
            });

            $scope.deleting = false;
            $scope.deleteRevision = function () {
                $scope.clearAllAlertsInPage();
                $scope.deleting = true;
                if ($scope.complianceRevisionToView.id) {
                    ComplianceService.delete({id: $scope.complianceRevisionToView.id}, function (data, headers) {
                        $scope.deleting = false;
                        $scope.addAlert("Successfully delete revision.", "success");
                        ControllerInfoPasser.broadcast('event:finishedDeletingComplianceRecord');

                    }, function (httpResponse) {
                        // On Error
                        $scope.deleting = false;
                        $scope.addAlert("Cannot delete selected revision: a server problem has been detected.", "danger");
                    });
                } else {
                    $scope.deleting = false;
                    $scope.addAlert("Cannot deleted selected revision: the revision id is not defined.", "warning");
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

            $scope.$watch($scope.getWidth, function (newValue, oldValue) {
                $scope.window_width = newValue;
            });

            window.onresize = function () {
                $scope.$apply();
            };
            // Owl carousel jQuery specific code - end

            // jQuery select-picker specific code - start
            $(document).ready(function () {
                $('.selectpicker').selectpicker();

                var moduleSelector = document.getElementById("moduleSelector");
                $scope.selectedModuleMenu = moduleSelector.options[moduleSelector.selectedIndex].value;
            });
            // jQuery select-picker specific code - end

            $scope.inputting = false;

            $scope.setComplianceRevisionsList = function (list) {
                $scope.complianceRecordVersions = undefined;
                $scope.complianceRecordVersions = list;
            };


            $scope.loadComplianceRevisions = function () {
                $scope.selectedModuleMenu = $scope.getSelectedModule();

                var selectedModule = $scope.selectedModuleMenu;
                var selectedCountry = $scope.selectedCountryMenu;
                var selectedTerritory = $scope.selectedTerritoryMenu;
                var selectedCategory = $scope.selectedCategoryMenu;

                // $scope.changeMiddleSectionTo( '' );
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
                }).$promise;

            };

            $scope.getSelectedModule = function () {
                var moduleSelector = document.getElementById("moduleSelector");
                var module = moduleSelector.options[moduleSelector.selectedIndex].value;
                return module;
            };

            $('#moduleSelector').on('change', function () {
                $scope.changeMiddleSectionTo('');
                $scope.loadComplianceRevisions();
                $scope.loadCategoryDropboxValues($scope.selectedModuleMenu);
            });

            $scope.loadCategoryDropboxValues = function (moduleName) {
                if (moduleName == 'ENVIRONMENTAL' && $scope.dropboxes['environmentalComplianceCategory'] != undefined) {
                    return $scope.dropboxes['environmentalComplianceCategory'].itemMap;
                } else if (moduleName == 'OHS' && $scope.dropboxes['ohsComplianceCategory'] != undefined) {
                    return $scope.dropboxes['ohsComplianceCategory'].itemMap;
                }
            };

            $scope.createNewComplianceRecord = function () {
                // Disable module selector using jQuery.
                var moduleSelector = document.getElementById("moduleSelector");
                $scope.selectedModuleMenu = moduleSelector.options[moduleSelector.selectedIndex].value;
                moduleSelector.disabled = "disabled";

                if ($scope.selectedTerritoryMenu == undefined || $scope.selectedTerritoryMenu == "" ||
                    $scope.selectedCountryMenu == undefined || $scope.selectedCountryMenu == "" ||
                    $scope.selectedCategoryMenu == undefined || $scope.selectedCategoryMenu == "") {
                    $scope.addAlert("Cannot create new record, please make sure to select a country, a territory, and a category from the selector.", "warning");

                } else {
                    $scope.clearAllAlertsInPage();

                    ComplianceService.create({
                        module: $scope.selectedModuleMenu,
                        country: $scope.selectedCountryMenu,
                        territory: $scope.selectedTerritoryMenu,
                        category: $scope.selectedCategoryMenu
                    }, function (data, headers) {
                        ControllerInfoPasser.put('newComplianceRecord', data);
                        $scope.lastComplianceRecordViewed = $scope.complianceRevisionToView;
                        $scope.inputting = true;
                        $scope.changeMiddleSectionTo('partials/compliance/complianceInput.html');

                    }, function (httpResponse) {
                        // On Error
                        $scope.addAlert("Cannot create a new record: a server problem has been detected.", "danger");
                    });
                }
            };

            $scope.changeMiddleSectionTo = function (section) {
                $scope.middleSection = section;
                $scope.initializeTooltips();
            };

            $scope.$on('event:exitComplianceDataEntry', function (event, category) {
                var moduleSelector = document.getElementById("moduleSelector");
                moduleSelector.disabled = false;
                $scope.selectedModuleMenu = $scope.getSelectedModule();
                $scope.inputting = false;

                $q.all([
                    $scope.loadComplianceRevisions()
                ]).then(function (result) {
                    $scope.currentComplianceToShowAfterCRUD = $scope.lastComplianceRecordViewed;
                    if ($scope.currentComplianceToShowAfterCRUD) {
                        $scope.showCurrentComplianceRecord = true;
                    } else {
                        $scope.showCurrentComplianceRecord = false;
                        $scope.changeMiddleSectionTo('');
                    }

                }, function (rejection) {
                    // error
                });
            });

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
            });

            $scope.loadDefaultView = function () {
                if ($scope.selectedTerritoryMenu != undefined && $scope.selectedTerritoryMenu != "" ||
                    $scope.selectedCountryMenu != undefined && $scope.selectedCountryMenu != "" ||
                    $scope.selectedCategoryMenu != undefined && $scope.selectedCategoryMenu != "") {

                    ComplianceService.findActiveRevision({
                        module: $scope.selectedModuleMenu,
                        country: $scope.selectedCountryMenu,
                        territory: $scope.selectedTerritoryMenu,
                        category: $scope.selectedCategoryMenu
                    }, function (data, headers) {
                        $scope.highlightActiveRevisionMenu(data);
                        $scope.initializeComplianceRevisionToView(data);
                        $scope.changeMiddleSectionTo('partials/compliance/complianceView.html');

                    }, function (httpResponse) {
                        // On Error
                        $scope.addAlert("Cannot load compliance record: a server problem has been detected.", "danger");
                    });

                }

            };

            $scope.showCurrentComplianceRecord = false;
            $scope.currentComplianceToShowAfterCRUD = undefined;
            $scope.$on('event:complianceRecordTransactionComplete', function (event, attachment) {
                var currentCompliance = ControllerInfoPasser.get('currentComplianceRecord');
                ControllerInfoPasser.clear('currentComplianceRecord');
                $scope.showCurrentComplianceRecord = false;
                ComplianceService.findByEffectiveDate({}, currentCompliance, function (data, headers) {
                    var moduleSelector = document.getElementById("moduleSelector");
                    moduleSelector.disabled = false;
                    $scope.selectedModuleMenu = $scope.getSelectedModule();
                    $scope.inputting = false;

                    $q.all([
                        $scope.loadComplianceRevisions()
                    ]).then(function (result) {
                        $scope.currentComplianceToShowAfterCRUD = data;
                        if ($scope.currentComplianceToShowAfterCRUD) {
                            $scope.showCurrentComplianceRecord = true;
                        } else {
                            $scope.showCurrentComplianceRecord = false;
                            $scope.changeMiddleSectionTo('');
                        }

                    }, function (rejection) {
                        // error
                    });

                }, function (httpResponse) {
                    // On Error
                    $scope.persisting = false;
                    var errorString = "Cannot save the record, ";
                    var type = "danger";
                    switch (httpResponse.status) {
                        case 417:
                            errorString = errorString + "a revision period already covers the effective date you entered. Please choose another date.";
                            type = "warning";
                            break;
                        case 405:
                            errorString = errorString + "please make sure the values you entered in the form are valid and that all required fields are filled.";
                            type = "warning";
                            break;
                        default:
                            errorString = errorString + "a server error has occurred.  Sorry for the inconvenience.";
                            break;
                    }

                    $scope.addAlert(errorString, type);
                });

            });

            $scope.restartView = function () {
                $scope.changeMiddleSectionTo('');
                $scope.loadComplianceRevisions();
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

            if ($scope.isComplianceTheOnlyEnabledModule()) {
                $scope.isComplianceCrudAvailable = $scope.currentUserHaveAdminPermissionToModule();
            } else {
                $scope.isComplianceCrudAvailable = false;
            }
        }])
    .controller('ComplianceInputCtrl', ['$rootScope', 'ControllerInfoPasser', '$scope', '$http', '$timeout', 'SelectedProperty', '$location', 'ComplianceService', '$filter',
        function ($rootScope, ControllerInfoPasser, $scope, $http, $timeout, SelectedProperty, $location, ComplianceService, $filter) {

            $scope.complianceRecord = null;
            $scope.attachments = [];
            $scope.persisting = false;
            $scope.transactionType = null;

            $scope.initializeComplianceInput = function () {
                if ($scope.complianceForm) {
                    $scope.complianceForm.$setPristine();
                }

                if (ControllerInfoPasser.get('newComplianceRecord')) {
                    $scope.complianceRecord = ControllerInfoPasser.get('newComplianceRecord');
                    ControllerInfoPasser.clear('newComplianceRecord');
                    $scope.currentAction = 'Add';
                    $scope.transactionName = "New Compliance Record";

                } else {
                    $scope.complianceRecord = ControllerInfoPasser.get('editComplianceRecord');
                    ControllerInfoPasser.clear('editComplianceRecord');
                    $scope.currentAction = 'Edit';
                    $scope.transactionName = "Edit Compliance Record";

                }

                if ($scope.complianceRecord) {
                    if ($scope.complianceRecord.attachment) {
                        $scope.attachments.push($scope.complianceRecord.attachment);
                    }
                }
            };

            $scope.cancelDataEntry = function () {
                $scope.initializeComplianceInput();
                $scope.inputting = false;
                $scope.currentAction = undefined;
                $scope.clearAllAlertsInPage();
                ControllerInfoPasser.broadcast("event:exitComplianceDataEntry");
            };


            $scope.saveComplianceRecord = function () {
                $scope.persisting = true;
                if ($scope.complianceForm.$valid && $scope.attachments.length > 0) {
                    $scope.complianceRecord.attachment = $scope.attachments[0];

                    ComplianceService.add({}, $scope.complianceRecord, function (data, headers) {
                        $scope.finishComplianceRecordTransaction("added");

                    }, function (httpResponse) {
                        // On Error
                        $scope.persisting = false;
                        var errorString = "Cannot save the record, ";
                        var type = "danger";
                        switch (httpResponse.status) {
                            case 417:
                                errorString = errorString + "a revision period already covers the effective date you entered. Please choose another date.";
                                type = "warning";
                                break;
                            case 405:
                                errorString = errorString + "please make sure the values you entered in the form are valid and that all required fields are filled.";
                                type = "warning";
                                break;
                            default:
                                errorString = errorString + "a server error has occurred.  Sorry for the inconvenience.";
                                break;
                        }

                        $scope.addAlert(errorString, type);
                    });

                } else {
                    $scope.persisting = false;
                    $scope.addAlert("Cannot save record, please make sure the values you entered in the form are valid and that all required fields are filled.", "warning");
                }
            };

            $scope.updateComplianceRecord = function () {
                $scope.persisting = true;
                if ($scope.complianceForm.$valid && $scope.attachments.length > 0) {
                    $scope.complianceRecord.attachment = $scope.attachments[0];
                    ComplianceService.update({}, $scope.complianceRecord, function (data, headers) {
                        $scope.finishComplianceRecordTransaction("updated");

                    }, function (httpResponse) {
                        // On Error
                        $scope.persisting = false;
                        var errorString = "Cannot updated the record, ";
                        var type = "danger";
                        switch (httpResponse.status) {
                            case 417:
                                errorString = errorString + "a revision period already covers the effective date you entered. Please choose another date.";
                                type = "warning";
                                break;
                            case 405:
                                errorString = errorString + "please make sure the values you entered in the form are valid and that all required fields are filled.";
                                type = "warning";
                                break;
                            default:
                                errorString = errorString + "a server error has occurred.  Sorry for the inconvenience.";
                                break;
                        }

                        $scope.addAlert(errorString, type);
                    });

                } else {
                    $scope.persisting = false;
                    $scope.addAlert("Cannot save record, please make sure the values you entered in the form are valid and that all required fields are filled.", "warning");
                }
            };

            $scope.finishComplianceRecordTransaction = function (transactionFinishedName) {
                $scope.currentAction = undefined;
                $scope.inputting = false;
                var rawEffectiveDate = $scope.complianceRecord.effectiveDate;
                var formattedEffectiveDate = $scope.complianceRecord.effectiveDate = $filter('date')($scope.complianceRecord.effectiveDate, "longDate", $scope.getTimezoneOffset());
                $scope.addAlert("Successfully " + transactionFinishedName + " compliance record with effective date " + formattedEffectiveDate + " for " + $scope.complianceRecord.category, "success");

                var currentComplianceRecord = $scope.complianceRecord;
                currentComplianceRecord.effectiveDate = rawEffectiveDate;
                $scope.initializeComplianceInput();
                $scope.persisting = false;

                ControllerInfoPasser.put('currentComplianceRecord', currentComplianceRecord);
                ControllerInfoPasser.broadcast("event:complianceRecordTransactionComplete");
            };

            $scope.$on('event:localAttachmentPush', function (event, attachment) {
                $scope.attachments = [];
                $scope.attachments.push(attachment);
                if ($scope.detectIE() !== 9) {
                    $scope.$apply(); // force a scope update. Not sure why angular does not see the array updated without this...
                }
            });

            $scope.$on('event:SPAttachmentPush', function (event, attachment) {
                $scope.attachments = [];
                $scope.attachments.push(attachment);
            });

            $scope.removeAttachment = function (attachment) {
                var position = $scope.attachments.indexOf(attachment);
                $scope.attachments.splice(position, 1);
            };

            $scope.$on('event:fileUploadRejected', function (event, message) {
                $scope.addAlert(message, 'warning');
            });

            $scope.$on('event:disableCRUD', function() {
                $scope.persisting = true;
            });

            $scope.$on('event:enableCRUD', function() {
                $scope.persisting = false;
            });
        }
    ])
    .controller('ComplianceDocumentViewerModalCtrl', ['$scope', '$uibModalInstance', 'documentURL', function ($scope, $modalInstance, documentURL) {

        $scope.viewerFrameWidth = ($(window).width() - ($(window).width() * 0.33 )) + "px";

        $scope.viewerFrameSrc = documentURL;

        $scope.cancel = function () {
            $scope.viewerFrameSrc = undefined;
            $modalInstance.dismiss('cancel');
        };
    }]);