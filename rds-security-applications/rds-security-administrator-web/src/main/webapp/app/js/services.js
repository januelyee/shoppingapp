/*
 *
 *  * Copyright (c) 2015. Refined Data Solutions. All Rights Reserved
 *
 */

'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', ['ngResource'])
    .value('version', '0.1')
    .constant('contextPath', '/riskapp')
    .factory('TimeoutInterceptor', ['$q', 'ControllerInfoPasser', '$window', '$location', 'contextPath', function ($q, ControllerInfoPasser, $window, $location, contextPath) {
        return {
            'responseError': function (rejection) {
                // do something on error from an HTTP Call
                if (rejection.status == 350) { // Custom HTTP Response from AuthenticationFilter
                    $window.location.href = contextPath + "/app/logon.html#" + $location.$$path + "?sessionExpired=true";
                }
                return $q.reject(rejection);
            }
        };
    }])
    .factory('StringToDateInterceptor', function () {
        var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(\.(\d{1,}))?(Z|([\-+])(\d{2}):(\d{2}))?)?)?)$/;

        var convertDateStringsToDateObjs = function (input) {
            // Ignore things that aren't objects.
            if (!angular.isObject(input)) {
                return input;
            }

            for (var key in input) {
                if (!input.hasOwnProperty(key)) {
                    continue;
                }

                var value = input[key];
                var match;
                // Check for string properties which look like dates.
                if (angular.isString(value) && (match = value.match(regexIso8601))) {
                    var milliseconds = Date.parse(match[0]);
                    if (!isNaN(milliseconds)) {
                        input[key] = new Date(milliseconds);
                    }
                } else {
                    if (angular.isObject(value)) {
                        // Recurse into object
                        convertDateStringsToDateObjs(value);
                    }
                }
            }
        };

        return {
            'response': function (responseData) {
                convertDateStringsToDateObjs(responseData.data);
                return responseData;
            }
        };
    })
    .factory('SysConfigService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + "/webapi/systemconfig/:key";
        return $resource(baseUrl, {}, {
            getMultipleKeys: {method: 'PUT', params: {key: "multipleKeys"}},
            setMultipleKeys: {method: 'POST', params: {key: "multipleKeys"}}
        });
    }])
    .factory('PropertyLookup', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/properties';
        return $resource(baseUrl + '/:propertyNumber/:keyword', {}, {
            query: {method: 'GET', isArray: true},
            get: {method: 'GET'},
            save: {method: 'POST', isArray: true},
            add: {method: 'POST'},
            update: {method: 'PUT'},
            setEmissionFactors: {method: 'PUT', params: {keyword: 'emissionFactors'}},
            getEmissionFactors: {method: 'GET', isArray: true, params: {keyword: 'emissionFactors'}},
            searchAll: {method: 'GET', isArray: true, params: {propertyNumber: 'all'}}, // :keyword passed in through method call
            advancedSearch: {method: 'POST', isArray: true, params: {propertyNumber: 'advancedsearch'}},
            findByPropertyNumbers: {method: 'PUT', isArray: true, params: {propertyNumber: 'findbynumbers'}},
            findPropertyTypes: {method: 'GET', isArray: true, params: {propertyNumber: 'types'}},
            findByPropertyType: {method: 'GET', isArray: true, params: {propertyNumber: 'types'}},
            findInPropertyType: {method: 'PUT', isArray: true, params: {propertyNumber: 'types'}},
            findPropertyUnits: {method: 'GET', isArray: true, params: {propertyNumber: 'units'}},
            findTenants: {method: 'GET', isArray: true},
            verifyAccess: {method: 'PUT', isArray: true, params: {propertyNumber: 'verify'}},
            findOwners: {method: 'GET', isArray: true, params: {keyword: 'businesscontacts'}},
            addOwner: {method: 'POST', isArray: true, params: {keyword: 'businesscontacts'}},
            removeOwner: {method: 'PUT', isArray: true, params: {keyword: 'businesscontacts'}},
            findAllActive: {method: 'GET', isArray: true, params: {keyword: 'active'}},
            mergeProperty: {method: 'POST', url: baseUrl + '/merge/:fromProperty/:toProperty'},
            findSimilarProperties: {method: 'GET', isArray: true, params: {keyword: 'similar'}},
            findAllAsDTO: {method: 'GET', isArray: true, params: {keyword: 'asDTO'}},
            findPropertyProfiles: {
                method: 'GET',
                isArray: true,
                url: baseUrl + '/propertyProfiles/:propertyNumber'
            },
            findByPropertyNumbersAsDTO: {method: 'PUT', isArray: true, params: {keyword: 'findByPropertyNumbersAsDTO'}}
        });
    }])
    .factory('UtilityService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/properties/:propertyNumber/:utility';
        return $resource(baseURL, {propertyNumber: '@propertyNumber', utility: '@utility'}, {
            save: {method: 'POST'},
            update: {method: 'PUT', url: baseURL + '/:id'},
            delete: {method: 'DELETE', url: baseURL + '/:id'},
            getAllByProperty: {method: 'GET', isArray: true},
            getAllByBuilding: {method: 'GET', isArray: true, url: baseURL + '/building/:buildingNumber'},
            getAllByBuildingNumbers: {method: 'PUT', isArray: true, url: baseURL + '/buildings'},
            getYearsForProperty: {method: 'PUT', url: baseURL + '/years'},
            getYearsForBuildings: {method: 'PUT', url: baseURL + '/buildings/years'},
            getAllByYearAndProperty: {method: 'GET', isArray: true, url: baseURL + '/year/:year'},
            getAllByYearAndBuilding: {
                method: 'GET',
                isArray: true,
                url: baseURL + '/building/:buildingNumber/year/:year'
            },
            getAllByYearAndBuildingNumbers: {method: 'PUT', isArray: true, url: baseURL + '/buildings/year/:year'},
            getDashboardGHGData: {
                method: 'PUT',
                url: baseURL + '/dashboardData/ghg/years/:fromYear/to/:toYear/months/:fromMonth/to/:toMonth',
                params: {propertyNumber: 0}
            },
            getDashboardEnergyData: {
                method: 'PUT',
                url: baseURL + '/dashboardData/energy/years/:fromYear/to/:toYear/months/:fromMonth/to/:toMonth',
                params: {propertyNumber: 0}
            },
            updateEnergySnapshotsForYear: {
                method: 'PUT',
                url: baseURL + '/updateSnapshots/:year',
                params: {propertyNumber: 0}
            },
            findMeterNumbersForPropertyAndYear: {method: 'GET', url: baseURL + '/meters/:year'},
            getChartDataForLandingPage: {method: 'PUT', url: baseURL + "/chartData/:period/:meterNumber"},
            getChartDataForLandingPageCompareMonth: {method: 'PUT', url: baseURL + "/chartData/ANNUAL/:meterNumber/compare/:month"},
            findInSnapshotsForMeterNumber: {method: 'GET', url: baseURL + '/insnapshot/:snapshotYear/:snapshotMonth/:meterNumber'},
            getIntervalDataForDay: {method: 'GET', url: baseURL + '/meter/:meterNumber/intervaldata/:date'}
        });
    }])
    .factory('SelectedCategory', ['$rootScope', function ($rootScope) {
        var selectedCategory;
        var allCategories = [];

        return {
            getSelectedCategory: function () {
                return angular.isDefined(selectedCategory) ? selectedCategory : allCategories[0];
            },
            setSelectedCategory: function (category) {
                selectedCategory = category;
                $rootScope.$broadcast('event:utilityCategoryChanged', selectedCategory);
            },
            setAllCategories: function (all) {
                allCategories = angular.copy(all);
            },
            getAllCategories: function () {
                return allCategories;
            }
        };

    }])
    .factory('SelectedProperty', ['$rootScope', function ($rootScope) {
        var selectedProperty;
        var buildingIds = [], floorIds = [], roomIds = [];
        var buildingsMap = {};
        var floorsMap = {};
        var roomsMap = {};

        var initializeImportantPropertyReferences = function () {
            buildingIds.length = 0;
            floorIds.length = 0;
            roomIds.length = 0;

            for (var i = 0; i < selectedProperty.buildingList.length; i++) {
                var building = selectedProperty.buildingList[i];
                buildingIds.push(building.id);
                buildingsMap[building.id] = building;

                for (var j = 0; j < building.floorList.length; j++) {
                    var floor = building.floorList[j];
                    floorIds.push(floor.id);
                    floorsMap[floor.id] = floor;

                    for (var k = 0; k < floor.roomList.length; k++) {
                        var room = floor.roomList[k];
                        roomIds.push(room.id);
                        roomsMap[room.id] = room;
                    }
                }
            }
        };

        return {
            getSelectedProperty: function () {
                return selectedProperty;
            },

            setSelectedProperty: function (property) {
                selectedProperty = property;
                initializeImportantPropertyReferences();
                $rootScope.$broadcast('event:propertyChanged', selectedProperty);
            },

            getBuildingIds: function () {
                return buildingIds;
            },

            getFloorIds: function () {
                return floorIds;
            },

            getRoomIds: function () {
                return roomIds;
            },

            getBuilding: function (buildingId) {
                return buildingsMap[buildingId];
            },

            getFloor: function (floorId) {
                return floorsMap[floorId];
            },

            getRoom: function (roomId) {
                return roomsMap[roomId];
            }

        }

    }])
    .factory('ControllerInfoPasser', ['$rootScope', function ($rootScope) {
        var informationToPass = [];

        return {
            get: function (key) {
                return informationToPass[key];
            },
            getAll: function () {
                return informationToPass;
            },
            put: function (key, value) {
                informationToPass[key] = value;
            },
            clearAll: function () {
                informationToPass = [];
            },
            clear: function (key) {
                informationToPass[key] = undefined;
            },
            broadcast: function (event, args) {
                $rootScope.$broadcast(event, args);
            }
        }

    }])
    .factory('LogonService', ['$resource', '$location', 'contextPath',
        function ($resource, $location, contextPath) {
            return $resource(contextPath + '/webapi/logon/:logonid/:pwd', {logonid: '@logonid', pwd: '@password'}, {
                currentUser: {method: 'GET', params: {logonid: 'getCurrentUser'}}
            });
        }])
    .factory('LogoutService', ['$resource', '$location', 'contextPath',
        function ($resource, $location, contextPath) {
            return $resource(contextPath + '/webapi/logoff');
        }])
    .factory('RoleService', ['$resource', 'contextPath',
        function ($resource, contextPath) {
            var baseUrl = contextPath + '/webapi/roles';
            return $resource(baseUrl + '/:rolename', {rolename: '@rolename'}, {
                query: {method: 'GET', isArray: true},
                save: {method: 'POST'},
                update: {method: 'PUT'},
                delete: {method: 'DELETE'},
                assignDashboard: {
                    method: 'PUT',
                    url: contextPath + '/webapi/roles/assign/:roleId/dashboard/:dashboardId'
                },
                pmRoles: {method: 'GET', isArray: true, url: baseUrl + '/like/propertyManager'},
                selectForInsurance: {method: 'PUT', url: baseUrl + '/selectForInsurance/:roleId'}
            });
        }])
    .factory('AdminService', ['$resource', '$location', 'contextPath', 'ControllerInfoPasser',
        function ($resource, $location, contextPath) {
            return $resource(contextPath + '/webapi/users/:username', {username: '@username'});
        }])
    .factory('UserService', ['$resource', 'contextPath',
        function ($resource, contextPath) {
            var baseUrl = contextPath + '/webapi/users/:username';
            return $resource(baseUrl, {}, {
                update: {method: 'PUT'},
                updateLastDashboardComponent: {method: 'PUT', url: baseUrl + "/lastDashboardComponent"},
                updateLastDashboardFilters: {
                    method: 'PUT',
                    url: baseUrl + "/lastDashboardFilter",
                    headers: {'Content-Type': 'text/plain'}
                },
                updateLastNamedDashboardFilters: {
                    method: 'PUT',
                    url: baseUrl + "/lastNamedDashboardFilter",
                    headers: {'Content-Type': 'text/plain'}
                },
                saveDashboardFilter: {method: 'POST', url: baseUrl + '/dashboardFilter', isArray: true},
                deleteDashboardFilter: {method: 'DELETE', url: baseUrl + '/dashboardFilter/:filterId', isArray: true},
                assignPropertyGroup: {method: 'PUT', url: baseUrl + '/propertygroups/:groupName'},
                unassignPropertyGroup: {method: 'DELETE', url: baseUrl + '/propertygroups/:groupName'}
            });
        }])
    .factory('ProfileService', ['$resource', 'contextPath',
        function ($resource, contextPath) {
            var baseUrl = contextPath + '/webapi/profiles';
            return $resource(baseUrl, {}, {
                query: {method: 'GET', isArray: true},
                lightQuery: {method: 'GET', url: baseUrl + '/lightweight', isArray: true},
                update: {method: 'PUT'},
                addUserProfile: {method: 'POST', url: baseUrl + '/adduserprofile'},
                addProfile: {method: 'POST', url: baseUrl + '/addprofile'},
                deleteUserProfile: {method: 'PUT', url: baseUrl + '/deleteuserprofile'},
                findByName: {method: 'GET', url: baseUrl + '/names/:name'},
                findByUserName: {method: 'GET', url: baseUrl + '/usernames/:username'},
                findAssignedUsers: {
                    method: 'GET',
                    isArray: true,
                    url: baseUrl + '/assignedUsers/:propertyNumber'
                },
                withUserProfile: {method: 'GET', url: baseUrl + '/withuserprofile', isArray: true},
                findById: {method: 'GET', url: baseUrl + '/:id'}
            });
        }])
    .factory('UnitConversionService', ['$resource', 'contextPath',
        function ($resource, contextPath) {
            var baseURL = contextPath + '/webapi/unitconversions';
            return $resource(baseURL, {}, {
                query: {method: 'GET', isArray: true},
                update: {method: 'PUT'},
                add: {method: 'POST'},
                delete: {method: 'DELETE', url: baseURL + "/:id"}
            });
        }])
    .factory('DataMappingService', ['$resource', 'contextPath', function ($resource, contextPath) {
            var baseURL = contextPath + '/webapi/datamapping';
            return $resource(baseURL, {}, {
                query: {method: 'GET', isArray: true},
                update: {method: 'PUT'},
                add: {method: 'POST'},
                delete: {method: 'DELETE', url: baseURL + "/:id"}
            });
        }])
    .factory('WeatherStationService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/sustainability/weather/station';
        return $resource(baseURL, {}, {
            query: {method: 'GET', isArray: true},
            update: {method: 'PUT'},
            add: {method: 'POST'},
            create: {method: 'GET', url: baseURL + "/create"},
            delete: {method: 'DELETE', url: baseURL + "/:id"},
            findById: {method: 'GET', url: baseURL + '/:id'},
            findByStationName: {method: 'GET', url: baseURL + '/name/:stationName'},
            findByStationNumber: {method: 'GET', url: baseURL + '/name/:stationNumber'},
            findByTransportationCanadaID: {method: 'GET', url: baseURL + '/tc/:tcID'},
            findByWorldMeteorologicalID: {method: 'GET', url: baseURL + '/wmo/:wmoID'},
            getAverageTempsMapForStationAndDateRange: {method: 'GET', url: baseURL + '/uuid/:stationUUID/:fromDate/:toDate/:unit', isArray: true}
        });
    }])
    .factory('WeatherDataService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/sustainability/weather/data';
        return $resource(baseURL, {}, {
            query: {method: 'GET', isArray: true},
            update: {method: 'PUT'},
            add: {method: 'POST', url: baseURL + "/:stationId"},
            create: {method: 'GET', url: baseURL + "/create/:stationId"},
            delete: {method: 'DELETE', url: baseURL + "/:id"},
            findByStation: {method: 'GET', url: baseURL + "/station/:stationId", isArray: true},
            findById: {method: 'GET', url: baseURL + '/:id'},
            findByWorldMeteorologicalID: {method: 'POST', url: baseURL + '/range/:stationId'},
            findByWeatherStationUUIDAndDateRange: {method: 'GET', url: baseURL + '/station/:stationUUID/:fromDate/:toDate', isArray: true},
            findByWeatherStationUUIDAndDate: {method: 'GET', url: baseURL + '/station/:stationUUID/:year/:month/:day', isArray: true}
        });
    }])
    .factory('BatchProcessService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/batchprocess';
        return $resource(baseURL, {}, {
            query: {method: 'GET', isArray: true},
            update: {method: 'PUT'},
            add: {method: 'POST'},
            create: {method: 'GET', url: baseURL + "/create"},
            delete: {method: 'DELETE', url: baseURL + "/:id"},
            findById: {method: 'GET', url: baseURL + '/:id'},
            runBatchProcess: {method: 'POST', url: baseURL + '/:id/run'}
        });
    }])
    .factory('BatchProcessLogService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/batchprocesslog';
        return $resource(baseURL, {}, {
            query: {method: 'GET', isArray: true},
            update: {method: 'PUT'},
            add: {method: 'POST', url: baseURL + "/:logId"},
            create: {method: 'GET', url: baseURL + "/create"},
            delete: {method: 'DELETE', url: baseURL + "/:id"},
            findById: {method: 'GET', url: baseURL + '/:id'},
            findByBatch: {method: 'GET', url: baseURL + '/batch/:batchId', isArray:true}
        });
    }])
    .factory('FavoriteAndHistoryService', ['$resource', 'contextPath', 'ControllerInfoPasser',
        function ($resource, contextPath) {
            return $resource(contextPath + '/webapi/properties/:username/:action/:propertyNumber', {
                username: '@username',
                propertyNumber: '@propertyNumber'
            }, {
                favorite: {method: 'PUT', params: {action: 'favorites'}},
                unfavorite: {method: 'DELETE', params: {action: 'favorites'}},
                history: {method: 'PUT', params: {action: 'history'}}
            });

        }])
    .factory('SelectedEnvironmentalMenuItem', ['$rootScope', function ($rootScope) {
        var selectedMenuItem;

        return {
            setSelectedMenuItem: function (menuItem) {
                selectedMenuItem = menuItem;
                $rootScope.$broadcast('event:environmentalMenuItemChanged', selectedMenuItem);
            }
        }

    }])
    .factory('PropertyAssignmentsService', ['$resource', 'contextPath', 'ControllerInfoPasser',
        function ($resource, contextPath) {
            return $resource(contextPath + '/webapi/properties/:username/:action/:propertyNumber', {
                username: '@username',
                propertyNumber: '@propertyNumber'
            }, {
                assign: {method: 'PUT', params: {action: 'assignproperty'}},
                unassign: {method: 'PUT', params: {action: 'unassignproperty'}},
                getAssignedProperties: {
                    method: 'GET',
                    isArray: true,
                    params: {action: 'assignedproperties', propertyNumber: ''}
                }
            });
        }])
    .factory('PropertyProfileService', ['$resource', 'contextPath',
        function ($resource, contextPath) {
            return $resource(contextPath + '/webapi/properties/:userId/profileproperty/:propertyNumber', {
                userId: '@userId',
                propertyNumber: '@propertyNumber'
            }, {
                addProfile: {method: 'POST'},
                removeProfile: {method: 'DELETE'}
            });
        }])
    .factory('ReportLoginService', ['$resource', '$location', 'contextPath',
        function ($resource, $location, contextPath) {
            //console.log('Report Logon Service... ' );
            return $resource(contextPath + '/webapi/reports/login/:logonid/:pwd', {
                logonid: '@logonid',
                pwd: '@password'
            });
        }])

    .factory('ReportLogoutService', ['$resource', '$location', function ($resource, $location) {
        return $resource($location.protocol() + '://' + window.location.host + '/jasperserver/logout.html?showPasswordChange=null', {}, {
            executeLogout: {method: 'POST'}
        });
    }])
    .factory('ReportLookupService', ['$resource', 'contextPath', function ($resource, contextPath) {
        return $resource(contextPath + '/webapi/reports/:servicePath', {}, {
            getAllReportsByType: {method: 'GET', isArray: true, params: {servicePath: 'allReportsByType'}},
            getReportSession: {method: 'GET', params: {servicePath: 'getReportSession'}}
        });
    }])
    .factory('DropboxLookup', ['$resource', 'contextPath', function ($resource, contextPath) {
        return $resource(contextPath + '/webapi/dropboxes/:restPath', {}, {
            query: {method: 'GET', isArray: true},
            save: {method: 'POST', isArray: true},
            update: {method: 'PUT'},
            getDropboxesByName: {method: 'PUT', isArray: true, params: {restPath: 'getDropboxesByName'}}
        });
    }])
    .factory('GeoService', ['$resource', 'contextPath', function ($resource, contextPath) {
        return $resource(contextPath + '/webapi/georesource/:restPath', {}, {
            getCountries: {method: 'GET', isArray: true, params: {restPath: 'countries'}}
        });
    }])
    .factory('OHSService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi';

        return $resource(contextPath + '/webapi/:ohsMenuId/:propertyNum/:servicePath', {}, {
            getOHSRecordList: {method: 'GET', isArray: true},
            addOHSRecord: {method: 'POST'},
            updateOHSRecord: {method: 'PUT'},
            deleteOHSRecord: {method: 'DELETE', url: contextPath + '/webapi/:ohsMenuId/:propertyNum/:servicePath'},
            govtLabourInspectionCount: {method: 'PUT', url: baseUrl + '/governmentlaborinspection/countNotClosed'},
            openHighRiskTasksCount: {method: 'PUT', url: baseUrl + '/tasks/ohsmeeting/countOpenHighRisk'},
            recordCount: {method: 'PUT', url: baseUrl + '/:record/countInPropertyNumbers'},
            dashboardDetails: {method: 'PUT', url: baseUrl + '/:record/propertyDetails'},
            dashboardYearlyDetails: {method: 'PUT', url: baseUrl + '/:record/yearlyPropertyDetails', isArray: true},
            dashboardDetailsOHSTasks: {method: 'PUT', url: baseUrl + '/tasks/ohsmeeting/propertyDetails'}
        });
    }])
    .factory('EmissionFactorService', ['$resource', 'contextPath', function ($resource, contextPath) {
        return $resource(contextPath + '/webapi/greenhousegases/emissionfactor/:servicePath', {}, {
            query: {method: 'GET', isArray: true},
            save: {method: 'POST'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: contextPath + '/webapi/greenhousegases/emissionfactor/:id'},
            create: {method: 'POST', params: {servicePath: 'create'}},
            findById: {method: 'GET', url: contextPath + '/webapi/greenhousegases/emissionfactor/:id'},
            findByEmissionSourceUtilityType: {
                method: 'GET',
                isArray: true,
                url: contextPath + '/webapi/greenhousegases/emissionfactor/utility/:utilityType'
            }
        });
    }])
    .factory("UtilityBenchmarkService", ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + "/webapi/utilitybenchmark";
        return $resource(baseUrl + "/:servicePath", {}, {
            query: {method: "GET", isArray: true},
            save: {method: "POST"},
            update: {method: "PUT"},
            delete: {method: "DELETE", url: baseUrl + "/:id"},
            create: {method: "GET", params: {servicePath: "create"}},
            findById: {method: "GET", url: baseUrl + "/:id"}
        });
    }])
    .factory('QuestionnaireService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/properties/questionnaire';
        return $resource(baseURL, {subType: '@subType', type: '@type'}, {
            getQuestionnaires: {method: 'GET', url: baseURL + '/:type/:subType', isArray: true},
            findByModule: {method: 'GET', url: baseURL + '/module/:moduleName', isArray: true},
            findByType: {method: 'GET', url: baseURL + '/type/:type', isArray: true},
            findByModuleAndPropertyAndType: {
                method: 'GET',
                url: baseURL + '/module/:moduleName/:propertyNumber/:type',
                isArray: true
            },
            findForDashboardCarousel: {method: 'GET', url: baseURL + '/dashboard/carousel/:moduleName', isArray: true},
            findByIdWithAnswers: {method: 'GET', url: baseURL + '/:questionnaireId/:searchParam'},
            findByYearAndClientNameWithAnswers: {method: 'GET', url: baseURL + '/year/:year/clientName/:clientName'},
            findById: {method: 'GET', url: baseURL + '/:questionnaireId'},
            getQuestionnaire: {method: 'GET', url: baseURL + '/:type/:subType/:propertyNum/:name'},
            saveQuestionAnswer: {method: 'POST', url: baseURL + '/:questionnaireId/question/answer'},
            deleteQuestionAnswer: {
                method: 'DELETE',
                url: baseURL + '/:questionnaireId/question/answer/:answerId'
            },
            saveQuestionOptionAnswer: {
                method: 'POST',
                url: baseURL + '/:questionnaireId/question/option/:optionId/answer'
            },
            getScoreFromType: {
                method: 'GET',
                url: contextPath + '/webapi/questionnairescores/:propertyNum/:questionnaireId/:scoreType/:clientName'
            },
            getMaxScoreFromType: {
                method: 'GET',
                url: contextPath + '/webapi/questionnairescores/:questionnaireId/:scoreType/maximum'
            },
            getAvailableCategories: {method: 'GET', url: baseURL + "/categories", isArray: true},
            getQuestionnaireCategories: {method: 'GET', url: baseURL + "/:questionnaireId/categories", isArray: true},
            getAvailableQuestions: {method: 'GET', url: baseURL + "/questions", isArray: true},
            save: {method: 'POST'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseURL + "/:id"},
            newCategory: {method: 'POST', url: baseURL + "/categories"},
            updateCategory: {method: 'PUT', url: baseURL + "/categories"},
            deleteCategory: {method: 'DELETE', url: baseURL + "/categories/:id"},
            updateCategories: {method: 'PUT', url: baseURL + "/:questionnaireId/categories", isArray: true},
            getQuestionnaireCategoryQuestions: {
                method: 'GET',
                url: baseURL + "/:questionnaireId/:categoryId/questions",
                isArray: true
            },
            updateQuestionnaireQuestions: {
                method: 'PUT',
                url: baseURL + "/:questionnaireId/:categoryId/questions",
                isArray: true
            },
            updateQuestion: {method: 'PUT', url: baseURL + "/questions"},
            createQuestion: {method: 'POST', url: baseURL + "/questions"},
            deleteQuestion: {method: 'DELETE', url: baseURL + "/questions/:id"},
            getQuestionWeightings: {
                method: 'GET',
                url: baseURL + "/:questionnaireId/:categoryId/:questionId/weightings",
                isArray: true
            },
            getQuestionWeightingsByType: {
                method: 'GET',
                url: baseURL + "/:questionnaireId/:categoryId/:questionId/weightings/:scoreType",
                isArray: true
            },
            getAvailableWeightings: {method: 'GET', url: baseURL + "/weightings", isArray: true},
            createWeighting: {method: 'POST', url: baseURL + "/weightings"},
            updateWeightings: {method: 'PUT', url: baseURL + "/weightings"},
            deleteWeightings: {method: 'DELETE', url: baseURL + "/weightings/:id"},
            updateQuestionnaireQuestionWeightings: {
                method: 'PUT',
                url: baseURL + "/:questionnaireId/:categoryId/:questionId/weightings",
                isArray: true
            },
            getActiveOptions: {
                method: 'GET',
                url: baseURL + "/:questionnaireId/:categoryId/:questionId/options/:answer",
                isArray: true
            },
            getOptionsOnQuestionnaire: {method: 'GET', url: baseURL + "/:questionnaireId/options", isArray: true},
            getAvailableOptions: {method: 'GET', url: baseURL + "/options", isArray: true},
            createOptions: {method: 'POST', url: baseURL + "/options"},
            updateOptions: {method: 'PUT', url: baseURL + "/options"},
            deleteOptions: {method: 'DELETE', url: baseURL + "/options/:id"},
            updateQuestionnaireQuestionOptions: {
                method: 'PUT',
                url: baseURL + "/:questionnaireId/:categoryId/:questionId/options/:answer",
                isArray: true
            },
            getOptionWeightings: {
                method: 'GET',
                url: baseURL + "/:questionnaireId/:categoryId/:questionId/:optionId/weightings/:scoreType",
                isArray: true
            },
            updateOptionWeightings: {
                method: 'PUT',
                url: baseURL + "/:questionnaireId/:categoryId/:questionId/:optionId/weightings/:scoreType",
                isArray: true
            },
            getCertificationPrereqs: {
                method: 'GET',
                url: baseURL + "/:questionnaireId/:categoryId/:questionId/certificationPrereqs",
                isArray: true
            },
            updateCertificationPrereqs: {
                method: 'PUT',
                url: baseURL + "/:questionnaireId/:categoryId/:questionId/certificationPrereqs",
                isArray: true
            },
            getQuestionPrereqs: {
                method: 'GET',
                url: baseURL + "/:questionnaireId/:categoryId/:questionId/questionPrereqs/:scoreType",
                isArray: true
            },
            updateQuestionPrereqs: {
                method: 'PUT',
                url: baseURL + "/:questionnaireId/:categoryId/:questionId/questionPrereqs/:scoreType",
                isArray: true
            },
            getQuestionnaireQuestions: {method: 'GET', url: baseURL + "/:questionnaireId/questions", isArray: true},
            getCertificationLevels: {
                method: 'GET',
                url: baseURL + "/:questionnaireId/certificationRanges",
                isArray: true
            },
            updateCertificationLevels: {
                method: 'PUT',
                url: baseURL + "/:questionnaireId/certificationRanges",
                isArray: true
            },
            getQuestionnaireCertificationOptions: {
                method: 'GET',
                url: baseURL + "/:questionnaireId/certificationOptions",
                isArray: true
            },
            updateQuestionnaireCertificationOptions: {
                method: 'PUT',
                url: baseURL + "/:questionnaireId/certificationOptions",
                isArray: true
            },
            getCertificationOptions: {
                method: 'GET',
                url: baseURL + "/:questionnaireId/availableCertificationOptions/:title",
                isArray: true
            },
            getWeightingsOnQuestionnaire: {method: 'GET', url: baseURL + "/:questionnaireId/weightings", isArray: true},
            getScoringConfigurationCategories: {
                method: 'GET',
                url: baseURL + "/:questionnaireId/configuration/:weighting",
                isArray: true
            },
            getScoringConfigurationTableData: {
                method: 'GET',
                url: baseURL + "/:questionnaireId/configuration/tabular/:weighting",
                isArray: true
            },
            getScoringPreRequisiteQuestionsTableData: {
                method: 'GET',
                url: baseURL + "/:questionnaireId/prerequisitequestions/tabular/:weighting",
                isArray: true
            },
            getScoringConfigurationQuestions: {
                method: 'GET',
                url: baseURL + "/:questionnaireId/:categoryId/configuration/:weighting",
                isArray: true
            },
            getScoringConfigurationQuestionOptions: {
                method: 'GET',
                url: baseURL + "/:questionnaireId/:categoryId/:questionId/configuration/:weighting",
                isArray: true
            },
            clone: {method: 'POST', url: baseURL + "/:questionnaireId/clone"},
            lockQuestionnaire: {method: 'PUT', url: baseURL + "/lock/:questionnaireId"},
            getQuestionDependencies: {
                method: 'GET',
                url: baseURL + "/:questionnaireId/questions/:questionId/dependencies"
            },
            updateQuestionDependencies: {method: 'PUT', url: baseURL + "/:questionnaireId/questions/dependencies"},
            getAnswerMap: {method: 'GET', url: baseURL + "/:questionnaireId/:searchParam/answerMap"},
            getAnswerMapByClientName: {method: 'GET', url: baseURL + "/:questionnaireId/clientName/:clientName/answerMap"},
            lockQuestionnaireForProperty: {
                method: 'PUT',
                url: baseURL + "/:questionnaireId/:propertyNumber/lock",
                isArray: true
            },
            updatePropertyExclusions: {
                method: 'PUT',
                url: baseURL + "/:questionnaireId/propertyExclusions",
                headers: {'Content-Type': 'text/plain'}
            },
            findQuestionnairesForProperties: {
                method: 'PUT',
                isArray: true,
                url: baseURL + "/findForProperties"
            },
            findQuestionnairesForPropertiesWithScoringCategories: {
                method: 'PUT',
                isArray: true,
                url: baseURL + "/findForPropertiesWithScoringCategories/:module/:type"
            },
            getQuestionnaireCompleteness: {
                method: 'PUT',
                isArray: true,
                url: baseURL + "/:questionnaireId/completeness"
            },
            getScoreDistribution: {
                method: "PUT",
                url: contextPath + '/webapi/questionnairescores/certifications/distribution/:questionnaireId/:scoreType'
            },
            getDashboardScoreData: {
                method: "PUT",
                url: contextPath + '/webapi/questionnairescores/dashboardData/:questionnaireId'
            },
            getLandingPageScoreData: {
                method: "PUT",
                url: contextPath + '/webapi/questionnairescores/landingPageData/:questionnaireId'
            },
            getDashboardCompletenessData: {
                method: "PUT",
                url: contextPath + '/webapi/questionnairecompleteness/dashboarddata/:questionnaireId'
            },
            refreshCompletenessForProperties: {
                method: "PUT",
                url: baseURL + '/:questionnaireId/refreshCompleteness'
            },
            getCertificationPrereqQuestions: {
                method: "GET",
                isArray: true,
                url: baseURL + '/:questionnaireId/certification/prerequisites/questions'
            },
            getPropertiesForCertification: {
                method: "PUT",
                isArray: true,
                url: contextPath + '/webapi/questionnairescores/certifications/:questionnaireId/properties/:scoreType/:certificationLevel'
            },
            findPropertiesForWeightingOnQuestionnaire: {
                method: 'POST',
                isArray: true,
                url: baseURL + '/:questionnaireId/:isWithCertificationRange/:rangeScoreType/weighting'
            },
            getQuestionAnalytics: {method: 'PUT', isArray: true, url: baseURL + '/analytics/:questionnaireId/:questionId'},
            getOptionAnalytics: {method: 'PUT', url: baseURL + '/analytics/:questionnaireId/:questionId/:optionId'}
        })
    }])
    .factory('GeneralTasksService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/tasks/general/:id';
        return $resource(baseURL, {id: '@id', propertyNumber: '@propertyNumber'}, {
            getByPriority: {method: 'GET', isArray: true, url: baseURL + '/priority/:priority'},
            getByStatus: {method: 'GET', isArray: true, url: baseURL + '/status/:status'},
            getByModule: {method: 'GET', isArray: true, url: baseURL + '/module/:module'},
            create: {method: 'GET', params: {id: 'create'}, url: baseURL + '/:propertyNumber'},
            getByModuleRecord: {
                method: 'GET',
                isArray: true,
                url: baseURL + '/modulerecord/:module/:recordtype/:propertyname'
            },
            query: {method: 'GET', isArray: true, url: baseURL + '/user/:username'},
            queryClosed: {method: 'GET', isArray: true, url: baseURL + '/user/:username/closed'},
            queryDeleted: {method: 'GET', isArray: true, url: baseURL + '/forUser/deleted'},
            queryDashboard: {method: 'GET', isArray: true, url: baseURL + '/user/:username/dashboard'},
            update: {method: 'PUT'},
            closeTask: {method: 'PUT', url: baseURL + '/closeTask'},
            startTask: {method: 'PUT', url: baseURL + '/startTask'},
            reopenTask: {method: 'PUT', url: baseURL + '/reopenTask'},
            recoverDeletedTask: {method: 'PUT', url: baseURL + '/recoverDeleted'},
            findByPropertyAndModule: {method: 'GET', url: baseURL + '/:propertyNumber/:module', isArray: true},
            createNewComment: {method: 'GET', url: contextPath + '/webapi/tasks/general/createComment'},
            findLinkedEntities: {
                method: 'GET',
                url: baseURL + "/:linkedEntityClass/:linkedEntityId/:purposeToLinkedEntity",
                isArray: true,
                params: {id: 'linkedTo'}
            },
            createTask: {method: 'GET', params: {id: 'create'}, url: baseURL + '/:propertyNumber'},
            findChildTasks: {method: 'GET', isArray: true, url: baseURL + '/children'}
        })
    }])
    .factory('AuditLogService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/auditlog/records';
        return $resource(baseURL, {}, {
            findHistoryRecords: {
                method: 'GET',
                url: baseURL + "/:recordId/:className",
                isArray: true
            }
        })
    }])
    .factory('OHSMeetingTasksService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/tasks/ohsmeeting/:id';
        return $resource(baseURL, {id: '@id', propertyNumber: '@propertyNumber'}, {
            getByPriority: {method: 'GET', isArray: true, url: baseURL + '/priority/:priority'},
            getByStatus: {method: 'GET', isArray: true, url: baseURL + '/status/:status'},
            getByModule: {method: 'GET', isArray: true, url: baseURL + '/module/:module'},
            getByModuleRecord: {method: 'GET', isArray: true, url: baseURL + '/modulerecord/:propertyname'},
            query: {method: 'GET', isArray: true, url: baseURL + '/user/:username'},
            queryClosed: {method: 'GET', isArray: true, url: baseURL + '/user/:username/closed'},
            queryDeleted: {method: 'GET', isArray: true, url: baseURL + '/forUser/deleted'},
            queryDashboard: {method: 'GET', isArray: true, url: baseURL + '/user/:username/dashboard'},
            update: {method: 'PUT'},
            closeTask: {method: 'PUT', url: baseURL + '/closeTask/:propertyNumber'},
            startTask: {method: 'PUT', url: baseURL + '/startTask'},
            reopenTask: {method: 'PUT', url: baseURL + '/reopenTask'},
            recoverDeletedTask: {method: 'PUT', url: baseURL + '/recoverDeleted'},
            findByPropertyAndModule: {method: 'GET', url: baseURL + '/:propertyNumber/:module', isArray: true},
            createNewComment: {method: 'GET', url: contextPath + '/webapi/tasks/ohsmeeting/createComment'},
            findChildTasks: {method: 'GET', isArray: true, url: baseURL + '/children'}
        });
    }])
    .factory('InsuranceTasksService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/tasks/insurance/:id';
        return $resource(baseURL, {id: '@id', propertyNumber: '@propertyNumber'}, {
            getByPriority: {method: 'GET', isArray: true, url: baseURL + '/priority/:priority'},
            getByStatus: {method: 'GET', isArray: true, url: baseURL + '/status/:status'},
            getByModule: {method: 'GET', isArray: true, url: baseURL + '/module/:module'},
            getByModuleRecord: {method: 'GET', isArray: true, url: baseURL + '/modulerecord/:propertyname'},
            query: {method: 'GET', isArray: true, url: baseURL + '/property/:propertyNumber'},
            queryClosed: {method: 'GET', isArray: true, url: baseURL + '/property/:propertyNumber/closed'},
            queryDeleted: {method: 'GET', isArray: true, url: baseURL + '/property/:propertyNumber/deleted'},
            queryDashboard: {method: 'GET', isArray: true, url: baseURL + '/user/:username/dashboard'},
            update: {method: 'PUT'},
            closeTask: {method: 'PUT', url: baseURL + '/closeTask'},
            startTask: {method: 'PUT', url: baseURL + '/startTask'},
            reopenTask: {method: 'PUT', url: baseURL + '/reopenTask'},
            recoverDeletedTask: {method: 'PUT', url: baseURL + '/recoverDeleted'},
            findByPropertyAndModule: {method: 'GET', url: baseURL + '/:propertyNumber/:module', isArray: true},
            getNewTask: {method: 'GET', url: baseURL + '/create/:propertyNumber'},
            getDueDate: {method: 'GET', url: baseURL + '/calculateDueDate/:recurrence/:interval/:date'},
            createNewComment: {method: 'GET', url: contextPath + '/webapi/tasks/insurance/createComment'}
        });
    }])
    .factory('InsuranceRecommendationService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/insurance/recommendation';
        return $resource(baseURL, {}, {
            findByName: {method: 'GET', url: baseURL + '/:name'},
            findById: {
                method: 'GET',
                url: baseURL + '/:recommendationId',
                isArray: true
            }
        });
    }])
    .factory('HelpService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/help';
        return $resource(baseURL, {}, {
            getDocument: {method: 'GET', url: baseURL + '/:id/document', responseType: 'arraybuffer'},
            query: {method: 'GET', isArray: true},
            save: {method: 'POST'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseURL + '/:id'},
            create: {method: 'GET', url: baseURL + '/create'},
            findById: {method: 'GET', url: baseURL + '/:id'}
        });
    }])
    .factory('PropertyDocumentService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/propertydocuments';
        return $resource(baseURL, {}, {
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseURL + '/:documentId'},
            save: {method: 'POST', url: baseURL + '/property/:propertyId'},
            findDocumentById: {method: 'GET', url: baseURL + '/:documentId'},
            findDocumentsByPropertyId: {method: 'GET', url: baseURL + '/property/:propertyId', isArray: true},
            findDocumentsByPropertyAndType: {
                method: 'GET',
                isArray: true,
                url: baseURL + '/property/:propertyId/:documentTypeId'
            }
        });
    }])
    .factory('RegionDocumentService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/regiondocuments';
        return $resource(baseURL, {}, {
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseURL + '/:documentId'},
            findDocumentById: {method: 'GET', url: baseURL + '/:documentId'},
            findDocumentsByRegionId: {method: 'GET', url: baseURL + '/region/:regionId', isArray: true},
            save: {method: 'POST', url: baseURL + '/region/:regionId'},
            findDocumentsByRegionAndType: {
                method: 'GET',
                isArray: true,
                url: baseURL + '/region/:regionId/:documentTypeId'
            }
        });
    }])
    .factory('BuildingDocumentService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/buildingdocuments';
        return $resource(baseURL, {}, {
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseURL + '/:documentId'},
            save: {method: 'POST', url: baseURL + '/building/:buildingId'},
            findDocumentById: {method: 'GET', url: baseURL + '/:documentId'},
            findDocumentsByBuildingId: {method: 'GET', url: baseURL + '/building/:buildingId', isArray: true},
            findDocumentsByBuildingAndType: {
                method: 'GET',
                isArray: true,
                url: baseURL + '/building/:buildingId/:documentTypeId'
            },
            findDocumentsInBuildingIds: {method: 'PUT', isArray: true, url: baseURL + '/buildings'},
            findDocumentsInBuildingIdsAndType: {
                method: 'PUT',
                isArray: true,
                url: baseURL + '/buildings/:documentTypeId'
            }
        });
    }])
    .factory('FloorDocumentService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/floordocuments';
        return $resource(baseURL, {}, {
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseURL + '/:documentId'},
            save: {method: 'POST', url: baseURL + '/floor/:floorId'},
            findDocumentById: {method: 'GET', url: baseURL + '/:documentId'},
            findDocumentsByFloorId: {method: 'GET', url: baseURL + '/floor/:floorId', isArray: true},
            findDocumentsByFloorAndType: {
                method: 'GET',
                isArray: true,
                url: baseURL + '/floor/:floorId/:documentTypeId'
            },
            findDocumentsInFloorIds: {method: 'PUT', isArray: true, url: baseURL + '/floors'},
            findDocumentsInFloorIdsAndType: {method: 'PUT', isArray: true, url: baseURL + '/floors/:documentTypeId'}
        });
    }])
    .factory('RoomDocumentService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/roomdocuments';
        return $resource(baseURL, {}, {
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseURL + '/:documentId'},
            save: {method: 'POST', url: baseURL + '/room/:roomId'},
            findDocumentById: {method: 'GET', url: baseURL + '/:documentId'},
            findDocumentsByRoomId: {method: 'GET', url: baseURL + '/room/:roomId', isArray: true},
            findDocumentsByRoomAndType: {method: 'GET', isArray: true, url: baseURL + '/room/:roomId/:documentTypeId'},
            findDocumentsInRoomIds: {method: 'PUT', isArray: true, url: baseURL + '/rooms'},
            findDocumentsInRoomIdsAndType: {method: 'PUT', isArray: true, url: baseURL + '/rooms/:documentTypeId'}
        });
    }])
    .factory('GeneralDocumentService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/documents';
        return $resource(baseURL, {}, {
            createDocumentLink: {method: 'POST', url: baseURL + '/link/create'},
            pasteDocuments: {method: 'PUT', url: baseURL + '/paste/:parentType/:parentName/:parentFK'}
        });
    }])
    .factory('SharePointService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/sharepoint';
        return $resource(baseURL, {}, {
            findDocumentsByPropertyNumber: {method: 'GET', url: baseURL + '/:propertyNumber/documents', isArray: true}
        });
    }])
    .factory('TaskPasser', ['$rootScope', function ($rootScope) {
        var tasks = [];

        return {
            getTask: function () {
                return tasks.pop();
            },
            setTask: function (task) {
                tasks.push(task);
            }
        };

    }])
    .factory('InsuranceService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/insurance/:servicePath';
        return $resource(baseURL, {}, {
            findInsuranceRecords: {method: 'GET', isArray: true},
            createInsuranceRecord: {method: 'GET', url: baseURL + '/create'},
            addInsuranceRecord: {method: 'POST', url: baseURL + '/add'},
            updateInsuranceRecord: {method: 'PUT', url: baseURL + '/update'},
            deleteInsuranceRecord: {method: 'DELETE', url: baseURL + '/delete/:id'},
            findInsuranceRecordsByName: {method: 'GET', isArray: true, url: baseURL + 'findbyname/:recordName'},
            findInsuranceRecordsByModule: {method: 'GET', isArray: true, url: baseURL + 'findbymodule/:moduleName'}
        });
    }])
    .factory('ComplianceService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/compliancerecords';
        return $resource(baseURL, {}, {
            query: {method: 'GET', isArray: true, url: baseURL + '/findAll/:module/:country/:territory/:category'},
            find: {method: 'GET', url: baseURL + '/:id'},
            findByEffectiveDate: {method: 'POST', url: baseURL + '/findByEffectiveDate'},
            create: {method: 'GET', url: baseURL + '/create/:module/:country/:territory/:category'},
            findActiveRevision: {
                method: 'GET',
                url: baseURL + '/findActiveRevision/:module/:country/:territory/:category'
            },
            add: {method: 'POST'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseURL + '/:id'}
        });
    }])
    .factory('DropboxService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/dropboxes';
        return $resource(baseURL, {}, {
            query: {method: 'GET', isArray: true},
            update: {method: 'PUT'},
            findByID: {method: 'GET', url: baseURL + '/:id'},
            findQuestionnaireDropboxes: {method: 'GET', isArray: true, url: baseURL + "/questionnaire"},
            delete: {method: 'DELETE', isArray: true, url: baseURL + "/:id"}
        });
    }])
    .factory('PropertyComponentService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/properties';
        return $resource(baseURL, {}, {
            createBuilding: {method: 'GET', url: baseURL + '/building'},
            createFloor: {method: 'GET', url: baseURL + '/floor'},
            createRoom: {method: 'GET', url: baseURL + '/room'},
            addBuilding: {method: 'POST', url: baseURL + '/:propertyId/building'},
            addFloor: {method: 'POST', url: baseURL + '/building/:buildingId/floor'},
            addRoom: {method: 'POST', url: baseURL + '/building/floor/:floorId/room'},
            updateBuilding: {method: 'PUT', url: baseURL + '/:propertyId/building'},
            updateFloor: {method: 'PUT', url: baseURL + '/building/:buildingId/floor'},
            updateRoom: {method: 'PUT', url: baseURL + '/building/floor/:floorId/room'},
            deleteBuilding: {method: 'DELETE', url: baseURL + '/building/:buildingId'},
            deleteFloor: {method: 'DELETE', url: baseURL + '/building/floor/:floorId'},
            deleteRoom: {method: 'DELETE', url: baseURL + '/building/floor/room/:roomId'}
        });
    }])
    .factory('WasteStreamsService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/waste/management/streams';
        return $resource(baseURL, {}, {
            create: {method: 'GET', url: baseURL + '/create'},
            save: {method: 'POST'},
            query: {method: 'GET', isArray: true},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseURL + '/:id'}
        });
    }])
    .factory('WasteService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/waste/management/records';
        return $resource(baseURL, {}, {
            createWasteRecordForProperty: {
                method: 'GET',
                url: baseURL + '/create/:year/:month/:wastestreamid/property/:propertynumber/:company'
            },
            createWasteRecordForBuilding: {
                method: 'GET',
                url: baseURL + '/create/:year/:month/:wastestreamid/building/:buildingnumber/:company'
            },
            save: {method: 'POST', url: baseURL + '/:wastestreamid'},
            query: {method: 'GET', isArray: true},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseURL + '/:id'},
            getPropertyCategorizedWasteRecordsByYear: {
                method: 'GET',
                isArray: true,
                url: baseURL + '/:propertynumber/categorized/:year/module/:module'
            },
            getPropertyCategorizedRecordsByYearAndCompany: {
                method: 'GET',
                isArray: true,
                url: baseURL + '/:propertynumber/categorized/:year/:company/module/:module'
            },
            getBuildingCategorizedWasteRecordsByYear: {
                method: 'GET',
                isArray: true,
                url: baseURL + '/:propertynumber/:buildingnumber/categorized/:year/module/:module'
            },
            getBuildingCategorizedRecordsByYearAndCompany: {
                method: 'GET',
                isArray: true,
                url: baseURL + '/:propertynumber/:buildingnumber/categorized/:year/:company/module/:module'
            },
            getAllBuildingCategorizedWasteRecordsByYear: {
                method: 'GET',
                isArray: true,
                url: baseURL + '/:propertynumber/buildings/all/categorized/:year/module/:module'
            },
            getAllBuildingCategorizedRecordsByYearAndCompany: {
                method: 'GET',
                isArray: true,
                url: baseURL + '/:propertynumber/buildings/all/categorized/:year/:company/module/:module'
            },
            getDashboardData: {
                method: 'PUT',
                url: baseURL + "/dashboardData/years/:fromYear/to/:toYear/months/:fromMonth/to/:toMonth/:companyName"
            },
            createStandardWasteRecord: {method: 'GET', url: baseURL + '/create/standard'},
            createStandardWasteRecordWithGeneratorNumber: {
                method: 'GET',
                url: baseURL + '/create/standard/:propertyNumber'
            },
            findByPropertyId: {method: 'GET', isArray: true, url: baseURL + '/find/propertyId/:propertyId'},
            findByParentProperty: {method: 'GET', isArray: true, url: baseURL + '/find/parentProperty/:propertyId'},
            findByBuildingId: {method: 'GET', isArray: true, url: baseURL + '/find/buildingId/:buildingId'},
            findByParentPropertyAndModule: {
                method: 'GET',
                isArray: true,
                url: baseURL + '/find/parentProperty/:propertyId/module/:module'
            },
            findByBuildingIdAndModule: {
                method: 'GET',
                isArray: true,
                url: baseURL + '/find/buildingId/:buildingId/module/:module'
            }

        });
    }])
    .factory('PropertyReportTypeService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/propertyreport/type';
        return $resource(baseURL, {}, {
            create: {method: 'GET', url: baseURL + '/create'},
            add: {method: 'POST'},
            delete: {method: 'DELETE', url: baseURL + '/:id'},
            query: {method: 'GET', isArray: true},
            findById: {method: 'GET', url: baseURL + '/:id'},
            update: {method: 'PUT'}

        });
    }])
    .factory('PropertyReportService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/propertyreport/report';
        return $resource(baseURL, {}, {
            create: {method: 'GET', url: baseURL + '/create/:typeId'},
            add: {method: 'POST'},
            delete: {method: 'DELETE', url: baseURL + '/:id'},
            query: {method: 'GET', isArray: true},
            findById: {method: 'GET', url: baseURL + '/:id'},
            findByPropertyReportType: {method: 'GET', isArray: true, url: baseURL + '/type/:typeId'},
            update: {method: 'PUT'},
            changeStatus: {method: 'PUT', url: baseURL + '/changeStatus/:id'},
            getHistory: {method: "GET", isArray: true, url: baseURL + "/history/:id"}
        });
    }])
    .factory('PropertyReportDataService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/propertyreport/data';
        return $resource(baseURL, {}, {
            open: {method: 'GET', url: baseURL + '/open/:propertyNumber/:propertyReportId'},
            submitPropertyReportData: {method: 'POST', url: baseURL + '/submit/:propertyNumber/:editStatus'},
            getHistory: {method: 'GET', isArray: true, url: baseURL + '/history/:id'}
        });
    }])
    .factory('DashboardService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseURL = contextPath + '/webapi/dashboard';
        return $resource(baseURL, {}, {
            findByUserProfileId: {method: 'GET', url: baseURL + '/profile/:profileId'},
            query: {method: 'GET', isArray: true},
            findById: {method: 'GET', url: baseURL + '/:id'}
        });
    }])
    .factory('AppModuleService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/applicationmodules';

        return $resource(baseUrl, {}, {
            getAppModuleByName: {method: 'GET', url: baseUrl + '/:moduleName'},
            getActiveModules: {method: 'GET', url: baseUrl + '/activeNonSystemModules', isArray: true}
        });
    }])
    .factory('QuestionnaireReportConfigService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/questionnairereportconfigs';

        return $resource(baseUrl, {}, {
            findById: {method: 'GET', url: baseUrl + '/:id'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseUrl + '/:id'},
            findByQuestionnaireId: {
                method: 'GET',
                url: baseUrl + '/questionnaire/:questionnaireId/:reportType',
                isArray: true
            }
        });
    }])
    .factory('BusinessContactService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/businesscontacts';

        return $resource(baseUrl, {}, {
            findById: {method: 'GET', url: baseUrl + '/:id'},
            query: {method: 'GET', isArray: true},
            create: {method: 'GET', url:baseUrl + '/create'}
        });
    }])
    .factory('QuestionnaireWorkflowService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + "/webapi/questionnaire/workflow";

        return $resource(baseUrl, {}, {
            findById: {method: 'GET', url: baseUrl + '/:id'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseUrl + '/:id'},
            findByQuestionnaireIdAndProperty: {
                method: 'GET',
                url: baseUrl + '/questionnaire/:questionnaireId/property/:propertyNumber'
            }
        });
    }])
    .factory('RecordAlertConfigService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/recordalertconfigs';

        return $resource(baseUrl, {}, {
            query: {method: 'GET', isArray: true},
            add: {method: 'POST'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseUrl + '/:id'},
            findFields: {method: 'GET', isArray: true, url: baseUrl + '/fields/:className'},
            findEnvironmentalFields: {method: 'GET', isArray: true, url: baseUrl + '/environmentalfields/:docTypeName'},
            create: {method: 'GET', url: baseUrl + '/create'}
        });
    }])
    .factory('PropertyGroupService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/propertygroups';

        return $resource(baseUrl, {}, {
            get: {method: 'GET', url: baseUrl + '/:id'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseUrl + '/:id'},
            getProperties: {method: "GET", isArray: true, url: baseUrl + "/properties/:id"},
            getByUserId: {method: "GET", isArray: true, url: baseUrl + "/user/:id"}
        });
    }])
    .factory('ReportArchiveService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/reportarchives';

        return $resource(baseUrl, {}, {
            get: {method: 'GET', url: baseUrl + '/:id'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseUrl + '/:id'},
            findByModuleAndProperty: {method: 'GET', isArray: true, url: baseUrl + "/:module/:propertyNumber"}
        });
    }])
    .factory('RealpacReportingService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/realpacreporting';

        return $resource(baseUrl, {}, {
            query: {method: 'GET', isArray: true},
            findAllIncludeValidation: {method: 'GET', isArray: true, url: baseUrl + "/validations"},
            get: {method: 'GET', url: baseUrl + '/:id'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseUrl + '/:id'},
            create: {method: 'GET', url: baseUrl + '/create'}
        });
    }])
    .factory('BuildingSnapshotService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/buildingsnapshot';

        return $resource(baseUrl, {}, {
            save: {method: 'POST'},
            update: {method: 'PUT'},
            findByReportingYearAndPropertyNumberAndBuildingNumber: {method: 'GET', url: baseUrl + "/:reportingYear/:propertyNumber"}
        });
    }])
    .factory("IntegratedRealpacService", ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + "/webapi/realpac";

        return $resource(baseUrl, {}, {
            save: {method: "POST"},
            update: {method: "PUT"},
            validate: {method: "PUT", url: baseUrl + "/validate"},
            findByReportingYearAndPropertyNumberAndBuildingNumber: {method: "GET", url: baseUrl + "/:reportingYear/:propertyNumber"},
            findByPropertyNumberAndYear: {method: "GET", url: baseUrl + "/properties/:propertyNumber/year/:year"},
            getPropertyListInTypesForYear: {method: "PUT", isArray: true, url: baseUrl + "/:reportingYear/propertytypes"}
        });
    }])
    .factory("RealpacBuildingService", ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + "/webapi/realpacbuilding";
        return $resource(baseUrl, {}, {
            save: {method: "POST"},
            update: {method: "PUT"},
            findByReportingYearAndPropertyNumberAndBuildingNumber: {method: "GET", url: baseUrl + "/:reportingYear/:propertyNumber"},
            findContactsByYearAndPropertyNumberAndBuildingNumber: {
                method: "GET",
                isArray: true,
                url: baseUrl + "/realpaccontacts/:reportingYear/:propertyNumber"
            },
            excludePropertyFromRealpac: {method: 'POST', url: baseUrl + '/:year/exclude/:propertyNumber', headers: {'Content-Type': 'text/plain'}},
            includePropertyFromRealpac: {method: 'POST', url: baseUrl + '/:year/include/:propertyNumber'}
        });
    }])
    .factory('RealpacContactsService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/realpacbuilding/realpaccontacts/:profileId/:buildingSnapshotId';

        return $resource(baseUrl, {}, {
            addProfile: {method: 'POST'},
            removeProfile: {method: 'DELETE'}
        });
    }])
    .factory('BuildingConsumptionService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/buildingconsumption';

        return $resource(baseUrl, {}, {
            query: {method: 'GET', isArray: true},
            get: {method: 'GET', url: baseUrl + '/:id'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseUrl + '/:id'},
            add: {method: 'POST'},
            findByPropertyNumberAndMeterNumberAndYearAndEnergyType: {
                method: 'GET',
                url: baseUrl + "/:propertyNumber/:meterNumber/:reportingYear/:energyType"
            },
            findByPropertyNumberAndYearAndEnergyTypeAndNoMeterNumber: {
                method: 'GET',
                url: baseUrl + "/:propertyNumber/:reportingYear/:energyType"
            },
            findByBuildingSnapshotAndUpdateConsumption: {
                method: 'GET',
                url: baseUrl + "/buildingsnapshot/:buildingSnapshotId",
                isArray: true
            }
        });
    }])
    .factory('PerformanceDataVerificationService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/performance/data/verification';

        return $resource(baseUrl, {}, {
            findVerificationObjectsByLocationAndYear: {method: 'POST', url: baseUrl + '/:year', isArray: true},
            getYears: {method: 'POST', url: baseUrl + '/years', isArray: true},
            getUtilityTypes: {method: 'POST', url: baseUrl + '/utility-types', isArray: true},
            save: {method: 'POST'}
        });
    }])
    .factory('IntegratedGresbService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/gresb';

        return $resource(baseUrl, {}, {
            save: {method: 'POST'},
            update: {method: 'PUT'},
            validate: {method: "PUT", url: baseUrl + "/validate"},
            listClientPropertiesForYear: {method: 'GET', isArray: true, url: baseUrl + '/properties/owner/:owner/year/:year'},
            findByReportingYearAndPropertyNumberAndBuildingNumber: {method: 'GET', url: baseUrl + '/:reportingYear/:propertyNumber'},
            findDistinctPropertyNumbersAndMetersAndEnergyAndYearByYear: {method: 'GET', url: baseUrl + '/meters/:reportingYear', isArray: true}
        });
    }])
    .factory('UtilityConsumptionSnapshotService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/utility-consumption-snapshots';

        return $resource(baseUrl, {}, {
            save: {method: 'POST'},
            update: {method: 'PUT'},
            get: {method: 'GET', url: baseUrl + '/:id'},
            getGresbDistinctMeters: {method: 'GET', url: baseUrl + '/gresb/:year', isArray: true}
        });

    }])
    .factory('PerformanceDataSnapshotService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/performance-data-snapshot';

        return $resource(baseUrl, {}, {
            save: {method: 'POST'},
            query: {method: 'GET', isArray: true},
            update: {method: 'PUT'},
            get: {method: 'GET', url: baseUrl + '/:id'},
            validate: {method: "POST", url: baseUrl + "/validate"},
            meters: {method: "POST", url: baseUrl + "/meters/:year", isArray: true},
            create: {method: "GET", url: baseUrl + "/create/p/:property/b/:building/m/:meter/y/:year/e/:energy/m/:managed"},
            find: {method: "GET", url: baseUrl + "/p/:property/b/:building/m/:meter/y/:year/e/:energy/m/:managed"},
            delete: {method: 'DELETE', url: baseUrl + '/:id'},
            distinct: {method: 'POST', url: baseUrl + '/utilities/:year', isArray: true}
        });
    }])
    .factory('GresbBuildingService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/gresbbuilding';
        return $resource(baseUrl, {}, {
            save: {method: 'POST'},
            update: {method: 'PUT'},
            findByReportingYearAndPropertyNumberAndBuildingNumber: {method: 'GET', url: baseUrl + '/:reportingYear/:propertyNumber'},
            excludePropertyFromGresb: {method: 'POST', url: baseUrl + '/:year/exclude/:propertyNumber', headers: {'Content-Type': 'text/plain'}},
            includePropertyFromGresb: {method: 'POST', url: baseUrl + '/:year/include/:propertyNumber'}
        });
    }])
    .factory('GresbReportingService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/gresbreporting';

        return $resource(baseUrl, {}, {
            query: {method: 'GET', isArray: true},
            get: {method: 'GET', url: baseUrl + '/:id'},
            create: {method: "GET", url: baseUrl + "/create"},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseUrl + '/:id'},
            findDistinctAllReportingYears: {method: 'GET', url: baseUrl + '/years'},
            findClientsByReportingYear: {method: 'GET', url: baseUrl + '/clients/:year'},
            findWithStatus: {method: 'GET', isArray: true, url: baseUrl + "/status/:status"},
            findAllIncludeValidation: {method: 'GET', isArray: true, url: baseUrl + "/validations"},
            getReportIssues: {method: 'GET', isArray: true, url: baseUrl + "/excel/errors/:year/:owner"},
            checkGresbFile: {method: 'GET', url: baseUrl + "/excel/:year"}
        });
    }])
    .factory('PortfolioManagerAccountsService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/portfoliomanageraccounts';

        return $resource(baseUrl, {}, {
            get: {method: 'GET', url: baseUrl + '/:id'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseUrl + '/:id'}
        });
    }])
    .factory('PortfolioManagerService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/portfoliomanager';

        return $resource(baseUrl, {}, {
            getPropertiesForAccount: {method: 'GET', url: baseUrl + '/account/:accountId/property', isArray: true},
            linkProperty: {method: 'POST', url: baseUrl + '/link/property/:riskPropertyNumber/:pmAccountId/:pmPropertyNumber'},
            unlinkProperty: {method: 'POST', url: baseUrl + '/unlink/property/:riskPropertyNumber'},
            importProperty: {method: 'POST', url: baseUrl + '/account/:accountId/property/:pmPropertyId/import/:riskPropertyNumber'},
            pushProperty: {method: 'POST', url: baseUrl + '/account/:accountId/property/:riskPropertyNumber/push'},
            getUtilityMetersForProperty: {method: 'GET', url: baseUrl + '/account/:accountId/property/:pmPropertyNumber/meters', isArray: true},
            importUtilityMeter: {method: 'POST', url: baseUrl + '/account/:accountId/meters/import/:meterId/:riskPropertyNumber'},
            getUtilityMeterConsumptionData: {method: 'GET', url: baseUrl + '/account/:accountId/meters/:meterId/consumptionData/:year', isArray: true},
            getPendingPropertyShares: {method: 'GET', url: baseUrl + "/account/:accountId/share/property/pending/list", isArray: true},
            acceptOrRejectShareForProperty: {method: 'POST', url: baseUrl + '/account/:accountId/share/property/:propertyId/:action'},
            acceptOrRejectShareForAllProperties: {method: 'POST', url: baseUrl + '/account/:accountId/share/property/all/:action'},
            importUtilityMeterConsumptionData: {
                method: 'POST',
                url: baseUrl + '/account/:accountId/property/:propertyNumber/meters/:meterId/consumptionData/:year'
            }
        });
    }])
    .factory('UtilityMeterService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/utilitymeter';
        return $resource(baseUrl, {}, {
            get: {method: 'GET', url: baseUrl + '/:id'},
            create: {method: "GET", url: baseUrl + "/create"},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseUrl + '/:id'},
            findByPropertyNumber: {method: 'GET', isArray: true, url: baseUrl + "/property/:propertyNumber"},
            findByPropertyNumberAndUtility: {
                method: 'GET',
                isArray: true,
                url: baseUrl + "/property/:propertyNumber/:utility"
            },
            findByPropertyNumberWithSnapshot: {method: 'GET', isArray: true, url: baseUrl + "/property/:propertyNumber/snapshotdata"}
        });
    }])
    .factory('UtilityTargetService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/utilitytarget';
        return $resource(baseUrl, {}, {
            get: {method: 'GET', url: baseUrl + '/:id'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseUrl + '/:id'},
            findByPropertyNumber: {method: 'GET', isArray: true, url: baseUrl + "/properties/:propertyNumber"},
            findInPropertyNumbers: {method: 'PUT', isArray: true, url: baseUrl + "/properties"}
        });
    }])
    .factory('RegressionAnalysisService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/regressionanalysis';
        return $resource(baseUrl, {},{
            get: {method: 'GET', url: baseUrl + '/:id'},
            add: {method: 'POST'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseUrl + '/:id'},
            create: {method: 'GET', url: baseUrl + '/create/:propertyNumber'},
            findByPropertyNumber: {method: 'GET', isArray: true, url: baseUrl + '/property/:propertyNumber'},
            generatePeriodData: {method: 'POST', url: baseUrl + '/perioddata'}
        });
    }])
    .factory('BuildingCertificationService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/buildingcertification';
        return $resource(baseUrl, {}, {
            get: {method: 'GET', url: baseUrl + '/:id'},
            add: {method: 'POST'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseUrl + '/:id'},
            create: {method: 'GET', url: baseUrl + '/create'},
            findByPropertyNumber: {method: 'GET', isArray: true, url: baseUrl + '/property/:propertyNumber'},
            findInPropertyNumbers: {method: 'POST', isArray: true, url: baseUrl + '/properties'},
        });
    }])
    .factory('QuestionnaireGroupService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/questionnairegroups';
        return $resource(baseUrl, {}, {
            findChecklistGroups: {method: 'GET', isArray: true, url: baseUrl + '/checklists/:module'},
            getLatestQuestionnaireFromGroup: {method: 'GET', isArray: true, url: baseUrl + ':groupId/questionnaires/latest'}
        });
    }])
    .factory('ChecklistService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/checklists';
        return $resource(baseUrl, {}, {
            get: {method: 'GET', url: baseUrl + '/:id'},
            add: {method: 'POST', url: baseUrl + '/questionnairegroup/:groupId'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseUrl + '/:id'},
            findByQuestionnaireGroupId: {method: 'GET', isArray: true, url: baseUrl + "/questionnairegroup/:groupId"}
        });
    }])
    .factory('MonthlyOccupancyService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/occupancy/monthly';
        return $resource(baseUrl, {}, {
            get: {method: 'GET', url: baseUrl + '/:id'},
            add: {method: 'POST'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseUrl + '/:id'}
        });

    }])
    .factory('InsurancePolicyTermService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/insurance/policy/term';
        return $resource(baseUrl, {}, {
            get: {method: 'GET', url: baseUrl + '/:id'},
            add: {method: 'POST'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseUrl + '/:id'},
            findByInsurancePolicyId: {method: 'GET', isArray: true, url: baseUrl + '/policyid/:policyid'},
            createByPolicyId: {method: 'GET', url: baseUrl + '/create/policyid/:policyid'},
            create: {method: 'GET', url: baseUrl + '/create'}
        });
    }])
    .factory('InsurancePolicyRevisionService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/insurance/policy/revision';
        return $resource(baseUrl, {}, {
            get: {method: 'GET', url: baseUrl + '/:id'},
            add: {method: 'POST'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseUrl + '/:id'},
            findByTermId: {method: 'GET', isArray: true, url: baseUrl + '/termid/:termid'},
            findActiveRevision: {method: 'GET', url: baseUrl + '/findActiveRevision/termid/:termid'},
            createByTermId: {method: 'GET', url: baseUrl + '/create/termid/:termid'},
            create: {method: 'GET', url: baseUrl + '/create'}
        });
    }])
    .factory('InsurancePolicyCoverageService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/insurance/policy/coverage';
        return $resource(baseUrl, {}, {
            get: {method: 'GET', url: baseUrl + '/:id'},
            add: {method: 'POST'},
            update: {method: 'PUT'},
            delete: {method: 'DELETE', url: baseUrl + '/:id'},
            findByRevisionId: {method: 'GET', isArray: true, url: baseUrl + '/revisionid/:revisionid'},
            createByRevisionId: {method: 'GET', url: baseUrl + '/create/revisionid/:revisionid'},
            create: {method: 'GET', url: baseUrl + '/create'}
        });
    }])
    .factory('IntegratedInsurancePolicyService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/insurance/integratedservice';
        return $resource(baseUrl, {}, {
            add: {method: 'POST'},
            addNewPolicyRevision: {method: 'POST', url: baseUrl + '/revision'},
            updatePolicyRevision: {method: 'PUT', url: baseUrl + '/revision'}
        });
    }])
    .factory('ChecklistProgramService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + '/webapi/checklistprograms';
        return $resource(baseUrl, {}, {
            get: {method: 'GET', url: baseUrl + '/:id'},
            getByQuestionnaireId: {method: 'GET', isArray: true, url: baseUrl + '/questionnaire/:questionnaireId'},
            save: {method: 'POST', url: baseUrl + '/:questionnaireId'},
            update: {method: 'PUT'},
            create: {method: 'GET', url: baseUrl + '/create'},
            createParticipant: {method: 'POST', url: baseUrl + '/participant/create'},
            updateMultiplePrograms: {method: 'PUT', url: baseUrl + '/multipleupdate/:questionnaireId', isArray: true},
            delete: {method: 'DELETE', url: baseUrl + '/:id'}
        });
    }])
    .factory('SecuritySettingsService', ['$resource', 'contextPath', function ($resource, contextPath) {
        var baseUrl = contextPath + "/webapi/systemconfig";
        return $resource(baseUrl, {}, {
            getAll: {method: 'GET', url: baseUrl + '/security/settings'},
            set: {method: 'POST', url: baseUrl + '/:key'}
        })
    }]);
