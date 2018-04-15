/*
 *
 *  * Copyright (c) 2015. Refined Data Solutions. All Rights Reserved
 *
 */

/**
 * Created by Januel on 29/05/14.
 */

angular.module('myApp.sustainabilityControllers', [])
    .controller('SustainabilityCtrl', ['$scope', '$location', 'SelectedProperty', 'ControllerInfoPasser', 'contextPath', '$uibModal', '$route', function ($scope, $location, SelectedProperty, ControllerInfoPasser, contextPath, $modal, $route) {

        $scope.UTILITIES = {
            ENERGY: 'ENERGY',
            ELECTRICITY: 'ELECTRICITY',
            NATURAL_GAS: 'NATURAL_GAS',
            WATER: 'WATER',
            CHILLED_WATER: 'CHILLED_WATER',
            STEAM: 'STEAM',
            HEATING_OIL: 'HEATING_OIL',
            DIESEL: 'DIESEL',
            PROPANE: 'PROPANE',
            OTHER: 'OTHER'
        };

        $scope.CONSUMPTION_RECORD_TYPE = {
            BILLING: 'BILLING',
            CONSUMPTION: 'CONSUMPTION',
        };

        $scope.utilityToRESTPath = function (utilityEnum) {
            switch (utilityEnum) {
                case $scope.UTILITIES.ELECTRICITY:
                    return 'ecrs';
                case $scope.UTILITIES.NATURAL_GAS:
                    return 'ngcrs';
                case $scope.UTILITIES.WATER:
                    return 'wcrs';
                case $scope.UTILITIES.CHILLED_WATER:
                    return 'cwcrs';
                case $scope.UTILITIES.STEAM:
                    return 'scrs';
                case $scope.UTILITIES.HEATING_OIL:
                    return 'hocrs';
                case $scope.UTILITIES.DIESEL:
                    return 'dcrs';
                case $scope.UTILITIES.PROPANE:
                    return 'pcrs';

            }
        };

        $scope.similarPropertiesPartial = 'partials/similarProperties.html';
        $scope.moduleLandingPage = 'partials/moduleLandingPropertyInfo.html';
        $scope.performanceDataPartial = 'partials/sustainability/performanceData.html';
        $scope.performanceDataInputPartial = 'partials/sustainability/utilityInput.html';
        $scope.energyStarPartial = 'partials/sustainability/energyStar.html';
        $scope.wasteManagementPartial = 'partials/sustainability/wastemanagement/wastes.html';
        $scope.performanceDataOptionsPartial = 'partials/sustainability/performanceDataOptions.html';
        $scope.performanceDataVerificationPartial = 'partials/sustainability/performanceVerification.html';
        $scope.utilityMeterPartial = 'partials/sustainability/utilityMeters.html';
        $scope.utilityTargetsPartial = 'partials/sustainability/utilityTargets.html';
        $scope.regressionAnalysisPartial = 'partials/sustainability/regressionAnalysis.html';
        $scope.buildingCertificationPartial = 'partials/sustainability/buildingCertification.html';

        $scope.isCRUDButtonVisible = true;
        $scope.$on('event:buildingComponentSelected', function (event, building) {
            if (building.hasOwnProperty("floorList")) {
                $scope.currentBuilding = building;
                $scope.isCRUDButtonVisible = true;

            } else {
                if (building.name === 'All Buildings') {
                    $scope.currentBuilding = "ALL";
                    $scope.isCRUDButtonVisible = false;

                } else {
                    $scope.currentBuilding = undefined;
                    $scope.isCRUDButtonVisible = true;
                }
            }

        });

        if ($scope.sustainabilityEnabled == false) {
            $location.url("/");
        }

        $scope.refreshPropertyInfo = function () {
            $scope.currentProperty = SelectedProperty.getSelectedProperty();
            $scope.currentBuilding = undefined;
        };

        $scope.writeNotAllowed = !$scope.currentUserHaveWritePermissionToModule($scope.moduleEnums.sustainability);

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

        $scope.bomaScore = 0;
        $scope.leedScore = 0;
        $scope.kpiScore = 0;

        $scope.main = 'partials/sustainabilityMain.html';
        $scope.yearlyQuestionnaire = 'partials/yearlyQuestionnaire.html';
        $scope.checklistsSurvey = 'partials/checklists-surveys.html';
        $scope.propertyDetails = 'partials/propertyInformation/detailedPropertyInformation.html';
        $scope.similarProperties = 'partials/propertyInformation/similarProperties.html';

        $scope.selection = 'main';

        $scope.selectedYearlyQuestionnaireName = ControllerInfoPasser.get('selectedYearlyQuestionnaireName');

        $scope.changeSelection = function (selection) {
            $scope.selection = selection;
        };

        $scope.goToPropertyDetail = function () {
            if ($scope.propertyAccess === $scope.moduleAccessTypes.RW) {
                $scope.changeSelection('propertyDetails');
            }
        };

        $scope.selectedQuestionnaireName = null;

        $scope.$on('event:sustainabilityRefresh', function () {
            $route.reload();
        });

        $scope.initSelectedQuestionnaireNameBasedOnSubType = function (questionnaireSubType) {
            if (questionnaireSubType == $scope.questionnaireSubTypes.YEARLY) {
                $scope.selectedQuestionnaireName = $scope.selectedYearlyQuestionnaireName;
            } else {
                if (new Date().getMonth() > 9) {
                    $scope.selectedQuestionnaireName = (new Date().getMonth() + 1) + "-" + $scope.selectedYearlyQuestionnaireName;
                } else {
                    $scope.selectedQuestionnaireName = "0" + (new Date().getMonth() + 1) + "-" + $scope.selectedYearlyQuestionnaireName;
                }
            }
        };

        $scope.changeQuestionnaireName = function (questionnaireName, questionnaireSubType) {
            // $scope.selectedYear = year;
            $scope.selectedQuestionnaireName = questionnaireName;
            $scope.selectedQuestionnaireSubType = questionnaireSubType;
            $scope.selectedQuestionnaireType = "Sustainability";
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

        $scope.$on('event:bomaScoreUpdate', function (event, score) {
            if (score) {
                $scope.bomaScore = score;
            } else {
                $scope.bomaScore = 0;
            }
        });

        $scope.$on('event:leedScoreUpdate', function (event, score) {
            if (score) {
                $scope.leedScore = score;
            } else {
                $scope.leedScore = 0;
            }
        });

        $scope.$on('event:kpiScoreUpdate', function (event, score) {
            if (score) {
                $scope.kpiScore = score;
            } else {
                $scope.kpiScore = 0;
            }
        });

        $scope.$on('event:gotoMainPage', function () {
            $scope.changeSelection('main');
        });

        $scope.$on('event:gotoQuestionnaire', function () {
            $scope.changeSelection('yearlyQuestionnaire');
        });

        $scope.getValidationIcon = function (state) {
            if (angular.isDefined(state)) {
                if (state === false) {
                    return "icon-checkmark-circle i-green";
                } else {
                    return "icon-cancel-circle i-red"
                }
            } else {
                return "icon-info i-blue"
            }
        };

        $scope.getValidationTooltip = function (state) {
            if (angular.isDefined(state)) {
                if (state === false) {
                    return "All properties have been validated.";
                } else {
                    return "There are still properties to be validated"
                }
            } else {
                return "Something went wrong..."
            }
        };

        $scope.filterCategory = function (category, problem) {
            if (problem.category === category) {
                return problem.message;
            }
        };

    }])
    .controller('SustainabilityMonthlyCtrl', ['$scope', '$http', '$timeout', 'SelectedCategory', 'PropertyLookup', 'SelectedProperty', 'ControllerInfoPasser', '$uibModal', 'contextPath', '$q', function ($scope, $http, $timeout, SelectedCategory, PropertyLookup, SelectedProperty, ControllerInfoPasser, $modal, contextPath, $q) {

        $scope.waterCategory = {
            "type": "menu",
            "label": "Water",
            "icon": "icon-droplet",
            "units": [
                "m3",
                "Gallons"
            ],
            "path": "wcrs",
            "enum": "WATER",
            "overviewPartialHTML": "partials/sustainability/utilityInput.html",
            "partialHTML": "partials/sustainability/utilityInput.html"
        };

        var dashboardRecordTypeDetailsControllerInfoPasserKey = "dashboardSustainabilityRecordDetailsMenuId";
        var dashboardPassedRecordType = ControllerInfoPasser.get(dashboardRecordTypeDetailsControllerInfoPasserKey);

        $scope.persisting = false;

        $scope.middleSection = $scope.moduleLandingPage;
        $scope.performanceDataOptionsIcon = 'i-grey';
        $scope.wasteManagementIcon = 'i-grey';

        $scope.myProperties = ControllerInfoPasser.get('favorites');
        $scope.selectedPerformanceYear = null;

        $scope.propertyList = [];
        $scope.propertyListAll = [];
        $scope.selectedPropertyList = [];

        $scope.RAW_RECORDS_KEY = 'PerformanceDataRawRecords';
        $scope.LOOKING_AT_TRANSACTIONS_KEY = 'PerformanceDataLookingAtTransactions';


        $scope.dataValidationCategories = [ // TODO - remove and fix, this is just an emergency workaround.
            {
                "type": "menu",
                "label": "Electricity",
                "icon": "icon-lightning",
                "units": [
                    "kWh",
                    "GJ",
                    "mWh"
                ],
                "path": "ecrs",
                "enum": "ELECTRICITY",
                "overviewPartialHTML": "partials/sustainability/utilityInput.html",
                "partialHTML": "partials/sustainability/utilityInput.html"
            },
            {
                "type": "menu",
                "label": "Natural Gas",
                "icon": "icon-fire",
                "units": [
                    "m3",
                    "GJ"
                ],
                "path": "ngcrs",
                "enum": "NATURAL_GAS",
                "overviewPartialHTML": "partials/sustainability/utilityInput.html",
                "partialHTML": "partials/sustainability/utilityInput.html"
            },
            {
                "type": "menu",
                "label": "Steam",
                "icon": "icon-cloud",
                "units": [
                    "LBS"
                ],
                "path": "scrs",
                "enum": "STEAM",
                "overviewPartialHTML": "partials/sustainability/utilityInput.html",
                "partialHTML": "partials/sustainability/utilityInput.html"
            },
            {
                "type": "menu",
                "label": "Chilled Water",
                "icon": "icon-droplet",
                "units": [
                    "m3",
                    "Gallons"
                ],
                "path": "cwcrs",
                "enum": "CHILLED_WATER",
                "overviewPartialHTML": "partials/sustainability/utilityInput.html",
                "partialHTML": "partials/sustainability/utilityInput.html"
            },
            {
                "type": "menu",
                "label": "Heating Oil",
                "icon": "icon-fire",
                "units": [
                    "Litres",
                    "Gallons"
                ],
                "path": "hocrs",
                "enum": "HEATING_OIL",
                "overviewPartialHTML": "partials/sustainability/utilityInput.html",
                "partialHTML": "partials/sustainability/utilityInput.html"
            },
            {
                "type": "menu",
                "label": "Diesel",
                "icon": "icon-truck",
                "units": [
                    "Litres",
                    "Gallons"
                ],
                "path": "dcrs",
                "enum": "DIESEL",
                "overviewPartialHTML": "partials/sustainability/utilityInput.html",
                "partialHTML": "partials/sustainability/utilityInput.html"
            },
            {
                "type": "menu",
                "label": "Propane",
                "icon": "icon-fire",
                "units": [
                    "Litres",
                    "Gallons",
                    "Pounds"
                ],
                "path": "pcrs",
                "enum": "PROPANE",
                "overviewPartialHTML": "partials/sustainability/utilityInput.html",
                "partialHTML": "partials/sustainability/utilityInput.html"
            }
        ];

        var currentDate = new Date();
        $scope.selectedCategoryToVerifyYear = (currentDate.getFullYear() - 1) + "";

        if (!$scope.currentProperty) {
            $scope.changeSelectedProperty($scope.myProperties[0]);
        }

        $scope.jumpToSection = ControllerInfoPasser.get('jumpToMenuItem');

        $scope.getCategories = function () {
            $http.get('json/sustainabilityMonthlyCategories.json').success(function (data) {
                $scope.categories = data;
                SelectedCategory.setAllCategories($scope.categories);
                showPerformanceDataFromExternalSelection();
            });
        };

        $scope.getRealpacCategories = function () {
            $http.get('json/sustainabilityRealpac.json').success(function (data) {
                $scope.realpacCategories = data;
            });
        };

        $scope.getGresbCategories = function () {
            $http.get('json/sustainabilityGresb.json').success(function (data) {
                $scope.gresbCategories = data;
            });
        };

        $scope.getAccess = function () {
            $http.get(contextPath + '/webapi/systemconfig/security/Security:SustainabilityUtilityCRUD').success(function (accessType) {
                // The object returned is of structure {"$": "R"}
                $scope.utilityCRUDAccess = $scope.moduleAccessTypes[accessType['$']];
            });
        };

        $scope.refreshPropertyInfo();

        $scope.isMiddleSection = function (section) {
            if (section === $scope.middleSection) {
                $scope.removePerformanceDataMenuHighlight();
                return 'i-yellow';
            }

            return 'i-grey';
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

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.toggleCollapse = function (elm) {
            var icon = $(elm);

            if (icon.hasClass('icon-plus')) {
                icon.removeClass('icon-plus');
                icon.addClass('icon-minus');
            } else {
                icon.removeClass('icon-minus');
                icon.addClass('icon-plus');
            }
        };

        $scope.removePerformanceDataMenuHighlight = function () {
            $scope.selected = undefined;
            $scope.performanceDataOptionsIcon = 'i-grey';
        };

        $scope.changeMiddleSectionTo = function (section) {
            $scope.persisting = false;
            $scope.middleSection = section;

            if (section === $scope.performanceDataPartial || section === $scope.performanceDataInputPartial) {
                $scope.showLegacyFooter = true;
            } else {
                $scope.showLegacyFooter = false;
            }

            if ($scope.middleSection == $scope.moduleLandingPage || $scope.middleSection === $scope.similarPropertiesPartial) {
                $scope.removePerformanceDataMenuHighlight();
            }
        };

        $scope.changeCategory = function (category, partial) {
            ControllerInfoPasser.put('utilityHasChanged', true);
            SelectedCategory.setSelectedCategory(category);
            $scope.selected = category;
            $scope.changeMiddleSectionTo(partial);
        };

        $scope.isSelected = function (category) {
            return category === $scope.selected ? '' : 'text-muted';
        };

        $scope.isSelectedIcon = function (category) {
            return category === $scope.selected ? 'i-yellow' : 'i-grey';
        };

        $scope.importFromJackRabbit = function () {
            PropertyLookup.query({db: 'jr'}, function (value, responseHeaders) {
                for (var i = 0; i < value.length; i++) {
                    PropertyLookup.save(value[i])
                }
            });

        };

        $scope.refreshPropertyInfo = function () {
            $scope.currentProperty = SelectedProperty.getSelectedProperty();
        };

        $scope.changeSelectedProperty = function (property) {
            SelectedProperty.setSelectedProperty(property);
        };

        $scope.addNewRecord = function () {
            ControllerInfoPasser.broadcast('event:addUtilityRecord');
            $scope.action = 'Save';
            $scope.changeMiddleSectionTo($scope.performanceDataInputPartial);
        };

        $scope.openPerformanceDataDiscrepanciesModal = function () {
            $scope.categoryForValidationModal = SelectedCategory.getSelectedCategory();
            $scope.categoryToVerifyPath = $scope.categoryForValidationModal.path;

            $q.all([
                $scope.loadPropertiesForSelection()
            ]).then(function () {
                $('#PerformanceDataDiscrepanciesModal').modal('show');
            });
        };

        $scope.isEnteringData = function () {
            if ($scope.middleSection == 'partials/sustainability/utilityInput.html') {
                return true;
            }
            else {
                return false;
            }
        };

        $scope.isEditingRecord = function () {
            if ($scope.action == 'Update') {
                return true;
            }
            else {
                return false;
            }
        };

        $scope.cancelDataEntry = function () {
            $scope.changeMiddleSectionTo($scope.performanceDataPartial);
        };

        $scope.saveRecord = function () {
            $scope.persisting = true;
            ControllerInfoPasser.broadcast("event:saveRecord");
        };

        $scope.clearRecord = function () {
            ControllerInfoPasser.broadcast("event:clearRecord");
        };

        $scope.deleteRecord = function () {
            $scope.persisting = true;
            ControllerInfoPasser.broadcast("event:deleteRecord");
        };

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, category) {
            $scope.refreshPropertyInfo();
        });

        $scope.$on('event:editingRecord', function () {
            $scope.action = 'Update';
        });

        $scope.$on('event:errorPersisting', function () {
            $scope.persisting = false;
        });

        $scope.$on('event:periodChange', function () {
            $scope.selectedPerformanceYear = ControllerInfoPasser.get("selectedYear");
        });

        $scope.$on('event:fileUploadRejected', function (event, message) {
            $scope.addAlert(message, 'warning');
        });

        $scope.$on('event:disableCRUD', function () {
            $scope.persisting = true;
        });

        $scope.$on('event:enableCRUD', function () {
            $scope.persisting = false;
        });

        $scope.$on('event:displaySnapshotModal', function () {
            $scope.categoryForDisplay = SelectedCategory.getSelectedCategory();
            $scope.categoryDisplayName = $scope.categoryForDisplay.label;
            $scope.categoryDisplayIcon = $scope.categoryForDisplay.icon;
            $("#snapshotModal").modal("show");
        });

        if (angular.isDefined($scope.jumpToSection)) {
            $scope.jumping = true;
            ControllerInfoPasser.clear('jumpToMenuItem');
            $scope.changeCategory($scope.jumpToSection);
        }

        var backToQuestionnaire = ControllerInfoPasser.get('backToQuestionnaire');
        if (angular.isDefined(backToQuestionnaire)) {
            ControllerInfoPasser.clear('backToQuestionnaire');
            $scope.changeSelection('yearlyQuestionnaire');
        }

        var showPerformanceDataFromExternalSelection = function () {
            if (angular.isDefined(dashboardPassedRecordType) && dashboardPassedRecordType != null) {
                var selectedCategoryPathName = angular.copy(dashboardPassedRecordType);
                ControllerInfoPasser.clear(dashboardRecordTypeDetailsControllerInfoPasserKey);

                var performanceItemsIndex = 0;
                var categoryItems = $scope.categories[performanceItemsIndex].items;

                var selectedCategory;
                for (var x = 0; x < categoryItems.length; x++) {
                    if (categoryItems[x].path === selectedCategoryPathName) {
                        selectedCategory = categoryItems[x];
                        break;
                    }
                }

                if (angular.isDefined(selectedCategory)) {
                    $scope.changeCategory(selectedCategory, $scope.performanceDataPartial);
                }
            }
        };

        //PERFORMANCE DATA VALIDATION
        $scope.pdvModalTableOrder = [];
        $scope.pdvModalCurrentPage = 0;
        $scope.pdvModalPageSize = 10;
        $scope.consumptionRecordErrorNotifications = [];

        $scope.removeExcludedProperties = function () {
            if (angular.isDefined($scope.categoryToVerifyPath)) {
                if ($scope.categoryToVerifyPath != 'energy' && $scope.categoryToVerifyPath != null) {

                    var enumOfDropbox = $scope.searchArrayForProperty($scope.dataValidationCategories, 'path', $scope.categoryToVerifyPath)[0].enum;
                    var toRemove = [];
                    $scope.propertyList = $scope.propertyListAll.filter(function (property) {
                        var validForUtility = property.excludedUtilityTypes.indexOf(enumOfDropbox) === -1;

                        if (!validForUtility) {
                            toRemove.push(property.propertyNumber);
                        }

                        return validForUtility;
                    });

                    $scope.selectedPropertyList = $scope.selectedPropertyList.filter(function (propertyNumber) {
                        return toRemove.indexOf(propertyNumber) === -1;
                    });

                }
            }
        };

        $scope.loadPropertiesForSelection = function () {
            return PropertyLookup.findAllAsDTO({}, function (data, headers) {
                $scope.propertyList = angular.copy(data);
                $scope.propertyListAll = angular.copy($scope.propertyList);

                var selectedProperty = $scope.searchArrayForProperty($scope.propertyList, 'propertyNumber', $scope.currentProperty.propertyNumber)[0];

                $scope.selectedPropertyList.length = 0;
                $scope.selectedPropertyList.push(selectedProperty.propertyNumber);

                $scope.removeExcludedProperties();
            }, function (httpResponse) {
                // alert( JSON.stringify( httpResponse ) );
                $scope.propertyList = [];
            }).$promise;
        };

        $scope.isValidSelection = function () {

            if (angular.isDefined($scope.categoryToVerifyPath) && $scope.selectedPropertyList.length > 0) {
                if ($scope.categoryToVerifyPath != 'energy' && $scope.categoryToVerifyPath != null) {
                    return true;
                }
            }

            return false;

        };

        $scope.getProblematicConsumptionNotifications = function () {
            // As of now, we only get the current property's list of problematic billing data.
            var selectedPropertyNumbers = angular.copy($scope.selectedPropertyList);
            /*if( selectedPropertyNumbers.length == 0 ) {
             $scope.loadYearsForSelectedCategoryToVerify()
             }*/
            if (angular.isUndefined($scope.selectedCategoryToVerifyYear) || $scope.selectedCategoryToVerifyYear == null || $scope.selectedCategoryToVerifyYear == "") {
                $scope.selectedCategoryToVerifyYear = null;
                $scope.yearToDisplay = "";
            } else {
                $scope.yearToDisplay = "(" + angular.copy($scope.selectedCategoryToVerifyYear) + ")";
            }

            $scope.consumptionRecordErrorNotifications.length = 0;

            $scope.getPropertyConsumptionChartData($scope.currentProperty, selectedPropertyNumbers, $scope.categoryToVerifyPath, $scope.selectedCategoryToVerifyYear, false);


        };

        $scope.exportProblematicConsumptionNotificationToXLS = function () {
            var selectedPropertyNumbers = $scope.extractListOfPropertyNumbers($scope.selectedPropertyList);

            if (angular.isDefined($scope.currentProperty)) {
                var chartDataURL = contextPath + '/webapi/properties/' + $scope.currentProperty.propertyNumber + '/' + $scope.categoryToVerifyPath + '/chartData';

                if ($scope.selectedCategoryToVerifyYear === null) { // All years data
                    $scope.openInNewWindow('POST', chartDataURL + '/export/xls/', {propertyNumbers: selectedPropertyNumbers});

                } else {
                    $scope.openInNewWindow('POST', chartDataURL + '/year/export/xls/' + $scope.selectedCategoryToVerifyYear, {propertyNumbers: selectedPropertyNumbers});
                }
            }
        };

        $scope.selectedPropertyChanged = function () {
            // $scope.loadYearsForSelectedCategoryToVerify( $scope.categoryToVerifyPath );
            $scope.getProblematicConsumptionNotifications();
        };

        $scope.printNotificationsTable = function () {

            var table = document.getElementById("problematicConsumptionNotificationsTable");

            var domClone = table.cloneNode(true);

            var $printSection = document.getElementById("printSection");

            if (!$printSection) {
                var $printSection = document.createElement("div");
                $printSection.id = "printSection";
                document.body.appendChild($printSection);
            } else {
                while ($printSection.firstChild) {
                    $printSection.removeChild($printSection.firstChild);
                }
            }

            $printSection.appendChild(domClone);
            window.print();
        };

        $scope.getPropertyConsumptionChartData = function (currentProperty, propertyNumbers, sustainabilityConsumptionCategoryPath, selectedYear, isDrawChart, meterNumber) {
            if (angular.isDefined(currentProperty)) {
                var chartDataURL = contextPath + '/webapi/properties/' + currentProperty.propertyNumber + '/' + sustainabilityConsumptionCategoryPath + '/chartData';
                $scope.sustainabilityChartsLoading = true;
                $scope.consumptionChartLoading = true;
                $scope.noEmissionFactorPresent = false;

                if (selectedYear === null) { // All years data
                    if (angular.isDefined(meterNumber) && meterNumber.length > 0) {
                        chartDataURL = chartDataURL + '/meter/' + meterNumber
                    }

                    $q.all([
                        $http.put(chartDataURL, propertyNumbers)
                            .success(function (data) {
                                $scope.consumptionChartLoading = false;
                                if (isDrawChart == true) {
                                    $scope.consumptionChart = $scope.drawPerformanceChart(data[0], 'consumptionChartArea', 'Consumption');
                                }

                                $scope.consumptionRecordErrorNotifications = data[1];
                            })
                    ]).then(function () {
                        $scope.sustainabilityChartsLoading = false;
                    }, function (httpResponse) {
                        $scope.sustainabilityChartsLoading = false;
                        switch (httpResponse.status) {
                            case 405:
                                $scope.noEmissionFactorPresent = true;
                                break;
                            default:
                                var errorMsg = "An error occurred while trying to load the Consumption Chart!";
                                $scope.addAlert(errorMsg, "danger");
                                break;
                        }
                    });

                } else {
                    if (angular.isDefined(meterNumber) && meterNumber.length > 0) {
                        chartDataURL = chartDataURL + '/year/' + selectedYear + '/meter/' + meterNumber;
                    } else {
                        chartDataURL = chartDataURL + '/year/' + selectedYear;
                    }

                    $q.all([
                        $http.put(chartDataURL, propertyNumbers)
                            .success(function (data) {
                                $scope.consumptionChartLoading = false;
                                if (isDrawChart == true) {
                                    $scope.consumptionChart = $scope.drawPerformanceChart(data[0], 'consumptionChartArea', 'Consumption');
                                }

                                $scope.consumptionRecordErrorNotifications = data[1];
                            })
                    ]).then(function () {
                        $scope.sustainabilityChartsLoading = false;
                    }, function (httpResponse) {
                        // Error
                        $scope.sustainabilityChartsLoading = false;
                        switch (httpResponse.status) {
                            case 405:
                                $scope.noEmissionFactorPresent = true;
                                break;
                            default:
                                var errorMsg = "An error occurred while trying to load the Consumption Chart!";
                                $scope.addAlert(errorMsg, "danger");
                                break;
                        }
                    });
                }
            }
        };

        $scope.drawPerformanceChart = function (chartData, chartId, chartTitle) {
            var options = {
                title: chartTitle,
                hAxis: {title: chartData[0][0]},
                vAxis: {title: chartData[0][1], viewWindow: {min: 0}},
                legend: {position: 'none'}
            };

            var data = google.visualization.arrayToDataTable(chartData, false);

            if (document.getElementById(chartId)) {
                var chart = new google.visualization.ColumnChart(document.getElementById(chartId));
                chart.draw(data, options);
                return chart;
            }
        };

        $scope.isNotEnergyCategory = function () {
            var category = SelectedCategory.getSelectedCategory();

            if (angular.isDefined(category)) {
                return category.enum !== $scope.UTILITIES.ENERGY;
            } else {
                return true;
            }

        };

        $scope.hasNoRawRecords = function () {
            var records = ControllerInfoPasser.get($scope.RAW_RECORDS_KEY);

            if (angular.isUndefined(records) || records.length === 0) {
                return true;
            } else {
                return false;
            }
        };

        $scope.isLookingAtTransactions = function () {
            var looking = ControllerInfoPasser.get($scope.LOOKING_AT_TRANSACTIONS_KEY);

            if (angular.isUndefined(looking)) {
                return false;
            } else {
                return looking;
            }
        };

        //init
        $scope.getCategories();
        $scope.getRealpacCategories();
        $scope.getGresbCategories();
        $scope.getAccess();

    }])
    .controller('PerformanceDataOptionsFormCtrl', ['$scope', 'SelectedProperty', 'PropertyLookup', '$http', 'SysConfigService', 'WeatherStationService', function ($scope, SelectedProperty, PropertyLookup, $http, SysConfigService, WeatherStationService) {

        $scope.energySourcePanelState = true;
        $scope.weatherNormalizationOptionsPanelState = false;
        $scope.utilityNormalizationPanelState = false;

        $scope.initialize = function () {

            $scope.currentProperty = SelectedProperty.getSelectedProperty();

            $scope.heatingBase = $scope.currentProperty.heatingBaseTemperature;
            $scope.coolingBase = $scope.currentProperty.coolingBaseTemperature;
            $scope.temperatureUnit = $scope.currentProperty.temperatureUnit;
            $scope.weatherStation = $scope.currentProperty.weatherStationUUID;
            $scope.baseDailyElectricityConsumption = $scope.currentProperty.baseDailyElectricityConsumption;

            $scope.options = {
                ELECTRICITY: true,
                NATURAL_GAS: true,
                WATER: true,
                STEAM: true,
                CHILLED_WATER: true,
                HEATING_OIL: true,
                DIESEL: true,
                PROPANE: true
            };

            for (var i = 0; i < $scope.currentProperty.excludedUtilityTypes.length; i++) {
                $scope.options[$scope.utilityToEnum($scope.currentProperty.excludedUtilityTypes[i])] = false;
            }
        };

        $scope.utilityToEnum = function (utility) {
            return utility.toUpperCase().replace(" ", "_");
        };

        var persistingFinishedCallback = function (value, responseHeaders) {
            $scope.addAlert("Successfully saved the information.", "success", 10000);
        };

        $scope.savePerformanceDataOptions = function () {

            var excludedUtilityTypes = [];

            for (var option in $scope.options) {
                if ($scope.options[option] === false) {
                    excludedUtilityTypes.push(option);
                }
            }

            $scope.currentProperty.utilityTypesExclusions = excludedUtilityTypes.toString();
            $scope.currentProperty.excludedUtilityTypes = excludedUtilityTypes;

            $scope.currentProperty.heatingBaseTemperature = $scope.isEmptyString($scope.heatingBase) ? undefined : $scope.heatingBase;
            $scope.currentProperty.coolingBaseTemperature = $scope.isEmptyString($scope.coolingBase) ? undefined : $scope.coolingBase;
            $scope.currentProperty.temperatureUnit = $scope.temperatureUnit;
            $scope.currentProperty.weatherStationUUID = $scope.weatherStation;
            $scope.currentProperty.baseDailyElectricityConsumption = $scope.baseDailyElectricityConsumption;

            PropertyLookup.update({propertyNumber: $scope.currentProperty.propertyNumber},
                $scope.currentProperty,
                persistingFinishedCallback,
                function (httpResponse) {
                    $scope.addAlert('There was an error updating the performance data options for the property!', 'danger', 10000);
                }
            );
        };

        $scope.determineIfUserCanEditOptions = function () {
            $http.get($scope.getContextPath() + '/webapi/properties/security/dataoptions/canManage').success(function (data, status) {
                if (data === 'true') {
                    $scope.canCurrentUserEditOptions = true;
                } else {
                    $scope.canCurrentUserEditOptions = false;
                }
            }).error(function (status) {
            });
        };

        var getWeatherNormalizationSystemDefaults = function () {
            SysConfigService.getMultipleKeys({}, WEATHER_NORMALIZE_SYS_CONFIG_KEYS, function (data) {
                $scope.defaultHeatingBase = data[DEFAULT_HEATING_BASE_TEMP];
                $scope.defaultCoolingBase = data[DEFAULT_COOLING_BASE_TEMP];
                $scope.defaultTemperatureUnits = data[DEFAULT_TEMP_UNIT];
            }, function () {
                $scope.addAlert('There was an error getting the system defaults for weather normalization!', 'danger', 10000);
            });
        };

        var findWeatherStations = function () {
            WeatherStationService.query({}, function (data) {
                $scope.weatherStations = angular.copy(data);
            }, function () {
                $scope.addAlert('An error has occurred getting the list of weather stations!');
            })
        };

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, category) {
            $scope.initialize();
        });

        $scope.initialize();
        $scope.determineIfUserCanEditOptions();
        getWeatherNormalizationSystemDefaults();
        findWeatherStations();
        $scope.loadDropboxes(['temperatureUnits']);
    }])
    .controller('UtilityFormCtrl', ['$scope', 'UtilityService', 'SelectedCategory', 'SelectedProperty', 'ControllerInfoPasser', function ($scope, UtilityService, SelectedCategory, SelectedProperty, ControllerInfoPasser) {
        $scope.currentProperty = SelectedProperty.getSelectedProperty();
        $scope.category = SelectedCategory.getSelectedCategory();
        $scope.path = $scope.category.path;
        $scope.saveTag = "_Settings";

        $scope.showSnapshotModal = function () {
            ControllerInfoPasser.broadcast("event:displaySnapshotModal");
        };

        $scope.submitRecord = function () {
            if ($scope.utilityForm.$valid) {
                if ($scope.currentProperty) {

                    if (angular.isObject($scope.currentBuilding)) {
                        $scope.utility.buildingNumber = $scope.currentBuilding.buildingNumber;
                        $scope.utility.building_FK = $scope.currentBuilding.id;
                    }

                    $scope.storeUtilitySessionDefaults($scope.utility);

                    if ($scope.action == 'Save') {
                        UtilityService.save({
                            propertyNumber: $scope.currentProperty.propertyNumber,
                            utility: $scope.path
                        }, $scope.utility, function (value, responseHeaders) {
                            // Success
                            $scope.addAlert('Successfully added record to property: ' + value.propertyNumber, 'success');
                            $scope.clearFormObject();
                            $scope.changeMiddleSectionTo($scope.performanceDataPartial);
                        }, function (httpResponse) {
                            // Error
                            ControllerInfoPasser.broadcast('event:errorPersisting');
                            switch (httpResponse.status) {
                                case 304:
                                    $scope.addAlert('A record with the same meter number, period start and end date already exists', 'warning');
                                    break;
                                case 417:
                                    $scope.showSnapshotModal();
                                    break;
                                default:
                                    $scope.addAlert('There was an error adding the record!', 'danger');
                                    break;
                            }

                        });
                    } else { // Updating record
                        UtilityService.update({
                            propertyNumber: $scope.currentProperty.propertyNumber,
                            utility: $scope.path
                        }, $scope.utility, function (value, responseHeaders) {
                            // Success
                            $scope.addAlert('Successfully updated record for property: ' + value.propertyNumber, 'success');
                            $scope.clearFormObject();
                            $scope.changeMiddleSectionTo($scope.performanceDataPartial)
                        }, function (httpResponse) {
                            // Error
                            ControllerInfoPasser.broadcast('event:errorPersisting');
                            switch (httpResponse.status) {
                                case 304:
                                    $scope.addAlert('A record with the same meter number, period start and end date already exists', 'warning');
                                    break;
                                case 417:
                                    $scope.showSnapshotModal();
                                    break;
                                default:
                                    $scope.addAlert('There was an error adding the record!', 'danger');
                                    break;
                            }

                        });
                    }

                } else { // No property selected
                    $scope.addAlert('Please select a property before trying to submit a record', 'danger');
                    ControllerInfoPasser.broadcast('event:errorPersisting');
                }
            } else {
                // Invalid form
                $scope.addAlert('Invalid input. Please check the form fields', 'warning');
                ControllerInfoPasser.broadcast('event:errorPersisting');
            }
        };

        $scope.storeUtilitySessionDefaults = function (record) {
            var util = angular.copy($scope.masterForm);
            util.recordType = record.recordType;
            util.isTenantPaid = record.isTenantPaid;
            util.isEstimate = record.isEstimate;

            ControllerInfoPasser.put($scope.path + $scope.saveTag, util);
        };

        $scope.deleteRecord = function () {
            var propertyNumber = $scope.currentProperty.propertyNumber;
            UtilityService.delete({
                propertyNumber: propertyNumber,
                utility: $scope.path,
                id: $scope.utility.id
            }, function (value, responseHeaders) {
                // Success
                $scope.addAlert('Successfully deleted record from property: ' + propertyNumber, 'success');
                $scope.clearFormObject();
                $scope.changeMiddleSectionTo($scope.performanceDataPartial);
            }, function (httpResponse) {
                // Error
                ControllerInfoPasser.broadcast('event:errorPersisting');
                switch (httpResponse.status) {
                    case 417:
                        $scope.showSnapshotModal();
                        break;
                    default:
                        $scope.addAlert('There was an error deleting the record!', 'danger');
                        break;
                }

            });
        };

        $scope.clearFormObject = function () {
            $scope.refreshPropertyInfo();

            if ($scope.utilityForm) {
                $scope.utilityForm.$setPristine();
            }

            $scope.utility = angular.copy($scope.masterForm);

            if (ControllerInfoPasser.get('recordToEdit')) {
                $scope.utility = ControllerInfoPasser.get('recordToEdit');
                ControllerInfoPasser.clear('recordToEdit');
                $scope.action = 'Update';
            } else {
                if (ControllerInfoPasser.get($scope.path + $scope.saveTag)) {
                    $scope.utility = ControllerInfoPasser.get($scope.path + $scope.saveTag);
                }
                $scope.action = 'Save';
            }

        };

        $scope.refreshPropertyInfo = function () {
            $scope.currentProperty = SelectedProperty.getSelectedProperty();

            $scope.masterForm = {
                propertyNumber: (($scope.currentProperty) ? $scope.currentProperty.propertyNumber : undefined), // If current property selected use it, if not set to ''
                property_FK: (($scope.currentProperty) ? $scope.currentProperty.id : undefined), // If current property selected use it, if not set to ''
                buildingNumber: '',
                consumption: '',
                units: $scope.category.units[0],
                totalCost: '',
                costPerUnit: '',
                meterNumber: '',
                meterMultiplier: '',
                readingDate: '',
                periodStartDate: '',
                periodEndDate: '',
                isTenantPaid: false,
                isEstimate: false,
                recordType: $scope.CONSUMPTION_RECORD_TYPE.CONSUMPTION
            };

            if ($scope.utility) {
                $scope.utility.propertyNumber = $scope.currentProperty.propertyNumber;
            } else {
                $scope.utility = angular.copy($scope.masterForm);
            }
        };

        $scope.$on('event:clearRecord', function () {
            $scope.clearFormObject();
        });

        $scope.$on('event:saveRecord', function () {
            $scope.submitRecord();
        });

        $scope.$on('event:deleteRecord', function () {
            $scope.deleteRecord();
        });

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function () {
            $scope.refreshPropertyInfo();
            $scope.changeMiddleSectionTo($scope.performanceDataPartial);
        });

        $scope.hideFieldOnCategory = function () {
            if (angular.isDefined($scope.category)) {
                if ($scope.category.enum === $scope.UTILITIES.PROPANE || $scope.category === $scope.UTILITIES.HEATING_OIL || $scope.category === $scope.UTILITIES.DIESEL) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        };

        $scope.loadDropboxes(['consumptionRecordTypes']);

    }])
    .controller('PerformanceDataCtrl', ['$scope', 'ControllerInfoPasser', 'UtilityService', 'SelectedCategory', '$filter', 'MonthlyOccupancyService', '$http', function ($scope, ControllerInfoPasser, UtilityService, SelectedCategory, $filter, MonthlyOccupancyService, $http) {

        $scope.category = SelectedCategory.getSelectedCategory();
        $scope.utilityMeters = [];
        $scope.selectedMeter = undefined;
        $scope.selectedConsumptionRecordType = "ALL";

        $scope.data = [];
        $scope.consumptionRecordSubset = [];
        $scope.inventoryLoading = false;

        $scope.currentPage = 0;
        $scope.pageSize = 10;
        $scope.recordsOrder = ['-periodEndDate'];

        $scope.consumptionRecordErrorNotifications = [];

        var allChartTypes = [];
        $scope.chartTypes = [];
        $scope.chartBy = $scope.energyChartCategoryEnums.CONSUMPTION;

        $scope.chartData = [];
        $scope.reductionTargetsChartData = [];
        $scope.intensityChartData = [];
        $scope.costChartData = [];
        $scope.costPerSqftChartData = [];

        $scope.performanceChartNameEnums = {
            PERFORMANCE: 'CONSUMPTION',
            REDUCTION_TARGETS: 'TARGET'
        };

        $scope.selectedChartType = $scope.performanceChartNameEnums.PERFORMANCE;

        $scope.yearsAvailable = [];
        $scope.selectedYear = undefined;
        $scope.summaryData = [];

        $scope.intervalData = [];

        $scope.lookingAtTransactions = false;

        $scope.monthToCompareAnnually = undefined;

        $scope.normalizeOnOccupancy = false;


        var ALL_METERS = 'All Meter Numbers';

        var chartAreaId = 'consumptionChartArea';

        var DECIMAL_FORMAT = 'decimal';
        var CURRENCY_FORMAT = 'currency';

        $http.get($scope.getContextPath() + '/webapi/systemconfig/security/Security:OccupancyCRUD/' + $scope.moduleAccessTypes['R']).success(function (accessType) {
            // The object returned is of structure {"$": "R"}
            $scope.occupancyEditAllowed = $scope.moduleAccessTypes[accessType['$']];
        }).error(function () {
            $scope.occupancyEditAllowed = $scope.moduleAccessTypes['R'];
        });

        var getPropertyYearsForSelectBox = function (restoring) {
            $scope.yearsAvailable.length = 0;

            var propertyNumber = $scope.currentProperty.propertyNumber;
            var propertyNumbers = [propertyNumber];

            UtilityService.getYearsForProperty({
                propertyNumber: propertyNumber,
                utility: $scope.category.path
            }, propertyNumbers, function (years) {
                $scope.yearsAvailable = years.list;

                if ($scope.yearsAvailable.length > 0 && (restoring === false || $scope.yearsAvailable.indexOf($scope.selectedYear) === -1)) {
                    $scope.selectedYear = $scope.yearsAvailable[0];
                    $scope.setLastDayInYear();
                }

                refreshLandingPage(restoring);

            });
        };

        $scope.getBuildingYearsForSelectBox = function (buildingNumbers) {
            $scope.yearsAvailable.length = 0;

            UtilityService.getYearsForBuildings({
                propertyNumber: $scope.currentProperty.propertyNumber,
                utility: $scope.category.path
            }, buildingNumbers, function (years) {
                $scope.yearsAvailable = years.list;
            });
        };


        $scope.getLandingPageData = function () {
            $scope.currentPage = 0;

            $scope.checkMeterNumber();
            $scope.clearChart('consumptionChartArea');
            filterChartTypesIfNeeded();

            // currently no capability to select other properties yet, so an array is with the current property as content will be supplied instead.
            var propertyNumbers = [];
            propertyNumbers.push($scope.currentProperty.propertyNumber);

            $scope.sustainabilityChartsLoading = true;
            $scope.consumptionChartLoading = true;
            $scope.data.length = 0;
            $scope.summaryData.length = 0;
            $scope.intervalData.length = 0;

            var meterNumber;
            if ($scope.isEmptyString($scope.selectedMeter)) {
                if ($scope.category.enum === $scope.UTILITIES.ENERGY) {
                    // All energy types includes all meters on the server
                    meterNumber = '';
                } else {
                    meterNumber = ALL_METERS;
                }
            } else {
                meterNumber = $scope.selectedMeter;
            }

            ControllerInfoPasser.clear($scope.RAW_RECORDS_KEY);

            if (angular.isUndefined($scope.selectedEndDate) || $scope.selectedEndDate === null) {
                $scope.sustainabilityChartsLoading = false;
                $scope.consumptionChartLoading = false;

                $scope.chartData = undefined;
                $scope.reductionTargetsChartData = undefined;
                $scope.intensityChartData = undefined;
                $scope.costChartData = undefined;
                $scope.costPerSqftChartData = undefined;

                $scope.addAlert('The property \'' + $scope.currentProperty.name + '\' does not have any ' + $scope.category.label + ' records', 'info', 10000);
                return;
            }

            if ($scope.isEmptyString($scope.monthToCompareAnnually) || $scope.selectedPeriod !== $scope.targetPeriodEnum.ANNUAL) {
                UtilityService.getChartDataForLandingPage({
                    propertyNumber: $scope.currentProperty.propertyNumber,
                    utility: $scope.category.path,
                    period: $scope.selectedPeriod,
                    meterNumber: meterNumber,
                    normalizeOnOccupancy: $scope.selectedPeriod === $scope.targetPeriodEnum.ANNUAL ? $scope.normalizeOnOccupancy : false
                }, {
                    endDate: $scope.selectedEndDate
                }, landingPageSuccess, landingPageError);
            } else {
                UtilityService.getChartDataForLandingPageCompareMonth({
                    propertyNumber: $scope.currentProperty.propertyNumber,
                    utility: $scope.category.path,
                    meterNumber: meterNumber,
                    month: $scope.monthToCompareAnnually
                }, {
                    endDate: $scope.selectedEndDate
                }, landingPageSuccess, landingPageError);
            }
        };

        var landingPageSuccess = function (data) {
            $scope.sustainabilityChartsLoading = false;
            $scope.consumptionChartLoading = false;

            $scope.data = angular.copy(data.rawRecords);
            $scope.consumptionRecordSubset = angular.copy($scope.data);
            $scope.consumptionRecordErrorNotifications = angular.copy(data.validationErrors);

            $scope.chartData = angular.copy(data.consumptionChartData);
            $scope.reductionTargetsChartData = angular.copy(data.reductionTargetsChartData);
            $scope.intensityChartData = angular.copy(data.intensityChartData);
            $scope.costChartData = angular.copy(data.costChartData);
            $scope.costPerSqftChartData = angular.copy(data.costPerSqftChartData);

            $scope.summaryData = angular.copy(data.summary);
            $scope.hasDailyData = data.hasDailyData;

            ControllerInfoPasser.put($scope.RAW_RECORDS_KEY, $scope.data);

            $scope.drawPerformanceDataChart($scope.selectedChartType);
        };

        var landingPageError = function (httpResponse) {
            $scope.sustainabilityChartsLoading = false;
            $scope.consumptionChartLoading = false;

            switch (httpResponse.status) {
                case 417:
                    // The message to show needs compiled HTML and ng vars so this way is easier than displayMessageInElement
                    $('.not-granular').toggleClass('hidden');
                    $scope.timeout(function () {
                        $('.not-granular').toggleClass('hidden');
                    }, 10000);
                    $scope.drillUpLevel();
                    break;
                default:
                    $scope.addAlert('An error has occurred getting the consumption data!');
            }
        };

        var filterChartTypesIfNeeded = function () {
            if (($scope.selectedPeriod === $scope.targetPeriodEnum.ANNUAL || $scope.selectedPeriod === $scope.targetPeriodEnum.MONTHLY) && $scope.category.enum !== $scope.UTILITIES.ENERGY) {
                $scope.chartTypes = angular.copy(allChartTypes);
            } else {
                // Remove target reduction chart, not applicable to the weekly/daily/interval levels
                $scope.chartTypes = allChartTypes.filter(function (elm) {
                    return elm.value !== $scope.performanceChartNameEnums.REDUCTION_TARGETS;
                });

                // Reset chart selection if set to reduction targets
                if ($scope.selectedChartType === $scope.performanceChartNameEnums.REDUCTION_TARGETS) {
                    $scope.selectedChartType = $scope.performanceChartNameEnums.PERFORMANCE;
                }
            }

        };

        $scope.drawReductionTargetsChart = function () {
            if (angular.isUndefined($scope.reductionTargetsChartData)) {
                return;
            }

            var options = {
                title: '',
                hAxis: {title: $scope.reductionTargetsChartData[0][0]},
                vAxis: {title: 'Consumption and Targets', viewWindow: {min: 0}},
                seriesType: 'bars',
                legend: {position: 'none'}
            };

            var consumptionColumn = 1;
            var reductionColumn = 2;

            var data = google.visualization.arrayToDataTable($scope.reductionTargetsChartData, false);

            var numberFormat = new google.visualization.NumberFormat();
            numberFormat.format(data, consumptionColumn);
            numberFormat.format(data, reductionColumn);

            if (document.getElementById(chartAreaId)) {
                var chart = new google.visualization.ComboChart(document.getElementById(chartAreaId));
                chart.draw(data, options);
                return chart;
            }
        };

        $scope.drawPerformanceDataChart = function () {
            if ($scope.selectedChartType === $scope.performanceChartNameEnums.REDUCTION_TARGETS) {
                $scope.drawReductionTargetsChart();
            } else {
                switch ($scope.chartBy) {
                    case $scope.energyChartCategoryEnums.CONSUMPTION:
                        $scope.consumptionChart = drawLandingPageChart($scope.chartData, DECIMAL_FORMAT);
                        break;
                    case $scope.energyChartCategoryEnums.INTENSITY:
                        $scope.consumptionChart = drawLandingPageChart($scope.intensityChartData, DECIMAL_FORMAT);
                        break;
                    case $scope.energyChartCategoryEnums.COST:
                        $scope.consumptionChart = drawLandingPageChart($scope.costChartData, CURRENCY_FORMAT);
                        break;
                    case $scope.energyChartCategoryEnums.COST_INTENSITY:
                        $scope.consumptionChart = drawLandingPageChart($scope.costPerSqftChartData, CURRENCY_FORMAT);
                        break;
                    default:
                        break;
                }
            }
        };

        var drawLandingPageChart = function (chartData, vAxisFormat) {
            if (angular.isUndefined(chartData)) {
                return;
            }

            var yAxisColumn = 1;
            var tooltipPrefix = vAxisFormat === DECIMAL_FORMAT ? '' : '$';

            var options = {
                hAxis: {title: chartData[0][0]},
                vAxis: {title: chartData[0][1], viewWindow: {min: 0}, format: vAxisFormat},
                legend: {position: 'none'}
            };

            var data = google.visualization.arrayToDataTable(chartData, false);

            var number_formatter = new google.visualization.NumberFormat({
                prefix: tooltipPrefix
            });

            number_formatter.format(data, yAxisColumn);

            var chart = new google.visualization.ColumnChart(document.getElementById(chartAreaId));
            chart.draw(data, options);
            return chart;
        };

        $scope.getUtilityMeters = function (restoring) {
            $scope.utilityMeters.length = 0;

            if ($scope.category.enum === $scope.UTILITIES.ENERGY) {
                return; // No utility meters
            }

            if (restoring === false) {
                $scope.selectedMeter = '';
            }

            UtilityService.findMeterNumbersForPropertyAndYear({
                propertyNumber: $scope.currentProperty.propertyNumber,
                utility: $scope.category.path,
                year: $scope.selectedYear
            }, function (data) {
                $scope.utilityMeters = angular.copy(data.meterNumbers);
            }, function (httpResponse) {
                $scope.addAlert('An error has occurred getting the utility meters for property ' + $scope.currentProperty.name, 'danger', 10000);
            });
        };

        $scope.checkMeterNumber = function () {
            if ($scope.selectedMeter === null) {
                $scope.selectedMeter = '';
            }
        };

        $scope.getDefaultDateFromPeriod = function () {
            var now = new moment();
            if ($scope.selectedPeriod === $scope.targetPeriodEnum.ANNUAL || $scope.selectedPeriod === $scope.targetPeriodEnum.MONTHLY) {
                $scope.selectedEndDate = now.startOf('year').subtract(1, 'days').toDate();
            } else {
                if ($scope.selectedPeriod === $scope.targetPeriodEnum.WEEKLY) {
                    $scope.selectedEndDate = now.subtract(1, 'weeks').startOf('isoWeek').toDate();
                } else {
                    // Daily
                    $scope.selectedEndDate = now.startOf('day').subtract(1, 'days').toDate();
                }
            }
        };

        $scope.editRecord = function (record) {
            savePerformanceDataView();

            ControllerInfoPasser.put('recordToEdit', record);
            $scope.action = 'Update';
            ControllerInfoPasser.broadcast("event:editingRecord");
            $scope.changeMiddleSectionTo('partials/sustainability/utilityInput.html');
        };

        $scope.isMatchingMeter = function () {
            return function (utilityRecord) {
                if ($scope.isEmptyString($scope.selectedMeter) || $scope.selectedMeter.length === 0) {
                    return true;
                } else {
                    return utilityRecord.meterNumber === $scope.selectedMeter;
                }
            };
        };

        $scope.filterConsumptionByType = function (type) {
            if (angular.isDefined($scope.data) && angular.isDefined(type)) {

                $scope.consumptionRecordSubset.length = 0;

                if (type === 'ALL') {
                    $scope.consumptionRecordSubset = angular.copy($scope.data);
                } else {
                    for (var x = 0; x < $scope.data.length; x++) {
                        if ($scope.data[x].recordType === type) {
                            $scope.consumptionRecordSubset.push($scope.data[x]);
                        }
                    }
                }
            }
        };

        var refreshLandingPage = function (restoring) {
            $scope.getUtilityMeters(restoring);
            $scope.getLandingPageData();
        };

        $scope.setLastDayInYear = function () {
            $scope.selectedEndDate = $scope.getLastDayInYear($scope.selectedYear);
        };

        $scope.setLastDayInMonth = function () {
            var lastDayInMonth = $scope.getLastDayInMonth($scope.selectedYear, $scope.selectedMonth);
            $scope.selectedEndDate = $scope.getLastDayInWeek(lastDayInMonth);
        };

        $scope.drillDownLevel = function (year, month, date) {
            if ($scope.selectedPeriod === $scope.targetPeriodEnum.ANNUAL) {
                getMonthDataForYear(year);
            } else {
                if ($scope.selectedPeriod === $scope.targetPeriodEnum.MONTHLY) {
                    if ($scope.category.enum === $scope.UTILITIES.ENERGY) {
                        return;
                    } else {
                        getWeekDataForMonth(year, month);
                    }
                } else {
                    if ($scope.selectedPeriod === $scope.targetPeriodEnum.WEEKLY) {
                        getDayDataForWeek(date);
                    } else {
                        if ($scope.selectedPeriod === $scope.targetPeriodEnum.DAILY) {
                            $scope.getIntervalDataForDay(date);
                        }
                    }
                }
            }
        };

        var getMonthDataForYear = function (year) {
            $scope.selectedYear = year.toString();
            $scope.setLastDayInYear();
            $scope.selectedPeriod = $scope.targetPeriodEnum.MONTHLY;
            refreshLandingPage();

        };

        var getWeekDataForMonth = function (year, month) {
            if ($scope.isEmptyString($scope.selectedMeter)) {

                if ($scope.utilityMeters.length === 0) {
                    $scope.displayMessageInElement('.info-pane', 'There are no utility meters for the selected period. A utility meter is required to drill down further', 5000);
                } else {
                    $scope.displayMessageInElement('.info-pane', 'Select a meter to drill down to weekly and daily data', 5000);
                }

                return;
            }

            $scope.selectedYear = year.toString();
            $scope.selectedMonth = month.toString();
            $scope.setLastDayInMonth();
            $scope.selectedPeriod = $scope.targetPeriodEnum.WEEKLY;
            $scope.selectedChartType = $scope.performanceChartNameEnums.PERFORMANCE;
            refreshLandingPage();

        };

        var getDayDataForWeek = function (date) {
            if (angular.isString(date)) {
                date = $scope.stringToDate(date);
            }

            $scope.selectedEndDate = $scope.getLastDayInWeek(date);
            $scope.selectedChartType = $scope.performanceChartNameEnums.PERFORMANCE;
            $scope.selectedPeriod = $scope.targetPeriodEnum.DAILY;
            refreshLandingPage();

        };

        $scope.drillUpLevel = function () {
            if ($scope.lookingAtTransactions) {
                ControllerInfoPasser.clear($scope.LOOKING_AT_TRANSACTIONS_KEY);
                $scope.lookingAtTransactions = false;
                refreshLandingPage();
                return;
            }

            switch ($scope.selectedPeriod) {
                case $scope.targetPeriodEnum.INTERVAL:
                    $scope.selectedPeriod = $scope.targetPeriodEnum.DAILY;
                    getDayDataForWeek($scope.selectedEndDate);
                    break;
                case $scope.targetPeriodEnum.DAILY:
                    $scope.selectedPeriod = $scope.targetPeriodEnum.WEEKLY;
                    getWeekDataForMonth($scope.selectedYear, $scope.selectedMonth);
                    break;
                case $scope.targetPeriodEnum.WEEKLY:
                    $scope.selectedPeriod = $scope.targetPeriodEnum.MONTHLY;
                    getMonthDataForYear($scope.selectedYear);
                    break;
                case $scope.targetPeriodEnum.MONTHLY:
                    $scope.selectedPeriod = $scope.targetPeriodEnum.ANNUAL;
                    getPropertyYearsForSelectBox(false);
                    break;
                default:
                    break;
            }
        };

        $scope.showErrorsForPeriod = function (summaryForPeriod) {
            if ($scope.selectedPeriod === $scope.targetPeriodEnum.ANNUAL) {
                $('.modal-errors-date').html(summaryForPeriod.year);
            } else {
                if ($scope.selectedPeriod === $scope.targetPeriodEnum.MONTHLY) {
                    $('.modal-errors-date').html($filter('numberToMonthFullName')(summaryForPeriod.month) + ' ' + summaryForPeriod.year);
                } else {
                    $('.modal-errors-date').html($scope.fullDateToFormattedText(summaryForPeriod.date));
                }
            }

            $('.modal-errors').html(summaryForPeriod.problems);
        };

        $scope.checkMeterAndPeriod = function () {
            if ($scope.isEmptyString($scope.selectedMeter)) {
                if ($scope.selectedPeriod === $scope.targetPeriodEnum.WEEKLY) {
                    $scope.drillUpLevel();
                } else {
                    if ($scope.selectedPeriod === $scope.targetPeriodEnum.DAILY || $scope.selectedPeriod === $scope.targetPeriodEnum.INTERVAL) {
                        // Setting this avoids double calling drillUpLevel
                        $scope.selectedPeriod = $scope.targetPeriodEnum.WEEKLY;
                        $scope.drillUpLevel(); // Up to monthly
                    } else {
                        // Monthly or annual view, no need to drill up
                        $scope.getLandingPageData();
                    }
                }
            } else {
                $scope.getLandingPageData();
            }
        };

        $scope.getIntervalDataForDay = function (date) {
            $scope.selectedChartType = $scope.performanceChartNameEnums.PERFORMANCE;
            $scope.selectedPeriod = $scope.targetPeriodEnum.INTERVAL;
            $scope.selectedIntervalDate = $scope.stringToDate(date);

            $scope.sustainabilityChartsLoading = true;
            UtilityService.getIntervalDataForDay({
                utility: $scope.category.path,
                propertyNumber: $scope.currentProperty.propertyNumber,
                meterNumber: $scope.selectedMeter,
                date: date
            }, function (data) {
                $scope.intervalData = angular.copy(data.intervalData);
                drawIntervalDataLineChart(data.chartData);
            }, function (httpResponse) {
                $scope.sustainabilityChartsLoading = false;
                $scope.addAlert('An error has occurred getting the interval data for ' + date);
            });
        };

        var drawIntervalDataLineChart = function (chartData) {
            var hTicks = [];
            var dateColumn = 0;


            /*
             Since we can't sent JS Date objects down from the server, we have to convert the axis points to dates from strings. This is so Google charts
             recognizes them as date objects and can create a continuous axis which allows us to specify which tick marks are used.
             */
            for (var i = 1; i < chartData.length; i++) {
                var date = new Date(chartData[i][dateColumn]);
                chartData[i][dateColumn] = date;

                // Only show on the hour readings in the x-axis labels
                if (date.getMinutes() === 0) {
                    hTicks.push(date);
                }
            }

            var chart = new google.visualization.LineChart(document.getElementById(chartAreaId));
            var data = google.visualization.arrayToDataTable(chartData);

            // This formatter will format the tooltips to show the date pattern specified
            var date_formatter = new google.visualization.DateFormat({
                pattern: "hh:mm a"
            });

            date_formatter.format(data, dateColumn);

            var options = {
                vAxis: {title: 'Consumption'},
                hAxis: {
                    ticks: hTicks,
                    format: 'h:mm a'
                },
                legend: {position: 'none'},
                chartArea: {
                    height: '60%',
                    width: 700 // 720
                }
            };

            $scope.sustainabilityChartsLoading = false;
            chart.draw(data, options);
        };

        $scope.getSortOrder = function () {
            if ($scope.selectedPeriod === $scope.targetPeriodEnum.MONTHLY) {
                return ['date']
            } else {
                return ['-date'];
            }
        };


        var resetAllParamsAndRefresh = function () {
            $scope.currentProperty = $scope.getSelectedProperty();

            $scope.selectedEndDate = undefined;
            $scope.selectedYear = undefined;
            $scope.selectedMonth = undefined;
            $scope.selectedMeter = undefined;
            $scope.monthToCompareAnnually = undefined;
            $scope.selectedPeriod = $scope.targetPeriodEnum.ANNUAL;
            $scope.selectedChartType = $scope.performanceChartNameEnums.PERFORMANCE;
            $scope.chartBy = $scope.energyChartCategoryEnums.CONSUMPTION;
            $scope.lookingAtTransactions = false;
            $scope.summaryData.length = 0;

            $('#' + chartAreaId).html('No Data Available');
            getPropertyYearsForSelectBox(false);
        };

        var savePerformanceDataView = function () {
            ControllerInfoPasser.put('restorePerformanceDataView', true);
            ControllerInfoPasser.put('selectedPeriod', $scope.selectedPeriod);
            ControllerInfoPasser.put('selectedEndDate', $scope.selectedEndDate);
            ControllerInfoPasser.put('selectedMeter', $scope.selectedMeter);
            ControllerInfoPasser.put('selectedYear', $scope.selectedYear);
            ControllerInfoPasser.put('selectedMonth', $scope.selectedMonth);
            ControllerInfoPasser.put('selectedChartType', $scope.selectedChartType);
            ControllerInfoPasser.put('lookingAtTransactions', $scope.lookingAtTransactions);
            ControllerInfoPasser.put('monthToCompareAnnually', $scope.monthToCompareAnnually);
            ControllerInfoPasser.put('chartBy', $scope.chartBy);
        };

        var restorePerformanceDataView = function () {
            $scope.currentProperty = $scope.getSelectedProperty();

            $scope.selectedPeriod = ControllerInfoPasser.get('selectedPeriod');
            $scope.selectedEndDate = ControllerInfoPasser.get('selectedEndDate');
            $scope.selectedMeter = ControllerInfoPasser.get('selectedMeter');
            $scope.selectedYear = ControllerInfoPasser.get('selectedYear');
            $scope.selectedMonth = ControllerInfoPasser.get('selectedMonth');
            $scope.selectedChartType = ControllerInfoPasser.get('selectedChartType');
            $scope.lookingAtTransactions = ControllerInfoPasser.get('lookingAtTransactions');
            $scope.monthToCompareAnnually = ControllerInfoPasser.get('monthToCompareAnnually');
            $scope.chartBy = ControllerInfoPasser.get('chartBy');

            ControllerInfoPasser.clear('restorePerformanceDataView');
            ControllerInfoPasser.clear('selectedPeriod');
            ControllerInfoPasser.clear('selectedEndDate');
            ControllerInfoPasser.clear('selectedMeter');
            ControllerInfoPasser.clear('selectedYear');
            ControllerInfoPasser.clear('selectedMonth');
            ControllerInfoPasser.clear('selectedChartType');
            ControllerInfoPasser.clear('monthToCompareAnnually');
            ControllerInfoPasser.clear('chartBy');

            getPropertyYearsForSelectBox(true);
        };

        $scope.editOccupancy = function (occupancy, month) {
            $scope.occupancy = angular.copy(occupancy);

            $scope.occupancy.propertyNumber = $scope.currentProperty.propertyNumber;
            $scope.occupancy.gla = $scope.currentProperty.gla;
            $scope.occupancy.year = $scope.selectedYear;
            $scope.occupancy.month = month;

            var dateStr = $scope.fullDateToFormattedText(new Date($scope.selectedYear, month), 'MMMM yyyy');
            $('.occupancy-date').html(dateStr);

            $scope.occupancyForm.$setPristine();

            $('#editOccupancyModal').modal('show');
        };

        $scope.saveOccupancy = function () {
            $scope.modalLoading = true;

            if (angular.isDefined($scope.occupancy.id)) {
                MonthlyOccupancyService.update({}, $scope.occupancy, saveOccupancySuccess, saveOccupancyError);
            } else {
                MonthlyOccupancyService.add({}, $scope.occupancy, saveOccupancySuccess, saveOccupancyError);
            }
        };

        var saveOccupancySuccess = function () {
            $('#editOccupancyModal').modal('hide');
            $scope.modalLoading = false;
            $scope.getLandingPageData();
        };

        var saveOccupancyError = function (httpResponse) {
            $scope.modalLoading = false;
            $scope.displayMessageInElement('.occupancy-error', 'An error has occurred saving the occupancy details', 10000);
        };

        $scope.showTransactions = function () {
            $scope.selectedConsumptionRecordType = "ALL";
            savePerformanceDataView();
            $scope.lookingAtTransactions = true;
            ControllerInfoPasser.put($scope.LOOKING_AT_TRANSACTIONS_KEY, $scope.lookingAtTransactions)
        };

        $scope.setDefaultDates = function () {
            $scope.excelFromDate = $scope.getFirstDayInYear($scope.selectedYear);
            $scope.excelToDate = $scope.getLastDayInYear($scope.selectedYear);
        };

        $scope.excelExtractForConsumptionRecords = function () {
            var propertyNumber = $scope.currentProperty.propertyNumber;

            var data = {
                propertyNumber: propertyNumber,
                fromDate: $scope.fullDateToFormattedText($scope.excelFromDate),
                toDate: $scope.fullDateToFormattedText($scope.excelToDate)
            };

            var url = $scope.getContextPath() + '/webapi/properties/' + propertyNumber + '/' + $scope.category.path + '/extract/excel';

            $scope.openInNewWindow('POST', url, data);
        };

        $scope.$on('event:utilityCategoryChanged', function (event, category) {
            ControllerInfoPasser.clear('utilityHasChanged');
            $scope.category = category;
            ControllerInfoPasser.put('restorePerformanceDataView', false);
            resetAllParamsAndRefresh();
        });


        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, property) {
            $scope.currentProperty = angular.copy(property);
            resetAllParamsAndRefresh();
        });

        $scope.$on('event:addUtilityRecord', function () {
            savePerformanceDataView();
        });

        if (ControllerInfoPasser.get('utilityHasChanged') === true) {
            // Need to check if user first clicked on a new utility before restoring the view
            ControllerInfoPasser.clear('utilityHasChanged');
            resetAllParamsAndRefresh();
        } else {
            if (ControllerInfoPasser.get('restorePerformanceDataView') === true) {
                restorePerformanceDataView();
            } else {
                resetAllParamsAndRefresh();
            }
        }

        $scope.loadDropboxes(['consumptionRecordFilterType', 'targetPeriods', 'performanceDataChartTypes', 'months'], function () {
            allChartTypes = angular.copy($scope.dropboxes['performanceDataChartTypes'].itemMap);
            $scope.chartTypes = angular.copy(allChartTypes);
            $scope.initializeTooltips();
        });
    }])
    .controller('WastesCtrl', ['$scope', 'ControllerInfoPasser', 'WasteService', 'SelectedCategory', '$http', 'contextPath', '$q', 'SelectedProperty', '$uibModal', function ($scope, ControllerInfoPasser, WasteService, SelectedCategory, $http, contextPath, $q, SelectedProperty, $modal) {
        $scope.recordCategories = [];
        $scope.currentComponent = SelectedProperty.getSelectedProperty();

        $scope.january = 0;
        $scope.february = 1;
        $scope.march = 2;
        $scope.april = 3;
        $scope.may = 4;
        $scope.june = 5;
        $scope.july = 6;
        $scope.august = 7;
        $scope.september = 8;
        $scope.october = 9;
        $scope.november = 10;
        $scope.december = 11;

        var mathContext = new MathContext(100);

        $scope.allCompanies = {
            key: "All Companies",
            value: "All Companies"
        };

        $scope.selectedWasteCompany = $scope.allCompanies.value;

        $scope.years = [];
        $scope.loadYears = function () {
            var yearToday = new Date();
            $scope.years.push(yearToday.getFullYear());
            for (var x = 1; x < 11; x++) {
                $scope.years.push(( yearToday.getFullYear() - x ));
            }
            $scope.selectedYear = $scope.years[0];
        };

        $scope.loadYears();


        $scope.setWasteCompanies = function () {
            $scope.wasteCompanyNames = $scope.dropboxes['wasteCompanyName'].itemMap;
            $scope.wasteCompanyNames.push($scope.allCompanies);
        };

        $scope.loadWasteDropboxes = function () {
            $scope.loadDropboxes(['wasteCompanyName'], $scope.setWasteCompanies);
        };

        $scope.loadWasteDropboxes();

        $scope.getCategoryName = function (wasteCategory) {
            for (var key in wasteCategory) {
                if (wasteCategory.hasOwnProperty(key)) {
                    if (key != "wasteStreamId" && key != "name") {
                        return key;
                    }
                }
            }
        };

        $scope.getCellContentStyle = function () {
            if ($scope.selectedWasteCompany == $scope.allCompanies.value || $scope.currentBuilding == 'ALL') {
                return ""
            } else {
                return "pointer-underline";
            }
        };

        $scope.createCategoryNameFields = function () {
            for (var x = 0; x < $scope.recordCategories.length; x++) {
                $scope.recordCategories[x]["name"] = $scope.getCategoryName($scope.recordCategories[x]);
            }
        };

        $scope.setRecordCategories = function (categories) {
            var previousCategories = [];
            if ($scope.recordCategories) {
                previousCategories = angular.copy($scope.recordCategories);
            }

            $scope.recordCategories = categories;
            var previousCategoriesToReturnToList = [];
            for (var x = 0; x < previousCategories.length; x++) {
                var isInsideNewCategories = false;
                for (var i = 0; i < $scope.recordCategories.length; i++) {
                    if ($scope.recordCategories[i].wasteStreamId == previousCategories[x].wasteStreamId) {
                        isInsideNewCategories = true;
                        break;
                    }
                }

                if (isInsideNewCategories == false) {
                    var categoryName = $scope.getCategoryName(previousCategories[x]);
                    previousCategories[x][categoryName] = [];
                    previousCategoriesToReturnToList.push(previousCategories[x]);
                }
            }

            for (var y = 0; y < previousCategoriesToReturnToList.length; y++) {
                $scope.recordCategories.push(previousCategoriesToReturnToList[y]);
            }

            $scope.createCategoryNameFields();

        };

        $scope.loadRecordCategories = function () {
            if ($scope.currentBuilding === 'ALL' || angular.isObject($scope.currentBuilding)) {
                // for building level
                if ($scope.currentBuilding == 'ALL') {
                    // All buildings
                    if ($scope.selectedYear && $scope.selectedWasteCompany) {
                        if ($scope.selectedWasteCompany == $scope.allCompanies.value) {
                            WasteService.getAllBuildingCategorizedWasteRecordsByYear({
                                propertynumber: $scope.currentProperty.propertyNumber,
                                year: $scope.selectedYear,
                                module: $scope.moduleEnums.sustainability
                            }, function (data, headers) {
                                // $scope.propertyList = data;
                                $scope.setRecordCategories(data);

                            }, function (httpResponse) {
                                // alert( JSON.stringify( httpResponse ) );
                            });
                        } else {
                            WasteService.getAllBuildingCategorizedRecordsByYearAndCompany({
                                propertynumber: $scope.currentProperty.propertyNumber,
                                year: $scope.selectedYear,
                                company: $scope.selectedWasteCompany,
                                module: $scope.moduleEnums.sustainability
                            }, function (data, headers) {
                                // $scope.propertyList = data;
                                $scope.setRecordCategories(data);

                            }, function (httpResponse) {
                                // alert( JSON.stringify( httpResponse ) );
                            });
                        }
                    }

                } else {
                    // Specific buildings
                    if ($scope.selectedYear && $scope.selectedWasteCompany) {
                        if ($scope.selectedWasteCompany == $scope.allCompanies.value) {
                            WasteService.getBuildingCategorizedWasteRecordsByYear({
                                propertynumber: $scope.currentProperty.propertyNumber,
                                buildingnumber: $scope.currentBuilding.buildingNumber,
                                year: $scope.selectedYear,
                                module: $scope.moduleEnums.sustainability
                            }, function (data, headers) {
                                // $scope.propertyList = data;
                                $scope.setRecordCategories(data);

                            }, function (httpResponse) {
                                // alert( JSON.stringify( httpResponse ) );
                            });

                        } else {
                            WasteService.getBuildingCategorizedRecordsByYearAndCompany({
                                propertynumber: $scope.currentProperty.propertyNumber,
                                buildingnumber: $scope.currentBuilding.buildingNumber,
                                year: $scope.selectedYear,
                                company: $scope.selectedWasteCompany,
                                module: $scope.moduleEnums.sustainability
                            }, function (data, headers) {
                                // $scope.propertyList = data;
                                $scope.setRecordCategories(data);

                            }, function (httpResponse) {
                                // alert( JSON.stringify( httpResponse ) );
                            });

                        }

                    }
                }

            } else {
                // for property level
                if ($scope.selectedYear && $scope.selectedWasteCompany) {
                    if ($scope.selectedWasteCompany == $scope.allCompanies.value) {
                        WasteService.getPropertyCategorizedWasteRecordsByYear({
                            propertynumber: $scope.currentProperty.propertyNumber,
                            year: $scope.selectedYear,
                            module: $scope.moduleEnums.sustainability
                        }, function (data, headers) {
                            // $scope.propertyList = data;
                            $scope.setRecordCategories(data);

                        }, function (httpResponse) {
                            // alert( JSON.stringify( httpResponse ) );
                        });

                    } else {
                        WasteService.getPropertyCategorizedRecordsByYearAndCompany({
                            propertynumber: $scope.currentProperty.propertyNumber,
                            year: $scope.selectedYear,
                            company: $scope.selectedWasteCompany,
                            module: $scope.moduleEnums.sustainability
                        }, function (data, headers) {
                            // $scope.propertyList = data;
                            $scope.setRecordCategories(data);

                        }, function (httpResponse) {
                            // alert( JSON.stringify( httpResponse ) );
                        });

                    }

                }
            }
        };

        $scope.getRecordsForMonth = function (records, month) {
            var recordsForMonth = [];
            for (var x = 0; x < records.length; x++) {
                var collectionDate = new Date(Date.parse(records[x].collectionDate))
                var collectionMonth = collectionDate.getMonth();

                if (collectionMonth == month) {
                    recordsForMonth.push(records[x]);
                }
            }
            return recordsForMonth;
        };

        $scope.getFirstRecordBasedOnMonth = function (wasteCategory, month) {
            var categoryName = $scope.getCategoryName(wasteCategory);
            var records = wasteCategory[categoryName];
            var recordsForMonth = $scope.getRecordsForMonth(records, month);
            var record = recordsForMonth[0];

            return record;
        };

        $scope.getFirstRecordQuantity = function (wasteCategory, month) {
            var record = $scope.getFirstRecordBasedOnMonth(wasteCategory, month);
            if (record) {
                var quantity = record.quantity;
                return quantity.toString();
            } else {
                return "0";
            }
        };

        $scope.getRecordQuantityForMonth = function (wasteCategory, month) {
            var categoryName = $scope.getCategoryName(wasteCategory);
            var records = wasteCategory[categoryName];
            var recordsForMonth = $scope.getRecordsForMonth(records, month);
            var totalQuantity = new BigDecimal("0");
            for (var x = 0; x < recordsForMonth.length; x++) {
                var quantity = new BigDecimal(recordsForMonth[x].quantity.toString());
                totalQuantity = totalQuantity.add(quantity);
            }

            var totalQuantityString = totalQuantity.toString();
            return totalQuantityString;
        };

        $scope.getTotalWasteQuantity = function (wasteCategory) {
            var categoryName = $scope.getCategoryName(wasteCategory);
            var records = wasteCategory[categoryName];

            var totalQuantity = new BigDecimal("0");
            for (var x = 0; x < records.length; x++) {
                var record = new BigDecimal(records[x].quantity.toString());
                totalQuantity = totalQuantity.add(record);
            }
            var totalQuantityString = totalQuantity.toString();
            return totalQuantityString;
        };

        $scope.isMonthValid = function (month) {
            if (month < 0 || month > 11) {
                return false;
            }

            return true;
        };

        $scope.deleteWasteRecord = function (wasteRecord) {
            WasteService.delete({id: wasteRecord.id}, wasteRecord, function (data, headers) {
                // $scope.propertyList = data;
                $scope.loadRecordCategories();
            }, function (httpResponse) {
                // Error here
            });
        };

        $scope.updateWasteRecord = function (wasteRecord) {
            WasteService.update({}, wasteRecord, function (data, headers) {
                // $scope.propertyList = data;
                $scope.loadRecordCategories();
            }, function (httpResponse) {
                // Error here
            });
        };

        $scope.addWasteRecord = function (wasteRecord, wasteStreamId) {
            WasteService.save({wastestreamid: wasteStreamId}, wasteRecord, function (data, headers) {
                // $scope.propertyList = data;
                $scope.loadRecordCategories();
            }, function (httpResponse) {
                // Error here
            });
        };

        $scope.persistWasteRecord = function (object) {
            var record = object.wasteRecord;
            var wasteStreamId = object.wasteStreamId;
            $scope.defaultUnit = record.unit;
            record.module = 'SUSTAINABILITY';
            if (record.id) {
                if (record.quantity <= 0) {
                    // delete record
                    $scope.deleteWasteRecord(record);

                } else {
                    // update record
                    $scope.updateWasteRecord(record);
                }

            } else {
                if (record.quantity > 0) {
                    // add record
                    $scope.addWasteRecord(record, wasteStreamId);

                }
            }
        };

        $scope.defaultUnit = "Tonnes";
        $scope.showWasteRecordInputModal = function (wasteCategory, month) {

            if ($scope.selectedWasteCompany == $scope.allCompanies.value || $scope.currentBuilding == 'ALL') {
                return;
            }

            if (!$scope.selectedYear || !$scope.selectedWasteCompany || $scope.isMonthValid(month) == false) {
                return;
            }

            var categoryName = $scope.getCategoryName(wasteCategory);
            var records = wasteCategory[categoryName];
            var recordsForMonth = $scope.getRecordsForMonth(records, month);

            // for this case, we go directly to the waste record input (without going through the record summary list) a
            // and just use the first record in the given recordsForMonth array.

            var selectedWasteRecord = null;
            var selectedYear = $scope.selectedYear;
            var selectedWasteCompany = $scope.selectedWasteCompany;
            var wasteStreamId = wasteCategory.wasteStreamId;
            var currentBuilding = $scope.currentBuilding;
            var defaultUnit = $scope.defaultUnit;

            selectedWasteRecord = angular.copy(recordsForMonth[0]);

            var modalInstance = $modal.open({
                templateUrl: 'wasteRecordInputModal.html',
                controller: 'WasteRecordInputModalCtrl',
                windowClass: 'standalone-report-modal-window-small',
                resolve: {
                    selectedWasteRecord: function () {
                        return selectedWasteRecord;
                    },
                    currentBuilding: function () {
                        return currentBuilding;
                    },
                    month: function () {
                        return month;
                    },
                    selectedYear: function () {
                        return selectedYear;
                    },
                    selectedWasteCompany: function () {
                        return selectedWasteCompany;
                    },
                    wasteStreamId: function () {
                        return wasteStreamId;
                    },
                    defaultUnit: function () {
                        return defaultUnit;
                    }
                }
            });

            modalInstance.result.then(function (data) {
                $scope.persistWasteRecord(data);
            }, function () {
                // modal closed
            });
        };

        $scope.includeWasteCategory = function (wasteStream) {
            var wasteCategory = {};
            var wasteStreamName = wasteStream.name;
            wasteCategory[wasteStreamName] = [];
            wasteCategory["wasteStreamId"] = wasteStream.id;
            $scope.recordCategories.push(wasteCategory);
        };

        $scope.addWasteCategory = function () {
            var unavailableWasteCategories = $scope.recordCategories;
            var modalInstance = $modal.open({
                templateUrl: 'addWasteStreamModal.html',
                controller: 'AddWasteStreamModalCtrl',
                windowClass: 'standalone-report-modal-window-small',
                resolve: {
                    unavailableWasteCategories: function () {
                        return unavailableWasteCategories;
                    }
                }
            });

            modalInstance.result.then(function (data) {
                $scope.includeWasteCategory(data);
            }, function () {
                // $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.getMonthTotal = function (month) {
            var recordCategories = angular.copy($scope.recordCategories);

            var monthTotal = new BigDecimal("0");
            for (var x = 0; x < recordCategories.length; x++) {
                var category = recordCategories[x];
                var categoryName = $scope.getCategoryName(category);
                var records = category[categoryName];

                var recordsForMonth = $scope.getRecordsForMonth(records, month);
                for (var i = 0; i < recordsForMonth.length; i++) {
                    if (recordsForMonth[i]) {
                        var recordForMonth = new BigDecimal(recordsForMonth[i].quantity.toString());
                        monthTotal = monthTotal.add(recordForMonth);
                    }
                }

            }
            var monthTotalString = monthTotal.toString();
            return monthTotalString;
        };

        $scope.getMonthTotalDiverted = function (month) {
            var recordCategories = angular.copy($scope.recordCategories);

            var monthTotal = new BigDecimal("0");
            for (var x = 0; x < recordCategories.length; x++) {


                var category = recordCategories[x]
                var categoryName = $scope.getCategoryName(category);
                var records = category[categoryName];

                var recordsForMonth = $scope.getRecordsForMonth(records, month);
                for (var i = 0; i < recordsForMonth.length; i++) {
                    if (recordsForMonth[i].wasteStream.type == 'DIVERTED') {
                        var recordForMonth = new BigDecimal(recordsForMonth[i].quantity.toString());
                        monthTotal = monthTotal.add(recordForMonth);
                    }
                }

            }
            var monthTotalString = monthTotal.toString();
            return monthTotalString;
        };

        $scope.getTotalQuantityForAllCategories = function () {
            var recordCategories = angular.copy($scope.recordCategories);
            var total = new BigDecimal("0");
            for (var x = 0; x < recordCategories.length; x++) {
                var quantity = new BigDecimal($scope.getTotalWasteQuantity(recordCategories[x]));
                total = total.add(quantity);
            }
            var totalString = total.toString();
            return totalString;
        };

        $scope.getTotalDivertedQuantity = function (wasteCategory) {
            var categoryName = $scope.getCategoryName(wasteCategory);
            var records = wasteCategory[categoryName];

            var totalQuantity = new BigDecimal("0");
            for (var x = 0; x < records.length; x++) {
                if (records[x].wasteStream.type == 'DIVERTED') {
                    var quantity = new BigDecimal(records[x].quantity.toString());
                    totalQuantity = totalQuantity.add(quantity);
                }
            }

            var totalQuantityString = totalQuantity.toString();
            return totalQuantityString;
        };

        $scope.getTotalDivertedForAllCategories = function () {
            var recordCategories = angular.copy($scope.recordCategories);
            var total = new BigDecimal("0");
            for (var x = 0; x < recordCategories.length; x++) {
                var divertedQuantity = new BigDecimal($scope.getTotalDivertedQuantity(recordCategories[x]));
                total = total.add(divertedQuantity);
            }
            var totalString = total.toString();
            return totalString;
        };

        $scope.getMonthDiversionRate = function (month) {
            var monthDivertedQuantityString = $scope.getMonthTotalDiverted(month);
            var monthDivertedQuantity = new BigDecimal(monthDivertedQuantityString);

            var monthTotalQuantityString = $scope.getMonthTotal(month);
            var monthTotalQuantity = new BigDecimal(monthTotalQuantityString);

            var diversionRate;
            if (!monthTotalQuantity.isZero()) {
                var diversionRatio = monthDivertedQuantity.divide(monthTotalQuantity, mathContext);
                var percentFactor = new BigDecimal("100");
                diversionRate = diversionRatio.multiply(percentFactor, mathContext);
            }

            if (diversionRate) {
                var diversionRateString = diversionRate.toString();
                return diversionRateString;
            } else {
                return "0";
            }
        };

        $scope.getTotalDiversionRate = function () {
            var totalDiversionQuantityString = $scope.getTotalDivertedForAllCategories();
            var totalDiversionQuantity = new BigDecimal(totalDiversionQuantityString);

            var totalQuantityString = $scope.getTotalQuantityForAllCategories();
            var totalQuantity = new BigDecimal(totalQuantityString);

            var totalDiversionRate;
            if (!totalQuantity.isZero()) {
                var ratio = totalDiversionQuantity.divide(totalQuantity, mathContext);
                var percentFactor = new BigDecimal("100");
                totalDiversionRate = ratio.multiply(percentFactor, mathContext);
            }
            if (totalDiversionRate) {
                var totalDiversionRateString = totalDiversionRate.toString();
                return totalDiversionRateString;
            } else {
                return "0";
            }
        };

        $scope.restartWasteSummaryList = function () {
            $scope.recordCategories = null;
            $scope.loadRecordCategories();
        };

        $scope.dropboxPickersChanged = function () {
            $scope.restartWasteSummaryList();
        };

        $scope.$on('event:buildingComponentSelected', function () {
            $scope.restartWasteSummaryList();
        });

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function () {
            $scope.restartWasteSummaryList();
        });

        $scope.loadRecordCategories();

    }])
    .controller('WasteRecordInputModalCtrl', ['$scope', 'SelectedProperty', 'selectedWasteRecord', 'currentBuilding', '$http', 'contextPath', '$q', '$uibModalInstance', 'WasteService', 'month', 'selectedYear', 'selectedWasteCompany', 'wasteStreamId', 'defaultUnit', function ($scope, SelectedProperty, selectedWasteRecord, currentBuilding, $http, contextPath, $q, $modalInstance, WasteService, month, selectedYear, selectedWasteCompany, wasteStreamId, defaultUnit) {
        $scope.categoryToVerifyPath = undefined;

        $scope.wasteRecord = selectedWasteRecord;
        $scope.currentAction = "";
        $scope.selectedYear = selectedYear;
        $scope.month = month;
        $scope.selectedWasteCompany = selectedWasteCompany;
        $scope.wasteStreamId = wasteStreamId;
        $scope.currentProperty = SelectedProperty.getSelectedProperty();
        $scope.defaultUnit = defaultUnit;
        $scope.currentBuilding = currentBuilding;
        $scope.isModalOpen = true;

        $scope.setWasteRecord = function (record) {
            $scope.wasteRecord = record;
            $scope.wasteRecord.unit = $scope.defaultUnit;
        };

        $scope.getMonthText = function () {
            var monthText = null;
            switch ($scope.month) {
                case 0:
                    monthText = "JANUARY";
                    break;
                case 1:
                    monthText = "FEBRUARY";
                    break;
                case 2:
                    monthText = "MARCH";
                    break;
                case 3:
                    monthText = "APRIL";
                    break;
                case 4:
                    monthText = "MAY";
                    break;
                case 5:
                    monthText = "JUNE";
                    break;
                case 6:
                    monthText = "JULY";
                    break;
                case 7:
                    monthText = "AUGUST";
                    break;
                case 8:
                    monthText = "SEPTEMBER";
                    break;
                case 9:
                    monthText = "OCTOBER";
                    break;
                case 10:
                    monthText = "NOVEMBER";
                    break;
                case 11:
                    monthText = "DECEMBER";
                    break;
            }

            return monthText;
        };

        $scope.createPropertyWasteRecord = function () {
            var monthText = $scope.getMonthText();
            if (monthText) {
                WasteService.createWasteRecordForProperty({
                    propertynumber: $scope.currentProperty.propertyNumber,
                    year: $scope.selectedYear,
                    month: monthText,
                    wastestreamid: $scope.wasteStreamId,
                    company: $scope.selectedWasteCompany
                }, function (data, headers) {
                    // $scope.propertyList = data;
                    $scope.setWasteRecord(data);

                }, function (httpResponse) {
                    // Error here
                });
            }
        };

        $scope.createBuildingWasteRecord = function () {
            var monthText = $scope.getMonthText();
            if (monthText) {
                WasteService.createWasteRecordForBuilding({
                    buildingnumber: $scope.currentBuilding.buildingNumber,
                    year: $scope.selectedYear,
                    month: monthText,
                    wastestreamid: $scope.wasteStreamId,
                    company: $scope.selectedWasteCompany
                }, function (data, headers) {
                    // $scope.propertyList = data;
                    $scope.setWasteRecord(data);

                }, function (httpResponse) {
                    // Error here
                });
            }
        };

        $scope.initializeWasteRecordForm = function () {

            if ($scope.wasteRecordForm) {
                $scope.wasteRecordForm.$setPristine();
            }

            if ($scope.wasteRecord) {
                $scope.currentAction = "editing";

            } else {
                $scope.currentAction = "creating";
                if ($scope.currentBuilding === 'ALL' || angular.isObject($scope.currentBuilding)) {
                    // for building level
                    $scope.createBuildingWasteRecord();

                } else {
                    // for property level
                    $scope.createPropertyWasteRecord();

                }

            }
        };

        $scope.cancel = function () {
            $scope.isModalOpen = false;
            $modalInstance.dismiss('cancel');
        };

        $scope.submitWasteRecord = function (wasteRecordForm) {
            if (wasteRecordForm.$valid) {
                var returnObject = {
                    wasteRecord: $scope.wasteRecord,
                    wasteStreamId: $scope.wasteStreamId
                };
                $modalInstance.close(returnObject);
            }

        }
    }])
    .controller('AddWasteStreamModalCtrl', ['$scope', 'ControllerInfoPasser', 'WasteStreamsService', 'SelectedCategory', '$http', 'contextPath', '$q', '$uibModalInstance', 'unavailableWasteCategories', function ($scope, ControllerInfoPasser, WasteStreamsService, SelectedCategory, $http, contextPath, $q, $modalInstance, unavailableWasteCategories) {
        $scope.wasteStreamsList = [];
        $scope.loadingWasteStreamsList = false;
        $scope.unavailableWasteCategories = unavailableWasteCategories;

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

        $scope.isWasteStreamAvailable = function (wasteStream) {
            for (var x = 0; x < $scope.unavailableWasteCategories.length; x++) {
                if (wasteStream.id == $scope.unavailableWasteCategories[x].wasteStreamId) {
                    return false;
                }
            }

            return true;
        };

        $scope.selectWasteStreamToAdd = function (wasteStream) {
            if (wasteStream) {
                $modalInstance.close(wasteStream);
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }])
    .controller('ScoringCategorySummaryCtrl', ['$scope', 'QuestionnaireService', 'SelectedProperty', function ($scope, QuestionnaireService, SelectedProperty) {

        $scope.selectedQuestionnaire;
        $scope.scoreData = [];
        $scope.scoreLoading = [];

        $scope.getScoreDataForQuestionnaire = function (questionnaire) {

            if (angular.isDefined(questionnaire)) {
                $scope.scoreLoading[questionnaire.id] = true;

                QuestionnaireService.getLandingPageScoreData({questionnaireId: questionnaire.id}, SelectedProperty.getSelectedProperty().propertyNumber, function (data) {
                    $scope.qIdToDisplay = questionnaire.id;
                    $scope.scoreData[questionnaire.id] = data;
                    $scope.scoreLoading[questionnaire.id] = false;
                }, function (httpResponse) {
                    $scope.scoreLoading[questionnaire.id] = false;
                });
            }
        };

        $scope.getQuestionnairesForProperties = function (propertyNumbers) {
            if (angular.isDefined(propertyNumbers)) {
                $scope.loadingQuestionnaires = true;
                $scope.numOfProperties = propertyNumbers.length;

                QuestionnaireService.findQuestionnairesForPropertiesWithScoringCategories({
                    module: $scope.moduleNameToEnum($scope.getCurrentModule()),
                    type: $scope.questionnaireTypeEnum.PROPERTY
                }, propertyNumbers, function (data) {
                    $scope.questionnaires = angular.copy(data);
                    $scope.loadingQuestionnaires = false;
                    if ($scope.questionnaires.length > 0) {
                        $scope.selectedQuestionnaire = $scope.questionnaires[0];
                    }

                    if (angular.isDefined($scope.selectedQuestionnaire)) {
                        $scope.getScoreDataForQuestionnaire($scope.selectedQuestionnaire);
                        $scope.scoreLoading[$scope.selectedQuestionnaire.id] = false;
                    }
                }, function () {
                    if (angular.isDefined($scope.selectedQuestionnaire)) {
                        $scope.scoreLoading[$scope.selectedQuestionnaire.id] = false;
                    }
                    $scope.loadingQuestionnaires = false;
                });
            }
        };

        $scope.getQuestionnaireScoreData = function () {
            if (angular.isDefined($scope.selectedQuestionnaire)) {
                $scope.qIdToDisplay = $scope.selectedQuestionnaire.id;
                $scope.getScoreDataForQuestionnaire($scope.selectedQuestionnaire);
            }
        };

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, category) {
            $scope.getQuestionnaireScoreData();
        });

        $scope.getQuestionnairesForProperties([SelectedProperty.getSelectedProperty().propertyNumber]);

    }])
    .controller('PropertyPortfolioManagerCtrl', ['$scope', 'PortfolioManagerService', 'DataMappingService', function ($scope, PortfolioManagerService, DataMappingService) {

        $scope.portfolioManagerAccount = undefined;
        $scope.utilityMeters = [];
        $scope.selectedMeter = undefined;
        $scope.utilityRecords = [];
        $scope.utilityRecordsOrder = ['-endDate'];
        $scope.currentPage = 0;
        $scope.pageSize = 10;

        $scope.restLoading = false;
        $scope.modalLoading = false;

        // Mapping TO Portfolio Manager vars
        $scope.newMapping = {};
        $scope.mappingException = {};
        var lastModalShown;

        // Mapping FROM Portfolio Manager vars
        $scope.possibleMappings = [];
        $scope.dataMappingSelections = {};

        $scope.linkPropertyWithPm = function (account, property) {
            PortfolioManagerService.linkProperty({
                riskPropertyNumber: $scope.currentProperty.propertyNumber,
                pmAccountId: account.accountId,
                pmPropertyNumber: property.id
            }, {}, function (data) {
                $scope.currentProperty.pmAccountId = account.accountId;
                $scope.currentProperty.pmPropertyNumber = property.id;
                $scope.getUtilityMeters();
            });
        };

        $scope.unlinkPropertyWithPm = function () {
            $scope.modalLoading = true;
            PortfolioManagerService.unlinkProperty({
                riskPropertyNumber: $scope.currentProperty.propertyNumber
            }, {}, function () {
                $('#unlinkPropertyModal').modal('hide');
                $scope.modalLoading = false;

                $scope.currentProperty.pmAccountId = undefined;
                $scope.currentProperty.pmPropertyNumber = undefined;
            }, function () {
                $scope.modalLoading = false;
                $scope.displayMessageInElement('.modal-error', 'There was an error unlinking the property from Portfolio Manager!', 10000);
            });
        };

        $scope.showCreateModal = function () {
            clearModalErrorMsgs();
            $('#createPMPropertyModal').modal('show');
        };

        $scope.showUpdateModal = function () {
            clearModalErrorMsgs();
            //$('#updatePMPropertyModal').modal('show');
        };

        $scope.pushPMProperty = function (lastModal) {
            clearModalErrorMsgs();
            lastModalShown = lastModal;

            $scope.modalLoading = true;
            PortfolioManagerService.pushProperty({
                accountId: $scope.portfolioManagerAccount.accountId,
                riskPropertyNumber: $scope.currentProperty.propertyNumber
            }, {}, function (data) {
                $scope.modalLoading = false;
                $scope.currentProperty = angular.copy(data);

                $(lastModalShown).modal('hide');
                $('#mappedValueNeededModal').modal('hide');

                $scope.addAlert("Successfully saved the property in Portfolio Manager", 'success', 10000);
                $scope.getUtilityMeters();
            }, function (httpResponse) {
                $scope.modalLoading = false;

                var msg = "";
                if (angular.isDefined(httpResponse.data.error)) {
                    msg = httpResponse.data.error;
                }


                switch (httpResponse.status) {
                    case 400:
                        $scope.displayMessageInElement(".pushError", msg);
                        $(".pushError").readmore({
                            speed: 500,
                            collapsedHeight: 100,
                            embedCSS: false,
                            moreLink: '<h4 class="pointer">More...</h4>',
                            lessLink: '<h4 class="pointer">Less</h4>'
                        });
                        $('#mappedValueNeededModal').modal('hide');
                        $(lastModalShown).modal('show');
                        break;
                    case 449:
                        showNewMappedValueModal(httpResponse.data);
                        break;
                    default:
                        $scope.displayMessageInElement(".pushError", "An error has occurred saving the property in Portfolio Manager!", 10000);
                }
            });
        };

        $scope.pullLatestPropertyDataFromPM = function () {
            $scope.modalLoading = true;

            PortfolioManagerService.importProperty({
                accountId: $scope.currentProperty.pmAccountId,
                pmPropertyId: $scope.currentProperty.pmPropertyNumber,
                riskPropertyNumber: $scope.currentProperty.propertyNumber
            }, $scope.dataMappingSelections, function (data) {
                $scope.modalLoading = false;
                $("#pullPropertyModal").modal('hide');
                $('#pullErrorModal').modal('hide');

                $scope.addAlert("Successfully got the latest information from Portfolio Manager", 'success', 10000);
                $scope.currentProperty = angular.copy(data);
                $scope.dataMappingSelections = {};
            }, function (httpResponse) {
                $scope.modalLoading = false;

                switch (httpResponse.status) {
                    case 400:
                        $scope.displayMessageInElement("#pullerrormsg", httpResponse.data.error, 10000);
                        break;
                    case 449:
                        $("#pullPropertyModal").modal('hide');
                        $scope.dataMappingSelections = angular.copy(httpResponse.data.dataMappingUISelections);
                        $scope.possibleMappings = angular.copy(httpResponse.data.mappings);
                        $('#pullErrorModal').modal('show');
                        break;
                    default:
                        $scope.displayMessageInElement("#pullerrormsg", "An error has occurred importing the Portfolio Manager property!", 10000);
                }
            })
        };

        var clearModalErrorMsgs = function () {
            $(".pushError").readmore('destroy');
        };

        var showNewMappedValueModal = function (exception) {
            $scope.mappingException = angular.copy(exception);

            $scope.newMapping = {
                entityName: exception.entityName,
                fieldName: exception.fieldName,
                fieldValue: exception.fieldValue,
                mappingType: $scope.mappingTypeEnum.ENERGY_STAR
            };

            $(lastModalShown).modal('hide');
            $('#mappedValueNeededModal').modal('show');
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
            $scope.pullLatestPropertyDataFromPM();
        };

        $scope.getUtilityMeters = function () {
            $scope.restLoading = true;
            if (angular.isDefined($scope.currentProperty.pmAccountId)) {
                $scope.utilityMeters.length = 0;
                PortfolioManagerService.getUtilityMetersForProperty({
                    accountId: $scope.currentProperty.pmAccountId,
                    pmPropertyNumber: $scope.currentProperty.pmPropertyNumber
                }, function (data) {
                    $scope.utilityMeters = angular.copy(data);
                    $scope.restLoading = false;
                }, function () {
                    $scope.restLoading = false;
                    $scope.addAlert('An error has occurred getting the utility meters for property ' + $scope.currentProperty.name + '!', 'danger', 10000);
                });
            }
        };

        $scope.selectMeterForImport = function (meter) {
            $scope.meterToImport = angular.copy(meter);
            $('#importMeterModal').modal('show');
        };

        $scope.importUtilityMeter = function () {
            $scope.modalLoading = true;
            PortfolioManagerService.importUtilityMeter({
                accountId: $scope.currentProperty.pmAccountId,
                meterId: $scope.meterToImport.id,
                riskPropertyNumber: $scope.currentProperty.propertyNumber
            }, {}, function () {
                $scope.modalLoading = false;
                $scope.addAlert('The utility meter was imported successfully', 'success', 10000);
                $('#importMeterModal').modal('hide');
                $scope.getUtilityMeters();
            }, function () {
                $scope.modalLoading = false;
                $scope.displayMessageInElement('#meterImportError', 'An error has occurred while trying to import the utility meter!', 10000)
            });
        };

        $scope.selectMeter = function (meter) {
            $scope.selectedMeter = angular.copy(meter);
            $scope.recordFilter = '';
            $scope.yearFilter = undefined;
        };

        $scope.closeMeter = function () {
            $scope.selectedMeter = undefined;
        };

        $scope.getUtilityMeterConsumptionData = function () {
            if (angular.isDefined($scope.yearFilter) && $scope.yearFilter.trim() === '') {
                $scope.yearFilter = undefined;
            }

            $scope.recordFilter = '';
            $scope.currentPage = 0;

            $scope.utilityRecords.length = 0;
            $scope.restLoading = true;
            PortfolioManagerService.getUtilityMeterConsumptionData({
                accountId: $scope.currentProperty.pmAccountId,
                meterId: $scope.selectedMeter.id,
                year: angular.isDefined($scope.yearFilter) ? $scope.yearFilter : ""
            }, function (data) {
                $scope.restLoading = false;
                $scope.utilityRecords = angular.copy(data);
            }, function () {
                $scope.restLoading = false;
                $scope.addAlert('An error has occurred trying to get the consumption records for meter \'' + $scope.selectedMeter.name + '\'!', 'danger', 10000);
            });
        };

        $scope.importUtilityMeterConsumptionData = function () {
            $scope.modalLoading = true;
            PortfolioManagerService.importUtilityMeterConsumptionData({
                accountId: $scope.currentProperty.pmAccountId,
                propertyNumber: $scope.currentProperty.propertyNumber,
                meterId: $scope.selectedMeter.id,
                year: angular.isDefined($scope.yearFilter) ? $scope.yearFilter : ""
            }, {}, function () {
                $scope.modalLoading = false;
                $('#importConsumptionRecordsModal').modal('hide');
                $scope.addAlert('Consumption records were successfully imported', 'success', 10000);
            }, function () {
                $scope.modalLoading = false;
                $scope.displayMessageInElement('.modalError', 'There was a problem importing the consumption records!', 10000);
            });
        };

        $scope.saveNewMapping = function () {
            $scope.modalLoading = true;
            DataMappingService.add({}, $scope.newMapping, function () {
                $scope.pushPMProperty(lastModalShown);
            }, function () {
                $scope.modalLoading = false;
                $scope.displayMessageInElement('.modal-error', 'An error has occurred saving the new mapping!', 10000);
            });
        };

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, property) {
            $scope.currentProperty = angular.copy(property);
            $scope.closeMeter();
            $scope.getUtilityMeters();
        });

        $scope.getUtilityMeters();
    }])
    .controller('UtilityMetersCtrl', ['$scope', 'UtilityMeterService', function ($scope, UtilityMeterService) {
        $scope.utilityMeters = [];
        $scope.selectedMeter = {};
        $scope.meterOrder = ['utilityType', 'meterNumber'];
        $scope.availableUpstreamUtilityMeters = [];

        $scope.findAllUtilityMeters = function () {
            $scope.utilityMeters.length = 0;
            $scope.loading = true;
            UtilityMeterService.findByPropertyNumber({
                propertyNumber: $scope.currentProperty.propertyNumber
            }, function (data) {
                $scope.utilityMeters = angular.copy(data);
                $scope.loading = false;
            }, function (ignoreHttpResponse) {
                $scope.loading = false;
                $scope.addAlert('An error has occurred retrieving the utility meters!', 'danger', 10000);
            });
        };

        $scope.clearOtherSourceOfData = function () {
            if (angular.isDefined($scope.selectedMeter)) {
                if ($scope.selectedMeter.sourceOfData !== 'Other') {
                    $scope.selectedMeter.otherSourceOfData = null;
                }
            }
        };

        var removeCurrentMeterNumberFromAvailableUpstreams = function () {
            var searchResult = $scope.searchArrayForProperty($scope.availableUpstreamUtilityMeters, "meterNumber", $scope.selectedMeter.meterNumber);
            if (angular.isDefined(searchResult)) {
                for (var x = 0; x < searchResult.length; x++) {
                    var utilityMeter = searchResult[x];
                    var indexToRemove = $scope.availableUpstreamUtilityMeters.indexOf(utilityMeter);
                    if (indexToRemove > -1) {
                        $scope.availableUpstreamUtilityMeters.splice(indexToRemove, 1);
                    }
                }
            }
        };

        $scope.loadUpstreamUtilityMetersByType = function () {
            $scope.availableUpstreamUtilityMeters.length = 0;
            if (angular.isDefined($scope.selectedMeter.utilityType)) {
                UtilityMeterService.findByPropertyNumberAndUtility({
                    propertyNumber: $scope.currentProperty.propertyNumber,
                    utility: $scope.selectedMeter.utilityType
                }, function (data) {
                    $scope.availableUpstreamUtilityMeters = angular.copy(data);
                    removeCurrentMeterNumberFromAvailableUpstreams();

                }, function (ignoreHttpResponse) {
                    $scope.addAlert("An error has occurred retrieving the available upstream utility meters!", "warning", 10000);
                });
            }
        };

        $scope.setDefaultGeneratedValue = function () {
            if (angular.isDefined($scope.selectedMeter.utilityType)) {
                if ($scope.selectedMeter.utilityType == "STEAM") {
                    $scope.selectedMeter.isGeneratedOnSite = true;
                }
            }
        };

        $scope.saveUtilityMeter = function () {
            if ($scope.utilityMeterForm.$valid) {
                if (angular.isDefined($scope.selectedMeter.id)) {
                    $scope.updateUtilityMeter();
                } else {
                    $scope.addUtilityMeter();
                }
            } else {
                $scope.addAlert('One or more required fields are empty, please fill in all required information', 'warning', 10000);
            }
        };


        $scope.addUtilityMeter = function () {
            $scope.loading = true;

            UtilityMeterService.save({}, $scope.selectedMeter, function () {
                $scope.loading = false;
                $scope.closeMeter();
                $scope.addAlert('Successfully created the utility meter', 'success', 10000);
            }, function () {
                $scope.loading = false;
                $scope.addAlert('There was an error creating the utility meter!', 'danger', 10000);
            });
        };

        $scope.updateUtilityMeter = function () {
            $scope.loading = true;

            UtilityMeterService.update({}, $scope.selectedMeter, function () {
                $scope.loading = false;
                $scope.closeMeter();
                $scope.addAlert('Successfully updated the utility meter', 'success', 10000);
            }, function () {
                $scope.loading = false;
                $scope.addAlert('There was an error updating the utility meter!', 'danger', 10000);
            });
        };

        $scope.deleteUtilityMeter = function () {
            $scope.modalLoading = true;

            UtilityMeterService.delete({id: $scope.selectedMeter.id}, function () {
                $scope.modalLoading = false;
                $('#deleteMeterModal').modal('hide');
                $scope.addAlert("Successfully deleted the utility meter", 'success', 10000);
                $scope.closeMeter();
            }, function (httpResponse) {
                $scope.modalLoading = false;

                switch (httpResponse.status) {
                    case 417:
                        $('#deleteMeterModal').modal('hide');
                        $('#cannotDeleteMeterModal').modal('show');
                        break;
                    default:
                        $scope.displayMessageInElement("#deleteError", "An error has occurred deleting the Portfolio Manager Account!", 10000);
                }
            });
        };

        $scope.openMeter = function (meter) {
            if (angular.isDefined(meter)) {
                $scope.selectedMeter = meter;
            } else {
                if (angular.isString($scope.currentBuilding)) {
                    $scope.addAlert('The property component selector must be on an individual building or the property level to add a meter', 'warning', 10000);
                    return;
                }

                $scope.loading = true;
                UtilityMeterService.create({}, function (data) {
                    $scope.loading = false;
                    $scope.selectedMeter = angular.copy(data);
                    $scope.selectedMeter.propertyNumber = $scope.currentProperty.propertyNumber;
                    $scope.selectedMeter.buildingNumber = angular.isDefined($scope.currentBuilding) ? $scope.currentBuilding.buildingNumber : undefined;

                }, function (httpResponse) {
                    $scope.loading = false;
                    $scope.addAlert('There was an error creating the utility meter!', 'danger', 10000);

                });

            }
            $scope.inputting = true;
            $scope.utilityMeterForm.$setPristine();
            $scope.loadUpstreamUtilityMetersByType();
        };

        $scope.closeMeter = function () {
            $scope.selectedMeter = {};
            $scope.inputting = false;
            $scope.findAllUtilityMeters();
        };

        $scope.setToDelete = function (account) {
            $scope.selectedMeter = account;
        };

        $scope.clearUnitIfNeeded = function () {
            $scope.selectedMeter.readingUnitOfMeasure = undefined;
        };

        $scope.clearConsumptionOtherCategory = function () {
            $scope.selectedMeter.consumptionOtherCategory = undefined;
        };

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, property) {
            $scope.currentProperty = angular.copy(property);
            $scope.inputting = false;
            $scope.selectedMeter = undefined;
            $scope.findAllUtilityMeters();
        });

        $scope.findAllUtilityMeters();
        $scope.loadDropboxes(['utilityMeterUtilityType', 'energyScope', 'water_units', 'steam_units', 'heating_oil_units', 'natural_gas_units', 'electricity_units', 'diesel_units', 'chilled_water_units', 'booleanTrueFalse', 'utilityMeterConsumptionCategory', 'utilityMeterSpecialUse', 'greenConsumptionCategory', 'financialControlCategory', 'sourceOfDataCategory']);
    }])
    .controller('RealpacReportingCtrl', ['$scope', 'RealpacReportingService', 'IntegratedRealpacService', 'SelectedProperty', 'contextPath', '$http', 'PropertyLookup', 'ControllerInfoPasser', 'RealpacBuildingService', function ($scope, RealpacReportingService, IntegratedRealpacService, SelectedProperty, contextPath, $http, PropertyLookup, ControllerInfoPasser, RealpacBuildingService) {
        $scope.realpacReportings = [];
        $scope.realpacReportingOrder = ['reportingYear'];
        $scope.selectedRealpacReporting = {};
        $scope.loading = false;
        $scope.realpacReportingAccess = $scope.moduleAccessTypes.R;
        $scope.canAdd = false;
        $scope.currentProperty = SelectedProperty.getSelectedProperty();

        $scope.screenToShow = 0;

        $scope.propertyTypes = [];
        $scope.matchingProperties = [];
        $scope.matchingPropertiesSubset = [];

        $scope.selectedReportingDataProblems = [];

        $scope.matchingTableOrder = ['propertyNumber'];
        $scope.pageSize = 10;
        $scope.currentPage = 0;

        $scope.exclusionReason = '';
        var propertyNumberToIncludeOrExclude = undefined;

        var realpacBuildPartial = 'partials/sustainability/realpac/realpacBuilding.html';
        var realpacBuildingContactsPartial = 'partials/sustainability/realpac/realpacProfileContacts.html';
        var realpacContactsPartial = 'partials/sustainability/realpac/realpacContacts.html';
        var performanceDataVerificationPartial = 'partials/sustainability/performanceVerification.html';

        $scope.selectedRealpacPropertyValidationType = {};

        $scope.REALPAC_FILTER_TYPE = {
            ALL: 'ALL',
            COMPLETED: 'COMPLETED',
            IN_PROGRESS: 'IN_PROGRESS',
            BUILDING_DATA_ERRORS: 'BUILDING_DATA_ERRORS',
            BUILDING_CONTACT_ERRORS: 'BUILDING_CONTACT_ERRORS',
            REALPAC_CONTACT_ERRORS: 'REALPAC_CONTACT_ERRORS',
            PERFORMANCE_VERIFICATION_ERRORS: 'PERFORMANCE_VERIFICATION_ERRORS',
            EXCLUDED: 'EXCLUDED'
        };

        $scope.filterPropertiesByValidation = function (validation) {

            if (angular.isDefined($scope.matchingProperties) && angular.isDefined(validation)) {

                $scope.matchingPropertiesSubset.length = 0;

                for (var x = 0; x < $scope.matchingProperties.length; x++) {

                    var isNotExcluded = $scope.matchingProperties[x].realpacStatus !== $scope.realpacBuildingStatusEnum.EXCLUDED;

                    switch ($scope.selectedRealpacPropertyValidationType) {
                        case $scope.REALPAC_FILTER_TYPE.ALL:
                            $scope.matchingPropertiesSubset.push($scope.matchingProperties[x]);
                            break;
                        case $scope.REALPAC_FILTER_TYPE.IN_PROGRESS:
                            if ($scope.matchingProperties[x].hasProblems === true && isNotExcluded) {
                                $scope.matchingPropertiesSubset.push($scope.matchingProperties[x]);
                            }
                            break;
                        case $scope.REALPAC_FILTER_TYPE.COMPLETED:
                            if ($scope.matchingProperties[x].hasProblems === false && isNotExcluded) {
                                $scope.matchingPropertiesSubset.push($scope.matchingProperties[x]);
                            }
                            break;
                        case $scope.REALPAC_FILTER_TYPE.BUILDING_DATA_ERRORS:
                            if ($scope.matchingProperties[x].hasBuildingDataProblems === true && isNotExcluded) {
                                $scope.matchingPropertiesSubset.push($scope.matchingProperties[x]);
                            }
                            break;
                        case $scope.REALPAC_FILTER_TYPE.BUILDING_CONTACT_ERRORS:
                            if ($scope.matchingProperties[x].hasBuildingContactsProblems === true && isNotExcluded) {
                                $scope.matchingPropertiesSubset.push($scope.matchingProperties[x]);
                            }
                            break;
                        case $scope.REALPAC_FILTER_TYPE.REALPAC_CONTACT_ERRORS:
                            if ($scope.matchingProperties[x].hasRealpacContactsProblems === true && isNotExcluded) {
                                $scope.matchingPropertiesSubset.push($scope.matchingProperties[x]);
                            }
                            break;
                        case $scope.REALPAC_FILTER_TYPE.PERFORMANCE_VERIFICATION_ERRORS:
                            if ($scope.matchingProperties[x].hasPerformanceDataVerificationProblems === true && isNotExcluded) {
                                $scope.matchingPropertiesSubset.push($scope.matchingProperties[x]);
                            }
                            break;
                        case $scope.REALPAC_FILTER_TYPE.EXCLUDED:
                            if (!isNotExcluded) {
                                $scope.matchingPropertiesSubset.push($scope.matchingProperties[x]);
                            }
                            break;
                        default :
                            $scope.matchingPropertiesSubset.push($scope.matchingProperties[x]);
                            break;

                    }
                }
            }
        };

        $scope.getRealpacReportings = function () {
            $scope.toListView();

            $scope.realpacReportings.length = 0;
            $scope.loading = true;
            RealpacReportingService.findAllIncludeValidation({}, function (data) {
                $scope.loading = false;
                $scope.realpacReportings = angular.copy(data);
            }, function () {
                $scope.loading = false;
                $scope.addAlert('An error has occurred loading the Realpac reports!', 'danger', 10000);
            });
        };

        $scope.clearRealpacReportingYear = function () {
            if (angular.isDefined(ControllerInfoPasser.get('selectedRealpacReportingYear'))) {
                ControllerInfoPasser.clear('selectedRealpacReportingYear');
            }
        };

        $scope.saveRealpacReporting = function () {
            $scope.loading = true;
            ControllerInfoPasser.put("selectedRealpacReportingYear", $scope.selectedRealpacReporting);
            if (angular.isDefined($scope.selectedRealpacReporting.id)) {
                updateRealpacReporting();
            } else {
                addRealpacReporting();
            }
        };

        var addRealpacReporting = function () {
            RealpacReportingService.save({}, $scope.selectedRealpacReporting, function (data) {
                $scope.addAlert('Successfully created the Realpac report for year \'' + $scope.selectedRealpacReporting.reportingYear + '\'', 'success', 10000);
                $scope.getRealpacReportings();
            }, function (httpResponse) {
                $scope.loading = false;
                switch (httpResponse.status) {
                    case 405:
                        $scope.addAlert('A Realpac reporting year already exists for the year ' + $scope.selectedRealpacReporting.reportingYear, 'warning', 10000);
                        break;
                    default:
                        $scope.addAlert('An error has occurred while creating the Realpac report!', 'danger', 10000);
                }
            });
        };

        var updateRealpacReporting = function () {
            RealpacReportingService.update({}, $scope.selectedRealpacReporting, function (data) {
                $scope.addAlert('Successfully updated the Realpac report for year \'' + $scope.selectedRealpacReporting.reportingYear + '\'', 'success', 10000);
                $scope.getRealpacReportings();
            }, function (httpResponse) {
                $scope.loading = false;

                switch (httpResponse.status) {
                    case 405:
                        $scope.addAlert('A Realpac reporting year already exists for the year ' + $scope.selectedRealpacReporting.reportingYear, 'warning', 10000);
                        break;
                    default:
                        $scope.addAlert('An error has occurred while updating the Realpac report!', 'danger', 10000);

                }
            });
        };

        $scope.checkForBuildingSnapshot = function () {
            IntegratedRealpacService.findByReportingYearAndPropertyNumberAndBuildingNumber({
                reportingYear: $scope.selectedRealpacReporting.reportingYear,
                propertyNumber: $scope.currentProperty.propertyNumber
            }, function (data) {
                $scope.hasBuildingSnapshots = angular.isDefined(data.buildingSnapshot);
            }, function () {
                $scope.displayMessageInElement('#errorText', 'An error has occurred while checking for building snapshots!', 10000);
            });
        };

        $scope.deleteRealpacReporting = function () {
            $scope.loading = true;

            RealpacReportingService.delete({
                id: $scope.selectedRealpacReporting.id
            }, $scope.selectedRealpacReporting, function (data) {
                $('#deleteRealpacReportingModal').modal('hide');
                $scope.addAlert('Successfully deleted the Realpac report for year \'' + $scope.selectedRealpacReporting.reportingYear + '\'', 'success', 10000);
                $scope.clearRealpacReportingYear();
                $scope.getRealpacReportings();
            }, function () {
                $scope.loading = false;
                $scope.displayMessageInElement('#errorText', 'An error has occurred while deleting the Realpac report!', 10000);
            });
        };

        $scope.selectRealpacReporting = function (realpacReporting) {
            $scope.selectedRealpacReporting = angular.copy(realpacReporting);
        };

        $scope.addRealpacReporting = function () {
            $scope.selectedRealpacReporting = {
                status: $scope.realpacReportingStatusEnum.PENDING,
                createdBy: $scope.getCurrentUser().name,
                createdDate: new Date(),
                includedPropertyTypes: []
            };

            RealpacReportingService.create({}, function (data) {
                $scope.selectedRealpacReporting = angular.copy(data);
                $scope.toEditView();

            }, function (httpResponse) {
                switch (httpResponse.status) {
                    case 501:
                        $scope.addNoTimeoutAlert("The administration does not support this feature!", 'warning');
                        break;

                    case 401:
                        $scope.addNoTimeoutAlert("You are not authorized to create a new RealPac Reporting!", 'warning');
                        break;

                    default:
                        $scope.addNoTimeoutAlert("An error has occurred while trying to create a new RealPac Reporting!", 'danger');
                        break;
                }
            });
        };

        $scope.editRealpacReporting = function (realpacReporting) {
            ControllerInfoPasser.put("selectedRealpacReportingYear", realpacReporting);
            $scope.selectRealpacReporting(realpacReporting);
            $scope.toEditView();
            $scope.checkForBuildingSnapshot();
        };

        $scope.toListView = function () {
            if (angular.isDefined(ControllerInfoPasser.get('selectedRealpacReportingYear'))) {
                $scope.selectedRealpacReporting = ControllerInfoPasser.get('selectedRealpacReportingYear');
                $scope.editRealpacReporting($scope.selectedRealpacReporting);
            } else {
                $scope.selectedRealpacReporting = {};
                $scope.screenToShow = 0;
            }
        };

        $scope.toEditView = function () {
            $scope.screenToShow = 1;
            $scope.selectedRealpacPropertyValidationType = $scope.REALPAC_FILTER_TYPE.ALL;
            $scope.getMatchingProperties();
        };

        $scope.getMatchingProperties = function () {
            $scope.matchingProperties.length = 0;
            $scope.matchingPropertiesSubset.length = 0;
            $scope.loadingProperties = true;

            IntegratedRealpacService.getPropertyListInTypesForYear({reportingYear: $scope.selectedRealpacReporting.reportingYear}, $scope.selectedRealpacReporting.includedPropertyTypes, function (data) {
                $scope.loadingProperties = false;
                $scope.matchingProperties = angular.copy(data);
                $scope.matchingPropertiesSubset = angular.copy(data);
            }, function () {
                $scope.addAlert('An error has occurred getting the properties which match the property types!', 'danger', 10000);
            });
        };

        $scope.exportReportingYear = function (realpacReporting) {
            var url = contextPath + '/webapi/realpacreporting/excel/' + realpacReporting.reportingYear;
            var data = {types: realpacReporting.includedPropertyTypes};

            $scope.openInNewWindow('POST', url, data);
        };

        $scope.exportWaterReportingYear = function (realpacReporting) {
            var url = contextPath + '/webapi/realpacreporting/excel/water/' + realpacReporting.reportingYear;
            var data = {types: realpacReporting.includedPropertyTypes};

            $scope.openInNewWindow('POST', url, data);
        };

        $scope.selectRealpacProperty = function (propertyNumber) {
            if ($scope.currentProperty.propertyNumber === propertyNumber) {
                $scope.jumpToBuildingSnapshotData();
            } else {
                $scope.matchingProperties.length = 0;
                $scope.matchingPropertiesSubset.length = 0;
                $scope.loadingProperties = true;
                PropertyLookup.get({propertyNumber: propertyNumber}, function (data) {
                    SelectedProperty.setSelectedProperty(data);
                    $scope.jumpToBuildingSnapshotData();
                });
            }
        };

        var reportingDataProblemCategoriesEnum = {
            BUILDING_DATA: 'Building Data',
            BUILDING_CONTACTS: 'Building Contacts',
            REALPAC_CONTACTS: 'REALpac Contacts',
            PERFORMANCE_VERIFICATION: 'Performance Verification Data'
        };

        var reportingDataProblemTypesEnum = {
            PROBLEM: 'Problem',
            WARNING: 'Warning'
        };

        var getProblemIconColor = function (problems, category) {
            var iconColor = 'i-green';
            for (var x = 0; x < problems.length; x++) {
                var p = problems[x];

                if (p.category === category) {
                    iconColor = 'i-red';
                    break;
                }
            }

            return iconColor;
        };

        var querySelectedPropertyNumber = function (propertyNumber) {
            $scope.matchingProperties.length = 0;
            $scope.matchingPropertiesSubset.length = 0;
            $scope.loadingProperties = true;
            return PropertyLookup.get({propertyNumber: propertyNumber}, function (data) {
                SelectedProperty.setSelectedProperty(data);
                $scope.jumpToRealpacBuildingContactsData();
            });
        };

        $scope.dataProblems = [];
        $scope.propertyWithDataProblems = {};

        $scope.showReportingDataIssues = function (property) {
            $scope.propertyWithDataProblems = property;

            if (angular.isDefined($scope.propertyWithDataProblems.problems)) {
                $scope.dataProblems = property.problems;

            } else {
                $scope.dataProblems = [];
            }

            $('#showDetailedReportingDataIssuesModal').modal('show');
        };

        $scope.getBuildingDataIssuesIconColor = function (property) {
            var hasBuildingDataProblems = (angular.isDefined(property.hasBuildingDataProblems) && property.hasBuildingDataProblems);
            if (hasBuildingDataProblems && angular.isDefined(property.problems)) {
                return getProblemIconColor(property.problems, reportingDataProblemCategoriesEnum.BUILDING_DATA);
            }

            return 'i-green';
        };

        $scope.getBuildingContactsIssuesIconColor = function (property) {
            var hasBuildingContactsProblems = (angular.isDefined(property.hasBuildingContactsProblems) && property.hasBuildingContactsProblems);
            if (hasBuildingContactsProblems && angular.isDefined(property.problems)) {
                return getProblemIconColor(property.problems, reportingDataProblemCategoriesEnum.BUILDING_CONTACTS);
            }

            return 'i-green';
        };

        $scope.getRealpacContactsIssuesIconColor = function (property) {
            var hasRealpacContactsProblems = (angular.isDefined(property.hasRealpacContactsProblems) && property.hasRealpacContactsProblems);
            if (hasRealpacContactsProblems && angular.isDefined(property.problems)) {
                return getProblemIconColor(property.problems, reportingDataProblemCategoriesEnum.REALPAC_CONTACTS);
            }

            return 'i-green';
        };

        $scope.getPerformanceDataIssuesIconColor = function (property) {
            var hasPerformanceDataVerificationProblems = (angular.isDefined(property.hasPerformanceDataVerificationProblems) && property.hasPerformanceDataVerificationProblems);
            if (hasPerformanceDataVerificationProblems && angular.isDefined(property.problems)) {
                return getProblemIconColor(property.problems, reportingDataProblemCategoriesEnum.PERFORMANCE_VERIFICATION);
            }

            return 'i-green';
        };

        $scope.propertyReportingDataHasError = function (property) {
            var hasBuildingDataProblems = (angular.isDefined(property.hasBuildingDataProblems) && property.hasBuildingDataProblems);
            var hasBuildingContactsProblems = (angular.isDefined(property.hasBuildingContactsProblems) && property.hasBuildingContactsProblems);
            var hasRealpacContactsProblems = (angular.isDefined(property.hasRealpacContactsProblems) && property.hasRealpacContactsProblems);
            var hasPerformanceDataVerificationProblems = (angular.isDefined(property.hasPerformanceDataVerificationProblems) && property.hasPerformanceDataVerificationProblems);

            if (hasBuildingDataProblems || hasBuildingContactsProblems || hasRealpacContactsProblems || hasPerformanceDataVerificationProblems) {
                return true;
            }

            return false;
        };

        $scope.getReportingIssuesDropdownColor = function (property) {
            if ($scope.propertyReportingDataHasError(property)) {
                return 'i-red';
            }

            return 'i-green';
        };

        $scope.selectRealpacBuildingContacts = function (propertyNumber) {
            if ($scope.currentProperty.propertyNumber === propertyNumber) {
                $scope.jumpToRealpacBuildingContactsData();
            } else {
                querySelectedPropertyNumber(propertyNumber).$promise.then(function () {
                    $scope.jumpToRealpacBuildingContactsData();
                });
            }
        };

        $scope.selectRealpacContacts = function (propertyNumber) {
            if ($scope.currentProperty.propertyNumber === propertyNumber) {
                $scope.jumpToRealpacContactsData();
            } else {
                querySelectedPropertyNumber(propertyNumber).$promise.then(function () {
                    $scope.jumpToRealpacContactsData();
                });
            }
        };

        $scope.selectPerformanceDataVerification = function (propertyNumber) {
            if ($scope.currentProperty.propertyNumber === propertyNumber) {
                $scope.jumpToPerformanceVerificationData();
            } else {
                querySelectedPropertyNumber(propertyNumber).$promise.then(function () {
                    $scope.jumpToPerformanceVerificationData();
                });
            }
        };

        $scope.jumpToBuildingSnapshotData = function () {
            $scope.changeMiddleSectionTo(realpacBuildPartial);
        };

        $scope.jumpToRealpacBuildingContactsData = function () {
            $scope.changeMiddleSectionTo(realpacBuildingContactsPartial);
        };

        $scope.jumpToRealpacContactsData = function () {
            $scope.changeMiddleSectionTo(realpacContactsPartial);
        };

        $scope.jumpToPerformanceVerificationData = function () {
            $scope.changeMiddleSectionTo(performanceDataVerificationPartial);
        };

        $scope.includeOrExcludeProperty = function (property) {
            if (property.excluded) {
                propertyNumberToIncludeOrExclude = property.propertyNumber;
                $('.includeMsg').html(property.propertyNumber + " - " + property.name);
                $('.exclusion-reason').html(property.excludedReason);
                $('#includePropertyModal').modal('show');
            } else {
                $scope.exclusionReason = '';
                propertyNumberToIncludeOrExclude = property.propertyNumber;
                $('.excludeMsg').html(property.propertyNumber + " - " + property.name);
                $('#excludePropertyModal').modal('show');
            }
        };

        $scope.excludePropertyFromRealpac = function () {
            $scope.modalLoading = true;
            RealpacBuildingService.excludePropertyFromRealpac({
                year: $scope.selectedRealpacReporting.reportingYear,
                propertyNumber: propertyNumberToIncludeOrExclude
            }, $scope.exclusionReason, function () {
                $scope.modalLoading = false;
                $('#excludePropertyModal').modal('hide');

                $scope.addAlert('Successfully excluded the property from REALpac reporting year ' + $scope.selectedRealpacReporting.reportingYear, 'success');
                $scope.getMatchingProperties();
            }, function (httpResponse) {
                switch (httpResponse.status) {
                    case 304:
                        $scope.displayMessageInElement(".excludeError", 'A Realpac Building cannot be modified if the Realpac reporting year is not "Active"!', 10000);
                        break;

                    default:
                        $scope.displayMessageInElement(".excludeError", 'An error has occurred trying to exclude the property!', 10000);
                        break;
                }
                $scope.modalLoading = false;
            });
        };


        $scope.includePropertyInRealpac = function () {
            $scope.modalLoading = true;
            RealpacBuildingService.includePropertyFromRealpac({
                year: $scope.selectedRealpacReporting.reportingYear,
                propertyNumber: propertyNumberToIncludeOrExclude
            }, {}, function () {
                $scope.modalLoading = false;
                $('#includePropertyModal').modal('hide');

                $scope.addAlert('Successfully included the property in REALpac reporting year ' + $scope.selectedRealpacReporting.reportingYear, 'success');
                $scope.getMatchingProperties();
            }, function () {
                $scope.modalLoading = false;
                $scope.displayMessageInElement(".excludeError", 'An error has occurred trying to exclude the property!', 10000);
            });
        };

        $http.get(contextPath + '/webapi/systemconfig/security/Security:RealpacAdmins').success(function (accessType) {
            // The object returned is of structure {"$": "R"}
            $scope.realpacReportingAccess = $scope.moduleAccessTypes[accessType['$']];
        });

        // Array of strings not handled nicely by angular
        $http.get(contextPath + '/webapi/properties/types').success(function (data) {
            $scope.propertyTypes = angular.copy(data);
        }).error(function () {
            $scope.addAlert('An error has occurred getting the list of property types!', 'danger', 10000);
        });

        $scope.loadDropboxes(['realpacReportingStatus', 'realpacPropertyValidationTypes']);
        $scope.getRealpacReportings();
    }])
    .controller('BuildingSnapshotCtrl', ['$scope', 'RealpacReportingService', 'IntegratedRealpacService', 'contextPath', '$http', 'SelectedProperty', 'ControllerInfoPasser', function ($scope, RealpacReportingService, IntegratedRealpacService, contextPath, $http, SelectedProperty, ControllerInfoPasser) {
        $scope.realpacReportings = [];
        $scope.buildingSnapshot = {};
        $scope.realpacBuilding = {};
        $scope.buildingValidations = {};
        $scope.addressPanel = true;
        $scope.infoPanel = false;
        $scope.buildingInfoPanel = false;
        $scope.certPanel = false;
        $scope.loading = false;
        $scope.buildingSnapshotAccess = $scope.moduleAccessTypes.R;
        $scope.currentProperty = SelectedProperty.getSelectedProperty();
        $scope.noRealpacSubmission = false;
        $scope.openingStatus = $scope.realpacBuildingStatusEnum.PENDING;

        var reportingYear;

        var populateBuildingData = function (data, reportingYear) {
            $scope.loading = false;
            $scope.propertyTypeNotSelectedForReporting = false;

            if (angular.isDefined(data.buildingSnapshot) && angular.isDefined(data.buildingSnapshot.id)) {
                $scope.buildingSnapshot = angular.copy(data.buildingSnapshot);
            } else {
                $scope.buildingSnapshot = {reportingYear: reportingYear};
                $scope.propertyTypeNotSelectedForReporting = true;
            }

            if (angular.isDefined(data.realpacBuilding) && angular.isDefined(data.realpacBuilding.id)) {
                $scope.realpacBuilding = angular.copy(data.realpacBuilding);
                if (angular.isDefined($scope.realpacBuilding.status)) {
                    $scope.openingStatus = angular.copy($scope.realpacBuilding.status);
                }
            } else {
                $scope.realpacBuilding = {reportingYear: reportingYear};
                $scope.propertyTypeNotSelectedForReporting = true;
            }
        };

        $scope.getRealpacReportings = function () {
            $scope.noRealpacSubmission = false;
            $scope.realpacReportings.length = 0;
            $scope.loading = true;
            RealpacReportingService.query({}, function (data) {
                $scope.loading = false;
                $scope.realpacReportings = angular.copy(data);

                var reportingYearJumpedFrom = ControllerInfoPasser.get('selectedRealpacReportingYear');

                if (angular.isDefined(reportingYearJumpedFrom)) {
                    reportingYear = reportingYearJumpedFrom.reportingYear;
                    $scope.getBuildingData(reportingYear);
                } else {
                    for (var i = 0; i < $scope.realpacReportings.length; i++) {
                        if ($scope.realpacReportings[i].status === $scope.realpacReportingStatusEnum.ACTIVE) {
                            reportingYear = $scope.realpacReportings[i].reportingYear;
                            $scope.getBuildingData(reportingYear);
                            break;
                        }
                    }
                    if (angular.isUndefined(reportingYear)) {
                        var indexWhenThereIsNoActive = 0;
                        if (angular.isDefined($scope.realpacReportings[indexWhenThereIsNoActive])) {
                            reportingYear = $scope.realpacReportings[indexWhenThereIsNoActive].reportingYear;
                            $scope.getBuildingData(reportingYear);
                        }
                    }
                }

                if ($scope.realpacReportings.length <= 0) {
                    $scope.noRealpacSubmission = true;
                }

            }, function () {
                $scope.loading = false;
                $scope.addAlert('An error has occurred loading the Realpac reports for building snapshots!', 'danger', 10000);
            });
        };

        $scope.getBuildingData = function (reportingYear) {
            $scope.loading = true;

            IntegratedRealpacService.findByReportingYearAndPropertyNumberAndBuildingNumber({
                reportingYear: reportingYear,
                propertyNumber: $scope.currentProperty.propertyNumber

            }, function (data) {
                populateBuildingData(data, reportingYear);

            }, function (httpResponse) {
                switch (httpResponse.status) {
                    case 304:
                        $scope.noRealpacSubmission = true;
                        $scope.loading = false;
                        break;
                    default:
                        $scope.loading = false;
                        $scope.addAlert("An error has occurred loading the building data for year \'" + reportingYear + "\'", 'danger', 10000);
                }
            });
        };

        $scope.exportRealpacBuildingFieldChanges = function () {
            var buildingData = {
                buildingSnapshot: $scope.buildingSnapshot,
                realpacBuilding: $scope.realpacBuilding
            };

            var url = contextPath + '/webapi/realpac/changes/export/';
            var data = {realpacBuildingDTO: buildingData};
            $scope.openInNewWindow('POST', url, data);

        };

        $scope.validateRealpacBuilding = function () {
            $scope.loading = true;
            if (angular.isDefined($scope.buildingSnapshot.id) || angular.isDefined($scope.realpacBuilding.id)) {

                var buildingData = {
                    buildingSnapshot: $scope.buildingSnapshot,
                    realpacBuilding: $scope.realpacBuilding
                };

                IntegratedRealpacService.validate({}, buildingData, function (data) {
                    $scope.buildingValidations = angular.copy(data);
                }, function () {
                    $scope.addAlert('An error has occurred while validating the building data!', 'danger', 10000);
                });
            }

            $scope.loading = false;
        };

        $scope.focusRealpacField = function (fieldName) {

            if ($scope.addressPanel === false) {
                $scope.toggleRealpacAddressCollapse();
            }

            if ($scope.buildingInfoPanel === false) {
                $scope.toggleRealpacInfoCollapse();
            }

            var n = "#" + fieldName;
            angular.element(n).focus();
        };

        $scope.toggleRealpacAddressCollapse = function () {
            $scope.addressPanel = !$scope.addressPanel;
            angular.element('#address-info-body').toggle('collapse');
        };

        $scope.toggleRealpacInfoCollapse = function () {
            $scope.buildingInfoPanel = !$scope.buildingInfoPanel;
            angular.element('#building-info-body').toggle('collapse');
        };

        $scope.saveBuildingData = function () {
            $scope.loading = true;
            if (angular.isDefined($scope.buildingSnapshot.id) || angular.isDefined($scope.realpacBuilding.id)) {
                updateBuildingData();
            } else {
                addBuildingData();
            }
        };

        var addBuildingData = function () {
            $scope.buildingSnapshot.propertyNumber = $scope.currentProperty.propertyNumber;
            $scope.realpacBuilding.propertyNumber = $scope.currentProperty.propertyNumber;

            var buildingData = {
                buildingSnapshot: $scope.buildingSnapshot,
                realpacBuilding: $scope.realpacBuilding
            };

            IntegratedRealpacService.save({}, buildingData, function (data) {
                $scope.addAlert('Successfully created the building data for year \'' + $scope.realpacBuilding.reportingYear + '\'', 'success', 10000);

                populateBuildingData(data, $scope.realpacBuilding.reportingYear);

            }, function () {
                $scope.loading = false;
                $scope.addAlert('An error has occurred while creating the building data!', 'danger', 10000);
            });
        };

        var updateBuildingData = function () {
            var buildingData = {
                buildingSnapshot: $scope.buildingSnapshot,
                realpacBuilding: $scope.realpacBuilding
            };

            IntegratedRealpacService.update({}, buildingData, function (data) {
                $scope.addAlert('Successfully updated the building data for year \'' + $scope.realpacBuilding.reportingYear + '\'', 'success', 10000);
                populateBuildingData(data, $scope.realpacBuilding.reportingYear);

            }, function () {
                $scope.loading = false;
                $scope.addAlert('An error has occurred while updating the building data!', 'danger', 10000);
            });
        };

        $http.get(contextPath + '/webapi/systemconfig/security/Security:RealpacEditors').success(function (accessType) {
            // The object returned is of structure {"$": "R"}
            $scope.buildingSnapshotAccess = $scope.moduleAccessTypes[accessType['$']];
        });

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, property) {
            $scope.currentProperty = angular.copy(property);
            $scope.getBuildingData(reportingYear);
        });

        $scope.loadDropboxes(['realpacBuildingStatus', 'realpacBuildingType', 'realpacLeedRatingSystem', 'realpacLeedCertification', 'realpacBOMABEStCertification']);
        $scope.getRealpacReportings();

    }])
    .controller('GresbReportingCtrl', ['$scope', 'GresbReportingService', 'BusinessContactService', 'SelectedProperty', 'contextPath', '$http', 'PropertyLookup', 'ControllerInfoPasser', 'IntegratedGresbService', 'PerformanceDataSnapshotService', function ($scope, GresbReportingService, BusinessContactService, SelectedProperty, contextPath, $http, PropertyLookup, ControllerInfoPasser, IntegratedGresbService, PerformanceDataSnapshotService) {

        //ui
        $scope.screenToShow = 0;
        $scope.gresbReportingOrder = ['reportingYear'];
        $scope.gresbModalReportingOrder = [];
        $scope.ownerPropertiesOrder = ['propertyNumber'];
        $scope.loading = false;
        $scope.loadingOwnerProperties = false;
        $scope.gresbReportingAccess = $scope.moduleAccessTypes.R;
        $scope.selectedGresbPropertyValidationType = 'allProperties';

        //data
        $scope.gresbReportings = [];
        $scope.selectedGresbReporting = {};
        $scope.owners = [];
        $scope.ownerProperties = [];
        $scope.ownerPropertiesSubset = [];


        //verification data
        $scope.verificationReportingYear = undefined;
        $scope.verificationSelectedProperties = [];
        $scope.verificationSelectedUtility = [];
        $scope.verificationUtility = [];
        $scope.gresbReportIssues = [];
        $scope.gresbExcelReportYear = [];

        //pagination
        $scope.currentPage = 0;
        $scope.pageSize = 10;
        $scope.currentPageModal = 0;
        $scope.pageSizeModal = 10;

        $scope.dataProblems = [];
        $scope.propertyWithDataProblems = {};

        $scope.GRESB_FILTER_TYPE = {
            ALL: 'ALL',
            COMPLETED: 'COMPLETED',
            IN_PROGRESS: 'IN_PROGRESS',
            BUILDING_DATA_ERRORS: 'BUILDING_DATA_ERRORS',
            QUESTIONNAIRE_ERRORS: 'QUESTIONNAIRE_ERRORS',
            PERFORMANCE_VALIDATION_ERRORS: 'PERFORMANCE_VALIDATION_ERRORS',
            CONSUMPTION_DATA_ALLOCATION_ERRORS: 'CONSUMPTION_DATA_ALLOCATION_ERRORS',
            EXCLUDED: 'EXCLUDED'
        };

        var gresbDataProblemCategoriesEnum = {
            GRESB_BUILDING_DATA: 'GRESB Building Data',
            GRESB_QUESTIONNAIRE: 'GRESB Questionnaire',
            GRESB_PERFORMANCE: 'Performance Verification Data',
            GRESB_CONSUMPTION: 'Consumption Data Allocation'
        };

        var gresbBuildingDataPartial = 'partials/sustainability/gresb/gresbBuilding.html';
        var gresbQuestionnairePartial = 'partials/yearlyQuestionnaire.html';
        var gresbPerformancePartial = 'partials/sustainability/performanceVerification.html';
        var gresbConsumptionDataAllocationPartial = 'partials/sustainability/gresb/gresbDataAllocation.html';

        $scope.getVerificationData = function (gresbReporting) {
            if (angular.isDefined(gresbReporting)) {
                if (angular.isDefined(gresbReporting.reportingYear)) {
                    $scope.verificationReportingYear = gresbReporting.reportingYear;
                }
                $scope.selectGresbReporting(gresbReporting);

                $scope.getClientProperties();

            }
        };

        $scope.getDistinctUtility = function () {
            $scope.verificationSelectedProperties.length = 0;
            $scope.verificationSelectedUtility.length = 0;
            $scope.verificationUtility.length = 0;

            var propertyNums = [];
            if (angular.isDefined($scope.ownerProperties)) {
                for (var x in $scope.ownerProperties) {
                    propertyNums.push($scope.ownerProperties[x].propertyNumber)
                }
            }

            PerformanceDataSnapshotService.distinct({year: $scope.selectedGresbReporting.reportingYear}, propertyNums, function (data) {

                $scope.verificationUtility = angular.copy(data);

            }, function () {
                $scope.addAlert('An error has occurred loading the reporting year utilities!', 'danger', 10000);
            });

        };

        $scope.getManagedType = function (type) {
            if (angular.isDefined(type)) {
                if (type === true) {
                    return "Managed";
                } else {
                    return "Indirectly Managed";
                }
            } else {
                return "--";
            }
        };

        $scope.exportGresbReportIssues = function (reportingYear) {
            var url = contextPath + '/webapi/gresbreporting/excel/errors/export/' + reportingYear.reportingYear + '/' + reportingYear.owner;
            var data = {greabReportingYear: reportingYear.reportingYear, owner: reportingYear.owner};

            $scope.openInNewWindow('POST', url, data);
        };

        $scope.exportGresbReportingYear = function (reportingYear) {
            var url = contextPath + '/webapi/gresbreporting/excel/' + reportingYear.reportingYear + '/' + reportingYear.owner;
            var exportData = {greabReportingYear: reportingYear.reportingYear, owner: reportingYear.owner};

            GresbReportingService.checkGresbFile({year: reportingYear.reportingYear}, function (data) {
                $scope.loading = false;
                var exists = angular.copy(data);
                $scope.loading = false;

                if (exists.result === true) {
                    $scope.openInNewWindow('POST', url, exportData);
                } else {
                    $scope.addAlert('There is no GRESB template loaded for ' + reportingYear.reportingYear + '!', 'danger', 10000);
                }

            }, function () {
                $scope.loading = false;
                $scope.addAlert('There was a problem with the export!', 'danger', 10000);

            });

        };

        $scope.exportVerification = function () {
            var url = contextPath + '/webapi/gresbreporting/excel/verification/' + $scope.verificationReportingYear;
            var data = {properties: $scope.verificationSelectedProperties, energy: $scope.verificationSelectedUtility};

            $scope.openInNewWindow('POST', url, data);
        };

        $scope.getGresbReportIssues = function (reportingYear) {

            $scope.gresbExcelReportYear = reportingYear;
            $scope.loading = true;
            GresbReportingService.getReportIssues({year: reportingYear.reportingYear, owner: reportingYear.owner}, function (data) {
                $scope.loading = false;
                $scope.gresbReportIssues = angular.copy(data);
                $scope.loading = false;

                if ($scope.gresbReportIssues.length > 0) {
                    $('#showGresbReportIssuesModal').modal('show');
                } else {
                    $scope.exportGresbReportingYear(reportingYear);
                }

            }, function () {
                $scope.loading = false;
                $scope.addAlert('An error has occurred loading the Gresb report issues!', 'danger', 10000);

            });


        };

        
        $scope.filterOwnerPropertiesByValidation = function (validation) {

            if (angular.isDefined($scope.ownerProperties) && angular.isDefined(validation)) {

                $scope.ownerPropertiesSubset.length = 0;

                for (var x = 0; x < $scope.ownerProperties.length; x++) {

                    var isNotExcluded = $scope.ownerProperties[x].gresbStatus !== $scope.gresbBuildingStatusEnum.EXCLUDED;

                    switch ($scope.selectedGresbPropertyValidationType) {
                        case $scope.GRESB_FILTER_TYPE.ALL:
                            $scope.ownerPropertiesSubset.push($scope.ownerProperties[x]);
                            break;
                        case $scope.GRESB_FILTER_TYPE.IN_PROGRESS:
                            if ($scope.ownerProperties[x].hasProblems === true && isNotExcluded) {
                                $scope.ownerPropertiesSubset.push($scope.ownerProperties[x]);
                            }
                            break;
                        case $scope.GRESB_FILTER_TYPE.COMPLETED:
                            if ($scope.ownerProperties[x].hasProblems === false && isNotExcluded) {
                                $scope.ownerPropertiesSubset.push($scope.ownerProperties[x]);
                            }
                            break;
                        case $scope.GRESB_FILTER_TYPE.BUILDING_DATA_ERRORS:
                            if ($scope.ownerProperties[x].hasBuildingDataProblems === true && isNotExcluded) {
                                $scope.ownerPropertiesSubset.push($scope.ownerProperties[x]);
                            }
                            break;
                        case $scope.GRESB_FILTER_TYPE.QUESTIONNAIRE_ERRORS:
                            if ($scope.ownerProperties[x].hasQuestionnaireProblems === true && isNotExcluded) {
                                $scope.ownerPropertiesSubset.push($scope.ownerProperties[x]);
                            }
                            break;
                        case $scope.GRESB_FILTER_TYPE.PERFORMANCE_VALIDATION_ERRORS:
                            if ($scope.ownerProperties[x].hasPerformanceProblems === true && isNotExcluded) {
                                $scope.ownerPropertiesSubset.push($scope.ownerProperties[x]);
                            }
                            break;
                        case $scope.GRESB_FILTER_TYPE.CONSUMPTION_DATA_ALLOCATION_ERRORS:
                            if ($scope.ownerProperties[x].hasConsumptionDataProblems === true && isNotExcluded) {
                                $scope.ownerPropertiesSubset.push($scope.ownerProperties[x]);
                            }
                            break;
                        case $scope.GRESB_FILTER_TYPE.EXCLUDED:
                            if (!isNotExcluded) {
                                $scope.ownerPropertiesSubset.push($scope.ownerProperties[x]);
                            }
                            break;
                        default :
                            $scope.ownerPropertiesSubset.push($scope.ownerProperties[x]);
                            break;

                    }
                }
            }
        };

        $scope.possessiveString = function (string) {
            var rtn;
            if (angular.isDefined(string)) {
                if (string.endsWith('s')) {
                    rtn = string + "'";
                } else {
                    rtn = string + "'s";
                }
            }
            return rtn;
        };

        $scope.getGresbReportingIssuesDropdownColor = function (property) {
            if ($scope.gresbPropertyDataHasError(property)) {
                return 'i-red';
            }

            return 'i-green';
        };

        $scope.gresbPropertyDataHasError = function (property) {
            var hasBuildingDataProblems = (property.hasBuildingDataProblems === true);
            var hasQuestionnaireProblems = (property.hasQuestionnaireProblems === true);
            var hasPerformanceProblems = (property.hasPerformanceProblems === true);
            var hasAllocationProblems = (property.hasConsumptionDataProblems === true);
            if (hasBuildingDataProblems || hasQuestionnaireProblems || hasPerformanceProblems || hasAllocationProblems) {
                return true;
            }

            return false;
        };

        $scope.getGresbBuildingDataIssuesIconColor = function (property) {
            var hasBuildingDataProblems = (property.hasBuildingDataProblems === true);
            if (hasBuildingDataProblems && angular.isDefined(property.problems)) {
                return getProblemIconColor(property.problems, gresbDataProblemCategoriesEnum.GRESB_BUILDING_DATA);
            }

            return 'i-green';
        };

        $scope.getGresbQuestionnaireIssuesIconColor = function (property) {
            var hasQuestionnaireProblems = (property.hasQuestionnaireProblems === true);
            if (hasQuestionnaireProblems && angular.isDefined(property.problems)) {
                return getProblemIconColor(property.problems, gresbDataProblemCategoriesEnum.GRESB_QUESTIONNAIRE);
            }

            return 'i-green';
        };

        $scope.getGresbPerformanceIssuesIconColor = function (property) {
            var hasPerformanceProblems = (property.hasPerformanceProblems === true);
            if (hasPerformanceProblems && angular.isDefined(property.problems)) {
                return getProblemIconColor(property.problems, gresbDataProblemCategoriesEnum.GRESB_PERFORMANCE);
            }

            return 'i-green';
        };

        $scope.getGresbConsumptionDataAllocationIssuesIconColor = function (property) {
            var hasAllocationProblems = (property.hasConsumptionDataProblems === true);
            if (hasAllocationProblems && angular.isDefined(property.problems)) {
                return getProblemIconColor(property.problems, gresbDataProblemCategoriesEnum.GRESB_CONSUMPTION);
            }

            return 'i-green';
        };

        $scope.selectGresbProperty = function (propertyNumber) {
            if ($scope.currentProperty.propertyNumber === propertyNumber) {
                $scope.jumpToGresbBuildingData();
            } else {
                $scope.loadingProperties = true;
                PropertyLookup.get({propertyNumber: propertyNumber}, function (data) {
                    SelectedProperty.setSelectedProperty(data);
                    $scope.jumpToGresbBuildingData();
                });
            }
        };

        $scope.selectGresbQuestionnaire = function (propertyNumber) {
            if ($scope.currentProperty.propertyNumber === propertyNumber) {
                $scope.jumpToGresbQuestionnaire();
            } else {
                $scope.loadingProperties = true;
                PropertyLookup.get({propertyNumber: propertyNumber}, function (data) {
                    SelectedProperty.setSelectedProperty(data);
                    $scope.jumpToGresbQuestionnaire();
                });
            }
        };

        $scope.selectGresbPerformance = function (propertyNumber) {
            if ($scope.currentProperty.propertyNumber === propertyNumber) {
                $scope.jumpToGresbPerformance();
            } else {
                querySelectedGresbPropertyNumber(propertyNumber).$promise.then(function () {
                    $scope.jumpToGresbPerformance();
                });
            }
        };

        $scope.selectGresbConsumptionDataAllocation = function (propertyNumber) {
            if ($scope.currentProperty.propertyNumber === propertyNumber) {
                $scope.jumpToGresbConsumptionDataAllocation();
            } else {
                querySelectedGresbPropertyNumber(propertyNumber).$promise.then(function () {
                    $scope.jumpToGresbConsumptionDataAllocation();
                });
            }
        };

        var querySelectedGresbPropertyNumber = function (propertyNumber) {
            $scope.loadingProperties = true;
            return PropertyLookup.get({propertyNumber: propertyNumber}, function (data) {
                SelectedProperty.setSelectedProperty(data);
                $scope.jumpToGresbPerformance();
            });
        };

        $scope.showGresbReportingDataIssues = function (property) {
            $scope.propertyWithDataProblems = property;

            if (angular.isDefined($scope.propertyWithDataProblems.problems)) {
                $scope.dataProblems = property.problems;

            } else {
                $scope.dataProblems = [];
            }

            $('#showGresbDataIssuesModal').modal('show');
        };

        $scope.jumpToGresbBuildingData = function () {
            $scope.changeMiddleSectionTo(gresbBuildingDataPartial);
        };

        $scope.jumpToGresbQuestionnaire = function () {
            $scope.changeSelection('gresbYearlyQuestionnaire');
        };

        $scope.jumpToGresbPerformance = function () {
            $scope.changeMiddleSectionTo(gresbPerformancePartial);
        };

        $scope.jumpToGresbConsumptionDataAllocation = function () {
            $scope.changeMiddleSectionTo(gresbConsumptionDataAllocationPartial);
        };

        var getProblemIconColor = function (problems, category) {
            var iconColor = 'i-green';
            for (var x = 0; x < problems.length; x++) {
                var p = problems[x];

                if (p.category === category) {
                    iconColor = 'i-red';
                    break;
                }
            }

            return iconColor;
        };

        $scope.clearGresbReportingYear = function () {
            if (angular.isDefined(ControllerInfoPasser.get('selectedGresbReportingYear'))) {
                ControllerInfoPasser.clear('selectedGresbReportingYear');
            }
        };

        $scope.getGresbReportings = function () {
            $scope.setGresbView();

            $scope.gresbReportings.length = 0;
            $scope.loading = true;
            GresbReportingService.findAllIncludeValidation({}, function (data) {
                $scope.loading = false;
                $scope.gresbReportings = angular.copy(data);
            }, function () {
                $scope.loading = false;
                $scope.addAlert('An error has occurred loading the Gresb reports!', 'danger', 10000);
            });
        };

        $scope.saveGresbReporting = function () {
            $scope.loading = true;
            ControllerInfoPasser.put('selectedGresbReportingYear', $scope.selectedGresbReporting);
            if (angular.isDefined($scope.selectedGresbReporting.id)) {
                updateGresbReporting();
            } else {
                addGresbReporting();
            }
        };

        var addGresbReporting = function () {
            GresbReportingService.save({}, $scope.selectedGresbReporting, function (data) {
                $scope.addAlert('Successfully created the Gresb report for year \'' + $scope.selectedGresbReporting.reportingYear + '\'', 'success', 10000);
                $scope.clearGresbReportingYear();
                $scope.getGresbReportings();
            }, function (httpResponse) {
                $scope.loading = false;

                switch (httpResponse.status) {
                    case 405:
                        $scope.addAlert('A ' + $scope.selectedGresbReporting.reportingYear + ' reporting year already exists for the owner ' + $scope.selectedGresbReporting.owner, 'warning');
                        break;
                    default:
                        $scope.addAlert('An error has occurred while creating the Gresb report!', 'danger', 10000);
                }
            });
        };

        var updateGresbReporting = function () {
            GresbReportingService.update({}, $scope.selectedGresbReporting, function (data) {
                $scope.addAlert('Successfully updated the Gresb report for year \'' + $scope.selectedGresbReporting.reportingYear + '\'', 'success', 10000);
                $scope.getGresbReportings();
            }, function () {
                $scope.loading = false;
                $scope.addAlert('An error has occurred while updating the Gresb report!', 'danger', 10000);
            });
        };

        $scope.deleteGresbReporting = function () {
            $scope.loading = true;

            GresbReportingService.delete({
                id: $scope.selectedGresbReporting.id
            }, $scope.selectedGresbReporting, function (data) {
                $('#deleteGresbReportingModal').modal('hide');
                $scope.addAlert('Successfully deleted the Gresb report for year \'' + $scope.selectedGresbReporting.reportingYear + '\'', 'success', 10000);
                $scope.clearGresbReportingYear();
                $scope.getGresbReportings();
            }, function () {
                $scope.loading = false;
                $scope.displayMessageInElement('#errorText', 'An error has occurred while deleting the Gresb report!', 10000);
            });
        };

        $scope.selectGresbReporting = function (gresbReporting) {
            $scope.selectedGresbReporting = angular.copy(gresbReporting);
        };

        $scope.addGresbReporting = function () {
            GresbReportingService.create({}, function (data) {
                $scope.selectedGresbReporting = data;
                $scope.toEditView();

            }, function (ignoreHttpResponse) {
                $scope.displayMessageInElement("#errorText", "An error has occurred trying to initialize GRESB Reporting form!", 10000);
            });
        };

        $scope.editGresbReporting = function (gresbReporting) {
            ControllerInfoPasser.put('selectedGresbReportingYear', gresbReporting);
            $scope.selectGresbReporting(gresbReporting);
            $scope.toEditView();
            $scope.getClientProperties();
        };

        $scope.getAllOwners = function () {
            $scope.owners.length = 0;
            $scope.loadingOwners = true;
            BusinessContactService.query({}, function (data) {
                $scope.loadingOwners = false;
                $scope.owners = data;
            }, function (httpResponse) {
                $scope.loadingOwners = false;
            });
        };

        $scope.addOwner = function (owner) {
            $scope.selectedGresbReporting.owner = owner.name;
            $('#addOwnerModal').modal('hide');
            $scope.getClientProperties();
        };

        $scope.setGresbView = function () {
            if (angular.isDefined(ControllerInfoPasser.get('selectedGresbReportingYear'))) {
                $scope.selectedGresbReporting = ControllerInfoPasser.get('selectedGresbReportingYear');
                $scope.getClientProperties();
                $scope.toEditView();
            } else {
                $scope.selectedGresbReporting = {};
                $scope.screenToShow = 0;
            }
        };

        $scope.toEditView = function () {
            $scope.screenToShow = 1;
            $scope.selectedGresbPropertyValidationType = $scope.GRESB_FILTER_TYPE.ALL
        };

        $scope.toListView = function () {
            $scope.clearGresbReportingYear();
            $scope.getGresbReportings();
            $scope.clearSavedGresbConsumptionDataAllocation();
        };

        $scope.clearSavedGresbConsumptionDataAllocation = function () {
            ControllerInfoPasser.clear('selectedGresbConsumptionVerificationProperty');
            ControllerInfoPasser.clear('selectedGresbConsumptionVerification');
            ControllerInfoPasser.clear('selectedGresbConsumptionVerificationYear');
        };

        $scope.getClientProperties = function () {
            if (angular.isUndefined($scope.selectedGresbReporting.id)) {
                return;
            }

            $scope.currentPage = 0;
            $scope.tableFilter = '';

            $scope.ownerProperties.length = 0;
            $scope.ownerPropertiesSubset.length = 0;
            $scope.loadingOwnerProperties = true;
            IntegratedGresbService.listClientPropertiesForYear({
                owner: $scope.selectedGresbReporting.owner,
                year: $scope.selectedGresbReporting.reportingYear
            }, function (data) {
                $scope.ownerProperties = angular.copy(data);
                $scope.ownerPropertiesSubset = angular.copy(data);
                $scope.loadingOwnerProperties = false;
            }, function () {
                $scope.loadingOwnerProperties = false;
                $scope.addAlert('An error has occurred getting the properties for \'' + $scope.selectedGresbReporting.owner + '\'!', 'danger', 10000);
            });
        };

        $http.get(contextPath + '/webapi/systemconfig/security/Security:GresbAdmins').success(function (accessType) {
            // The object returned is of structure {"$": "R"}
            $scope.gresbReportingAccess = $scope.moduleAccessTypes[accessType['$']];
        });

        $scope.loadDropboxes(['gresbReportingStatus', 'gresbPropertyValidationTypes']);

        $scope.getGresbReportings();

    }])
    .controller('GresbBuildingCtrl', ['$scope', 'IntegratedGresbService', 'GresbReportingService', 'SelectedProperty', 'ControllerInfoPasser', 'contextPath', function ($scope, IntegratedGresbService, GresbReportingService, SelectedProperty, ControllerInfoPasser, contextPath) {
        $scope.currentProperty = SelectedProperty.getSelectedProperty();

        $scope.addressPanelState = true;
        $scope.infoPanelState = false;
        $scope.detailPanelState = false;
        $scope.activeGresbReporting = [];
        $scope.selectedGresbYear = undefined;
        $scope.selectedBuilding = undefined;
        $scope.gresbBuilding = undefined;
        $scope.buildingDataFound = false;
        $scope.loading = false;
        $scope.buildingValidations = {};


        $scope.clickHasRenovationProjects = function () {
            if (angular.isDefined($scope.selectedBuilding)) {
                if ($scope.selectedBuilding.hasMajorRenovationProjects == true) {
                    $scope.selectedBuilding.renovationEndDate = undefined;
                    $scope.selectedBuilding.renovationStartDate = undefined;
                }
            }
        };

        $scope.clickHasConstructionProjects = function () {
            if (angular.isDefined($scope.selectedBuilding)) {
                if ($scope.selectedBuilding.hasConstructionProjects == true) {
                    $scope.selectedBuilding.constructionEndDate = undefined;
                    $scope.selectedBuilding.constructionStartDate = undefined;
                }
            }
        };

        $scope.findReportWithActiveStatus = function () {
            GresbReportingService.findWithStatus({status: $scope.gresbReportingStatusEnum.ACTIVE}, function (data) {

                angular.forEach(data, function (gresbReporting) {
                    if ($scope.activeGresbReporting.indexOf(gresbReporting.reportingYear) < 0) {
                        $scope.activeGresbReporting.push(gresbReporting.reportingYear);
                    }
                });

                $scope.activeGresbReporting.sort().reverse();

                var gresbJumpedFrom = ControllerInfoPasser.get('selectedGresbReportingYear');

                if (angular.isDefined(gresbJumpedFrom)) {
                    $scope.reportingYear = gresbJumpedFrom.reportingYear;
                    $scope.selectedGresbYear = $scope.reportingYear;
                    $scope.getGresbBuildingForYear($scope.selectedGresbYear);

                } else {
                    if ($scope.activeGresbReporting.length > 0) {
                        $scope.selectedGresbYear = $scope.activeGresbReporting[0];
                        $scope.getGresbBuildingForYear($scope.selectedGresbYear);
                    }
                }

            }, function () {
                $scope.addAlert('An error has occurred finding the active GRESB reporting years!');
            });
        };

        $scope.findReports = function () {
            GresbReportingService.query({}, function (data) {

                angular.forEach(data, function (gresbReporting) {
                    if ($scope.activeGresbReporting.indexOf(gresbReporting.reportingYear) < 0) {
                        $scope.activeGresbReporting.push(gresbReporting.reportingYear);
                    }
                });

                $scope.activeGresbReporting.sort().reverse();

                var gresbJumpedFrom = ControllerInfoPasser.get('selectedGresbReportingYear');

                if (angular.isDefined(gresbJumpedFrom)) {
                    $scope.reportingYear = gresbJumpedFrom.reportingYear;
                    $scope.selectedGresbYear = $scope.reportingYear;
                    $scope.getGresbBuildingForYear($scope.selectedGresbYear);

                } else {
                    if ($scope.activeGresbReporting.length > 0) {
                        $scope.selectedGresbYear = $scope.activeGresbReporting[0];
                        $scope.getGresbBuildingForYear($scope.selectedGresbYear);
                    }
                }

            }, function () {
                $scope.addAlert('An error has occurred finding the active GRESB reporting years!');
            });
        };

        $scope.getGresbBuildingForYear = function (year) {
            $scope.selectedBuilding = undefined;
            $scope.loading = true;

            IntegratedGresbService.findByReportingYearAndPropertyNumberAndBuildingNumber({
                propertyNumber: $scope.currentProperty.propertyNumber,
                reportingYear: year

            }, function (data) {

                $scope.loading = false;

                if (angular.isDefined(data.buildingSnapshot)) {
                    $scope.selectedBuilding = angular.copy(data.buildingSnapshot);
                }

                if (angular.isDefined(data.gresbBuilding)) {
                    $scope.gresbBuilding = angular.copy(data.gresbBuilding);
                }

                $scope.buildingDataFound = true;

            }, function (data) {
                // On Error
                switch (data.status) {
                    case 304:
                        $scope.addAlert('No building data was returned for this reporting year!', 'warning');
                        break;
                    default:
                        $scope.addAlert('There was an error loading the building data!', 'danger');
                }
                $scope.buildingDataFound = false;
                $scope.loading = false;
            });
        };

        $scope.saveGresbBuilding = function () {
            var gresbBuildingDTO = {
                buildingSnapshot: $scope.selectedBuilding,
                gresbBuilding: $scope.gresbBuilding
            };

            if (angular.isDefined($scope.selectedBuilding.id) || angular.isDefined($scope.gresbBuilding.id)) {
                IntegratedGresbService.update({}, gresbBuildingDTO, saveSuccess, saveError);
            } else {
                IntegratedGresbService.save({}, gresbBuildingDTO, saveSuccess, saveError);
            }
        };

        $scope.exportBuildingFieldChanges = function () {
            var gresbBuildingDTO = {
                buildingSnapshot: $scope.selectedBuilding,
                gresbBuilding: $scope.gresbBuilding
            };

            var url = contextPath + '/webapi/gresb/changes/export/';
            var data = {gresbBuildingDTO: gresbBuildingDTO};
            $scope.openInNewWindow('POST', url, data);

        };

        $scope.validateGresbBuilding = function () {
            $scope.loading = true;
            if (angular.isDefined($scope.selectedBuilding.id) || angular.isDefined($scope.gresbBuilding.id)) {

                var buildingData = {
                    buildingSnapshot: $scope.selectedBuilding,
                    gresbBuilding: $scope.gresbBuilding
                };

                IntegratedGresbService.validate({}, buildingData, function (data) {
                    $scope.buildingValidations = angular.copy(data);
                }, function () {
                    $scope.addAlert('An error has occurred while validating the building data!', 'danger', 10000);
                });
            }

            $scope.loading = false;
        };

        $scope.focusGresbField = function (fieldName) {

            if ($scope.addressPanelState === false) {
                $scope.toggleGresbAddressCollapse();
            }

            if ($scope.infoPanelState === false) {
                $scope.toggleGresbInfoCollapse();
            }

            var n = "#" + fieldName;
            angular.element(n).focus();
        };

        $scope.toggleGresbAddressCollapse = function () {
            $scope.addressPanelState = !$scope.addressPanelState;
            angular.element('#address-info-body').toggle('collapse');
        };

        $scope.toggleGresbInfoCollapse = function () {
            $scope.infoPanelState = !$scope.infoPanelState;
            angular.element('#building-info-body').toggle('collapse');
        };

        var saveSuccess = function () {
            $scope.addAlert('The GRESB building was saved successfully', 'success', 10000);
            $scope.getGresbBuildingForYear($scope.selectedBuilding.reportingYear);
        };

        var saveError = function () {
            $scope.addAlert('An error has occurred saving the GRESB building!', 'danger', 10000);
        };

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function () {
            $scope.currentProperty = SelectedProperty.getSelectedProperty();
            $scope.getGresbBuildingForYear($scope.selectedGresbYear);
        });


        $scope.loadDropboxes(['gresbBuildingStatus', 'gresbPropertyType', 'gresbOtherPropertyType', 'gresbCurrency', 'boolean']);
        $scope.findReports();
    }])
    .controller('GresbVerificationCtrl', ['$scope', 'GresbReportingService', 'BusinessContactService', 'SelectedProperty', 'contextPath', '$http', 'PropertyLookup', 'ControllerInfoPasser', 'IntegratedGresbService', 'PerformanceDataVerificationService', 'UtilityConsumptionSnapshotService', 'PerformanceDataSnapshotService', '$q', function ($scope, GresbReportingService, BusinessContactService, SelectedProperty, contextPath, $http, PropertyLookup, ControllerInfoPasser, IntegratedGresbService, PerformanceDataVerificationService, UtilityConsumptionSnapshotService, PerformanceDataSnapshotService, $q) {

        var currentProperty = SelectedProperty.getSelectedProperty();
        $scope.consumptionVerificationDataList = [];
        $scope.consumptionVerificationDataOrder = ['propertyNumber'];
        $scope.consumptionSpaceOrder = ['']
        $scope.selectedConsumptionVerificationData = {};
        $scope.gresbReportings = [];
        $scope.gresbReportingYears = [];

        $scope.selectedYear = undefined;
        $scope.selectedMeter = undefined;

        //assets
        var managedAssetEdit = true;
        var indirectAssetEdit = true;
        $scope.managedAsset = {};
        $scope.indirectAsset = {};

        //totals
        $scope.tally = 0;
        $scope.managedAssetConsumption = 0;
        $scope.indirectAssetConsumption = 0;

        //panels
        $scope.managedAssetPanelState = true;
        $scope.indirectPanelState = true;
        $scope.meterDataFound = false;
        $scope.isDetailsPageShown = false;

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function () {
            $scope.cancel();
            currentProperty = SelectedProperty.getSelectedProperty();
            $scope.getGresbReportingYears();
        });

        $scope.getVerifiedButtonProperty = function (state, property) {
            if (angular.isDefined(state) && angular.isDefined(property)) {
                if (state === true) {
                    switch (property) {
                        case 'TEXT':
                            return "Verified";
                            break;
                        case 'COLOR':
                            return "btn-success";
                            break;
                        case 'ICON':
                            return "icon-checkmark-circle";
                            break;
                        default:
                            return "";
                    }

                } else {
                    if (state === false) {
                        switch (property) {
                            case 'TEXT':
                                return "Unverified";
                                break;
                            case 'COLOR':
                                return "btn-danger";
                                break;
                            case 'ICON':
                                return "icon-cancel-circle";
                                break;
                            default:
                                return "";
                        }
                    }
                }
            }

        };

        $scope.getTotalColor = function (total) {
            if (angular.isDefined(total)) {
                if (total == 0) {
                    return "label-success";
                } else {
                    if (total < 0) {
                        return "label-danger";

                    } else {
                        return "label-info";
                    }
                }
            }
        };

        $scope.getAllocated = function () {
            var x = $scope.managedAssetConsumption + $scope.indirectAssetConsumption;
            return $scope.getRounded(x);
        };

        $scope.getTotal = function () {
            var x = $scope.selectedConsumptionVerificationData.reportedConsumption - $scope.managedAssetConsumption - $scope.indirectAssetConsumption;
            return $scope.getRounded(x);
        };

        var refresh = function () {
            $scope.tally = 0;
            $scope.managedAssetConsumption = 0;
            $scope.indirectAssetConsumption = 0;
        };

        var showDetailsPage = function (bool) {
            refresh();
            $scope.isDetailsPageShown = bool;

        };

        $scope.sumManagedAsset = function () {
            var m = $scope.zero($scope.managedAsset.baseCommonConsumption) +
                $scope.zero($scope.managedAsset.baseSharedConsumption) +
                $scope.zero($scope.managedAsset.baseOutdoorConsumption) +
                $scope.zero($scope.managedAsset.tenantTenantPaidConsumption) +
                $scope.zero($scope.managedAsset.tenantLandlordPaidConsumption) +
                $scope.zero($scope.managedAsset.wholeCombinedConsumption);

            $scope.managedAssetConsumption = $scope.getRounded(m);
        };

        $scope.sumIndirectAsset = function () {
            var i = $scope.zero($scope.indirectAsset.baseOutdoorConsumption) + $scope.zero($scope.indirectAsset.wholeCombinedConsumption);

            $scope.indirectAssetConsumption = $scope.getRounded(i);
        };

        $scope.zero = function (number) {
            if (angular.isUndefined(number)) {
                return 0;
            } else {
                return number;
            }
        };

        $scope.setGresbVerificationView = function () {

            if (angular.isDefined(ControllerInfoPasser.get('selectedGresbConsumptionVerificationProperty')) &&
                angular.isDefined(ControllerInfoPasser.get('selectedGresbConsumptionVerification') &&
                    angular.isDefined(ControllerInfoPasser.get('selectedGresbConsumptionVerificationYear')))) {

                var propertyNum = ControllerInfoPasser.get('selectedGresbConsumptionVerificationProperty');
                if (SelectedProperty.getSelectedProperty().propertyNumber == propertyNum) {
                    $scope.selectedYear = ControllerInfoPasser.get('selectedGresbConsumptionVerificationYear');
                    $scope.openGresbConsumptionDetails(ControllerInfoPasser.get('selectedGresbConsumptionVerification'));
                } else {
                    showDetailsPage(false);
                    $scope.getGresbReportingYears();
                }

            } else {
                showDetailsPage(false);
                $scope.getGresbReportingYears();
            }
        };

        $scope.getGresbReportingYears = function () {

            $scope.gresbReportingYears.length = 0;
            $scope.gresbReportings.length = 0;
            $scope.loading = true;

            GresbReportingService.query({}, function (data) {
                $scope.loading = false;
                $scope.gresbReportings = angular.copy(data);

                //get the reporting years
                for (var i = 0; i < data.length; i++) {
                    if (angular.isDefined(data[i].reportingYear) && angular.isDefined(data[i].status)) {
                        if (data[i].status === "ACTIVE") {
                            if ($scope.gresbReportingYears.indexOf(data[i].reportingYear) < 0) {
                                $scope.gresbReportingYears.push(data[i].reportingYear);
                            }
                        }
                    }
                }

                //sort and select reportingyear
                if ($scope.gresbReportingYears.length > 0) {
                    $scope.gresbReportingYears.sort().reverse();

                    var selectedGresbReportingYear = ControllerInfoPasser.get('selectedGresbReportingYear');
                    if (angular.isDefined(selectedGresbReportingYear)) {
                        $scope.selectedYear = selectedGresbReportingYear.reportingYear;
                    } else {
                        $scope.selectedYear = $scope.gresbReportingYears[0];
                    }
                    $scope.loadConsumptionDataList();
                }

            }, function () {
                $scope.loading = false;
                $scope.addAlert('An error has occurred loading the Gresb reports!', 'danger', 10000);
            });
        };

        $scope.loadConsumptionDataList = function () {
            $scope.loading = true;
            var buildingNumber = undefined;

            if (angular.isDefined($scope.currentBuilding)) {
                if (angular.isDefined($scope.currentBuilding.buildingNumber)) {
                    buildingNumber = $scope.currentBuilding.buildingNumber;
                }
            }

            var location = {
                propertyNumber: currentProperty.propertyNumber,
                buildingNumber: buildingNumber
            };

            $scope.consumptionVerificationDataList.length = 0;
            PerformanceDataSnapshotService.meters({
                year: $scope.selectedYear
            }, location, function (data, ignoreResponseHeaders) {
                // Success
                $scope.loading = false;
                $scope.consumptionVerificationDataList = angular.copy(data);

            }, function (ignoreHttpResponse) {
                $scope.loading = false;
                $scope.addAlert('There was a problem in retrieving the verification data list...', 'danger');
                // Error

            });
        };

        $scope.saveGresbConsumptionVerification = function (consumptionVerification) {
            ControllerInfoPasser.put('selectedGresbConsumptionVerificationProperty', currentProperty.propertyNumber);
            ControllerInfoPasser.put('selectedGresbConsumptionVerification', consumptionVerification);
            ControllerInfoPasser.put('selectedGresbConsumptionVerificationYear', $scope.selectedYear);
        };

        $scope.clearSavedGresbConsumptionVerification = function () {
            ControllerInfoPasser.clear('selectedGresbConsumptionVerificationProperty');
            ControllerInfoPasser.clear('selectedGresbConsumptionVerification');
            ControllerInfoPasser.clear('selectedGresbConsumptionVerificationYear');
        };

        $scope.openGresbConsumptionDetails = function (consumptionVerification) {
            $scope.saveGresbConsumptionVerification(consumptionVerification);
            $scope.selectedConsumptionVerificationData = angular.copy(consumptionVerification);
            $scope.getManagedAsset();
            $scope.getIndirectAsset();

            showDetailsPage(true);

            $scope.sumManagedAsset();
            $scope.sumIndirectAsset();
            //$scope.tally = $scope.getTotal();
        };

        $scope.cancel = function () {
            $scope.clearSavedGresbConsumptionVerification();
            $scope.setGresbVerificationView();
        };


        $scope.getManagedAsset = function () {
            $scope.loading = true;

            var buildingNumber = "--";
            var meter = "--";

            if (angular.isDefined($scope.currentBuilding)) {
                if (angular.isDefined($scope.currentBuilding.buildingNumber)) {
                    buildingNumber = $scope.currentBuilding.buildingNumber;
                }
            }

            if (angular.isDefined($scope.selectedConsumptionVerificationData.utilityMeter)) {
                if (angular.isDefined($scope.selectedConsumptionVerificationData.utilityMeter.meterNumber)) {
                    meter = $scope.selectedConsumptionVerificationData.utilityMeter.meterNumber;
                }
            }

            PerformanceDataSnapshotService.find({
                year: $scope.selectedYear,
                property: currentProperty.propertyNumber,
                building: buildingNumber,
                meter: meter,
                energy: $scope.selectedConsumptionVerificationData.energyType,
                managed: true

            }, function (data, ignoreResponseHeaders) {
                // Success
                $scope.loading = false;
                $scope.managedAsset = angular.copy(data);
                managedAssetEdit = true;
                $scope.sumManagedAsset();

            }, function (ignoreHttpResponse) {
                // Error
                switch (ignoreHttpResponse.status) {
                    case 304:
                        //create new
                        managedAssetEdit = false;
                        $scope.createAsset(true);
                        break;
                    default:
                        $scope.addAlert('There was a problem retreiving the managed asset...', 'danger');
                }
                $scope.loading = false;

            });


        };

        $scope.getIndirectAsset = function () {
            $scope.loading = true;

            var buildingNumber = "--";
            var meter = "--";

            if (angular.isDefined($scope.currentBuilding)) {
                if (angular.isDefined($scope.currentBuilding.buildingNumber)) {
                    buildingNumber = $scope.currentBuilding.buildingNumber;
                }
            }

            if (angular.isDefined($scope.selectedConsumptionVerificationData.utilityMeter)) {
                if (angular.isDefined($scope.selectedConsumptionVerificationData.utilityMeter.meterNumber)) {
                    meter = $scope.selectedConsumptionVerificationData.utilityMeter.meterNumber;
                }
            }

            PerformanceDataSnapshotService.find({
                year: $scope.selectedYear,
                property: currentProperty.propertyNumber,
                building: buildingNumber,
                meter: meter,
                energy: $scope.selectedConsumptionVerificationData.energyType,
                managed: false

            }, function (data, ignoreResponseHeaders) {
                // Success
                $scope.loading = false;
                $scope.indirectAsset = angular.copy(data);
                indirectAssetEdit = true;
                $scope.sumIndirectAsset();

            }, function (ignoreHttpResponse) {
                // Error
                switch (ignoreHttpResponse.status) {
                    case 304:
                        //creat new
                        indirectAssetEdit = false;
                        $scope.createAsset(false);
                        break;
                    default:
                        $scope.addAlert('There was a problem retreiving the indirect asset...', 'danger');
                }
                $scope.loading = false;

            });

        };

        $scope.createAsset = function (isManaged) {
            $scope.loading = true;

            var buildingNumber = "--";
            var meter = "--";

            if (angular.isDefined($scope.currentBuilding)) {
                if (angular.isDefined($scope.currentBuilding.buildingNumber)) {
                    buildingNumber = $scope.currentBuilding.buildingNumber;
                }
            }

            if (angular.isDefined($scope.selectedConsumptionVerificationData.utilityMeter)) {
                if (angular.isDefined($scope.selectedConsumptionVerificationData.utilityMeter.meterNumber)) {
                    meter = $scope.selectedConsumptionVerificationData.utilityMeter.meterNumber;
                }
            }

            return PerformanceDataSnapshotService.create({
                year: $scope.selectedYear,
                property: currentProperty.propertyNumber,
                building: buildingNumber,
                meter: meter,
                energy: $scope.selectedConsumptionVerificationData.energyType,
                managed: isManaged

            }, function (data, ignoreResponseHeaders) {
                // Success
                $scope.loading = false;
                if (isManaged) {
                    $scope.managedAsset = angular.copy(data);
                    $scope.sumManagedAsset();
                } else {
                    $scope.indirectAsset = angular.copy(data);
                    $scope.sumIndirectAsset();
                }

            }, function (ignoreHttpResponse) {
                $scope.loading = false;
                $scope.addAlert('There was a problem creating the asset...', 'danger');
                // Error

            }).$promise;
        };

        $scope.saveAssets = function () {
            $scope.saveAsset(true, managedAssetEdit);
            $scope.saveAsset(false, indirectAssetEdit);
        };

        $scope.validateAssets = function () {
            $q.all([
                $scope.validateAsset(true),
                $scope.validateAsset(false)
            ]).then(function () {
                if (angular.isDefined($scope.managedAsset.errors) || angular.isDefined($scope.indirectAsset.errors)) {
                    $('#performanceDataErrorsModal').modal('show');
                } else {
                    $scope.saveAssets();
                }
            });
        };

        $scope.validateAsset = function (managed) {

            $scope.persisting = true;
            var snapshot;

            if (managed === true) {
                snapshot = $scope.managedAsset;
            } else {
                if (managed === false) {
                    snapshot = $scope.indirectAsset;
                }
            }

            return PerformanceDataSnapshotService.validate({}, snapshot, function (data, ignoreResponseHeaders) {
                // Success
                if (managed === true) {
                    $scope.managedAsset = data;
                } else {
                    if (managed === false) {
                        $scope.indirectAsset = data;
                    }
                }
                $scope.persisting = false;
            }, function (ignoreHttpResponse) {
                // Error
                $scope.persisting = false;
                $scope.addAlert('There was an error validating the consumption data!', 'danger');
            }).$promise;
        };

        $scope.saveAsset = function (managed, update) {
            $scope.persisting = true;
            var snapshot;

            if (managed === true) {
                snapshot = $scope.managedAsset;
            } else {
                if (managed === false) {
                    snapshot = $scope.indirectAsset;
                }
            }

            if (update === true) {

                PerformanceDataSnapshotService.update({}, snapshot, function (data, ignoreResponseHeaders) {
                    // Success
                    if (managed === true) {
                        managedAssetEdit = true;
                        $scope.managedAsset = data;
                    } else {
                        if (managed === false) {
                            indirectAssetEdit = true;
                            $scope.indirectAsset = data;
                        }
                    }
                    $scope.persisting = false;
                    $scope.addAlert('Successfully updated performance snapshot!', 'success');

                }, function (ignoreHttpResponse) {
                    // Error
                    $scope.persisting = false;
                    $scope.addAlert('Error updating consumption allocation!', 'danger');
                });

            } else {

                PerformanceDataSnapshotService.save({}, snapshot, function (data, ignoreResponseHeaders) {
                    // Success
                    if (managed === true) {
                        $scope.managedAsset = data;
                        managedAssetEdit = true;
                    } else {
                        if (managed === false) {
                            $scope.indirectAsset = data;
                            indirectAssetEdit = true;
                        }
                    }
                    $scope.persisting = false;
                    $scope.addAlert('Successfully saved performance snapshot!', 'success');

                }, function (ignoreHttpResponse) {
                    // Error
                    $scope.persisting = false;
                    $scope.addAlert('Error saving consumption allocation!', 'danger');
                });

            }
        };

        $scope.setGresbVerificationView();


    }])
    .controller('RealpacContactsCtrl', ['$scope', 'IntegratedRealpacService', 'RealpacReportingService', 'SelectedProperty', 'ProfileService', 'RealpacBuildingService', 'ControllerInfoPasser', function ($scope, IntegratedRealpacService, RealpacReportingService, SelectedProperty, ProfileService, RealpacBuildingService, ControllerInfoPasser) {
        $scope.realpacReportings = [];
        $scope.loading = false;
        $scope.realpacContactsOrder = ['userprofile.profile.name'];
        $scope.realpacBuilding = {};
        $scope.users = [];
        $scope.selectedUsers = [];
        $scope.currentProperty = SelectedProperty.getSelectedProperty();
        $scope.indexOfRemoval;
        var profileIndex = 0;

        $scope.getRealpacReportings = function () {
            $scope.realpacReportings.length = 0;
            $scope.loading = true;

            ProfileService.query({}, function (data) {
                $scope.users = angular.copy(data);

                RealpacReportingService.query({}, function (data) {
                    $scope.loading = false;
                    $scope.realpacReportings = angular.copy(data);

                    var realpacReportingJumpedFrom = ControllerInfoPasser.get('selectedRealpacReportingYear');
                    var reportingYear;

                    if (angular.isDefined(realpacReportingJumpedFrom)) {
                        reportingYear = realpacReportingJumpedFrom.reportingYear;
                        $scope.getRealpacBuilding(reportingYear);

                    } else {
                        for (var i = 0; i < $scope.realpacReportings.length; i++) {
                            if ($scope.realpacReportings[i].status === $scope.realpacReportingStatusEnum.ACTIVE) {
                                reportingYear = $scope.realpacReportings[i].reportingYear;
                                $scope.getRealpacBuilding(reportingYear);
                                break;
                            }
                        }

                        if (angular.isUndefined(reportingYear)) {
                            for (var x = 0; x < $scope.realpacReportings.length; x++) {
                                if ($scope.realpacReportings[x].status === $scope.realpacReportingStatusEnum.ACTIVE) {
                                    $scope.getRealpacBuilding($scope.realpacReportings[x].reportingYear);
                                    break;
                                }
                            }
                        }
                    }

                }, function () {
                    $scope.loading = false;
                    $scope.addAlert('An error has occurred loading the Realpac reports!', 'danger', 10000);
                });

            }, function () {
                $scope.addAlert('An error has occurred loading the Profiles for Realpac!', 'danger', 10000);
            });
        };

        $scope.getRealpacBuilding = function (reportingYear) {
            $scope.loading = true;
            RealpacBuildingService.findByReportingYearAndPropertyNumberAndBuildingNumber({
                reportingYear: reportingYear,
                propertyNumber: $scope.currentProperty.propertyNumber
            }, function (data) {
                $scope.loading = false;
                if (angular.isDefined(data.id)) {
                    $scope.realpacBuilding = angular.copy(data);
                    $scope.loadProfileToUserProfile();
                }

            }, function () {
                $scope.loading = false;
                $scope.addAlert("An critical error has occurred while loading this user interface!", "danger", 10000);
            });
        };

        $scope.loadProfileToUserProfile = function () {
            $($scope.realpacBuilding.realpacContacts).each(function (index, userProfile) {
                var profile = $scope.users.filter(function (profile) {
                    return angular.isDefined(profile.userProfile) && profile.userProfile.username === userProfile.username;
                })[profileIndex];
                userProfile.profile = {name: profile.name, emailAddress: profile.emailAddress};
            });
        };

        $scope.selectReportingYear = function (reportingYear) {
            $scope.loading = true;
            RealpacBuildingService.findByReportingYearAndPropertyNumberAndBuildingNumber({
                reportingYear: reportingYear,
                propertyNumber: $scope.currentProperty.propertyNumber
            }, function (data) {
                $scope.loading = false;
                if (angular.isDefined(data.id)) {
                    $scope.noRealpacSubmission = false;
                    $scope.realpacBuilding = angular.copy(data);
                    $scope.loadProfileToUserProfile();
                } else {
                    $scope.noRealpacSubmission = true;
                    $scope.realpacBuilding = {reportingYear: reportingYear};
                }
            }, function () {
                $scope.loading = false;
                $scope.addAlert("An error has occurred loading the Realpac Contacts for year \'" + reportingYear + "\'", 'danger', 10000);
            });
        };

        $scope.newContact = function () {
            $scope.selectedUsers.length = 0;
        };

        $scope.saveContact = function () {
            for (var i = 0; i < $scope.selectedUsers.length; i++) {
                if ($scope.realpacBuilding.realpacContacts.filter(function (userProfile) {
                        return userProfile.username === $scope.selectedUsers[i].userProfile.username;
                    }).length === 0) {
                    $scope.realpacBuilding.realpacContacts.push($scope.selectedUsers[i].userProfile);
                } else {
                    $scope.displayMessageInElement('#errorText', 'The User \'' + $scope.selectedUsers[i].name + '\' was already added.', 5000);
                    return;
                }
            }

            RealpacBuildingService.update({}, $scope.realpacBuilding, function (data) {
                $scope.loadProfileToUserProfile();
                $scope.loading = false;
                $('#addRealpacContactModal').modal('hide');
                $scope.addAlert('Successfully added the User to Realpac Contacts', 'success', 10000);
            }, function () {
                $scope.loading = false;
                $('#addRealpacContactModal').modal('hide');
                $scope.addAlert('An error has occurred loading the building snapshot!', 'danger', 10000);
            });
        };

        $scope.deleteContact = function () {

            var contactName = $scope.realpacBuilding.realpacContacts[$scope.indexOfRemoval].profile.name;

            $scope.realpacBuilding.realpacContacts.splice($scope.indexOfRemoval, 1);
            RealpacBuildingService.update({}, $scope.realpacBuilding, function (data) {
                $scope.loading = false;
                $scope.addAlert('Successfully deleted the Realpac Contact \'' + contactName + '\'', 'success', 10000);
            }, function () {
                $scope.loading = false;
                $scope.addAlert('An error has occurred loading the building snapshot!', 'danger', 10000);
            });
        };

        $scope.markContactForRemoval = function (index) {
            $scope.indexOfRemoval = index;
        };

        $scope.getRealpacReportings();

    }])
    .controller('RealpacProfileContactsCtrl', ['$scope', 'RealpacBuildingService', 'RealpacReportingService', 'SelectedProperty', 'ProfileService', 'RealpacContactsService', 'ControllerInfoPasser', function ($scope, RealpacBuildingService, RealpacReportingService, SelectedProperty, ProfileService, RealpacContactsService, ControllerInfoPasser) {
        $scope.realpacReportings = [];
        $scope.loading = false;
        $scope.realpacProfileContactsOrder = ['realpacContact.profile.name'];
        $scope.realpacContacts = [];
        $scope.profiles = [];
        $scope.selectedProfiles = [];
        $scope.currentProperty = SelectedProperty.getSelectedProperty();
        $scope.indexOfRemoval;
        $scope.buildingSnapshot = {};

        ProfileService.query({}, function (data) {
            $scope.profiles = angular.copy(data);
        }, function () {
            $scope.addAlert('An error has occurred loading the Profiles for Realpac!', 'danger', 10000);
        });

        $scope.getRealpacReportings = function () {
            $scope.realpacReportings.length = 0;
            $scope.loading = true;
            RealpacReportingService.query({}, function (data) {
                $scope.loading = false;
                $scope.realpacReportings = angular.copy(data);

                var realpacReportingJumpedFrom = ControllerInfoPasser.get('selectedRealpacReportingYear');
                var reportingYear;

                if (angular.isDefined(realpacReportingJumpedFrom)) {
                    reportingYear = realpacReportingJumpedFrom.reportingYear;
                    $scope.getRealpacContacts(reportingYear);
                    $scope.getBuildingSnapshot(reportingYear);

                } else {
                    for (var i = 0; i < $scope.realpacReportings.length; i++) {
                        if ($scope.realpacReportings[i].status === $scope.realpacReportingStatusEnum.ACTIVE) {
                            reportingYear = $scope.realpacReportings[i].reportingYear;
                            $scope.getRealpacContacts(reportingYear);
                            $scope.getBuildingSnapshot(reportingYear);
                            break;
                        }
                    }

                    if (angular.isUndefined(reportingYear)) {
                        for (var x = 0; x < $scope.realpacReportings.length; x++) {
                            if ($scope.realpacReportings[x].status === $scope.realpacReportingStatusEnum.ACTIVE) {
                                $scope.getRealpacContacts($scope.realpacReportings[x].reportingYear);
                                $scope.getBuildingSnapshot($scope.realpacReportings[x].reportingYear);
                                break;
                            }
                        }
                    }
                }

            }, function () {
                $scope.loading = false;
                $scope.addAlert('An error has occurred loading the Realpac reports!', 'danger', 10000);
            });
        };

        $scope.getRealpacContacts = function (reportingYear) {
            $scope.loading = true;
            RealpacBuildingService.findContactsByYearAndPropertyNumberAndBuildingNumber({
                reportingYear: reportingYear,
                propertyNumber: $scope.currentProperty.propertyNumber
            }, function (data) {
                $scope.loading = false;
                $scope.realpacContacts = angular.copy(data);

            }, function (httpResponse) {
                $scope.loading = false;
                switch (httpResponse.status) {
                    case 404:
                        $scope.addAlert('Building snapshot was not found for year \'' + reportingYear + '\' and property number \'' + $scope.currentProperty.propertyNumber + '\'.', 'warning', 10000);
                        break;
                    default:
                        $scope.addAlert('An error has occurred loading the Realpac Building Contacts!', 'danger', 10000);
                }
            });
        };

        $scope.getBuildingSnapshot = function (reportingYear) {
            $scope.loading = true;
            RealpacBuildingService.findByReportingYearAndPropertyNumberAndBuildingNumber({
                reportingYear: reportingYear,
                propertyNumber: $scope.currentProperty.propertyNumber
            }, function (data) {
                $scope.loading = false;
                if (angular.isDefined(data.id)) {
                    $scope.buildingSnapshot = angular.copy(data);
                } else {
                    $scope.buildingSnapshot = {reportingYear: reportingYear};
                    $scope.noRealpacSubmission = true;
                }
            }, function () {
                $scope.loading = false;
                $scope.addAlert('An error has occurred loading the building snapshot!', 'danger', 10000);
            });
        };

        $scope.selectReportingYear = function () {
            $scope.loading = true;
            RealpacBuildingService.findByReportingYearAndPropertyNumberAndBuildingNumber({
                reportingYear: $scope.buildingSnapshot.reportingYear,
                propertyNumber: $scope.currentProperty.propertyNumber
            }, function (data) {
                $scope.loading = false;
                if (angular.isDefined(data.id)) {
                    $scope.noRealpacSubmission = false;
                    $scope.buildingSnapshot = data;
                    $scope.getRealpacContacts($scope.buildingSnapshot.reportingYear);
                } else {
                    $scope.noRealpacSubmission = true;
                    $scope.buildingSnapshot = {reportingYear: $scope.buildingSnapshot.reportingYear};
                }
            }, function () {
                $scope.loading = false;
                $scope.addAlert("An error has occurred loading the Realpac Contacts for year \'" + reportingYear + "\'", 'danger', 10000);
            });
        };

        $scope.newContact = function () {
            $scope.selectedProfiles.length = 0;
            $scope.realpacContactType = "";
        };

        $scope.saveContact = function () {
            var indexOfSelectedProfile = 0;

            RealpacContactsService.addProfile({
                profileId: $scope.selectedProfiles[indexOfSelectedProfile].id,
                buildingSnapshotId: $scope.buildingSnapshot.id
            }, $scope.realpacContactType, function () {
                $scope.getRealpacContacts($scope.buildingSnapshot.reportingYear);
                $('#addRealpacProfileContactModal').modal('hide');
                $scope.addAlert('Successfully added the profile \'' + $scope.selectedProfiles[indexOfSelectedProfile].name + '\' to Realpac Contacts', 'success', 10000);
            }, function (httpResponse) {
                switch (httpResponse.status) {
                    case 304:
                        $scope.displayMessageInElement('#errorText', 'The profile \'' + $scope.selectedProfiles[indexOfSelectedProfile].name + '\' was already added.', 10000);
                        break;
                    default:
                        $scope.displayMessageInElement('#errorText', 'An error has occurred while adding the profile \'' + $scope.selectedProfiles[indexOfSelectedProfile].name + '\'!', 10000);
                }
            });
        };

        $scope.deleteContact = function () {
            var contactName = $scope.realpacContacts[$scope.indexOfRemoval].profile.name;

            RealpacContactsService.removeProfile({
                profileId: $scope.realpacContacts[$scope.indexOfRemoval].profile.id,
                buildingSnapshotId: $scope.buildingSnapshot.id
            }, function () {
                $scope.getRealpacContacts($scope.buildingSnapshot.reportingYear);
                $scope.addAlert('Successfully deleted the Realpac Contact \'' + contactName + '\'', 'success', 10000);
                $scope.indexOfRemoval = undefined;
            }, function () {
                $scope.addAlert("An error has occurred deleting the Realpac Contact \'" + contactName + "\'", 'danger', 10000);
            });
        };

        $scope.markContactForRemoval = function (index) {
            $scope.indexOfRemoval = index;
        };

        $scope.getRealpacReportings();
        $scope.loadDropboxes(['realpacContactType']);

    }])
    .controller('RealpacEnergyDataCtrl', ['$scope', 'IntegratedRealpacService', 'RealpacReportingService', 'BuildingConsumptionService', 'SelectedProperty', function ($scope, IntegratedRealpacService, RealpacReportingService, BuildingConsumptionService, SelectedProperty) {
        $scope.realpacEnergyData = [];
        $scope.realpacEnergyDataOrder = ['propertyNumber'];
        $scope.loading = false;
        $scope.currentProperty = SelectedProperty.getSelectedProperty();
        $scope.realpacBuildingData = {};
        $scope.realpacReportings = [];
        $scope.selectedRealpacReport = undefined;
        $scope.energyRecord = {};

        $scope.screenToShow = 0;

        $scope.getRealpacEnergyData = function () {
            $scope.loading = true;
            $scope.toListView();

            $scope.realpacEnergyData.length = 0;

            BuildingConsumptionService.findByBuildingSnapshotAndUpdateConsumption({buildingSnapshotId: $scope.realpacBuildingData.buildingSnapshot.id}, function (data) {
                $scope.realpacEnergyData = angular.copy(data);
                $scope.loading = false;
            }, function () {
                $scope.loading = false;
                $scope.addAlert('An error has occurred retrieving the Realpac consumption data!', 'danger', 10000);
            });
        };

        $scope.getRealpacReportings = function () {
            $scope.realpacReportings.length = 0;
            $scope.loading = true;
            RealpacReportingService.query({}, function (data) {
                $scope.loading = false;
                $scope.realpacReportings = angular.copy(data);

                for (var i = 0; i < $scope.realpacReportings.length; i++) {
                    if ($scope.realpacReportings[i].status === $scope.realpacReportingStatusEnum.ACTIVE) {
                        $scope.selectedRealpacReport = angular.copy($scope.realpacReportings[i]);
                        $scope.getRealpacBuildingData($scope.realpacReportings[i].reportingYear);
                        break;
                    }
                }
            }, function () {
                $scope.loading = false;
                $scope.addAlert('An error has occurred loading the Realpac reports!', 'danger', 10000);
            });
        };

        $scope.getRealpacBuildingData = function (reportingYear) {
            $scope.loading = true;
            IntegratedRealpacService.findByReportingYearAndPropertyNumberAndBuildingNumber({
                reportingYear: reportingYear,
                propertyNumber: $scope.currentProperty.propertyNumber
            }, function (data) {
                $scope.loading = false;
                if (angular.isDefined(data.buildingSnapshot.id) && angular.isDefined(data.realpacBuilding.id)) {
                    $scope.realpacBuildingData = angular.copy(data);
                    $scope.getRealpacEnergyData();
                }
            }, function () {
                $scope.loading = false;
                $scope.addAlert('An error has occurred loading the building snapshot!', 'danger', 10000);
            });
        };

        $scope.editEnergyRecord = function (realpacConsumption) {
            if (angular.isDefined($scope.realpacBuildingData.buildingSnapshot) && angular.isDefined($scope.realpacBuildingData.buildingSnapshot.id)) {
                $scope.energyRecord = angular.copy(realpacConsumption);
                $scope.toEditView();
            } else {
                $scope.addAlert('There is currently no active reporting year!', 'warning', 10000);
            }
        };

        $scope.saveRealpacEnergyData = function () {

            $scope.energyRecord.buildingSnapshot = $scope.realpacBuildingData.buildingSnapshot;

            BuildingConsumptionService.update({}, $scope.energyRecord, function () {
                $scope.loading = false;
                $scope.addAlert('Successfully saved the Realpac Consumption record', 'success', 10000);
                $scope.getRealpacEnergyData();
            }, function () {
                $scope.loading = false;
                $scope.addAlert('An error has occurred updating the Realpac Consumption!', 'danger', 10000);
            });
        };

        $scope.toListView = function () {
            $scope.screenToShow = 0;
        };

        $scope.toEditView = function () {
            $scope.screenToShow = 1;
        };

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function () {
            $scope.currentProperty = SelectedProperty.getSelectedProperty();
            $scope.getRealpacEnergyData();
        });

        $scope.loadDropboxes(['realpacConsumptionStatus']);
        $scope.getRealpacReportings();
    }])
    .controller('PerformanceDataVerificationCtrl', ['$scope', 'contextPath', 'PerformanceDataVerificationService', 'SelectedProperty', 'ControllerInfoPasser', 'UtilityService', '$q', 'PropertyLookup', function ($scope, contextPath, PerformanceDataVerificationService, SelectedProperty, ControllerInfoPasser, UtilityService, $q, PropertyLookup) {

        var thisYear = new Date().getFullYear();
        var currentProperty = SelectedProperty.getSelectedProperty();

        $scope.consumptionVerificationDataList = [];
        $scope.consumptionVerificationDataOrder = ['propertyNumber'];
        $scope.selectedConsumptionVerificationData = {};
        $scope.isDetailsPageShown = false;
        $scope.selectedYear = undefined;
        $scope.years = [];
        $scope.showInvalidInputInformationText = false;
        $scope.persisting = false;

        $scope.snapshotUtilityRecords = [];
        $scope.snapshotValidationErrors = [];
        $scope.showConsumptionRecords = false;
        $scope.periodDate = new Date();


        //extract modal
        $scope.resetExtractModal = function () {
            $scope.allPropertiesList = [];
            $scope.selectedProperties = [];

            $scope.allYearsModal = [];
            $scope.selectedYearsModal = [];

            $scope.allUtilityTypesList = [];
            $scope.selectedUtilityTypes = [];
        };

        $scope.showExtractModal = function () {
            $scope.resetExtractModal();

            $q.all([
                $scope.getAllPropertiesList()
            ]).then(function () {
                $scope.getPropertyRecordDetails();
                $('#extractPerformanceDataModal').modal('show');
            }, function () {
                $scope.addAlert("An error occurred while attempting to load the extract data!", "danger", 1000);
            });
        };

        $scope.getAllPropertiesList = function () {
            return PropertyLookup.findAllActiveDTO({}, function (data) {
                $scope.allPropertiesList = angular.copy(data);
                var selectedProperty = $scope.searchArrayForProperty($scope.allPropertiesList, 'propertyNumber', $scope.currentProperty.propertyNumber)[0];
                $scope.selectedProperties.length = 0;

                if (angular.isDefined(selectedProperty)) {
                    $scope.selectedProperties.push(selectedProperty.propertyNumber);
                }
            }, function (httpResponse) {
                //on error
            }).$promise;
        };

        $scope.getAllUtilityTypesList = function () {
            $scope.allUtilityTypesList = $scope.dropboxes['utilityType'].itemMap;
            $scope.selectedUtilityTypes = $scope.getValuesFromDropbox('utilityType');
        };

        $scope.getPropertyRecordDetails = function () {
            if ($scope.selectedProperties.length > 0) {
                $q.all([
                    $scope.getAllReportingYearsForProperties(),
                    $scope.getAllUtilityTypesForProperties()
                ]).then(function () {

                }, function () {
                    $scope.addAlert("An error occurred while attempting to load the extract data!", "danger", 1000);
                });
            } else {
                $scope.selectedYearsModal.length = 0;
                $scope.selectedUtilityTypes.length = 0;
                $scope.allYearsModal.length = 0;
                $scope.allUtilityTypesList.length = 0;
            }
        };

        $scope.getAllReportingYearsForProperties = function () {
            var tempYears = angular.copy($scope.selectedYearsModal);
            $scope.selectedYearsModal.length = 0;
            return PerformanceDataVerificationService.getYears({}, $scope.selectedProperties, function (data) {

                $scope.allYearsModal = angular.copy(data);

                for (var i = 0; i < tempYears.length; i++) {
                    if ($scope.allYearsModal.indexOf(tempYears[i]) > 0) {
                        $scope.selectedYearsModal.push(tempYears[i]);
                    }
                }
            }, function (httpResponse) {
                //on error
            }).$promise;
        };

        $scope.getAllUtilityTypesForProperties = function () {
            var tempUtil = angular.copy($scope.selectedUtilityTypes);
            $scope.selectedUtilityTypes.length = 0;
            return PerformanceDataVerificationService.getUtilityTypes({}, $scope.selectedProperties, function (data) {

                $scope.allUtilityTypesList = angular.copy(data);

                for (var i = 0; i < tempUtil.length; i++) {
                    if ($scope.allUtilityTypesList.indexOf(tempUtil[i]) > 0) {
                        $scope.selectedUtilityTypes.push(tempUtil[i]);
                    }
                }

            }, function (httpResponse) {
                //on error
            }).$promise;
        };

        $scope.extractPerformanceData = function () {
            var url = contextPath + '/webapi/performance/data/verification/excel';
            var data = {properties: $scope.selectedProperties, years: $scope.selectedYearsModal, types: $scope.selectedUtilityTypes};
            $scope.openInNewWindow('POST', url, data);
        };


        //data
        var loadYears = function () {
            $scope.years.length = 0;
            populateDefaultYears();

            var realpacReportingJumpedFrom = ControllerInfoPasser.get('selectedRealpacReportingYear');
            var gresbJumpedFrom = ControllerInfoPasser.get('selectedGresbReportingYear');

            if (angular.isDefined(realpacReportingJumpedFrom) || angular.isDefined(gresbJumpedFrom)) {

                if (angular.isDefined(realpacReportingJumpedFrom)) {
                    var reportingYear = realpacReportingJumpedFrom.reportingYear;
                }

                if (angular.isDefined(gresbJumpedFrom)) {
                    var reportingYear = gresbJumpedFrom.reportingYear;
                }

                var yearNotAvailableInYearList = true;
                for (var x = 0; x < $scope.years.length; x++) {
                    if ($scope.years[x] === reportingYear) {
                        $scope.selectedYear = $scope.years[x];
                        yearNotAvailableInYearList = false;
                        break;
                    }
                }

                if (yearNotAvailableInYearList) {
                    $scope.years.push(reportingYear);
                    $scope.years.sort(sortYears);
                    $scope.selectedYear = $scope.years[$scope.years.indexOf(reportingYear)];
                }

            }
        };

        var wrapReportedConsumptionValuesIntoNumber = function () {
            if (angular.isDefined($scope.selectedConsumptionVerificationData.snapshotList)) {
                for (var x = 0; x < $scope.selectedConsumptionVerificationData.snapshotList.length; x++) {
                    if (angular.isDefined($scope.selectedConsumptionVerificationData.snapshotList[x].reportedConsumption)) {
                        var reportedConsumption = angular.copy($scope.selectedConsumptionVerificationData.snapshotList[x].reportedConsumption);
                        $scope.selectedConsumptionVerificationData.snapshotList[x].reportedConsumption = Number(reportedConsumption);
                    }
                }
            }
        };

        var showConsumptionDetails = function () {
            $scope.isDetailsPageShown = true;
        };

        var hideConsumptionDetails = function () {
            $scope.isDetailsPageShown = false;
            $scope.selectedConsumptionVerificationData = {};
        };

        var saveConsumptionVerificationData = function () {
            $scope.persisting = true;

            PerformanceDataVerificationService.save({}, $scope.selectedConsumptionVerificationData, function (data, ignoreResponseHeaders) {
                // Success
                $scope.persisting = false;
                $scope.addAlert('Successfully saved consumption verification data!', 'success');
                $scope.selectedConsumptionVerificationData = data;

            }, function (ignoreHttpResponse) {
                $scope.persisting = false;
                // Error

            });
        };

        $scope.loadConsumptionVerificationDataList = function () {
            $scope.loading = true;
            var buildingNumber = undefined;

            if (angular.isDefined($scope.currentBuilding)) {
                if (angular.isDefined($scope.currentBuilding.buildingNumber)) {
                    buildingNumber = $scope.currentBuilding.buildingNumber;
                }
            }

            var location = {
                propertyNumber: currentProperty.propertyNumber,
                buildingNumber: buildingNumber
            };

            $scope.consumptionVerificationDataList.length = 0;
            PerformanceDataVerificationService.findVerificationObjectsByLocationAndYear({
                year: $scope.selectedYear
            }, location, function (data, ignoreResponseHeaders) {
                // Success
                $scope.loading = false;
                $scope.consumptionVerificationDataList = angular.copy(data);

            }, function (ignoreHttpResponse) {
                $scope.loading = false;
                $scope.addAlert('There was a problem in retrieving the verification data list...', 'danger');
                // Error

            });
        };

        $scope.submitConsumptionVerificationDataForm = function () {
            if ($scope.form.$valid) {
                $scope.showInvalidInputInformationText = false;
                wrapReportedConsumptionValuesIntoNumber();
                saveConsumptionVerificationData();

            } else {
                $scope.showInvalidInputInformationText = true;

            }
        };

        $scope.getCorrespondingPriorConsumption = function (snapshotData) {
            var priorConsumption = 0;
            if (angular.isDefined($scope.selectedConsumptionVerificationData.priorYearSnapshotList)) {
                var priorYearSnapshotList = $scope.selectedConsumptionVerificationData.priorYearSnapshotList;

                for (var x = 0; x < priorYearSnapshotList.length; x++) {

                    var priorSnapshotData = priorYearSnapshotList[x];
                    if ((snapshotData.month === priorSnapshotData.month) && (priorSnapshotData.excludedFromReporting === false)) {
                        if (angular.isDefined(priorSnapshotData.reportedConsumption) && priorSnapshotData.reportedConsumption !== 0) {
                            priorConsumption = priorSnapshotData.reportedConsumption;
                        } else {
                            priorConsumption = priorSnapshotData.consumption;
                        }

                        break;
                    }
                }
            }

            return priorConsumption;
        };

        $scope.getUtilityRecordsForPeriodAndPrevious = function (year) {
            var propertyNumber = $scope.currentProperty.propertyNumber;
            var utilityPath = $scope.utilityToRESTPath($scope.selectedConsumptionVerificationData.energyType);

            var meterNumber;
            if (angular.isDefined($scope.selectedConsumptionVerificationData.utilityMeter)) {
                meterNumber = $scope.selectedConsumptionVerificationData.utilityMeter.meterNumber;
            }

            $scope.snapshotUtilityRecords.length = 0;

            // Get records
            UtilityService.findInSnapshotsForMeterNumber({
                propertyNumber: propertyNumber,
                utility: utilityPath,
                snapshotYear: year,
                snapshotMonth: 1,
                meterNumber: meterNumber
            }, function (data) {
                $scope.snapshotUtilityRecordsInformation = angular.copy(data);
            }, function () {
                $scope.addAlert('An error has occurred getting the consumption records for the verification period!', 'danger', 10000);
            });
        };


        //filters
        var filterValidationErrors = function (year, month) {
            // Risk uses 1-based months, JS used 0-based
            var periodDate = new Date(year, month - 1);

            var isPriorYear = year === $scope.selectedConsumptionVerificationData.year - 1;
            var priorMonthExcludedOrVerified = false;

            if(isPriorYear) {
                for(var i = 0; i < $scope.selectedConsumptionVerificationData.priorYearSnapshotList.length; i++) {
                    var priorYearSnapshot = $scope.selectedConsumptionVerificationData.priorYearSnapshotList[i];
                    if(priorYearSnapshot.month === month) {
                        priorMonthExcludedOrVerified = priorYearSnapshot.excludedFromReporting || priorYearSnapshot.isVerified;
                        break;
                    }
                }
            }

            if (angular.isUndefined($scope.snapshotUtilityRecordsInformation) || priorMonthExcludedOrVerified) {
                return [];
            }

            var dateSplit;
            return $scope.snapshotUtilityRecordsInformation.validationErrors.filter(function (error) {
                dateSplit = error.billPeriodYear;
                var errorDate = new Date(dateSplit.getFullYear(), dateSplit.getMonth());

                return errorDate.getFullYear() === periodDate.getFullYear() && errorDate.getMonth() === periodDate.getMonth();
            })
        };

        var filterConsumptionRecords = function (year, month) {
            // Risk uses 1-based months, JS used 0-based
            var periodStartDate = $scope.getFirstDayInMonth(year, month);
            var periodEndDate = $scope.getLastDayInMonth(year, month);

            if (angular.isUndefined($scope.snapshotUtilityRecordsInformation)) {
                return [];
            }

            return $scope.snapshotUtilityRecordsInformation.rawRecords.filter(function (record) {
                var recordStartDate = new Date(record.periodStartDate);
                var recordEndDate = new Date(record.periodEndDate);

                return $scope.dateFallsBetween(recordStartDate, recordEndDate, periodStartDate)
                    || $scope.dateFallsBetween(recordStartDate, recordEndDate, periodEndDate);
            });
        };

        $scope.hasValidationErrors = function (year, month) {
            return filterValidationErrors(year, month).length > 0;
        };


        //UI
        var sortYears = function (y1, y2) {
            return y2 - y1;
        };

        var populateDefaultYears = function () {
            var maxNumberOfYearsToShow = 5;
            var yearsToShow = (thisYear - (maxNumberOfYearsToShow - 1));

            for (var i = thisYear; i >= yearsToShow; i--) {
                $scope.years.push(i);
            }

            var latestYearIndex = 0;
            $scope.selectedYear = $scope.years[latestYearIndex];
        };

        $scope.$on('event:buildingComponentSelected', function () {
            $scope.loadConsumptionVerificationDataList();
        });

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (evt, property) {
            currentProperty = angular.copy(property);
            loadYears();
            $scope.backToGeneralListView();
        });

        $scope.openMonthData = function (year, month) {
            $scope.showConsumptionRecords = true;

            // Risk uses 1-based months, JS used 0-based
            var periodDate = new Date(year, month - 1);

            $('.snapshot-date').html($scope.fullDateToFormattedText(periodDate));

            $scope.snapshotUtilityRecords = filterConsumptionRecords(year, month);
            $scope.snapshotValidationErrors = filterValidationErrors(year, month);
        };

        $scope.openConsumptionDetails = function (consumptionVerification) {
            $scope.selectedConsumptionVerificationData = angular.copy(consumptionVerification);
            showConsumptionDetails();
            $scope.getUtilityRecordsForPeriodAndPrevious($scope.selectedConsumptionVerificationData.year);
        };

        $scope.backToGeneralListView = function () {
            $scope.clearAllAlertsInPage();
            $scope.loadConsumptionVerificationDataList();
            hideConsumptionDetails();
        };

        $scope.backToDetailsOrListView = function () {
            if ($scope.showConsumptionRecords) {
                $scope.showConsumptionRecords = false;
            } else {
                $scope.backToGeneralListView();
            }
        };


        //init
        $scope.initialize = function () {
            loadYears();
            $scope.loadDropboxes(['utilityType']);
            $scope.loadConsumptionVerificationDataList();
            $scope.resetExtractModal();
        };

        $scope.initialize();

    }])
    .controller('UtilityTargetCtrl', ['$scope', '$q', 'UtilityTargetService', 'SelectedProperty', 'PropertyLookup', 'contextPath', '$http', function ($scope, $q, UtilityTargetService, SelectedProperty, PropertyLookup, contextPath, $http) {

        //data
        $scope.utilityTargets = [];
        $scope.selectedTarget = undefined;

        //ui
        $scope.screenToShow = 0;

        //data
        $scope.getUtilityTargetsForProperty = function () {
            $scope.loading = true;
            $scope.utilityTargets.length = 0;
            UtilityTargetService.findByPropertyNumber({propertyNumber: $scope.currentProperty.propertyNumber}, function (data) {
                $scope.utilityTargets = angular.copy(data);
                $scope.loading = false;
            }, function () {
                $scope.loading = false;
                $scope.addAlert('An error has occurred getting the list of performance targets!', 'danger', 10000);
            });
        };

        $scope.saveUtilityTarget = function () {
            $scope.loading = true;
            if (angular.isDefined($scope.selectedTarget.id)) {
                updateUtilityTarget();
            } else {
                addUtilityTarget();
            }
        };

        var addUtilityTarget = function () {
            UtilityTargetService.save({}, $scope.selectedTarget, targetSaveSuccess, targetSaveError);
        };

        var updateUtilityTarget = function () {
            UtilityTargetService.update({}, $scope.selectedTarget, targetSaveSuccess, targetSaveError);
        };

        $scope.deleteTarget = function () {
            $scope.loading = true;
            UtilityTargetService.delete({id: $scope.selectedTarget.id}, function () {
                // Success
                $scope.toListTargetsView();
                $scope.addAlert('The performance target was successfully deleted', 'success', 10000);
            }, function () {
                $scope.loading = false;
                $scope.displayMessageInElement('.modal-error', 'An error has occurred deleting the performance target!', 10000);
            });
        };


        //ui
        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function () {
            $scope.refreshPropertyInfo();
            $scope.toListTargetsView();
        });

        $scope.toListTargetsView = function () {
            $scope.screenToShow = 0;
            $scope.getUtilityTargetsForProperty();
        };

        $scope.toEditTargetView = function () {
            $scope.screenToShow = 1;
        };

        $scope.openTarget = function (target) {
            if (angular.isDefined($scope.targetForm)) {
                $scope.targetForm.$setPristine();
            }

            if (angular.isDefined(target)) {
                $scope.selectedTarget = angular.copy(target);
            } else {
                $scope.selectedTarget = {
                    propertyNumber: $scope.currentProperty.propertyNumber
                };
            }
            $scope.toEditTargetView();
        };

        var targetSaveSuccess = function () {
            $scope.addAlert('The performance target was successfully saved', 'success', 10000);
            $scope.toListTargetsView();
        };

        var targetSaveError = function (httpResponse) {
            $scope.loading = false;
            switch (httpResponse.status) {
                case 405:
                    $scope.addAlert('Invalid input detected, check the form fields to make sure all required fields are filled in', 'warning', 10000);
                    break;
                default:
                    $scope.addAlert('A problem occurred saving the performance target!', 'danger', 10000);
            }
        };


        //extract modal
        $scope.resetExtractModal = function () {
            $scope.allPropertiesList = [];
            $scope.selectedProperties = [];

            $scope.allClientsList = [];
            $scope.selectedClients = [];

            $scope.allUtilityTypesList = [];
            $scope.selectedUtilityTypes = [];
        };

        $scope.showUtilityTargetsExtractModal = function () {
            $q.all([
                $scope.getAllPropertiesList()
            ]).then(function () {
                $scope.getAllUtilityTypesList();
                $scope.getOwnersByPropertyNumbers();
                $('#extractUtilityTargetsModal').modal('show');
            }, function () {
                $scope.resetExtractModal();
                $scope.addAlert("An error occurred while attempting to load the extract data!", "danger", 1000);
            });
        };

        $scope.extractUtilityTargets = function () {
            var url = contextPath + '/webapi/utilitytarget/excel/';
            var data = {properties: $scope.selectedProperties, clients: $scope.selectedClients, types: $scope.selectedUtilityTypes};

            $scope.openInNewWindow('POST', url, data);

        };

        $scope.getAllPropertiesList = function () {
            return PropertyLookup.findAllAsDTO({}, function (data) {
                $scope.allPropertiesList = angular.copy(data);
                var selectedProperty = $scope.searchArrayForProperty($scope.allPropertiesList, 'propertyNumber', $scope.currentProperty.propertyNumber)[0];

                $scope.selectedProperties.length = 0;
                if (angular.isDefined(selectedProperty)) {
                    $scope.selectedProperties.push(selectedProperty.propertyNumber);
                }
            }, function (httpResponse) {
                //on error

            }).$promise;
        };

        $scope.getAllUtilityTypesList = function () {
            $scope.allUtilityTypesList = $scope.dropboxes['performanceTargetUtilityType'].itemMap;
            $scope.selectedUtilityTypes = $scope.getValuesFromDropbox('performanceTargetUtilityType');
        };


        $scope.getOwnersByPropertyNumbers = function () {
            var tempClientHolder = angular.copy($scope.selectedClients);

            $scope.allClientsList.length = 0;
            $scope.selectedClients.length = 0;

            var numbers = $.param({propertyNumbers: $scope.selectedProperties}, true);
            $http({
                method: 'POST', url: contextPath + '/webapi/properties/owners/byPropertyNumbers',
                data: numbers, headers: {'Content-Type': 'administration/x-www-form-urlencoded'}
            }).success(function (data) {
                $scope.allClientsList = data;
            }).then(function () {
                for (var i = 0; i < tempClientHolder.length; i++) {
                    if ($scope.allClientsList.indexOf(tempClientHolder[i]) > 0) {
                        $scope.selectedClients.push(tempClientHolder[i]);
                    }
                }
            });
        };

        //init
        $scope.refreshPropertyInfo = function () {
            $scope.currentProperty = SelectedProperty.getSelectedProperty();
        };

        $scope.getUtilityTargetSecurity = function () {
            $http.get(contextPath + '/webapi/systemconfig/security/Security:UtilityTargetsCRUD').success(function (accessType) {
                // The object returned is of structure {"$": "R"}
                $scope.utilityTargetCRUDAccess = $scope.moduleAccessTypes[accessType['$']];
            });
        };

        $scope.initialize = function () {
            $scope.loadDropboxes(['performanceTargetUtilityType', 'months', 'daysOfWeek', 'targetPeriods']);
            $scope.refreshPropertyInfo();
            $scope.getUtilityTargetSecurity();
            $scope.getUtilityTargetsForProperty();
            $scope.resetExtractModal();
        };

        $scope.initialize();
    }])
    .controller('RegressionAnalysisCtrl', ['$scope', '$filter', 'RegressionAnalysisService', 'SelectedProperty', 'WeatherStationService', 'WeatherDataService', 'UtilityMeterService', function ($scope, $filter, RegressionAnalysisService, SelectedProperty, WeatherStationService, WeatherDataService, UtilityMeterService) {

        $scope.records = [];
        $scope.regression = [];
        $scope.selectedRecord = undefined;
        $scope.showEditControls = false;
        $scope.loading = false;
        $scope.showPeriodChartData = false;

        $scope.override = {};

        $scope.weatherStations = [];
        $scope.weatherData = [];

        var weatherDataMonth = undefined;

        var genericMeters = [
            {meterNumber: "All Utility Meters"},
            {meterNumber: "No Utility Meter"}
        ];

        $scope.showFilteredPeriodData = false;

        $scope.chartTypes = {
            TEMPERATURE: 'TEMPERATURE',
            DEGREE_DAY: 'DEGREE_DAY'
        };

        $scope.showChartType = $scope.chartTypes.DEGREE_DAY;

        $scope.consumptionTableOrder = ['periodDate'];

        $scope.getRegressionAnalysis = function () {
            var propertyNumber = $scope.currentProperty.propertyNumber;

            $scope.loading = true;
            $scope.records.length = 0;
            RegressionAnalysisService.findByPropertyNumber({propertyNumber: propertyNumber}, function (data) {
                $scope.loading = false;
                $scope.records = angular.copy(data);
            }, function () {
                $scope.loading = false;
                $scope.addAlert('There was an error getting the list of consumption analysis!', 'danger', 10000);
            });
        };

        $scope.setActiveProfile = function (record) {

            record.activeProfile = true;
            //$scope.toggleEditView();

        };

        $scope.toggleEditView = function () {
            if ($scope.showEditControls == false) {
                $scope.showEditControls = true;

            } else {
                $scope.selectedRecord = undefined;
                $scope.showEditControls = false;
                $scope.getRegressionAnalysis();
            }
        };

        $scope.openRegressionAnalysis = function (record) {
            if (angular.isDefined($scope.editForm)) {
                $scope.editForm.$setPristine();
            }

            if (angular.isDefined(record)) {
                $scope.selectedRecord = angular.copy(record);
                $scope.showPeriodChartData = false;
                $scope.findUtilityMeters();
                $scope.refreshPeriodData();
                $scope.toggleEditView();
            } else {
                var propertyNumber = $scope.currentProperty.propertyNumber;
                RegressionAnalysisService.create({propertyNumber: propertyNumber}, function (data) {
                    $scope.selectedRecord = angular.copy(data);

                    $scope.selectedRecord.temperatureUnit = $scope.dropboxes['temperatureUnits'].itemMap[0].value;
                    $scope.toggleEditView();
                }, function () {
                    $scope.addAlert('There was an error creating the consumption analysis!', 'danger', 10000);
                });
            }
        };

        $scope.saveRegressionAnalysis = function () {
            if ($scope.editForm.$valid) {
                if (angular.isDefined($scope.selectedRecord.id)) {
                    $scope.updateRegressionAnalysis();
                } else {
                    $scope.addRegressionAnalysis();
                }
            } else {
                $scope.addAlert('One or more required fields are empty, please fill in all required information', 'warning', 10000);
            }

        };

        $scope.addRegressionAnalysis = function () {
            $scope.loading = true;

            RegressionAnalysisService.add({}, $scope.selectedRecord, function () {
                $scope.loading = false;
                $scope.addAlert('Successfully created the consumption analysis', 'success', 10000);
            }, function () {
                $scope.loading = false;
                $scope.addAlert('There was an error creating the consumption analysis!', 'danger', 10000);
            });
        };

        $scope.updateRegressionAnalysis = function () {
            $scope.loading = true;

            RegressionAnalysisService.update({}, $scope.selectedRecord, function () {
                $scope.loading = false;
                $scope.addAlert('Successfully updated the consumption analysis', 'success', 10000);
            }, function () {
                $scope.loading = false;
                $scope.addAlert('There was an error updating the consumption analysis', 'danger', 10000);
            });
        };

        $scope.deleteRegressionAnalysis = function () {

            RegressionAnalysisService.delete({id: $scope.selectedRecord.id}, function () {
                $('#deleteMeterModal').modal('hide');
                $scope.addAlert("Successfully deleted the consumption analysis", 'success', 10000);
                $scope.toggleEditView();
            }, function (httpResponse) {
                $scope.displayMessageInElement("#deleteError", "An error has occurred deleting the consumption analysis!", 10000);
            });
        };

        $scope.findWeatherStations = function () {
            $scope.weatherStations.length = 0;

            WeatherStationService.query({}, function (data) {
                $scope.weatherStations = angular.copy(data);
            }, function () {
                $scope.addAlert('An error has occurred getting the list of weather stations!');
            })
        };

        $scope.findUtilityMeters = function () {

            var propertyNumber = $scope.currentProperty.propertyNumber;
            var utility = $scope.selectedRecord.utilityType;

            UtilityMeterService.findByPropertyNumberAndUtility({
                propertyNumber: propertyNumber,
                utility: utility
            }, function (data) {
                $scope.utilityMeters = genericMeters.concat(data);
            }, function () {
                $scope.addAlert('An error has occurred getting the list of utility meters!');
            });
        };

        $scope.periodDataFieldsNotFilled = function () {
            return angular.isUndefined($scope.selectedRecord)
                || angular.isUndefined($scope.selectedRecord.utilityType)
                || angular.isUndefined($scope.selectedRecord.meterNumber)
                || angular.isUndefined($scope.selectedRecord.analysisPeriod)
                || angular.isUndefined($scope.selectedRecord.fromDate)
                || angular.isUndefined($scope.selectedRecord.toDate)
                || angular.isUndefined($scope.selectedRecord.temperatureUnit)
                || angular.isUndefined($scope.selectedRecord.weatherStationUUID)
        };

        $scope.refreshPeriodData = function () {
            if ($scope.periodDataFieldsNotFilled()) {
                $scope.displayMessageInElement('.generate-error', 'One or more input fields are invalid, make sure they are correct and try again', 10000);
            }

            $scope.loadingPeriod = true;
            $scope.analysisDataChanged = false;

            RegressionAnalysisService.generatePeriodData({}, $scope.selectedRecord, function (data) {
                $scope.selectedRecord = angular.copy(data);
                $scope.loadingPeriod = false;
            }, function (httpResponse) {
                $scope.selectedRecord.periodData.length = 0;
                $scope.loadingPeriod = false;
                switch (httpResponse.status) {
                    case 405:
                        $scope.displayMessageInElement('.generate-error', 'One or more input fields are invalid, make sure they are correct and try again', 10000);
                        break;
                    default:
                        $scope.displayMessageInElement('.generate-error', 'An error has occurred generating the consumption data!', 10000);
                }
            });
        };

        $scope.fillValidationModal = function (periodData) {
            var date = $scope.fullDateToFormattedText(periodData.periodDate, 'yyyy-MM-dd');
            $('.modal-period').html(date);
            $('.modal-validation-errors').html(periodData.validationErrors);
        };

        $scope.setDatesToFirstAndLast = function () {
            if (angular.isDefined($scope.selectedRecord) && $scope.selectedRecord.analysisPeriod === $scope.targetPeriodEnum.MONTHLY) {
                if (angular.isDefined($scope.selectedRecord.fromDate)) {
                    $scope.selectedRecord.fromDate = $scope.getFirstDayInMonthFromDate($scope.selectedRecord.fromDate);
                }

                if (angular.isDefined($scope.selectedRecord.toDate)) {
                    $scope.selectedRecord.toDate = $scope.getLastDayInMonthFromDate($scope.selectedRecord.toDate);
                }
            }
        };

        $scope.chartPeriodData = function () {
            $scope.showPeriodChartData = true;

            var data, title, vAxisTitle, vAxisDirection;

            var hAxisCol = 0;
            var vAxisCol = 1;
            var analysisType = $scope.selectedRecord.analysisType;

            if ($scope.showChartType === $scope.chartTypes.TEMPERATURE) {
                title = 'Consumption vs Temperature Comparison';
                vAxisTitle = 'Temperature';
                data = $scope.selectedRecord.chartData.temperatureChart;

                if (data.length === 1) {
                    data.push([NaN, NaN]);
                }

                data = google.visualization.arrayToDataTable(data);
                vAxisDirection = 1;

                if (analysisType === $scope.regressionAnalysisTypeEnum.HEATING) {
                    vAxisDirection = -1;
                }
            } else {
                var heatingOrCooling = $filter('enumToString')(analysisType);

                title = 'Consumption vs ' + heatingOrCooling + ' Degree Day Comparison';
                vAxisTitle = heatingOrCooling + ' Degree Day';
                data = $scope.selectedRecord.chartData.degreeDayChart;

                if (data.length === 1) {
                    data.push([NaN, NaN]);
                }

                data = google.visualization.arrayToDataTable(data);

                vAxisDirection = 1;
                $scope.numberFormatChartColumn(data, vAxisCol, {fractionDigits: 1});
            }

            // Consumption format
            $scope.numberFormatChartColumn(data, hAxisCol, {fractionDigits: 0});

            var options = {
                title: title,
                hAxis: {
                    title: 'Consumption'
                },
                vAxis: {
                    title: vAxisTitle,
                    direction: vAxisDirection
                },
                legend: 'none',
                chartArea: {
                    width: '80%',
                    height: '80%'
                },
                width: 800,
                height: 390
            };

            var chart = new google.visualization.ScatterChart(document.getElementById('periodChartDiv'));
            chart.draw(data, options);
        };

        $scope.overrideRow = function (row, index) {
            $scope.overrideForm.$setPristine();

            $('.modal-period').html($scope.fullDateToFormattedText(row.periodDate, 'yyyy-MM-dd'));

            $scope.override.amount = angular.copy(row.overrideConsumption);
            $scope.override.reason = angular.copy(row.overrideReason);
            $scope.override.index = index;
        };

        $scope.saveOverride = function () {
            var index = $scope.override.index;

            if ($scope.isEmptyString($scope.override.amount)) {
                $scope.selectedRecord.periodData[index].overrideConsumption = undefined;
            } else {
                $scope.selectedRecord.periodData[index].overrideConsumption = angular.copy($scope.override.amount);
            }

            if ($scope.isEmptyString($scope.override.reason)) {
                $scope.selectedRecord.periodData[index].overrideReason = undefined;
            } else {
                $scope.selectedRecord.periodData[index].overrideReason = angular.copy($scope.override.reason);
            }
        };

        $scope.clearOverride = function () {
            var index = $scope.override.index;
            $scope.selectedRecord.periodData[index].overrideConsumption = undefined;
            $scope.selectedRecord.periodData[index].overrideReason = undefined;
        };

        $scope.includeAllDays = function () {
            $scope.selectedRecord.excludeWeekends = false;
            $scope.selectedRecord.excludeWeekdays = false;
        };

        $scope.exitWeatherData = function () {
            if ($scope.selectedRecord.analysisPeriod === $scope.targetPeriodEnum.MONTHLY) {
                if ($scope.showSingleDayWeather) {
                    // Drill up to monthly averages
                    $scope.showSingleDayWeather = false;
                    $scope.showMonthWeather = true;
                    $scope.getAvgTempsForMonth(weatherDataMonth);
                } else {
                    // Go back to period data view
                    $scope.showWeatherData = false;
                    $scope.showSingleDayWeather = false;
                    $scope.showMonthWeather = false;
                }
            } else {
                $scope.showWeatherData = false;
                $scope.showSingleDayWeather = false;
                $scope.showMonthWeather = false;
            }
        };

        $scope.openWeatherDataPage = function (periodData) {
            $scope.showWeatherData = true;

            if ($scope.selectedRecord.analysisPeriod === $scope.targetPeriodEnum.MONTHLY) {
                weatherDataMonth = new Date(periodData.periodDate);
                $scope.getAvgTempsForMonth(weatherDataMonth);
            } else {
                $scope.getWeatherDataForDay(new Date(periodData.periodDate));
            }
        };

        $scope.getWeatherDataForDay = function (date) {
            if (!angular.isDate(date)) {
                return;
            }

            $scope.showSingleDayWeather = true;
            $scope.showMonthWeather = false;

            $scope.loadingPeriod = true;
            $scope.weatherData.length = 0;

            var dateStr = $scope.fullDateToFormattedText(date, 'EEE MMM dd, yyyy');
            $('.weather-data-header').html(dateStr);

            var year = date.getFullYear();
            var month = date.getMonth() + 1; // 1-Based months on server
            var day = date.getUTCDate();

            WeatherDataService.findByWeatherStationUUIDAndDate({
                stationUUID: $scope.selectedRecord.weatherStationUUID,
                year: year,
                month: month,
                day: day
            }, function (data) {
                $scope.weatherData = angular.copy(data);
                $scope.loadingPeriod = false;
            }, function () {
                $scope.loadingPeriod = false;
                $scope.exitWeatherData();
                $scope.displayMessageInElement('.generate-error', 'An error has occurred getting the weather data for \'' + dateStr + '\'', 10000);
            });
        };

        $scope.getAvgTempsForMonth = function (periodDate) {
            var from = $scope.getFirstDayInMonthFromDate(periodDate);
            var to = $scope.getLastDayInMonthFromDate(periodDate);

            var monthStr = $scope.fullDateToFormattedText(periodDate, 'MMMM yyyy');
            $('.weather-data-header').html(monthStr);

            $scope.showMonthWeather = true;
            $scope.showSingleDayWeather = false;

            $scope.loadingPeriod = true;
            $scope.weatherData.length = 0;

            WeatherStationService.getAverageTempsMapForStationAndDateRange({
                stationUUID: $scope.selectedRecord.weatherStationUUID,
                fromDate: $scope.fullDateToFormattedText(from),
                toDate: $scope.fullDateToFormattedText(to),
                unit: $scope.selectedRecord.temperatureUnit
            }, function (data) {
                $scope.weatherData = angular.copy(data);

                angular.forEach($scope.weatherData, function (elm) {
                    elm.key = new Date(elm.key);
                });

                $scope.loadingPeriod = false;
            }, function () {
                $scope.loadingPeriod = false;
                $scope.exitWeatherData();
                $scope.displayMessageInElement('.generate-error', 'An error has occurred getting the weather data for \'' + monthStr + '\'', 10000);
            });
        };

        $scope.markAnalysisChanged = function () {
            $scope.analysisDataChanged = true;
        };

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function () {
            $scope.showEditControls = true; // Force to go back to the list view
            $scope.toggleEditView();
        });

        $scope.findWeatherStations();
        $scope.getRegressionAnalysis();
        $scope.loadDropboxes(['regressionAnalysisUtilities', 'temperatureUnits', 'regressionAnalysisType', 'regressionAnalysisChartType', 'filteredOrNot']);

        $(function () {
            $('[data-toggle="tooltip"]').tooltip({
                placement: 'auto top',
                delay: {"show": 500, "hide": 100},
                html: true,
                title: $('#tooltipContent').html()
            })
        });
    }])
    .controller('BuildingCertificationCtrl', ['$scope', '$filter', 'BuildingCertificationService', 'SelectedProperty', 'contextPath', '$q', function ($scope, $filter, BuildingCertificationService, SelectedProperty, contextPath, $q) {

        $scope.certifications = [];
        $scope.selectedCertification = {};
        $scope.showEditControls = false;

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function () {
            $scope.showEditView(false);
        });

        $scope.selectedCertificationCategories = [];
        $scope.selectedCertificationTypes = [];


        $scope.getCertifications = function () {
            var propertyNumber = $scope.currentProperty.propertyNumber;

            $scope.loading = true;
            $scope.certifications.length = 0;
            BuildingCertificationService.findByPropertyNumber({propertyNumber: propertyNumber}, function (data) {
                $scope.loading = false;
                $scope.certifications = angular.copy(data);
            }, function () {
                $scope.loading = false;
                $scope.addAlert('There was an error getting the list of building certifications!', 'danger', 10000);
            });
        };

        $scope.openBuildingCertification = function (record) {
            if (angular.isDefined($scope.buildingCertificationInputForm)) {
                $scope.buildingCertificationInputForm.$setPristine();
            }

            if (angular.isDefined(record)) {
                $scope.selectedCertification = record;

            } else {
                BuildingCertificationService.create({}, function (data) {
                    $scope.selectedCertification = angular.copy(data);
                }, function () {
                    $scope.addAlert('There was an error creating the building certification!', 'danger', 10000);
                });
            }

            $scope.showEditView(true);
        };

        $scope.saveBuildingCertification = function () {
            if ($scope.buildingCertificationInputForm.$valid) {
                if (angular.isDefined($scope.selectedCertification.id)) {
                    $q.all([
                        $scope.updateBuildingCertification()
                    ]).then(function () {
                        $scope.showEditView(false)
                    });
                } else {
                    $q.all([
                        $scope.addBuildingCertification()
                    ]).then(function () {
                        $scope.showEditView(false)
                    });
                }
            } else {
                $scope.addAlert('One or more required fields are empty, please fill in all required information', 'warning', 10000);
            }

        };

        $scope.addBuildingCertification = function () {
            $scope.loading = true;

            $scope.selectedCertification.propertyNumber = $scope.currentProperty.propertyNumber;
            $scope.selectedCertification.buildingNumber = $scope.currentProperty.buildingNumber;

            return BuildingCertificationService.add({}, $scope.selectedCertification, function () {
                $scope.loading = false;
                $scope.addAlert('Successfully created the building certification', 'success', 10000);
            }, function () {
                $scope.loading = false;
                $scope.addAlert('There was an error creating the building certification!', 'danger', 10000);
            }).$promise;
        };

        $scope.updateBuildingCertification = function () {
            $scope.loading = true;

            return BuildingCertificationService.update({}, $scope.selectedCertification, function () {
                $scope.loading = false;
                $scope.addAlert('Successfully updated the building certification', 'success', 10000);
            }, function () {
                $scope.loading = false;
                $scope.addAlert('There was an error updating the building certification', 'danger', 10000);
            }).$promise;
        };


        $scope.deleteBuildingCertification = function () {

            BuildingCertificationService.delete({id: $scope.selectedCertification.id}, function () {
                $('#deleteMeterModal').modal('hide');
                $scope.addAlert("Successfully deleted the building certification", 'success', 10000);
                $scope.showEditView(false);
            }, function (httpResponse) {
                $scope.addAlert('There was an error deleting the building certification', 'danger', 10000);
            });
        };

        $scope.showEditView = function (val) {
            $scope.showEditControls = val;
            if (val == false) {
                $scope.selectedRecord = undefined;
                $scope.getCertifications();
            }
        };

        $scope.exportCertifications = function () {
            var currentProperty = SelectedProperty.getSelectedProperty();
            var url = contextPath + '/webapi/buildingcertification/excel/' + currentProperty.propertyNumber;
            var data = {categories: $scope.selectedCertificationCategories, types: $scope.selectedCertificationTypes};

            $scope.openInNewWindow('POST', url, data);
        };

        $scope.getDropboxValues = function () {
            $scope.certificationCategories = $scope.getValuesFromDropbox('buildingCertificationCategory');
            $scope.certificationTypes = $scope.getValuesFromDropbox('buildingCertificationType');
        };

        $scope.loadDropboxes(['buildingCertificationCategory', 'buildingCertificationType', 'buildingCertificationSubType', 'buildingCertificationLevel', 'isBomaCertifiedDropbox']);
        $scope.getCertifications();

    }]);