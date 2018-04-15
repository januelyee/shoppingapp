/**
 * Created with JetBrains WebStorm.
 * User: Januel
 * Date: 06/11/13
 * Time: 2:07 PM
 * To change this template use File | Settings | File Templates.
 */

angular.module('myApp.propertyDetailsControllers', [])
    .controller('PropertyDetailsCtrl', ['$scope', '$rootScope', '$http', '$timeout', '$location', 'PropertyLookup', 'SelectedProperty', 'PropertyComponentService', 'ControllerInfoPasser', 'contextPath', '$q', '$uibModal',
        function ($scope, $rootScope, $http, $timeout, $location, PropertyLookup, SelectedProperty, PropertyComponentService, ControllerInfoPasser, contextPath, $q, $modal) {

            $scope.moduleColor = $scope.getCurrentModuleColor($scope.getCurrentModule());

            $scope.showFloorsAndAreas = false;
            $scope.showRooms = false;
            $scope.currentComponent = SelectedProperty.getSelectedProperty();

            $scope.currentComponentType = "property";

            var nothingSelected = "----------";

            $scope.persisting = false;

            $scope.hasPropertyDetailsTransaction = false;

            $scope.firstAssetInvestmentGroupIndex = 0;

            $scope.propertyEmissionFactors = [];
            $scope.emissionFactorIds = [];

            $scope.propertyDetailsForms = {};

            $scope.currentUserAllowedToEditPropertyInformation = false;

            $scope.initializePropertyDetailsSecurity = function() {
                $http.get(contextPath + '/webapi/properties/security/information/allowEdit').success(function (data, ignoreStatus) {
                    if (data === 'true') {
                        $scope.currentUserAllowedToEditPropertyInformation = true;
                    } else {
                        $scope.currentUserAllowedToEditPropertyInformation = false;
                    }
                }).error(function (ignoreStatus) {
                    $scope.addAlert('There was a problem initializing property information editing permissions, ' +
                        'by default, property details will not be editable at the moment.', 'danger', 10000);

                    $scope.currentUserAllowedToEditPropertyInformation = false;
                });
            };

            var emissionFactorTemplate = {
                year: "Empty",
                country: "Empty",
                province: "Empty",
                city: "Empty",
                region: "Empty",
                subregion: "Empty"
            };

            $scope.electricityFactor = {};
            $scope.naturalGasFactor = {};
            $scope.domesticWaterFactor = {};
            $scope.steamFactor = {};
            $scope.chilledWaterFactor = {};
            $scope.heatingOilFactor = {};
            $scope.dieselFactor = {};

            var EMISSION_FACTOR_ELECTRICITY_TYPE = 'ELECTRICITY';
            var EMISSION_FACTOR_CHILLED_WATER_TYPE = 'CHILLED_WATER';
            var EMISSION_FACTOR_NATURAL_GAS_TYPE = 'NATURAL_GAS';
            var EMISSION_FACTOR_STEAM_TYPE = 'STEAM';
            var EMISSION_FACTOR_DOMESTIC_WATER_TYPE = 'WATER';
            var EMISSION_FACTOR_HEATING_OIL = 'HEATING_OIL';
            var EMISSION_FACTOR_DIESEL = 'DIESEL';

            var buildings, regions;

            var updateOwnerFieldAllowed = 'SET_CLIENT_FROM_OWNERS_LIST';

            $scope.properties = [];
            $scope.propertyToMergeFrom = [];

            $scope.statusToMark = "";
            $scope.statusChangeDates = {
                activationDate: undefined,
                acquisitionDate: undefined,
                dispositionDate: undefined,
                deactivationDate: undefined
            };

            $scope.propertyMergeOptions = {
                copyPropertyFields: true,
                copyBuildingFields: true,
                copyFloorFields: true,
                copyRoomFields: true,
                currentModule: $scope.moduleNameToEnum($scope.getCurrentModule()),
                copyQuestionnaireInfo: true,
                copySecurity: true,
                markAsInactive: true,
                copyEnvironmentalDocuments: $scope.getCurrentModule() === $scope.ENVIRONMENTAL,
                copyElectricityConsumption: $scope.getCurrentModule() === $scope.SUSTAINABILITY,
                copyNaturalGasConsumption: $scope.getCurrentModule() === $scope.SUSTAINABILITY,
                copyWaterConsumption: $scope.getCurrentModule() === $scope.SUSTAINABILITY,
                copyChilledWaterConsumption: $scope.getCurrentModule() === $scope.SUSTAINABILITY,
                copySteamConsumption: $scope.getCurrentModule() === $scope.SUSTAINABILITY,
                copyHeatingOilConsumption: $scope.getCurrentModule() === $scope.SUSTAINABILITY,
                copyDieselConsumption: $scope.getCurrentModule() === $scope.SUSTAINABILITY,
                copyInsuranceTasks: $scope.getCurrentModule() === $scope.INSURANCE
            };


            $scope.clearAllAlertsInPage = function () {
                $scope.alerts.length = 0;
            };

            $scope.setStatusChangeDates = function() {
                var activationDate = angular.copy($scope.currentProperty.activationDate);
                if (angular.isDefined(activationDate) && activationDate != null) {
                    $scope.statusChangeDates.activationDate = new Date(activationDate);
                }

                var acquisitionDate = angular.copy($scope.currentProperty.acquisitionDate);
                if (angular.isDefined(acquisitionDate) && acquisitionDate != null) {
                    $scope.statusChangeDates.acquisitionDate = new Date(acquisitionDate);
                }

                var dispositionDate = angular.copy($scope.currentProperty.dispositionDate);
                if (angular.isDefined(dispositionDate) && dispositionDate != null) {
                    $scope.statusChangeDates.dispositionDate = new Date(dispositionDate);
                }

                var deactivationDate = angular.copy($scope.currentProperty.deactivationDate);
                if (angular.isDefined(deactivationDate) && activationDate != null) {
                    $scope.statusChangeDates.deactivationDate = new Date(deactivationDate);
                }
            };

            $scope.setStatusToMark = function(statusToMark) {
                $scope.statusToMark = statusToMark;
                $scope.setStatusChangeDates();
            };

            $scope.executeChangePropertyStatus = function() {
                if ($scope.changePropertyStatusForm.$valid) {
                    if ($scope.statusToMark === $scope.propertyStatusEnums.ACTIVE) {
                        $scope.markAsActive();
                    } else {
                        if ($scope.statusToMark === $scope.propertyStatusEnums.INACTIVE) {
                            $scope.markAsInactive();
                        }
                    }
                } else {
                    $scope.addAlert('There was a problem changing the property status: one or more of the dates are invalid!', 'danger', 10000);
                }
            };


            var extractStatusChangeDatesForm = function() {
                return {
                    activation: $scope.statusChangeDates.activationDate,
                    acquisition: $scope.statusChangeDates.acquisitionDate,
                    disposition: $scope.statusChangeDates.dispositionDate,
                    deactivation: $scope.statusChangeDates.deactivationDate
                };
            };

            $scope.markAsActive = function() {
                var formData = extractStatusChangeDatesForm();
                $scope.callChangePropertyStatusService(formData, angular.copy($scope.propertyStatusEnums.ACTIVE));
            };

            $scope.markAsInactive = function() {
                var formData = extractStatusChangeDatesForm();
                $scope.callChangePropertyStatusService(formData, angular.copy($scope.propertyStatusEnums.INACTIVE));
            };

            $scope.markAsDeleted = function() {
                $scope.callChangePropertyStatusService(undefined, angular.copy($scope.propertyStatusEnums.DELETED));
            };

            $scope.callChangePropertyStatusService = function(formData, propertyStatus) {
                var param = {};

                if (angular.isDefined(formData)) {

                    // Check if any of the dates are moment objects, if they are convert to Date object as $.param doens't play nice with moment objects
                    angular.forEach(formData, function (value, key) {
                        if (moment.isMoment(value)) {
                            formData[key] = value.toDate();
                        }
                    });

                    param = $.param(formData)
                }

                if (angular.isDefined(propertyStatus)) {
                    $http({
                        method: 'PUT',
                        url: contextPath + '/webapi/properties/' + $scope.currentProperty.propertyNumber + '/changeStatus/' + propertyStatus,
                        data: param,  // pass in data as strings
                        headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
                    }).success(function (data, status, headers, config) {
                        SelectedProperty.setSelectedProperty(data);
                        $scope.currentProperty = SelectedProperty.getSelectedProperty();

                    }).error(function (data, status, headers, config) {
                        $scope.addAlert("There was a problem marking the property status to '" + propertyStatus + "'.", "danger", 10000);
                    });
                }

            };

            $scope.refreshPropertyInfo = function () {
                $scope.currentProperty = SelectedProperty.getSelectedProperty();
                return PropertyLookup.get({propertyNumber: $scope.currentProperty.propertyNumber}, function (value, responseHeaders) {
                    // On Success
                    $scope.currentProperty = value;
                    $scope.loadPropertyEmissionFactors();

                }, function (httpResponse) {
                    // On Error
                    //console.log('Error');
                    //console.log(httpResponse);
                }).$promise;
            };

            $scope.initializeBlankPropertyEmissionFactors = function () {
                $scope.electricityFactor = angular.copy(emissionFactorTemplate);
                $scope.naturalGasFactor = angular.copy(emissionFactorTemplate);
                $scope.domesticWaterFactor = angular.copy(emissionFactorTemplate);
                $scope.steamFactor = angular.copy(emissionFactorTemplate);
                $scope.chilledWaterFactor = angular.copy(emissionFactorTemplate);
            };

            $scope.getAssetInvestmentGroup = function() {
                if (angular.isDefined($scope.currentProperty.assetInvestmentGroupList) && $scope.currentProperty.assetInvestmentGroupList.length > 0) {
                    var assetInvestmentGroup = $scope.currentProperty.assetInvestmentGroupList[$scope.firstAssetInvestmentGroupIndex];
                    return assetInvestmentGroup.businessContact.name;
                }

                return "";
            };

            $scope.loadPropertyEmissionFactors = function () {
                $scope.initializeBlankPropertyEmissionFactors();

                PropertyLookup.getEmissionFactors({propertyNumber: $scope.currentProperty.propertyNumber}, function (value, responseHeaders) {
                    // On Success
                    $scope.propertyEmissionFactors = value;
                    if ($scope.propertyEmissionFactors) {
                        for (var x = 0; x < $scope.propertyEmissionFactors.length; x++) {
                            if ($scope.propertyEmissionFactors[x].emissionSource == EMISSION_FACTOR_ELECTRICITY_TYPE) {
                                $scope.electricityFactor = $scope.propertyEmissionFactors[x];

                            } else {
                                if ($scope.propertyEmissionFactors[x].emissionSource == EMISSION_FACTOR_CHILLED_WATER_TYPE) {
                                    $scope.chilledWaterFactor = $scope.propertyEmissionFactors[x];

                                } else {
                                    if ($scope.propertyEmissionFactors[x].emissionSource == EMISSION_FACTOR_NATURAL_GAS_TYPE) {
                                        $scope.naturalGasFactor = $scope.propertyEmissionFactors[x];

                                    } else {
                                        if ($scope.propertyEmissionFactors[x].emissionSource == EMISSION_FACTOR_STEAM_TYPE) {
                                            $scope.steamFactor = $scope.propertyEmissionFactors[x];

                                        } else {
                                            if ($scope.propertyEmissionFactors[x].emissionSource == EMISSION_FACTOR_DOMESTIC_WATER_TYPE) {
                                                $scope.domesticWaterFactor = $scope.propertyEmissionFactors[x];

                                            } else {
                                                if ($scope.propertyEmissionFactors[x].emissionSource == EMISSION_FACTOR_HEATING_OIL) {
                                                    $scope.heatingOilFactor = $scope.propertyEmissionFactors[x];

                                                } else {
                                                    if ($scope.propertyEmissionFactors[x].emissionSource == EMISSION_FACTOR_DIESEL) {
                                                        $scope.dieselFactor = $scope.propertyEmissionFactors[x];

                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                }, function (httpResponse) {
                    // On Error
                    $scope.addAlert("There was a problem initializing property emission factors.", "danger", 10000);
                });
            };

            $scope.clearElectricityFactor = function () {
                $scope.electricityFactor = angular.copy(emissionFactorTemplate);
            };

            $scope.clearNaturalGasFactor = function () {
                $scope.naturalGasFactor = angular.copy(emissionFactorTemplate);
            };

            $scope.clearDomesticWaterFactor = function () {
                $scope.domesticWaterFactor = angular.copy(emissionFactorTemplate);
            };

            $scope.clearSteamFactor = function () {
                $scope.steamFactor = angular.copy(emissionFactorTemplate);
            };

            $scope.clearChilledWaterFactor = function () {
                $scope.chilledWaterFactor = angular.copy(emissionFactorTemplate);
            };

            $scope.clearHeatingOilFactor = function () {
                $scope.heatingOilFactor = angular.copy(emissionFactorTemplate);
            };

            $scope.clearDieselFactor = function () {
                $scope.dieselFactor = angular.copy(emissionFactorTemplate);
            };

            $scope.assignElectricityFactor = function () {
                $scope.openEmissionFactorAssignmentModal(EMISSION_FACTOR_ELECTRICITY_TYPE, $scope.electricityFactor.id);
            };

            $scope.assignNaturalGasFactor = function () {
                $scope.openEmissionFactorAssignmentModal(EMISSION_FACTOR_NATURAL_GAS_TYPE, $scope.naturalGasFactor.id);
            };

            $scope.assignDomesticWaterFactor = function () {
                $scope.openEmissionFactorAssignmentModal(EMISSION_FACTOR_DOMESTIC_WATER_TYPE, $scope.domesticWaterFactor.id);
            };

            $scope.assignSteamFactor = function () {
                $scope.openEmissionFactorAssignmentModal(EMISSION_FACTOR_STEAM_TYPE, $scope.steamFactor.id);
            };

            $scope.assignChilledWaterFactor = function () {
                $scope.openEmissionFactorAssignmentModal(EMISSION_FACTOR_CHILLED_WATER_TYPE, $scope.chilledWaterFactor.id);
            };

            $scope.assignHeatingOilFactor = function () {
                $scope.openEmissionFactorAssignmentModal(EMISSION_FACTOR_HEATING_OIL, $scope.heatingOilFactor.id);
            };

            $scope.assignDieselFactor = function () {
                $scope.openEmissionFactorAssignmentModal(EMISSION_FACTOR_DIESEL, $scope.dieselFactor.id);
            };

            if ($scope.currentProperty) {
                buildings = $scope.currentProperty.buildingList;
                regions = $scope.currentProperty.regionList;
            } else {
                $location.url('/');
            }

            $scope.selectedBuildingOrRegion = null;
            $scope.selectedFloorOrArea = null;
            $scope.selectedRoom = null;

            $scope.buildingModel = null;
            $scope.regionModel = null;
            $scope.floorModel = null;
            $scope.areaModel = null;
            $scope.roomModel = null;

            $scope.isEnteringComponentData = false;

            $scope.loadBuildingsAndRegions = function () {
                // Use a blank order to force these to the top of the list
                $scope.currentBuildingsOrRegions = [{name: "Property", id: -1, finalBuildingNumber: "", order: ""}];

                if (buildings) {
                    for (var x = 0; x < buildings.length; x++) {
                        if (buildings[x].buildingNumber) {
                            var finalBuildingNumber = buildings[x].buildingNumber + ":";
                            var building = buildings[x];
                            building["finalBuildingNumber"] = finalBuildingNumber;
                            buildings[x] = building;
                        }
                    }
                    $scope.currentBuildingsOrRegions = $scope.currentBuildingsOrRegions.concat(buildings);
                }

                if (regions) {
                    $scope.currentBuildingsOrRegions = $scope.currentBuildingsOrRegions.concat(regions);
                }

                if (!$scope.selectedBuildingOrRegion) {
                    $scope.selectedBuildingOrRegion = {};
                    $scope.selectedBuildingOrRegion = $scope.currentBuildingsOrRegions[0];
                    $scope.currentComponent = $scope.currentProperty;
                } else {
                    for (var x = 0; x < $scope.currentBuildingsOrRegions.length; x++) {
                        if ($scope.currentBuildingsOrRegions[x].id == $scope.selectedBuildingOrRegion.id && $scope.currentBuildingsOrRegions[x].name == $scope.selectedBuildingOrRegion.name) {
                            $scope.selectedBuildingOrRegion = $scope.currentBuildingsOrRegions[x];
                            if (( $scope.selectedFloorOrArea.name == nothingSelected || !$scope.selectedFloorOrArea ) &&
                                ( $scope.selectedBuildingOrRegion.name != "Property" )) {
                                $scope.currentComponent = $scope.currentBuildingsOrRegions[x];
                            } else {
                                if ($scope.selectedBuildingOrRegion.name == "Property") {
                                    $scope.currentComponent = $scope.currentProperty;
                                }
                            }
                            break;
                        }
                    }
                }
            };


            $scope.loadFloorsAndAreas = function () {
                // Use a blank order to force these to the top of the list
                $scope.currentFloorsOrAreas = [{name: nothingSelected, id: -1, order: ""}];

                if ($scope.selectedBuildingOrRegion.floorList) {
                    $scope.currentFloorsOrAreas = $scope.currentFloorsOrAreas.concat($scope.selectedBuildingOrRegion.floorList);
                }

                if ($scope.selectedBuildingOrRegion.areaList) {
                    $scope.currentFloorsOrAreas = $scope.currentFloorsOrAreas.concat($scope.selectedBuildingOrRegion.areaList);
                }

                if (!$scope.selectedFloorOrArea) {
                    $scope.selectedFloorOrArea = {};
                    $scope.selectedFloorOrArea = $scope.currentFloorsOrAreas[0];
                    if ($scope.selectedBuildingOrRegion.name == "Property") {
                        $scope.currentComponent = $scope.currentProperty;
                    }

                } else {
                    for (var x = 0; x < $scope.currentFloorsOrAreas.length; x++) {
                        if ($scope.currentFloorsOrAreas[x].id == $scope.selectedFloorOrArea.id && $scope.currentFloorsOrAreas[x].name == $scope.selectedFloorOrArea.name) {

                            $scope.selectedFloorOrArea = $scope.currentFloorsOrAreas[x];

                            if (( $scope.selectedRoom.name == nothingSelected ) &&
                                ( $scope.selectedFloorOrArea.name != nothingSelected )) {
                                $scope.currentComponent = $scope.currentFloorsOrAreas[x];
                            } else {
                                if ($scope.selectedBuildingOrRegion.name != "Property") {
                                    $scope.currentComponent = $scope.selectedBuildingOrRegion;
                                } else {
                                    $scope.currentComponent = $scope.currentProperty;
                                }
                            }
                            break;
                        }
                    }
                }
            };


            $scope.loadRooms = function () {
                // Use a blank order to force these to the top of the list
                $scope.currentRooms = [{name: nothingSelected, id: -1, finalTenantName: "", order: ""}];

                if ($scope.selectedFloorOrArea.name != nothingSelected) {
                    $scope.currentComponent = $scope.selectedFloorOrArea;
                    if ($scope.selectedFloorOrArea.roomList) {
                        var roomList = $scope.selectedFloorOrArea.roomList;
                        for (var i = 0; i < roomList.length; i++) {
                            if (roomList[i].tenant) {
                                var finalTenantName = ":" + roomList[i].tenant;
                                var room = roomList[i];
                                room["finalTenantName"] = finalTenantName;
                                roomList[i] = room;
                            }
                        }
                        $scope.currentRooms = $scope.currentRooms.concat(roomList);
                    }
                }

                if (!$scope.selectedRoom) {
                    $scope.selectedRoom = {};
                    $scope.selectedRoom = $scope.currentRooms[0];
                    if ($scope.selectedFloorOrArea.name == nothingSelected) {
                        if ($scope.selectedBuildingOrRegion.name == "Property") {
                            $scope.currentComponent = $scope.currentProperty;
                        }
                    } else {
                        $scope.currentComponent = $scope.selectedFloorOrArea;
                    }
                } else {
                    for (var x = 0; x < $scope.currentRooms.length; x++) {
                        if ($scope.currentRooms[x].id == $scope.selectedRoom.id && $scope.currentRooms[x].name == $scope.selectedRoom.name) {
                            $scope.selectedRoom = $scope.currentRooms[x];
                            if ($scope.selectedRoom.name != nothingSelected) {
                                $scope.currentComponent = $scope.currentRooms[x];
                            }
                            break;
                        }
                    }
                }
            };

            $scope.refreshRecordsInfo = function () {
                if ($scope.currentProperty) {
                    buildings = $scope.currentProperty.buildingList;
                    regions = $scope.currentProperty.regionList;
                } else {
                    $location.url = contextPath + '/app';
                }

                $scope.loadBuildingsAndRegions();
                $scope.loadFloorsAndAreas();
                $scope.loadRooms();
            };


            $scope.changeSelectedBuildingsOrRegions = function (selectedBuildingOrRegion) {
                $scope.selectedBuildingOrRegion = selectedBuildingOrRegion;
                $scope.showRoomInformation = false;

                // Use a blank order to force these to the top of the list
                $scope.currentFloorsOrAreas = [{name: nothingSelected, id: -1, order: ""}];

                if (selectedBuildingOrRegion.name == "Property") {
                    $scope.currentComponent = $scope.currentProperty;
                    $scope.showFloorsAndAreas = false;
                    $scope.showRooms = false;

                } else {
                    $scope.currentComponent = selectedBuildingOrRegion;
                    if (selectedBuildingOrRegion.floorList) {
                        if (selectedBuildingOrRegion.floorList.length != 0) {
                            $scope.showFloorsAndAreas = true;
                            $scope.showRooms = false;
                            $scope.currentFloorsOrAreas = $scope.currentFloorsOrAreas.concat(selectedBuildingOrRegion.floorList);
                        } else {
                            $scope.showFloorsAndAreas = true;
                            $scope.showRooms = false;
                        }
                    }

                    if (selectedBuildingOrRegion.areaList) {
                        if (selectedBuildingOrRegion.areaList.length != 0) {
                            $scope.showFloorsAndAreas = true;
                            $scope.showRooms = false;
                            $scope.currentFloorsOrAreas = $scope.currentFloorsOrAreas.concat(selectedBuildingOrRegion.areaList);
                        } else {
                            $scope.showFloorsAndAreas = true;
                            $scope.showRooms = false;
                        }
                    }
                }
                $scope.selectedFloorOrArea = $scope.currentFloorsOrAreas[0];
                // $scope.identifyCurrentComponentType( $scope.currentComponent );
                ControllerInfoPasser.broadcast('event:buildingChange');
            };


            $scope.changeSelectedFloorsOrAreas = function (selectedFloorOrArea) {
                // Use a blank order to force these to the top of the list
                $scope.selectedFloorOrArea = selectedFloorOrArea;
                $scope.showRoomInformation = false;

                $scope.currentRooms = [{name: nothingSelected, id: -1, finalTenantName: "", order: ""}];

                if (selectedFloorOrArea.name == nothingSelected) {
                    if ($scope.selectedBuildingOrRegion.name == "Property") {
                        $scope.currentComponent = $scope.currentProperty;
                    }

                    $scope.showRooms = false;

                } else {
                    $scope.currentComponent = selectedFloorOrArea;
                    if (selectedFloorOrArea.roomList) {
                        if (selectedFloorOrArea.roomList.length != 0) {
                            var roomList = selectedFloorOrArea.roomList;
                            for (var i = 0; i < roomList.length; i++) {
                                if (roomList[i].tenant) {
                                    var finalTenantName = ":" + roomList[i].tenant;
                                    var room = roomList[i];
                                    room["finalTenantName"] = finalTenantName;
                                    roomList[i] = room;
                                }
                            }
                            $scope.currentRooms = $scope.currentRooms.concat(roomList);
                        }
                        $scope.showRooms = true;
                    }
                }
                $scope.selectedRoom = $scope.currentRooms[0];
                // $scope.identifyCurrentComponentType( $scope.currentComponent );
                ControllerInfoPasser.broadcast('event:floorChange');
            };

            $scope.showRoomInformation = false;
            $scope.changeSelectedRooms = function (selectedRoom) {

                $scope.selectedRoom = selectedRoom;

                if (selectedRoom.name == nothingSelected) {
                    $scope.currentComponent = $scope.selectedFloorOrArea;
                } else {
                    $scope.currentComponent = selectedRoom;
                    $scope.showRoomInformation = true;
                }
                // $scope.identifyCurrentComponentType( $scope.currentComponent );
                ControllerInfoPasser.broadcast('event:roomChange');
            };

            $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, category) {
                $scope.currentComponent = SelectedProperty.getSelectedProperty();
                if ($scope.hasPropertyDetailsTransaction) {
                    $scope.hasPropertyDetailsTransaction = false;
                } else {
                    $q.all([
                        $scope.refreshPropertyInfo()

                    ]).then(function (result) {
                        $scope.refreshRecordsInfo();
                        $scope.changeSelectedBuildingsOrRegions($scope.currentBuildingsOrRegions[0]);
                        $rootScope.$broadcast('event:currentComponentChanged', "");
                    }, function (rejection) {
                        // error
                    });
                }
            });

            $scope.getFilteredChildComponents = function (childComponentArray) {
                if (childComponentArray) {
                    for (var x = 0; x < childComponentArray.length; x++) {
                        if (childComponentArray[x].id < 0) {
                            childComponentArray.splice(x, 1);
                        }
                    }
                    return childComponentArray;
                }

                return [];
            };

            var persistingFinishedCallback = function () {
                $scope.clearAllAlertsInPage();
                $scope.addAlert("Successfully saved information.", "success", 10000);
                $scope.isEnteringComponentData = false;
                $scope.clearModels();
                $q.all([
                    $scope.refreshPropertyInfo()

                ]).then(function (result) {
                    $scope.refreshRecordsInfo();
                    $scope.hasPropertyDetailsTransaction = true;
                    SelectedProperty.setSelectedProperty($scope.currentProperty);

                }, function (rejection) {
                    // error
                    $scope.addAlert("There was a problem in reloading the property information.", "danger", 10000);
                });
            };

            $scope.createNewBuilding = function () {
                PropertyComponentService.createBuilding({}, function (value, responseHeaders) {
                    // On Success
                    $scope.isEnteringComponentData = true;
                    $scope.buildingModel = value;

                    // Default address to the same the property
                    $scope.buildingModel.address = $scope.currentProperty.address;
                    $scope.buildingModel.city = $scope.currentProperty.city;
                    $scope.buildingModel.province = $scope.currentProperty.province;
                    $scope.buildingModel.postalCode = $scope.currentProperty.postalCode;
                    $scope.buildingModel.country = $scope.currentProperty.country;

                }, function (httpResponse) {
                    // On Error
                    $scope.addAlert("There was a problem initializing new building form.", "danger", 10000);
                });
            };

            $scope.createNewFloor = function () {
                PropertyComponentService.createFloor({}, function (value, responseHeaders) {
                    // On Success
                    $scope.isEnteringComponentData = true;
                    $scope.floorModel = value;

                }, function (httpResponse) {
                    // On Error
                    $scope.addAlert("There was a problem initializing new floor form.", "danger", 10000);
                });
            };

            $scope.createNewRoom = function () {
                PropertyComponentService.createRoom({}, function (value, responseHeaders) {
                    // On Success
                    $scope.isEnteringComponentData = true;
                    $scope.roomModel = value;

                }, function (httpResponse) {
                    // On Error
                    $scope.addAlert("There was a problem initializing new room form.", "danger", 10000);
                });
            };

            $scope.showInvalidInputWarning = function () {
                $scope.addAlert('Invalid input. Please check the form fields', 'warning', 10000);
            };

            $scope.populatePropertyEmissionFactorsForPersisting = function () {
                $scope.emissionFactorIds = [];
                if ($scope.electricityFactor.id) {
                    $scope.emissionFactorIds.push($scope.electricityFactor.id);
                }

                if ($scope.naturalGasFactor.id) {
                    $scope.emissionFactorIds.push($scope.naturalGasFactor.id);
                }

                if ($scope.domesticWaterFactor.id) {
                    $scope.emissionFactorIds.push($scope.domesticWaterFactor.id);
                }

                if ($scope.steamFactor.id) {
                    $scope.emissionFactorIds.push($scope.steamFactor.id);
                }

                if ($scope.chilledWaterFactor.id) {
                    $scope.emissionFactorIds.push($scope.chilledWaterFactor.id);
                }

                if ($scope.heatingOilFactor.id) {
                    $scope.emissionFactorIds.push($scope.heatingOilFactor.id);
                }

                if ($scope.dieselFactor.id) {
                    $scope.emissionFactorIds.push($scope.dieselFactor.id);
                }

            };

            $scope.saveEmissionFactorsAssignments = function () {
                $scope.populatePropertyEmissionFactorsForPersisting();
                if (angular.isArray($scope.emissionFactorIds)) {
                    PropertyLookup.setEmissionFactors(
                        {propertyNumber: $scope.currentProperty.propertyNumber},
                        $scope.emissionFactorIds,
                        persistingFinishedCallback,
                        function (httpResponse) {
                            // On Error
                            switch (httpResponse.status) {
                                case 405:
                                    $scope.showInvalidInputWarning();
                                    break;
                                default:
                                    $scope.addAlert('There was an error updating emission factors assignments!', 'danger', 10000);
                                    break;
                            }
                        }
                    );
                }

            };

            var setAssetInvestmentGroup = function() {
                if (angular.isDefined($scope.propertyModel) && angular.isDefined($scope.propertyModel.assetInvestmentGroup)) {
                    $scope.propertyModel.assetInvestmentGroupList.length = 0;

                    var businessContact = {
                        name: $scope.propertyModel.assetInvestmentGroup
                    };

                    var propertyAssetInvestmentGroup = {
                        businessContact: businessContact
                    };

                    $scope.propertyModel.assetInvestmentGroupList.push(propertyAssetInvestmentGroup);
                }
            };

            $scope.saveProperty = function () {
                if ($scope.propertyDetailsForms.propertyForm.$valid) {
                    setAssetInvestmentGroup();
                    if ($scope.propertyModel.id) {
                        PropertyLookup.update(
                            {propertyNumber: $scope.propertyModel.propertyNumber},
                            $scope.propertyModel,
                            persistingFinishedCallback,
                            function (httpResponse) {
                                // On Error
                                switch (httpResponse.status) {
                                    case 405:
                                        $scope.showInvalidInputWarning();
                                        break;
                                    default:
                                        $scope.addAlert('There was an error updating the property!', 'danger', 10000);
                                        break;
                                }
                            }
                        );

                    } else {
                        // add property
                        PropertyLookup.add(
                            {},
                            $scope.propertyModel,
                            persistingFinishedCallback,
                            function (httpResponse) {
                                // On Error
                                switch (httpResponse.status) {
                                    case 405:
                                        $scope.showInvalidInputWarning();
                                        break;
                                    default:
                                        $scope.addAlert('There was an error adding the property!', 'danger', 10000);
                                        break;
                                }
                            }
                        );
                    }
                } else {
                    $scope.showInvalidInputWarning();
                }

            };

            $scope.saveBuilding = function () {
                if ($scope.propertyDetailsForms.buildingForm.$valid) {
                    if ($scope.buildingModel.id) {
                        // update building
                        PropertyComponentService.updateBuilding(
                            {propertyId: $scope.currentProperty.id},
                            $scope.buildingModel,
                            persistingFinishedCallback,
                            function (httpResponse) {
                                // On Error
                                switch (httpResponse.status) {
                                    case 405:
                                        $scope.showInvalidInputWarning();
                                        break;
                                    default:
                                        $scope.addAlert('There was an error updating the building!', 'danger', 10000);
                                        break;
                                }
                            }
                        );

                    } else {
                        // add building
                        PropertyComponentService.addBuilding(
                            {propertyId: $scope.currentProperty.id},
                            $scope.buildingModel,
                            persistingFinishedCallback,
                            function (httpResponse) {
                                // On Error
                                switch (httpResponse.status) {
                                    case 405:
                                        $scope.showInvalidInputWarning();
                                        break;
                                    default:
                                        $scope.addAlert('There was an error adding the building!', 'danger', 10000);
                                        break;
                                }
                            }
                        );
                    }
                } else {
                    $scope.showInvalidInputWarning();
                }
            };

            $scope.clearModels = function () {
                $scope.propertyModel = null;
                $scope.buildingModel = null;
                $scope.floorModel = null;
                $scope.roomModel = null;
                $scope.regionModel = null;
                $scope.areaModel = null;

                $scope.isEditingEmissionFactors = false;
                $scope.loadPropertyEmissionFactors();
            };

            $scope.saveFloor = function () {
                if ($scope.propertyDetailsForms.floorForm.$valid) {
                    if ($scope.floorModel.id) {
                        // Update Floor
                        PropertyComponentService.updateFloor(
                            {buildingId: $scope.selectedBuildingOrRegion.id},
                            $scope.floorModel,
                            persistingFinishedCallback,
                            function (httpResponse) {
                                // On Error
                                switch (httpResponse.status) {
                                    case 405:
                                        $scope.showInvalidInputWarning();
                                        break;
                                    default:
                                        $scope.addAlert('There was an error updating the floor!', 'danger', 10000);
                                        break;
                                }
                            }
                        );

                    } else {
                        // Add Floor
                        PropertyComponentService.addFloor(
                            {buildingId: $scope.selectedBuildingOrRegion.id},
                            $scope.floorModel,
                            persistingFinishedCallback,
                            function (httpResponse) {
                                // On Error
                                switch (httpResponse.status) {
                                    case 405:
                                        $scope.showInvalidInputWarning();
                                        break;
                                    default:
                                        $scope.addAlert('There was an error adding the floor!', 'danger', 10000);
                                        break;
                                }
                            }
                        );
                    }
                } else {
                    $scope.showInvalidInputWarning();
                }

            };

            $scope.saveRoom = function () {
                if ($scope.propertyDetailsForms.roomForm.$valid) {
                    if ($scope.roomModel.id) {
                        // Update Floor
                        PropertyComponentService.updateRoom(
                            {floorId: $scope.selectedFloorOrArea.id},
                            $scope.roomModel,
                            persistingFinishedCallback,
                            function (httpResponse) {
                                // On Error
                                switch (httpResponse.status) {
                                    case 405:
                                        $scope.showInvalidInputWarning();
                                        break;
                                    default:
                                        $scope.addAlert('There was an error updating the room!', 'danger', 10000);
                                        break;
                                }
                            }
                        );

                    } else {
                        // Add Floor
                        PropertyComponentService.addRoom(
                            {floorId: $scope.selectedFloorOrArea.id},
                            $scope.roomModel,
                            persistingFinishedCallback,
                            function (httpResponse) {
                                // On Error
                                switch (httpResponse.status) {
                                    case 405:
                                        $scope.showInvalidInputWarning();
                                        break;
                                    default:
                                        $scope.addAlert('There was an error adding the room!', 'danger', 10000);
                                        break;
                                }
                            }
                        );
                    }
                } else {
                    $scope.showInvalidInputWarning();
                }
            };

            $scope.isEditingEmissionFactors = false;

            $scope.editEmissionFactorAssignments = function () {
                $scope.isEnteringComponentData = true;
                $scope.isEditingEmissionFactors = true;
            };

            $scope.editProperty = function () {
                $scope.clearAllAlertsInPage();
                $scope.isEnteringComponentData = true;
                $scope.propertyModel = $scope.currentProperty;
                $scope.propertyModel['assetInvestmentGroup'] = $scope.getAssetInvestmentGroup();
            };

            $scope.editBuilding = function () {
                $scope.clearAllAlertsInPage();
                $scope.isEnteringComponentData = true;
                $scope.buildingModel = $scope.selectedBuildingOrRegion;
            };

            $scope.deleteBuilding = function () {
                if ($scope.selectedBuildingOrRegion) {
                    // delete building
                    PropertyComponentService.deleteBuilding({buildingId: $scope.selectedBuildingOrRegion.id}, function (value, responseHeaders) {
                        // On Success
                        $scope.addAlert('Successfully deleted building', 'success', 10000);
                        $scope.isEnteringComponentData = false;
                        $q.all([
                            $scope.refreshPropertyInfo()

                        ]).then(function (result) {
                            $scope.refreshRecordsInfo();
                            $scope.hasPropertyDetailsTransaction = true;
                            SelectedProperty.setSelectedProperty($scope.currentProperty);
                            $scope.changeSelectedBuildingsOrRegions($scope.currentBuildingsOrRegions[0]);

                        }, function (rejection) {
                            // error
                        });


                    }, function (httpResponse) {
                        $scope.addAlert('Failed to delete building: an error occurred when trying to delete the selected building.', 'danger', 10000);
                    });

                }
            };

            $scope.editFloor = function () {
                $scope.clearAllAlertsInPage();
                $scope.isEnteringComponentData = true;
                $scope.floorModel = $scope.selectedFloorOrArea;
            };

            $scope.deleteFloor = function () {
                if ($scope.selectedFloorOrArea) {
                    // delete floor
                    PropertyComponentService.deleteFloor({floorId: $scope.selectedFloorOrArea.id}, function (value, responseHeaders) {
                        // On Success
                        $scope.addAlert('Successfully deleted floor', 'success', 10000);
                        $scope.isEnteringComponentData = false;
                        $q.all([
                            $scope.refreshPropertyInfo()

                        ]).then(function (result) {
                            $scope.refreshRecordsInfo();
                            $scope.hasPropertyDetailsTransaction = true;
                            SelectedProperty.setSelectedProperty($scope.currentProperty);
                            $scope.changeSelectedBuildingsOrRegions($scope.selectedBuildingOrRegion);

                        }, function (rejection) {
                            // error
                        });


                    }, function (httpResponse) {
                        $scope.addAlert('Failed to delete floor: an error occurred when trying to delete the selected floor.', 'danger', 10000);
                    });
                }
            };

            $scope.editArea = function () {
                $scope.clearAllAlertsInPage();
                $scope.isEnteringComponentData = true;
                $scope.areaModel = $scope.selectedFloorOrArea;
            };

            $scope.deleteArea = function () {
                $scope.clearAllAlertsInPage();
                // delete area processes
            };

            $scope.editRegion = function () {
                $scope.clearAllAlertsInPage();
                $scope.isEnteringComponentData = true;
                $scope.regionModel = $scope.selectedBuildingOrRegion;
            };

            $scope.deleteRegion = function () {
                // To delete region
            };

            $scope.editRoom = function () {
                $scope.clearAllAlertsInPage();
                $scope.isEnteringComponentData = true;
                $scope.roomModel = $scope.selectedRoom;
            };

            $scope.deleteRoom = function () {
                if ($scope.selectedRoom) {
                    // delete floor
                    PropertyComponentService.deleteRoom({roomId: $scope.selectedRoom.id}, function (value, responseHeaders) {
                        // On Success
                        $scope.addAlert('Successfully deleted room', 'success', 10000);
                        $scope.isEnteringComponentData = false;
                        $q.all([
                            $scope.refreshPropertyInfo()

                        ]).then(function (result) {
                            $scope.refreshRecordsInfo();
                            $scope.hasPropertyDetailsTransaction = true;
                            SelectedProperty.setSelectedProperty($scope.currentProperty);
                            $scope.changeSelectedFloorsOrAreas($scope.selectedFloorOrArea);

                        }, function (rejection) {
                            // error
                        });


                    }, function (httpResponse) {
                        $scope.addAlert('Failed to delete room: an error occurred when trying to delete the selected room.', 'danger', 10000);
                    });
                }
            };

            $scope.cancelInput = function () {
                $scope.clearAllAlertsInPage();
                $scope.clearModels();
                $scope.alerts.length = 0;
                $scope.isEnteringComponentData = false;
            };

            $scope.viewAssignedEmissionFactor = function (emissionFactor) {
                if (emissionFactor.id) {
                    // Show 'view emission factor modal'
                    ControllerInfoPasser.put("emissionFactorToView", emissionFactor);
                    var modalInstance = $modal.open({
                        templateUrl: 'viewEmissionFactorModal.html',
                        controller: 'EmissionFactorViewModalCtrl',
                        windowClass: 'preview-record-modal-window'
                    });

                    modalInstance.result.then(function (data) {
                        // Do nothing.
                    }, function () {
                        // $log.info('Modal dismissed at: ' + new Date());
                    });
                }
            };

            $scope.openEmissionFactorAssignmentModal = function (emissionFactorType, currentEmissionFactorId) {

                var modalInstance = $modal.open({
                    templateUrl: 'emissionFactorAssignmentModal.html',
                    controller: 'EmissionFactorAssignmentModalCtrl',
                    windowClass: 'preview-record-modal-window',
                    resolve: {
                        emissionFactorType: function () {
                            return emissionFactorType;
                        },
                        currentEmissionFactorId: function () {
                            return currentEmissionFactorId;
                        }

                    }
                });

                modalInstance.result.then(function (selectedEmissionFactor) {

                    if (selectedEmissionFactor.emissionSource == EMISSION_FACTOR_ELECTRICITY_TYPE) {
                        $scope.electricityFactor = selectedEmissionFactor;

                    } else {
                        if (selectedEmissionFactor.emissionSource == EMISSION_FACTOR_CHILLED_WATER_TYPE) {
                            $scope.chilledWaterFactor = selectedEmissionFactor;

                        } else {
                            if (selectedEmissionFactor.emissionSource == EMISSION_FACTOR_NATURAL_GAS_TYPE) {
                                $scope.naturalGasFactor = selectedEmissionFactor;

                            } else {
                                if (selectedEmissionFactor.emissionSource == EMISSION_FACTOR_STEAM_TYPE) {
                                    $scope.steamFactor = selectedEmissionFactor;

                                } else {
                                    if (selectedEmissionFactor.emissionSource == EMISSION_FACTOR_DOMESTIC_WATER_TYPE) {
                                        $scope.domesticWaterFactor = selectedEmissionFactor;

                                    } else {
                                        if (selectedEmissionFactor.emissionSource == EMISSION_FACTOR_HEATING_OIL) {
                                            $scope.heatingOilFactor = selectedEmissionFactor;

                                        } else {
                                            if (selectedEmissionFactor.emissionSource == EMISSION_FACTOR_DIESEL) {
                                                $scope.dieselFactor = selectedEmissionFactor;

                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                }, function () {
                    // $log.info('Modal dismissed at: ' + new Date());
                });

            };

            $scope.openMergeModal = function () {
                PropertyLookup.findAllAsDTO({}, function (properties, response) {
                    $scope.properties = angular.copy(properties);
                    $scope.propertyToMergeFrom.length = 0;
                });

                $("#mergePropertyModal").modal('show');
            };

            $scope.mergeProperties = function () {
                if ($scope.propertyToMergeFrom.length == 1 && angular.isDefined($scope.currentProperty)) {
                    var fromPropertyNumber = $scope.propertyToMergeFrom[0].propertyNumber;
                    var toPropertyNumber = $scope.currentProperty.propertyNumber;
                    $scope.merging = true;

                    PropertyLookup.mergeProperty({
                        fromProperty: fromPropertyNumber,
                        toProperty: toPropertyNumber
                    }, $scope.propertyMergeOptions, function () {
                        // Success
                        $scope.merging = false;
                        $("#mergePropertyConfirmationModal").modal('hide');
                        persistingFinishedCallback();
                        $scope.addAlert("Successfully merged property '" + $scope.propertyToMergeFrom[0].name + "' into property '" + $scope.currentProperty.name + "'", "success", 10000);
                    }, function (httpResponse) {
                        // Error
                        $scope.merging = false;
                        $scope.displayMessageInElement('#mergePropertyError', "An error has occurred merging property '" + $scope.propertyToMergeFrom[0].name + "' into property '" + $scope.currentProperty.name + "'");
                    })

                } else {
                    $scope.displayMessageInElement('#mergePropertyInfo', "Please select a property to merge data from", 10000);
                }
            };

            $http.get(contextPath + '/webapi/systemconfig/' + updateOwnerFieldAllowed).success(function (data, status, headers, config) {
                // False value means that the owner field is NOT set from the business contacts which means the property.owner field should be editable
                var setClientsAllowed = String(data).toLowerCase() === "false";

                if (setClientsAllowed) {
                    $scope.flatOwnerFieldDisabled = false;
                } else {
                    $scope.flatOwnerFieldDisabled = true;
                }
            }).error(function () {
                $scope.flatOwnerFieldDisabled = false;
            });

            $scope.refreshPropertyInfo();
            $scope.refreshRecordsInfo();
            $scope.initializePropertyDetailsSecurity();
        }])

    .controller('EmissionFactorAssignmentModalCtrl', ['$scope', '$http', '$uibModalInstance', 'emissionFactorType', 'currentEmissionFactorId', 'EmissionFactorService', 'ControllerInfoPasser', function ($scope, $http, $modalInstance, emissionFactorType, currentEmissionFactorId, EmissionFactorService, ControllerInfoPasser) {

        $scope.availableEmissionFactors = [];

        $scope.emissionFactorType = emissionFactorType;
        $scope.isPreviewingEmissionFactor = false;

        $scope.setAvailableEmissionFactors = function (emissionFactors) {
            $scope.availableEmissionFactors = emissionFactors;
        };

        $scope.loadEmissionFactors = function () {
            EmissionFactorService.findByEmissionSourceUtilityType({utilityType: emissionFactorType}, function (value, responseHeaders) {
                // On Success
                $scope.setAvailableEmissionFactors(value);

            }, function (httpResponse) {
                // On Error
                $scope.addAlert("There was a problem loading emission factors.", "danger", 10000);
            });
        };

        $scope.previewEmissionFactor = function (emissionFactor) {
            ControllerInfoPasser.put("emissionFactorToView", emissionFactor);
            $scope.isPreviewingEmissionFactor = true;
        };

        $scope.assignSelectedEmissionFactor = function (emissionFactor) {
            $modalInstance.close(emissionFactor);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.backToAvailableEmissionFactors = function () {
            ControllerInfoPasser.clear("emissionFactorToView");
            $scope.isPreviewingEmissionFactor = false;
        };

        $scope.loadEmissionFactors();

    }])

    .controller('EmissionFactorViewCtrl', ['$scope', '$http', 'ControllerInfoPasser', function ($scope, $http, ControllerInfoPasser) {

        $scope.emissionFactor = ControllerInfoPasser.get("emissionFactorToView");

    }])

    .controller('EmissionFactorViewModalCtrl', ['$scope', '$http', 'ControllerInfoPasser', '$uibModalInstance', function ($scope, $http, ControllerInfoPasser, $modalInstance) {
        $scope.cancel = function () {
            ControllerInfoPasser.clear("emissionFactorToView");
            $modalInstance.dismiss('cancel');
        };
    }]);
