/**
 * Created by Nicolo on 04/02/14.
 */

'use strict';

angular.module('myApp.dashboardControllers', [])
    .controller("GlobalDashboardCtrl", ["$scope", function ($scope) {
        $scope.ELECTRICITY_UTILITY_TYPE_SHORT_NAME = "ecrs";
        $scope.WATER_UTILITY_TYPE_SHORT_NAME = "wcrs";

        $scope.getSelectedUtilityTypeShortForm = function(selectedUtilityTypes) {
            var utility = $scope.ELECTRICITY_UTILITY_TYPE_SHORT_NAME;
            if (selectedUtilityTypes.length === 1) {
                utility = selectedUtilityTypes[0].value;
            }

            return utility;
        };

        $scope.getUtilityEnumFromLongForm = function(longFormUtility, dropboxes) {
            if (angular.isDefined(dropboxes) && angular.isDefined(dropboxes["utilityType"])) {
                return dropboxes["utilityType"].itemMap.filter(function (item) {
                    return item.key === longFormUtility;
                })[0].value;
            } else {
                return "";
            }
        };

        $scope.getSelectedUtilitiesText = function(selectedUtilityTypes) {
            var selectedUtilitiesText = "";
            for (var x = 0; x < selectedUtilityTypes.length; x++) {
                var selectedUtility = selectedUtilityTypes[x].key;

                selectedUtilitiesText = selectedUtilitiesText + selectedUtility;
                if (x < selectedUtilityTypes.length - 1) {
                    selectedUtilitiesText = selectedUtilitiesText + ", ";
                }
            }

            return selectedUtilitiesText;
        };

        $scope.appendUnknownHeaderName = function (chartDataPropertyType) {
            var headerIdx = 0;
            for (var i = 1; i < chartDataPropertyType[headerIdx].length; i++) {
                if (chartDataPropertyType[headerIdx][i] === '') {
                    chartDataPropertyType[headerIdx][i] = 'Unknown';
                    break;
                }
            }
            return chartDataPropertyType;
        };

    }])
    .controller('ExecutiveCtrl', ['$scope', function ($scope) {

    }])
    .controller('YearlyQuestionnaireDrivenSelectorCtrl', ['$scope', 'ControllerInfoPasser', function ($scope, ControllerInfoPasser) {

        $scope.unifiedQuestionnaireNameList = [];
        $scope.rawQuestionnaireNameList = [];
        $scope.selectedYearlyQuestionnaireName = '';

        $scope.buildYearlyQuestionnaireNameList = function (list) {
            for (var x = 0; x < list.length; x++) {
                $scope.rawQuestionnaireNameList.push(list[x].questionnaireName);
            }
            $scope.selectedYearlyQuestionnaireName = $scope.yearlyQuestionnaire.name;
            $scope.rawQuestionnaireNameList.push($scope.selectedYearlyQuestionnaireName);
            $scope.unifiedQuestionnaireNameList = $scope.getUniqueArray($scope.rawQuestionnaireNameList);
        };

        $scope.initializeSelectorValues = function (moduleNameList) {
            $scope.unifiedQuestionnaireNameList.length = 0;
            $scope.rawQuestionnaireNameList.length = 0;
            for (var x = 0; x < moduleNameList.length; x++) {
                $scope.initializeQuestionnaires(moduleNameList[x], $scope.buildYearlyQuestionnaireNameList);
            }
            $scope.notifyQuestionnaireNameChange();
        };

        $scope.notifyQuestionnaireNameChange = function () {
            ControllerInfoPasser.put("selectedYearlyQuestionnaireName", $scope.selectedYearlyQuestionnaireName);
            ControllerInfoPasser.broadcast("event:yearlyQuestionnaireNameChanged");
        };
    }])
    .controller('YearlyQuestionnaireCarouselSelectorCtrl', ['$scope', 'ControllerInfoPasser', 'QuestionnaireService', function ($scope, ControllerInfoPasser, QuestionnaireService) {

        $scope.yearlyQuestionnaireList = [];
        $scope.selectedYearlyQuestionnaireName = '';

        $scope.initializeValues = function () {

            QuestionnaireService.findForDashboardCarousel({moduleName: 'SUSTAINABILITY'}, function (data) {
                $scope.yearlyQuestionnaireList = data;
                if (data.length > 0) {
                    $scope.selectedYearlyQuestionnaireName = $scope.yearlyQuestionnaireList[0];
                    ControllerInfoPasser.broadcast("event:riskCarouselChanged", $scope.selectedYearlyQuestionnaireName);
                }
            });
        };

        $scope.$on('event:riskCarouselChanged', function (event, carouselValue) {
            ControllerInfoPasser.put("selectedYearlyQuestionnaireName", carouselValue);
        });
    }])
    .controller('YearlyQuestionnaireSelectorCtrl', ['$scope', 'ControllerInfoPasser', 'QuestionnaireService', function ($scope, ControllerInfoPasser, QuestionnaireService) {

        $scope.yearlyQuestionnaireList = [];

        $scope.initializeValues = function () {
            QuestionnaireService.findByModule({moduleName: 'SUSTAINABILITY'}, function (data) {
                $scope.yearlyQuestionnaireList = data;
                if (data.length > 0) {
                    $scope.selectedYearlyQuestionnaireName = $scope.yearlyQuestionnaireList[0];
                    $scope.notifyYearChange();
                }
            });
        };

        $scope.notifyYearChange = function () {
            ControllerInfoPasser.put("selectedYearlyQuestionnaireName", $scope.selectedYearlyQuestionnaireName);
            ControllerInfoPasser.broadcast("event:yearlyQuestionnaireNameChanged");
        };
    }])
    .controller('GenericQuestionnaireDashCtrl', ['$scope', 'QuestionnaireService', 'ControllerInfoPasser', 'QuestionnaireReportConfigService', 'contextPath', 'SelectedProperty', 'PropertyLookup', '$q', '$filter', function ($scope, QuestionnaireService, ControllerInfoPasser, QuestionnaireReportConfigService, contextPath, SelectedProperty, PropertyLookup, $q, $filter) {
        $scope.questionnaireOrder = ['group.module'];
        $scope.completenessData = [];
        $scope.completenessLoading = [];
        $scope.scoreData = [];
        $scope.scoreLoading = [];
        $scope.numOfProperties = 0;
        $scope.qDashboardLevel = 0;
        $scope.questionnaires = [];

        $scope.modalSort = ['propertyNumber'];

        $scope.notStarted = "Not Started";
        $scope.inProgress = "In Progress";
        $scope.completed = "Completed";

        $scope.QUESTION_ANSWER = 'questions';
        $scope.OPTION_ANSWER = 'options';
        $scope.OPTION_ANSWER_MATRIX = 'matrix';

        $scope.reportToRun = $scope.QUESTION_ANSWER;
        $scope.optionReports = [];

        $scope.chartByEnum = {
            PROPERTY_COUNT: 'PROPERTY_COUNT',
            PERCENTAGE: 'PERCENTAGE'
        };

        $scope.chartTypeEnum = {
            CERTIFICATION: 'CERTIFICATION',
            POTENTIAL: 'POTENTIAL'
        };

        $scope.chartBy = $scope.chartByEnum.PROPERTY_COUNT;
        $scope.chartType = {};

        $scope.isCertificationRange = {
            YES: true,
            NO: false
        };


        $scope.categoryDashboardFilter = null;
        $scope.weightingFilter = null;


        $scope.propertiesForWeightings = [];

        $scope.detailedQuestionData = [];
        $scope.detailedOptionData = [];
        $scope.countOrPercent = '#';


        var excludedOptionsFromAnalytics = ['heading', 'instructions', 'attachment'];
        var optionsToAnalyzeInModal = ['comments', 'text'];
        var numericOptions = ['dollar', 'numeric', 'percent'];
        var yearByYearOptions = ['certification', 'checkList', 'date', 'dropbox', 'checkbox', 'quarterlyDate'];

        var excelCertificationPropertiesUrl = '';

        $scope.getQuestionnairesForProperties = function (propertyNumbers) {
            if (angular.isDefined(propertyNumbers)) {
                $scope.loadingQuestionnaires = true;
                $scope.numOfProperties = propertyNumbers.length;
                QuestionnaireService.findQuestionnairesForProperties({}, propertyNumbers, function (data) {
                    $scope.questionnaires.length = 0;
                    var qData = angular.copy(data);

                    for (var x = 0; x < qData.length; x++) {
                        if (qData[x].group.questionnaireType !== $scope.questionnaireTypeEnum.CHECKLIST_SURVEY) {
                            $scope.questionnaires.push(qData[x]);
                        }
                    }

                    if (angular.isDefined($scope.toRefresh)) {
                        var isSelectedApplicable = $scope.searchArrayForProperty($scope.questionnaires, 'id', $scope.toRefresh.id).length > 0;
                        if (isSelectedApplicable) {
                            if ($scope.qDashboardLevel === 1) {
                                $scope.openQuestionnaire();
                            } else {
                                $scope.openQuestionnaireAnalytics();
                            }
                        } else {
                            $scope.backToListView();
                        }
                    }

                    $scope.loadingQuestionnaires = false;
                }, function () {
                    $scope.loadingQuestionnaires = false;
                });
            }
        };

        $scope.getCompletenessForQuestionnaire = function (questionnaire) {
            var propertyNumbers = ControllerInfoPasser.get("dashboardPropertyNumbers");

            $scope.completenessLoading[questionnaire.id] = true;

            QuestionnaireService.getDashboardCompletenessData({questionnaireId: questionnaire.id}, propertyNumbers, function (data) {
                $scope.completenessData[questionnaire.id] = angular.copy(data);

                $scope.completenessLoading[questionnaire.id] = false;
            }, function () {
                $scope.completenessLoading[questionnaire.id] = false;
            });
        };

        $scope.getScoreDataForQuestionnaire = function (questionnaire) {
            var propertyNumbers = ControllerInfoPasser.get("dashboardPropertyNumbers");

            $scope.scoreLoading[questionnaire.id] = true;

            QuestionnaireService.getDashboardScoreData({questionnaireId: questionnaire.id}, propertyNumbers, function (data) {
                $scope.scoreData[questionnaire.id] = data;
                $scope.scoreLoading[questionnaire.id] = false;
            }, function (ignore) {
                $scope.scoreLoading[questionnaire.id] = false;
            });
        };

        $scope.setModalVars = function (state, arr) {
            $scope.completenessState = state;
            $scope.completedStateArr = arr;
            $scope.isCompleteness = true;
        };

        $scope.refreshQuestionnaireCompletenessForProperties = function () {
            var questionnaire = $scope.toRefresh;
            var propertyNumbers = ControllerInfoPasser.get("dashboardPropertyNumbers");
            $scope.completenessLoading[questionnaire.id] = true;
            QuestionnaireService.refreshCompletenessForProperties({questionnaireId: questionnaire.id}, propertyNumbers, function () {
                $scope.completenessLoading[questionnaire.id] = false;
                $scope.getCompletenessForQuestionnaire(questionnaire);
                $scope.getScoreDataForQuestionnaire(questionnaire);
            }, function () {
                $scope.completenessLoading[questionnaire.id] = false;
            });
        };

        $scope.setToRefresh = function (questionnaire) {
            $scope.toRefresh = questionnaire;
            $scope.qIdToDisplay = questionnaire.id;
        };

        var getQuestionnaireOptionReports = function (questionnaire) {
            QuestionnaireReportConfigService.findByQuestionnaireId({
                questionnaireId: questionnaire.id,
                reportType: 'OPTION'
            }, function (data) {
                $scope.optionReports = data;
                $scope.selectedReportConfig = data[0];
            });
        };

        $scope.backToListView = function () {
            $scope.toRefresh = undefined;
            $scope.qIdToDisplay = undefined;
            $scope.qDashboardLevel = 0;
        };

        $scope.runQuestionnaireReport = function (reportToRun, selectedReportConfig) {
            var propertyNumbers = ControllerInfoPasser.get("dashboardPropertyNumbers");
            if (reportToRun === $scope.OPTION_ANSWER_MATRIX && angular.isDefined(selectedReportConfig)) {
                $scope.getQuestionnaireReport(reportToRun, $scope.qIdToDisplay, propertyNumbers, selectedReportConfig.id);
            } else {
                $scope.getQuestionnaireReport(reportToRun, $scope.qIdToDisplay, propertyNumbers);
            }
        };

        $scope.exportExcel = function (questionnaireId, isWithCertificationRange, rangeScoreType) {

            var propertyNumbers = ControllerInfoPasser.get("dashboardPropertyNumbers");

            var data = {
                propertyNumbers: propertyNumbers
            };

            var url = contextPath + '/webapi/properties/questionnaire/' + questionnaireId + '/' + isWithCertificationRange + '/' + rangeScoreType + '/weighting/excel';
            $scope.openInNewWindow('POST', url, data);
        };

        $scope.exportExcelQuestionnaireCompleteness = function ($completenessState) {
            var questionnaire = $scope.toRefresh;
            var propertyNumbers = ControllerInfoPasser.get("dashboardPropertyNumbers");

            var data = {
                completenessState: $completenessState,
                propertyNumbers: propertyNumbers
            };
            $scope.openInNewWindow("POST", contextPath + '/webapi/questionnairecompleteness/dashboarddata/excel/' + questionnaire.id, data);
        };


        $scope.getPropertiesForWeighting = function (questionnaireId, isWithCertificationRange, rangeScoreType) {
            var propertyNumbers = ControllerInfoPasser.get("dashboardPropertyNumbers");
            $scope.propertiesForWeightings.length = 0;
            $('.modal-label').html(rangeScoreType.replace('_', ' '));
            $('#propertiesForWeightingModal').modal('show');
            $scope.loading = true;
            QuestionnaireService.findPropertiesForWeightingOnQuestionnaire({
                questionnaireId: questionnaireId,
                isWithCertificationRange: isWithCertificationRange,
                rangeScoreType: rangeScoreType
            }, propertyNumbers, function (data) {
                $scope.propertiesForWeightings = angular.copy(data);
                $scope.loading = false;
            }, function () {
                $scope.loading = false;
                $scope.displayMessageInElement('.modalError', 'An error has occurred retrieving the properties!', 10000);
            });
        };

        $scope.showCertificationTable = function (elementId) {
            $(document.getElementById(elementId)).show();
            $(document.getElementById(elementId + 'chartCertified')).hide();
            $(document.getElementById(elementId + 'radio')).hide();
        };

        $scope.drawChart = function (rangeScoreType, index, chartBy, chartType) {
            $(document.getElementById(rangeScoreType + index + 'chartCertified')).hide();
            if (chartBy === $scope.chartByEnum.PROPERTY_COUNT) {
                $('.typeChart' + rangeScoreType + index + 'count').prop('checked', true);
            } else {
                $('.typeChart' + rangeScoreType + index + 'percentage').prop('checked', true);
            }
            $(document.getElementById(rangeScoreType + index)).hide();

            if (angular.isDefined(chartType)) {
                $scope.chartType = chartType;
            } else {
                chartType = $scope.chartType;
            }
            drawChart(rangeScoreType, index, "Certified", chartBy, chartType);
        };

        var drawChart = function (rangeScoreType, index, title, chartBy, chartType) {
            if (chartType === $scope.chartTypeEnum.CERTIFICATION) {
                drawCertificationChart(rangeScoreType, index, title, chartBy);
            } else {
                drawPotentialChart(rangeScoreType, index, chartBy);
            }
        };

        var drawPotentialChart = function (rangeScoreType, index, chartBy) {
            var elementId = rangeScoreType + index;
            var potentialCertificationChartData = $scope.scoreData[$scope.qIdToDisplay].potentialCertificationsChartData;

            if (angular.isDefined(potentialCertificationChartData)) {
                var chartData = [];
                for (var x = 0; x < potentialCertificationChartData.length; x++) {
                    if (potentialCertificationChartData[x].scoreType === rangeScoreType) {
                        switch (chartBy) {
                            case $scope.chartByEnum.PROPERTY_COUNT:
                                chartData = potentialCertificationChartData[x].propertyCountChartData;
                                break;

                            case $scope.chartByEnum.PERCENTAGE:
                                chartData = potentialCertificationChartData[x].glaPercentageChartData;
                                break;

                            default:
                                break;
                        }

                        break;
                    }
                }


                switch (chartBy) {
                    case $scope.chartByEnum.PROPERTY_COUNT:
                        drawPropertyCountPotentialChart(chartData, elementId);
                        break;

                    case $scope.chartByEnum.PERCENTAGE:
                        drawGLAPercentagePotentialChart(chartData, elementId);
                        break;

                    default:
                        break;
                }

            }
        };

        var getPotentialCertificationsChartOptions = function (numberOfColumns) {
            $scope.colorGenerator.setNumberRange(0, numberOfColumns);
            var colors = [];

            for (var i = 0; i < numberOfColumns; i++) {
                colors.push("#" + $scope.colorGenerator.colourAt(i));
            }

            return {
                vAxis: {
                    viewWindowMode: "explicit",
                    viewWindow: {min: 0}
                },
                animation: {
                    duration: 1000,
                    easing: "out",
                    startup: true
                },
                tooltip: {
                    trigger: "selection"
                },
                colors: colors,
                isStacked: true,
                chartArea: {
                    left: 30,
                    top: 10,
                    height: 170
                }
            };
        };

        var getCertificationChartsOption = function (numberOfRows, title) {
            $scope.colorGenerator.setNumberRange(0, numberOfRows);
            var sliceColors = [];

            for (var i = 0; i < numberOfRows; i++) {
                sliceColors.push("#" + $scope.colorGenerator.colourAt(i));
            }

            return {
                title: title,
                colors: sliceColors,
                animation: {
                    duration: 1000,
                    easing: "out",
                    startup: true
                },
                pieSliceText: "value",
                tooltip: {
                    trigger: "selection"
                },
                is3D: false,
                chartArea: {
                    left: 30,
                    top: 10,
                    height: 170
                }

            };
        };

        var drawPropertyCountPotentialChart = function (chartData, elementId) {
            var dataTable = google.visualization.arrayToDataTable(chartData);

            var options = getPotentialCertificationsChartOptions(dataTable.getNumberOfColumns());

            $(document.getElementById(elementId + "chartCertified")).show();
            var chartView = new google.visualization.ColumnChart(document.getElementById(elementId + "chartCertified"));
            chartView.draw(dataTable, options);

            $(document.getElementById(elementId + "radio")).show();
        };

        var drawGLAPercentagePotentialChart = function (chartData, elementId) {
            var dataTable = google.visualization.arrayToDataTable(chartData);

            var percentageFormatter = new google.visualization.NumberFormat({
                suffix: "%"
            });

            for (var x = 0; x < dataTable.getNumberOfColumns(); x++) {
                percentageFormatter.format(dataTable, x);
            }

            var options = getPotentialCertificationsChartOptions(dataTable.getNumberOfColumns());

            $(document.getElementById(elementId + "chartCertified")).show();
            var chartView = new google.visualization.ColumnChart(document.getElementById(elementId + "chartCertified"));
            chartView.draw(dataTable, options);

            $(document.getElementById(elementId + "radio")).show();
        };

        var drawPropertyCountCertificationChart = function (chartData, elementId, title) {
            var dataTable = google.visualization.arrayToDataTable(chartData);
            var chartTitle = "Certification Property Count";

            var options = getCertificationChartsOption(dataTable.getNumberOfRows(), chartTitle);

            $(document.getElementById(elementId + 'chart' + title)).show();
            var chartView = new google.visualization.PieChart(document.getElementById(elementId + "chart" + title));
            chartView.draw(dataTable, options);

            $(document.getElementById(elementId + "radio")).show();
        };

        var drawGLAPercentageCertificationChart = function (chartData, elementId, title) {
            var dataTable = google.visualization.arrayToDataTable(chartData);
            var chartTitle = "Certification GLA Percentage";

            var percentageFormatter = new google.visualization.NumberFormat({
                suffix: "%"
            });

            var columnIndexOfValues = 1;
            percentageFormatter.format(dataTable, columnIndexOfValues);

            var options = getCertificationChartsOption(dataTable.getNumberOfRows(), chartTitle);

            $(document.getElementById(elementId + 'chart' + title)).show();
            var chartView = new google.visualization.PieChart(document.getElementById(elementId + "chart" + title));
            chartView.draw(dataTable, options);

            $(document.getElementById(elementId + "radio")).show();
        };

        var drawCertificationChart = function (rangeScoreType, index, title, chartBy) {
            var elementId = rangeScoreType + index;
            var certificationsChartData = $scope.scoreData[$scope.qIdToDisplay].certificationsChartData;

            if (angular.isDefined(certificationsChartData)) {
                var chartData = [];
                for (var x = 0; x < certificationsChartData.length; x++) {
                    if (certificationsChartData[x].scoreType === rangeScoreType) {
                        switch (chartBy) {
                            case $scope.chartByEnum.PROPERTY_COUNT:
                                chartData = certificationsChartData[x].propertyCountChartData;
                                break;

                            case $scope.chartByEnum.PERCENTAGE:
                                chartData = certificationsChartData[x].glaPercentageChartData;
                                break;

                            default:
                                break;
                        }

                        break;
                    }
                }


                switch (chartBy) {
                    case $scope.chartByEnum.PROPERTY_COUNT:
                        drawPropertyCountCertificationChart(chartData, elementId, title);
                        break;

                    case $scope.chartByEnum.PERCENTAGE:
                        drawGLAPercentageCertificationChart(chartData, elementId, title);
                        break;

                    default:
                        break;
                }

            }
        };

        $scope.isGreaterThanOne = function (count) {
            if (count > 0) {
                return 'pointer-underline';
            } else {
                return '';
            }
        };

        $scope.goToQuestionnaireModule = function (propertyNumber, module) {
            if (!$scope.isCompletenessPopup()) {
                $scope.forceClosePopupModal('completenessDetailsModal');
                PropertyLookup.get({propertyNumber: propertyNumber}, function (data) {
                    SelectedProperty.setSelectedProperty(data);
                    $scope.goToModule(module.toLowerCase());
                });
            }
        };

        $scope.goToQuestionnaireModuleClass = function () {
            if ($scope.isCompletenessPopup()) {
                return '';
            } else {
                return 'pointer';
            }
        };

        $scope.isCompletenessPopup = function () {
            return $scope.completenessState === $scope.notStarted || $scope.completenessState === $scope.inProgress || $scope.completenessState === $scope.completed;
        };

        $scope.getPropertiesForCertification = function (rangeScoreType, score, certified) {
            $scope.isCompleteness = false;
            if (score.count > 0) {
                var propertyNumbers = ControllerInfoPasser.get("dashboardPropertyNumbers");
                excelCertificationPropertiesUrl = contextPath + '/webapi/questionnairescores/certifications/' + $scope.qIdToDisplay + '/properties/' + rangeScoreType + '/' + score.certificationLevel + '/excel?isCertified=' + certified;

                $("#completenessDetailsModal").modal('show');
                QuestionnaireService.getPropertiesForCertification({
                    questionnaireId: $scope.qIdToDisplay,
                    scoreType: rangeScoreType,
                    certificationLevel: score.certificationLevel,
                    isCertified: certified
                }, propertyNumbers, function (data) {
                    $scope.completenessState = rangeScoreType.replace('_', ' ') + ' - ' + score.certificationLevel.replace('_', ' ');
                    $scope.completedStateArr = data;
                });
            }
        };

        $scope.exportExcelCertificationProperties = function () {
            var propertyNumbers = ControllerInfoPasser.get("dashboardPropertyNumbers");
            $scope.openInNewWindow('POST', excelCertificationPropertiesUrl, {propertyNumbers: propertyNumbers});
        };

        $scope.openQuestionnaire = function (q) {
            if (angular.isUndefined(q) && angular.isDefined($scope.toRefresh)) {
                q = $scope.toRefresh;
            }

            $scope.setToRefresh(q);
            $scope.qDashboardLevel = 1;

            getQuestionnaireOptionReports(q);
            $scope.getCompletenessForQuestionnaire(q);
            $scope.getScoreDataForQuestionnaire(q);
        };

        $scope.openQuestionnaireAnalytics = function (q) {
            if (angular.isUndefined(q) && angular.isDefined($scope.toRefresh)) {
                q = $scope.toRefresh;
            }

            $scope.setToRefresh(q);
            if ($scope.qDashboardLevel === 3) {
                $scope.getQuestionDetails();
            } else {
                if ($scope.qDashboardLevel !== 2) {
                    $scope.qDashboardLevel = 2;
                    $scope.getFullQuestionnaireAndWeightings(q);
                }
            }
        };

        $scope.getFullQuestionnaireAndWeightings = function (questionnaire) {
            $scope.fullQuestionnaireLoading = true;

            $q.all([
                QuestionnaireService.findById({questionnaireId: questionnaire.id}).$promise,
                QuestionnaireService.getWeightingsOnQuestionnaire({questionnaireId: questionnaire.id}).$promise
            ]).then(function (data) {
                $scope.fullQuestionnaireLoading = false;
                $scope.fullQuestionnaire = angular.copy(data[0]);
                $scope.questionnaireWeightings = angular.copy(data[1]);
                $scope.filterQuestionsByCategory();
            }, function () {
                $scope.fullQuestionnaireLoading = false;
                $scope.displayMessageInElement('.q-error', 'An error has occurred loading the question analytics!');
            });
        };

        $scope.checkCategoryFilter = function () {
            if ($scope.categoryFilter === null) {
                $scope.categoryFilter = '';
            }
        };


        $scope.filterQuestionsByCategory = function (category) {

            if (angular.isDefined($scope.filteredCategories)) {
                $scope.filteredCategories.length = 0;
            }

            if (angular.isDefined($scope.fullQuestionnaire)) {
                var filtered = $filter('questionnaireDashoardCategoryFilter')($scope.fullQuestionnaire.categories, category);
                $scope.filteredCategories = angular.copy(filtered);
            }
        };

        $scope.backToQuestionnaireView = function () {
            $scope.questionDetailed = undefined;
            $scope.optionDetailed = undefined;
            $scope.qDashboardLevel = 2;
        };

        $scope.openQuestionDetails = function (question) {
            $scope.questionDetailed = angular.copy(question);
            $scope.qDashboardLevel = 3;
            $scope.getQuestionDetails();
        };

        $scope.getQuestionDetails = function () {
            $scope.loadingQuestionnaires = true;

            $scope.detailedQuestionData.length = 0;
            var propertyNumbersOrClient;

            if ($scope.toRefresh.group.questionnaireType === $scope.questionnaireTypeEnum.PROPERTY) {
                propertyNumbersOrClient = ControllerInfoPasser.get("dashboardPropertyNumbers");
            } else {
                propertyNumbersOrClient = ControllerInfoPasser.get("dashboardPropertyClients");
            }

            QuestionnaireService.getQuestionAnalytics({
                questionnaireId: $scope.qIdToDisplay,
                questionId: $scope.questionDetailed.questionID
            }, propertyNumbersOrClient, function (data) {
                $scope.detailedQuestionData = angular.copy(data);
                $scope.loadingQuestionnaires = false;
            }, function () {
                $scope.loadingQuestionnaires = false;
            });
        };

        $scope.getYesDisplay = function (qData) {
            if ($scope.countOrPercent === '#') {
                return qData.numberOfYes;
            } else {
                return qData.yesAvg;
            }
        };

        $scope.getNoDisplay = function (qData) {
            if ($scope.countOrPercent === '#') {
                return qData.numberOfNo;
            } else {
                return qData.noAvg;
            }
        };

        $scope.getNADisplay = function (qData) {
            if ($scope.countOrPercent === '#') {
                return qData.numberOfNA;
            } else {
                return qData.naAvg;
            }
        };

        $scope.getTotalDisplay = function (qData) {
            if ($scope.countOrPercent === '#') {
                return qData.total;
            } else {
                if (qData.total === 0) {
                    return 0;
                } else {
                    return 100;
                }
            }
        };

        var getPropertyNumbersForAnswer = function (answer, questionData) {
            var qType = $scope.toRefresh.group.questionnaireType;
            if (answer === 'Yes') {
                if (qType === $scope.questionnaireTypeEnum.PROPERTY) {
                    return questionData.yesProperties;
                } else {
                    return questionData.yesClients;
                }
            } else {
                if (answer === 'No') {
                    if (qType === $scope.questionnaireTypeEnum.PROPERTY) {
                        return questionData.noProperties;
                    } else {
                        return questionData.noClients;
                    }
                } else {
                    if (qType === $scope.questionnaireTypeEnum.PROPERTY) {
                        return questionData.naProperties;
                    } else {
                        return questionData.naClients;
                    }
                }
            }
        };

        $scope.getPropertiesForAnswer = function (answer, questionData) {
            $scope.answerForModal = answer;
            $scope.propertiesForExcel = getPropertyNumbersForAnswer(answer, questionData);

            PropertyLookup.findByPropertyNumbersAsDTO({}, $scope.propertiesForExcel, function (data) {
                $scope.propertiesForAnswer = angular.copy(data);
            }, function () {
                $scope.displayMessageInElement('.modal-error', 'An error has occurred while trying to get the list of properties!', 10000)
            });
        };

        $scope.questionAnswersToExcel = function () {
            var data = {
                propertyNumbers: $scope.propertiesForExcel
            };
            var answer = $filter('noSpaces')($scope.answerForModal);
            var url = contextPath + '/webapi/properties/questionnaire/analytics/' + $scope.toRefresh.id + '/' + $scope.questionDetailed.questionID + '/' + answer + '/excel';
            $scope.openInNewWindow('POST', url, data);
        };

        $scope.isOptionClickable = function (option) {
            return excludedOptionsFromAnalytics.indexOf(option.type) === -1;
        };

        $scope.openOptionDetails = function (question, option) {
            if (!$scope.isOptionClickable(option)) {
                return;
            }

            $scope.questionDetailed = angular.copy(question);
            $scope.optionDetailed = angular.copy(option);

            if ($scope.analyzeInModal(option.type)) {
                $('#listOptionAnswersModal').modal('show');
            } else {
                $scope.qDashboardLevel = 4;
            }

            getOptionsDetails();
        };

        var getOptionsDetails = function () {
            var propertyNumbersOrClient;

            if ($scope.toRefresh.group.questionnaireType === $scope.questionnaireTypeEnum.PROPERTY) {
                propertyNumbersOrClient = ControllerInfoPasser.get("dashboardPropertyNumbers");
            } else {
                propertyNumbersOrClient = ControllerInfoPasser.get("dashboardPropertyClients");
            }

            $scope.loadingQuestionnaires = true;
            $scope.detailedOptionData.length = 0;

            QuestionnaireService.getOptionAnalytics({
                questionnaireId: $scope.qIdToDisplay,
                questionId: $scope.questionDetailed.questionID,
                optionId: $scope.optionDetailed.optionID
            }, propertyNumbersOrClient, function (data) {
                $scope.detailedOptionData = angular.copy(data);
                $scope.loadingQuestionnaires = false;
            }, function () {
                $scope.loadingQuestionnaires = false;
            });
        };

        $scope.analyzeYearByYear = function (optionType) {
            return yearByYearOptions.indexOf(optionType) > -1;
        };

        $scope.analyzeNumerically = function (optionType) {
            return numericOptions.indexOf(optionType) > -1;
        };

        $scope.analyzeInModal = function (optionType) {
            return optionsToAnalyzeInModal.indexOf(optionType) > -1;
        };

        $scope.getPropertiesForOption = function (optionAnswerData, questionnaireId) {
            var propertyNumbersOrClient;

            if ($scope.toRefresh.group.questionnaireType === $scope.questionnaireTypeEnum.PROPERTY) {
                propertyNumbersOrClient = optionAnswerData.propertyNumbers;
            } else {
                propertyNumbersOrClient = optionAnswerData.clients;
            }

            $scope.propertiesForExcel = propertyNumbersOrClient;
            $scope.questionnaireForExcel = questionnaireId;

            PropertyLookup.findByPropertyNumbersAsDTO({}, propertyNumbersOrClient, function (data) {
                $scope.propertiesForAnswer = angular.copy(data);
            }, function () {
                $scope.displayMessageInElement('.modal-error', 'An error has occurred while trying to get the list of properties!', 10000)
            });
        };

        $scope.optionAnswersToExcel = function (detailedOptionData) {
            var propertyNumbersOrClient;

            if ($scope.analyzeInModal($scope.optionDetailed.type)) {
                propertyNumbersOrClient = detailedOptionData.map(function (elm) {
                    return elm.propertyNumber;
                });
            } else {
                propertyNumbersOrClient = $scope.propertiesForExcel;
            }

            var data = {
                propertyNumbersOrClients: propertyNumbersOrClient
            };

            var url = contextPath + '/webapi/properties/questionnaire/analytics/' + $scope.questionnaireForExcel + '/' + $scope.questionDetailed.questionID + '/' + $scope.optionDetailed.optionID + '/excelextract';
            $scope.openInNewWindow('POST', url, data);
        };

        $scope.getYearByYearAnswerProperties = function (propertyNumbersOrClients, questionnaireId) {
            if (angular.isUndefined(propertyNumbersOrClients)) {
                return;
            }

            $('#questionAnswerModal').modal('show');
            $scope.propertiesForExcel = propertyNumbersOrClients;
            $scope.questionnaireForExcel = questionnaireId;

            PropertyLookup.findByPropertyNumbersAsDTO({}, propertyNumbersOrClients, function (data) {
                $scope.propertiesForAnswer = angular.copy(data);
            }, function () {
                $scope.displayMessageInElement('.modal-error', 'An error has occurred while trying to get the list of properties!', 10000)
            });
        };

        $scope.questionExcelExtract = function () {
            var propertyNumbersOrClient;

            if ($scope.toRefresh.group.questionnaireType === $scope.questionnaireTypeEnum.PROPERTY) {
                propertyNumbersOrClient = ControllerInfoPasser.get("dashboardPropertyNumbers");
            } else {
                propertyNumbersOrClient = ControllerInfoPasser.get("dashboardPropertyClients");
            }

            var data = {
                propertyNumbers: propertyNumbersOrClient
            };

            var url = contextPath + '/webapi/properties/questionnaire/analytics/' + $scope.toRefresh.id + '/' + $scope.questionDetailed.id + '/excel';
            $scope.openInNewWindow('POST', url, data);
        };

        $scope.parseOptionAnswer = function (answer) {
            var isDate = new moment(answer, 'yyyy-MM-dd').isValid();
            if (isDate) {
                return $filter('date')(answer, 'yyyy-MM-dd', $scope.getTimezoneOffset());
            } else {
                return answer;
            }
        };


        $scope.$on($scope.EVENT_ON_LAST_REPEAT, function () {
            $scope.initializeTooltips();
        });

        $scope.$on('event:distributionFilterChange', function () {
            $scope.getQuestionnairesForProperties(ControllerInfoPasser.get("dashboardPropertyNumbers"));
        });

        $scope.getQuestionnairesForProperties(ControllerInfoPasser.get("dashboardPropertyNumbers"));
    }])
    .controller('PMDashboardCtrl', ['$scope', function ($scope) {

    }])
    .controller('PortfolioDistributionCtrl', ['$scope', '$http', 'contextPath', 'ControllerInfoPasser', 'UserService', 'PropertyLookup', 'SelectedProperty', '$filter', function ($scope, $http, contextPath, ControllerInfoPasser, UserService, PropertyLookup, SelectedProperty, $filter) {
        $scope.loading = true;
        $scope.getMyProperties();

        var typeRestrictions = [];
        var unitRestrictions = [];
        var propertyRestrictions = [];
        var propertyStatusRestrictions = [$scope.propertyStatusEnums.INACTIVE, $scope.propertyStatusEnums.DELETED];
        $scope.fromDateSold = undefined;
        $scope.toDateSold = undefined;

        var unitColors = [];
        var typeColors = [];
        var unitColorsMap = {};
        var typeColorsMap = {};

        var typeChart;
        var unitChart;

        var propertyIDs;
        var propertyNumbers = [];
        var allPropertyNumbers = [];
        var propertyNames = [];

        var propertyTypes = [];
        var propertyUnits = [];

        var exclusionUtilityTypes = [];


        $scope.propertyDtoList = [];
        $scope.propertyListPage = 0;
        $scope.propertyListPageSize = 20;

        $scope.currentUser = ControllerInfoPasser.get("currentUser");
        $scope.dashboardFilters = $scope.currentUser.userProfile.dashboardFilters;

        $scope.selectedDashboardFilter = undefined;

        $scope.units = [];
        $scope.types = [];
        $scope.selectedOwners = [];

        $scope.yearFilter = '';

        $scope.filterToEdit = {};

        $scope.vars = {
            propertyFilter: ''
        };

        $scope.drawTypeDistribution = function (distribution) {
            if ($scope.dashboard.name == 'Property Manager') // PMs do not see the donut charts
            {
                return;
            }

            var arraysToData = [];
            var colors = angular.copy(typeColors);

            arraysToData.push(['Property Type', 'Number of properties']);
            var count = 0;

            if (!$scope.propertyTypes) {
                $scope.propertyTypes = [];
            }

            $scope.propertyTypes.forEach(function (entry) {
                if (typeRestrictions.indexOf(entry) > -1) {
                    colors[count] = '#f2f2f2'
                }
                arraysToData.push([entry, distribution[entry + 'Type']]);
                count++;
            });

            // Create and populate the data table.
            var data = google.visualization.arrayToDataTable(arraysToData);

            if ($scope.companyName != 'Riocan') { // Create and draw the visualization.
                typeChart = new google.visualization.PieChart(document.getElementById('typeChartDiv'));
                typeChart.draw(data, {
                    pieHole: 0.5,
                    legend: {
                        position: 'none'
                    },
                    tooltip: {
                        trigger: 'hover'
                    },
                    pieSliceText: 'none',
                    colors: colors,
                    chartArea: {
                        width: '100%',
                        height: '100%',
                        top: '1%'
                    },
                    enableInteractivity: false,
                    backgroundColor: 'transparent'
                });
            }
        };

        $scope.drawUnitDistribution = function (distribution) {
            if ($scope.dashboard.name == 'Property Manager') // PMs do not see the donut charts
            {
                return;
            }

            var arraysToData = [];
            var colors = angular.copy(unitColors);
            arraysToData.push(['Region', 'Number of Properties']);

            var count = 0;

            if (!$scope.propertyUnits) {
                $scope.propertyUnits = [];
            }

            $scope.propertyUnits.forEach(function (entry) {
                if (unitRestrictions.indexOf(entry) > -1) {
                    colors[count] = '#f2f2f2'
                }

                arraysToData.push([entry, distribution[entry + 'Unit']]);
                count++;
            });

            // Create and populate the data table.
            var data = google.visualization.arrayToDataTable(arraysToData);

            // Create and draw the visualization.
            unitChart = new google.visualization.PieChart(document.getElementById('unitChartDiv'));
            unitChart.draw(data,
                {
                    pieHole: 0.5,
                    legend: {
                        position: 'none'
                    },
                    tooltip: {
                        trigger: 'hover'
                    },
                    pieSliceText: 'none',
                    colors: colors,
                    chartArea: {
                        width: '100%',
                        height: '100%'
                    },
                    enableInteractivity: false,
                    backgroundColor: 'transparent'
                }
            );
        };

        $http.get(contextPath + '/webapi/properties/types').success(function (data) { //$http much better at handling plain text responses
            if (data.length == 0) {
                $scope.propertyTypes = [];
                return;
            }

            $scope.propertyTypes = data;
            $scope.colorGenerator.setNumberRange(0, data.length);

            for (var i = 0; i < data.length; i++) {
                typeColors.push('#' + $scope.colorGenerator.colourAt(i));
                typeColorsMap[data[i]] = '#' + $scope.colorGenerator.colourAt(i);
            }
        });

        $http.get(contextPath + '/webapi/properties/units').success(function (data) { //$http much better at handling plain text responses
            if (data.length == 0) {
                $scope.propertyUnits = [];
                return;
            }

            $scope.propertyUnits = data;
            $scope.colorGenerator.setNumberRange(0, data.length);

            for (var i = 0; i < data.length; i++) {
                unitColors.push('#' + $scope.colorGenerator.colourAt(i));
                unitColorsMap[data[i]] = '#' + $scope.colorGenerator.colourAt(i);
            }
        });

        $scope.toggleTypeRestriction = function (type) {
            var index = typeRestrictions.indexOf(type);

            if (index < 0) {
                typeRestrictions.push(type);
            } else {
                typeRestrictions.splice(index, 1);
            }

            $scope.getPropertyDistribution();
        };

        $scope.toggleUnitRestriction = function (unit) {
            var index = unitRestrictions.indexOf(unit);

            if (index < 0) {
                unitRestrictions.push(unit);
            } else {
                unitRestrictions.splice(index, 1);
            }

            $scope.getPropertyDistribution();
        };

        $scope.togglePropertyRestriction = function (propertyNumber) {
            var index = propertyRestrictions.indexOf(propertyNumber);

            if (index < 0) {
                propertyRestrictions.push(propertyNumber)
            } else {
                propertyRestrictions.splice(index, 1);
            }

            $scope.getPropertyDistribution();
        };

        $scope.toggleStatus = function (status) {
            var index = propertyStatusRestrictions.indexOf(status);

            if (index === -1) {
                propertyStatusRestrictions.push(status);
            } else {
                propertyStatusRestrictions.splice(index, 1);
            }

            if ($scope.isPropertyStatusExcluded($scope.propertyStatusEnums.INACTIVE)) {
                $scope.fromDateSold = undefined;
                $scope.toDateSold = undefined;
            }


            $scope.getPropertyDistribution();
        };

        $scope.isPropertyStatusExcluded = function (status) {
            if (angular.isUndefined(propertyStatusRestrictions)) {
                return false;
            } else {
                return propertyStatusRestrictions.indexOf(status) > -1;
            }
        };

        $scope.getPropertyDistribution = function () {
            // This will leave only excluded clients
            var clients = $scope.difference($scope.propertyOwners, $scope.selectedOwners);

            // Some owner names include & in their name so they need to be encoded to survive the trip up to the server
            angular.forEach(clients, function (owner, index) {
                clients[index] = encodeURIComponent(owner);
            });

            var params = $.param({
                excludedTypes: typeRestrictions,
                excludedRegions: unitRestrictions,
                excludedClients: clients,
                excludedProperties: propertyRestrictions,
                excludedPropertyStatuses: propertyStatusRestrictions,
                fromDateSold: $scope.fullDateToFormattedText($scope.fromDateSold),
                toDateSold: $scope.fullDateToFormattedText($scope.toDateSold)
            }, true);

            $scope.loading = true;

            $http({
                method: 'POST',
                url: contextPath + '/webapi/properties/distribution',
                data: params,
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.distribution = data;
                propertyNumbers = angular.copy(data.propertyNumbers);
                propertyIDs = angular.copy(data.propertyIDs);
                propertyNames = angular.copy(data.propertyNames);
                propertyTypes = angular.copy(data.propertyTypes);
                propertyUnits = angular.copy(data.propertyUnits);
                $scope.propertyDtoList = angular.copy(data.allPropertyDTOs);
                allPropertyNumbers = angular.copy(data.allPropertyNumbers);
                exclusionUtilityTypes = angular.copy(data.propertyUtilityTypesExclusions);

                ControllerInfoPasser.put("dashboardPropertyIDs", propertyIDs);
                ControllerInfoPasser.put("dashboardPropertyNumbers", propertyNumbers);
                ControllerInfoPasser.put("dashboardPropertyNames", propertyNames);
                ControllerInfoPasser.put("dashboardPropertyClients", $scope.selectedOwners);

                ControllerInfoPasser.put("dashboardPropertyTypes", propertyTypes);
                ControllerInfoPasser.put("dashboardPropertyUnits", propertyUnits);
                ControllerInfoPasser.put("dashboardTypeColors", typeColorsMap);
                ControllerInfoPasser.put("dashboardUnitColors", unitColorsMap);

                ControllerInfoPasser.put("dashboardPropertyExclusionUtilityTypes", exclusionUtilityTypes);


                ControllerInfoPasser.broadcast("event:distributionFilterChange", {
                    propertyNumbers: propertyNumbers,
                    propertyIDs: propertyIDs,
                    propertyNames: propertyNames
                });

                $scope.drawTypeDistribution($scope.distribution);
                $scope.drawUnitDistribution($scope.distribution);

                saveLastFilterUsed();
            }).then(function () {
                $scope.loading = false;
            });
        };

        $scope.getOwnersByPropertyNumbers = function () {
            var properties = ControllerInfoPasser.get('myProperties');

            var propertyNumbers = [];
            $(properties).each(function (index, item) {
                propertyNumbers.push(item.propertyNumber);
            });

            var numbers = $.param({propertyNumbers: propertyNumbers}, true);
            $scope.loading = true;
            $http({
                method: 'POST',
                url: contextPath + '/webapi/properties/owners/byPropertyNumbers',
                data: numbers,
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) { //$http much better at handling plain text responses
                if (data.length == 0) {
                    $scope.propertyOwners = [];
                    $scope.selectedOwners = [];
                } else {
                    $scope.propertyOwners = angular.copy(data);
                    $scope.selectedOwners = angular.copy(data);
                }
                checkForLastFilter();
                $scope.getPropertyDistribution();
            }).then(function () {
                $scope.loading = false;
            });
        };

        $scope.listTextStyle = function (item, arr) {
            if (arr == 0) {
                if (typeRestrictions.indexOf(item) > -1) {
                    return "text-muted";
                }
            } else {
                if (unitRestrictions.indexOf(item) > -1) {
                    return "text-muted";
                }
            }

            return "";
        };

        $scope.listStyle = function (item, arr, index) {
            if (arr == 0) {
                if (typeRestrictions.indexOf(item) > -1) {
                    return {
                        "background-color": "#F2F2F2"
                    };
                } else {
                    return {
                        "background-color": typeColors[index]
                    };
                }
            } else {
                if (arr == 1) {
                    if (unitRestrictions.indexOf(item) > -1) {
                        return {
                            "background-color": "#F2F2F2"
                        };
                    } else {
                        return {
                            "background-color": unitColors[index]
                        };
                    }
                } else {
                    return {};
                }
            }

        };

        $scope.propertyListBackground = function (propertyNumber) {
            if (propertyRestrictions.indexOf(propertyNumber) > -1) {
                return "icon-close text-danger";
            } else {
                return "icon-checkmark text-success";
            }
        };

        $scope.allProperties = function () {
            var filteredPropertyNumbers = filterPropertyDTOs();

            propertyRestrictions = $scope.difference(propertyRestrictions, filteredPropertyNumbers);
            $scope.getPropertyDistribution();
        };

        $scope.noProperties = function () {
            var filteredPropertyNumbers = filterPropertyDTOs();

            propertyRestrictions = propertyRestrictions.concat(filteredPropertyNumbers);
            $scope.getPropertyDistribution();
        };

        var filterPropertyDTOs = function () {
            // Progmatically apply filter to PropertyDTOs, then return new array with just those propertyNumbers
            return $filter('filter')($scope.propertyDtoList, $scope.vars.propertyFilter).map(function (property) {
                return property.propertyNumber;
            });
        };

        $scope.isPropertyRestriction = function () {
            if (propertyRestrictions.length == 0) {
                return false;
            } else {
                // If any elements from the restrictions is in the full property list, notify the user
                return propertyRestrictions.some(function (element) {
                    return allPropertyNumbers.indexOf(element) > -1;
                });
            }
        };

        var saveLastFilterUsed = function () {
            var filter = JSON.stringify({
                excludedTypes: typeRestrictions,
                excludedUnits: unitRestrictions,
                excludedClients: $scope.difference($scope.propertyOwners, $scope.selectedOwners),
                excludedProperties: propertyRestrictions,
                excludedPropertyStatuses: propertyStatusRestrictions,
                fromDateSold: $scope.fullDateToFormattedText($scope.fromDateSold),
                toDateSold: $scope.fullDateToFormattedText($scope.toDateSold)
            });

            UserService.updateLastDashboardFilters({username: $scope.currentUser.userProfile.username}, filter, function () {
                $scope.currentUser.userProfile.lastDashboardFilterUsed = filter;
            });
        };

        var checkForLastFilter = function () {
            var lastFilter = $scope.currentUser.userProfile.lastDashboardFilterUsed;
            var lastNamedFilter = $scope.currentUser.userProfile.lastNamedDashboardFilter;

            var lastNamedFilterObj = $scope.searchArrayForProperty($scope.currentUser.userProfile.dashboardFilters, 'name', lastNamedFilter)[0];

            if (angular.isDefined(lastFilter)) {
                applyFilter(lastFilter);
            } else {
                if (angular.isDefined(lastNamedFilterObj)) {
                    applyFilter(lastNamedFilterObj.filter);
                }
            }
            if (angular.isDefined(lastNamedFilterObj)) {
                $scope.selectedDashboardFilter = lastNamedFilterObj;
                $scope.filterToEdit = angular.copy($scope.selectedDashboardFilter);
            }
        };

        var applyFilter = function (filter) {
            var obj = JSON.parse(filter);

            if (angular.isDefined(obj.excludedTypes)) {
                typeRestrictions = obj.excludedTypes;
            }

            if (angular.isDefined(obj.excludedUnits)) {
                unitRestrictions = obj.excludedUnits;
            }

            if (angular.isDefined(obj.excludedProperties)) {
                propertyRestrictions = obj.excludedProperties;
            }

            if (angular.isDefined(obj.excludedPropertyStatuses)) {
                propertyStatusRestrictions = obj.excludedPropertyStatuses;
            }

            $scope.selectedOwners = $scope.difference($scope.propertyOwners, obj.excludedClients);
            $scope.fromDateSold = obj.fromDateSold;
            $scope.toDateSold = obj.toDateSold;
        };

        var saveLastNamedFilterUsed = function (name) {
            UserService.updateLastNamedDashboardFilters({username: $scope.currentUser.userProfile.username}, name, function () {
                $scope.currentUser.userProfile.lastNamedDashboardFilter = name;
            });
        };

        $scope.changeDashboardFilter = function (filter, refresh) {
            applyFilter(filter.filter);
            $scope.selectedDashboardFilter = angular.copy(filter);
            $scope.filterToEdit = angular.copy($scope.selectedDashboardFilter);
            saveLastNamedFilterUsed(filter.name);
            saveLastFilterUsed();
            if (refresh) {
                $scope.getPropertyDistribution();
            }
        };

        $scope.clearAllFilters = function () {
            typeRestrictions.length = 0;
            unitRestrictions.length = 0;
            propertyRestrictions.length = 0;
            propertyStatusRestrictions = [$scope.propertyStatusEnums.INACTIVE, $scope.propertyStatusEnums.DELETED];
            $scope.fromDateSold = undefined;
            $scope.toDateSold = undefined;

            $scope.selectedOwners = angular.copy($scope.propertyOwners);
            $scope.selectedDashboardFilter = undefined;
            saveLastNamedFilterUsed(undefined);
            $scope.getPropertyDistribution();
        };

        $scope.saveNamedFilter = function () {
            $scope.filterToEdit.filter = $scope.currentUser.userProfile.lastDashboardFilterUsed;

            if (angular.isDefined($scope.selectedDashboardFilter) && $scope.filterToEdit.name !== $scope.selectedDashboardFilter.name) {
                $scope.filterToEdit.id = undefined;
            }

            UserService.saveDashboardFilter({
                username: $scope.currentUser.userProfile.username
            }, $scope.filterToEdit, function (data) {
                $scope.dashboardFilters = data;
                $scope.changeDashboardFilter($scope.searchArrayForProperty(data, 'name', $scope.filterToEdit.name)[0], false);
                $('#filtersModal').modal('hide');
            }, function (httpResponse) {
                var elem = $("#saveFilterError");
                switch (httpResponse.status) {
                    case 405:
                        elem.attr('class', 'text-warning');
                        elem.html("A filter named '" + $scope.filterToEdit.name + "' already exists. Please use a different name.");
                        break;
                    default:
                        elem.attr('class', 'text-danger');
                        elem.html("An error has occurred saving the filter!");
                }

                $scope.timeout(function () {
                    elem.html("");
                }, 10000)
            })
        };

        $scope.markFilterForDeletion = function (filter) {
            $('#filtersModal').modal('hide');
            $scope.filterToDelete = filter;
        };

        $scope.deleteNamedFilter = function () {
            UserService.deleteDashboardFilter({
                username: $scope.currentUser.userProfile.username,
                filterId: $scope.filterToDelete.id
            }, function (data) {
                if (angular.isDefined($scope.selectedDashboardFilter) && $scope.filterToDelete.name === $scope.selectedDashboardFilter.name) {
                    $scope.filterToEdit = undefined;
                    $scope.selectedDashboardFilter = undefined;
                    saveLastNamedFilterUsed(undefined);
                }
                $scope.dashboardFilters = data;
                $scope.filterToDelete = undefined;

                $('#deleteFiltersModal').modal('hide');
                $('#filtersModal').modal('show');
            }, function () {
                $scope.displayMessageInElement('#deleteFilterError', "An error has occurred deleting the filter!", 10000);
            })
        };

        $scope.filterIsModified = function () {
            if (angular.isUndefined($scope.selectedDashboardFilter)) {
                return false;
            }

            return $scope.selectedDashboardFilter.filter !== $scope.currentUser.userProfile.lastDashboardFilterUsed;
        };

        $scope.getPropertyGLAReport = function () {
            $scope.openInNewWindow("POST", contextPath + "/webapi/properties/glaReport", {properties: ControllerInfoPasser.get("dashboardPropertyNumbers")});
        };

        $scope.jumpToDashboardModule = function (propertyNumber) {
            var module = ControllerInfoPasser.get("lastModuleVisited");
            if (angular.isUndefined(module)) {
                module = $scope.enumToModuleName($scope.activeModulesAll[0].moduleEnum);
            }

            PropertyLookup.get({propertyNumber: propertyNumber}, function (data) {
                SelectedProperty.setSelectedProperty(data);
                $scope.goToModule(module, "", false);
                $scope.hideModalAndClearCSS('#propertyModal');
            }, function () {
                $scope.displayMessageInElement('#propertyModalError', 'An error has occurred retrieving property ' + propertyNumber, 10000)
            });
        };


        $scope.$on('event:yearlyQuestionnaireNameChanged', function (event) {
            $scope.selectedYearlyQuestionnaireName = ControllerInfoPasser.get("selectedYearlyQuestionnaireName");
            ControllerInfoPasser.broadcast("event:distributionYearFilterChange", {
                questionnaire: $scope.selectedYearlyQuestionnaireName,
                propertyNumbers: ControllerInfoPasser.get("dashboardPropertyNumbers"),
                propertyIDs: ControllerInfoPasser.get("dashboardPropertyIDs")
            });
        });


        $scope.$on('event:myPropertiesChange', function (event, properties) {
            $scope.getOwnersByPropertyNumbers();
        });

        $scope.$on("event:distributionRequest", function () {
            ControllerInfoPasser.broadcast("event:distributionFilterChange", {
                propertyNumbers: propertyNumbers,
                propertyIDs: propertyIDs
            });
        });

        $scope.$on($scope.EVENT_ON_LAST_REPEAT, function (event) {
            $scope.initializeTooltips();
        });

        $scope.$on('event:togglePropertyRestriction', function(event, propertyNumber) {
            $scope.togglePropertyRestriction(propertyNumber);
        });

    }])
    .controller('CertificationDistCtrl', ['$scope', '$http', 'contextPath', 'QuestionnaireService', function ($scope, $http, contextPath, QuestionnaireService) {

        $scope.questionnaireSubType = $scope.questionnaireSubTypes.YEARLY;

        $scope.$on('event:distributionYearFilterChange', function (event, dataPassed) {
            $scope.selectedYearlyQuestionnaireName = dataPassed.questionnaire;
        });

        $scope.drawCertificationChart = function (data, target, colorList) {
            // Create and draw the visualization.
            new google.visualization.PieChart(document.getElementById(target)).
                draw(data, {
                    pieHole: 0.5,
                    legend: {
                        position: 'none'
                    },
                    tooltip: {
                        trigger: 'hover'
                    },
                    pieSliceText: 'none',
                    colors: colorList,
                    chartArea: {
                        width: '100%',
                        height: '100%',
                        top: '1%'
                    },
                    enableInteractivity: false,
                    backgroundColor: 'transparent'
                });
        };

        $scope.refresh = function (propertyNumbers, certification, questionnaireSubType, selectedQuestionnaire, functionToCall) {

            if (angular.isDefined(selectedQuestionnaire)) {
                $scope.loading = true;
                if (angular.isDefined(propertyNumbers)) {
                    QuestionnaireService.getScoreDistribution({
                        questionnaireId: selectedQuestionnaire.id,
                        scoreType: certification
                    }, propertyNumbers, functionToCall);
                }
            }
        };
    }])
    .controller('LEEDCtrl', ['$scope', 'ControllerInfoPasser', 'QuestionnaireService', function ($scope, ControllerInfoPasser, QuestionnaireService) {
        var colorList = ["#E5E4E2", "#F7BA4D", "#A0A0A0", "#4F7CB5"];
        $scope.certifications = ["Platinum", "Gold", "Silver", "Certified"];

        var refreshLeedNumbers = function (event, propertyList) {
            $scope.refresh(propertyList.propertyNumbers, 'LEED', $scope.questionnaireSubType, $scope.selectedYearlyQuestionnaireName, function (data) {
                $scope.distribution = data;

                $scope.total = 0;

                $.each(data, function (index, value) {
                    if (angular.isNumber(value)) {
                        $scope.total += value;
                    }
                });

                $scope.loading = false;
            });
        };

        $scope.listStyle = function (index) {
            return {
                "background-color": colorList[index]
            };
        };

        $scope.getLEEDScoreForProperty = function () {
            if (angular.isDefined($scope.selectedYearlyQuestionnaireName)) {

                var questionnaire = ControllerInfoPasser.get("selectedYearlyQuestionnaireName");
                if (angular.isDefined(questionnaire) && questionnaire != $scope.selectedYearlyQuestionnaireName) {
                    $scope.selectedYearlyQuestionnaireName = questionnaire;
                }

                QuestionnaireService.getScoreFromType({
                    scoreType: 'LEED',
                    propertyNum: $scope.getSelectedProperty().propertyNumber,
                    questionnaireId: $scope.selectedYearlyQuestionnaireName.id
                }, function (data) {
                    $scope.leedScoreObj = data;
                });
            }
        };

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, category) {
            $scope.getLEEDScoreForProperty();
        });

        $scope.$on('event:distributionFilterChange', refreshLeedNumbers);

        $scope.$on("event:distributionYearFilterChange", refreshLeedNumbers);

        $scope.$on('event:riskCarouselChanged', function (event, carouselValue) {
            $scope.selectedYearlyQuestionnaireName = angular.copy(carouselValue);
            $scope.getLEEDScoreForProperty();
        });
    }])
    .controller('BOMABEStCtrl', ['$scope', 'ControllerInfoPasser', 'QuestionnaireService', '$filter', function ($scope, ControllerInfoPasser, QuestionnaireService, $filter) {
        var colorList = ["#367FA3", "#688F8F", "#80A26A", "#99B544"];
        $scope.certifications = ["Level I", "Level II", "Level III", "Level IV"];

        var refreshBOMANumbers = function (event, propertyList) {
            $scope.refresh(propertyList.propertyNumbers, 'BOMABESt', $scope.questionnaireSubType, $scope.selectedYearlyQuestionnaireName, function (data) {
                $scope.distribution = data;

                $scope.total = 0;

                $.each(data, function (index, value) {
                    if (angular.isNumber(value)) {
                        $scope.total += value;
                    }
                });

                $scope.loading = false;
            });
        };

        $scope.listStyle = function (index) {
            return {
                "background-color": colorList[index]
            };
        };

        $scope.getBomaScoreForProperty = function () {
            if (angular.isDefined($scope.selectedYearlyQuestionnaireName)) {

                var questionnaire = ControllerInfoPasser.get("selectedYearlyQuestionnaireName");
                if (angular.isDefined(questionnaire) && questionnaire != $scope.selectedYearlyQuestionnaireName) {
                    $scope.selectedYearlyQuestionnaireName = questionnaire;
                }

                QuestionnaireService.getScoreFromType({
                    scoreType: 'BOMABESt',
                    propertyNum: $scope.getSelectedProperty().propertyNumber,
                    questionnaireId: $scope.selectedYearlyQuestionnaireName.id
                }, function (data) {
                    $scope.bomaScoreObj = data;
                });
            }
        };

        $scope.certificationToString = function (cert) {
            var certSplit = cert.split("_");
            certSplit[0] = $filter('enumToString')(certSplit[0]);
            return certSplit[0] + " " + certSplit[1];
        };

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, category) {
            $scope.getBomaScoreForProperty();
        });

        $scope.$on('event:distributionFilterChange', refreshBOMANumbers);

        $scope.$on("event:distributionYearFilterChange", refreshBOMANumbers);

        $scope.$on('event:riskCarouselChanged', function (event, carouselValue) {
            $scope.selectedYearlyQuestionnaireName = angular.copy(carouselValue);
            $scope.getBomaScoreForProperty();
        });
    }])
    .controller('SummaryCtrl', ['$scope', '$http', 'contextPath', 'ControllerInfoPasser', 'QuestionnaireService', function ($scope, $http, contextPath, ControllerInfoPasser, QuestionnaireService) {
        $scope.questionnaireSubType = $scope.questionnaireSubTypes.YEARLY;
        $scope.selectedYearlyQuestionnaireName = ControllerInfoPasser.get('selectedYearlyQuestionnaireName');

        $scope.$on('event:distributionYearFilterChange', function (event, dataPassed) {
            $scope.selectedYearlyQuestionnaireName = dataPassed.questionnaire;
            $scope.refreshKPIInfo(dataPassed);
        });

        $scope.$on('event:distributionFilterChange', function (event, properties) {
            $scope.refreshKPIInfo(properties);
            refreshGrossLeaseArea(properties);
        });

        $scope.kpiPerfect = 0;
        $scope.kpiPerfectTotal = 0;
        $scope.energyStarAverage = 0;
        $scope.energyStarAverageTotal = 0;
        $scope.GLA = 0;


        var refreshGrossLeaseArea = function (properties) {
            $http({
                method: 'POST',
                url: contextPath + '/webapi/properties/grossLeaseArea',
                data: $.param({propertyNumbers: properties.propertyNumbers}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.GLA = data;
            });
        };

        $scope.refreshKPIInfo = function (properties) {
            var propertyNumbers;

            if (angular.isDefined(properties) && angular.isDefined(properties.propertyNumbers)) {
                $scope.totalProperties = properties.propertyNumbers.length;
                propertyNumbers = properties.propertyNumbers;
            }
            else {
                $scope.totalProperties = 0;
                propertyNumbers = ControllerInfoPasser.get('dashboardPropertyNumbers');
            }

            if (angular.isUndefined(propertyNumbers) || angular.isUndefined($scope.selectedYearlyQuestionnaireName)) {
                return;
            }

            var yearlyQuestionnaireName = $scope.selectedYearlyQuestionnaireName.questionnaireName;
            var questionnaireSubType = $scope.questionnaireSubType;

            $http({
                method: 'POST',
                url: contextPath + '/webapi/questionnairescores/certifications/distribution/' + $scope.selectedYearlyQuestionnaireName.id + '/KPI/perfect',
                data: $.param({propertyNumbers: propertyNumbers}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                if (angular.isObject(data)) {
                    $scope.kpiPerfect = data.perfects.length;
                    $scope.kpiPerfectTotal = data.totalAnswered;
                }
            });

            $http({
                method: 'POST',
                url: contextPath + '/webapi/questionnairescores/certifications/distribution/' + $scope.selectedYearlyQuestionnaireName.id + '/ENERGY_STAR/average',
                data: $.param({propertyNumbers: propertyNumbers}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.energyStarAverage = data.average;
                $scope.energyStarAverageTotal = data.total;
            });
        };

        $scope.singlePropertyLookup = function () {
            if (angular.isDefined($scope.selectedYearlyQuestionnaireName)) {
                QuestionnaireService.getScoreFromType({
                    propertyNum: $scope.getSelectedProperty().propertyNumber,
                    questionnaireId: $scope.selectedYearlyQuestionnaireName.id,
                    scoreType: 'KPI'
                }, function (data) {
                    if (data.score) {
                        $scope.propertyKPI = data.score;
                    } else {
                        $scope.propertyKPI = 0;
                    }
                });
                QuestionnaireService.getMaxScoreFromType({
                    questionnaireId: $scope.selectedYearlyQuestionnaireName.id,
                    scoreType: 'KPI'
                }, function (data) {
                    $scope.kpiMaximum = data.maxScore;
                });
                QuestionnaireService.getScoreFromType({
                    propertyNum: $scope.getSelectedProperty().propertyNumber,
                    questionnaireId: $scope.selectedYearlyQuestionnaireName.id,
                    scoreType: 'ENERGY_STAR'
                }, function (data) {
                    if (data.score) {
                        $scope.propertyEnergyStar = data.score;
                    } else {
                        $scope.propertyEnergyStar = 0;
                    }
                });
            }
            $scope.refreshKPIInfo({propertyNumbers: [$scope.currentProperty]});
        };

        if ($scope.getCurrentModule().length > 0) { // Not on dashboard, have to get single property info
            $scope.singlePropertyLookup();
        }

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, newProperty) {
            $scope.selectedYearlyQuestionnaireName = ControllerInfoPasser.get("selectedYearlyQuestionnaireName");
            if (newProperty) {
                $scope.singlePropertyLookup();
            }
            //} else if (angular.isDefined(selectedYear) && selectedYear != $scope.selectedYearlyQuestionnaireName) {
            //    $scope.selectedYearlyQuestionnaireName = selectedYear;
            //    $scope.singlePropertyLookup();
            //}
        });

        $scope.$on('event:riskCarouselChanged', function (event, carouselValue) {
            $scope.selectedYearlyQuestionnaireName = angular.copy(carouselValue);
            $scope.singlePropertyLookup();
        });

        $scope.refreshKPIInfo();
    }])
    .controller('EnvironmentalDashboardCtrl', ['$scope', '$q', '$http', 'contextPath', 'ControllerInfoPasser', 'SelectedProperty', '$location', 'PropertyLookup', function ($scope, $q, $http, contextPath, ControllerInfoPasser, SelectedProperty, $location, PropertyLookup) {
        var links = ['Asbestos Material', 'PCB Equipment', 'Mould', 'Secondary Hazardous Substance', 'Underground Storage Tank', 'Aboveground Storage Tank', 'Investigation', 'Remediation'];

        $scope.content = [];
        $scope.informationSource = "Properties";

        $scope.$on('event:distributionFilterChange', function (event, properties) {
            $scope.refreshPropertyInfo(properties.propertyIDs);
        });

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, category) {
            if ($scope.getCurrentModule() === 'environmental') {
                $scope.refreshPropertyInfo();
            }
        });

        $scope.extractValue = function (environmentalData) {
            if (angular.isArray(environmentalData)) {
                return environmentalData.length;
            } else {
                return environmentalData;
            }
        };

        $scope.refreshPropertyInfo = function (propertyIDs) {

            if ($scope.getCurrentModule() === 'environmental') {

                $scope.informationSource = "Records";

                var currentProperty = SelectedProperty.getSelectedProperty();
                propertyIDs = [];
                propertyIDs.push(currentProperty.id);

                // These functions are generic
                $scope.populateContentWithStraightRecordCount(propertyIDs);
                $scope.populateContentWithStatusSuspectedRecordCount(propertyIDs);
                $scope.populateContentWithStatusPresentRecordCount(propertyIDs);

                // These functions are specialized
                $scope.populateContentWithConfirmedAsbestosInFairOrPoorConditionRecordCount(propertyIDs);
                $scope.populateContentWithConfirmedPCBEquipmentRecordCount(propertyIDs);

                $scope.countTenantRecordsWithHighEstimatedRisk(propertyIDs);
                $scope.countTenantRecordsWithModerateEstimatedRisk(propertyIDs);
                /*$scope.countAllRecordsWithHighEstimatedRisk( propertyIDs );
                 $scope.countAllRecordsWithModerateEstimatedRisk( propertyIDs );*/

            } else {
                $scope.informationSource = "Properties";
                if (!propertyIDs) {
                    propertyIDs = ControllerInfoPasser.get('dashboardPropertyIDs');
                }

                if (propertyIDs) {
                    // $scope.populateContentWithStraightRecordsPropertyCount( propertyIDs );
                    $scope.populateContentWithStatusSuspectedOrPresentRecordsPropertyCount(propertyIDs);

                    // These functions are specialized
                    $scope.populateContentWithConfirmedAsbestosInFairOrPoorConditionRecordsPropertyCount(propertyIDs);
                    $scope.populateContentWithConfirmedPCBRecordsPropertyCount(propertyIDs);
                    $scope.countAllPropertiesWithInvestigationActiveIssueYes(propertyIDs);
                    $scope.countAllPropertiesWithRemediationStatusMonitorOrInProgress(propertyIDs);

                    $scope.countAllPropertyWithHighOrModerateRiskTenants(propertyIDs);
                }


            }
        };

        $scope.tenantRecordsWithHighEstimatedRisk = 0;
        $scope.countTenantRecordsWithHighEstimatedRisk = function (propertyIDs) {
            $scope.tenantRecordsWithHighEstimatedRisk = 0;
            $http({
                method: 'POST',
                url: contextPath + '/webapi/propertydocuments/Tenant Risk Level/contents/estimatedRisk/High/count',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.tenantRecordsWithHighEstimatedRisk = $scope.tenantRecordsWithHighEstimatedRisk + parseInt(data);
            });

            $http({
                method: 'POST',
                url: contextPath + '/webapi/buildingdocuments/Tenant Risk Level/contents/estimatedRisk/High/count',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.tenantRecordsWithHighEstimatedRisk = $scope.tenantRecordsWithHighEstimatedRisk + parseInt(data);
            });

            $http({
                method: 'POST',
                url: contextPath + '/webapi/floordocuments/Tenant Risk Level/contents/estimatedRisk/High/count',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.tenantRecordsWithHighEstimatedRisk = $scope.tenantRecordsWithHighEstimatedRisk + parseInt(data);
            });

            $http({
                method: 'POST',
                url: contextPath + '/webapi/roomdocuments/Tenant Risk Level/contents/estimatedRisk/High/count',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.tenantRecordsWithHighEstimatedRisk = $scope.tenantRecordsWithHighEstimatedRisk + parseInt(data);
            });
        };

        $scope.tenantRecordsWithModerateEstimatedRisk = 0;
        $scope.countTenantRecordsWithModerateEstimatedRisk = function (propertyIDs) {
            $scope.tenantRecordsWithModerateEstimatedRisk = 0;
            $http({
                method: 'POST',
                url: contextPath + '/webapi/propertydocuments/Tenant Risk Level/contents/estimatedRisk/Moderate/count',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.tenantRecordsWithModerateEstimatedRisk = $scope.tenantRecordsWithModerateEstimatedRisk + parseInt(data);
            });

            $http({
                method: 'POST',
                url: contextPath + '/webapi/buildingdocuments/Tenant Risk Level/contents/estimatedRisk/Moderate/count',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.tenantRecordsWithModerateEstimatedRisk = $scope.tenantRecordsWithModerateEstimatedRisk + parseInt(data);
            });

            $http({
                method: 'POST',
                url: contextPath + '/webapi/floordocuments/Tenant Risk Level/contents/estimatedRisk/Moderate/count',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.tenantRecordsWithModerateEstimatedRisk = $scope.tenantRecordsWithModerateEstimatedRisk + parseInt(data);
            });

            $http({
                method: 'POST',
                url: contextPath + '/webapi/roomdocuments/Tenant Risk Level/contents/estimatedRisk/Moderate/count',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.tenantRecordsWithModerateEstimatedRisk = $scope.tenantRecordsWithModerateEstimatedRisk + parseInt(data);
            });
        };

        $scope.countAllPropertiesWithRemediationStatusMonitorOrInProgress = function (propertyIDs) {
            $scope.content['Remediation'] = 0;
            $http({
                method: 'POST',
                url: contextPath + '/webapi/properties/Remediation/contents/remediationStatus/Monitor/remediationStatus/In Progress/propertiesWithDocumentTypesAndTwoORPrereq',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.content['Remediation'] = data;
            });
        };

        $scope.countAllPropertyWithHighOrModerateRiskTenants = function (propertyIDs) {
            $scope.propertiesWithHighRiskTenants = 0;
            $scope.propertiesWithHighRiskTenantsLoading = true;
            $scope.propertiesWithModerateRiskTenantsLoading = true;
            $http({
                method: 'POST',
                url: contextPath + '/webapi/properties/Tenant Risk Level/contents/estimatedRisk/High/estimatedRisk/Moderate/propertiesWithDocumentTypesAndTwoORPrereq',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.content['High or Moderate Risk Tenants'] = data;
                $scope.propertiesWithHighRiskTenants = parseInt(data.length);
                $scope.propertiesWithModerateRiskTenants = 0;
                $scope.propertiesWithHighRiskTenantsLoading = false;
                $scope.propertiesWithModerateRiskTenantsLoading = false;
            });
        };

        $scope.populateContentWithConfirmedPCBRecordsPropertyCount = function (propertyIDs) {
            $scope.content['PCB Equipment'] = 0;
            $scope.content['PCB Storage Location'] = 0;
            $scope.propertiesWithConfirmedPCBsLoading = true;
            $http({
                method: 'POST',
                url: contextPath + '/webapi/properties/contents/propertiesWithConfirmedPCBs',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.content['PCB Equipment'] = data;
                $scope.content['PCB Storage Location'] = 0;
                $scope.propertiesWithConfirmedPCBsLoading = false;
            });
        };

        $scope.populateContentWithStatusSuspectedOrPresentRecordsPropertyCount = function (propertyIDs) {
            var linksForStatusSuspectedOrPresentPropertyCount = ['Mould', 'Underground Storage Tank', 'Aboveground Storage Tank'];

            $scope.propertiesWithRecordStatusSuspectedOrPresentLoading = true;
            $(linksForStatusSuspectedOrPresentPropertyCount).each(function (index, entry) {
                $scope.content[entry] = 0;
                $http({
                    method: 'POST',
                    url: contextPath + '/webapi/properties/' + entry + '/contents/status/Suspected/status/Present/propertiesWithDocumentTypesAndTwoORPrereq',
                    data: $.param({propertyIDs: propertyIDs}, true),
                    headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
                }).success(function (data) {
                    $scope.propertiesWithRecordStatusSuspectedOrPresentLoading = false;
                    $scope.content[entry] = data;
                });
            });
        };

        $scope.populateContentWithStraightRecordsPropertyCount = function (propertyIDs) {
            var linksForStraightPropertyCount = ['PCB Storage Location'];

            $(linksForStraightPropertyCount).each(function (index, entry) {
                $scope.content[entry] = 0;
                $http({
                    method: 'POST',
                    url: contextPath + '/webapi/properties/' + entry + '/contents/countPropertiesWithDocTypes',
                    data: $.param({propertyIDs: propertyIDs}, true),
                    headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
                }).success(function (data) {
                    $scope.content[entry] = parseInt(data);
                });
            });
        };

        $scope.propertiesWithConfirmedAsbestosLoading = false;
        $scope.populateContentWithConfirmedAsbestosInFairOrPoorConditionRecordsPropertyCount = function (propertyIDs) {
            $scope.content['Asbestos Material'] = 0;

            $scope.propertiesWithConfirmedAsbestosLoading = true;

            $http({
                method: 'POST',
                url: contextPath + '/webapi/properties/contents/propertiesWithConfirmedAsbestosInFairORPoorCondition',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.propertiesWithConfirmedAsbestosLoading = false;
                $scope.content['Asbestos Material'] = data;
            });
        };

        $scope.countAllPropertiesWithInvestigationActiveIssueYes = function (propertyIDs) {
            $scope.content['Investigation'] = 0;

            $http({
                method: 'POST',
                url: contextPath + '/webapi/properties/Investigation/contents/activeIssue/Yes/propertiesWithDocTypesAndPrereq',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.content['Investigation'] = data;
            });
        };

        $scope.propertiesWithConfirmedPCBsLoading = false;
        $scope.propertiesWithConfirmedAsbestosLoading = false;

        $scope.propertiesWithModerateRiskTenantsLoading = false;
        $scope.propertiesWithHighRiskTenantsLoading = false;

        $scope.propertiesWithRecordStatusSuspectedOrPresentLoading = false;

        $scope.populateContentWithStraightRecordCount = function (propertyIDs) {
            var linksForStraightRecordCount = ['PCB Storage Location'];

            $(linksForStraightRecordCount).each(function (index, entry) {
                $scope.content[entry] = 0;
                $http({
                    method: 'POST',
                    url: contextPath + '/webapi/propertydocuments/' + entry + '/count',
                    data: $.param({propertyIDs: propertyIDs}, true),
                    headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
                }).success(function (data) {
                    $scope.content[entry] = $scope.content[entry] + parseInt(data);
                });

                $http({
                    method: 'POST',
                    url: contextPath + '/webapi/buildingdocuments/' + entry + '/count',
                    data: $.param({propertyIDs: propertyIDs}, true),
                    headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
                }).success(function (data) {
                    $scope.content[entry] = $scope.content[entry] + parseInt(data);
                });

                $http({
                    method: 'POST',
                    url: contextPath + '/webapi/floordocuments/' + entry + '/count',
                    data: $.param({propertyIDs: propertyIDs}, true),
                    headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
                }).success(function (data) {
                    $scope.content[entry] = $scope.content[entry] + parseInt(data);
                });

                $http({
                    method: 'POST',
                    url: contextPath + '/webapi/roomdocuments/' + entry + '/count',
                    data: $.param({propertyIDs: propertyIDs}, true),
                    headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
                }).success(function (data) {
                    $scope.content[entry] = $scope.content[entry] + parseInt(data);
                });
            });
        };

        $scope.populateContentWithStatusSuspectedRecordCount = function (propertyIDs) {
            var linksForStatusSuspectedRecordCount = ['Mould', 'Underground Storage Tank', "Aboveground Storage Tank"];

            $(linksForStatusSuspectedRecordCount).each(function (index, entry) {
                $scope.content[entry] = 0;
                $http({
                    method: 'POST',
                    url: contextPath + '/webapi/propertydocuments/' + entry + '/contents/status/Suspected/count',
                    data: $.param({propertyIDs: propertyIDs}, true),
                    headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
                }).success(function (data) {
                    $scope.content[entry] = $scope.content[entry] + parseInt(data);
                });

                $http({
                    method: 'POST',
                    url: contextPath + '/webapi/buildingdocuments/' + entry + '/contents/status/Suspected/count',
                    data: $.param({propertyIDs: propertyIDs}, true),
                    headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
                }).success(function (data) {
                    $scope.content[entry] = $scope.content[entry] + parseInt(data);
                });

                $http({
                    method: 'POST',
                    url: contextPath + '/webapi/floordocuments/' + entry + '/contents/status/Suspected/count',
                    data: $.param({propertyIDs: propertyIDs}, true),
                    headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
                }).success(function (data) {
                    $scope.content[entry] = $scope.content[entry] + parseInt(data);
                });

                $http({
                    method: 'POST',
                    url: contextPath + '/webapi/roomdocuments/' + entry + '/contents/status/Suspected/count',
                    data: $.param({propertyIDs: propertyIDs}, true),
                    headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
                }).success(function (data) {
                    $scope.content[entry] = $scope.content[entry] + parseInt(data);
                });
            });
        };

        $scope.populateContentWithStatusPresentRecordCount = function (propertyIDs) {
            var linksForStatusPresentRecordCount = ['Mould', 'Underground Storage Tank', "Aboveground Storage Tank"];

            $(linksForStatusPresentRecordCount).each(function (index, entry) {
                $scope.content[entry] = 0;
                $http({
                    method: 'POST',
                    url: contextPath + '/webapi/propertydocuments/' + entry + '/contents/status/Present/count',
                    data: $.param({propertyIDs: propertyIDs}, true),
                    headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
                }).success(function (data) {
                    $scope.content[entry] = $scope.content[entry] + parseInt(data);
                });

                $http({
                    method: 'POST',
                    url: contextPath + '/webapi/buildingdocuments/' + entry + '/contents/status/Present/count',
                    data: $.param({propertyIDs: propertyIDs}, true),
                    headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
                }).success(function (data) {
                    $scope.content[entry] = $scope.content[entry] + parseInt(data);
                });

                $http({
                    method: 'POST',
                    url: contextPath + '/webapi/floordocuments/' + entry + '/contents/status/Present/count',
                    data: $.param({propertyIDs: propertyIDs}, true),
                    headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
                }).success(function (data) {
                    $scope.content[entry] = $scope.content[entry] + parseInt(data);
                });

                $http({
                    method: 'POST',
                    url: contextPath + '/webapi/roomdocuments/' + entry + '/contents/status/Present/count',
                    data: $.param({propertyIDs: propertyIDs}, true),
                    headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
                }).success(function (data) {
                    $scope.content[entry] = $scope.content[entry] + parseInt(data);
                });
            });
        };

        $scope.populateContentWithConfirmedAsbestosInFairOrPoorConditionRecordCount = function (propertyIDs) {
            $scope.content['Asbestos Material'] = 0;
            $http({
                method: 'POST',
                url: contextPath + '/webapi/propertydocuments/specializedQuery/countConfirmedAsbestosInFairORGoodCondition/',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.content['Asbestos Material'] = $scope.content['Asbestos Material'] + parseInt(data);
            });

            $http({
                method: 'POST',
                url: contextPath + '/webapi/buildingdocuments/specializedQuery/countConfirmedAsbestosInFairORGoodCondition/',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.content['Asbestos Material'] = $scope.content['Asbestos Material'] + parseInt(data);
            });

            $http({
                method: 'POST',
                url: contextPath + '/webapi/floordocuments/specializedQuery/countConfirmedAsbestosInFairORGoodCondition/',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.content['Asbestos Material'] = $scope.content['Asbestos Material'] + parseInt(data);
            });

            $http({
                method: 'POST',
                url: contextPath + '/webapi/roomdocuments/specializedQuery/countConfirmedAsbestosInFairORGoodCondition/',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.content['Asbestos Material'] = $scope.content['Asbestos Material'] + parseInt(data);
            });
        };

        $scope.populateContentWithConfirmedPCBEquipmentRecordCount = function (propertyIDs) {
            $scope.content['PCB Equipment'] = 0;

            $http({
                method: 'POST',
                url: contextPath + '/webapi/propertydocuments/PCB Equipment/contents/pcbContaining/Yes/status/Removed/withAndWithoutCount',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.content['PCB Equipment'] = $scope.content['PCB Equipment'] + parseInt(data);
            });

            $http({
                method: 'POST',
                url: contextPath + '/webapi/buildingdocuments/PCB Equipment/contents/pcbContaining/Yes/status/Removed/withAndWithoutCount',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.content['PCB Equipment'] = $scope.content['PCB Equipment'] + parseInt(data);
            });

            $http({
                method: 'POST',
                url: contextPath + '/webapi/floordocuments/PCB Equipment/contents/pcbContaining/Yes/status/Removed/withAndWithoutCount',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.content['PCB Equipment'] = $scope.content['PCB Equipment'] + parseInt(data);
            });

            $http({
                method: 'POST',
                url: contextPath + '/webapi/roomdocuments/PCB Equipment/contents/pcbContaining/Yes/status/Removed/withAndWithoutCount',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.content['PCB Equipment'] = $scope.content['PCB Equipment'] + parseInt(data);
            });

        };

        $scope.recordsWithHighEstimatedRisk = 0;
        $scope.countAllRecordsWithHighEstimatedRisk = function (propertyIDs) {
            $scope.recordsWithHighEstimatedRisk = 0;
            $http({
                method: 'POST',
                url: contextPath + '/webapi/propertydocuments/contents/estimatedRisk/High/countExcludeStatusRemoved',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.recordsWithHighEstimatedRisk = $scope.recordsWithHighEstimatedRisk + parseInt(data);
            });

            $http({
                method: 'POST',
                url: contextPath + '/webapi/buildingdocuments/contents/estimatedRisk/High/countExcludeStatusRemoved',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.recordsWithHighEstimatedRisk = $scope.recordsWithHighEstimatedRisk + parseInt(data);
            });

            $http({
                method: 'POST',
                url: contextPath + '/webapi/floordocuments/contents/estimatedRisk/High/countExcludeStatusRemoved',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.recordsWithHighEstimatedRisk = $scope.recordsWithHighEstimatedRisk + parseInt(data);
            });

            $http({
                method: 'POST',
                url: contextPath + '/webapi/roomdocuments/contents/estimatedRisk/High/countExcludeStatusRemoved',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.recordsWithHighEstimatedRisk = $scope.recordsWithHighEstimatedRisk + parseInt(data);
            });
        };

        $scope.recordsWithModerateEstimatedRisk = 0;
        $scope.countAllRecordsWithModerateEstimatedRisk = function (propertyIDs) {
            $scope.recordsWithModerateEstimatedRisk = 0;

            $http({
                method: 'POST',
                url: contextPath + '/webapi/propertydocuments/contents/estimatedRisk/Moderate/countExcludeStatusRemoved',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.recordsWithModerateEstimatedRisk = $scope.recordsWithModerateEstimatedRisk + parseInt(data);
            });

            $http({
                method: 'POST',
                url: contextPath + '/webapi/buildingdocuments/contents/estimatedRisk/Moderate/countExcludeStatusRemoved',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.recordsWithModerateEstimatedRisk = $scope.recordsWithModerateEstimatedRisk + parseInt(data);
            });

            $http({
                method: 'POST',
                url: contextPath + '/webapi/floordocuments//contents/estimatedRisk/Moderate/countExcludeStatusRemoved',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.recordsWithModerateEstimatedRisk = $scope.recordsWithModerateEstimatedRisk + parseInt(data);
            });

            $http({
                method: 'POST',
                url: contextPath + '/webapi/roomdocuments/contents/estimatedRisk/Moderate/countExcludeStatusRemoved',
                data: $.param({propertyIDs: propertyIDs}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.recordsWithModerateEstimatedRisk = $scope.recordsWithModerateEstimatedRisk + parseInt(data);
            });
        };

        $scope.detailsData = [];
        $scope.getDetails = function (title, environmentalMenuId) {
            if ($scope.getCurrentModule().length > 0) {
                return;
            }

            $('#modalTitle').text(title);
            $scope.dashboardNumberDetailsRecordTypeMenuId = angular.copy(environmentalMenuId);
            $scope.loadingPropertyDetails = true;

            $scope.detailsData.length = 0;
            $http({
                method: 'POST',
                url: contextPath + '/webapi/properties/findByPropertyIDsAsDTO',
                data: $.param({propertyIDs: $scope.content[title]}, true),
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                $scope.loadingPropertyDetails = false;
                $scope.detailsData = data;
            });

            $('#dashboardNumberDetails').modal('show');
        };

        $scope.dashboardNumberDetailsClicked = false;
        $scope.openEnvironmentalRecordList = function (property) {
            PropertyLookup.get({propertyNumber: property.propertyNumber}, function (value, responseHeaders) {
                if (angular.isDefined(value) && value.hasOwnProperty("propertyNumber")) {
                    $scope.dashboardNumberDetailsClicked = true;
                    SelectedProperty.setSelectedProperty(value);
                    $('#dashboardNumberDetails').modal('hide');
                }
            }, function (httpResponse) {
                // Error
                //console.log('Error!');
            });
        };

        $scope.goToEnvironmentalRecords = function (environmentalMenuId) {
            if ($scope.getCurrentModule() == $scope.moduleEnums.environmental.toLowerCase()) {
                $scope.dashboardNumberDetailsRecordTypeMenuId = angular.copy(environmentalMenuId);
                ControllerInfoPasser.broadcast('event:dashboardSwitchToEnvironmentalRecord', $scope.dashboardNumberDetailsRecordTypeMenuId);
            }
        };

        $('#dashboardNumberDetails').on('hidden.bs.modal', function (e) {
            if ($scope.dashboardNumberDetailsClicked == true) {
                $scope.dashboardNumberDetailsClicked = false;
                ControllerInfoPasser.put('dashboardNumberDetailsRecordTypeMenuId', $scope.dashboardNumberDetailsRecordTypeMenuId);
                $location.url('/environmental');
                $scope.$apply();
            }
        });

        $scope.printDetailsTable = function () {

            var table = document.getElementById("detailsTable");

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

        $scope.pointerNeeded = function () {
            if ($scope.getCurrentModule().length > 0) {
                return "";
            } else {
                return "pointer";
            }
        };

        $scope.refreshPropertyInfo();
        // ControllerInfoPasser.broadcast("event:distributionRequest");

    }])
    .controller('MyPropertiesCtrl', ['$scope', '$http', 'contextPath', 'ControllerInfoPasser', 'SelectedProperty', function ($scope, $q, $http, contextPath, ControllerInfoPasser, SelectedProperty) {
        $scope.$on('event:distributionFilterChange', function (event, properties) {
            $scope.getMyProperties(properties.propertyNumbers);
        });
    }])
    .controller('AlertsNotificationsCtrl', ['$scope', 'GeneralTasksService', '$filter', 'OHSMeetingTasksService', 'InsuranceTasksService', function ($scope, GeneralTasksService, $filter, OHSMeetingTasksService, InsuranceTasksService) {
        if ($scope.alertsAndNotifications) {
            $scope.alertsAndNotifications.length = 0;
        } else {
            $scope.alertsAndNotifications = [];
        }

        $scope.getUsersTasks = function () {
            $scope.loading = true;
            $scope.errorGettingTasks = false;
            $scope.alertsAndNotifications.length = 0;

            GeneralTasksService.queryDashboard({username: $scope.getCurrentUser().userProfile.username}, displayTasks, showError);

            OHSMeetingTasksService.queryDashboard({username: $scope.getCurrentUser().userProfile.username}, displayTasks, showError);

            InsuranceTasksService.queryDashboard({username: $scope.getCurrentUser().userProfile.username}, displayTasks, showError);
        };

        $scope.findByPropertyAndModule = function () {
            $scope.loading = true;
            $scope.errorGettingTasks = false;
            $scope.alertsAndNotifications.length = 0;

            var module = $scope.getCurrentModule();

            module = $filter('uppercase')(module);
            if (module == 'INSURANCE') {
                InsuranceTasksService.findByPropertyAndModule({
                    propertyNumber: $scope.getSelectedProperty().propertyNumber,
                    module: module
                }, displayTasks, showError);
            }
            else {
                if (module == 'OHS') {
                    OHSMeetingTasksService.findByPropertyAndModule({
                        propertyNumber: $scope.getSelectedProperty().propertyNumber,
                        module: module
                    }, displayTasks, showError);

                    GeneralTasksService.findByPropertyAndModule({
                        propertyNumber: $scope.getSelectedProperty().propertyNumber,
                        module: module
                    }, displayTasks, showError);
                }
                else {
                    GeneralTasksService.findByPropertyAndModule({
                        propertyNumber: $scope.getSelectedProperty().propertyNumber,
                        module: module
                    }, displayTasks, showError);
                }
            }
        };

        var displayTasks = function (data, headers) {
            $scope.alertsAndNotifications = $scope.alertsAndNotifications.concat(data);
            $scope.loading = false;
        };

        var showError = function (httpResponse) {
            $scope.errorGettingTasks = true;
            $scope.loading = false;
        };

        $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, category) {
            $scope.findByPropertyAndModule();
        });

        if ($scope.getCurrentModule().length == 0) {
            $scope.getUsersTasks();
        } else {
            $scope.findByPropertyAndModule();
        }

    }])
    .controller('OHSDashboardCtrl', ['$scope', 'OHSService', 'ControllerInfoPasser', 'SelectedProperty', 'PropertyLookup', '$location', '$http', '$q', function ($scope, OHSService, ControllerInfoPasser, SelectedProperty, PropertyLookup, $location, $http, $q) {

        $scope.recordDetailLevel = {
            CATEGORY: 'CATEGORY',
            PROPERTY: 'PROPERTY'
        };

        //ui control
        $scope.dashboardDetailLevel = $scope.recordDetailLevel.CATEGORY;
        $scope.currentYear = new Date().getFullYear();
        $scope.previousYear = $scope.currentYear - 1;
        $scope.loading = true;
        $scope.dashboardError = false;
        $scope.currentPage = 0;
        $scope.pageSize = 15;

        //data holders
        $scope.dataLabourInspections = [];
        $scope.dataNearMisses = [];
        $scope.dataAccidents = [];
        $scope.dataTasks = [];

        $scope.selectedCategory = undefined;
        $scope.selectedCategoryYear = undefined;
        $scope.selectedCategoryData = [];

        //jump data
        $scope.ohsMenuItemId = undefined;
        $scope.ohsMenuItems = undefined;
        $scope.ohsMenuItem = undefined;

        //data
        $scope.queryDashboardData = function (propertyNumbers, propertyNames) {
            if (!propertyNumbers) {
                propertyNumbers = ControllerInfoPasser.get('dashboardPropertyNumbers');
            }

            if (!propertyNames) {
                propertyNames = ControllerInfoPasser.get('dashboardPropertyNames');
            }

            if (angular.isDefined(propertyNumbers) && angular.isDefined(propertyNames)) {
                $scope.loading = true;

                $q.all([
                    $scope.getDashboardLaborInspections(propertyNumbers),
                    $scope.getDashboardNearMisses(propertyNumbers),
                    $scope.getDashboardAccidents(propertyNumbers),
                    $scope.getDashboardTasks(propertyNumbers)

                ]).then(function () {
                    $scope.dashboardError = false;
                }, function () {
                    $scope.dashboardError = true;
                });

                $scope.loading = false;
            }

            $scope.getOhsMenuItems();

        };

        $scope.getDashboardLaborInspections = function (propertyNumbers) {
            return OHSService.dashboardYearlyDetails({record: 'governmentlaborinspection'}, propertyNumbers, function (data) {
                $scope.dataLabourInspections = data;
            }, function (httpResponse) {
                // On Error
                // Caught by error function in $scope.queryDashboardData()
            }).$promise;
        };

        $scope.getDashboardNearMisses = function (propertyNumbers) {
            return OHSService.dashboardYearlyDetails({record: 'nearmisses'}, propertyNumbers, function (data) {
                $scope.dataNearMisses = data;
            }, function (httpResponse) {
                // On Error
                // Caught by error function in $scope.queryDashboardData()
            }).$promise;
        };

        $scope.getDashboardAccidents = function (propertyNumbers) {
            return OHSService.dashboardYearlyDetails({record: 'accidents'}, propertyNumbers, function (data) {
                $scope.dataAccidents = data;
            }, function (httpResponse) {
                // On Error
                // Caught by error function in $scope.queryDashboardData()
            }).$promise;
        };

        $scope.getDashboardTasks = function (propertyNumbers) {
            return OHSService.dashboardDetailsOHSTasks(propertyNumbers, function (data) {
                $scope.dataTasks = data;
            }, function (httpResponse) {
                // On Error
            }).$promise;
        };

        $scope.getYearlyData = function (data, year) {
            if (angular.isDefined(data)) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].year == year) {
                        return data[i];
                    }
                }
                return 0;
            }
        };


        //views
        $scope.navigateBack = function () {
            switch ($scope.dashboardDetailLevel) {
                case $scope.recordDetailLevel.PROPERTY:
                    $scope.dashboardDetailLevel = $scope.recordDetailLevel.CATEGORY;
                    break;
                default:
                    break;
            }
        };

        $scope.toPropertyView = function (data, year, category) {

            if (angular.isDefined(category)) {
                $scope.selectedCategory = category;
            }

            if (angular.isDefined(data) && angular.isDefined(year)) {
                if ($scope.selectedCategory === $scope.ohsDashboardCategory.TASKS) {
                    $scope.selectedCategoryYear = angular.copy(year);
                    $scope.selectedCategoryData = angular.copy(data.properties);
                    $scope.dashboardDetailLevel = $scope.recordDetailLevel.PROPERTY;
                } else {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].year == year) {
                            $scope.selectedCategoryYear = angular.copy(year);
                            $scope.selectedCategoryData = angular.copy(data[i].dataSet);
                            $scope.dashboardDetailLevel = $scope.recordDetailLevel.PROPERTY;
                        }
                    }
                }
            }
        };

        $scope.jumpToCategory = function (propertyNumber) {

            if (angular.isDefined(propertyNumber)) {
                PropertyLookup.get({propertyNumber: propertyNumber}, function (value, ignoreResponseHeaders) {
                    if (angular.isDefined(value) && value.hasOwnProperty("propertyNumber")) {
                        SelectedProperty.setSelectedProperty(value);

                        if (angular.isDefined($scope.selectedCategory)) {

                            switch ($scope.selectedCategory) {
                                case $scope.ohsDashboardCategory.ACCIDENTS:
                                    $scope.ohsMenuItemId = "accidents";
                                    break;
                                case $scope.ohsDashboardCategory.NEAR_MISSES:
                                    $scope.ohsMenuItemId = "nearmisses";
                                    break;
                                case $scope.ohsDashboardCategory.INSPECTIONS:
                                    $scope.ohsMenuItemId = "governmentlaborinspection";
                                    break;
                                default:
                                    return "";
                                    break;
                            }

                            //go to ohs
                            $scope.findOhsMenuItem();
                            ControllerInfoPasser.put("jumpFromDashboardMenuItem", $scope.ohsMenuItem);
                            $location.url("/ohs");
                        }
                    }

                }, function (ignoreHttpResponse) {
                    // Error
                    //console.log('Error!');
                });
            }
        };


        $scope.getOhsMenuItems = function () {
            $http.get('json/ohsMenus.json').success(function (data) {
                $scope.ohsMenuItems = data;
            });
        };


        $scope.findOhsMenuItem = function () {
            if (angular.isDefined($scope.ohsMenuItems) && angular.isDefined($scope.ohsMenuItemId)) {
                for (var x = 0; x < $scope.ohsMenuItems.length; x++) {
                    $scope.traverseMenuTree($scope.ohsMenuItems[x], $scope.checkOhsRecordType);
                }
            }
        };

        $scope.checkOhsRecordType = function (key, value, menuItem) {
            if (key == 'id') {
                if (value == $scope.ohsMenuItemId) {
                    $scope.ohsMenuItem = menuItem;
                    return true;
                }
            }
        };

        //ui
        $scope.getCategoryTitle = function () {
            if (angular.isDefined($scope.selectedCategory)) {
                switch ($scope.selectedCategory) {
                    case $scope.ohsDashboardCategory.ACCIDENTS:
                        return "Accidents - " + $scope.selectedCategoryYear;
                        break;
                    case $scope.ohsDashboardCategory.NEAR_MISSES:
                        return "Near Misses - " + $scope.selectedCategoryYear;
                        break;
                    case $scope.ohsDashboardCategory.INSPECTIONS:
                        return "Labour Inspections - " + $scope.selectedCategoryYear;
                        break;
                    case $scope.ohsDashboardCategory.TASKS:
                        return "Open High Risk Tasks";
                        break;
                    default:
                        return "";
                        break;
                }
            }
        };

        $scope.getCategoryImage = function () {
            if (angular.isDefined($scope.selectedCategory)) {
                switch ($scope.selectedCategory) {
                    case $scope.ohsDashboardCategory.ACCIDENTS:
                        return "icon-accident i-orange-large";
                        break;
                    case $scope.ohsDashboardCategory.NEAR_MISSES:
                        return "icon-near-miss i-orange-large";
                        break;
                    case $scope.ohsDashboardCategory.INSPECTIONS:
                        return "icon-inspection i-orange-large";
                        break;
                    case $scope.ohsDashboardCategory.TASKS:
                        return "icon-high-risk-task i-orange-large";
                        break;
                    default:
                        return "";
                        break;
                }
            }
        };

        //print
        $scope.printOHSDetailsTable = function () {

            var table = document.getElementById("OHSDetailsTable");
            var title = document.getElementById("OHSDetailsTitle");

            var domCloneTable = table.cloneNode(true);
            var domCloneTitle = title.cloneNode(true);

            var $printSection = document.getElementById("printSection");
            if (!$printSection) {
                $printSection = document.createElement("div");
                $printSection.id = "printSection";
                document.body.appendChild($printSection);

            } else {
                while ($printSection.firstChild) {
                    $printSection.removeChild($printSection.firstChild);
                }
            }

            $printSection.appendChild(domCloneTitle);
            $printSection.appendChild(domCloneTable);
            window.print();
        };


        //init
        $scope.$on('event:distributionFilterChange', function (event, properties) {
            $scope.queryDashboardData(properties.propertyNumbers, properties.propertyNames);
        });

        $scope.queryDashboardData();


    }])
    .controller('GHGDashCtrl', ['$scope', 'ControllerInfoPasser', 'UtilityService', 'contextPath', function ($scope, ControllerInfoPasser, UtilityService, contextPath) {
        var thisYear = new Date().getFullYear();
        var GHG_INTENSITY_FACTOR = new BigDecimal("1000");
        var standardBarWidthPixels = 60;

        $scope.selectedUtilityTypes = [];
        $scope.utilityTypes = [];

        $scope.years = [];
        $scope.pageSize = 10;
        $scope.co2Data = [];
        $scope.reportType = $scope.reportTypeEnums.MONTHLY;

        for (var i = thisYear; i >= thisYear - 4; i--) {
            $scope.years.push(i);
        }

        $scope.chartType = "portfolio";

        $scope.fromYear = thisYear - 3;
        $scope.toYear = thisYear - 1; // Default to previous year

        $scope.fromMonth = 1;
        $scope.toMonth = 12;

        $scope.utility = "ecrs";

        $scope.chartData = [];
        var likeForLikeChartData = [];
        var chartData = [];

        $scope.chartDataPropertyType = [];
        var likeForLikeChartDataPropertyType = [];
        var chartDataPropertyType = [];

        $scope.chartDataRegion = [];
        var likeForLikeChartDataRegion = [];
        var chartDataRegion = [];

        $scope.ghgData = [];
        var ghgData = [];
        var likeForLikeGHGData = [];

        $scope.startupRefresh = false;
        $scope.noRecords = true;

        var chartView;

        var defaultPredicatesProperty = ['propertyNumberHidden'];
        var defaultPredicatesMonth = ['propertyNumberHidden', 'month'];

        var getGHGFormData = function(propertyNumbers) {
            var x;
            var selectedUtilities = [];

            for (x = 0; x < $scope.selectedUtilityTypes.length; x++) {
                var selectedUtility = $scope.getUtilityEnumFromLongForm($scope.selectedUtilityTypes[x].key, $scope.dropboxes);
                selectedUtilities.push(selectedUtility);
            }

            var propertyNumbersToSend = [];
            if (angular.isDefined(propertyNumbers)) {
                propertyNumbersToSend = propertyNumbers;
            }

            var formData = {
                propertyNumbers: propertyNumbersToSend,
                utilityTypes: selectedUtilities
            };

            return formData;
        };

        $scope.resetTableDataOrder = function () {
            $scope.tableDataOrderProperty = angular.copy(defaultPredicatesProperty);
            $scope.tableDataOrderMonth = angular.copy(defaultPredicatesMonth);
        };

        $scope.getDashboardData = function (propertyNumbers) {
            $scope.chartData.length = 0;
            $scope.ghgData.length = 0;

            $scope.loading = true;

            if (angular.isDefined(chartView)) {
                chartView.clearChart();
            }

            var utility = $scope.getSelectedUtilityTypeShortForm($scope.selectedUtilityTypes);
            var formData = getGHGFormData(propertyNumbers);

            //$scope.clearChart('ghgChartArea');
            UtilityService.getDashboardGHGData({
                fromYear: $scope.fromYear,
                toYear: $scope.toYear,
                fromMonth: $scope.fromMonth,
                toMonth: $scope.toMonth,
                utility: utility

            }, formData, function (data) {
                $scope.loading = false;
                ghgData = data.yearsData;
                likeForLikeGHGData = data.likeForLikeYearsData;

                chartData = data.chartData;
                likeForLikeChartData = data.likeForLikeChartData;

                chartDataPropertyType = $scope.appendUnknownHeaderName(data.typeChartData);
                likeForLikeChartDataPropertyType = $scope.appendUnknownHeaderName(data.likeForLikeTypeChartData);

                chartDataRegion = $scope.appendUnknownHeaderName(data.regionChartData);
                likeForLikeChartDataRegion = $scope.appendUnknownHeaderName(data.likeForLikeRegionChartData);

                $scope.likeForLikeAnalysis();
            }, function (httpResponse) {
                // Error
                $scope.loading = false;
            });
        };

        $scope.likeForLikeAnalysis = function () {
            if ($scope.likeForLike) {
                $scope.ghgData = likeForLikeGHGData;
                $scope.chartData = likeForLikeChartData;
                $scope.chartDataRegion = likeForLikeChartDataRegion;
                $scope.chartDataPropertyType = likeForLikeChartDataPropertyType;
            } else {
                $scope.ghgData = ghgData;
                $scope.chartData = chartData;
                $scope.chartDataRegion = chartDataRegion;
                $scope.chartDataPropertyType = chartDataPropertyType;
            }

            $scope.drawChart();
        };

        $scope.updateSummary = function (yearData, validPropertyNumbers) {
            yearData.propertyCount = validPropertyNumbers.length;
            yearData.hasError = false;
            yearData.co2Total = $scope.sumCo2(yearData.co2Data);
            yearData.sqft = $scope.sumSqft(yearData.co2Data, validPropertyNumbers);
            yearData.co2Avg = $scope.calculateAvgCo2Total(yearData.co2Total, yearData.sqft);
        };

        $scope.getChartColors = function (header, chartType) {

            var colorsReturn = [];
            var i;

            if (chartType === 'propertyType') {

                var typeColorsMap = ControllerInfoPasser.get("dashboardTypeColors");

                for (i = 1; i < header.length; i++) {
                    if (angular.isDefined(typeColorsMap[header[i]])) {
                        colorsReturn.push(typeColorsMap[header[i]]);
                    } else {
                        if (header[i] === 'Unknown') {
                            colorsReturn.push(typeColorsMap['']);
                        }
                    }
                }
            } else {

                var unitColorsMap = ControllerInfoPasser.get("dashboardUnitColors");

                for (i = 1; i < header.length; i++) {
                    if (angular.isDefined(unitColorsMap[header[i]])) {
                        colorsReturn.push(unitColorsMap[header[i]]);
                    }
                }
            }
            return colorsReturn;
        };

        $scope.drawChart = function () {
            var chartData;
            var fontSize = 14;
            var colors;
            var groupWidth = undefined;
            var legendPosition = "none";

            if ($scope.chartType === 'propertyType') {

                if ($scope.chartDataPropertyType[0].length > 5) {
                    fontSize = 9;
                }
                colors = $scope.getChartColors($scope.chartDataPropertyType[0], $scope.chartType);
                chartData = google.visualization.arrayToDataTable($scope.chartDataPropertyType);
            } else {
                if ($scope.chartType === 'region') {
                    colors = $scope.getChartColors($scope.chartDataRegion[0], $scope.chartType);
                    chartData = google.visualization.arrayToDataTable($scope.chartDataRegion);
                } else {
                    if ($scope.chartType === 'region') {
                        chartData = google.visualization.arrayToDataTable($scope.chartDataRegion);
                    } else {
                        chartData = google.visualization.arrayToDataTable($scope.chartData);
                    }
                }
            }

            if (chartData.getNumberOfRows() <= 3) {
                groupWidth = standardBarWidthPixels;
            }

            var options = {
                colors: colors,
                legend: {position: legendPosition, textStyle: {fontSize: fontSize}},
                axes: {
                    y: {
                        all: {
                            format: {
                                pattern: 'decimal'
                            }
                        }
                    }
                },
                vAxis: {
                    viewWindow: {
                        min: 0
                    },
                    title: "Intensity (kg/sqft)"
                },
                animation:{
                    duration: 1000,
                    easing: "out",
                    startup: true
                },
                bar: {
                    groupWidth: groupWidth
                }

            };

            chartView = new google.visualization.ColumnChart(document.getElementById('ghgChartArea'));
            chartView.draw(chartData, options);

        };

        $scope.refreshData = function () {
            $scope.getDashboardData(ControllerInfoPasser.get("dashboardPropertyNumbers"));
        };

        $scope.exportExcelDashboardData = function (propertyNumbers) {
            var utility = $scope.getSelectedUtilityTypeShortForm($scope.selectedUtilityTypes);
            var formData = getGHGFormData(propertyNumbers);

            var url = contextPath + '/webapi/properties/0/' + utility + '/dashboardData/excel/ghg/' + $scope.reportType + '/years/' + $scope.fromYear + '/to/' + $scope.toYear + '/months/' + $scope.fromMonth + '/to/' + $scope.toMonth;
            $scope.openInNewWindow('POST', url, formData);
        };

        $scope.exportExcel = function () {
            $scope.exportExcelDashboardData(ControllerInfoPasser.get("dashboardPropertyNumbers"));
        };

        $scope.$on('event:distributionFilterChange', function () {
            if (!$scope.startupRefresh) {
                $scope.refreshData();
                $scope.startupRefresh = true;
            }
        });

        if (angular.isDefined(ControllerInfoPasser.get("dashboardPropertyNumbers"))) {
            $scope.refreshData();
        }

        $scope.isCo2dataVisible = function () {
            return $scope.co2Data.length > 0;
        };

        $scope.isAtMonthLevel = function () {
            return angular.isDefined($scope.selectedPropertyDrill);
        };

        $scope.filterEmptyRecords = function (item) {
            if (item.co2Data.length === 0) {
                return false;
            } else {
                $scope.noRecords = false;
                return true;
            }
        };

        $scope.showDescription = function (value) {
            var index = $scope.dropboxes['shortMonths'].itemMap.map(function (entry) {
                return parseInt(entry.value);

            }).indexOf(value);
            return $scope.dropboxes['shortMonths'].itemMap[index].key;
        };

        $scope.selectGHGRow = function (co2Data, selectedYear) {

            $scope.selectedYear = selectedYear;
            $scope.co2Data.length = 0;

            var utilityIndex = $scope.dropboxes['utilityTypeShort'].itemMap.map(function (entry) {
                return entry.value;
            }).indexOf($scope.utility);

            var fromMonthIndex = $scope.dropboxes['shortMonths'].itemMap.map(function (entry) {
                return parseInt(entry.value);
            }).indexOf($scope.fromMonth);

            var toMonthIndex = $scope.dropboxes['shortMonths'].itemMap.map(function (entry) {
                return parseInt(entry.value);
            }).indexOf($scope.toMonth);

            $scope.selectedUtility = $scope.dropboxes['utilityTypeShort'].itemMap[utilityIndex].key;
            if (fromMonthIndex === toMonthIndex) {
                $scope.selectedMonthsLabel = 'Month:';
                $scope.selectedMonthsValue = $scope.dropboxes['shortMonths'].itemMap[fromMonthIndex].key;
            } else {
                $scope.selectedMonthsLabel = 'Months:';
                $scope.selectedMonthsValue = $scope.dropboxes['shortMonths'].itemMap[fromMonthIndex].key +
                    ' to ' + $scope.dropboxes['shortMonths'].itemMap[toMonthIndex].key;
            }

            $scope.propertyCo2Data = angular.copy(co2Data);

            angular.forEach(angular.copy(co2Data), function (item, idx) {

                var index = $scope.co2Data.map(function (entry) {
                    return entry.propertyNumber;

                }).indexOf(item.propertyNumber);

                if (angular.isUndefined(item.co2Total)) {
                    item.co2Total = '0';
                }

                if (index > -1) {
                    $scope.co2Data[index].sqft = item.sqft;
                    $scope.co2Data[index].co2Total = new BigDecimal(new String(item.co2Total)).add(new BigDecimal(new String($scope.co2Data[index].co2Total))).toString();
                    $scope.co2Data[index].avgCo2Total = $scope.calculateAvgCo2Total($scope.co2Data[index].co2Total, item.sqft);
                    $scope.co2Data[index].propertyNumberHidden = item.propertyNumber;
                    if (item.hasError) {
                        $scope.co2Data[index].errorText = item.errorText;
                        $scope.co2Data[index].hasError = true;
                    }
                } else {
                    item.avgCo2Total = $scope.calculateAvgCo2Total(item.co2Total, item.sqft);
                    item.propertyNumberHidden = item.propertyNumber;
                    $scope.co2Data.push(item);
                }
            });

            angular.forEach($scope.co2Data, function (item, idx) {
                $scope.co2Data[idx].co2Total = $scope.roundDownToInt(item.co2Total);
                if ($scope.co2Data[idx].hasError) {
                    $scope.co2Data[idx].co2Total = '0';
                    $scope.co2Data[idx].avgCo2Total = '0';
                }
            });

            $scope.resetPaginationProperty();
        };


        $scope.calculateAvgCo2Total = function (co2Total, sqft) {
            var defaultReturnNumber = 0;
            if (sqft !== null && !new BigDecimal(new String(sqft)).isZero()) {
                var AvgCo2Total = new BigDecimal(new String(co2Total)).multiply(GHG_INTENSITY_FACTOR).divide(new BigDecimal(new String(sqft)), 2, BigDecimal.ROUND_HALF_DOWN);
                if (AvgCo2Total.isZero()) {
                    return defaultReturnNumber;
                } else {
                    return parseFloat(AvgCo2Total.toString());
                }
            } else {
                return defaultReturnNumber;
            }
        };


        $scope.roundDownToInt = function (number) {
            var numberAsString = new String(number)
            return parseInt(numberAsString);
        };

        $scope.selectRowPropertyLevel = function (property) {

            $scope.selectedPropertyDrill = property;

            $scope.selectedPropertyCo2Data = $scope.propertyCo2Data.filter(function (item) {
                return item.propertyNumber === property.propertyNumber;
            });

            $scope.resetPaginationMonth();
        };

        $scope.resetPaginationProperty = function () {
            $scope.currentPageProperty = 0;
        };

        $scope.resetPaginationMonth = function () {
            $scope.currentPageMonth = 0;
        };

        $scope.back = function () {
            if ($scope.isAtMonthLevel()) {
                $scope.selectedPropertyDrill = undefined;
            } else {
                $scope.co2Data.length = 0;
            }
        };

        $scope.initializeUtilityTypes = function() {
            $scope.utilityTypes = $scope.dropboxes["utilityTypeShort"].itemMap;
            for (var x = 0; x < $scope.utilityTypes.length; x++) {
                if ($scope.utilityTypes[x].value === $scope.ELECTRICITY_UTILITY_TYPE_SHORT_NAME) {
                    $scope.selectedUtilityTypes.push($scope.utilityTypes[x]);
                }
            }
        };

        $scope.startup = function() {
            $scope.initializeUtilityTypes();
            $scope.refreshData();
            $scope.resetTableDataOrder();
        };

        $scope.loadDropboxes(["utilityTypeShort", "shortMonths", "utilityType"], $scope.startup);
    }])
    .controller("EnergyDashCtrl", ['$scope', 'ControllerInfoPasser', 'UtilityService', 'contextPath', '$filter', "$location", "SelectedProperty", "PropertyLookup", function ($scope, ControllerInfoPasser, UtilityService, contextPath, $filter, $location, SelectedProperty, PropertyLookup) {
        $scope.selectedUtilityTypes = [];
        $scope.utilityTypes = [];

        var thisYear = new Date().getFullYear();
        var INTENSITY_FACTOR = new BigDecimal("1");
        var standardBarWidthPixels = 60;

        $scope.years = [];
        $scope.likeForLike = false;
        $scope.pageSize = 10;
        $scope.consumptionData = [];
        $scope.reportType = $scope.reportTypeEnums.MONTHLY;
        $scope.filteredConsumptionData = [];

        $scope.vars = {
            consumptionDataFilter: ''
        };

        for (var i = thisYear; i >= thisYear - 4; i--) {
            $scope.years.push(i);
        }

        $scope.chartType = "portfolio";

        $scope.fromYear = thisYear - 3;
        $scope.toYear = thisYear - 1; // Default to previous year

        $scope.fromMonth = 1;
        $scope.toMonth = 12;

        $scope.utility = "ecrs";

        $scope.showLikeForLikeCheckbox = true;
        $scope.showChartCategoryBlock = true;
        $scope.showChartCategoryCostBlock = true;

        $scope.chartData = [];
        var likeForLikeChartData = [];
        var chartData = [];

        $scope.costChartData = [];
        var likeForLikeCostChartData = [];
        var costChartData = [];

        $scope.costIntensityChartData = [];
        var likeForLikeCostIntensityChartData = [];
        var costIntensityChartData = [];

        $scope.consumptionChartData = [];
        var likeForLikeConsumptionChartData = [];
        var consumptionChartData = [];

        $scope.chartDataPropertyType = [];
        var likeForLikeChartDataPropertyType = [];
        var chartDataPropertyType = [];

        $scope.chartDataPropertyTypeConsumption = [];
        var likeForLikeChartDataPropertyTypeConsumption = [];
        var chartDataPropertyTypeConsumption = [];

        $scope.chartDataPropertyTypeCost = [];
        var likeForLikeChartDataPropertyTypeCost = [];
        var chartDataPropertyTypeCost = [];

        $scope.chartDataPropertyTypeCostIntensity = [];
        var chartDataPropertyTypeCostIntensity = [];
        var likeForLikeChartDataPropertyTypeCostIntensity = [];

        $scope.chartDataRegion = [];
        var likeForLikeChartDataRegion = [];
        var chartDataRegion = [];

        $scope.chartDataRegionConsumption = [];
        var likeForLikeChartDataRegionConsumption = [];
        var chartDataRegionConsumption = [];

        $scope.chartDataRegionCost = [];
        var chartDataRegionCost = [];
        var likeForLikeChartDataRegionCost = [];

        $scope.chartDataRegionCostIntensity = [];
        var chartDataRegionCostIntensity = [];
        var likeForLikeChartDataRegionCostIntensity = [];

        $scope.chartDataTopTenConsumersIntensity = [];
        $scope.chartDataConsumptionVSIntensity = [];
        $scope.chartDataScopeDistribution = [];
        $scope.chartDataYearlyTopProperties = [];
        $scope.chartDataYearlyTopIntensities = [];

        $scope.chartDataWorstConsumerIncreases = [];
        $scope.chartDataWorstConsumerDecreases = [];

        $scope.chartDataReductionTargets = [];
        var likeForLikeChartDataReductionTargets = [];
        var chartDataReductionTargets = [];

        $scope.energyData = [];
        var energyData = [];
        var likeForLikeEnergyData = [];

        $scope.startupRefresh = false;
        $scope.noRecords = true;

        $scope.likeForLikeCheckboxDisabled = false;

        $scope.chartCategory = $scope.energyChartCategoryEnums.INTENSITY;

        $scope.filterModes = {
            ERRORS: 'errors',
            WITHOUT_ERRORS: 'withoutErrors',
            NONE: 'noFilter'
        };

        $scope.filterModesDropboxValues = [
            {value: $scope.filterModes.NONE, key: 'All'},
            {value: $scope.filterModes.ERRORS, key: 'Incomplete Performance Data'},
            {value: $scope.filterModes.WITHOUT_ERRORS, key: 'Valid Performance Data'}

        ];

        $scope.selectedFilterMode = $scope.filterModes.NONE;

        var chartView;

        var energyChartArea = 'energyChartArea';

        var defaultPredicatesProperty = ['propertyNumberHidden'];
        var defaultPredicatesMonth = ['propertyNumberHidden', 'month'];

        var googleChartNumberFormatter = new google.visualization.NumberFormat({
            groupingSymbol: ",",
            fractionDigits: 0
        });

        var getEnergyFormData = function(propertyNumbers) {
            var x;
            var propertyNumbersToSubmit = [];
            var selectedUtilities = [];
            for (x = 0; x < $scope.selectedUtilityTypes.length; x++) {
                var selectedUtility = $scope.getUtilityEnumFromLongForm($scope.selectedUtilityTypes[x].key, $scope.dropboxes);
                selectedUtilities.push(selectedUtility);

                var availablePropertyNumbers = $scope.removeExcludedUtilityTypes(propertyNumbers, $scope.selectedUtilityTypes[x].value);
                propertyNumbersToSubmit = getUniquePropertyNumbers(propertyNumbersToSubmit.concat(availablePropertyNumbers));
            }

            var formData = {
                propertyNumbers: propertyNumbersToSubmit,
                utilityTypes: selectedUtilities
            };

            return formData;
        };

        var getConsumptionListWithErrors = function(consumptionData) {
            var consumptionList = [];
            for (var x = 0; x < consumptionData.length; x++) {
                var consumption = consumptionData[x];
                if (consumption.hasError) {
                    consumptionList.push(consumption);
                }
            }

            return consumptionList;
        };

        var getConsumptionListWithoutErrors = function(consumptionData) {
            var consumptionList = [];
            for (var x = 0; x < consumptionData.length; x++) {
                var consumption = consumptionData[x];
                if (!consumption.hasError) {
                    consumptionList.push(consumption);
                }
            }

            return consumptionList;
        };

        $scope.filterConsumptionList = function () {
            $scope.filteredConsumptionData = $filter('filterBy')($scope.consumptionData, ['propertyNumber', 'propertyName'], $scope.vars.consumptionDataFilter);
        };


        $scope.executeConsumptionDataFilter = function(filterMode) {
            switch (filterMode) {
                case $scope.filterModes.ERRORS:
                    $scope.filterWithErrors();
                    break;

                case $scope.filterModes.WITHOUT_ERRORS:
                    $scope.filterWithoutErrors();
                    break;

                case $scope.filterModes.NONE:
                    $scope.removeFilters();
                    break;

                default:
                    break;
            }

            $scope.filterConsumptionList();
        };

        $scope.filterWithErrors = function() {
            var conData = angular.copy($scope.propertyConData);
            var conDataToFilter = $scope.consumptionForPropertyList(conData);
            $scope.consumptionData = getConsumptionListWithErrors(conDataToFilter);
            $scope.filteredConsumptionData = angular.copy($scope.consumptionData);
        };

        $scope.filterWithoutErrors = function() {
            var conData = angular.copy($scope.propertyConData);
            var conDataToFilter = $scope.consumptionForPropertyList(conData);
            $scope.consumptionData = getConsumptionListWithoutErrors(conDataToFilter);
            $scope.filteredConsumptionData = angular.copy($scope.consumptionData);
        };

        $scope.removeFilters = function() {
            var conData = angular.copy($scope.propertyConData);
            $scope.consumptionData = $scope.consumptionForPropertyList(conData);
            $scope.filteredConsumptionData = angular.copy($scope.consumptionData);
        };

        $scope.resetTableDataOrder = function () {
            $scope.tableDataOrderProperty = angular.copy(defaultPredicatesProperty);
            $scope.tableDataOrderMonth = angular.copy(defaultPredicatesMonth);
        };

        $scope.goToUtilityRecords = function (selectedUtilityTypes, propertyData) {
            if (angular.isDefined(selectedUtilityTypes)) {
                PropertyLookup.get({propertyNumber: propertyData.propertyNumber}, function (value, ignoreResponseHeaders) {
                    if (angular.isDefined(value) && value.hasOwnProperty("propertyNumber")) {
                        SelectedProperty.setSelectedProperty(value);

                        if (selectedUtilityTypes.length > 1) {
                            $location.url("/sustainability");

                        } else {
                            ControllerInfoPasser.put("dashboardSustainabilityRecordDetailsMenuId", selectedUtilityTypes[0].value);
                            $location.url("/sustainability");
                        }
                    }

                }, function (ignoreHttpResponse) {
                    // Error
                    //console.log('Error!');
                });

            }
        };

        $scope.removeExcludedUtilityTypes = function (propertyNumbers, utilityType) {

            var propertiesExclusion = ControllerInfoPasser.get("dashboardPropertyExclusionUtilityTypes");

            if (angular.isDefined(propertyNumbers)) {
                return propertyNumbers.filter(function (propertyNumber) {
                    var index = propertiesExclusion.map(function (exclusion) {
                        return exclusion.propertyNumber;
                    }).indexOf(propertyNumber);

                    if (index > -1) {
                        for (var i = 0; i < propertiesExclusion[index].utilityTypesExclusions.length; i++) {
                            if (propertiesExclusion[index].utilityTypesExclusions[i] === utilityType) {
                                return false;
                            }
                        }
                        return true;
                    } else {
                        return true;
                    }
                });
            }
            return propertyNumbers;
        };

        var clearVisibleData = function () {
            $scope.chartData.length = 0;
            $scope.energyData.length = 0;

            if (angular.isDefined(chartView)) {
                chartView = undefined;
            }
        };

        var getUniquePropertyNumbers = function(headerArray) {
            var a = headerArray.concat();
            for(var i = 0; i < a.length; ++i) {
                for(var j = i + 1 ; j < a.length; ++j) {
                    if(a[i] === a[j])
                        a.splice(j--, 1);
                }
            }

            return a;
        };

        $scope.getDashboardData = function (propertyNumbers) {
            clearVisibleData();

            $scope.loading = true;

            if (angular.isDefined(chartView)) {
                chartView.clearChart();
            }

            var formData = getEnergyFormData(propertyNumbers);
            var utility = $scope.getSelectedUtilityTypeShortForm($scope.selectedUtilityTypes);

            UtilityService.getDashboardEnergyData({
                fromYear: $scope.fromYear,
                toYear: $scope.toYear,
                fromMonth: $scope.fromMonth,
                toMonth: $scope.toMonth,
                utility: utility

            }, formData, function (data) {
                $scope.loading = false;
                energyData = data.yearsData;
                likeForLikeEnergyData = data.likeForLikeYearsData;

                $scope.defaultUnits = data.defaultUnits;

                chartData = data.chartData;
                likeForLikeChartData = data.likeForLikeChartData;

                costChartData = data.costChartData;
                likeForLikeCostChartData = data.likeForLikeCostChartData;

                costIntensityChartData = data.costIntensityChartData;
                likeForLikeCostIntensityChartData = data.likeForLikeCostIntensityChartData;

                consumptionChartData = data.consumptionChartData;
                likeForLikeConsumptionChartData = data.likeForLikeConsumptionChartData;

                chartDataPropertyType = $scope.appendUnknownHeaderName(data.typeChartData);
                likeForLikeChartDataPropertyType = $scope.appendUnknownHeaderName(data.likeForLikeTypeChartData);
                chartDataPropertyTypeConsumption = $scope.appendUnknownHeaderName(data.typeConsumptionChartData);
                likeForLikeChartDataPropertyTypeConsumption = $scope.appendUnknownHeaderName(data.likeForLikeTypeConsumptionChartData);

                chartDataRegion = $scope.appendUnknownHeaderName(data.regionChartData);
                likeForLikeChartDataRegion = $scope.appendUnknownHeaderName(data.likeForLikeRegionChartData);
                chartDataRegionConsumption = $scope.appendUnknownHeaderName(data.regionConsumptionChartData);
                likeForLikeChartDataRegionConsumption = $scope.appendUnknownHeaderName(data.likeForLikeRegionConsumptionChartData);
                chartDataRegionCost = $scope.appendUnknownHeaderName(data.regionCostChartData);
                likeForLikeChartDataRegionCost = $scope.appendUnknownHeaderName(data.likeForLikeRegionCostChartData);
                chartDataRegionCostIntensity = $scope.appendUnknownHeaderName(data.regionCostIntensityChartData);
                likeForLikeChartDataRegionCostIntensity = $scope.appendUnknownHeaderName(data.likeForLikeRegionCostIntensityChartData);

                chartDataPropertyTypeCost = $scope.appendUnknownHeaderName(data.typeCostChartData);
                likeForLikeChartDataPropertyTypeCost = $scope.appendUnknownHeaderName(data.likeForLikeTypeCostChartData);
                chartDataPropertyTypeCostIntensity = $scope.appendUnknownHeaderName(data.typeCostIntensityChartData);
                likeForLikeChartDataPropertyTypeCostIntensity = $scope.appendUnknownHeaderName(data.likeForLikeTypeCostIntensityChartData);

                chartDataReductionTargets = $scope.appendUnknownHeaderName(data.portfolioReductionTargetsChartData);
                likeForLikeChartDataReductionTargets = $scope.appendUnknownHeaderName(data.likeForLikePortfolioReductionTargetsChartData);

                $scope.chartDataTopTenConsumersIntensity = data.topTenConsumersIntensityChartData;
                $scope.chartDataTopTenConsumersConsumption = data.topTenConsumersConsumptionChartData;

                $scope.chartDataTopTenCostIntenseConsumption = data.topTenCostIntenseConsumptionChartData;
                $scope.chartDataTopTenExpensiveConsumption = data.topTenExpensiveConsumptionChartData;

                $scope.chartDataConsumptionVSIntensity = data.consumptionVsIntensityChartData;

                $scope.chartDataScopeDistribution = data.energyScopeDistributionChartData;

                $scope.chartDataWorstConsumerIncreases = data.worstConsumerIncreasesChartData;
                $scope.chartDataWorstConsumerDecreases = data.worstConsumerDecreasesChartData;

                $scope.chartDataYearlyTopProperties = data.yearlyTopPropertiesChartData;
                $scope.chartDataYearlyTopIntensities = data.yearlyTopIntensitiesChartData;

                $scope.executeLikeForLikeCharts();

            }, function (ignoreHttpResponse) {
                // Error
                $scope.loading = false;
            });
        };

        $scope.executeLikeForLikeCharts = function () {
            likeForLikeAnalysis();
            $scope.noRecords = $scope.energyData.length === 0;
            $scope.drawEnergyChart();
        };

        var likeForLikeAnalysis = function () {
            if ($scope.likeForLike) {
                $scope.energyData = likeForLikeEnergyData;
                $scope.chartData = likeForLikeChartData;
                $scope.costChartData = likeForLikeCostChartData;
                $scope.costIntensityChartData = likeForLikeCostIntensityChartData;
                $scope.consumptionChartData = likeForLikeConsumptionChartData;
                $scope.chartDataRegion = likeForLikeChartDataRegion;
                $scope.chartDataRegionConsumption = likeForLikeChartDataRegionConsumption;
                $scope.chartDataRegionCost = likeForLikeChartDataRegionCost;
                $scope.chartDataRegionCostIntensity = likeForLikeChartDataRegionCostIntensity;
                $scope.chartDataPropertyTypeCostIntensity = likeForLikeChartDataPropertyTypeCostIntensity;
                $scope.chartDataPropertyType = likeForLikeChartDataPropertyType;
                $scope.chartDataPropertyTypeConsumption = likeForLikeChartDataPropertyTypeConsumption;
                $scope.chartDataPropertyTypeCost = likeForLikeChartDataPropertyTypeCost;
                $scope.chartDataReductionTargets = likeForLikeChartDataReductionTargets;
            } else {
                $scope.energyData = energyData;
                $scope.chartData = chartData;
                $scope.costChartData = costChartData;
                $scope.costIntensityChartData = costIntensityChartData;
                $scope.consumptionChartData = consumptionChartData;
                $scope.chartDataRegion = chartDataRegion;
                $scope.chartDataRegionConsumption = chartDataRegionConsumption;
                $scope.chartDataRegionCost = chartDataRegionCost;
                $scope.chartDataRegionCostIntensity = chartDataRegionCostIntensity;
                $scope.chartDataPropertyTypeCostIntensity = chartDataPropertyTypeCostIntensity;
                $scope.chartDataPropertyType = chartDataPropertyType;
                $scope.chartDataPropertyTypeConsumption = chartDataPropertyTypeConsumption;
                $scope.chartDataPropertyTypeCost = chartDataPropertyTypeCost;
                $scope.chartDataReductionTargets = chartDataReductionTargets;
            }
        };

        $scope.getChartColors = function (header, chartType) {
            var colorsReturn = [];
            var i;

            if (chartType === "propertyType") {
                var typeColorsMap = ControllerInfoPasser.get("dashboardTypeColors");
                for (i = 1; i < header.length; i++) {
                    if (angular.isDefined(typeColorsMap[header[i]])) {
                        colorsReturn.push(typeColorsMap[header[i]]);

                    } else {
                        if (header[i] === "Unknown") {
                            colorsReturn.push(typeColorsMap[""]);
                        }

                    }
                }

            } else {
                var unitColorsMap = ControllerInfoPasser.get("dashboardUnitColors");
                for (i = 1; i < header.length; i++) {
                    if (angular.isDefined(unitColorsMap[header[i]])) {
                        colorsReturn.push(unitColorsMap[header[i]]);
                    }
                }
            }
            return colorsReturn;
        };

        var getStandardChartOptions = function (colors, fontSize, hasLegend) {
            var legendPosition = "none";

            if (hasLegend) {
                legendPosition = "top";
            }

            return {
                colors: colors,
                legend: {position: legendPosition, textStyle: {fontSize: fontSize}},
                axes: {
                    y: {
                        all: {
                            format: {
                                pattern: "decimal"
                            }
                        }
                    }
                }
            };
        };

        var executeDrawChart = function (data, options) {
            chartView = new google.visualization.ColumnChart(document.getElementById(energyChartArea));
            chartView.draw(data, options);
        };

        var drawPropertyTypeIntensityChart = function() {
            var data;
            var fontSize = 14;
            var colors;
            var yAxisTitle = "Intensity (" + $scope.defaultUnits + "/sqft)";

            if ($scope.chartDataPropertyType[0].length > 5) {
                fontSize = 9;
            }
            colors = $scope.getChartColors($scope.chartDataPropertyType[0], $scope.chartType);
            data = google.visualization.arrayToDataTable($scope.chartDataPropertyType);

            var hasLegend = false;
            var options = getStandardChartOptions(colors, fontSize, hasLegend);
            addStandardBarChartOptions(options, data.getNumberOfRows(), yAxisTitle);

            executeDrawChart(data, options);
        };

        var drawPropertyTypeConsumptionChart = function() {
            var data;
            var fontSize = 14;
            var colors;
            var yAxisTitle = "Consumption (" + $scope.defaultUnits + ")";

            if ($scope.chartDataPropertyTypeConsumption[0].length > 5) {
                fontSize = 9;
            }
            colors = $scope.getChartColors($scope.chartDataPropertyTypeConsumption[0], $scope.chartType);
            data = google.visualization.arrayToDataTable($scope.chartDataPropertyTypeConsumption);
            for (var x = 0; x < data.getNumberOfColumns(); x++) {
                if (x > 0) {
                    var indexOfNumberToFormat = x;
                    googleChartNumberFormatter.format(data, indexOfNumberToFormat);
                }
            }

            var hasLegend = false;
            var options = getStandardChartOptions(colors, fontSize, hasLegend);
            addStandardBarChartOptions(options, data.getNumberOfRows(), yAxisTitle);

            executeDrawChart(data, options);
        };

        var drawPropertyTypeCostChart = function() {
            var data;
            var fontSize = 14;
            var colors;
            var yAxisTitle = "Cost (for total of " + $scope.defaultUnits + ")";

            if ($scope.chartDataPropertyTypeCost[0].length > 5) {
                fontSize = 9;
            }
            colors = $scope.getChartColors($scope.chartDataPropertyTypeCost[0], $scope.chartType);
            data = google.visualization.arrayToDataTable($scope.chartDataPropertyTypeCost);
            for (var x = 0; x < data.getNumberOfColumns(); x++) {
                if (x > 0) {
                    var indexOfNumberToFormat = x;
                    googleChartNumberFormatter.format(data, indexOfNumberToFormat);
                }
            }

            var hasLegend = false;
            var options = getStandardChartOptions(colors, fontSize, hasLegend);
            addStandardBarChartOptions(options, data.getNumberOfRows(), yAxisTitle);

            executeDrawChart(data, options);
        };

        var drawPropertyTypeCostIntensityChart = function() {
            var data;
            var fontSize = 14;
            var colors;
            var yAxisTitle = "Cost (for total of " + $scope.defaultUnits + ")";

            if ($scope.chartDataPropertyTypeCostIntensity[0].length > 5) {
                fontSize = 9;
            }
            colors = $scope.getChartColors($scope.chartDataPropertyTypeCostIntensity[0], $scope.chartType);
            data = google.visualization.arrayToDataTable($scope.chartDataPropertyTypeCostIntensity);

            var hasLegend = false;
            var options = getStandardChartOptions(colors, fontSize, hasLegend);
            addStandardBarChartOptions(options, data.getNumberOfRows(), yAxisTitle);

            executeDrawChart(data, options);
        };

        var drawPortfolioReductionTargetsChart = function () {
            var yAxisTitle = 'Targets (' + $scope.defaultUnits + ')';

            var options = {
                hAxis: {title: 'Years'},
                seriesType: 'bars',
                legend: {position: 'none'}
            };

            var data = google.visualization.arrayToDataTable($scope.chartDataReductionTargets, false);

            for (var x = 0; x < data.getNumberOfColumns(); x++) {
                if (x > 0) {
                    var indexOfNumberToFormat = x;
                    googleChartNumberFormatter.format(data, indexOfNumberToFormat);
                }
            }

            addStandardBarChartOptions(options, data.getNumberOfRows(), yAxisTitle);

            executeDrawChart(data, options);
        };

        var drawPropertyTypeChart = function () {
            switch ($scope.chartCategory) {
                case $scope.energyChartCategoryEnums.CONSUMPTION:
                    drawPropertyTypeConsumptionChart();
                    break;

                case $scope.energyChartCategoryEnums.INTENSITY:
                    drawPropertyTypeIntensityChart();
                    break;

                case $scope.energyChartCategoryEnums.COST:
                    drawPropertyTypeCostChart();
                    break;

                case $scope.energyChartCategoryEnums.COST_INTENSITY:
                    drawPropertyTypeCostIntensityChart();
                    break;

                default:
                    break;
            }
        };

        var drawPropertyRegionIntensityChart = function() {
            var fontSize = 14;
            var yAxisTitle = "Intensity (" + $scope.defaultUnits + "/sqft)";

            var colors = $scope.getChartColors($scope.chartDataRegion[0], $scope.chartType);
            var data = google.visualization.arrayToDataTable($scope.chartDataRegion);

            var hasLegend = false;
            var options = getStandardChartOptions(colors, fontSize, hasLegend);
            addStandardBarChartOptions(options, data.getNumberOfRows(), yAxisTitle);

            executeDrawChart(data, options);
        };

        var drawPropertyRegionCostIntensityChart = function() {
            var fontSize = 14;
            var yAxisTitle = "Cost per sqft";

            var colors = $scope.getChartColors($scope.chartDataRegionCostIntensity[0], $scope.chartType);
            var data = google.visualization.arrayToDataTable($scope.chartDataRegionCostIntensity);

            var hasLegend = false;
            var options = getStandardChartOptions(colors, fontSize, hasLegend);
            addStandardBarChartOptions(options, data.getNumberOfRows(), yAxisTitle);

            executeDrawChart(data, options);
        };

        var drawPropertyRegionConsumptionChart = function() {
            var fontSize = 14;
            var yAxisTitle = "Consumption (" + $scope.defaultUnits + ")";

            var colors = $scope.getChartColors($scope.chartDataRegionConsumption[0], $scope.chartType);
            var data = google.visualization.arrayToDataTable($scope.chartDataRegionConsumption);
            for (var x = 0; x < data.getNumberOfColumns(); x++) {
                if (x > 0) {
                    var indexOfNumberToFormat = x;
                    googleChartNumberFormatter.format(data, indexOfNumberToFormat);
                }
            }

            var hasLegend = false;
            var options = getStandardChartOptions(colors, fontSize, hasLegend);
            addStandardBarChartOptions(options, data.getNumberOfRows(), yAxisTitle);

            executeDrawChart(data, options);
        };

        var drawPropertyRegionCostChart = function() {
            var fontSize = 14;
            var yAxisTitle = "Cost (for total of " + $scope.defaultUnits + ")";

            var colors = $scope.getChartColors($scope.chartDataRegionCost[0], $scope.chartType);
            var data = google.visualization.arrayToDataTable($scope.chartDataRegionCost);
            for (var x = 0; x < data.getNumberOfColumns(); x++) {
                if (x > 0) {
                    var indexOfNumberToFormat = x;
                    googleChartNumberFormatter.format(data, indexOfNumberToFormat);
                }
            }

            var hasLegend = false;
            var options = getStandardChartOptions(colors, fontSize, hasLegend);
            addStandardBarChartOptions(options, data.getNumberOfRows(), yAxisTitle);

            executeDrawChart(data, options);
        };

        var drawPropertyRegionChart = function () {
            switch ($scope.chartCategory) {
                case $scope.energyChartCategoryEnums.CONSUMPTION:
                    drawPropertyRegionConsumptionChart();
                    break;

                case $scope.energyChartCategoryEnums.INTENSITY:
                    drawPropertyRegionIntensityChart();
                    break;

                case $scope.energyChartCategoryEnums.COST:
                    drawPropertyRegionCostChart();
                    break;

                case $scope.energyChartCategoryEnums.COST_INTENSITY:
                    drawPropertyRegionCostIntensityChart();
                    break;

                default:
                    break;
            }
        };

        var drawPortfolioIntensityChart = function() {
            var fontSize = 14;
            var colors = undefined;
            var yAxisTitle = "Intensity (" + $scope.defaultUnits + "/sqft)";

            var data = google.visualization.arrayToDataTable($scope.chartData);

            var hasLegend = false;
            var options = getStandardChartOptions(colors, fontSize, hasLegend);
            addStandardBarChartOptions(options, data.getNumberOfRows(), yAxisTitle);

            executeDrawChart(data, options);
        };

        var drawPortfolioConsumptionChart = function() {
            var fontSize = 14;
            var colors = undefined;
            var yAxisTitle = "Consumption (" + $scope.defaultUnits + ")";
            var indexOfNumberToFormat = 1;

            var data = google.visualization.arrayToDataTable($scope.consumptionChartData);
            googleChartNumberFormatter.format(data, indexOfNumberToFormat);

            var hasLegend = false;
            var options = getStandardChartOptions(colors, fontSize, hasLegend);
            addStandardBarChartOptions(options, data.getNumberOfRows(), yAxisTitle);

            executeDrawChart(data, options);
        };

        var drawPortfolioCostChart = function() {
            var fontSize = 14;
            var colors = undefined;
            var yAxisTitle = "Cost (for total of " + $scope.defaultUnits + ")";
            var indexOfNumberToFormat = 1;

            var data = google.visualization.arrayToDataTable($scope.costChartData);
            googleChartNumberFormatter.format(data, indexOfNumberToFormat);

            var hasLegend = false;
            var options = getStandardChartOptions(colors, fontSize, hasLegend);
            addStandardBarChartOptions(options, data.getNumberOfRows(), yAxisTitle);

            executeDrawChart(data, options);
        };

        var drawPortfolioCostIntensityChart = function() {
            var fontSize = 14;
            var colors = undefined;
            var yAxisTitle = "Cost per sqft";

            var data = google.visualization.arrayToDataTable($scope.costIntensityChartData);

            var hasLegend = false;
            var options = getStandardChartOptions(colors, fontSize, hasLegend);
            addStandardBarChartOptions(options, data.getNumberOfRows(), yAxisTitle);

            executeDrawChart(data, options);
        };

        var drawPortfolioChart = function () {
            switch ($scope.chartCategory) {
                case $scope.energyChartCategoryEnums.CONSUMPTION:
                    drawPortfolioConsumptionChart();
                    break;

                case $scope.energyChartCategoryEnums.INTENSITY:
                    drawPortfolioIntensityChart();
                    break;

                case $scope.energyChartCategoryEnums.COST:
                    drawPortfolioCostChart();
                    break;

                case $scope.energyChartCategoryEnums.COST_INTENSITY:
                    drawPortfolioCostIntensityChart();
                    break;

                default:
                    break;
            }
        };

        var addStandardBarChartOptions = function(options, numberOfRows, yAxisTitle) {
            var groupWidth = undefined;

            if (numberOfRows <= 3) {
                groupWidth = standardBarWidthPixels;
            }

            var additionalOptions = {
                bar: {
                    groupWidth: groupWidth
                },
                vAxis: {
                    title: yAxisTitle,
                    viewWindow: {min: 0}
                },
                animation:{
                    duration: 1000,
                    easing: 'out',
                    startup: true
                }
            };

            angular.extend(options, additionalOptions);
        };

        var addAdditionalTopTenConsumersChartOptions = function (options, tableRowsLength, yAxisTitle) {
            var xAxisFontSize = 9;

            if (tableRowsLength > 7) {
                xAxisFontSize = 8;
            }

            var groupWidth = undefined;

            if (tableRowsLength <= 3) {
                groupWidth = standardBarWidthPixels;
            }


            var additionalOptions = {
                hAxis: {
                    textStyle: {
                        fontSize: xAxisFontSize
                    },
                    slantedText: true,
                    slantedTextAngle: 30
                },
                vAxis: {
                    title: yAxisTitle
                },
                legend: {
                    position: "none"
                },
                tooltip: {
                    trigger: "selection"
                },
                bar: {
                    groupWidth: groupWidth
                }
            };

            angular.extend(options, additionalOptions);

        };

        var addAdditionalConsumptionVsIntensityChartOptions = function (options, tableRowsLength) {
            var xAxisFontSize = 9;
            var yAxisTitle = "Intensity (" + $scope.defaultUnits + "/sqft)";
            var xAxisTitle = "Consumption (" + $scope.defaultUnits + ")";

            if (tableRowsLength > 7) {
                xAxisFontSize = 8;
            }

            var additionalOptions = {
                hAxis: {
                    textStyle: {
                        fontSize: xAxisFontSize
                    },
                    slantedText: true,
                    slantedTextAngle: 30,
                    title: xAxisTitle
                },
                vAxis: {
                    title: yAxisTitle
                },
                legend: {
                    position: "none"
                },
                tooltip: {
                    trigger: "selection"
                }
            };

            angular.extend(options, additionalOptions);

        };

        var addPropertyExclusionPopupMenu = function(chartView, dataTable, indexOfPropertyNumberColumn) {
            chartView.setAction({
                id: "excludePoint",
                text: "Exclude",
                action: function() {
                    excludeSelectedPropertyConsumptionData(chartView, dataTable, indexOfPropertyNumberColumn);
                }
            });
        };

        var addUtilityDetailsPopupMenu = function(chartView, dataTable, indexOfPropertyNumberColumn) {
            chartView.setAction({
                id: "goToPropertyPoint",
                text: "Details",
                action: function() {
                    drillDownToSelectedPropertyConsumptionData(chartView, dataTable, indexOfPropertyNumberColumn);
                }
            });
        };

        var excludeSelectedPropertyConsumptionData = function(chartView, dataTable, indexOfPropertyNumberColumn) {
            var selectedPoint = chartView.getSelection()[0];
            if (angular.isDefined(selectedPoint)) {
                var selectedPropertyNumber = dataTable.getValue(selectedPoint.row, indexOfPropertyNumberColumn);
                $scope.startupRefresh = false;
                $scope.invokeTogglePropertyRestriction(selectedPropertyNumber);
            }
        };

        var drillDownToSelectedPropertyConsumptionData = function(chartView, dataTable, indexOfPropertyNumberColumn) {
            var selectedPoint = chartView.getSelection()[0];
            if (angular.isDefined(selectedPoint)) {
                var selectedPropertyNumber = dataTable.getValue(selectedPoint.row, indexOfPropertyNumberColumn);
                var mockPropertyData = {
                    propertyNumber: selectedPropertyNumber
                };

                $scope.goToUtilityRecords($scope.selectedUtilityTypes, mockPropertyData);
            }
        };

        var drawTopTenConsumersIntensityChart = function() {
            var fontSize = 9;
            var tableRows = [];
            var typeColorsMap = ControllerInfoPasser.get("dashboardTypeColors");
            var yAxisTitle = "Intensity (" + $scope.defaultUnits + "/sqft)";

            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn("string", "Property Name");
            dataTable.addColumn("number", "Intensity");
            dataTable.addColumn({type: "string", role: "tooltip"});
            dataTable.addColumn({type: "string", role: "style"});

            dataTable.addColumn("string", "Property Number");
            var indexOfPropertyNumberColumn = 4;

            for (var x = 0; x < $scope.chartDataTopTenConsumersIntensity.length; x++) {
                var consumer = $scope.chartDataTopTenConsumersIntensity[x];

                var toolTip = consumer.propertyName + "\n" +
                    consumer.propertyNumber + "\n\n" +
                    consumer.intensity + " " + $scope.defaultUnits + "/sqft";

                var barStyle = "color: " + typeColorsMap[consumer.propertyType];
                var property = consumer.propertyNumber;

                tableRows.push([consumer.propertyName.substring(0, 24) + "", consumer.intensity, toolTip, barStyle, property]);
            }

            dataTable.addRows(tableRows);

            var dataView = new google.visualization.DataView(dataTable);
            dataView.hideColumns([indexOfPropertyNumberColumn]);

            var hasLegend = false;
            var options = getStandardChartOptions(undefined, fontSize, dataTable.getNumberOfRows(), hasLegend);
            addAdditionalTopTenConsumersChartOptions(options, dataTable.getNumberOfRows(), yAxisTitle);

            chartView = new google.visualization.ColumnChart(document.getElementById(energyChartArea));
            addPropertyExclusionPopupMenu(chartView, dataTable, indexOfPropertyNumberColumn);
            addUtilityDetailsPopupMenu(chartView, dataTable, indexOfPropertyNumberColumn);

            chartView.draw(dataView, options);
        };

        var drawTopTenCostIntenseChart = function() {
            var fontSize = 9;
            var tableRows = [];
            var typeColorsMap = ControllerInfoPasser.get("dashboardTypeColors");
            var yAxisTitle = "Cost per Sqft";

            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn("string", "Property Name");
            dataTable.addColumn("number", "Cost per Sqft");
            dataTable.addColumn({type: "string", role: "tooltip"});
            dataTable.addColumn({type: "string", role: "style"});

            dataTable.addColumn("string", "Property Number");
            var indexOfPropertyNumberColumn = 4;

            for (var x = 0; x < $scope.chartDataTopTenCostIntenseConsumption.length; x++) {
                var consumer = $scope.chartDataTopTenCostIntenseConsumption[x];

                var toolTip = consumer.propertyName + "\n" +
                    consumer.propertyNumber + "\n\n" +
                    consumer.intensity + " / sqft";

                var barStyle = "color: " + typeColorsMap[consumer.propertyType];
                var property = consumer.propertyNumber;

                tableRows.push([consumer.propertyName.substring(0, 24) + "", consumer.intensity, toolTip, barStyle, property]);
            }

            dataTable.addRows(tableRows);

            var dataView = new google.visualization.DataView(dataTable);
            dataView.hideColumns([indexOfPropertyNumberColumn]);

            var hasLegend = false;
            var options = getStandardChartOptions(undefined, fontSize, dataTable.getNumberOfRows(), hasLegend);
            addAdditionalTopTenConsumersChartOptions(options, dataTable.getNumberOfRows(), yAxisTitle);

            chartView = new google.visualization.ColumnChart(document.getElementById(energyChartArea));
            chartView.setAction({
                id: "excludePoint",
                text: "Exclude",
                action: function() {
                    excludeSelectedPropertyConsumptionData(chartView, dataTable, indexOfPropertyNumberColumn);
                }
            });

            chartView.draw(dataView, options);
        };

        var drawTopTenExpensiveConsumptionChart = function() {
            var fontSize = 9;
            var tableRows = [];
            var typeColorsMap = ControllerInfoPasser.get("dashboardTypeColors");
            var yAxisTitle = "Cost (for total of " + $scope.defaultUnits + ")";

            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn("string", "Property Name");
            dataTable.addColumn("number", "Cost");
            dataTable.addColumn({type: "string", role: "tooltip"});
            dataTable.addColumn({type: "string", role: "style"});

            dataTable.addColumn("string", "Property Number");
            var indexOfPropertyNumberColumn = 4;

            for (var x = 0; x < $scope.chartDataTopTenExpensiveConsumption.length; x++) {
                var consumer = $scope.chartDataTopTenExpensiveConsumption[x];

                var toolTip = consumer.propertyName + "\n" +
                    consumer.propertyNumber + "\n\n" +
                    $filter("number")(consumer.averageCost, 0);

                var barStyle = "color: " + typeColorsMap[consumer.propertyType];
                var property = consumer.propertyNumber;

                tableRows.push([consumer.propertyName.substring(0, 24) + "", consumer.averageCost, toolTip, barStyle, property]);
            }

            dataTable.addRows(tableRows);

            var dataView = new google.visualization.DataView(dataTable);
            dataView.hideColumns([indexOfPropertyNumberColumn]);

            var hasLegend = false;
            var options = getStandardChartOptions(undefined, fontSize, dataTable.getNumberOfRows(), hasLegend);
            addAdditionalTopTenConsumersChartOptions(options, dataTable.getNumberOfRows(), yAxisTitle);

            chartView = new google.visualization.ColumnChart(document.getElementById(energyChartArea));
            chartView.setAction({
                id: "excludePoint",
                text: "Exclude",
                action: function() {
                    excludeSelectedPropertyConsumptionData(chartView, dataTable, indexOfPropertyNumberColumn);
                }
            });

            chartView.draw(dataView, options);
        };

        var drawTopTenConsumersConsumptionChart = function() {
            var fontSize = 9;
            var tableRows = [];
            var typeColorsMap = ControllerInfoPasser.get("dashboardTypeColors");
            var yAxisTitle = "Consumption (" + $scope.defaultUnits + ")";

            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn("string", "Property Name");
            dataTable.addColumn("number", "Consumption");
            dataTable.addColumn({type: "string", role: "tooltip"});
            dataTable.addColumn({type: "string", role: "style"});

            dataTable.addColumn("string", "Property Number");
            var indexOfPropertyNumberColumn = 4;

            for (var x = 0; x < $scope.chartDataTopTenConsumersConsumption.length; x++) {
                var consumer = $scope.chartDataTopTenConsumersConsumption[x];

                var toolTip = consumer.propertyName + "\n" +
                    consumer.propertyNumber + "\n\n" +
                    $filter("number")(consumer.averageConsumption, 0) + " " + $scope.defaultUnits;

                var barStyle = "color: " + typeColorsMap[consumer.propertyType];
                var property = consumer.propertyNumber;

                tableRows.push([consumer.propertyName.substring(0, 24) + "", consumer.averageConsumption, toolTip, barStyle, property]);
            }

            dataTable.addRows(tableRows);

            var dataView = new google.visualization.DataView(dataTable);
            dataView.hideColumns([indexOfPropertyNumberColumn]);

            var hasLegend = false;
            var options = getStandardChartOptions(undefined, fontSize, dataTable.getNumberOfRows(), hasLegend);
            addAdditionalTopTenConsumersChartOptions(options, dataTable.getNumberOfRows(), yAxisTitle);

            chartView = new google.visualization.ColumnChart(document.getElementById(energyChartArea));
            addPropertyExclusionPopupMenu(chartView, dataTable, indexOfPropertyNumberColumn);
            addUtilityDetailsPopupMenu(chartView, dataTable, indexOfPropertyNumberColumn);

            chartView.draw(dataView, options);
        };

        var drawWorstConsumerDecreasesChart = function() {
            var yAxisTitle = "Percentage Decreased";
            drawWorstConsumerDeltaChart($scope.chartDataWorstConsumerDecreases, yAxisTitle);
        };

        var drawWorstConsumerIncreasesChart = function() {
            var yAxisTitle = "Percentage Increased";
            drawWorstConsumerDeltaChart($scope.chartDataWorstConsumerIncreases, yAxisTitle);
        };

        var drawWorstConsumerDeltaChart = function(worstDeltaChartData, yAxisTitle) {
            var fontSize = 9;
            var tableRows = [];
            var typeColorsMap = ControllerInfoPasser.get("dashboardTypeColors");

            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn("string", "Property Name");
            dataTable.addColumn("number", "Percentage");
            dataTable.addColumn({type: "string", role: "tooltip"});
            dataTable.addColumn({type: "string", role: "style"});

            dataTable.addColumn("string", "Property Number");
            var indexOfPropertyNumberColumn = 4;

            for (var x = 0; x < worstDeltaChartData.length; x++) {
                var consumer = worstDeltaChartData[x];

                var toolTip = consumer.propertyName + "\n" +
                    consumer.propertyNumber + "\n\n" +
                    $filter("number")(consumer.changePercentage, 0) + "%";

                var barStyle = "color: " + typeColorsMap[consumer.propertyType];
                var property = consumer.propertyNumber;

                tableRows.push([consumer.propertyName.substring(0, 24) + "", consumer.changePercentage, toolTip, barStyle, property]);
            }

            dataTable.addRows(tableRows);

            var dataView = new google.visualization.DataView(dataTable);
            dataView.hideColumns([indexOfPropertyNumberColumn]);

            var hasLegend = false;
            var options = getStandardChartOptions(undefined, fontSize, dataTable.getNumberOfRows(), hasLegend);
            addAdditionalTopTenConsumersChartOptions(options, dataTable.getNumberOfRows(), yAxisTitle);

            chartView = new google.visualization.ColumnChart(document.getElementById(energyChartArea));
            addPropertyExclusionPopupMenu(chartView, dataTable, indexOfPropertyNumberColumn);
            addUtilityDetailsPopupMenu(chartView, dataTable, indexOfPropertyNumberColumn);

            chartView.draw(dataView, options);
        };

        var getEnergyPieChartOptions = function(headerColumnLength, title) {
            var x = undefined;
            var sliceColors = [];

            $scope.colorGenerator.setNumberRange(0, headerColumnLength);

            for (x = 0; x < headerColumnLength; x++) {
                sliceColors.push("#" + $scope.colorGenerator.colourAt(x));
            }


            return {
                title: title,
                colors: sliceColors,
                animation:{
                    duration: 1000,
                    easing: "out",
                    startup: true
                },
                pieSliceText: "label",
                tooltip: {
                    trigger: "selection"
                },
                is3D: true

            };
        };

        var getYearlyPropertyConsumptionPropertyTypesArray = function(chartData) {
            var propertyTypesArray = [];
            var indexOfFirstYear = 0;
            var firstYearProperties = chartData[indexOfFirstYear].properties;
            for (var y = 0; y < firstYearProperties.length; y++) {
                var propertyObject = firstYearProperties[y];
                propertyTypesArray.push(propertyObject.propertyType);
            }

            return propertyTypesArray;
        };

        var getFormattedYearlyTopConsumersDataTable = function(chartData, amountField, decimalPlaces) {
            var chartNumberFormatter = new google.visualization.NumberFormat({
                groupingSymbol: ",",
                fractionDigits: decimalPlaces
            });

            var dataTable = new google.visualization.DataTable();

            dataTable.addColumn("string", "Year");

            var indexOfFirstYear = 0;
            var firstYearProperties = chartData[indexOfFirstYear].properties;
            for (var y = 0; y < firstYearProperties.length; y++) {
                var propertyObject = firstYearProperties[y];
                dataTable.addColumn("number", propertyObject.propertyNumber + " - " + propertyObject.propertyName);
            }

            var tableRows = [];
            for (var x = 0; x < chartData.length; x++) {
                var yearObject = chartData[x];
                var yearRow = [];
                yearRow.push(yearObject.year.toString());

                var properties = yearObject.properties;
                for (var i = 0; i < properties.length; i++) {
                    yearRow.push(properties[i][amountField]);
                }

                tableRows.push(yearRow);
            }

            dataTable.addRows(tableRows);

            for (var z = 0; z < dataTable.getNumberOfColumns(); z++) {
                if (z > 0) {
                    var indexOfNumberToFormat = z;
                    chartNumberFormatter.format(dataTable, indexOfNumberToFormat);
                }
            }

            return dataTable;
        };

        var getYearlyTopConsumersChartOptions = function(yAxisTitle, propertyTypesArray, tableRowsLength, tableColumnsLength) {
            var typeColorsMap = ControllerInfoPasser.get("dashboardTypeColors");
            var colors = [];

            for (var x = 0; x < propertyTypesArray.length; x++) {
                var c = typeColorsMap[propertyTypesArray[x]];
                if (angular.isDefined(c) && c !== null) {
                    colors.push(c);
                }
            }

            colors = colors.length > 0 ? colors : undefined;

            var groupWidth = undefined;

            if (tableRowsLength <= 3 && tableColumnsLength <= 3) {
                groupWidth = standardBarWidthPixels;
            }

            return {
                vAxis: {
                    title: yAxisTitle,
                    viewWindow: {min: 0}
                },
                hAxis: {title: "Year"},
                seriesType: "bars",
                colors: colors,
                legend: {
                    position: "none"
                },
                animation: {
                    duration: 1000,
                    easing: "out",
                    startup: true
                },
                bar: {
                    groupWidth: groupWidth
                }
            };
        };

        var drawYearlyTopEnergyConsumers = function() {
            var amountField = "totalConsumption";
            var decimalPlaces = 0;
            var chartData = angular.copy($scope.chartDataYearlyTopProperties);

            var dataTable = getFormattedYearlyTopConsumersDataTable(chartData, amountField, decimalPlaces);
            var propertyTypesArray = getYearlyPropertyConsumptionPropertyTypesArray(chartData);

            var yAxisTitle = "Consumption (" + $scope.defaultUnits + ")";
            var options = getYearlyTopConsumersChartOptions(yAxisTitle, propertyTypesArray, dataTable.getNumberOfRows(), dataTable.getNumberOfColumns());

            var chart = new google.visualization.ComboChart(document.getElementById(energyChartArea));
            chart.draw(dataTable, options);
        };

        var drawYearlyTopEnergyIntensities = function() {
            var amountField = "intensity";
            var decimalPlaces = 2;
            var chartData = angular.copy($scope.chartDataYearlyTopProperties);

            var dataTable = getFormattedYearlyTopConsumersDataTable(chartData, amountField, decimalPlaces);
            var propertyTypesArray = getYearlyPropertyConsumptionPropertyTypesArray(chartData);

            var yAxisTitle = "Intensity (" + $scope.defaultUnits + "/sqft)";
            var options = getYearlyTopConsumersChartOptions(yAxisTitle, propertyTypesArray, dataTable.getNumberOfRows(), dataTable.getNumberOfColumns());

            var chart = new google.visualization.ComboChart(document.getElementById(energyChartArea));
            chart.draw(dataTable, options);
        };

        var drawScopeDistributionChart = function() {
            var indexOfNumberToFormat = 1;
            var dataTable = google.visualization.arrayToDataTable($scope.chartDataScopeDistribution);
            var options = getEnergyPieChartOptions(dataTable.getNumberOfRows(), "Scope Consumption Distribution (ekWh)");
            if (dataTable.getNumberOfRows() > 0) {
                googleChartNumberFormatter.format(dataTable, indexOfNumberToFormat);
            }

            var chart = new google.visualization.PieChart(document.getElementById(energyChartArea));
            chart.draw(dataTable, options);
        };

        var drawTopTenConsumersChart = function() {
            switch ($scope.chartCategory) {
                case $scope.energyChartCategoryEnums.CONSUMPTION:
                    drawTopTenConsumersConsumptionChart();
                    break;

                case $scope.energyChartCategoryEnums.INTENSITY:
                    drawTopTenConsumersIntensityChart();
                    break;

                case $scope.energyChartCategoryEnums.COST:
                    drawTopTenExpensiveConsumptionChart();
                    break;

                case $scope.energyChartCategoryEnums.COST_INTENSITY:
                    drawTopTenCostIntenseChart();
                    break;

                default:
                    break;
            }
        };

        var drawYearlyConsumersChart = function() {
            switch ($scope.chartCategory) {
                case $scope.energyChartCategoryEnums.CONSUMPTION:
                    drawYearlyTopEnergyConsumers();
                    break;

                case $scope.energyChartCategoryEnums.INTENSITY:
                    drawYearlyTopEnergyIntensities();
                    break;

                default:
                    $scope.chartCategory = $scope.energyChartCategoryEnums.INTENSITY;
                    drawYearlyTopEnergyIntensities();
                    break;
            }
        };

        var drawConsumptionVSIntensityChart = function () {
            var fontSize = 9;
            var tableRows = [];
            var typeColorsMap = ControllerInfoPasser.get("dashboardTypeColors");

            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn('number', 'Consumption');
            dataTable.addColumn('number', 'Intensity');
            dataTable.addColumn({type: 'string', role: 'tooltip'});
            dataTable.addColumn({type: 'string', role: 'style'});

            dataTable.addColumn('string', 'Property Number');
            var indexOfPropertyNumberColumn = 4;

            for (var x = 0; x < $scope.chartDataConsumptionVSIntensity.length; x++) {
                var consumer = $scope.chartDataConsumptionVSIntensity[x];

                var relativeIntensity = Number(consumer.relativeIntensity);
                var averageConsumption = Math.round(Number(consumer.averageConsumption));

                var toolTip = consumer.propertyName + "\n" +
                    consumer.propertyNumber + "\n\n" +
                    "Intensity: " + relativeIntensity.toLocaleString("en") + "\n" +
                    "Consumption: " + averageConsumption.toLocaleString("en");

                var pointStyle = "point {fill-color: " + typeColorsMap[consumer.propertyType] + "}";
                var property = consumer.propertyNumber;

                tableRows.push([consumer.averageConsumption, consumer.relativeIntensity, toolTip, pointStyle, property]);
            }

            dataTable.addRows(tableRows);

            var dataView = new google.visualization.DataView(dataTable);
            dataView.hideColumns([indexOfPropertyNumberColumn]);

            var hasLegend = false;
            var options = getStandardChartOptions(undefined, fontSize, dataTable.getNumberOfRows(), hasLegend);
            addAdditionalConsumptionVsIntensityChartOptions(options, dataTable.getNumberOfRows());

            chartView = new google.visualization.ScatterChart(document.getElementById(energyChartArea));
            addPropertyExclusionPopupMenu(chartView, dataTable, indexOfPropertyNumberColumn);
            addUtilityDetailsPopupMenu(chartView, dataTable, indexOfPropertyNumberColumn);

            chartView.draw(dataView, options);
        };

        $scope.invokeTogglePropertyRestriction = function(propertyNumber) {
            ControllerInfoPasser.broadcast("event:togglePropertyRestriction", propertyNumber);
        };

        $scope.drawEnergyChart = function () {
            $scope.likeForLikeCheckboxDisabled = false;

            switch ($scope.chartType) {
                case 'propertyType':
                    $scope.showChartCategoryBlock = true;
                    $scope.showChartCategoryCostBlock = true;
                    $scope.showLikeForLikeCheckbox = true;
                    drawPropertyTypeChart();
                    break;

                case 'region':
                    $scope.showChartCategoryBlock = true;
                    $scope.showChartCategoryCostBlock = true;
                    $scope.showLikeForLikeCheckbox = true;
                    drawPropertyRegionChart();
                    break;

                case 'portfolio':
                    $scope.showChartCategoryBlock = true;
                    $scope.showChartCategoryCostBlock = true;
                    $scope.showLikeForLikeCheckbox = true;
                    drawPortfolioChart();
                    break;

                case 'topTenConsumers':
                    $scope.showChartCategoryBlock = true;
                    $scope.showChartCategoryCostBlock = true;
                    $scope.showLikeForLikeCheckbox = true;
                    $scope.likeForLikeCheckboxDisabled = true;
                    $scope.likeForLike = true;
                    likeForLikeAnalysis();
                    drawTopTenConsumersChart();
                    break;

                case 'consumptionVSIntensity':
                    $scope.showChartCategoryBlock = false;
                    $scope.showLikeForLikeCheckbox = true;
                    $scope.likeForLikeCheckboxDisabled = true;
                    $scope.likeForLike = true;
                    likeForLikeAnalysis();
                    drawConsumptionVSIntensityChart();
                    break;

                case "scopeDistribution":
                    $scope.showChartCategoryBlock = false;
                    $scope.showLikeForLikeCheckbox = true;
                    $scope.likeForLikeCheckboxDisabled = true;
                    $scope.likeForLike = true;
                    likeForLikeAnalysis();
                    drawScopeDistributionChart();
                    break;

                case "yearlyPropertyConsumptions":
                    $scope.showChartCategoryBlock = true;
                    $scope.likeForLikeCheckboxDisabled = true;
                    $scope.likeForLike = true;
                    $scope.showChartCategoryCostBlock = false;
                    likeForLikeAnalysis();
                    drawYearlyConsumersChart();
                    break;

                case "worstConsumptionIncreases":
                    $scope.showChartCategoryBlock = false;
                    $scope.showLikeForLikeCheckbox = false;
                    $scope.likeForLike = false;
                    likeForLikeAnalysis();
                    drawWorstConsumerIncreasesChart();
                    break;

                case "worstConsumptionDecreases":
                    $scope.showChartCategoryBlock = false;
                    $scope.showLikeForLikeCheckbox = false;
                    $scope.likeForLike = false;
                    likeForLikeAnalysis();
                    drawWorstConsumerDecreasesChart();
                    break;

                case 'portfolioReductionTargets':
                    $scope.showChartCategoryBlock = false;
                    $scope.showLikeForLikeCheckbox = true;
                    likeForLikeAnalysis();
                    drawPortfolioReductionTargetsChart();
                    break;

                default:
                    break;

            }
        };

        $scope.refreshData = function () {
            $scope.getDashboardData(ControllerInfoPasser.get("dashboardPropertyNumbers"));
        };

        $scope.exportExcelDashboardData = function (propertyNumbers) {
            var formData = getEnergyFormData(propertyNumbers);
            var utility = $scope.getSelectedUtilityTypeShortForm($scope.selectedUtilityTypes);

            var url = contextPath + '/webapi/properties/0/' + utility + '/dashboardData/excel/energy/' + $scope.reportType + '/years/' + $scope.fromYear + '/to/' + $scope.toYear + '/months/' + $scope.fromMonth + '/to/' + $scope.toMonth;
            $scope.openInNewWindow('POST', url, formData);
        };

        $scope.exportExcel = function () {
            $scope.exportExcelDashboardData(ControllerInfoPasser.get("dashboardPropertyNumbers"));
        };

        $scope.$on('event:refreshData', function () {
            $scope.refreshData();
        });

        $scope.$on('event:distributionFilterChange', function () {
            if (!$scope.startupRefresh) {
                $scope.numOfProperties = ControllerInfoPasser.get("dashboardPropertyNumbers").length;
                $scope.refreshData();
                $scope.startupRefresh = true;
            }
        });

        $scope.getNumberOfProperties = function() {
            if (angular.isDefined(ControllerInfoPasser.get("dashboardPropertyNumbers"))) {
                return ControllerInfoPasser.get("dashboardPropertyNumbers").length;
            } else {
                return 0;
            }
        };

        if (angular.isDefined(ControllerInfoPasser.get("dashboardPropertyNumbers"))) {
            $scope.refreshData();
        }

        $scope.isConsumptionDataVisible = function () {
            return $scope.consumptionData.length > 0;
        };

        $scope.isAtMonthLevel = function () {
            return angular.isDefined($scope.selectedPropertyDrill);
        };

        $scope.filterEmptyRecords = function (item) {
            if (item.conData.length === 0) {
                return false;
            } else {
                $scope.noRecords = false;
                return true;
            }
        };

        $scope.showDescription = function (value) {
            var index = $scope.dropboxes['shortMonths'].itemMap.map(function (entry) {
                return parseInt(entry.value);

            }).indexOf(value);
            return $scope.dropboxes['shortMonths'].itemMap[index].key;
        };

        $scope.selectEnergyRow = function (conData, selectedYear) {
            // Reset filter values
            $scope.vars.consumptionDataFilter = '';
            $scope.selectedFilterMode = $scope.filterModes.NONE;

            $scope.selectedYear = selectedYear;
            $scope.consumptionData.length = 0;

            var utilityIndex = $scope.dropboxes['utilityTypeShort'].itemMap.map(function (entry) {
                return entry.value;

            }).indexOf($scope.utility);

            var fromMonthIndex = $scope.dropboxes['shortMonths'].itemMap.map(function (entry) {
                return parseInt(entry.value);

            }).indexOf($scope.fromMonth);

            var toMonthIndex = $scope.dropboxes['shortMonths'].itemMap.map(function (entry) {
                return parseInt(entry.value);

            }).indexOf($scope.toMonth);

            $scope.selectedUtility = $scope.dropboxes['utilityTypeShort'].itemMap[utilityIndex].key;

            if (fromMonthIndex === toMonthIndex) {
                $scope.selectedMonthsLabel = 'Month:';
                $scope.selectedMonthsValue = $scope.dropboxes['shortMonths'].itemMap[fromMonthIndex].key;
            } else {
                $scope.selectedMonthsLabel = 'Months:';
                $scope.selectedMonthsValue = $scope.dropboxes['shortMonths'].itemMap[fromMonthIndex].key +
                    ' to ' + $scope.dropboxes['shortMonths'].itemMap[toMonthIndex].key;
            }

            $scope.propertyConData = angular.copy(conData);

            $scope.consumptionData = $scope.consumptionForPropertyList(conData);
            $scope.filteredConsumptionData = angular.copy($scope.consumptionData);

            angular.forEach($scope.consumptionData, function (item, idx) {
                $scope.consumptionData[idx].conTotal = $scope.roundDownToInt(item.conTotal);
                if ($scope.consumptionData[idx].hasError == true) {
                    $scope.consumptionData[idx].conTotal = '0';
                    $scope.consumptionData[idx].conAvg = '0';
                }
            });
            $scope.resetPaginationProperty();

        };

        $scope.consumptionForPropertyList = function (conData) {

            var consumptionData = [];

            angular.forEach(angular.copy(conData), function (item, idx) {

                var index = consumptionData.map(function (entry) {
                    return entry.propertyNumber;
                }).indexOf(item.propertyNumber);

                if (angular.isUndefined(item.conTotal)) {
                    item.conTotal = '0';
                }

                if (index > -1) {
                    consumptionData[index].sqft = item.sqft;
                    consumptionData[index].conTotal = new BigDecimal(new String(item.conTotal)).add(new BigDecimal(new String(consumptionData[index].conTotal))).toString();
                    consumptionData[index].conAvg = $scope.calculateRelativeIntensity(consumptionData[index].conTotal, item.sqft);
                    consumptionData[index].propertyNumberHidden = item.propertyNumber;
                    if (item.hasError) {
                        consumptionData[index].errorText = item.errorText;
                        consumptionData[index].hasError = true;
                    }
                } else {
                    item.conAvg = $scope.calculateRelativeIntensity(item.conTotal, item.sqft);
                    item.propertyNumberHidden = item.propertyNumber;
                    consumptionData.push(item);
                }
            });

            return consumptionData;
        };

        $scope.calculateRelativeIntensity = function (conTotal, sqft) {
            var defaultReturnNumber = 0;
            if (sqft !== null && !new BigDecimal(new String(sqft)).isZero()) {
                var AvgConTotal = new BigDecimal(new String(conTotal)).multiply(INTENSITY_FACTOR).divide(new BigDecimal(new String(sqft)), 2, BigDecimal.ROUND_HALF_DOWN);
                if (AvgConTotal.isZero()) {
                    return defaultReturnNumber;
                } else {
                    return parseFloat(AvgConTotal.toString());
                }
            } else {
                return defaultReturnNumber;
            }
        };

        $scope.roundDownToInt = function (number) {
            var numberAsString = new String(number);
            return parseInt(numberAsString);
        };

        $scope.resetPagination = function () {
            $scope.currentPage = 0;
        };

        $scope.selectRowPropertyLevel = function (property) {

            $scope.selectedPropertyDrill = property;

            $scope.selectedPropertyConData = $scope.propertyConData.filter(function (item) {
                return item.propertyNumber === property.propertyNumber;
            });

            $scope.resetPaginationMonth();
        };

        $scope.resetPaginationProperty = function () {
            $scope.currentPageProperty = 0;
        };

        $scope.resetPaginationMonth = function () {
            $scope.currentPageMonth = 0;
        };

        $scope.back = function () {
            if ($scope.isAtMonthLevel()) {
                $scope.selectedPropertyDrill = undefined;
            } else {
                $scope.consumptionData.length = 0;
            }
        };

        $scope.refreshSnapshotForYear = function (year) {
            var propertyNumbers = ControllerInfoPasser.get("dashboardPropertyNumbers");
            clearVisibleData();
            $scope.loading = true;
            var utility = $scope.getSelectedUtilityTypeShortForm($scope.selectedUtilityTypes);
            UtilityService.updateEnergySnapshotsForYear({
                year: year,
                utility: utility
            }, propertyNumbers, function () {
                $scope.loading = false;
                $scope.refreshData();
            }, function () {
                $scope.loading = false;
                $scope.displayMessageInElement('.error-energy-dash', 'An error has occurred while trying to refresh the utility snapshots for ' + year + '!', 10000);
            });
        };

        $scope.selectYear = function (year) {
            $scope.snapshotYearToUpdate = year;
        };

        $scope.getLongFormUtility = function (shortUtility) {
            if (angular.isDefined($scope.dropboxes) && angular.isDefined($scope.dropboxes['utilityTypeShort'])) {
                return $scope.dropboxes['utilityTypeShort'].itemMap.filter(function (item) {
                    return item.value === shortUtility;
                })[0].key;
            } else {
                return '';
            }
        };

        $scope.canRefreshSnapshots = function () {
            $scope.allowedToRefreshSnapshots = false;
            if ($scope.selectedUtilityTypes.length != 1) {
                $scope.allowedToRefreshSnapshots = false;

            } else {
                if ($scope.isAdmin) {
                    $scope.allowedToRefreshSnapshots = true;
                } else {
                    angular.forEach($scope.currentUser.userProfile.roles, function (role) {
                        angular.forEach(role.moduleSecurityList, function (security) {
                            if (security.module === $scope.moduleEnums.sustainability && security.accessType === $scope.moduleAccessTypes.ADMIN) {
                                $scope.allowedToRefreshSnapshots = true;
                            }
                        });
                    });
                }
            }
        };

        $scope.initializeUtilityTypes = function() {
            $scope.utilityTypes = $scope.dropboxes["utilityTypeShort"].itemMap;

            for (var x = 0; x < $scope.utilityTypes.length; x++) {
                if ($scope.utilityTypes[x].value === $scope.ELECTRICITY_UTILITY_TYPE_SHORT_NAME) {
                    $scope.selectedUtilityTypes.push($scope.utilityTypes[x]);
                }

                if ($scope.utilityTypes[x].value === $scope.WATER_UTILITY_TYPE_SHORT_NAME) {
                    var water = angular.copy($scope.utilityTypes[x]);
                    ControllerInfoPasser.put('waterUtilityType', water);
                    $scope.utilityTypes.splice(x, 1);
                }
            }
        };

        $scope.startup = function() {
            $scope.initializeUtilityTypes();
            $scope.refreshData();
            $scope.resetTableDataOrder();
            $scope.canRefreshSnapshots();
            ControllerInfoPasser.broadcast("event:waterDashboardReadyToLoad");
        };

        $scope.loadDropboxes(['utilityTypeShort', 'shortMonths', 'energyChartType', 'utilityType'], $scope.startup);
    }])
    .controller("WaterDashCtrl", ['$scope', 'ControllerInfoPasser', function ($scope, ControllerInfoPasser) {
        $scope.initializeWaterUtilityType = function () {

            if (angular.isDefined(ControllerInfoPasser.get('waterUtilityType'))) {
                $scope.selectedUtilityTypes.push(ControllerInfoPasser.get('waterUtilityType'));
            }

            for (var x = 0; x < $scope.utilityTypes.length; x++) {
                if ($scope.utilityTypes[x].value != $scope.WATER_UTILITY_TYPE_SHORT_NAME) {
                    $scope.selectedUtilityTypes.splice(x, 1);
                }
            }
        };
        
        $scope.$on('event:waterDashboardReadyToLoad', function () {
            $scope.initializeWaterUtilityType();
            $scope.canRefreshSnapshots();
        });

    }])
    .controller("WasteDashCtrl", ["$scope", "ControllerInfoPasser", "WasteService", "WasteStreamsService", "contextPath", function ($scope, ControllerInfoPasser, WasteService, WasteStreamsService, contextPath) {
        $scope.loadDropboxes(["shortMonths", "wasteCompanyName"]);

        var thisYear = new Date().getFullYear();
        var TONNE_TO_GRAMS = new BigDecimal("1000000");
        var standardBarWidthPixels = 60;

        $scope.years = [];
        $scope.pageSize = 10;
        $scope.wasteYearData = [];
        $scope.reportType = $scope.reportTypeEnums.YEARLY;

        for (var i = thisYear; i >= thisYear - 4; i--) {
            $scope.years.push(i);
        }

        $scope.fromYear = thisYear - 3;
        $scope.toYear = thisYear; // Default to previous year

        $scope.fromMonth = 1;
        $scope.toMonth = 12;

        $scope.chartData = [];
        $scope.wasteData = [];

        $scope.chartCategory = "total";
        $scope.chartType = "portfolio";
        $scope.wasteStreamFilter = null;
        $scope.startupRefresh = false;
        $scope.noRecords = true;

        $scope.chartTypeEnum = {
            PROPERTY_TYPE: "propertyType",
            REGION: "region",
            PORTFOLIO: "portfolio",
            WASTE_STREAM: "wasteStream",
            WORST_WASTE_GENERATORS: "worstWasteGenerators"
        };

        $scope.chartFormatEnum = {
            STACKED_BAR: "stackedBar",
            PIE: "pie",
            THREE_DIMENSIONAL_PIE: "threeDimensionalPie"
        };

        $scope.chartFormat = $scope.chartFormatEnum.THREE_DIMENSIONAL_PIE;

        var wasteChartAreaId = "wasteChartArea";

        var chartView;

        var defaultPredicatesProperty = ["propertyNumberHidden"];
        var defaultPredicatesMonth = ["propertyNumberHidden", "month"];

        $scope.resetTableDataOrder = function () {
            $scope.tableDataOrderProperty = angular.copy(defaultPredicatesProperty);
            $scope.tableDataOrderMonth = angular.copy(defaultPredicatesMonth);
        };

        WasteStreamsService.query({}, function (data) {
            $scope.allWasteStreams = data.sort(function (a, b) {
                if (a.name > b.name) {
                    return 1;
                }
                if (a.name < b.name) {
                    return -1;
                }
                // a must be equal to b
                return 0;
            });
        });

        $scope.getDashboardData = function (propertyNumbers) {
            $scope.chartData.length = 0;
            $scope.wasteData.length = 0;

            $scope.wasteChartCategoryEnums = {
                TOTAL: "total",
                DIVERTED: "diverted",
                INTENSITY: "intensity"
            };

            $scope.loading = true;
            //$scope.clearChart('wasteChartArea');
            WasteService.getDashboardData({
                    fromYear: $scope.fromYear,
                    toYear: $scope.toYear,
                    fromMonth: $scope.fromMonth,
                    toMonth: $scope.toMonth,
                    companyName: $scope.wasteHauler
                },
                {
                    propertyNumbers: propertyNumbers,
                    wasteStream: $scope.wasteStreamFilter
                }, function (data) {
                    $scope.loading = false;
                    $scope.wasteDataOriginal = angular.copy(data.yearData);
                    $scope.likeForLikeWasteDataOriginal = angular.copy(data.likeForLikeYearData);
                    $scope.chartDataOriginal = angular.copy(data.chartData);
                    $scope.rootData = angular.copy(data);

                    $scope.assignDefaultLikeForLikeChartsData();

                    $scope.likeForLikeAnalysis();
                }, function (ignore) {
                    // Error
                    $scope.loading = false;
                });
        };

        $scope.assignDefaultLikeForLikeChartsData = function() {
            $scope.streamDiversionPercentagesChartData = $scope.rootData.streamDiversionPercentagesChartData;
            $scope.streamIntensitiesChartData = $scope.rootData.streamIntensitiesChartData;
            $scope.streamTotalsChartData = $scope.rootData.streamTotalsChartData;

            $scope.worstAmountGenerators = $scope.rootData.worstAmountGenerators;
            $scope.worstIntensityGenerators = $scope.rootData.worstIntensityGenerators;
            $scope.worstDiversionGenerators = $scope.rootData.worstDiversionGenerators;
        };

        var initializeLikeForLikeValues = function() {
            $scope.wasteData = angular.copy($scope.likeForLikeWasteDataOriginal);
            $scope.chartData = angular.copy($scope.chartDataOriginal);

            $scope.chartDataPropertyType = $scope.rootData.likeForLikeTotalChartDataForPropertyType;
            $scope.chartDataPropertyTypeDiverted = $scope.rootData.likeForLikeChartDataPropertyTypeDiverted;
            $scope.chartDataPropertyTypeIntensity = $scope.rootData.likeForLikeChartDataPropertyTypeIntensity;

            $scope.chartDataRegion = $scope.rootData.likeForLikeTotalChartDataRegion;
            $scope.chartDataRegionDiverted = $scope.rootData.likeForLikeChartDataRegionDiverted;
            $scope.chartDataRegionIntensity = $scope.rootData.likeForLikeChartDataRegionIntensity;

            $scope.chartDataPortfolioIntensity = $scope.rootData.likeForLikeChartDataPortfolioIntensity;

            $scope.chartData = $scope.getChartDataFromYearsData();
        };

        $scope.likeForLikeAnalysis = function () {
            if ($scope.likeForLike) {
                initializeLikeForLikeValues();

            } else {
                $scope.wasteData = angular.copy($scope.wasteDataOriginal);
                $scope.chartData = angular.copy($scope.chartDataOriginal);

                $scope.chartDataPropertyType = $scope.rootData.chartDataForPropertyType;
                $scope.chartDataPropertyTypeDiverted = $scope.rootData.chartDataPropertyTypeDiverted;
                $scope.chartDataPropertyTypeIntensity = $scope.rootData.chartDataPropertyTypeIntensity;

                $scope.chartDataRegion = $scope.rootData.chartDataRegion;
                $scope.chartDataRegionDiverted = $scope.rootData.chartDataRegionDiverted;
                $scope.chartDataRegionIntensity = $scope.rootData.chartDataRegionIntensity;

                $scope.chartDataPortfolioIntensity = $scope.rootData.chartDataPortfolioIntensity;
            }

            $scope.drawWasteDataChart();
        };

        $scope.getChartDataFromYearsData = function () {
            var headerIdx = 0;
            var chartTotalWaste = [$scope.chartData.totalWasteChartData[headerIdx]];
            var chartDiversion = [$scope.chartData.diversionRateChartData[headerIdx]];

            angular.forEach($scope.wasteData, function (yearWasteData, ignore) {
                chartTotalWaste.push([yearWasteData.year.toString(), parseFloat(yearWasteData.total)]);
                chartDiversion.push([yearWasteData.year.toString(), parseFloat(yearWasteData.diversionRate)]);
            });

            return {totalWasteChartData: chartTotalWaste, diversionRateChartData: chartDiversion};
        };

        /**
         *
         * @param {{
         * monthData,
         * total,
         * propertySqft,
         * diverted
         * }} yearData
         *
         * @param validPropertyNumbers
         */
        $scope.updateSummary = function (yearData, validPropertyNumbers) {
            yearData.propertyCount = validPropertyNumbers.length;
            yearData.total = $scope.sumWaste(yearData.monthData);
            yearData.propertySqft = $scope.sumSqft(yearData.monthData, validPropertyNumbers);
            yearData.diverted = $scope.sumDiverted(yearData.monthData);
            yearData.intensity = $scope.calculateWasteIntensity(yearData.total, yearData.propertySqft);
            yearData.diversionRate = $scope.calculateDiversionRateWaste(yearData.diverted, yearData.total);
            yearData.hasError = false;
        };

        $scope.sumDiverted = function (wasteData) {
            var diverted = 0;
            for (var i = 0; i < wasteData.length; i++) {
                if (angular.isDefined(wasteData[i].diverted)) {
                    diverted += wasteData[i].diverted;
                }
            }
            return diverted;
        };

        $scope.sumWaste = function (wasteData) {
            var wasteTotal = 0;
            for (var i = 0; i < wasteData.length; i++) {
                wasteTotal += wasteData[i].total;
            }
            return wasteTotal;
        };

        $scope.sumSqft = function (wasteData, validPropertyNumbers) {
            var sumSqft = 0;
            for (var i = 0; i < validPropertyNumbers.length; i++) {
                var wasteDataForProperty = wasteData[wasteData.map(function (waste) {
                    return waste.propertyNumber;
                }).indexOf(validPropertyNumbers[i])];
                if (angular.isDefined(wasteDataForProperty)) {
                    sumSqft += wasteDataForProperty.propertySqft;
                }
            }
            return sumSqft;
        };

        $scope.isValidProperty = function (monthData, propertyNumber) {
            for (var i = 0; i < monthData.length; i++) {
                if (propertyNumber === monthData[i].propertyNumber && angular.isDefined(monthData[i].errorText)) {
                    return false;
                }
            }
            return true;
        };

        $scope.exportExcelDashboardData = function (propertyNumbers) {

            var data = {
                propertyNumbers: propertyNumbers,
                wasteStream: $scope.wasteStreamFilter
            };

            var url = contextPath + "/webapi/waste/management/records/dashboardData/excel/waste/" + $scope.reportType + "/years/" + $scope.fromYear + "/to/" + $scope.toYear + "/months/" + $scope.fromMonth + "/to/" + $scope.toMonth;
            $scope.openInNewWindow("POST", url, data);
        };

        $scope.exportExcel = function () {
            $scope.exportExcelDashboardData(ControllerInfoPasser.get("dashboardPropertyNumbers"));
        };

        $scope.getChartColors = function (header, chartType) {

            var colorsReturn = [];

            if (chartType === "propertyType") {

                var typeColorsMap = ControllerInfoPasser.get("dashboardTypeColors");

                for (var x = 1; x < header.length; x++) {
                    if (angular.isDefined(typeColorsMap[header[x]])) {
                        colorsReturn.push(typeColorsMap[header[x]]);
                    } else {
                        if (header[x] === "Unknown") {
                            colorsReturn.push(typeColorsMap[""]);
                        }
                    }
                }
            } else {

                var unitColorsMap = ControllerInfoPasser.get("dashboardUnitColors");

                for (var i = 1; i < header.length; i++) {
                    if (angular.isDefined(unitColorsMap[header[i]])) {
                        colorsReturn.push(unitColorsMap[header[i]]);
                    }
                }
            }
            return colorsReturn;
        };


        var getStandardWasteDashboardChartOptions = function(colors, fontSize, numberOfRows, yAxisTitle, hasLegend) {
            var groupWidth = undefined;
            var legendPosition = "none";

            if (numberOfRows <= 3) {
                groupWidth = standardBarWidthPixels;
            }

            if (hasLegend) {
                legendPosition = "top";
            }

            return {
                colors: colors,
                legend: {position: legendPosition, textStyle: {fontSize: fontSize}},
                axes: {
                    y: {
                        all: {
                            format: {
                                pattern: "decimal"
                            }
                        }
                    }
                },
                vAxis: {
                    viewWindow: {
                        min: 0
                    },
                    title: yAxisTitle
                },
                bar: {
                    groupWidth: groupWidth
                },
                animation:{
                    duration: 1000,
                    easing: "out",
                    startup: true
                }
            };
        };

        var drawStandardWasteDashboardBarChart = function(colors, fontSize, chartData, yAxisTitle, hasLegend) {
            var options = getStandardWasteDashboardChartOptions(colors, fontSize, chartData.getNumberOfRows(), yAxisTitle, hasLegend);

            chartView = new google.visualization.ColumnChart(document.getElementById(wasteChartAreaId));
            chartView.draw(chartData, options);
        };

        var drawWasteTotalPropertyTypeChart = function() {
            var fontSize = 14;

            if ($scope.chartDataPropertyType[0].length > 5) {
                fontSize = 9;
            }
            var colors = $scope.getChartColors($scope.chartDataPropertyType[0], $scope.chartType);
            var chartData = google.visualization.arrayToDataTable($scope.appendUnknownHeaderName($scope.chartDataPropertyType));

            var yAxisTitle = "Total (Tonnes)";
            var hasLegend = false;
            drawStandardWasteDashboardBarChart(colors, fontSize, chartData, yAxisTitle, hasLegend);
        };

        var drawWasteTotalPortfolioChart = function() {
            var fontSize = 14;
            var chartData = google.visualization.arrayToDataTable($scope.chartData.totalWasteChartData);

            var yAxisTitle = "Total (Tonnes)";
            var hasLegend = false;
            drawStandardWasteDashboardBarChart(undefined, fontSize, chartData, yAxisTitle, hasLegend);
        };

        var drawWasteTotalRegionChart = function() {
            var fontSize = 14;

            var colors = $scope.getChartColors($scope.chartDataRegion[0], $scope.chartType);
            var chartData = google.visualization.arrayToDataTable($scope.chartDataRegion);

            var yAxisTitle = "Total (Tonnes)";
            var hasLegend = false;
            drawStandardWasteDashboardBarChart(colors, fontSize, chartData, yAxisTitle, hasLegend);
        };

        var drawDiversionPercentPropertyTypeChart = function() {
            var fontSize = 14;

            if ($scope.chartDataPropertyTypeDiverted[0].length > 5) {
                fontSize = 9;
            }
            var colors = $scope.getChartColors($scope.chartDataPropertyTypeDiverted[0], $scope.chartType);
            var chartData = google.visualization.arrayToDataTable($scope.appendUnknownHeaderName($scope.chartDataPropertyTypeDiverted));

            var yAxisTitle = "Diversion %";
            drawStandardWasteDashboardBarChart(colors, fontSize, chartData, yAxisTitle);
        };

        var drawDiversionPercentPortfolioChart = function() {
            var fontSize = 14;
            var chartData = google.visualization.arrayToDataTable($scope.chartData.diversionRateChartData);

            var yAxisTitle = "Diversion %";
            drawStandardWasteDashboardBarChart(undefined, fontSize, chartData, yAxisTitle);
        };

        var drawDiversionPercentRegionChart = function() {
            var fontSize = 14;
            var colors = $scope.getChartColors($scope.chartDataRegionDiverted[0], $scope.chartType);
            var chartData = google.visualization.arrayToDataTable($scope.chartDataRegionDiverted);

            var yAxisTitle = "Diversion %";
            drawStandardWasteDashboardBarChart(colors, fontSize, chartData, yAxisTitle);
        };

        var drawIntensityRegionChart = function() {
            var fontSize = 14;
            var colors = $scope.getChartColors($scope.chartDataRegionIntensity[0], $scope.chartType);
            var chartData = google.visualization.arrayToDataTable($scope.chartDataRegionIntensity);

            var yAxisTitle = "Intensity (g/sqft)";
            drawStandardWasteDashboardBarChart(colors, fontSize, chartData, yAxisTitle);
        };

        var drawIntensityPropertyTypeChart = function() {
            var fontSize = 14;

            if ($scope.chartDataPropertyTypeIntensity[0].length > 5) {
                fontSize = 9;
            }
            var colors = $scope.getChartColors($scope.chartDataPropertyTypeIntensity[0], $scope.chartType);
            var chartData = google.visualization.arrayToDataTable($scope.appendUnknownHeaderName($scope.chartDataPropertyTypeIntensity));

            var yAxisTitle = "Intensity (g/sqft)";
            drawStandardWasteDashboardBarChart(colors, fontSize, chartData, yAxisTitle);
        };

        var drawIntensityPortfolioChart = function() {
            var fontSize = 14;
            var chartData = google.visualization.arrayToDataTable($scope.chartDataPortfolioIntensity);

            var yAxisTitle = "Intensity (g/sqft)";
            drawStandardWasteDashboardBarChart(undefined, fontSize, chartData, yAxisTitle);
        };

        var extractWorstWasteStreamChartData = function(chartDataArray, amountKey, maximumNumberOfStreamsToExtract) {
            var worst = [];
            var other = [];
            if (angular.isArray(chartDataArray)) {
                chartDataArray.sort(function(object1, object2) {
                    if (!object1.hasOwnProperty(amountKey)) {
                        object1[amountKey] = 0;
                    }

                    if (!object2.hasOwnProperty(amountKey)) {
                        object2[amountKey] = 0;
                    }

                    return parseFloat(object2[amountKey]) - parseFloat(object1[amountKey]);
                });

                for (var x = 0; x < chartDataArray.length; x++) {
                    if (angular.isDefined(maximumNumberOfStreamsToExtract)) {
                        if (x > (maximumNumberOfStreamsToExtract - 1)) {
                            var otherData = angular.copy(chartDataArray[x]);
                            otherData["name"] = otherWasteStreamName;
                            other.push(otherData);
                        } else {
                            worst.push(angular.copy(chartDataArray[x]));
                        }
                    } else {
                        worst.push(angular.copy(chartDataArray[x]));
                    }
                }
            }

            worst = worst.concat(other);
            return worst;
        };

        var getUniqueStreamChartHeaders = function(headerArray) {
            var a = headerArray.concat();
            for(var i = 0; i < a.length; ++i) {
                for(var j = i + 1 ; j < a.length; ++j) {
                    if(a[i] === a[j])
                        a.splice(j--, 1);
                }
            }

            return a;
        };

        var getStreamChartOptions = function(headerColumnLength, vAxisTitle, numberOfYears) {
            var x = undefined;
            var barColors = [];
            var groupWidth = undefined;

            $scope.colorGenerator.setNumberRange(0, headerColumnLength);

            for (x = 0; x < headerColumnLength; x++) {
                barColors.push("#" + $scope.colorGenerator.colourAt(x));
            }

            if (numberOfYears <= 3) {
                groupWidth = standardBarWidthPixels;
            }

            return {
                vAxis: {
                    title: vAxisTitle,
                    viewWindowMode: "explicit",
                    viewWindow:{ min: 0 }
                },
                hAxis: {title: "Year"},
                colors: barColors,
                animation:{
                    duration: 1000,
                    easing: "out",
                    startup: true
                },
                tooltip: {
                    trigger: "selection"
                },
                isStacked: true,
                legend: {
                    position: "none"
                },
                bar: {
                    groupWidth: groupWidth
                }
            };
        };

        var isPieChartThreeDimensional = false;
        var getStreamPieChartOptions = function(headerColumnLength, title) {
            var x = undefined;
            var sliceColors = [];

            $scope.colorGenerator.setNumberRange(0, headerColumnLength);

            for (x = 0; x < headerColumnLength; x++) {
                sliceColors.push("#" + $scope.colorGenerator.colourAt(x));
            }


            return {
                title: title,
                colors: sliceColors,
                animation:{
                    duration: 1000,
                    easing: "out",
                    startup: true
                },
                tooltip: {
                    trigger: "selection"
                },
                is3D: isPieChartThreeDimensional

            };
        };

        var getRawStreamChartDataObject = function(streamChartData, chartDataArrayKey, amountKey, maximumNumberOfStreamsToGet) {
            var x = undefined;
            var rawChartData = [];
            var header = [];

            for (x = 0; x < streamChartData.length; x++) {
                var year = streamChartData[x].year;
                var worstStreams = extractWorstWasteStreamChartData(streamChartData[x][chartDataArrayKey], amountKey, maximumNumberOfStreamsToGet);

                var worstStreamsHeaders = [];
                for (var i = 0; i < worstStreams.length; i++) {
                    var streamName = worstStreams[i].name;
                    worstStreamsHeaders.push(streamName);
                }

                header = getUniqueStreamChartHeaders(header.concat(worstStreamsHeaders));
                var chartObject = {
                    year: year,
                    worstStreams: worstStreams
                };

                rawChartData.push(chartObject);
            }

            var rawStreamChartDataObject = {
                header: ["year"],
                rawChartData: []
            };

            // header.sort();

            rawStreamChartDataObject.header = rawStreamChartDataObject.header.concat(header);
            rawStreamChartDataObject.rawChartData = rawStreamChartDataObject.rawChartData.concat(rawChartData);
            return rawStreamChartDataObject;
        };

        var getOtherAmountForStreamIntensity = function(otherStreamsArray, decimalPlaces) {
            var totalIntensityOfOther = 0;
            for (var x = 0; x < otherStreamsArray.length; x++) {
                var propertiesInvolvedArea = getStreamTotalPropertyAreas(otherStreamsArray[x].propertiesInvolved);
                if (propertiesInvolvedArea > 0) {
                    var wasteAmount = otherStreamsArray[x].total;
                    var intensity = new BigDecimal(String(wasteAmount)).divide(new BigDecimal(String(propertiesInvolvedArea)), decimalPlaces, BigDecimal.ROUND_HALF_DOWN);
                    totalIntensityOfOther = totalIntensityOfOther + Number(intensity.toString());
                }
            }

            return totalIntensityOfOther;
        };

        var getOtherAmountForStreamTotal = function(otherStreamsArray, ignore) {
            var totalAmountOfOthers = 0;
            for (var x = 0; x < otherStreamsArray.length; x++) {
                var otherStream = otherStreamsArray[x];
                totalAmountOfOthers = totalAmountOfOthers + otherStream.total;
            }

            return totalAmountOfOthers;
        };

        var generateStreamChartDataTable = function(header, rawChartData, amountKey, decimalPlaces, otherAmountProcessorCallback) {
            var chartDataTable = [];
            chartDataTable.push(angular.copy(header));

            if (header.length <= 1) {
                var headerIndex = 0;
                var emptyHeader = "";
                chartDataTable[headerIndex].push(emptyHeader);
            }

            rawChartData.sort(function(object1, object2) {
                return parseFloat(object1.year) - parseFloat(object2.year);
            });

            for (var z = 0; z < rawChartData.length; z++) {
                var row = [];
                row.push(rawChartData[z].year.toString());

                if (header.length > 1) {
                    var streams = rawChartData[z].worstStreams;
                    for (var n = 0; n < header.length; n++) {
                        var yearHeaderIndex = 0;

                        if (n > yearHeaderIndex) {
                            var headerName = header[n];
                            var streamAmount = undefined;

                            var j;
                            if (headerName === otherWasteStreamName) {
                                var otherStreams = [];
                                for (j = 0; j < streams.length; j++) {
                                    if (streams[j].name === otherWasteStreamName) {
                                        otherStreams.push(streams[j]);
                                    }
                                }

                                streamAmount = otherAmountProcessorCallback(otherStreams, decimalPlaces);

                            } else {
                                for (j = 0; j < streams.length; j++) {
                                    if (streams[j].name === headerName && streams[j].name !== otherWasteStreamName) {
                                        streamAmount = streams[j][amountKey];
                                        break;
                                    }
                                }
                            }

                            if (angular.isDefined(streamAmount)) {
                                var streamAmountDecimal = new BigDecimal(String(streamAmount));
                                var roundedStreamAmount = streamAmountDecimal.setScale(decimalPlaces, BigDecimal.ROUND_HALF_DOWN);
                                row.push(Number(roundedStreamAmount.toString()));

                            } else {
                                var zeroAmount = 0;
                                row.push(zeroAmount);
                            }
                        }
                    }

                } else {
                    row.push(0);
                }

                chartDataTable.push(row);
            }

            return chartDataTable;
        };

        var drawStreamTotalStackedChart = function() {
            var yAxisTitle = "Waste Amount (Tonnes)";
            var chartDataArrayKey = "wasteStreamTotals";
            var chartAmountKey = "total";
            var maximumNumberOfWorst = 5;
            var rawStreamChartDataObject = getRawStreamChartDataObject($scope.streamTotalsChartData, chartDataArrayKey, chartAmountKey, maximumNumberOfWorst);

            var header = rawStreamChartDataObject.header;
            var rawChartData = rawStreamChartDataObject.rawChartData;

            var decimalPlaces = 0;
            var chartDataTable = generateStreamChartDataTable(header, rawChartData, chartAmountKey, decimalPlaces, getOtherAmountForStreamTotal);

            var data = google.visualization.arrayToDataTable(chartDataTable);

            var options = getStreamChartOptions(header.length, yAxisTitle, rawChartData.length);

            chartView = new google.visualization.ColumnChart(document.getElementById(wasteChartAreaId));
            chartView.draw(data, options);
        };

        var drawStreamDiversionPercentChart = function() {
            var alertMessage = "Diversion % charts are not available for Streams...";
            var alertHTML = "<br><br><div class='alert alert-warning text-center'>" + alertMessage + "</div><br><br><br>";
            $("#" + wasteChartAreaId).html(alertHTML);
        };

        var drawStreamIntensityStackedChart = function() {
            var yAxisTitle = "Intensity (g/sqft)";
            var chartDataArrayKey = "wasteStreamIntensities";
            var chartAmountKey = "intensity";
            var maximumNumberOfWorst = 5;
            var rawStreamChartDataObject = getRawStreamChartDataObject($scope.streamIntensitiesChartData, chartDataArrayKey, chartAmountKey, maximumNumberOfWorst);
            var header = rawStreamChartDataObject.header;
            var rawChartData = rawStreamChartDataObject.rawChartData;

            var decimalPlaces = 2;
            var chartDataTable = generateStreamChartDataTable(header, rawChartData, chartAmountKey, decimalPlaces, getOtherAmountForStreamIntensity);

            var data = google.visualization.arrayToDataTable(chartDataTable);
            var options = getStreamChartOptions(header.length, yAxisTitle, rawChartData.length);

            chartView = new google.visualization.ColumnChart(document.getElementById(wasteChartAreaId));
            chartView.draw(data, options);
        };

        var otherWasteStreamName = "Other";
        var sortAndFormatStreamPieChartDataTable = function(pieChartData, maximumNumberOfWorstStreams, numberOfDecimalPlaces) {
            var pieChartDataClone = angular.copy(pieChartData);
            var valueIndex = 1;

            pieChartDataClone.sort(function(array1, array2) {
                return parseFloat(array2[valueIndex]) - parseFloat(array1[valueIndex]);
            });

            var worst = [];
            var others = [];

            var x;

            for (x = 0; x < pieChartDataClone.length; x++) {
                if (x > (maximumNumberOfWorstStreams - 1)) {
                    others.push(pieChartDataClone[x]);
                } else {
                    var streamValueDecimal = new BigDecimal(String(pieChartDataClone[x][valueIndex]));
                    var roundedStreamValueDecimal = streamValueDecimal.setScale(numberOfDecimalPlaces, BigDecimal.ROUND_HALF_DOWN);
                    pieChartDataClone[x][valueIndex] = Number(roundedStreamValueDecimal.toString());
                    worst.push(pieChartDataClone[x]);
                }
            }

            var totalOthers = 0;
            for (x = 0; x < others.length; x++) {
                var otherStream = others[x];
                totalOthers = totalOthers + otherStream[valueIndex];
            }

            var formattedPieChartData = [];
            formattedPieChartData = formattedPieChartData.concat(worst);
            if (totalOthers > 0) {
                var totalOthersBigDecimal = new BigDecimal(String(totalOthers));
                var roundedDecimal = totalOthersBigDecimal.setScale(numberOfDecimalPlaces, BigDecimal.ROUND_HALF_DOWN);
                formattedPieChartData.push([otherWasteStreamName, Number(roundedDecimal.toString())]);
            }

            formattedPieChartData.sort(function(array1, array2) {
                var nameIndex = 0;
                if (array1[nameIndex] < array2[nameIndex]) {
                    return -1;
                }

                if (array1[nameIndex] > array2[nameIndex]) {
                    return 1;
                }

                return 0;
            });

            return formattedPieChartData;
        };

        var createStreamTotalPieChartDataTable = function(chartDataTable, decimalPlaces) {
            var chartDataTableHeaderIndex = 0;
            var yearIndex = 0;
            var pieChartMaximumNumberOfWorst = 5;

            var streamNamesHeader = chartDataTable[chartDataTableHeaderIndex];
            chartDataTable.splice(chartDataTableHeaderIndex, 1);

            var pieChartData = [];
            var x;
            for (x = 0; x < streamNamesHeader.length; x++) {
                if (x !== yearIndex) {
                    var streamName = streamNamesHeader[x];
                    var streamTotalValue = 0;
                    var numberOfYears = chartDataTable.length;

                    for (var i = 0; i < chartDataTable.length; i++) {
                        var values = chartDataTable[i];
                        for (var y = 0; y < values.length; y++) {
                            if (y === x) {
                                streamTotalValue = streamTotalValue + values[y];
                                break;
                            }
                        }
                    }

                    if (numberOfYears !== 0) {
                        var streamTotalAverage =  new BigDecimal(String(streamTotalValue)).divide(new BigDecimal(String(numberOfYears)));
                        var streamData = [streamName, Number(streamTotalAverage.toString())];
                        pieChartData.push(streamData);
                    }
                }
            }

            var pieChartDataTable = [];
            pieChartDataTable.push(["Waste Streams", "Total"]);

            var sortedChartData = sortAndFormatStreamPieChartDataTable(pieChartData, pieChartMaximumNumberOfWorst, decimalPlaces);
            pieChartDataTable = pieChartDataTable.concat(sortedChartData);

            return pieChartDataTable;
        };

        var drawStreamTotalPieChart = function() {
            var chartDataArrayKey = "wasteStreamTotals";
            var chartAmountKey = "total";
            var maximumNumberOfWorst = undefined;
            var rawStreamChartDataObject = getRawStreamChartDataObject($scope.streamTotalsChartData, chartDataArrayKey, chartAmountKey, maximumNumberOfWorst);

            var header = rawStreamChartDataObject.header;
            var rawChartData = rawStreamChartDataObject.rawChartData;

            var decimalPlacesInitial = 2;
            var chartDataTable = generateStreamChartDataTable(header, rawChartData, chartAmountKey, decimalPlacesInitial, getOtherAmountForStreamTotal);

            var decimalPlacesFinal = 0;
            var pieChartDataTable = createStreamTotalPieChartDataTable(chartDataTable, decimalPlacesFinal);

            var options = getStreamPieChartOptions(pieChartDataTable.length, "Waste Stream Totals (in Tonnes)");
            var data = google.visualization.arrayToDataTable(pieChartDataTable);

            var chart = new google.visualization.PieChart(document.getElementById(wasteChartAreaId));
            chart.draw(data, options);
        };

        var getStreamTotalPropertyAreas = function(contributingPropertiesArray) {
            var totalSqft = 0;
            for (var x = 0; x < contributingPropertiesArray.length; x++) {
                var contributingProperty = contributingPropertiesArray[x];
                totalSqft = totalSqft + contributingProperty.sqft;
            }

            return totalSqft;
        };

        var generateStreamIntensityPieChartDataTable = function(header, rawChartData) {
            var pieChartMaximumNumberOfWorst = 5;
            var pieChartData = [];
            var decimalPlaces = 2;

            var reversedRawChartData = rawChartData.reverse();
            for (var x = 0; x < header.length; x++) {
                var yearHeaderIndex = 0;
                if (header.length > 1 && x !== yearHeaderIndex) {
                    var headerName = header[x];
                    var streamAmount = 0;
                    var sqft = 0;

                    for (var y = 0; y < reversedRawChartData.length; y++) {
                        var streams = reversedRawChartData[y].worstStreams;
                        for (var j = 0; j < streams.length; j++) {
                            if (streams[j].name === headerName) {
                                streamAmount = streamAmount + streams[j]["total"];
                                sqft = sqft + getStreamTotalPropertyAreas(streams[j]["propertiesInvolved"]);
                            }
                        }

                    }

                    var numberOfYears = reversedRawChartData.length;
                    var averageStreamAmount = new BigDecimal(String(streamAmount)).multiply(new BigDecimal(String(TONNE_TO_GRAMS))).divide(new BigDecimal(String(numberOfYears)), 2, BigDecimal.ROUND_HALF_DOWN);
                    var streamAverageIntensity = averageStreamAmount.divide(new BigDecimal(String(sqft)), decimalPlaces, BigDecimal.ROUND_HALF_DOWN);

                    var row = [headerName, Number(streamAverageIntensity.toString())];
                    pieChartData.push(row);
                }
            }

            var pieChartDataTable = [];
            pieChartDataTable.push(["Waste Streams", "Intensity"]);

            var sortedChartData = sortAndFormatStreamPieChartDataTable(pieChartData, pieChartMaximumNumberOfWorst, decimalPlaces);
            pieChartDataTable = pieChartDataTable.concat(sortedChartData);

            return pieChartDataTable;
        };

        var drawStreamIntensityPieChart = function() {
            var chartDataArrayKey = "wasteStreamTotals";
            var chartAmountKey = "total";
            var maximumNumberOfWorst = undefined;
            var rawStreamChartDataObject = getRawStreamChartDataObject($scope.streamTotalsChartData, chartDataArrayKey, chartAmountKey, maximumNumberOfWorst);

            var header = rawStreamChartDataObject.header;
            var rawChartData = rawStreamChartDataObject.rawChartData;
            var pieChartDataTable = generateStreamIntensityPieChartDataTable(header, rawChartData);

            var options = getStreamPieChartOptions(pieChartDataTable.length, "Waste Stream Intensity (g/sqft)");
            var data = google.visualization.arrayToDataTable(pieChartDataTable);

            var chart = new google.visualization.PieChart(document.getElementById(wasteChartAreaId));
            chart.draw(data, options);
        };

        var getWorstGeneratorsChartOptions = function (yAxisTitle, tableRowsLength) {
            var xAxisFontSize = 9;
            var groupWidth = undefined;

            if (tableRowsLength > 7) {
                xAxisFontSize = 8;
            }

            if (tableRowsLength <= 3) {
                groupWidth = standardBarWidthPixels;
            }

            return {
                axes: {
                    y: {
                        all: {
                            format: {
                                pattern: "decimal"
                            }
                        }
                    }
                },
                hAxis: {
                    textStyle: {
                        fontSize: xAxisFontSize
                    },
                    slantedText: true,
                    slantedTextAngle: 30
                },
                vAxis: {
                    title: yAxisTitle
                },
                legend: {
                    position: "none"
                },
                tooltip: {
                    trigger: "selection"
                },
                bar: {
                    groupWidth: groupWidth
                }
            };
        };

        $scope.invokeTogglePropertyRestriction = function(propertyNumber) {
            ControllerInfoPasser.broadcast("event:togglePropertyRestriction", propertyNumber);
        };

        var excludeSelectedPropertyData = function(chartView, dataTable, indexOfPropertyNumberColumn) {
            var selectedBar = chartView.getSelection()[0];
            if (angular.isDefined(selectedBar)) {
                var selectedProperty = dataTable.getValue(selectedBar.row, indexOfPropertyNumberColumn);
                $scope.startupRefresh = false;
                $scope.invokeTogglePropertyRestriction(selectedProperty);
            }
        };

        var drawWorstAmountGeneratorsChart = function() {
            var tableRows = [];
            var yAxisTitle = "Waste Amount (Tonnes)";
            var typeColorsMap = ControllerInfoPasser.get("dashboardTypeColors");

            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn("string", "Property Name");
            dataTable.addColumn("number", "Waste Amount");
            dataTable.addColumn({type: "string", role: "tooltip"});
            dataTable.addColumn({type: "string", role: "style"});

            dataTable.addColumn("string", "Property Number");
            var indexOfPropertyNumberColumn = 4;

            for (var x = 0; x < $scope.worstAmountGenerators.length; x++) {
                var generator = $scope.worstAmountGenerators[x];

                var toolTip = generator.propertyName + "\n" +
                    generator.propertyNumber + "\n\n" +
                    generator.averageWasteAmount + " Tonnes";

                var barStyle = "color: " + typeColorsMap[generator.type];
                var property = generator.propertyNumber;

                tableRows.push([generator.propertyName.substring(0, 24) + "", generator.averageWasteAmount, toolTip, barStyle, property]);
            }

            dataTable.addRows(tableRows);

            var dataView = new google.visualization.DataView(dataTable);
            dataView.hideColumns([indexOfPropertyNumberColumn]);

            var options = getWorstGeneratorsChartOptions(yAxisTitle, dataTable.getNumberOfRows());

            chartView = new google.visualization.ColumnChart(document.getElementById(wasteChartAreaId));
            chartView.setAction({
                id: "excludeBar",
                text: "Exclude",
                action: function() {
                    excludeSelectedPropertyData(chartView, dataTable, indexOfPropertyNumberColumn);
                }
            });

            chartView.draw(dataView, options);
        };

        var drawWorstDiversionGeneratorsChart = function() {
            var tableRows = [];
            var yAxisTitle = "Diversion %";
            var typeColorsMap = ControllerInfoPasser.get("dashboardTypeColors");

            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn("string", "Property Name");
            dataTable.addColumn("number", "Diversion %");
            dataTable.addColumn({type: "string", role: "tooltip"});
            dataTable.addColumn({type: "string", role: "style"});

            dataTable.addColumn("string", "Property Number");
            var indexOfPropertyNumberColumn = 4;

            for (var x = 0; x < $scope.worstDiversionGenerators.length; x++) {
                var generator = $scope.worstDiversionGenerators[x];

                var toolTip = generator.propertyName + "\n" +
                    generator.propertyNumber + "\n\n" +
                    generator.diversionPercentage + " %";

                var barStyle = "color: " + typeColorsMap[generator.type];
                var property = generator.propertyNumber;

                tableRows.push([generator.propertyName.substring(0, 24) + "", generator.diversionPercentage, toolTip, barStyle, property]);
            }

            dataTable.addRows(tableRows);

            var dataView = new google.visualization.DataView(dataTable);
            dataView.hideColumns([indexOfPropertyNumberColumn]);

            var options = getWorstGeneratorsChartOptions(yAxisTitle, dataTable.getNumberOfRows());

            chartView = new google.visualization.ColumnChart(document.getElementById(wasteChartAreaId));
            chartView.setAction({
                id: "excludeBar",
                text: "Exclude",
                action: function() {
                    excludeSelectedPropertyData(chartView, dataTable, indexOfPropertyNumberColumn);
                }
            });

            chartView.draw(dataView, options);
        };

        var drawWorstIntensityGeneratorsChart = function() {
            var tableRows = [];
            var yAxisTitle = "Intensity (g/sqft)";
            var typeColorsMap = ControllerInfoPasser.get("dashboardTypeColors");

            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn("string", "Property Name");
            dataTable.addColumn("number", "Intensity (g/sqft)");
            dataTable.addColumn({type: "string", role: "tooltip"});
            dataTable.addColumn({type: "string", role: "style"});

            dataTable.addColumn("string", "Property Number");
            var indexOfPropertyNumberColumn = 4;

            for (var x = 0; x < $scope.worstIntensityGenerators.length; x++) {
                var generator = $scope.worstIntensityGenerators[x];

                var toolTip = generator.propertyName + "\n" +
                    generator.propertyNumber + "\n\n" +
                    generator.relativeIntensity + " g/sqft";

                var barStyle = "color: " + typeColorsMap[generator.type];
                var property = generator.propertyNumber;

                tableRows.push([generator.propertyName.substring(0, 24) + "", generator.relativeIntensity, toolTip, barStyle, property]);
            }

            dataTable.addRows(tableRows);

            var dataView = new google.visualization.DataView(dataTable);
            dataView.hideColumns([indexOfPropertyNumberColumn]);

            var options = getWorstGeneratorsChartOptions(yAxisTitle, dataTable.getNumberOfRows());

            chartView = new google.visualization.ColumnChart(document.getElementById(wasteChartAreaId));
            chartView.setAction({
                id: "excludeBar",
                text: "Exclude",
                action: function() {
                    excludeSelectedPropertyData(chartView, dataTable, indexOfPropertyNumberColumn);
                }
            });

            chartView.draw(dataView, options);
        };

        var triggerLikeForLikeMode = function() {
            $scope.likeForLike = true;
            initializeLikeForLikeValues();
        };

        var drawStreamTotalChart = function() {
            switch($scope.chartFormat) {
                case $scope.chartFormatEnum.STACKED_BAR:
                    drawStreamTotalStackedChart();
                    break;
                case $scope.chartFormatEnum.PIE:
                    isPieChartThreeDimensional = false;
                    drawStreamTotalPieChart();
                    break;
                case $scope.chartFormatEnum.THREE_DIMENSIONAL_PIE:
                    isPieChartThreeDimensional = true;
                    drawStreamTotalPieChart();
                    break;
                default:
                    break;
            }
        };

        var drawWasteTotalCharts = function() {
            switch ($scope.chartType) {
                case $scope.chartTypeEnum.PROPERTY_TYPE:
                    drawWasteTotalPropertyTypeChart();
                    break;

                case $scope.chartTypeEnum.REGION:
                    drawWasteTotalRegionChart();
                    break;

                case $scope.chartTypeEnum.PORTFOLIO:
                    drawWasteTotalPortfolioChart();
                    break;

                case $scope.chartTypeEnum.WASTE_STREAM:
                    triggerLikeForLikeMode();
                    drawStreamTotalChart();
                    break;

                case $scope.chartTypeEnum.WORST_WASTE_GENERATORS:
                    triggerLikeForLikeMode();
                    drawWorstAmountGeneratorsChart();
                    break;

                default:
                    break;
            }
        };

        var drawDiversionPercentCharts = function() {
            switch ($scope.chartType) {
                case $scope.chartTypeEnum.PROPERTY_TYPE:
                    drawDiversionPercentPropertyTypeChart();
                    break;

                case $scope.chartTypeEnum.REGION:
                    drawDiversionPercentRegionChart();
                    break;

                case $scope.chartTypeEnum.PORTFOLIO:
                    drawDiversionPercentPortfolioChart();
                    break;

                case $scope.chartTypeEnum.WASTE_STREAM:
                    triggerLikeForLikeMode();
                    drawStreamDiversionPercentChart();
                    break;

                case $scope.chartTypeEnum.WORST_WASTE_GENERATORS:
                    triggerLikeForLikeMode();
                    drawWorstDiversionGeneratorsChart();
                    break;

                default:
                    break;
            }
        };

        var drawStreamIntensityChart = function() {
            switch($scope.chartFormat) {
                case $scope.chartFormatEnum.STACKED_BAR:
                    drawStreamIntensityStackedChart();
                    break;

                case $scope.chartFormatEnum.PIE:
                    isPieChartThreeDimensional = false;
                    drawStreamIntensityPieChart();
                    break;

                case $scope.chartFormatEnum.THREE_DIMENSIONAL_PIE:
                    isPieChartThreeDimensional = true;
                    drawStreamIntensityPieChart();
                    break;

                default:
                    break;
            }
        };

        var drawWasteIntensityCharts = function() {
            switch ($scope.chartType) {
                case $scope.chartTypeEnum.PROPERTY_TYPE:
                    drawIntensityPropertyTypeChart();
                    break;

                case $scope.chartTypeEnum.REGION:
                    drawIntensityRegionChart();
                    break;

                case $scope.chartTypeEnum.PORTFOLIO:
                    drawIntensityPortfolioChart();
                    break;

                case $scope.chartTypeEnum.WASTE_STREAM:
                    triggerLikeForLikeMode();
                    drawStreamIntensityChart();
                    break;

                case $scope.chartTypeEnum.WORST_WASTE_GENERATORS:
                    triggerLikeForLikeMode();
                    drawWorstIntensityGeneratorsChart();
                    break;

                default:
                    break;
            }
        };

        $scope.drawWasteDataChart = function () {
            switch ($scope.chartCategory) {
                case $scope.wasteChartCategoryEnums.TOTAL:
                    drawWasteTotalCharts();
                    break;

                case $scope.wasteChartCategoryEnums.DIVERTED:
                    drawDiversionPercentCharts();
                    break;

                case $scope.wasteChartCategoryEnums.INTENSITY:
                    drawWasteIntensityCharts();
                    break;

                default:
                    break;
            }
        };

        $scope.refreshData = function () {
            $scope.getDashboardData(ControllerInfoPasser.get("dashboardPropertyNumbers"));
        };

        $scope.isWasteYearDataVisible = function () {
            return $scope.wasteYearData.length > 0;
        };

        $scope.isAtMonthLevel = function () {
            return angular.isDefined($scope.selectedPropertyDrill);
        };

        $scope.showDescription = function (value) {
            if (angular.isDefined(value)) {
                var index = $scope.dropboxes["shortMonths"].itemMap.map(function (entry) {
                    return parseInt(entry.value);
                }).indexOf(value);
                return $scope.dropboxes["shortMonths"].itemMap[index].key;
            }
        };

        $scope.selectWasteRow = function (wasteData, selectedYear) {

            $scope.selectedYear = selectedYear;
            $scope.wasteYearData.length = 0;

            var fromMonthIndex = $scope.dropboxes["shortMonths"].itemMap.map(function (entry) {
                return parseInt(entry.value);

            }).indexOf($scope.fromMonth);

            var toMonthIndex = $scope.dropboxes["shortMonths"].itemMap.map(function (entry) {
                return parseInt(entry.value);

            }).indexOf($scope.toMonth);

            if (fromMonthIndex === toMonthIndex) {
                $scope.selectedMonthsLabel = "Month:";
                $scope.selectedMonthsValue = $scope.dropboxes["shortMonths"].itemMap[fromMonthIndex].key;
            } else {
                $scope.selectedMonthsLabel = "Months:";
                $scope.selectedMonthsValue = $scope.dropboxes["shortMonths"].itemMap[fromMonthIndex].key +
                    " to " + $scope.dropboxes["shortMonths"].itemMap[toMonthIndex].key;
            }

            if (angular.isUndefined($scope.wasteHauler) || $scope.wasteHauler === null) {
                $scope.selectedWasteHauler = "All";
            } else {
                $scope.selectedWasteHauler = $scope.wasteHauler;
            }

            if (angular.isUndefined($scope.wasteStreamFilter) || $scope.wasteStreamFilter === null) {
                $scope.selectedWasteStream = "All";
            } else {
                $scope.selectedWasteStream = $scope.wasteStreamFilter.name;
            }

            $scope.propertyWasteData = angular.copy(wasteData);

            angular.forEach(angular.copy(wasteData), function (item, ignore) {

                var index = $scope.wasteYearData.map(function (entry) {
                    return entry.propertyNumber;
                }).indexOf(item.propertyNumber);

                if (index > -1) {
                    $scope.wasteYearData[index].total = item.total + $scope.wasteYearData[index].total;
                    $scope.wasteYearData[index].intensity = $scope.calculateWasteIntensity($scope.wasteYearData[index].total, $scope.wasteYearData[index].propertySqft);
                    $scope.wasteYearData[index].propertyNumberHidden = item.propertyNumber;
                } else {
                    item.propertyNumberHidden = item.propertyNumber;
                    $scope.wasteYearData.push(item);
                }
            });

            $scope.resetPaginationProperty();

        };

        $scope.calculateDiversionRateWaste = function (diverted, totalWaste) {
            var ONE_HUNDRED = new BigDecimal("100");
            var defaultReturnNumber = Number("0");
            if (totalWaste !== null && !new BigDecimal(String(totalWaste)).isZero()) {
                var diversionRate = new BigDecimal(String(diverted)).multiply(ONE_HUNDRED).divide(new BigDecimal(String(totalWaste)), 2, BigDecimal.ROUND_HALF_DOWN);
                if (diversionRate.isZero()) {
                    return defaultReturnNumber;
                } else {
                    return Number(diversionRate.toString());
                }
            } else {
                return defaultReturnNumber;
            }
        };

        $scope.calculateWasteIntensity = function (wasteTotal, sqft) {
            var defaultReturnNumber = Number("0");
            if (sqft !== null && !new BigDecimal(String(sqft)).isZero()) {
                var AvgWasteTotal = new BigDecimal(String(wasteTotal)).multiply(TONNE_TO_GRAMS).divide(new BigDecimal(String(sqft)), 2, BigDecimal.ROUND_HALF_DOWN);
                if (AvgWasteTotal.isZero()) {
                    return defaultReturnNumber;
                } else {
                    return Number(AvgWasteTotal.toString());
                }
            } else {
                return defaultReturnNumber;
            }
        };

        $scope.selectRowPropertyLevel = function (property) {

            $scope.selectedPropertyDrill = property;

            $scope.selectedPropertyWasteData = $scope.propertyWasteData.filter(function (item) {
                return item.propertyNumber === property.propertyNumber;
            });

            $scope.resetPaginationMonth();
        };

        $scope.resetPaginationProperty = function () {
            $scope.currentPageProperty = 0;
        };

        $scope.resetPaginationMonth = function () {
            $scope.currentPageMonth = 0;
        };

        $scope.back = function () {
            if ($scope.isAtMonthLevel()) {
                $scope.selectedPropertyDrill = undefined;
            } else {
                $scope.wasteYearData.length = 0;
            }
        };

        $scope.$on("event:distributionFilterChange", function () {
            if (!$scope.startupRefresh) {
                $scope.refreshData();
                $scope.startupRefresh = true;
            }
        });

        if (angular.isDefined(ControllerInfoPasser.get("dashboardPropertyNumbers"))) {
            $scope.refreshData();
        }

        $scope.loadDropboxes(["wasteChartType"]);
        $scope.resetTableDataOrder();

    }])
    .controller('GenericQuestionnaireDashCtrl', ['$scope', 'QuestionnaireService', 'ControllerInfoPasser', 'QuestionnaireReportConfigService', 'contextPath', 'SelectedProperty', 'PropertyLookup', '$q', '$filter', function ($scope, QuestionnaireService, ControllerInfoPasser, QuestionnaireReportConfigService, contextPath, SelectedProperty, PropertyLookup, $q, $filter) {
        $scope.questionnaireOrder = ['group.module'];
        $scope.completenessData = [];
        $scope.completenessLoading = [];
        $scope.scoreData = [];
        $scope.scoreLoading = [];
        $scope.numOfProperties = 0;
        $scope.qDashboardLevel = 0;
        $scope.questionnaires = [];

        $scope.modalSort = ['propertyNumber'];

        $scope.notStarted = "Not Started";
        $scope.inProgress = "In Progress";
        $scope.completed = "Completed";

        $scope.QUESTION_ANSWER = 'questions';
        $scope.OPTION_ANSWER = 'options';
        $scope.OPTION_ANSWER_MATRIX = 'matrix';

        $scope.reportToRun = $scope.QUESTION_ANSWER;
        $scope.optionReports = [];

        $scope.chartByEnum = {
            PROPERTY_COUNT: 'PROPERTY_COUNT',
            PERCENTAGE: 'PERCENTAGE'
        };

        $scope.chartTypeEnum = {
            CERTIFICATION: 'CERTIFICATION',
            POTENTIAL: 'POTENTIAL'
        };

        $scope.chartBy = $scope.chartByEnum.PROPERTY_COUNT;
        $scope.chartType = {};

        $scope.isCertificationRange = {
            YES: true,
            NO: false
        };

        
        $scope.categoryDashboardFilter = null;
        $scope.weightingFilter = null;


        $scope.propertiesForWeightings = [];

        $scope.detailedQuestionData = [];
        $scope.detailedOptionData = [];
        $scope.countOrPercent = '#';


        var excludedOptionsFromAnalytics = ['heading', 'instructions', 'attachment'];
        var optionsToAnalyzeInModal = ['comments', 'text'];
        var numericOptions = ['dollar', 'numeric', 'percent'];
        var yearByYearOptions = ['certification', 'checkList', 'date', 'dropbox', 'checkbox', 'quarterlyDate'];

        var excelCertificationPropertiesUrl = '';

        $scope.getQuestionnairesForProperties = function (propertyNumbers) {
            if (angular.isDefined(propertyNumbers)) {
                $scope.loadingQuestionnaires = true;
                $scope.numOfProperties = propertyNumbers.length;
                QuestionnaireService.findQuestionnairesForProperties({}, propertyNumbers, function (data) {
                    $scope.questionnaires.length = 0;
                    var qData = angular.copy(data);

                    for (var x = 0; x < qData.length; x++) {
                        if (qData[x].group.questionnaireType !== $scope.questionnaireTypeEnum.CHECKLIST_SURVEY) {
                            $scope.questionnaires.push(qData[x]);
                        }
                    }

                    if (angular.isDefined($scope.toRefresh)) {
                        var isSelectedApplicable = $scope.searchArrayForProperty($scope.questionnaires, 'id', $scope.toRefresh.id).length > 0;
                        if (isSelectedApplicable) {
                            if ($scope.qDashboardLevel === 1) {
                                $scope.openQuestionnaire();
                            } else {
                                $scope.openQuestionnaireAnalytics();
                            }
                        } else {
                            $scope.backToListView();
                        }
                    }

                    $scope.loadingQuestionnaires = false;
                }, function () {
                    $scope.loadingQuestionnaires = false;
                });
            }
        };

        $scope.getCompletenessForQuestionnaire = function (questionnaire) {
            var propertyNumbers = ControllerInfoPasser.get("dashboardPropertyNumbers");

            $scope.completenessLoading[questionnaire.id] = true;

            QuestionnaireService.getDashboardCompletenessData({questionnaireId: questionnaire.id}, propertyNumbers, function (data) {
                $scope.completenessData[questionnaire.id] = angular.copy(data);

                $scope.completenessLoading[questionnaire.id] = false;
            }, function () {
                $scope.completenessLoading[questionnaire.id] = false;
            });
        };

        $scope.getScoreDataForQuestionnaire = function (questionnaire) {
            var propertyNumbers = ControllerInfoPasser.get("dashboardPropertyNumbers");

            $scope.scoreLoading[questionnaire.id] = true;

            QuestionnaireService.getDashboardScoreData({questionnaireId: questionnaire.id}, propertyNumbers, function (data) {
                $scope.scoreData[questionnaire.id] = data;
                $scope.scoreLoading[questionnaire.id] = false;
            }, function (ignore) {
                $scope.scoreLoading[questionnaire.id] = false;
            });
        };

        $scope.setModalVars = function (state, arr) {
            $scope.completenessState = state;
            $scope.completedStateArr = arr;
            $scope.isCompleteness = true;
        };

        $scope.refreshQuestionnaireCompletenessForProperties = function () {
            var questionnaire = $scope.toRefresh;
            var propertyNumbers = ControllerInfoPasser.get("dashboardPropertyNumbers");
            $scope.completenessLoading[questionnaire.id] = true;
            QuestionnaireService.refreshCompletenessForProperties({questionnaireId: questionnaire.id}, propertyNumbers, function () {
                $scope.completenessLoading[questionnaire.id] = false;
                $scope.getCompletenessForQuestionnaire(questionnaire);
                $scope.getScoreDataForQuestionnaire(questionnaire);
            }, function () {
                $scope.completenessLoading[questionnaire.id] = false;
            });
        };

        $scope.setToRefresh = function (questionnaire) {
            $scope.toRefresh = questionnaire;
            $scope.qIdToDisplay = questionnaire.id;
        };

        var getQuestionnaireOptionReports = function (questionnaire) {
            QuestionnaireReportConfigService.findByQuestionnaireId({
                questionnaireId: questionnaire.id,
                reportType: 'OPTION'
            }, function (data) {
                $scope.optionReports = data;
                $scope.selectedReportConfig = data[0];
            });
        };

        $scope.backToListView = function () {
            $scope.toRefresh = undefined;
            $scope.qIdToDisplay = undefined;
            $scope.qDashboardLevel = 0;
        };

        $scope.runQuestionnaireReport = function (reportToRun, selectedReportConfig) {
            var propertyNumbers = ControllerInfoPasser.get("dashboardPropertyNumbers");
            if (reportToRun === $scope.OPTION_ANSWER_MATRIX && angular.isDefined(selectedReportConfig)) {
                $scope.getQuestionnaireReport(reportToRun, $scope.qIdToDisplay, propertyNumbers, selectedReportConfig.id);
            } else {
                $scope.getQuestionnaireReport(reportToRun, $scope.qIdToDisplay, propertyNumbers);
            }
        };

        $scope.exportExcel = function (questionnaireId, isWithCertificationRange, rangeScoreType) {

            var propertyNumbers = ControllerInfoPasser.get("dashboardPropertyNumbers");

            var data = {
                propertyNumbers: propertyNumbers
            };

            var url = contextPath + '/webapi/properties/questionnaire/' + questionnaireId + '/' + isWithCertificationRange + '/' + rangeScoreType + '/weighting/excel';
            $scope.openInNewWindow('POST', url, data);
        };

        $scope.exportExcelQuestionnaireCompleteness = function ($completenessState) {
            var questionnaire = $scope.toRefresh;
            var propertyNumbers = ControllerInfoPasser.get("dashboardPropertyNumbers");

            var data = {
                completenessState: $completenessState,
                propertyNumbers: propertyNumbers
            };
            $scope.openInNewWindow("POST", contextPath + '/webapi/questionnairecompleteness/dashboarddata/excel/' + questionnaire.id, data);
        };


        $scope.getPropertiesForWeighting = function (questionnaireId, isWithCertificationRange, rangeScoreType) {
            var propertyNumbers = ControllerInfoPasser.get("dashboardPropertyNumbers");
            $scope.propertiesForWeightings.length = 0;
            $('.modal-label').html(rangeScoreType.replace('_', ' '));
            $('#propertiesForWeightingModal').modal('show');
            $scope.loading = true;
            QuestionnaireService.findPropertiesForWeightingOnQuestionnaire({
                questionnaireId: questionnaireId,
                isWithCertificationRange: isWithCertificationRange,
                rangeScoreType: rangeScoreType
            }, propertyNumbers, function (data) {
                $scope.propertiesForWeightings = angular.copy(data);
                $scope.loading = false;
            }, function () {
                $scope.loading = false;
                $scope.displayMessageInElement('.modalError', 'An error has occurred retrieving the properties!', 10000);
            });
        };

        $scope.showCertificationTable = function (elementId) {
            $(document.getElementById(elementId)).show();
            $(document.getElementById(elementId + 'chartCertified')).hide();
            $(document.getElementById(elementId + 'radio')).hide();
        };

        $scope.drawChart = function (rangeScoreType, index, chartBy, chartType) {
            $(document.getElementById(rangeScoreType + index + 'chartCertified')).hide();
            if (chartBy === $scope.chartByEnum.PROPERTY_COUNT) {
                $('.typeChart' + rangeScoreType + index + 'count').prop('checked', true);
            } else {
                $('.typeChart' + rangeScoreType + index + 'percentage').prop('checked', true);
            }
            $(document.getElementById(rangeScoreType + index)).hide();

            if (angular.isDefined(chartType)) {
                $scope.chartType = chartType;
            } else {
                chartType = $scope.chartType;
            }
            drawChart(rangeScoreType, index, "Certified", chartBy, chartType);
        };

        var drawChart = function (rangeScoreType, index, title, chartBy, chartType) {
            if (chartType === $scope.chartTypeEnum.CERTIFICATION) {
                drawCertificationChart(rangeScoreType, index, title, chartBy);
            } else {
                drawPotentialChart(rangeScoreType, index, chartBy);
            }
        };

        var drawPotentialChart = function (rangeScoreType, index, chartBy) {
            var elementId = rangeScoreType + index;
            var potentialCertificationChartData = $scope.scoreData[$scope.qIdToDisplay].potentialCertificationsChartData;

            if (angular.isDefined(potentialCertificationChartData)) {
                var chartData = [];
                for (var x = 0; x < potentialCertificationChartData.length; x++) {
                    if (potentialCertificationChartData[x].scoreType === rangeScoreType) {
                        switch(chartBy) {
                            case $scope.chartByEnum.PROPERTY_COUNT:
                                chartData = potentialCertificationChartData[x].propertyCountChartData;
                                break;

                            case $scope.chartByEnum.PERCENTAGE:
                                chartData = potentialCertificationChartData[x].glaPercentageChartData;
                                break;

                            default:
                                break;
                        }

                        break;
                    }
                }


                switch(chartBy) {
                    case $scope.chartByEnum.PROPERTY_COUNT:
                        drawPropertyCountPotentialChart(chartData, elementId);
                        break;

                    case $scope.chartByEnum.PERCENTAGE:
                        drawGLAPercentagePotentialChart(chartData, elementId);
                        break;

                    default:
                        break;
                }

            }
        };

        var getPotentialCertificationsChartOptions = function(numberOfColumns) {
            $scope.colorGenerator.setNumberRange(0, numberOfColumns);
            var colors = [];

            for (var i = 0; i < numberOfColumns; i++) {
                colors.push("#" + $scope.colorGenerator.colourAt(i));
            }

            return {
                vAxis: {
                    viewWindowMode: "explicit",
                    viewWindow:{ min: 0 }
                },
                animation:{
                    duration: 1000,
                    easing: "out",
                    startup: true
                },
                tooltip: {
                    trigger: "selection"
                },
                colors: colors,
                isStacked: true,
                chartArea: {
                    left: 30,
                    top: 10,
                    height: 170
                }
            };
        };

        var getCertificationChartsOption = function(numberOfRows, title) {
            $scope.colorGenerator.setNumberRange(0, numberOfRows);
            var sliceColors = [];

            for (var i = 0; i < numberOfRows; i++) {
                sliceColors.push("#" + $scope.colorGenerator.colourAt(i));
            }

            return {
                title: title,
                colors: sliceColors,
                animation:{
                    duration: 1000,
                    easing: "out",
                    startup: true
                },
                pieSliceText: "value",
                tooltip: {
                    trigger: "selection"
                },
                is3D: false,
                chartArea: {
                    left: 30,
                    top: 10,
                    height: 170
                }

            };
        };

        var drawPropertyCountPotentialChart = function(chartData, elementId) {
            var dataTable = google.visualization.arrayToDataTable(chartData);

            var options = getPotentialCertificationsChartOptions(dataTable.getNumberOfColumns());

            $(document.getElementById(elementId + "chartCertified")).show();
            var chartView = new google.visualization.ColumnChart(document.getElementById(elementId + "chartCertified"));
            chartView.draw(dataTable, options);

            $(document.getElementById(elementId + "radio")).show();
        };

        var drawGLAPercentagePotentialChart = function(chartData, elementId) {
            var dataTable = google.visualization.arrayToDataTable(chartData);

            var percentageFormatter = new google.visualization.NumberFormat({
                suffix: "%"
            });

            for (var x = 0; x < dataTable.getNumberOfColumns(); x++) {
                percentageFormatter.format(dataTable, x);
            }

            var options = getPotentialCertificationsChartOptions(dataTable.getNumberOfColumns());

            $(document.getElementById(elementId + "chartCertified")).show();
            var chartView = new google.visualization.ColumnChart(document.getElementById(elementId + "chartCertified"));
            chartView.draw(dataTable, options);

            $(document.getElementById(elementId + "radio")).show();
        };

        var drawPropertyCountCertificationChart = function(chartData, elementId, title) {
            var dataTable = google.visualization.arrayToDataTable(chartData);
            var chartTitle = "Certification Property Count";

            var options = getCertificationChartsOption(dataTable.getNumberOfRows(), chartTitle);

            $(document.getElementById(elementId + 'chart' + title)).show();
            var chartView = new google.visualization.PieChart(document.getElementById(elementId + "chart" + title));
            chartView.draw(dataTable, options);

            $(document.getElementById(elementId + "radio")).show();
        };

        var drawGLAPercentageCertificationChart = function(chartData, elementId, title) {
            var dataTable = google.visualization.arrayToDataTable(chartData);
            var chartTitle = "Certification GLA Percentage";

            var percentageFormatter = new google.visualization.NumberFormat({
                suffix: "%"
            });

            var columnIndexOfValues = 1;
            percentageFormatter.format(dataTable, columnIndexOfValues);

            var options = getCertificationChartsOption(dataTable.getNumberOfRows(), chartTitle);

            $(document.getElementById(elementId + 'chart' + title)).show();
            var chartView = new google.visualization.PieChart(document.getElementById(elementId + "chart" + title));
            chartView.draw(dataTable, options);

            $(document.getElementById(elementId + "radio")).show();
        };

        var drawCertificationChart = function (rangeScoreType, index, title, chartBy) {
            var elementId = rangeScoreType + index;
            var certificationsChartData = $scope.scoreData[$scope.qIdToDisplay].certificationsChartData;

            if (angular.isDefined(certificationsChartData)) {
                var chartData = [];
                for (var x = 0; x < certificationsChartData.length; x++) {
                    if (certificationsChartData[x].scoreType === rangeScoreType) {
                        switch(chartBy) {
                            case $scope.chartByEnum.PROPERTY_COUNT:
                                chartData = certificationsChartData[x].propertyCountChartData;
                                break;

                            case $scope.chartByEnum.PERCENTAGE:
                                chartData = certificationsChartData[x].glaPercentageChartData;
                                break;

                            default:
                                break;
                        }

                        break;
                    }
                }


                switch(chartBy) {
                    case $scope.chartByEnum.PROPERTY_COUNT:
                        drawPropertyCountCertificationChart(chartData, elementId, title);
                        break;

                    case $scope.chartByEnum.PERCENTAGE:
                        drawGLAPercentageCertificationChart(chartData, elementId, title);
                        break;

                    default:
                        break;
                }

            }
        };

        $scope.isGreaterThanOne = function (count) {
            if (count > 0) {
                return 'pointer-underline';
            } else {
                return '';
            }
        };

        $scope.goToQuestionnaireModule = function (propertyNumber, module) {
            if (!$scope.isCompletenessPopup()) {
                $scope.forceClosePopupModal('completenessDetailsModal');
                PropertyLookup.get({propertyNumber: propertyNumber}, function (data) {
                    SelectedProperty.setSelectedProperty(data);
                    $scope.goToModule(module.toLowerCase());
                });
            }
        };

        $scope.goToQuestionnaireModuleClass = function () {
            if ($scope.isCompletenessPopup()) {
                return '';
            } else {
                return 'pointer';
            }
        };

        $scope.isCompletenessPopup = function () {
            return $scope.completenessState === $scope.notStarted || $scope.completenessState === $scope.inProgress || $scope.completenessState === $scope.completed;
        };

        $scope.getPropertiesForCertification = function (rangeScoreType, score, certified) {
            $scope.isCompleteness = false;
            if (score.count > 0) {
                var propertyNumbers = ControllerInfoPasser.get("dashboardPropertyNumbers");
                excelCertificationPropertiesUrl = contextPath + '/webapi/questionnairescores/certifications/' + $scope.qIdToDisplay + '/properties/' + rangeScoreType + '/' + score.certificationLevel + '/excel?isCertified=' + certified;

                $("#completenessDetailsModal").modal('show');
                QuestionnaireService.getPropertiesForCertification({
                    questionnaireId: $scope.qIdToDisplay,
                    scoreType: rangeScoreType,
                    certificationLevel: score.certificationLevel,
                    isCertified: certified
                }, propertyNumbers, function (data) {
                    $scope.completenessState = rangeScoreType.replace('_', ' ') + ' - ' + score.certificationLevel.replace('_', ' ');
                    $scope.completedStateArr = data;
                });
            }
        };

        $scope.exportExcelCertificationProperties = function () {
            var propertyNumbers = ControllerInfoPasser.get("dashboardPropertyNumbers");
            $scope.openInNewWindow('POST', excelCertificationPropertiesUrl, {propertyNumbers: propertyNumbers});
        };

        $scope.openQuestionnaire = function (q) {
            if (angular.isUndefined(q) && angular.isDefined($scope.toRefresh)) {
                q = $scope.toRefresh;
            }

            $scope.setToRefresh(q);
            $scope.qDashboardLevel = 1;

            getQuestionnaireOptionReports(q);
            $scope.getCompletenessForQuestionnaire(q);
            $scope.getScoreDataForQuestionnaire(q);
        };

        $scope.openQuestionnaireAnalytics = function (q) {
            if (angular.isUndefined(q) && angular.isDefined($scope.toRefresh)) {
                q = $scope.toRefresh;
            }

            $scope.setToRefresh(q);
            if ($scope.qDashboardLevel === 3) {
                $scope.getQuestionDetails();
            } else {
                if ($scope.qDashboardLevel !== 2) {
                    $scope.qDashboardLevel = 2;
                    $scope.getFullQuestionnaireAndWeightings(q);
                }
            }
        };

        $scope.getFullQuestionnaireAndWeightings = function (questionnaire) {
            $scope.fullQuestionnaireLoading = true;

            $q.all([
                QuestionnaireService.findById({questionnaireId: questionnaire.id}).$promise,
                QuestionnaireService.getWeightingsOnQuestionnaire({questionnaireId: questionnaire.id}).$promise
            ]).then(function (data) {
                $scope.fullQuestionnaireLoading = false;
                $scope.fullQuestionnaire = angular.copy(data[0]);
                $scope.questionnaireWeightings = angular.copy(data[1]);
                $scope.filterQuestionsByCategory();
            }, function () {
                $scope.fullQuestionnaireLoading = false;
                $scope.displayMessageInElement('.q-error', 'An error has occurred loading the question analytics!');
            });
        };

        $scope.checkCategoryFilter = function () {
            if ($scope.categoryFilter === null) {
                $scope.categoryFilter = '';
            }
        };


        $scope.filterQuestionsByCategory = function (category) {

            if (angular.isDefined($scope.filteredCategories)) {
                $scope.filteredCategories.length = 0;
            }

            if (angular.isDefined($scope.fullQuestionnaire)) {
                var filtered = $filter('questionnaireDashoardCategoryFilter')($scope.fullQuestionnaire.categories, category);
                $scope.filteredCategories = angular.copy(filtered);
            }
        };

        $scope.backToQuestionnaireView = function () {
            $scope.questionDetailed = undefined;
            $scope.optionDetailed = undefined;
            $scope.qDashboardLevel = 2;
        };

        $scope.openQuestionDetails = function (question) {
            $scope.questionDetailed = angular.copy(question);
            $scope.qDashboardLevel = 3;
            $scope.getQuestionDetails();
        };

        $scope.getQuestionDetails = function () {
            $scope.loadingQuestionnaires = true;

            $scope.detailedQuestionData.length = 0;
            var propertyNumbersOrClient;

            if ($scope.toRefresh.group.questionnaireType === $scope.questionnaireTypeEnum.PROPERTY) {
                propertyNumbersOrClient = ControllerInfoPasser.get("dashboardPropertyNumbers");
            } else {
                propertyNumbersOrClient = ControllerInfoPasser.get("dashboardPropertyClients");
            }

            QuestionnaireService.getQuestionAnalytics({
                questionnaireId: $scope.qIdToDisplay,
                questionId: $scope.questionDetailed.questionID
            }, propertyNumbersOrClient, function (data) {
                $scope.detailedQuestionData = angular.copy(data);
                $scope.loadingQuestionnaires = false;
            }, function () {
                $scope.loadingQuestionnaires = false;
            });
        };

        $scope.getYesDisplay = function (qData) {
            if ($scope.countOrPercent === '#') {
                return qData.numberOfYes;
            } else {
                return qData.yesAvg;
            }
        };

        $scope.getNoDisplay = function (qData) {
            if ($scope.countOrPercent === '#') {
                return qData.numberOfNo;
            } else {
                return qData.noAvg;
            }
        };

        $scope.getNADisplay = function (qData) {
            if ($scope.countOrPercent === '#') {
                return qData.numberOfNA;
            } else {
                return qData.naAvg;
            }
        };

        $scope.getTotalDisplay = function (qData) {
            if ($scope.countOrPercent === '#') {
                return qData.total;
            } else {
                if (qData.total === 0) {
                    return 0;
                } else {
                    return 100;
                }
            }
        };

        var getPropertyNumbersForAnswer = function (answer, questionData) {
            var qType = $scope.toRefresh.group.questionnaireType;
            if (angular.isDefined(answer)) {
                if (answer === $scope.validAnswersEnum.YES) {
                    if (qType === $scope.questionnaireTypeEnum.PROPERTY) {
                        return questionData.yesProperties;
                    } else {
                        return questionData.yesClients;
                    }
                } else {
                    if (answer === $scope.validAnswersEnum.NO) {
                        if (qType === $scope.questionnaireTypeEnum.PROPERTY) {
                            return questionData.noProperties;
                        } else {
                            return questionData.noClients;
                        }
                    } else {
                        if (qType === $scope.questionnaireTypeEnum.PROPERTY) {
                            return questionData.naProperties;
                        } else {
                            return questionData.naClients;
                        }
                    }
                }
            } else {
                if (qType === $scope.questionnaireTypeEnum.PROPERTY) {
                    return questionData.yesProperties.concat(questionData.noProperties).concat(questionData.naProperties);
                } else {
                    return questionData.yesClients.concat(questionData.noClients).concat(questionData.naClients);
                }

            }
        };

        $scope.getPropertiesForAnswer = function (answer, questionData) {
            $scope.questionModalData = questionData;
            $scope.propertiesForExcel = getPropertyNumbersForAnswer(answer, questionData);

            PropertyLookup.findByPropertyNumbersAsDTO({}, $scope.propertiesForExcel, function (data) {
                $scope.propertiesForAnswer = angular.copy(data);
            }, function () {
                $scope.displayMessageInElement('.modal-error', 'An error has occurred while trying to get the list of properties!', 10000)
            });
        };

        $scope.getQuestionAnswerForProperty = function (propertyNumber) {
            if ($scope.questionModalData.yesProperties.indexOf(propertyNumber) > -1) {
                return 'Yes';
            } else {
                if ($scope.questionModalData.noProperties.indexOf(propertyNumber) > -1) {
                    return 'No';
                } else {
                    return 'N/A';
                }
            }
        };

        $scope.questionAnswersToExcel = function () {
            var data = {
                propertyNumbers: $scope.propertiesForExcel
            };

            var url = contextPath + '/webapi/properties/questionnaire/analytics/' + $scope.toRefresh.id + '/' + $scope.questionDetailed.id + '/excel';
            $scope.openInNewWindow('POST', url, data);
        };

        $scope.isOptionClickable = function (option) {
            return excludedOptionsFromAnalytics.indexOf(option.type) === -1;
        };

        $scope.openOptionDetails = function (question, option) {
            if (!$scope.isOptionClickable(option)) {
                return;
            }

            $scope.questionDetailed = angular.copy(question);
            $scope.optionDetailed = angular.copy(option);

            if ($scope.analyzeInModal(option.type)) {
                $('#listOptionAnswersModal').modal('show');
            } else {
                $scope.qDashboardLevel = 4;
            }

            getOptionsDetails();
        };

        var getOptionsDetails = function () {
            var propertyNumbersOrClient;

            if ($scope.toRefresh.group.questionnaireType === $scope.questionnaireTypeEnum.PROPERTY) {
                propertyNumbersOrClient = ControllerInfoPasser.get("dashboardPropertyNumbers");
            } else {
                propertyNumbersOrClient = ControllerInfoPasser.get("dashboardPropertyClients");
            }

            $scope.loadingQuestionnaires = true;
            $scope.detailedOptionData.length = 0;

            QuestionnaireService.getOptionAnalytics({
                questionnaireId: $scope.qIdToDisplay,
                questionId: $scope.questionDetailed.questionID,
                optionId: $scope.optionDetailed.optionID
            }, propertyNumbersOrClient, function (data) {
                $scope.detailedOptionData = angular.copy(data);
                $scope.loadingQuestionnaires = false;
            }, function () {
                $scope.loadingQuestionnaires = false;
            });
        };

        $scope.analyzeYearByYear = function (optionType) {
            return yearByYearOptions.indexOf(optionType) > -1;
        };

        $scope.analyzeNumerically = function (optionType) {
            return numericOptions.indexOf(optionType) > -1;
        };

        $scope.analyzeInModal = function (optionType) {
            return optionsToAnalyzeInModal.indexOf(optionType) > -1;
        };

        $scope.getPropertiesForOption = function (optionAnswerData, questionnaireId) {
            var propertyNumbersOrClient;

            if ($scope.toRefresh.group.questionnaireType === $scope.questionnaireTypeEnum.PROPERTY) {
                propertyNumbersOrClient = optionAnswerData.propertyNumbers;
            } else {
                propertyNumbersOrClient = optionAnswerData.clients;
            }

            $scope.propertiesForExcel = propertyNumbersOrClient;
            $scope.questionnaireForExcel = questionnaireId;

            PropertyLookup.findByPropertyNumbersAsDTO({}, propertyNumbersOrClient, function (data) {
                $scope.propertiesForAnswer = angular.copy(data);
            }, function () {
                $scope.displayMessageInElement('.modal-error', 'An error has occurred while trying to get the list of properties!', 10000)
            });
        };

        $scope.optionAnswersToExcel = function (detailedOptionData) {
            var propertyNumbersOrClient;

            if ($scope.analyzeInModal($scope.optionDetailed.type)) {
                propertyNumbersOrClient = detailedOptionData.map(function (elm) {
                    return elm.propertyNumber;
                });
            } else {
                propertyNumbersOrClient = $scope.propertiesForExcel;
            }

            var data = {
                propertyNumbersOrClients: propertyNumbersOrClient
            };

            var url = contextPath + '/webapi/properties/questionnaire/analytics/' + $scope.questionnaireForExcel + '/' + $scope.questionDetailed.questionID + '/' + $scope.optionDetailed.optionID + '/excelextract';
            $scope.openInNewWindow('POST', url, data);
        };

        $scope.getYearByYearAnswerProperties = function (propertyNumbersOrClients, questionnaireId) {
            if (angular.isUndefined(propertyNumbersOrClients)) {
                return;
            }

            $('#questionAnswerModal').modal('show');
            $scope.propertiesForExcel = propertyNumbersOrClients;
            $scope.questionnaireForExcel = questionnaireId;

            PropertyLookup.findByPropertyNumbersAsDTO({}, propertyNumbersOrClients, function (data) {
                $scope.propertiesForAnswer = angular.copy(data);
            }, function () {
                $scope.displayMessageInElement('.modal-error', 'An error has occurred while trying to get the list of properties!', 10000)
            });
        };

        $scope.questionExcelExtract = function () {
            var propertyNumbersOrClient;

            if ($scope.toRefresh.group.questionnaireType === $scope.questionnaireTypeEnum.PROPERTY) {
                propertyNumbersOrClient = ControllerInfoPasser.get("dashboardPropertyNumbers");
            } else {
                propertyNumbersOrClient = ControllerInfoPasser.get("dashboardPropertyClients");
            }

            var data = {
                propertyNumbers: propertyNumbersOrClient
            };

            var url = contextPath + '/webapi/properties/questionnaire/analytics/' + $scope.toRefresh.id + '/' + $scope.questionDetailed.id + '/withoptions/excel';
            $scope.openInNewWindow('POST', url, data);
        };

        $scope.parseOptionAnswer = function (answer) {
            var isDate = new moment(answer, 'yyyy-MM-dd').isValid();
            if (isDate) {
                return $filter('date')(answer, 'yyyy-MM-dd', $scope.getTimezoneOffset());
            } else {
                return answer;
            }
        };


        $scope.$on($scope.EVENT_ON_LAST_REPEAT, function () {
            $scope.initializeTooltips();
        });

        $scope.$on('event:distributionFilterChange', function () {
            $scope.getQuestionnairesForProperties(ControllerInfoPasser.get("dashboardPropertyNumbers"));
        });

        $scope.getQuestionnairesForProperties(ControllerInfoPasser.get("dashboardPropertyNumbers"));
    }]);