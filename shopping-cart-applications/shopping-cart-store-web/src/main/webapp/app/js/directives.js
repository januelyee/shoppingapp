'use strict';

/* Directives */


angular.module('MyShoppingApp.directives', [])
    .factory('timepickerState', function() {
        var pickers = [];
        return {
            addPicker: function(picker) {
                pickers.push(picker);
            },
            closeAll: function() {
                for (var i=0; i<pickers.length; i++) {
                    pickers[i].close();
                }
            }
        };
    })
    .directive('timeFormat', ['$filter', 'ControllerInfoPasser', function ($filter, ControllerInfoPasser) {
        return {
            restrict : 'A',
            require : 'ngModel',
            scope : {
                showMeridian : '='
            },
            link : function(scope, element, attrs, ngModel) {
                var parseTime = function(viewValue) {

                    if (!viewValue) {
                        ngModel.$setValidity('time', true);
                        return null;
                    } else if (angular.isDate(viewValue) && !isNaN(viewValue)) {
                        ngModel.$setValidity('time', true);
                        return viewValue;
                    } else if (angular.isString(viewValue)) {
                        var timeRegex = /^(0?[0-9]|1[0-2]):[0-5][0-9] ?[a|p]m$/i;
                        if (!scope.showMeridian) {
                            timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
                        }
                        if (!timeRegex.test(viewValue)) {
                            ngModel.$setValidity('time', false);
                            return undefined;
                        } else {
                            ngModel.$setValidity('time', true);
                            var date = new Date();
                            var sp = viewValue.split(":");
                            var apm = sp[1].match(/[a|p]m/i);
                            if (apm) {
                                sp[1] = sp[1].replace(/[a|p]m/i, '');
                                if (apm[0].toLowerCase() == 'pm') {
                                    sp[0] = sp[0] + 12;
                                }
                            }
                            date.setHours(sp[0], sp[1]);
                            return date;
                        }
                    } else {
                        ngModel.$setValidity('time', false);
                        return undefined;
                    }
                };

                ngModel.$parsers.push(parseTime);

                var showTime = function(data) {
                    parseTime(data);
                    var timeFormat = (!scope.showMeridian) ? "HH:mm" : "hh:mm a";
                    return $filter('date')(data, timeFormat, ControllerInfoPasser.get('TIMEZONE_OFFSET'));
                };
                ngModel.$formatters.push(showTime);
                scope.$watch('showMeridian', function(value) {
                    var myTime = ngModel.$modelValue;
                    if (myTime) {
                        element.val(showTime(myTime));
                    }

                });
            }
        };
    }])

    .directive('timepickerPop', ['$document', 'timepickerState', function ($document, timepickerState) {
        return {
            restrict : 'E',
            transclude : false,
            scope : {
                inputTime : "=",
                showMeridian : "=",
                disabled : "=",
                name : "@"
            },
            controller: ['$scope', '$element', function ($scope, $element) {
                $scope.isOpen = false;

                $scope.disabledInt = angular.isUndefined($scope.disabled)? false : $scope.disabled;

                $scope.toggle = function() {
                    if ($scope.isOpen) {
                        $scope.close();
                    } else {
                        $scope.open();
                    }
                };
            }],
            link : function(scope, element, attrs) {
                var picker = {
                    open : function () {
                        timepickerState.closeAll();
                        scope.isOpen = true;
                    },
                    close: function () {
                        scope.isOpen = false;
                    }

                };

                timepickerState.addPicker(picker);

                scope.open = picker.open;
                scope.close = picker.close;

                scope.$watch("disabled", function(value) {
                    scope.disabledInt = angular.isUndefined(scope.disabled)? false : scope.disabled;
                });

                element.bind('click', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                });

                $document.bind('click', function(event) {
                    scope.$apply(function() {
                        scope.isOpen = false;
                    });
                });

            },
            templateUrl : 'partials/directives/timePicker.html'
        };
    }])
    .directive('appVersion', ['version', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    }])
    .directive('multisearch', function () {
        return {
            restrict: "A",
            scope: true,
            controller: ['$scope', function ($scope) {

                this.addConstraint = function (constraint) {
                    $scope.constraints.push(constraint);

                }
            }]
        }
    })
    .directive('constraint', function () {
        return {
            restrict: "E",
            require: "^multisearch", //^ means to search in parent dom element
            scope: true,
            link: function (scope, element, attrs, MultiSearchCtrl) {
                //scope.fields = ['Name', 'Address', 'City', 'Zoning Type'];
                scope.fields = [
                    {label: 'Property Number', value: 'propertyNumber'},
                    {label: 'Name', value: 'name'},
                    {label: 'Address', value: 'address'},
                    {label: 'City', value: 'city'},
                    {label: 'Province', value: 'province'},
                    {label: 'Country', value: 'country'},
                    {label: 'Manager', value: 'manager'},
                    {label: 'Postal Code', value: 'postalCode'},
                    {label: 'Type', value: 'type'},
                    {label: 'Unit', value: 'unit'}
                ];
                scope.constraintsStrings = ['Equals', 'Contains'];//, 'Less Than', 'Greater Than'];
                scope.joiners = ['AND', 'OR'];

                scope.searchField = scope.fields[0].value;
                scope.constraint = scope.constraintsStrings[0];
                scope.filter = '';
                scope.joiner = 'AND';

                if (scope.constraints.length < 1) {
                    scope.showConstraint = false;
                    scope.joiner = '';
                }
                else {
                    scope.showConstraint = true;
                }

                scope.searchQuery = {
                    searchField: scope.searchField,
                    constraint: scope.constraint,
                    filter: scope.filter,
                    joiner: scope.joiner
                };

                scope.$watch('searchField', function (newValue, oldValue) {
                    scope.searchQuery.searchField = newValue.value;
                });

                scope.$watch('constraint', function (newValue, oldValue) {
                    scope.searchQuery.constraint = newValue;
                });

                scope.$watch('filter', function (newValue, oldValue) {
                    scope.searchQuery.filter = newValue.trim();
                });

                scope.$watch('joiner', function (newValue, oldValue) {
                    scope.searchQuery.joiner = newValue.trim();
                });
                MultiSearchCtrl.addConstraint(scope.searchQuery);


            },
            template: /*'<div class="row-fluid" ng-show="showConstraint">' +
             '<select class="input-small" ng-model="joiner" ng-options="s for s in joiners"></select>' +
             '</div>' +*/
            '<div class="row" style="margin-bottom: 10px">' +
            '<div class="col-md-4"> ' +
            '<select class="form-control" ng-model="searchField" ng-options="s.label for s in fields"></select>' +
            '</div>' +
            '<div class="col-md-3">' +
            '<select class="form-control" ng-model="constraint" ng-options="s for s in constraintsStrings"></select>' +
            '</div>' +
            '<div class="col-md-4">' +
            '<input type="text" class="form-control" ng-model="filter"/>' +
            '</div>' +
            '<div class="col-md-1" ng-click="removeConstraint()" ng-show="showConstraint" style="margin-top: 10px">' +
            '<i class="icon-close" style="font-size: 20px; color: #D35E4F;"></i>' +
            '</div>' +
            '</div>'
        }

    })
    .directive('treeModel', ['$compile', '$rootScope', function ($compile, $rootScope) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                //tree id
                var treeId = attrs.treeId;

                //tree model
                var treeModel = attrs.treeModel;

                //node id
                var nodeId = attrs.nodeId || 'id';

                //node label
                var nodeLabel = attrs.nodeLabel || 'label';

                // label color
                var nodeLabelColor = attrs.nodeLabelColor || 'labelColor';

                //children
                var nodeChildren = attrs.nodeChildren || 'children';

                //icon
                var nodeIcon = attrs.nodeIcon || 'icon';

                var defaultColor = attrs.defaultNodeColor || 'i-grey';

                //tree template
                var template =
                    '<ul class="list-unstyled collapse out in" style="margin-left: -12px">' +
                    '<li data-ng-repeat="node in ' + treeModel + '">' +
                    '<i class="icon-plus i-grey" data-ng-show="node.' + nodeChildren + '.length && node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                    '<i class="icon-minus i-grey" data-ng-show="node.' + nodeChildren + '.length && !node.collapsed" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
                    '<i class="{{node.' + nodeIcon + '}} ' + defaultColor + '" data-ng-hide="node.' + nodeChildren + '.length" data-ng-click="' + treeId + '.selectNodeLabel(node);changeMenuItem(node);removeExternalMenuHighlights();"></i> ' +
                    '<span class="{{node.' + nodeLabelColor + '}}" data-ng-class="node.selected" data-ng-click="' + treeId + '.selectNodeLabel(node);changeMenuItem(node);removeExternalMenuHighlights();">{{node.' + nodeLabel + '}}</span>' +
                    '<div data-ng-hide="node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id="' + nodeId + '" data-node-label="' + nodeLabel + '" data-node-icon="' + nodeIcon + '" data-node-children="' + nodeChildren + '" data-default-node-color="' + defaultColor + '"></div>' +
                    '</li>' +
                    '</ul>';


                //check tree id, tree model
                if (treeId && treeModel) {

                    scope.$on('event:externalMenuSelected', function (event, msg) {
                        if (scope[treeId].currentNode) {
                            scope[treeId].currentNode.selected = undefined;
                            scope[treeId].currentNode.icon = scope[treeId].currentNode.icon + "i-grey";
                        }
                    });

                    scope.$on('event:treeModelMenuSelectedExternally', function (event, node) {
                        scope[treeId].selectNodeLabel(node);
                    });

                    //root node
                    if (attrs.angularTreeview) {

                        //create tree object if not exists
                        scope[treeId] = scope[treeId] || {};

                        //if node head clicks,
                        scope[treeId].selectNodeHead = scope[treeId].selectNodeHead || function (selectedNode) {

                            //Collapse or Expand
                            selectedNode.collapsed = !selectedNode.collapsed;
                        };

                        //if node label clicks,
                        scope[treeId].selectNodeLabel = scope[treeId].selectNodeLabel || function (selectedNode) {

                            //remove highlight from previous node
                            if (scope[treeId].currentNode && scope[treeId].currentNode.selected) {
                                if (selectedNode.type == "menu") {
                                    scope[treeId].currentNode.selected = undefined;
                                    scope[treeId].currentNode.icon = scope[treeId].currentNode.icon + "i-grey";
                                }

                            }

                            //set highlight to selected node
                            if (selectedNode.type == "menu") {
                                selectedNode.selected = 'selected';
                            }
                            selectedNode.icon = selectedNode.icon + " " + selectedNode.iconSelectedColor;

                            //Collapse or Expand
                            selectedNode.collapsed = !selectedNode.collapsed;

                            //set currentNode
                            if (selectedNode.type == "menu") {
                                scope[treeId].currentNode = selectedNode;
                            }

                        };
                    }

                    //Rendering template.
                    element.html('').append($compile(template)(scope));
                }
            }
        };
    }])
    .directive('autofill', ['$timeout', function ($timeout) {
        // autofill catcher (super hacky, abandon all hope ye who enter here --np)
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, elem, attrs) {
                var ownInput = false;

                // trigger an input 500ms after loading the page (fixes chrome and safari autofill)
                $timeout(function () {
                    $(elem[0]).trigger('input');
                }, 500);

                // listen for pertinent events to trigger input on form element
                // use timeout to ensure val is populated before triggering 'input'
                // ** 'change' event fires for Chrome
                // ** 'DOMAttrModified' fires for Firefox 22.0
                // ** 'keydown' for Safari  6.0.1
                // ** 'propertychange' for IE
                elem.on('change DOMAttrModified keydown propertychange', function () {
                    $timeout(function () {
                        $(elem[0]).trigger('input');
                    }, 0);
                });

                // tell other inputs to trigger (fixes firefox and ie9+ autofill)
                elem.on('input', function () {
                    if (ownInput === false) {
                        scope.$emit('loginform.input');
                    }
                });

                // catches event and triggers if another input fired it.
                scope.$on('loginform.input', function (e) {
                    e.stopPropagation();
                    ownInput = true;
                    $(elem[0]).trigger('input');
                    ownInput = false;
                });
            }
        }
    }])
    .directive('passwordCheck', [function () {
        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, ctrl) {
                var firstPassword = '#' + attrs.passwordCheck;
                elem.add(firstPassword).on('keyup', function () {
                    scope.$apply(function () {
                        var v = elem.val() === $(firstPassword).val();
                        ctrl.$setValidity('pwmatch', v);
                    });
                });
            }
        }
    }])
    .directive('loadingSpinner', function () {
        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            scope: {
                loading: '=loadingSpinner'
            },
            link: function (scope, element, attrs) {
                var spinner = new Spinner({width: 2}).spin();
                var container = element.find('.loading-spinner-container')[0];
                container.appendChild(spinner.el);
            },
            template: '<div>' +
            '<div ng-show="loading" style="margin-top: 20px; margin-bottom: 20px" class="row loading-spinner-container col-xs-offset-6"></div>' +
            '<div ng-hide="loading" ng-transclude></div>' +
            '</div>'
        };
    })
    .directive('popoverPicker', ['$filter', function ($filter) {
        return {
            restrict: 'A',
            transclude: true,
            scope: {
                data: '=popoverData', // The array that holds the list of objects to select from
                position: '@popoverPosition', // The placement of the popup
                selecting: '@popoverSelecting', // The label of what the user is selecting, ex. Properties, Users
                selectedData: '=popoverSelectedData', // The array/object which will hold the selected object(s) in the data list
                selectedDataParam: '@popoverSelectedDataParam', // If defined, this property of the data object will be written to the selectedData.
                label: '@popoverDataLabel', // The attribute of the object to display in the selection list. Leave blank if not an array of objects
                single: '=?popoverSingleSelect', // Whether this popup should allow single select instead of multi select. Defaults to false
                disabled: '=popoverDisabled', // Whether this popup should be disabled, defaults to false
                onChangeFunction: '&popoverOnchange', // Call this function when the selection changes
                container: '&popoverContainer', // The container where the popover will be placed
                emptyEntryLabel: '@popoverEmptyEntryLabel', // What to display if the entry's label has a length of 0
                listStyle: '@popoverListStyle', // Can be 'summary' or 'full' to indicate if the full list of labels or summary should be used
                labelPrefix: '@popoverDataLabelPrefix', // The attribute to prefix the label with which will be in brackets
                filterByFields: '=?popoverAddFilterByFields' // The field to be used when filtering; all fields will be used if this is empty.
            },
            link: function (scope, ignoreElement, attrs) {

                var wildcardFilter = "$";
                scope.popupFilter = {};
                scope.filterFields = [{
                    label: scope.selecting,
                    fieldName: wildcardFilter
                }];

                var initialFilterFieldIndex = 0;
                scope.popupFilter[scope.filterFields[initialFilterFieldIndex].fieldName] = "";

                if (!attrs.popoverSingleSelect)  // Default to false
                {
                    attrs.popoverSingleSelect = false;
                }

                if (!attrs.popoverContainer) {
                    var defaultContainer = "body";
                    attrs.popoverContainer = defaultContainer;
                    scope.container = defaultContainer;

                } else {
                    scope.container = attrs.popoverContainer;
                }

                if (!attrs.emptyEntryLabel) {
                    attrs.emptyEntryLabel = "";
                }

                if (!attrs.listStyle) { // default is not specified
                    attrs.listStyle = 'full';

                } else {
                    attrs.listStyle = attrs.listStyle.toLowerCase();
                }

                if (angular.isDefined(scope.filterByFields) && angular.isArray(scope.filterByFields)) {
                    for (var x = 0; x < scope.filterByFields.length; x++) {
                        var fieldObject = scope.filterByFields[x];
                        if (fieldObject.hasOwnProperty("label") && fieldObject.hasOwnProperty("fieldName")) {
                            scope.filterFields.push(fieldObject);
                        }
                    }
                }

                if (angular.isUndefined(scope.single) || scope.single !== true) {
                    scope.single = false;
                }

                scope.currentPage = 0;
                scope.pageSize = 10;
                scope.isInside = false;


                scope.addOrRemoveToSelected = function (item) {

                    if (scope.single == true) {
                        scope.selectedData.pop();

                        if (angular.isObject(item)) {
                            if (angular.isDefined(scope.selectedDataParam)) {
                                scope.selectedData.push(item[scope.selectedDataParam]);
                            } else {
                                scope.selectedData.push(item);
                            }
                        } else {
                            scope.selectedData.push(item);
                        }

                    } else {

                        var index;

                        if (angular.isObject(item)) {
                            if (angular.isDefined(scope.selectedDataParam)) {
                                index = scope.selectedData.indexOf(item[scope.selectedDataParam]);
                            } else {
                                index = scope.selectedData.indexOf(item);
                            }
                        } else {
                            index = scope.selectedData.indexOf(item);
                        }

                        if (index > -1) {
                            scope.selectedData.splice(index, 1);
                        } else {
                            if (angular.isObject(item)) {
                                if (angular.isDefined(scope.selectedDataParam)) {
                                    scope.selectedData.push(item[scope.selectedDataParam]);
                                } else {
                                    scope.selectedData.push(item);
                                }
                            } else {
                                scope.selectedData.push(item);
                            }
                        }
                    }
                    scope.onChangeFunction();
                };
                scope.isSelected = function (item) {

                    var x;

                    if (angular.isObject(item)) {
                        if (angular.isDefined(scope.selectedDataParam)) {
                            x = scope.selectedData.indexOf(item[scope.selectedDataParam]);
                        } else {
                            x = scope.selectedData.indexOf(item);
                        }
                    } else {
                        x = scope.selectedData.indexOf(item);
                    }

                    if (x > -1) {
                        return 'circle-list-filled';
                    } else {
                        return 'circle-list-outline';
                    }

                };

                scope.unselectAll = function () {
                    scope.selectedData.length = 0;
                    scope.onChangeFunction();
                };

                var filterData = function () {
                    // Programmatically apply filter to PropertyDTOs, then return new array with just those propertyNumbers
                    scope.selectedData.length = 0;
                    return $filter("filter")(scope.data, scope.popupFilter).map(function (filteredData) {

                        if (angular.isObject(filteredData)) {
                            if (angular.isDefined(scope.selectedDataParam)) {
                                scope.selectedData.push(filteredData[scope.selectedDataParam]);
                            } else {
                                scope.selectedData.push(filteredData);
                            }
                        } else {
                            scope.selectedData.push(filteredData);
                        }

                    });
                };

                scope.selectAll = function () {
                    filterData();
                    scope.onChangeFunction();
                };

                scope.getLabel = function (item) {
                    if (angular.isDefined(scope.label)) {
                        if (angular.isObject(item)) {
                            return item[scope.label];
                        } else {
                            var matchingObj = $.grep(scope.data, function (elm) {
                                return elm[scope.selectedDataParam] === item;
                            })[0];

                            return matchingObj[scope.label];
                        }
                    } else {
                        return item;
                    }
                };

                scope.nextPage = function (filtered) {
                    if (scope.currentPage >= filtered.length / scope.pageSize - 1) {
                        return;
                    }
                    scope.currentPage += 1;
                };

                scope.previousPage = function () {
                    if (scope.currentPage == 0) {
                        return;
                    }
                    scope.currentPage -= 1;
                };

                scope.resetPage = function () {
                    scope.currentPage = 0;
                };

                scope.getLabelPrefix = function (item) {
                    if (angular.isDefined(scope.labelPrefix)) {
                        var prefix = item[scope.labelPrefix];

                        if (prefix.length > 0) {
                            return '(' + prefix + ')';
                        }
                    }

                    return '';
                };

                $(document).on('mouseup', function (e) {
                    var list = $("#pickerButton, #pickerBody");
                    if (!list.is(e.target) && list.has(e.target).length === 0) {
                        var popover = angular.element("#pickerBody").scope();
                        if (popover) { // variable only defined when popover is shown
                            popover.$hide();
                            scope.$apply();
                        }
                    }
                });
            },
            template: '<button id="pickerButton" style="width: 100%;" class="btn" rel="popover" data-template="partials/popoverContent.html" data-placement="{{ position }}" data-html="true" data-container="{{container}}" ng-disabled="disabled" ng-switch on="listStyle" bs-popover>' +
                        '<span style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" class="text-center" ng-switch-when="summary">' +
                            '<span>' +
                                '<span ng-if="selectedData.length == 0">None Selected</span> ' +
                                '<span ng-if="selectedData.length == 1">{{getLabel(selectedData[0])}}</span> ' +
                                '<span ng-if="selectedData.length > 1 && selectedData.length != data.length">{{selectedData.length}} of {{data.length}} Selected</span> ' +
                                '<span ng-if="selectedData.length > 1 && selectedData.length == data.length">All Selected</span> ' +
                            '</span>' +
                        '</span>' +
                        '<span style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" class="col-md-11 text-center" ng-switch-default>' +
                            '<span>' +
            '<span ng-repeat="item in selectedData">' +
            '                       <span ng-show="$index != 0">, </span>' +
            '<span ng-show="getLabel(item).length === 0">{{getLabelPrefix(item)}}</span><span>{{getLabel(item)}}</span>' +
            '                   </span>' +
                            '</span>' +
                        '</span>' +
                        '<i class="icon-menu pull-right"></i>' +
                      ' </button>'
        };
    }])
    .directive('riskPagination', function () {
        return {
            restrict: 'A',
            scope: {
                currentPage: '=currentPage',
                itemsPerPage: '=itemsPerPage',
                items: '=items'
            },
            link: function (scope, element, attrs) {
                var lastPage;
                scope.next = function () {
                    if (scope.currentPage >= getLastPage()) {
                        return;
                    }
                    scope.currentPage += 1;
                };

                scope.previous = function () {
                    if (scope.currentPage == 0) {
                        return;
                    }
                    scope.currentPage -= 1;
                };

                scope.last = function () {
                    scope.currentPage = getLastPage();

                    if (scope.currentPage < 0) {
                        scope.currentPage = 0;
                    }
                };

                scope.first = function () {
                    scope.currentPage = 0;
                };

                var getLastPage = function () {
                    var division = scope.items.length / scope.itemsPerPage;

                    if (division > 0 && (division % 1) === 0) {
                        // Means this is a while number and need to minus 1 from number
                        lastPage = division - 1;
                    } else {
                        lastPage = Math.floor(division);
                    }

                    return lastPage;
                };

                scope.$on('event:resetPaginationDirective', function () {
                    scope.first();
                });
            },
            template: '<i ng-click="first()" class="icon-first pointer" style="margin-right: 10px"></i>' +
            '<i ng-click="previous()" class="icon-previous pointer" style="margin-right: 10px"></i>' +
            '<strong>Page {{currentPage+1}} of {{items.length / itemsPerPage | paginationNumber}}</strong>' +
            '<i ng-click="next()" class="icon-next pointer" style="margin-left: 10px"></i>' +
            '<i ng-click="last()" class="icon-last pointer" style="margin-left: 10px"></i>'
        }
    })
    .directive('bs3Popover', function () {
        // Use this for a basic bs popover, angular-strap causes page jumping in IE 9+ as of 2.0
        return function (scope, element, attrs) {
            element.find("div[rel=popover]").popover({placement: 'top', trigger: 'hover', container: 'body'});
            element.find("span[rel=popover]").popover({placement: 'top', trigger: 'hover', container: 'body'});
            element.find("i[rel=popover]").popover({placement: 'top', trigger: 'hover', container: 'body'});
        };
    })
    .directive('autoFocus', ['$timeout', '$parse', function ($timeout, $parse) {
        return {
            //scope: true,   // optionally create a child scope
            link: function (scope, element, attrs) {
                var model = $parse(attrs.autoFocus);
                scope.$watch(model, function (value) {
                    if (value === true) {
                        $timeout(function () {
                            element[0].focus();
                        });
                    }
                });
                // et attribute value to 'false'
                // on blur event:
                /*element.bind('blur', function () {
                    scope.$apply(model.assign(scope, false));
                });*/
            }
        };
    }])
    .directive('propertyComponentSelector', ['SelectedProperty', 'ControllerInfoPasser', function (SelectedProperty, ControllerInfoPasser) {
        return {
            restrict: 'A',
            scope: {
                isDisabled: '@',
                disableFloors: '@',
                disableRooms: '@'
            },
            link: function (scope, element, attrs) {
                // Default isDisabled to false
                if (angular.isUndefined(attrs.isDisabled)) {
                    scope.isDisabled = false;
                } else {
                    scope.isDisabled = ( (String(attrs.isDisabled).toLowerCase() == "true") );
                }


                // Default disableFloors to false
                if (angular.isUndefined(attrs.disableFloors)) {
                    scope.disableFloors = false;
                } else {
                    scope.disableFloors = ( (String(attrs.disableFloors).toLowerCase() == "true") );
                }

                // Default disableRooms to false
                if (angular.isUndefined(attrs.disableRooms)) {
                    scope.disableRooms = false;
                } else {
                    scope.disableRooms = ( (String(attrs.disableRooms).toLowerCase() == "true") );
                }

                scope.buildings = [{name: 'Property'}, {name: 'All Buildings'}];
                scope.floors = [{name: '-------------'}, {name: 'All Floors'}];
                scope.rooms = [{name: '-------------'}, {name: 'All Rooms'}];

                var refreshComponents = function () {
                    scope.property = SelectedProperty.getSelectedProperty();
                    scope.building = scope.buildings[0];
                    scope.floor = undefined;
                    scope.room = undefined;

                    scope.buildings.splice(2, scope.buildings.length - 1);
                    scope.floors.splice(2, scope.floors.length - 1);
                    scope.rooms.splice(2, scope.rooms.length - 1);

                    if (angular.isDefined(scope.property)) {
                        angular.forEach(scope.property.buildingList, function (building, index) {
                            scope.buildings.push(building);
                        });
                    }
                };

                scope.selectBuilding = function (building) {
                    scope.building = building;
                    scope.floors.splice(2, scope.floors.length - 1);
                    scope.rooms.splice(2, scope.rooms.length - 1);
                    scope.floor = scope.floors[0];
                    scope.room = undefined;
                    angular.forEach(scope.building.floorList, function (floor, index) {
                        scope.floors.push(floor);
                    });
                    ControllerInfoPasser.broadcast("event:buildingComponentSelected", scope.building);
                    ControllerInfoPasser.broadcast("event:propertyComponentChange");
                };

                scope.selectFloor = function (floor) {
                    scope.floor = floor;
                    scope.rooms.splice(2, scope.rooms.length - 1);
                    scope.room = scope.rooms[0];
                    angular.forEach(floor.roomList, function (room, index) {
                        scope.rooms.push(room);
                    });
                    ControllerInfoPasser.broadcast("event:floorComponentSelected", scope.floor);
                    ControllerInfoPasser.broadcast("event:propertyComponentChange");
                };

                scope.selectRoom = function (room) {
                    if (scope.isDefined(room)) {
                        scope.room = room;
                    }

                    ControllerInfoPasser.broadcast("event:roomComponentSelected", scope.room);
                    ControllerInfoPasser.broadcast("event:propertyComponentChange");
                };

                scope.isDefined = function (component) {
                    if (angular.isDefined(component)) {
                        return component.hasOwnProperty('buildingList')
                            || component.hasOwnProperty('floorList')
                            || component.hasOwnProperty('roomList');
                    } else {
                        return false;
                    }
                };

                scope.$on('event:propertyChanged', function () {
                    scope.property = SelectedProperty.getSelectedProperty();
                    refreshComponents();
                });

                refreshComponents();
            },
            template: '<div class="col-md-12">' +
            '<div class="col-md-4">' +
            '<select ng-disabled="{{ isDisabled }}" class="form-control input-sm" name="buildingSelect" ng-model="building" ng-change="selectBuilding(building)" ng-options="(b.buildingNumber + \'&nbsp;\' + b.name) for b in buildings"></select>' +
            '</div>' +
            '<div class="col-md-4">' +
            '<select ng-disabled="{{ isDisabled }}" ng-if="isDefined(building) && !disableFloors" class="form-control input-sm" name="floorSelect" ng-model="floor" ng-change="selectFloor(floor)" ng-options="f.name for f in floors"></select>' +
            '</div>' +
            '<div class="col-md-4">' +
            '<select ng-disabled="{{ isDisabled }}" ng-if="isDefined(floor) && !disableRooms" class="form-control input-sm" name="roomSelect" ng-model="room" ng-change="selectRoom(room)" ng-options="(r.name + \'&nbsp;\' + r.tenant) for r in rooms"></select>' +
            '</div>' +
            '</div>'
        }
    }])
    .directive('riskCarousel', ['ControllerInfoPasser', function (ControllerInfoPasser) {
        return {
            restrict: 'EA',
            link: function (scope, element, attrs) {

                scope.i = 0;

                if (angular.isDefined(attrs.field)) {
                    scope.field = scope.values[scope.i][attrs.field];
                } else {
                    scope.field = scope.values[scope.i];
                }

                scope.broadcastAndUpdate = function () {
                    if (angular.isDefined(attrs.field)) {
                        scope.field = scope.values[scope.i][attrs.field];
                    } else {
                        scope.field = scope.values[scope.i];
                    }
                    ControllerInfoPasser.broadcast("event:riskCarouselChanged", scope.values[scope.i]);
                };

                scope.next = function () {
                    scope.i++;
                    if (scope.i >= scope.values.length) {
                        scope.i = 0;
                    }
                    scope.broadcastAndUpdate();
                };

                scope.prev = function () {
                    scope.i--;
                    if (scope.i < 0) {
                        scope.i = scope.values.length - 1;
                    }
                    scope.broadcastAndUpdate();
                };
            },
            scope: {
                values: '='
            },
            template: '<div class="col-md-6 col-md-offset-3 carousel slide">' +
            '    <div>' +
            '        <div class="item text-center"><h4>{{ field }}</h4></div>' +
            '    </div>' +
            '   <a class="left carousel-control pointer" ng-click="prev()" style="background-image: none;color: darkgray">' +
            '       <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>' +
            '   </a>' +
            '   <a class="right carousel-control pointer" ng-click="next()" style="background-image: none;color: darkgray">' +
            '       <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>' +
            '   </a>' +
            '</div>'
        };
    }])
    .directive('onLastRepeat', function () {
        return {
            scope: {
                stringToEmitOnLast: '@'
            },
            restrict: 'A',
            link: function (scope, element, attrs) {
                if (scope.$parent.$last) {
                    var stringToEmit = 'event:onRepeatLast';
                    if (angular.isDefined(attrs.stringToEmitOnLast)) {
                        // Default to false
                        stringToEmit = scope.stringToEmitOnLast;
                    }

                    setTimeout(function () {
                        scope.$emit(stringToEmit, element, attrs);
                    }, 1);
                }
            }
        };
    })
    .directive('riskFileAttachments', ['$window', 'ControllerInfoPasser', 'Upload', 'contextPath', 'SharePointService',
        'SelectedProperty', '$timeout', function ($window, ControllerInfoPasser, Upload, contextPath, SharePointService,
                                                  SelectedProperty) {

        return {
            scope: {
                panelTitle: '@',
                attachments: '=',  // The array of attachment objects
                isViewOnly: '@',   // Whether the user can add attachments or just view a list
                uniqueId: '@',     // Optional, useful if used more than once on a single page
                onAttach: '&',     // Optional function to call when an attachment is added
                onRemove: '&',     // Optional function to call when an attachment is removed
                displayAs: '@',     // Display as a 'button' or 'panel', defaults to panel
                systemMaxSizeMb: '=?',
                singleAttachmentOnly: '@',
                attachmentProgressReturn: '=?',
                onAttachmentProgress: '&', // Optional function to call when attachment upload is in progress
                warningMessageReturn: '=?',
                errorMessageReturn: '=?',
                onAttachmentProcessBegin: '&', // Optional function to call when attachment process starts
                onAttachmentProcessFinish: '&', // Optional function to call when attachment process ends
                onAttachmentWarning: '&',
                onAttachmentError: '&',
                disableSharepoint: '@' // Option setting to always use local attachments regardless if sharepoint is enabled
            },
            restrict: 'A',
            template: '<div ng-include="attachmentPanelPartial" ng-show="displayAs === \'panel\'"></div> \
                        <div ng-include="attachmentButtonPartial" ng-hide="displayAs === \'panel\'"></div> \
                        <div ng-include="sharepointModalPartial"></div>',
            link: function (scope, element, attrs) {
                scope.attachmentPanelPartial = 'partials/localAttachments.html';
                scope.attachmentButtonPartial = 'partials/directives/attachmentsDirective.html';
                scope.sharepointModalPartial = 'partials/SharePointModal.html';

                scope.attachmentAlerts = [];

                var UNLIMITED_SYSTEM_FILE_UPLOAD_MAX_SIZE = -1;
                var BYTES_PER_MEGABYTE = 1024 * 1024;

                var panel = 'panel';
                var button = 'button';
                var systemMaxSizeMB = angular.copy(UNLIMITED_SYSTEM_FILE_UPLOAD_MAX_SIZE);

                if (angular.isUndefined(attrs.isViewOnly)) {
                    // Default to false
                    attrs.isViewOnly = false;
                } else {
                    scope.isViewOnly = attrs.isViewOnly.toLowerCase() === 'true'
                }

                if (angular.isUndefined(attrs.uniqueId)) {
                    // Default to empty string
                    attrs.uniqueId = '';
                }

                if (angular.isUndefined(attrs.singleAttachmentOnly)) {
                    // Default to false
                    attrs.singleAttachmentOnly = false;
                } else {
                    scope.singleAttachmentOnly = attrs.singleAttachmentOnly.toLowerCase() === 'true'
                }

                if (angular.isUndefined(scope.attachments)) {
                    scope.attachments = [];
                }

                if (angular.isUndefined(attrs.displayAs)) {
                    attrs.displayAs = 'panel';
                } else {
                    if (attrs.displayAs.toLowerCase() !== panel && attrs.displayAs.toLowerCase() !== button) {
                        attrs.displayAs = 'panel';
                    }
                }

                if (angular.isUndefined(attrs.panelTitle)) {
                    attrs.panelTitle = 'Attachments';
                }

                if (angular.isUndefined(attrs.disableSharepoint)) {
                    // Default to false
                    attrs.disableSharepoint = false;
                } else {
                    scope.disableSharepoint = attrs.disableSharepoint.toLowerCase() === 'true'
                }

                if (scope.disableSharepoint) {
                    scope.isSharePointEnabled = false;
                    scope.sharepointVersion = NaN;
                } else {
                    scope.isSharePointEnabled = ControllerInfoPasser.get('isSharePointEnabled');
                    scope.sharepointVersion = ControllerInfoPasser.get('sharepointVersion');
                }

                scope.openFileDialog = function () {
                    $('#attachments-' + scope.uniqueId).trigger('click');
                };

                var isCallbackFunctionValid = function (callbackFunction) {
                    return (angular.isDefined(callbackFunction) && angular.isFunction(callbackFunction));
                };

                var isUploadedHelpFileSizeAllowable = function (fileSize) {
                    if (angular.isDefined(scope.systemMaxSizeMb)) {
                        systemMaxSizeMB = scope.systemMaxSizeMb;

                    } else {
                        systemMaxSizeMB = angular.copy(UNLIMITED_SYSTEM_FILE_UPLOAD_MAX_SIZE);

                    }

                    if (angular.isDefined(systemMaxSizeMB)) {
                        if (systemMaxSizeMB == -1) {
                            return true;
                        }

                        var maxSize = BYTES_PER_MEGABYTE * systemMaxSizeMB;
                        if (fileSize <= maxSize) {
                            return true;
                        }
                    }

                    return false;
                };

                var invokeAllowableHelpFileSizeExceededWarning = function (fileName) {
                    scope.warningMessageReturn = fileName + " is too big to upload; only files up to "
                        + systemMaxSizeMB + " MB can be uploaded...";

                    scope.$apply();
                    if (isCallbackFunctionValid(scope.onAttachmentWarning)) {
                        scope.onAttachmentWarning();
                    }
                };

                var invokeAttachmentProcessError = function (errorMessage) {
                    scope.errorMessageReturn = angular.copy(errorMessage);
                    scope.$apply();
                    if (isCallbackFunctionValid(scope.onAttachmentError)) {
                        scope.onAttachmentError();
                    }
                };

                var detectIE = function () {
                    var ua = window.navigator.userAgent;
                    var msie = ua.indexOf('MSIE ');
                    var trident = ua.indexOf('Trident/');

                    if (msie > 0) {
                        // IE 10 or older => return version number
                        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
                    }

                    if (trident > 0) {
                        // IE 11 (or newer) => return version number
                        var rv = ua.indexOf('rv:');
                        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
                    }

                    // other browser
                    return false;
                };

                var invokeUploadStartListener = function () {
                    if (isCallbackFunctionValid(scope.onAttachmentProcessBegin)) {
                        scope.onAttachmentProcessBegin();
                    }
                };

                var invokeUploadFinishListener = function () {
                    if (isCallbackFunctionValid(scope.onAttachmentProcessFinish)) {
                        scope.onAttachmentProcessFinish();
                    }
                };

                var invokeAttachmentProgressListener = function (evt) {
                    scope.attachmentProgressReturn = evt.loaded / evt.total * 100;
                    scope.$apply();
                    if (isCallbackFunctionValid(scope.onAttachmentProgress)) {
                        scope.onAttachmentProgress();
                    }
                };

                scope.attachLocalFile = function (files) {
                    // files: an array of files selected, each file has name, size, and type.
                    if (detectIE() !== false && detectIE() < 10) {
                        attachFileForIE9(files);
                    } else {
                        attachFileForNonIE9(files);
                    }

                };

                var attachFileForIE9 = function (files) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        if (isUploadedHelpFileSizeAllowable(file.size)) {

                            if (i == 0) {
                                invokeUploadStartListener();
                            }

                            file.upload = Upload.upload({
                                url: contextPath + '/webapi/upload/base64Encode', //upload.php script, node.js route, or servlet url
                                method: 'POST',
                                file: file

                            }).progress(function (evt) {
                                invokeAttachmentProgressListener(evt);

                            }).success(function (data) {
                                // file is uploaded successfully
                                invokeUploadFinishListener();

                                var mimeType = file.type;
                                if (mimeType.length == 0) {
                                    mimeType = 'administration/octet-stream';
                                }

                                var attachment = {
                                    fileName: file.name,
                                    data: data,
                                    mimeType: mimeType
                                };

                                if (scope.singleAttachmentOnly) {
                                    scope.attachments.length = 0;
                                }

                                scope.attachments.push(attachment);

                                scope.onAttach();

                            }).error(function (response) {
                                invokeAttachmentProcessError("Error status code received: " + response.status);
                                invokeUploadFinishListener();

                            });
                        } else {
                            invokeAllowableHelpFileSizeExceededWarning(file.name);

                        }

                    }
                };

                var attachFileForNonIE9 = function (files) {

                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        if (isUploadedHelpFileSizeAllowable(file.size)) {
                            if (i == 0) {
                                invokeUploadStartListener();
                            }

                            FileAPI.readAsBinaryString(file, function (evt) {
                                if (evt.type == 'load') {
                                    // Success
                                    invokeUploadFinishListener();
                                    var binaryString = evt.result;
                                    var base64String = $window.btoa(binaryString);
                                    var mimeType = file.type;

                                    if (mimeType.length == 0) {
                                        mimeType = 'administration/octet-stream';
                                    }

                                    var attachment = {
                                        fileName: files[0].name,
                                        data: base64String,
                                        mimeType: mimeType
                                    };

                                    if (scope.singleAttachmentOnly) {
                                        scope.attachments.length = 0;
                                    }

                                    scope.attachments.push(attachment);

                                    if (angular.isDefined(scope.onAttach) && angular.isFunction(scope.onAttach)) {
                                        scope.onAttach();
                                    }
                                    scope.$apply();

                                } else {
                                    if (evt.type == 'progress') {
                                        invokeAttachmentProgressListener(evt);

                                    } else {
                                        //Error
                                        invokeAttachmentProcessError("An error occurred, file " + file.name + " may be corrupted...");
                                        invokeUploadFinishListener();
                                    }
                                }
                            });

                        } else {
                            invokeAllowableHelpFileSizeExceededWarning(file.name);
                        }

                    }
                };

                scope.removeAttachment = function (index) {
                    scope.attachments.splice(index, 1);
                    if (angular.isDefined(scope.onRemove) && angular.isFunction(scope.onRemove)) {
                        scope.onRemove();
                    }
                };

                scope.downloadLocalAttachment = function (attachment) {
                    ControllerInfoPasser.broadcast('event:localAttachmentOpen', attachment);
                };

                scope.downloadSharePointFile = function (url, fileName) {
                    if (detectIE()) { // IE doesn't like opening with _blank, it will open a new tab/window but the prompt to download the file will be in the original tab/window
                        scope.openInNewWindow('POST', contextPath + '/webapi/sharepoint/downloadFile', {
                            url: url,
                            fileName: fileName
                        });
                    } else {
                        scope.openInNewWindow('POST', contextPath + '/webapi/sharepoint/downloadFile', {
                            url: url,
                            fileName: fileName
                        }, '_blank');
                    }
                };

                scope.openInNewWindow = function (verb, url, data, target) { // Useful for POSTing to a new window, ex: opening a sharepoint doc in a new window/tab
                    if (detectIE()) {
                        target = '_blank';
                    }

                    var form = document.createElement("form");
                    form.action = url;
                    form.method = verb;
                    form.target = target || "_self";
                    if (angular.isDefined(data)) {
                        for (var key in data) {
                            var input = document.createElement("textarea");
                            input.name = key;
                            input.value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
                            form.appendChild(input);
                        }
                    }
                    form.style.display = 'none';
                    document.body.appendChild(form);
                    form.submit();
                };

                var propertyNumber;
                scope.documentList = [];
                scope.pageSize = 15;
                scope.currentPage = 0;
                scope.alerts = [];


                scope.getDocumentList = function () {
                    var property = SelectedProperty.getSelectedProperty();

                    if (propertyNumber == property.propertyNumber) {
                        return;
                    } else {
                        propertyNumber = property.propertyNumber;
                    }

                    scope.callService();
                };

                scope.callService = function (autoSelectFileName) {
                    scope.documentList.length = 0;
                    scope.currentPage = 0;
                    scope.loading = true;
                    scope.errorCode = 0;
                    scope.errorMsg = undefined;

                    SharePointService.findDocumentsByPropertyNumber({propertyNumber: propertyNumber}, function (data, headers) {
                        scope.documentList = data;

                        if (angular.isDefined(autoSelectFileName)) {

                            for (var i = 0; i < scope.documentList.length; i++) {
                                if (scope.documentList[i].Name === autoSelectFileName) {
                                    scope.pushSPDocument(scope.documentList[i]);
                                    $('#sharePointModal').modal('hide');
                                    break;
                                }
                            }
                        }

                        scope.loading = false;
                    }, function (httpResponse) {
                        scope.loading = false;
                        scope.errorCode = httpResponse.status;
                        switch (httpResponse.status) {
                            case 401:
                                scope.errorMsg = "Your credentials are not authorized to access the Share Point server";
                                break;
                            case 404:
                                scope.errorMsg = "Documents were not found for this property!";
                                break;
                            case 408:
                                scope.errorMsg = "The Share Point server was not found!";
                                break;
                            default:
                                scope.errorMsg = "An error has occurred while trying to retrieve the Share Point documents!";
                                break;
                        }
                    });
                };

                scope.nextPage = function () {
                    if (scope.currentPage >= scope.documentList.length / scope.pageSize - 1) {
                        return;
                    }
                    scope.currentPage += 1;
                };

                scope.previousPage = function () {
                    if (scope.currentPage == 0) {
                        return;
                    }
                    scope.currentPage -= 1;
                };

                scope.showPreview = function (document) {
                    document.showPreview = !document.showPreview
                };

                scope.openPreview = function (document) {
                    var sharepointLink = angular.isDefined(document.__metadata.media_src) ? document.__metadata.media_src : document.__metadata.uri;
                    scope.downloadSharePointFile(sharepointLink, document.Name);
                };

                scope.pushSPDocument = function (document) {
                    var attachment = {
                        fileName: document.Name,
                        // Sharepoint 2010 media_src, sharepoint 2013 uri
                        sharepointLink: angular.isDefined(document.__metadata.media_src) ? document.__metadata.media_src : document.__metadata.uri
                    };

                    var isAttachmentExisting = scope.attachments.filter(function (entry) {
                        return entry.fileName === attachment.fileName;
                    });

                    if (isAttachmentExisting.length == 0) {
                        scope.attachments.push(attachment);
                    }

                    $('#sharePointModal').modal('hide')
                };

                scope.uploadToSharepoint = function ($files) {
                    if ($files.length == 0) {
                        return;
                    }
                    var property = SelectedProperty.getSelectedProperty();
                    scope.errorCode = 0;
                    scope.errorMsg = undefined;

                    scope.loading = true;
                    for (var i = 0; i < $files.length; i++) {
                        var uploadData = {
                            url: contextPath + '/webapi/sharepoint/' + property.propertyNumber,
                            method: 'POST',
                            file: $files[i]
                        };
                        Upload.upload(uploadData).progress(function (evt) {
                            //// console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                        }).success(function (data, status, headers, config) {
                            scope.callService(uploadData.file.name);
                        }).error(function (data, status, headers, config) {
                            scope.loading = false;
                            scope.errorCode = status;

                            switch (status) {
                                case 400:
                                    scope.errorMsg = 'A file named \'' + uploadData.file.name + '\' already exists on this property';
                                    break;
                                default:
                                    scope.errorMsg = 'An error has occurred while trying to upload the document to Sharepoint!';
                            }
                        });
                    }
                }
            }
        }
    }])
    .directive('filterInput', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {},
            template: '<div class="left-inner-addon"><i class="icon-filter"></i><input class="form-control" placeholder="Filter"></div>',
            link: function (scope, element, attrs, ngModelCtrl) {
                // The input element in the above template
                var input = element.find(':input');

                // Specify how UI should be updated
                ngModelCtrl.$render = function () {
                    input.val(ngModelCtrl.$viewValue);
                };

                // Listen for change events to enable binding
                input.bind('blur keyup change', function () {
                    scope.$apply(read);
                });

                // Write data to the model
                function read() {
                    ngModelCtrl.$setViewValue(input.val());
                }

                read(); // initialize
            }
        };
    })
    .directive('complianceButton', ['ControllerInfoPasser', 'SelectedProperty', 'ComplianceService', '$uibModal', function (ControllerInfoPasser, SelectedProperty, ComplianceService, $modal) {
        return {
            restrict: 'A',
            scope: {
                complianceModule: '@complianceModule',
                complianceName: '@complianceName',
                iconColor: '@iconColor',
                complianceEnabled: '@complianceEnabled'
            },
            link: function (scope, element, attrs) {
                scope.openComplianceDocument = function () {
                    var currentProperty = SelectedProperty.getSelectedProperty();
                    if (angular.isDefined(currentProperty)) {
                        ComplianceService.findActiveRevision({
                            module: scope.complianceModule,
                            country: currentProperty.country,
                            territory: currentProperty.province,
                            category: scope.complianceName
                        }, function (data, headers) {

                            if (angular.isDefined(data)) {
                                scope.complianceRecord = data;

                                $('#complianceDirectiveModal').modal('show');
                            } else {
                                ControllerInfoPasser.broadcast("event:directiveAlert", {
                                    message: "No regulatory compliance revision available for " + scope.complianceName + " in province/state " + currentProperty.province + ", and country " + currentProperty.country,
                                    type: "info"
                                });
                            }
                        }, function (httpResponse) {
                            // On Error
                            ControllerInfoPasser.broadcast("event:directiveAlert", {
                                message: "An error has occurred while trying to retrieve the compliance record for " + scope.complianceName,
                                type: "danger"
                            });
                        });
                    }
                };

                scope.close = function () {
                    $('#complianceDirectiveModal').modal('hide');
                };

                scope.downloadComplianceDocument = function () {
                    if (scope.complianceEnabled === "true") {
                        ControllerInfoPasser.broadcast('event:complianceDocumentOpen', scope.complianceRecord);
                        scope.close();
                    } else {
                        scope.close();
                    }
                };

                $(function () {
                    $('[data-toggle="tooltip"]').tooltip({
                        placement: 'auto top',
                        delay: {"show": 500, "hide": 100}
                    })
                });
            },
            templateUrl: 'partials/environmental/complianceDocumentModal.html'
        };
    }])
    .directive('riskTableColumnHeader', function () {
        return {
            restrict: 'A',
            scope: {
                tableDataOrder: "=tableDataOrder",
                columnFieldName: "@columnFieldName",
                finalSortColumnOrder: "@finalSortColumnOrder",
                singleColumnSort: '@'  // Defaults to false, will only allow one column to be sortable
            },
            transclude: true,
            template: '<span class="pointer-underline" ng-click="orderTableColumn()" ng-transclude></span>\
                       <span ng-show="getColumnSortIcon() !== undefined">&nbsp;</span> \
                       <i ng-if="getColumnSortIcon() !== undefined" class="glyphicon" ng-class="getColumnSortIcon()"></i>',
            link: function (scope, element, attrs, ngModelCtrl) {
                scope.orderTableColumn = function () {
                    // Used splice instead of pop because there may be situations where the final sort column
                    // is not present in the array or is in a different position... Making sure no funky stuff happens.
                    if (scope.tableDataOrder.indexOf(scope.finalSortColumnOrder) != -1) {
                        var index = scope.tableDataOrder.indexOf(scope.finalSortColumnOrder);
                        scope.tableDataOrder.splice(index, 1);
                    }

                    if (scope.tableDataOrder.indexOf(scope.columnFieldName) == -1 && scope.tableDataOrder.indexOf("-" + scope.columnFieldName) == -1) {

                        if (scope.singleColumnSort) {
                            scope.tableDataOrder.length = 0;
                        }

                        scope.tableDataOrder.push(scope.columnFieldName);
                    } else {
                        var index = scope.tableDataOrder.indexOf(scope.columnFieldName);
                        if (index == -1) {
                            index = scope.tableDataOrder.indexOf("-" + scope.columnFieldName);
                        }

                        if (scope.tableDataOrder[index].indexOf(scope.columnFieldName) == 0) {
                            scope.tableDataOrder[index] = "-" + scope.columnFieldName;
                        } else {
                            scope.tableDataOrder.splice(index, 1);
                        }
                    }

                    if (scope.tableDataOrder != null && angular.isUndefined(scope.tableDataOrder)) {
                        if (!scope.singleColumnSort || (scope.singleColumnSort && scope.tableDataOrder.length === 0)) {
                            scope.tableDataOrder.push(scope.finalSortColumnOrder);
                        }
                    }
                };

                scope.getColumnSortIcon = function () {
                    if (scope.tableDataOrder.indexOf(scope.columnFieldName) == -1 && scope.tableDataOrder.indexOf("-" + scope.columnFieldName) == -1) {
                        return undefined;
                    } else {
                        var index = scope.tableDataOrder.indexOf(scope.columnFieldName);
                        if (index == -1) {
                            index = scope.tableDataOrder.indexOf("-" + scope.columnFieldName);
                        }

                        if (scope.tableDataOrder[index].indexOf(scope.columnFieldName) == 1) {
                            // For descending, sortBy will start with '-'
                            return "glyphicon-chevron-down";
                        } else {
                            return "glyphicon-chevron-up";
                        }
                    }
                };

                scope.initializeSort = function () {
                    scope.singleColumnSort = scope.singleColumnSort === 'true';

                    if (scope.tableDataOrder.indexOf(scope.finalSortColumnOrder) == -1) {
                        if (scope.tableDataOrder != null && angular.isUndefined(scope.tableDataOrder)) {
                            scope.tableDataOrder.push(scope.finalSortColumnOrder);
                        }
                    }
                };

                scope.initializeSort();
            }
        };
    })
    .directive('recordHistory', ['ControllerInfoPasser', 'AuditLogService', '$sce', function (ControllerInfoPasser, AuditLogService, $sce) {
        return {
            restrict: 'E',
            link: function (scope, element, attrs) {

                scope.selectedHistoryRecord = {};
                scope.historyRecords = [];
                scope.historyRecordsOrder = ['-timestamp'];

                scope.getHistoryRecord = function () {
                    var document = ControllerInfoPasser.get("selectedDocument");

                    if (angular.isDefined(document)) {
                        scope.historyRecords.length = 0;
                        var entityClass = "com.refineddata.risk.entities." + document.parentType + "Document";
                        AuditLogService.findHistoryRecords({
                            recordId: document.id,
                            className: entityClass
                        }, function (data) {
                            scope.historyRecords = data;
                        }, function (httpResponse) {
                            scope.displayMessageInElement("#historyRecordsError", "An error has occurred getting the history of records associated with this record!", 10000);
                        })
                    }
                };

                scope.selectHistoryRecord = function (record) {
                    scope.selectedHistoryRecord = angular.copy(record);
                    // Convert to HTML
                    scope.selectedHistoryRecord.image = $sce.trustAsHtml(scope.selectedHistoryRecord.image);
                };

                scope.getHistoryRecord();

            },
            templateUrl: 'partials/directives/recordHistory.html'
        }
    }])
    .directive('portfolioManagerProperties', ['PortfolioManagerService', 'PortfolioManagerAccountsService', function (PortfolioManagerService, PortfolioManagerAccountsService) {
        return {
            templateUrl: 'partials/administration/portfolioManagerPropertiesModal.html',
            restrict: 'A',
            scope: {
                pmAccount: '=?', // Useful for multiple directives on one screen, can share an account to avoid having to pick one for each button
                onPropertyClick: '=',
                buttonLabel: '@',
                accountPicker: '@',
                onAccountClick: '='
            },
            link: function (scope, elem, attrs) {
                var accountPicker;
                if(angular.isDefined(attrs.accountPicker)){
                    accountPicker = attrs.accountPicker.toLowerCase() === 'true';
                } else {
                    accountPicker = false;
                }

                scope.propertiesInPM = [];
                scope.accounts = [];
                scope.tableSort = ['name'];

                var maxInt = 100, minInt = 0;

                function randInt() {
                    return Math.floor((Math.random() * maxInt) + minInt);
                }

                scope.listModalId = "#listPropertiesModal" + randInt();
                scope.accountModalId = "#selectAccountModal" + randInt();

                scope.getPropertiesForAccount = function () {
                    scope.modalLoading = true;
                    scope.propertiesInPM.length = 0;
                    PortfolioManagerService.getPropertiesForAccount({accountId: scope.pmAccount.accountId}, function (data) {
                        scope.modalLoading = false;
                        scope.propertiesInPM = angular.copy(data);
                    }, function () {
                        scope.modalLoading = false;
                        scope.displayMessageInElement("#listErrorMsg", "An error has occurred getting the Portfolio Manager properties!", 10000);
                    });
                };

                scope.tableClass = function () {
                    if(angular.isDefined(scope.onPropertyClick) && angular.isFunction(scope.onPropertyClick)) {
                        return 'table-hover';
                    } else {
                        return '';
                    }
                };

                scope.rowClass = function () {
                    if(angular.isDefined(scope.onPropertyClick) && angular.isFunction(scope.onPropertyClick)) {
                        return 'pointer';
                    } else {
                        return '';
                    }
                };

                scope.clickRow = function (property) {
                    if(angular.isDefined(scope.onPropertyClick) && angular.isFunction(scope.onPropertyClick)) {
                        $(scope.listModalId).modal('hide');
                        scope.onPropertyClick(scope.pmAccount, property);
                    }
                };

                scope.openPMModal = function () {
                    if(angular.isUndefined(scope.pmAccount)) {
                        $(scope.accountModalId).modal('show');
                        getPMAccounts();
                    } else {
                        if(accountPicker){
                            scope.useAccount(scope.pmAccount);
                        } else {
                            $(scope.listModalId).modal('show');
                            scope.getPropertiesForAccount();
                        }
                    }
                };

                scope.useAccount = function (account) {
                    scope.pmAccount = angular.copy(account);
                    $(scope.accountModalId).modal('hide');
                    if (accountPicker) {
                        if(angular.isDefined(scope.onAccountClick) && angular.isFunction(scope.onAccountClick)) {
                            scope.onAccountClick(scope.pmAccount);
                        }
                    } else {
                        scope.openPMModal();
                    }
                };

                var getPMAccounts = function () {
                    scope.modalLoading = true;
                    PortfolioManagerAccountsService.query({}, function (data) {
                        scope.modalLoading = false;
                        scope.accounts = angular.copy(data);
                    }, function (httpResponse) {
                        scope.modalLoading = false;
                    });
                };

                scope.useAnotherAccount = function () {
                    $(scope.listModalId).modal('hide');
                    scope.pmAccount = undefined;
                    scope.openPMModal();
                }
            }
        };
    }]);
