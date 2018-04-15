/**
 * Created by Nicolo on 2014-07-04.
 */

angular.module('myApp.QuestionnaireAdminControllers', [])
    .controller('QuestionnaireAdminCtrl', ['$scope', 'QuestionnaireService', 'ControllerInfoPasser', '$filter', '$q', 'Upload', 'contextPath', 'DropboxService', '$uibModal', 'QuestionnaireReportConfigService', 'PropertyLookup', 'SelectedProperty', '$http', 'ChecklistProgramService', function ($scope, QuestionnaireService, ControllerInfoPasser, $filter, $q, Upload, contextPath, DropboxService, $modal, QuestionnaireReportConfigService, PropertyLookup, SelectedProperty, $http, ChecklistProgramService) {
        $scope.moduleFilters = ['SUSTAINABILITY', 'ENVIRONMENTAL', 'OHS', 'INSURANCE', 'CAPITAL_PLANNING', 'COMPLIANCE', 'TRAINING', 'APPLICATION'];
        $scope.activeModuleFilters = [];
        $scope.levelLabels = [
            'home',
            'certificationLevels',
            'certificationOptions',
            'reportConfigurations',
            'categories',
            'questions',
            'weightings',
            'questionDependencies',
            'options',
            'optionsMatrix',
            'certificationPrereqs',
            'questionPrereqs',
            'checklistPrograms',
            'checklistParticipants'
        ];

        $scope.homeLevel = 0;
        $scope.certificationLevel = 1;
        $scope.certificationOptions = 2;
        $scope.reportConfigurationLevel = 3;
        $scope.categoryLevel = 4;
        $scope.questionLevel = 5;
        $scope.questionWeightingLevel = 6;
        $scope.questionDependenciesLevel = 7;
        $scope.questionOptionsLevel = 8;
        $scope.questionOptionsMatrixLevel = 9;
        $scope.certificationPrereqsLevel = 10;
        $scope.questionPrereqsLevel = 11;
        $scope.checklistProgramsLevel = 12;
        $scope.checklistParticipantsLevel = 13;

        $scope.attributeEdit = false;
        $scope.checklistParticipantsPanelState = true;
        $scope.checklistProgramPanelState = true;

        $scope.categoryFilter = {};
        $scope.checklistProgramFilter = {};

        $scope.prerequisiteQuestions = [];

        $scope.selectedCertificationName = '';

        $scope.section = {
            label: $scope.levelLabels[$scope.homeLevel],
            level: $scope.homeLevel
        };

        $scope.questionnaires = [];
        $scope.active = [];
        $scope.activeChecklistPrograms = [];
        $scope.available = [];

        $scope.selectedWeightLabel = {};
        $scope.maximumScores = {};

        $scope.selectedReportConfig = {id: null};
        $scope.selectedAnswers = ["true", "false", "na", null];
        $scope.questionReports = [];

        $scope.properties = [];
        $scope.selectedProperties = [];

        $scope.copyAnswers = {
            value: false
        };

        $scope.excludedUnits = [];
        $scope.excludedTypes = [];
        $scope.excludedOwners = [];
        $scope.excludedProperties = [];

        var currentProperty = SelectedProperty.getSelectedProperty();

        $scope.isChecklist = function () {
            if (angular.isUndefined($scope.selectedQuestionnaire)) {
                return false;
            }

            return $scope.selectedQuestionnaire.group.questionnaireType === $scope.questionnaireTypeEnum.CHECKLIST_SURVEY;
        };

        $scope.loadAllProperties = function () {
            PropertyLookup.query({}, function (data) {
                $scope.properties = data;

                if (angular.isDefined(currentProperty)) {
                    $scope.selectedProperties.push($scope.searchArrayForProperty($scope.properties, "propertyNumber", currentProperty.propertyNumber)[0]);
                }

                $scope.setupPropertyExclusions($scope.selectedQuestionnaire.propertyExclusions);
            });
        };


        $scope.getLevel = function () {
            return $scope.section.level;
        };

        $scope.certificationPrereqQuestionsFilter = function(question) {
            var isFound = false;
            angular.forEach(question.prereqs, function (prereq) {
                if (prereq.scoreType === $scope.selectedCertificationName) {
                    isFound = true;
                }
            });

            return isFound;
        };

        $scope.dropFilter = function () {
            return $filter('filter')($scope.available, $scope.categoryFilter.text);
        };

        $scope.filterModuleColor = function (module) {
            var position = $scope.activeModuleFilters.indexOf(module);

            if (position < 0) {
                return 'i-button-disabled';
            } else {
                return 'i-button-' + $scope.getModuleColor(module);
            }
        };

        $scope.filterModule = function (module) {
            var position = $scope.activeModuleFilters.indexOf(module);

            if (position < 0) {
                // show in list view
                $scope.activeModuleFilters.push(module);
            } else {
                // remove from list view
                $scope.activeModuleFilters.splice(position, 1);
            }
        };

        $scope.allModules = function () {
            angular.forEach($scope.moduleFilters, function (value, key) {
                if ($scope.activeModuleFilters.indexOf(value) < 0) {
                    $scope.activeModuleFilters.push(value);
                }
            });
        };

        $scope.noModules = function () {
            $scope.activeModuleFilters.length = 0;
        };

        $scope.exportAllQuestionnaires = function () {
            $scope.openInNewWindow('GET', contextPath + "/webapi/properties/questionnaire/export");
        };

        $scope.exportQuestionnaire = function (id) {
            $scope.openInNewWindow('GET', contextPath + "/webapi/properties/questionnaire/" + id + "/export");
        };

        $scope.lockQuestionnaire = function (questionnaire) {
            $scope.loading = true;
            QuestionnaireService.lockQuestionnaire({questionnaireId: questionnaire.id}, {}, function (data, responseHeaders) {
                $scope.addAlert('Successfully locked questionnaire ' + questionnaire.questionnaireName, 'success', 10000);
                questionnaire.locked = data.locked;
                $scope.loading = false;
            }, function (httpResponse) {
                $scope.addAlert('There was an error locking/unlocking the questionnaire!', 'danger');
                $scope.loading = false;
            });
        };

        $scope.importQuestionnaire = function ($files) {
            if ($files.length == 0) {
                return;
            }

            $scope.loading = true;
            for (var i = 0; i < $files.length; i++) {
                Upload.upload({
                    url: contextPath + '/webapi/upload/questionnaire',
                    method: 'POST',
                    file: $files[i]
                }).progress(function (evt) {
                    ////console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    $scope.loading = false;
                    $scope.addAlert('Successfully imported questionnaire(s)', 'success', 10000);
                    $scope.getAllQuestionnaires();
                }).error(function (data, status, headers, config) {
                    $scope.loading = false;
                    switch (status) {
                        case 406:
                            $scope.addAlert('The XML file uploaded is invalid. Please check the file and try again', 'warning', 10000);
                            break;
                        case 409:
                            $scope.addAlert('The questionnaire(s) being imported has tried to delete a question or option which has an answer attached to it. Aborting import.', 'warning', 10000);
                            break;
                        default:
                            $scope.addAlert('An error has occurred while trying to import the questionnaire(s)!', 'danger', 10000);
                            break;
                    }

                });
            }
        };

        $scope.toSection = function (level) {
            $scope.section.label = $scope.levelLabels[level];
            $scope.section.level = level;
        };

        $scope.isOnThisLevel = function (level) {
            if (level.indexOf($scope.section.level) > -1) {
                return 'active';
            }
        };

        $scope.cancelAttributeEdit = function () {
            this.formScope.forms.questionnaireForm.$setPristine();
            $scope.attributeEdit = false;
            $scope.getAllQuestionnaires();
        };

        $scope.onDragStart = function (event, ui, item) {
            $scope.whatIsDragged = item;
        };

        $scope.getAllQuestionnaires = function () {
            $scope.loading = true;
            $scope.questionnaires.length = 0;
            QuestionnaireService.query({}, function (data) {
                $scope.loading = false;
                $scope.questionnaires = data;
            }, function () {
                $scope.loading = false;
            });
        };

        $scope.setQuestionnaireFormScope = function (scope) {
            this.formScope = scope;
        };

        var questionnaireSaveSuccess = function (data) {
            $scope.selectedQuestionnaire = data;
            $scope.attributeEdit = false;
            $scope.persisting = false;
            $scope.addAlert('Successfully saved the questionnaire', 'success', 10000);
            $scope.getAllQuestionnaires();
        };

        var questionnaireSaveError = function (httpResponse) {
            $scope.persisting = false;
            switch (httpResponse.status) {
                case 405:
                    $scope.addAlert('Please make sure all fields are filled in', 'warning', 10000);
                    break;
                case 417:
                    $scope.addAlert('There is already a GRESB Questionnaire for this year!', 'warning', 10000);
                    break;
                default:
                    $scope.addAlert('There was an error saving the questionnaire!', 'danger', 10000);
            }
        };

        $scope.persisting = false;
        $scope.saveQuestionnaire = function () {
            if (this.formScope.forms.questionnaireForm.$valid) {
                $scope.persisting = true;
                if (angular.isDefined($scope.selectedQuestionnaire.id)) {
                    QuestionnaireService.update($scope.selectedQuestionnaire, questionnaireSaveSuccess, questionnaireSaveError);
                } else {
                    QuestionnaireService.save($scope.selectedQuestionnaire, questionnaireSaveSuccess, questionnaireSaveError);
                }
            } else {
                $scope.addAlert('Please make sure all fields are filled in and valid', 'warning', 10000);
            }
        };

        $scope.cloneQuestionnaire = function (id) {
            $scope.loading = true;
            QuestionnaireService.clone({
                questionnaireId: id,
                copyAnswers: $scope.copyAnswers.value
            }, {}, function (data) {
                $scope.addAlert('Successfully copied questionnaire', 'success', 10000);
                $scope.copyAnswers.value = false; // Reset to default value
                $scope.getAllQuestionnaires();
            }, function (httpResponse) {
                $scope.loading = false;
                switch (httpResponse.status) {
                    case 417:
                        $scope.addAlert('Sorry, there is already a GRESB Questionnaire for this year!', 'warning', 10000);
                        break;
                    default:
                        $scope.addAlert('There was an error copying the questionnaire!', 'danger', 10000);
                }
            });

        };

        $scope.newQuestionnaire = function () {
            ControllerInfoPasser.broadcast('event:questionnaireEditMode');

        };

        $scope.openQuestionnaire = function (questionnaire) {
            ControllerInfoPasser.broadcast('event:questionnaireEditMode');

            if (angular.isDefined(questionnaire)) {
                $scope.setQuestionnaire(questionnaire);
            } else {
                $scope.setQuestionnaire({group: {questionnaireType: 'PROPERTY'}})
            }
            $scope.attributeEdit = true;
        };

        $scope.setQuestionnaire = function (questionnaire) {
            $scope.selectedQuestionnaire = questionnaire;
            $scope.setQuestionnaireSubTypes();
            $scope.loadAllProperties();
        };

        $scope.setupPropertyExclusions = function (propertyExclusions) {
            if (angular.isDefined(propertyExclusions)) {
                var exclusions = JSON.parse(propertyExclusions);

                $scope.excludedOwners = angular.copy(exclusions.excludedOwners);
                $scope.excludedTypes = angular.copy(exclusions.excludedTypes);
                $scope.excludedUnits = angular.copy(exclusions.excludedUnits);

                $scope.excludedProperties.length = 0;
                angular.forEach(exclusions.excludedProperties, function (propertyNumber) {
                    var props = $scope.searchArrayForProperty($scope.properties, 'propertyNumber', propertyNumber);
                    if (props.length > 0) {
                        $scope.excludedProperties.push(props[0]);
                    }
                });
            } else {
                $scope.excludedOwners.length = 0;
                $scope.excludedTypes.length = 0;
                $scope.excludedUnits.length = 0;
                $scope.excludedProperties.length = 0;
            }
        };

        $scope.deleteQuestionnaire = function () {
            QuestionnaireService.delete({id: $scope.selectedQuestionnaire.id}, function () {
                $scope.addAlert("Successfully deleted questionnaire '" + $scope.selectedQuestionnaire.group.title + ": " + $scope.selectedQuestionnaire.questionnaireName + "'", 'success', 10000);
                $scope.selectedQuestionnaire = undefined;
                $scope.attributeEdit = false;
                $scope.getAllQuestionnaires();
            }, function (httpResponse) {
                $scope.smoothScroll('#alertsDiv', 500);
                switch (httpResponse.status) {
                    case 409:
                        $scope.addAlert('There are answers associated with this questionnaire, they must be removed before deleting the questionnaire', 'info', 10000);
                        break;
                    default:
                        $scope.addAlert('There was an error deleting the questionnaire!', 'danger', 10000);
                        break;
                }

            });
        };

        $scope.sortOptions = {
            placeholder: 'sortable-accept',
            stop: function (event, ui) {
                sequenceArray($scope.active);
            }
        };

        var sequenceArray = function (array) {
            angular.forEach(array, function (item, index) {
                item.sequence = index + 1;
            });
        };

        $scope.getCertificationPrerequisiteQuestions = function() {
            QuestionnaireService.getCertificationPrereqQuestions({questionnaireId: $scope.selectedQuestionnaire.id}, function (data) {
                $scope.prerequisiteQuestions = data;
            });
        };

        $scope.openCertificationLevels = function () {
            $scope.attributeEdit = false;
            $scope.toSection($scope.certificationLevel);
            $scope.getCertificationLevels();
            $scope.getCertificationPrerequisiteQuestions();
        };


        $scope.getActiveChecklistPrograms = function() {
            $scope.activeChecklistPrograms.length = 0;
            ChecklistProgramService.getByQuestionnaireId({questionnaireId: $scope.selectedQuestionnaire.id}, function (data) {
                $scope.activeChecklistPrograms = data;
            }, function () {
                $scope.smoothScroll('#alertsDiv', 500);
                $scope.addAlert('There was an problem retrieving the surveys...', 'danger', 10000);
            });
        };

        $scope.getActiveChecklistParticipants = function() {
            $scope.activeChecklistParticipants.length = 0;
            ChecklistProgramService.getByQuestionnaireId({questionnaireId: $scope.selectedQuestionnaire.id}, function (data) {
                $scope.activeChecklistPrograms = data;
            });
        };

        $scope.openChecklistPrograms = function() {
            $scope.attributeEdit = false;
            $scope.toSection($scope.checklistProgramsLevel);
            $scope.getActiveChecklistPrograms();
        };

        $scope.getCertificationLevels = function () {
            $scope.available.length = 0;
            QuestionnaireService.getWeightingsOnQuestionnaire({questionnaireId: $scope.selectedQuestionnaire.id}, function (data) {
                $scope.available = data;
                $scope.getQuestionnaireCertificationLevels();
            });
        };

        $scope.getQuestionnaireCertificationLevels = function () {
            QuestionnaireService.getCertificationLevels({questionnaireId: $scope.selectedQuestionnaire.id}, function (data) {
                processRangesForDisplay(data);
            });
        };

        $scope.saveQuestionnaireCertificationLevels = function () {
            processRangesForSaving();
            QuestionnaireService.updateCertificationLevels({questionnaireId: $scope.selectedQuestionnaire.id}, $scope.active, function (data) {
                $scope.addAlert('Saved', 'success', 5000);
                processRangesForDisplay(data);
            }, function () {
                $scope.smoothScroll('#alertsDiv', 500);
                $scope.addAlert('There was an error saving the certification levels!', 'danger', 10000);
            });
        };

        $scope.viewScoringConfigurationDetails = function (weighting) {

            var questionnaireId = $scope.selectedQuestionnaire.id;

            var modalInstance = $modal.open({
                templateUrl: 'scoringConfigurationModal.html',
                controller: 'ScoringConfigurationModalCtrl',
                windowClass: 'preview-record-modal-window',
                resolve: {
                    weighting: function () {
                        return weighting;
                    },
                    questionnaireId: function () {
                        return questionnaireId;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                // $scope.selected = selectedItem;
            }, function () {
                // $log.info('Modal dismissed at: ' + new Date());
            });

        };


        $scope.setCertificationNameFilter = function(weighting) {
            $scope.selectedCertificationName = weighting;
        };

        $scope.viewScoringPreRequisiteQuestions = function (weighting) {

            var questionnaireId = $scope.selectedQuestionnaire.id;

            var modalInstance = $modal.open({
                templateUrl: 'scoringPreRequisiteQuestionsModal.html',
                controller: 'ScoringPreRequisiteQuestionsModalCtrl',
                windowClass: 'preview-record-modal-window',
                resolve: {
                    weighting: function () {
                        return weighting;
                    },
                    questionnaireId: function () {
                        return questionnaireId;
                    },
                    printPreReq: function () {
                        return $scope.printTable;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                // $scope.selected = selectedItem;
            }, function () {
                // $log.info('Modal dismissed at: ' + new Date());
            });

        };

        var processRangesForDisplay = function (data) {
            $scope.ranges = {};
            angular.forEach($scope.available, function (weight, index) {
                $scope.ranges[weight.title] = [];
                $scope.getMaximumScore(weight.title);
            });

            angular.forEach(data, function (range, index) {
                $scope.ranges[range.weight.title].push(range);
            });
        };

        var processRangesForSaving = function () {
            $scope.active.length = 0;
            angular.forEach($scope.ranges, function (ranges, weighting) {
                $scope.pushArray($scope.active, ranges);
            });
        };

        $scope.addCertificationLevel = function (weight) {
            var newRange = {
                fromScore: 0,
                toScore: 0,
                questionnaireId: $scope.selectedQuestionnaire.id,
                certificationLevel: '',
                weight: $scope.searchArrayForProperty($scope.available, 'title', weight)[0]
            };

            $scope.ranges[weight].push(newRange);
        };

        $scope.selectWeighting = function (weight) {
            $scope.currentWeight = $scope.searchArrayForProperty($scope.available, 'title', weight)[0];
            $scope.toSection($scope.certificationOptions);
            $scope.getCertificationOptions(weight);
            $scope.getQuestionnaireCertificationOptions(weight);
        };

        $scope.selectCertificationOption = function (question_option) {
            var index = $scope.active.indexOf($scope.currentOptionForWeight);
            $scope.currentOptionForWeight = {
                questionnaireId: $scope.selectedQuestionnaire.id,
                option: question_option,
                weight: question_option.option.certificationWeight
            };
            if (index > -1) {
                $scope.active.splice(index, 1, $scope.currentOptionForWeight);
            } else {
                $scope.active.push($scope.currentOptionForWeight);
            }
        };

        $scope.getQuestionnaireCertificationOptions = function () {
            $scope.active.length = 0;
            $scope.currentOptionForWeight = undefined;
            QuestionnaireService.getQuestionnaireCertificationOptions({questionnaireId: $scope.selectedQuestionnaire.id}, function (data) {
                $scope.active = data;

                angular.forEach(data, function (c, ignoreIndex) {
                    var weight = c.weight;
                    if (weight.title == $scope.currentWeight.title) {
                        $scope.currentOptionForWeight = c;
                    }
                });
            });
        };

        $scope.getCertificationOptions = function (weightTitle) {
            $scope.available.length = 0;
            QuestionnaireService.getCertificationOptions({
                questionnaireId: $scope.selectedQuestionnaire.id,
                title: weightTitle
            }, function (data) {
                $scope.available = data;
            });
        };

        $scope.saveQuestionnaireCertificationOptions = function () {
            QuestionnaireService.updateQuestionnaireCertificationOptions({questionnaireId: $scope.selectedQuestionnaire.id}, $scope.active, function (data) {
                $scope.active = data;
                $scope.smoothScroll('#alertsDiv', 500);
                $scope.addAlert('Saved', 'success', 10000);
                $scope.getQuestionnaireCertificationOptions();
            }, function (httpResponse) {
                $scope.smoothScroll('#alertsDiv', 500);
                $scope.addAlert('There was an error saving the selection!', 'danger', 10000);
            });
        };

        $scope.removeCertificationOption = function () {
            var index = $scope.active.indexOf($scope.currentOptionForWeight);
            if (index > -1) {
                $scope.active.splice(index, 1);
                $scope.currentOptionForWeight = undefined;
            }
        };

        $scope.openReportConfigurations = function () {
            $scope.toSection($scope.reportConfigurationLevel);
        };

        $scope.getQuestionReportConfigurations = function (reportType) {
            QuestionnaireReportConfigService.findByQuestionnaireId({
                questionnaireId: $scope.selectedQuestionnaire.id,
                reportType: reportType
            }, function (data) {
                $scope.questionReports = data;
            }, function (httpResponse) {
                $scope.addAlert('An error has occurred trying to get the question report configurations')
            });
        };

        $scope.openCategories = function (bypassCheck) {
            if ($scope.checkIfSaved(bypassCheck)) {
                $scope.attributeEdit = false;
                $scope.toSection($scope.categoryLevel);
                $scope.getAvailableCategories();
                $scope.getQuestionnaireCategories();
            }
        };

        $scope.getAvailableCategories = function () {
            $scope.available.length = 0;
            QuestionnaireService.getAvailableCategories({}, function (data) {
                $scope.available = data;
            });
        };

        $scope.getQuestionnaireCategories = function () {
            $scope.active.length = 0;
            QuestionnaireService.getQuestionnaireCategories({questionnaireId: $scope.selectedQuestionnaire.id}, function (data) {
                $scope.active = data;
            });
        };

        $scope.editCategory = function (category) {
            if (category) {
                //$('#newCategoryForm').collapse('hide');
                $scope.attributeEdit = true;
                $scope.selectedCategory = category;
            }
            else {
                //$("div[id^='collapse']").collapse('hide');
                $scope.selectedCategory = {};
            }
        };

        $scope.createCategory = function () {
            QuestionnaireService.newCategory($scope.selectedCategory, function (data) {
                $scope.selectedCategory = {};
                $('#createCategoryModal').modal('hide');
                $scope.chooseCategory(data);
                $scope.getAvailableCategories();
            }, function (ignoreHttpResponse) {
                $scope.smoothScroll('#alertsDiv', 500);
                $scope.addAlert('There was an error saving the category!', 'danger', 10000);
            });
        };

        $scope.removeActive = function (index) {
            $scope.active.splice(index, 1);
            sequenceArray($scope.active);
        };

        $scope.updateCategory = function () {
            QuestionnaireService.updateCategory($scope.selectedCategory, function () {
                $scope.attributeEdit = false;
                $('.success-check').show();
                $scope.timeout(function () {
                    $('.success-check').hide();
                }, 5000);

                $scope.getQuestionnaireCategories();
            }, function (ignoreHttpResponse) {
                $scope.smoothScroll('#alertsDiv', 500);
                $scope.addAlert('There was an error saving the category!', 'danger', 10000);
            });
        };

        $scope.saveCategory = function (formValid) {
            if (formValid) {
                if ($scope.selectedCategory.id) {
                    $scope.updateCategory();
                } else {
                    $scope.createCategory();
                }
            }
        };

        $scope.chooseChecklistProgram = function (program) {
            if ($scope.searchArrayForProperty($scope.activeChecklistPrograms, 'id', program.id).length == 0) {
                $scope.activeChecklistPrograms.push(program);
            }
        };

        $scope.finishChecklistProgramPersist = function(data) {
            $scope.selectedProgram = {};
            $('#createChecklistProgramModal').modal('hide');
            $scope.chooseChecklistProgram(data);
        };

        $scope.saveChecklistProgram = function(formValid) {
            if (formValid) {
                if (angular.isUndefined($scope.selectedProgram.id)) {
                    ChecklistProgramService.save({questionnaireId: $scope.selectedQuestionnaire.id},$scope.selectedProgram, function (data) {
                        $scope.finishChecklistProgramPersist(data);

                    }, function (ignoreHttpResponse) {
                        $scope.smoothScroll('#alertsDiv', 500);
                        $scope.addAlert('There was an error creating the new checklist program!', 'danger', 10000);
                    });
                } else {
                    ChecklistProgramService.update({},$scope.selectedProgram, function (data) {
                        $scope.finishChecklistProgramPersist(data);

                    }, function (ignoreHttpResponse) {
                        $scope.smoothScroll('#alertsDiv', 500);
                        $scope.addAlert('There was an error updating the new checklist program!', 'danger', 10000);
                    });
                }
            }
        };

        $scope.saveChecklistPrograms = function () {
            ChecklistProgramService.updateMultiplePrograms({questionnaireId: $scope.selectedQuestionnaire.id}, $scope.activeChecklistPrograms, function (data) {
                $scope.addAlert('Saved', 'success', 5000);
                $scope.activeChecklistPrograms = data;
            }, function (httpResponse) {
                switch (httpResponse.status) {
                    case 417:
                        $scope.addAlert('Cannot save changes, one of the programs have duplicate participants..', 'warning', 10000);
                        break;
                    default:
                        $scope.addAlert('There was an error saving!', 'danger', 10000);
                        break;
                }
            });
        };

        $scope.saveCategories = function () {
            QuestionnaireService.updateCategories({questionnaireId: $scope.selectedQuestionnaire.id}, $scope.active, function (data) {
                $scope.addAlert('Saved', 'success', 5000);
                $scope.active = data;
                $scope.getAvailableCategories();
            }, function () {
                $scope.addAlert('Error Saving!', 'danger', 5000);
            });
        };

        $scope.deleteCategory = function () {
            QuestionnaireService.deleteCategory({id: $scope.selectedCategory.id}, function () {
                $scope.attributeEdit = false;
                $scope.getAvailableCategories();
            }, function (httpResponse) {
                $scope.smoothScroll('#alertsDiv', 500);
                switch (httpResponse.status) {
                    case 409:
                        $scope.addAlert('This category exists on a questionnaire. You cannot delete it until no questionnaires contain this category.', 'info', 10000);
                        break;
                    default:
                        $scope.addAlert('There was an error deleting the category!', 'danger', 10000);
                        break;
                }
            });
        };

        $scope.chooseCategory = function (category) {
            if ($scope.searchArrayForProperty($scope.active, 'categoryId', category.id).length == 0) { // Category not already in list
                var q_category = {};

                q_category.questionnaireId = $scope.selectedQuestionnaire.id;
                q_category.categoryId = category.id;
                q_category.sequence = $scope.active.length;
                q_category.category = angular.copy(category);
                $scope.active.push(q_category);
            }
        };

        $scope.openCategoryQuestions = function (category, bypassCheck) {
            if ($scope.checkIfSaved(bypassCheck)) {
                $scope.selectedCategory = category;
                $scope.toSection($scope.questionLevel);
                $scope.getAvailableQuestions();
                $scope.getActiveQuestions();
            }
        };

        $scope.showChecklistParticipantForm = function(program, participantIndex) {
            $scope.selectedParticipantIndex = participantIndex;
            $scope.selectedProgram = program;
            if (angular.isDefined(program)) {
                if (angular.isUndefined(program.participants)) {
                    program['participants'] = [];
                }

                if (angular.isDefined(participantIndex)) {
                    $scope.selectedParticipant = program.participants[participantIndex];
                    if (angular.isDefined($scope.selectedParticipant)) {
                        $scope.currentParticipantToView = angular.copy($scope.selectedParticipant);

                    } else {
                        var currentUser = $scope.getCurrentUser();
                        if (angular.isDefined(currentUser)) {
                            $scope.currentParticipantToView = {
                                dateCreated: new Date(),
                                createdBy: currentUser.userProfile.username
                            };
                            $scope.selectedParticipant = angular.copy($scope.currentParticipantToView);
                        } else {
                            $scope.addAlert('Cannot initialize participant form, the current user is not defined!', 'danger');
                        }
                    }
                }
            }
        };

        $scope.removeChecklistParticipantItem = function(program, participantIndex) {
            if (angular.isDefined(program)) {
                if (angular.isDefined(program.participants)) {
                    if (angular.isDefined(participantIndex)) {
                        program.participants.splice(participantIndex, 1);
                    }
                }
            }
        };

        $scope.applyChecklistParticipantEdit = function() {
            if (angular.isDefined($scope.selectedParticipantIndex) && angular.isDefined($scope.selectedProgram)) {
                $scope.selectedProgram.participants[$scope.selectedParticipantIndex] = $scope.currentParticipantToView;
                $scope.selectedParticipant = $scope.selectedProgram[$scope.selectedParticipantIndex];
            } else {
                $scope.selectedProgram.participants.push($scope.currentParticipantToView);
                $scope.selectedParticipant = $scope.currentParticipantToView;
            }
        };

        $scope.createNewChecklistParticipant = function(program) {
            $scope.selectedParticipantIndex = undefined;
            $scope.selectedProgram = program;

            ChecklistProgramService.createParticipant({}, $scope.selectedProgram, function (data) {
                $scope.currentParticipantToView = data;
                $scope.selectedParticipant = angular.copy($scope.currentParticipantToView);

            }, function (httpResponse) {
                switch (httpResponse.status) {
                    case 405:
                        $scope.addAlert('Cannot create participant for unknown survey..', 'warning', 10000);
                        break;
                    default:
                        $scope.addAlert('There was problem creating a participant!', 'danger', 10000);
                        break;
                }
            });
        };

        $scope.revertParticipantEdit = function() {
            $scope.currentParticipantToView = angular.copy($scope.selectedParticipant);
        };

        $scope.removeChecklistProgram = function (index) {
            $scope.activeChecklistPrograms.splice(index, 1);
            sequenceArray($scope.activeChecklistPrograms);
        };

        $scope.removeChecklistParticipant = function(program, index) {
            if (angular.isDefined(program.participants)) {
                program.participants.splice(index, 1);
                sequenceArray(program.participants);
            }
        };

        $scope.getAvailableQuestions = function () {
            $scope.available.length = 0;
            QuestionnaireService.getAvailableQuestions({}, function (data) {
                $scope.available = data;
            });
        };

        $scope.getActiveQuestions = function () {
            $scope.active.length = 0;
            QuestionnaireService.getQuestionnaireCategoryQuestions({
                questionnaireId: $scope.selectedQuestionnaire.id,
                categoryId: $scope.selectedCategory.id
            }, function (data) {
                $scope.active = data;
            });
        };

        $scope.editQuestion = function (question) {
            if (question) {
                $scope.selectedQuestion = question;
                $scope.attributeEdit = true;
            } else {
                $scope.selectedQuestion = {};
            }
        };

        $scope.saveQuestion = function (validForm) {
            if (validForm) {
                if ($scope.selectedQuestion.id) {
                    $scope.updateQuestion();
                } else {
                    $scope.createQuestion();
                }
            }
        };

        $scope.updateQuestion = function () {
            QuestionnaireService.updateQuestion($scope.selectedQuestion, function () {
                $scope.attributeEdit = false;
                $('.success-check').show();
                $scope.timeout(function () {
                    $('.success-check').hide();
                }, 5000);
                $scope.getActiveQuestions();
            });
        };

        $scope.createQuestion = function () {
            QuestionnaireService.createQuestion($scope.selectedQuestion, function (data) {
                $scope.selectedQuestion = {};
                $('#newQuestionModal').modal('hide');
                $scope.chooseQuestion(data);
                $scope.getAvailableQuestions();
            }, function (httpResponse) {
                $scope.smoothScroll('#alertsDiv', 500);
                $scope.addAlert('There was an error saving the question!', 'danger', 10000);
            });
        };

        $scope.saveQuestions = function (forceDelete) {
            for (var i = 0; i < $scope.active.length; i++) {
                if (angular.isDefined($scope.active[i].validAnswersList) && $scope.active[i].validAnswersList.length > 0) {
                    var validAnswersList = $scope.active[i].validAnswersList.map(function (e) {
                        return JSON.stringify(e);
                    });
                    $scope.active[i].validAnswers = validAnswersList.join("::");
                } else {
                    $scope.addAlert('Question \'' + $scope.active[i].question.title + '\' has no valid answers selected!', 'warning', 10000);
                    return;
                }
            }

            QuestionnaireService.updateQuestionnaireQuestions({
                questionnaireId: $scope.selectedQuestionnaire.id,
                categoryId: $scope.selectedCategory.id,
                forceDelete: angular.isDefined(forceDelete) ? forceDelete : false // default to false if not defined
            }, $scope.active, function (data) {
                $scope.addAlert('Saved', 'success', 5000);
                $scope.active = data;
                $scope.getAvailableQuestions();
            }, function (response) {
                switch (response.status) {
                    case 409:
                        $('#forceDeleteModal').modal('show');
                        break;
                    default:
                        $scope.addAlert('Error Saving!', 'danger', 5000);
                }
            });
        };

        $scope.deleteQuestion = function () {
            QuestionnaireService.deleteQuestion({id: $scope.selectedQuestion.id}, function () {
                $scope.attributeEdit = false;
                $scope.getAvailableQuestions();
            }, function (httpResponse) {
                $scope.smoothScroll('#alertsDiv', 500);
                switch (httpResponse.status) {
                    case 409:
                        $scope.addAlert('This question exists on a questionnaire. You cannot delete it until no questionnaire categories contain this question.', 'info', 10000);
                        break;
                    default:
                        $scope.addAlert('There was an error deleting the question!', 'danger', 10000);
                        break;
                }
            });
        };

        $scope.chooseQuestion = function (question) {
            if ($scope.searchArrayForProperty($scope.active, 'questionID', question.id).length == 0) {
                var c_question = {};
                c_question.qcategoryID = $scope.selectedCategory.id;
                c_question.questionID = question.id;
                c_question.sequence = $scope.active.length;
                c_question.question = angular.copy(question);
                c_question.required = true;
                c_question.validAnswersList = ['true', 'false', 'na'];

                $scope.active.push(c_question);
            }
        };

        $scope.openQuestionWeightings = function (question) {
            if ($scope.checkIfSaved()) {
                $scope.selectedQuestion = question;
                $scope.toSection($scope.questionWeightingLevel);
                $scope.getAvailableWeightings();
                $scope.getActiveWeightings();
            }
        };

        $scope.getAvailableWeightings = function (forModal) {
            if (forModal) {
                QuestionnaireService.getAvailableWeightings({}, function (data) {
                    $scope.weightings = data;
                });
            } else {
                $scope.available.length = 0;
                return QuestionnaireService.getAvailableWeightings({}, function (data) {
                    $scope.available = data;
                    $scope.weightings = data;
                    if (data.length > 0) {
                        $scope.selectedWeightLabel.value = data[0].title;
                    }
                }).$promise;
            }
        };

        $scope.getActiveWeightings = function () {
            $scope.active.length = 0;
            return QuestionnaireService.getQuestionWeightings({
                questionnaireId: $scope.selectedQuestionnaire.id,
                categoryId: $scope.selectedCategory.id,
                questionId: $scope.selectedQuestion.id
            }, function (data) {
                $scope.active = data;
            }).$promise;
        };

        $scope.editWeight = function (weight) {
            if (weight) {
                $scope.selectedWeight = weight;
                $scope.attributeEdit = true;
            } else {
                $scope.selectedWeight = {};
            }
        };

        $scope.saveWeight = function (formValid) {
            if (formValid) {
                if ($scope.selectedWeight.id) {
                    $scope.updateWeight();
                } else {
                    $scope.createWeight();
                }
            }
        };

        $scope.updateWeight = function () {
            QuestionnaireService.updateWeightings($scope.selectedWeight, function () {
                $scope.attributeEdit = false;
                $('.success-check').show();
                $scope.timeout(function () {
                    $('.success-check').hide();
                }, 5000);
                $scope.getActiveWeightings();
            });
        };

        $scope.createWeight = function () {
            QuestionnaireService.createWeighting($scope.selectedWeight, function (data) {
                $scope.selectedWeight = {};
                $('#createWeightModal').modal('hide');
                $scope.chooseWeight(data);
                $scope.getAvailableWeightings()
            }, function (httpResponse) {
                $('#createWeightModal').modal('hide');
                $scope.smoothScroll('#alertsDiv', 500);
                switch (httpResponse.status) {
                    case 405:
                        $scope.addAlert('A scoring category with the title \'' + $scope.selectedWeight.title + '\' already exists. Please choose a different title', 'warning', 10000);
                        break;
                    default:
                        $scope.addAlert('There was an error saving the weighting!', 'danger', 10000);
                }
            });
        };

        $scope.deleteWeight = function () {
            QuestionnaireService.deleteWeightings({id: $scope.selectedWeight.id}, function () {
                $scope.attributeEdit = false;
                $scope.getAvailableWeightings();
            }, function (httpResponse) {
                $scope.smoothScroll('#alertsDiv', 500);
                switch (httpResponse.status) {
                    case 409:
                        $scope.addAlert('This weighting exists on a questionnaire. You cannot delete it until no questionnaires contain this weighting.', 'info', 10000);
                        break;
                    default:
                        $scope.addAlert('There was an error deleting the weighting!', 'danger', 10000);
                        break;
                }
            });
        };

        $scope.saveWeightings = function () {
            QuestionnaireService.updateQuestionnaireQuestionWeightings({
                questionnaireId: $scope.selectedQuestionnaire.id,
                categoryId: $scope.selectedCategory.id,
                questionId: $scope.selectedQuestion.id
            }, $scope.active, function (data) {
                $scope.addAlert('Saved', 'success', 5000);
                $scope.active = data;
                $scope.getAvailableWeightings();
            }, function (httpStatus) {
                $scope.addAlert('Error Saving!', 'danger', 5000);
            })
        };

        $scope.chooseWeight = function (weight) {
            if ($scope.searchArrayForProperty($scope.active, 'qweightingID', weight.id).length == 0) {
                var q_weight = {};
                q_weight.qweightingID = weight.id;
                q_weight.questionID = $scope.selectedQuestion.id;
                q_weight.weight = 0;
                q_weight.requiredQuestionValue = "true";
                q_weight.questionWeight = angular.copy(weight);

                $scope.active.push(q_weight);
            }
        };

        $scope.dependencyListToUpdate = 0;
        $scope.openQuestionDependencies = function (question, bypassCheck) {
            if ($scope.checkIfSaved(bypassCheck)) {
                $scope.selectedQuestion = question;
                $scope.toSection($scope.questionDependenciesLevel);
                $scope.getQuestionnaireQuestions();
                $scope.getQuestionDependencies();
            }
        };

        $scope.getQuestionnaireQuestions = function () {
            QuestionnaireService.getQuestionnaireQuestions({questionnaireId: $scope.selectedQuestionnaire.id}, function (data) {
                $scope.questionnaireQuestions = data;
            });
        };

        $scope.getQuestionDependencies = function () {
            if (angular.isDefined($scope.questionDependencies)) {
                $scope.questionDependencies.length = 0;
            }

            QuestionnaireService.getQuestionDependencies({
                questionnaireId: $scope.selectedQuestionnaire.id,
                questionId: $scope.selectedQuestion.id
            }, function (data) {
                $scope.questionDependencies = data;
            });
        };

        $scope.updateDependencyList = function (list) {
            $scope.dependencyListToUpdate = list;
        };

        $scope.updateQuestionDependencies = function () {
            $scope.selectedQuestion.dependsOn = $scope.questionDependencies.dependants;
            $scope.selectedQuestion.dependantTo = $scope.questionDependencies.dependents;

            QuestionnaireService.updateQuestionDependencies({questionnaireId: $scope.selectedQuestionnaire.id}, $scope.selectedQuestion, function (data) {
                $scope.questionDependencies = data;
                $scope.addAlert('Successfully saved question dependencies', 'success', 5000);
            }, function (httpResponse) {
                $scope.addAlert('A problem has occurred saving the question dependencies!', 'danger', 5000);
            });
        };

        var verifyDependencyLists = function (dependency) {
            var valid = true;

            angular.forEach($scope.questionDependencies.dependants, function (elem, index) {
                if (elem.question.title === dependency.question.title) {
                    valid = false;
                }
            });

            angular.forEach($scope.questionDependencies.dependents, function (elem, index) {
                if (elem.question.title === dependency.question.title) {
                    valid = false;
                }
            });

            if (!valid) {
                $scope.addAlert('This question is already added as a dependency', 'info', 5000);
            }

            return valid;
        };

        $scope.addQuestionDependency = function (category_question) {
            var dependency = {
                question: category_question,
                requiredAnswerValue: null
            };
            // For display purposes
            dependency.question.title = dependency.question.question.title;

            // Make sure no duplicated or cyclic dependencies are added
            if (verifyDependencyLists(dependency) == false) {
                return;
            }

            if ($scope.dependencyListToUpdate == 0) {
                $scope.questionDependencies.dependants.push(dependency);
            } else {
                $scope.questionDependencies.dependents.push(dependency);
            }
        };

        $scope.removeDependency = function (array, index) {
            array.splice(index, 1);
        };

        $scope.switchRequiredAnswer = function (dependency, index, listToUpdate) {
            var newDependency = {
                question: $scope.searchArrayForProperty($scope.questionnaireQuestions, "id", dependency.question.id)[0],
                requiredAnswerValue: dependency.requiredAnswerValue
            };
            // For display purposes only
            newDependency.question.title = newDependency.question.question.title;

            if (listToUpdate == 0) {
                $scope.questionDependencies.dependants[index] = angular.copy(newDependency);
            } else {
                $scope.questionDependencies.dependents[index] = angular.copy(newDependency);
            }
        };


        $scope.openQuestionOptions = function (question, bypassCheck) {
            if ($scope.checkIfSaved(bypassCheck)) {
                $scope.selectedQuestion = question;

                $scope.validAnswerDropbox = angular.copy($scope.dropboxes['questionAnswer']);

                var requiresAnswer = questionRequiresAnswer(question);
                $scope.validAnswerDropbox.itemMap = $scope.validAnswerDropbox.itemMap.filter(function (dropboxValue) {
                    return question.validAnswersList.indexOf(dropboxValue.value) > -1;
                });

                // Default to first one in the list
                $scope.questionAnswer = {
                    value: $scope.validAnswerDropbox.itemMap[0].value
                };

                $scope.toSection($scope.questionOptionsLevel);
                $scope.getAvailableOptions();
                $scope.getActiveOptions();
            }
        };

        var questionRequiresAnswer = function (question) {
            var validAnswers = question.validAnswersList;

            for (var i = 0; i < validAnswers.length; i++) {
                var validAnswer = validAnswers[i];
                if (validAnswer.toLowerCase() === 'anr') {
                    return false;
                }
            }

            return true;
        };


        $scope.modifyQuestionPropertyExclusions = function () {
            var excludedPropertyNumbers = $scope.getPropertyNumbers($scope.excludedProperties);

            $scope.selectedQuestion.propertyExclusions = JSON.stringify({
                excludedProperties: excludedPropertyNumbers,
                excludedOwners: $scope.excludedOwners,
                excludedTypes: $scope.excludedTypes,
                excludedUnits: $scope.excludedUnits
            });
        };


        $scope.getAvailableOptions = function () {
            $scope.available.length = 0;
            QuestionnaireService.getAvailableOptions({}, function (data) {
                $scope.available = data;
            })
        };

        $scope.getActiveOptions = function () {
            $scope.active.length = 0;
            QuestionnaireService.getActiveOptions({
                questionnaireId: $scope.selectedQuestionnaire.id,
                categoryId: $scope.selectedCategory.id,
                questionId: $scope.selectedQuestion.id,
                answer: $scope.questionAnswer.value
            }, function (data) {
                $scope.active = data;
            })
        };

        $scope.editOption = function (option) {
            if (option) {
                $scope.selectedOption = option;
                $scope.attributeEdit = true;
            } else {
                $scope.selectedOption = {};
            }
        };

        $scope.saveOption = function (validForm) {
            if (validForm) {
                if ($scope.selectedOption.id) {
                    $scope.updateOption();
                } else {
                    $scope.createOption();
                }
            }
        };

        $scope.updateOption = function () {
            QuestionnaireService.updateOptions($scope.selectedOption, function () {
                $scope.attributeEdit = false;
                $('.success-check').show();
                $scope.timeout(function () {
                    $('.success-check').hide();
                }, 5000);
                $scope.getActiveOptions();
            });
        };

        $scope.createOption = function () {
            QuestionnaireService.createOptions($scope.selectedOption, function (data) {
                $scope.selectedOption = {};
                $('#createOptionModal').modal('hide');
                $scope.chooseOption(data);
                $scope.getAvailableOptions();
            }, function (httpResponse) {
                $scope.smoothScroll('#alertsDiv', 500);
                $scope.addAlert('There was an error saving the option!', 'danger', 10000);
            });
        };

        $scope.deleteOption = function () {
            QuestionnaireService.deleteOptions({id: $scope.selectedOption.id}, function () {
                $scope.attributeEdit = false;
                $scope.getAvailableOptions();
            }, function (httpResponse) {
                $scope.smoothScroll('#alertsDiv', 500);
                switch (httpResponse.status) {
                    case 409:
                        $scope.addAlert('This option exists on a questionnaire. You cannot delete it until no questionnaire questions contain this option.', 'info', 10000);
                        break;
                    default:
                        $scope.addAlert('There was an error deleting the option!', 'danger', 10000);
                        break;
                }
            });
        };

        $scope.saveOptions = function (forceDelete) {
            QuestionnaireService.updateQuestionnaireQuestionOptions({
                questionnaireId: $scope.selectedQuestionnaire.id,
                categoryId: $scope.selectedCategory.id,
                questionId: $scope.selectedQuestion.id,
                answer: $scope.questionAnswer.value,
                forceDelete: angular.isDefined(forceDelete) ? forceDelete : false // default to false if not defined
            }, $scope.active, function (data) {
                $scope.addAlert('Saved', 'success', 5000);
                $scope.active = data;
                $scope.getAvailableOptions();
            }, function (response) {
                switch (response.status) {
                    case 409:
                        $('#forceDeleteModal').modal('show');
                        break;
                    default:
                        $scope.addAlert('Error Saving!', 'danger', 5000);
                }
            })
        };

        $scope.chooseOption = function (option) {
            if ($scope.searchArrayForProperty($scope.active, 'qoptionID', option.id).length == 0) {
                var q_option = {};
                q_option.qoptionID = option.id;
                q_option.questionID = $scope.selectedQuestion.id;
                q_option.sequence = $scope.active.length;
                q_option.requiredQuestionValue = $scope.questionAnswer.value;
                q_option.required = true;
                q_option.option = angular.copy(option);

                $scope.active.push(q_option);
            }
        };

        $scope.openJumpToModal = function (option) {
            if ($scope.checkIfSaved()) {
                $scope.selectedOption = option;

                if (option.hasOwnProperty('jumpToMenuItem')) {
                    $scope.selectedOption.jumpToMenuItem = JSON.parse(option.jumpToMenuItem);
                }

                $http.get('json/environmentalMenus.json').success(function (data) {
                    $scope.environmentalItems = data;
                });

                $http.get('json/sustainabilityMonthlyCategories.json').success(function (data) {
                    $scope.sustainabilityItems = data;
                });

                $http.get('json/ohsMenus.json').success(function (data) {
                    $scope.ohsItems = data;
                });

                $('#jumpToModal').modal('show');
            }
        };

        $scope.changeMenuItem = function (jumpToTarget) {
            if (jumpToTarget.type !== 'menu') {
                return;
            }

            jumpToTarget.module = jumpToTarget.overviewPartialHTML.match('/(.*)/')[1];
            jumpToTarget.backToModule = $scope.selectedQuestionnaire.group.module.toLowerCase();
            $scope.selectedOption.jumpToMenuItem = JSON.stringify(jumpToTarget);
            $('#jumpToModal').modal('hide');
        };

        $scope.newScore = {};
        $scope.openOptionsMatrix = function (option) {
            if ($scope.checkIfSaved()) {

                if (isIfValidOptionType(option)) {
                    $scope.selectedOption = option;
                    $scope.toSection($scope.questionOptionsMatrixLevel);
                    $q.all([
                        $scope.getAvailableWeightings()
                    ]).then($scope.getActiveOptionsMatrix);
                } else {
                    var clazz = '.options-check-' + option.sequence;
                    $(clazz).show();
                    $scope.timeout(function () {
                        $(clazz).hide();
                    }, 5000);
                }


            }
        };

        var isIfValidOptionType = function (q_option) {
            var option = q_option.option;
            return option.type === 'dropbox' || option.type === 'checkbox' || option.type === 'likert';
        };

        $scope.checkOptionDropbox = function () {
            if ($scope.selectedOption.type !== 'dropbox' && angular.isDefined($scope.selectedOption.dropbox)) {
                $scope.selectedOption.dropbox = undefined;
            }

            if ($scope.selectedOption.type !== 'certification' && angular.isDefined($scope.selectedOption.certificationWeight)) {
                $scope.selectedOption.certificationWeight = undefined;
            }
        };

        $scope.getActiveOptionsMatrix = function () {
            $scope.active.length = 0;
            QuestionnaireService.getOptionWeightings({
                questionnaireId: $scope.selectedQuestionnaire.id,
                categoryId: $scope.selectedCategory.id,
                questionId: $scope.selectedQuestion.id,
                optionId: $scope.selectedOption.id,
                scoreType: $scope.selectedWeightLabel.value
            }, function (data) {
                $scope.active = data;
            });
        };

        $scope.addToMatrix = function () {
            $scope.active[0].answerMap[$scope.newScore.answer] = $scope.newScore.score;
//            $scope.newScore = {};
        };

        $scope.removeFromMatrix = function (key) {
            delete $scope.active[0].answerMap[key];
        };

        $scope.saveMatrix = function () {
            QuestionnaireService.updateOptionWeightings({
                questionnaireId: $scope.selectedQuestionnaire.id,
                categoryId: $scope.selectedCategory.id,
                questionId: $scope.selectedQuestion.id,
                optionId: $scope.selectedOption.id,
                scoreType: $scope.selectedWeightLabel.value
            }, $scope.active[0], function (data) {
                $scope.addAlert('Saved', 'success', 5000);
                $scope.active = data;
            }, function (httpStatus) {
                $scope.addAlert('Error Saving!', 'danger', 5000);
            });
        };

        $scope.openCertificationPrereqs = function (question) {
            if ($scope.checkIfSaved()) {
                $scope.selectedQuestion = question;
                $scope.toSection($scope.certificationPrereqsLevel);
                $scope.getAvailableWeightings();
                $scope.getActiveCertificationPrereqs();
            }
        };


        $scope.setQuestionToModifyExclusions = function(question) {
            $scope.selectedQuestion = question;
            $scope.setupPropertyExclusions($scope.selectedQuestion.propertyExclusions);
        };


        $scope.getActiveCertificationPrereqs = function () {
            $scope.active.length = 0;
            QuestionnaireService.getCertificationPrereqs({
                    questionnaireId: $scope.selectedQuestionnaire.id,
                    categoryId: $scope.selectedCategory.id,
                    questionId: $scope.selectedQuestion.id
                }
                , function (data) {
                    $scope.active = data
                })
        };

        $scope.saveCertificationPrereqs = function () {
            QuestionnaireService.updateCertificationPrereqs({
                    questionnaireId: $scope.selectedQuestionnaire.id,
                    categoryId: $scope.selectedCategory.id,
                    questionId: $scope.selectedQuestion.id
                }
                , $scope.active, function (data) {
                    $scope.addAlert('Saved', 'success', 5000);
                    $scope.active = data
                })
        };

        $scope.editCertificationPrereq = function (prereq) {
            $scope.selectedPrereq = prereq;
        };

        $scope.chooseCertification = function (cert) {
            if ($scope.searchArrayForProperty($scope.active, 'scoreType', cert.title).length == 0) {
                var q_certPrereq = {};
                q_certPrereq.questionId = $scope.selectedQuestion.id;
                q_certPrereq.scoreType = cert.title;
                q_certPrereq.requiredQuestionValue = "true";
                q_certPrereq.optionId = null;
                q_certPrereq.optionValue = null;
                q_certPrereq.comparator = null;

                $scope.active.push(q_certPrereq);
            }
        };

        $scope.openQuestionScorePrereqs = function (question) {
            if ($scope.checkIfSaved()) {
                $scope.selectedQuestion = question;
                $scope.toSection($scope.questionPrereqsLevel);
                $q.all([
                    $scope.getAvailableWeightings(),
                    $scope.getQuestionOnQuestionnaire()
                ]).then(function () {
                    $scope.getQuestionPrereqs();
                });
            }
        };

        $scope.getQuestionOnQuestionnaire = function () {
            $scope.available.length = 0;
            QuestionnaireService.getQuestionnaireQuestions({questionnaireId: $scope.selectedQuestionnaire.id}, function (data) {
                $scope.available = data;
            });
        };

        $scope.getQuestionPrereqs = function () {
            $scope.active.length = 0;
            QuestionnaireService.getQuestionPrereqs({
                    questionnaireId: $scope.selectedQuestionnaire.id,
                    categoryId: $scope.selectedCategory.id,
                    questionId: $scope.selectedQuestion.id,
                    scoreType: $scope.selectedWeightLabel.value
                }
                , function (data) {
                    $scope.active = data;
                    $scope.matchWithAvailable();
                });
        };

        $scope.matchWithAvailable = function () {
            angular.forEach($scope.active, function (elem, index) {
                elem.requiredQuestion = angular.copy($scope.searchArrayForProperty($scope.available, "id", elem.requiredQcategory_questionId)[0]);
            });
        };

        $scope.saveQuestionPrereqs = function () {
            QuestionnaireService.updateQuestionPrereqs({
                    questionnaireId: $scope.selectedQuestionnaire.id,
                    categoryId: $scope.selectedCategory.id,
                    questionId: $scope.selectedQuestion.id,
                    scoreType: $scope.selectedWeightLabel.value
                }
                , $scope.active, function (data) {
                    $scope.addAlert('Saved', 'success', 5000);
                    $scope.active = data;
                    $scope.matchWithAvailable();
                }, function (httpStatus) {
                    $scope.addAlert('Error Saving!', 'danger', 5000);
                });
        };

        $scope.chooseQuestionPrereq = function (questionPrereq) {
            if ($scope.searchArrayForProperty($scope.active, 'requiredQcategory_questionId', questionPrereq.id).length == 0) {
                var q_questionPrereq = {};
                q_questionPrereq.qcategory_questionId = $scope.selectedQuestion.id;
                q_questionPrereq.requiredQuestionValue = "true";
                q_questionPrereq.requiredQcategory_questionId = questionPrereq.id;
                q_questionPrereq.scoreType = $scope.selectedWeightLabel.value;

                q_questionPrereq.question = angular.copy($scope.selectedQuestion);
                q_questionPrereq.requiredQuestion = angular.copy(questionPrereq);

                $scope.active.push(q_questionPrereq);
            }
        };

        $scope.checkIfSaved = function (bypass) {
            var good = true;
            if (bypass) {
                return good;
            } else {
                angular.forEach($scope.active, function (item, index) {
                    if (!angular.isNumber(item.id)) {
                        $scope.addAlert('You must save your changes before editing the questionnaire further', 'warning', 10000);
                        good = false;
                    }
                });

                return good;
            }
        };

        $scope.chooseDropbox = function () {
            $("#createOptionModal").modal('hide');
            $("#dropboxModal").modal('show');
        };

        $scope.chooseCertificationPicker = function () {
            $("#createOptionModal").modal('hide');
            $("#weightsModal").modal('show');
        };

        $scope.$on('event:questionnaireEditMode', function (event) {
            $scope.editMode = true;
            // This will cause a confirmation dialog to popup when a user tries to reload or close the page
            /*window.onbeforeunload = function(){
             return 'All unsaved changes will be lost!';
             };*/
        });

        $scope.$on('event:questionnaireSaved', function (event) {
            $scope.editMode = false;
            // This will remove the confirmation dialog
            window.onbeforeunload = undefined;
        });

        $scope.$on($scope.EVENT_ON_LAST_REPEAT, function (event) {
            $('.qAdminCollapse').collapse({
                toggle: true
            });
        });

        $scope.getQuestionnaireDropboxes = function () {
            DropboxService.findQuestionnaireDropboxes({}, function (data) {
                $scope.optionsDropboxes = data;
            });
        };

        $scope.selectDropbox = function (dropbox) {
            $scope.selectedOption.dropbox = dropbox;
            $('#dropboxModal').modal('hide');

            // Prevent creation modal from displaying when editing an option
            if (angular.isUndefined($scope.selectedOption.id)) {
                $('#createOptionModal').modal('show');
            }
        };

        $scope.selectCertificationWeight = function (weight) {
            $scope.selectedOption.certificationWeight = weight;
            $('#weightsModal').modal('hide');

            // Prevent creation modal from displaying when editing an option
            if (angular.isUndefined($scope.selectedOption.id)) {
                $('#createOptionModal').modal('show');
            }
        };

        $scope.getMaximumScore = function (scoreType) {
            QuestionnaireService.getMaxScoreFromType({
                questionnaireId: $scope.selectedQuestionnaire.id,
                scoreType: scoreType
            }, function (data) {
                $scope.maximumScores[scoreType] = data.maxScore;
            })
        };

        $scope.openQuestionnaireCompletenessModal = function () {

            var questionnaireId = $scope.selectedQuestionnaire.id;
            var questionnairePropertyExclusions = $scope.selectedQuestionnaire.propertyExclusions;

            var modalInstance = $modal.open({
                templateUrl: 'questionnaireCompletenessModal.html',
                controller: 'QuestionnaireCompletenessModalCtrl',
                windowClass: 'preview-record-modal-window',
                resolve: {
                    questionnaireId: function () {
                        return questionnaireId;
                    },
                    questionnairePropertyExclusions: function () {
                        return questionnairePropertyExclusions;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                // $scope.selected = selectedItem;
            }, function () {
                // $log.info('Modal dismissed at: ' + new Date());
            });

        };

        var getLegacyPropertyOwners = function () {
            return $http.get(contextPath + '/webapi/properties/owners').success(function (data, status, headers, config) { //$http much better at handling plain text responses
                $scope.propertyOwners = data;
            }).error(function (data, status, headers, config) {

            });
        };

        var getPropertyTypes = function () {
            return $http.get(contextPath + '/webapi/properties/types').success(function (data, status, headers, config) { //$http much better at handling plain text responses
                $scope.propertyTypes = data;
            }).error(function (data, status, headers, config) {

            });
        };

        var getPropertyUnits = function () {
            return $http.get(contextPath + '/webapi/properties/units').success(function (data, status, headers, config) { //$http much better at handling plain text responses
                $scope.propertyUnits = data;
            }).error(function (data, status, headers, config) {

            });
        };

        $scope.updateQuestionnairePropertyExclusions = function () {
            var excludedPropertyNumbers = $scope.getPropertyNumbers($scope.excludedProperties);

            var data = JSON.stringify({
                excludedProperties: excludedPropertyNumbers,
                excludedOwners: $scope.excludedOwners,
                excludedTypes: $scope.excludedTypes,
                excludedUnits: $scope.excludedUnits
            });

            QuestionnaireService.updatePropertyExclusions({questionnaireId: $scope.selectedQuestionnaire.id}, data, function () {
                $scope.selectedQuestionnaire.propertyExclusions = data;
            });
        };

        $scope.selectYesNoNaRequired = function (q, answer) {
            var indexANR = q.validAnswersList.indexOf($scope.validAnswersEnum.NR);
            if (indexANR > -1) {
                q.validAnswersList.splice(indexANR, 1);
            }

            var indexAnswer = q.validAnswersList.indexOf(answer);
            if (indexAnswer === -1) {
                q.validAnswersList.push(answer);
            } else {
                q.validAnswersList.splice(indexAnswer, 1);
            }
        };

        $scope.selectAnswerNotRequired = function (q) {
            q.validAnswersList.splice(0, q.validAnswersList.length, $scope.validAnswersEnum.NR);
            q.required = false;
        };

        $scope.setQuestionnaireSubTypes = function () {
            var propertyIdx = 0, yearlyIdx = 0, gresbIdx = 1;

            if ($scope.selectedQuestionnaire.group.questionnaireType === $scope.dropboxes['questionnaireTypes'].itemMap[propertyIdx].value) {
                $scope.questionnaireSubTypes = $scope.dropboxes['questionnaireSubTypes'].itemMap;
            } else {
                if ($scope.selectedQuestionnaire.group.questionnaireType === $scope.dropboxes['questionnaireTypes'].itemMap[gresbIdx].value) {
                    $scope.questionnaireSubTypes = [$scope.dropboxes['questionnaireSubTypes'].itemMap[yearlyIdx]];
                } else {
                    $scope.questionnaireSubTypes.length = 0;
                }
            }
        };

        $scope.createNewChecklistProgram = function() {
            ChecklistProgramService.create({}, function (data) {
                $scope.selectedProgram = angular.copy(data);

            }, function (ignoreHttpResponse) {
                $scope.loading = false;
                $scope.addAlert('There was an error initializing the form to create a new survey!', 'danger', 10000);

            });
        };

        $scope.getAllQuestionnaires();

        $scope.allModules();

        getLegacyPropertyOwners();
        getPropertyTypes();
        getPropertyUnits();
        $scope.getQuestionnaireDropboxes();
        $scope.loadDropboxes(['module', 'questionnaireSubTypes', 'months', 'questionnaireTypes', 'questionAnswer', 'optionsType', 'questionnaireReportType']);

    }])
    .controller('ScoringPreRequisiteQuestionsModalCtrl', ['$scope', 'questionnaireId', 'weighting', 'printPreReq', '$uibModalInstance', 'QuestionnaireService', function ($scope, questionnaireId, weighting, printPreReq, $modalInstance, QuestionnaireService) {

        $scope.questionnaireId = questionnaireId;
        $scope.weighting = weighting;

        $scope.preRequisiteQuestionsTableData = [];

        $scope.setPreRequisiteQuestionsTableData = function (tableData) {
            $scope.preRequisiteQuestionsTableData = tableData;
        };

        $scope.loadPreRequisiteQuestionsTableData = function () {
            QuestionnaireService.getScoringPreRequisiteQuestionsTableData({
                questionnaireId: $scope.questionnaireId,
                weighting: $scope.weighting

            }, function (data) {
                $scope.setPreRequisiteQuestionsTableData(data);

            }, function (httpStatus) {
                // Error
            });
        };

        $scope.printPreReq = printPreReq;

        $scope.loadPreRequisiteQuestionsTableData();

        $scope.close = function () {
            $modalInstance.dismiss('close');
        };

    }])
    .controller('ScoringConfigurationModalCtrl', ['$scope', 'QuestionnaireService', 'ControllerInfoPasser', 'questionnaireId', 'weighting', '$uibModalInstance', function ($scope, QuestionnaireService, ControllerInfoPasser, questionnaireId, weighting, $modalInstance) {
        $scope.questionnaireId = questionnaireId;
        $scope.weighting = weighting;
        $scope.categories = [];

        $scope.getDisplayableOptionAnswerMap = function (answerMap) {
            var answerMapKeyArray = Object.keys(answerMap);
            var displayableAnswerMaps = [];
            for (var x = 0; x < answerMapKeyArray.length; x++) {
                var displayableAnswerMapObject = {
                    answerKey: "",
                    answerScore: ""
                };
                displayableAnswerMapObject["answerKey"] = answerMapKeyArray[x];
                displayableAnswerMapObject["answerScore"] = answerMap[answerMapKeyArray[x]];
                displayableAnswerMaps.push(displayableAnswerMapObject);
            }
            return displayableAnswerMaps;
        };

        $scope.setQuestionWeighting = function (weightings, question, category) {
            for (var x = 0; x < $scope.categories.length; x++) {
                if ($scope.categories[x].id == category.id) {

                    for (var i = 0; i < $scope.categories[x].questions.length; i++) {
                        if ($scope.categories[x].questions[i].id == question.id) {
                            $scope.categories[x].questions[i].weightings = weightings;
                            break;
                        }
                    }
                    break;
                }
            }
        };

        $scope.loadQuestionWeighting = function (question, category) {
            QuestionnaireService.getQuestionWeightingsByType({
                questionnaireId: $scope.questionnaireId,
                categoryId: category.id,
                questionId: question.id,
                scoreType: $scope.weighting

            }, function (data) {
                $scope.setQuestionWeighting(data, question, category);

            }, function (httpStatus) {
                // Error
            });
        };

        $scope.setQuestionOptionWeighting = function (weightings, option, question, category) {
            for (var x = 0; x < $scope.categories.length; x++) {
                if ($scope.categories[x].id == category.id) {

                    for (var i = 0; i < $scope.categories[x].questions.length; i++) {
                        if ($scope.categories[x].questions[i].id == question.id) {

                            for (var y = 0; y < $scope.categories[x].questions[i].options.length; y++) {
                                if ($scope.categories[x].questions[i].options[y].id == option.id) {

                                    for (var n = 0; n < weightings.length; n++) {
                                        weightings[n].answerMap = $scope.getDisplayableOptionAnswerMap(weightings[n].answerMap);
                                    }
                                    $scope.categories[x].questions[i].options[y].weightings = weightings;
                                    break;
                                }
                            }
                            break;
                        }
                    }
                    break;
                }
            }
        };

        $scope.loadQuestionOptionWeighting = function (option, question, category) {
            QuestionnaireService.getOptionWeightings({
                questionnaireId: $scope.questionnaireId,
                categoryId: category.id,
                questionId: question.id,
                optionId: option.id,
                scoreType: $scope.weighting

            }, function (data) {
                $scope.setQuestionOptionWeighting(data, option, question, category);

            }, function (httpStatus) {
                // Error
            });
        };

        $scope.setQuestionOptions = function (options, question, category) {
            for (var x = 0; x < $scope.categories.length; x++) {
                if ($scope.categories[x].id == category.id) {
                    for (var i = 0; i < $scope.categories[x].questions.length; i++) {
                        if ($scope.categories[x].questions[i].id == question.id) {
                            $scope.categories[x].questions[i].options = [];
                            $scope.categories[x].questions[i].options = options;
                            break;
                        }
                    }
                    break;
                }
            }
        };

        $scope.loadQuestionOptions = function (question, category) {
            QuestionnaireService.getScoringConfigurationQuestionOptions({
                questionnaireId: $scope.questionnaireId,
                categoryId: category.id,
                questionId: question.id,
                weighting: $scope.weighting

            }, function (data) {
                /*console.log( data );
                 console.log( question );*/
                $scope.setQuestionOptions(data, question, category);

            }, function (httpStatus) {
                // Error
            });
        };

        $scope.setQuestions = function (questions) {
            if (questions.length > 0) {
                var categoryId = questions[0].qcategoryID;
                for (var x = 0; x < $scope.categories.length; x++) {
                    if ($scope.categories[x].id == categoryId) {
                        $scope.categories[x].questions = [];
                        $scope.categories[x].questions = questions;
                        break;
                    }
                }
            }
        };

        $scope.loadQuestions = function () {
            for (var x = 0; x < $scope.categories.length; x++) {
                QuestionnaireService.getScoringConfigurationQuestions({
                    questionnaireId: $scope.questionnaireId,
                    categoryId: $scope.categories[x].id,
                    weighting: $scope.weighting

                }, function (data) {
                    $scope.setQuestions(data);

                }, function (httpStatus) {
                    // Error
                });
            }
        };

        $scope.setCategories = function (categories) {
            $scope.categories = categories;
            $scope.loadQuestions();
        };

        $scope.loadCategories = function () {
            QuestionnaireService.getScoringConfigurationCategories({
                questionnaireId: $scope.questionnaireId,
                weighting: $scope.weighting

            }, function (data) {
                $scope.setCategories(data);

            }, function (httpStatus) {
                // Error
            });
        };

        $scope.configurationTableData = [];

        $scope.setConfigurationTableData = function (tableData) {
            $scope.configurationTableData = tableData;
        };

        $scope.loadConfigurationTableData = function () {
            QuestionnaireService.getScoringConfigurationTableData({
                questionnaireId: $scope.questionnaireId,
                weighting: $scope.weighting

            }, function (data) {
                $scope.setConfigurationTableData(data);

            }, function (httpStatus) {
                // Error
            });
        };

        $scope.loadCategories();
        $scope.loadConfigurationTableData();

        $scope.printScoringConfigurationModal = function () {

            var table = document.getElementById("scoringConfigurationModal");

            var domClone = table.cloneNode(true);

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

            $printSection.appendChild(domClone);
            window.print();
        };

        $scope.close = function () {
            $modalInstance.dismiss('close');
        };


    }])
    .controller('QuestionnaireCompletenessModalCtrl', ['$scope', 'PropertyLookup', 'QuestionnaireService', 'ControllerInfoPasser', 'SelectedProperty', 'questionnaireId', 'questionnairePropertyExclusions', '$uibModalInstance', '$q', '$http', 'contextPath', function ($scope, PropertyLookup, QuestionnaireService, ControllerInfoPasser, SelectedProperty, questionnaireId, questionnairePropertyExclusions, $modalInstance, $q, $http, contextPath) {
        $scope.selectedWeighting = undefined;
        $scope.questionnaireId = questionnaireId;
        $scope.currentProperty = SelectedProperty.getSelectedProperty();

        if (angular.isDefined(questionnairePropertyExclusions)) {
            $scope.questionnairePropertyExclusions = JSON.parse(questionnairePropertyExclusions);
        } else {
            $scope.questionnairePropertyExclusions = {};
        }

        $scope.printQuestionnaireCompletenessTable = function () {

            var table = document.getElementById("questionnaireCompletenessTable");

            var domClone = table.cloneNode(true);

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

            $printSection.appendChild(domClone);
            window.print();
        };

        $scope.close = function () {
            $modalInstance.dismiss('close');
        };

    }])
    .controller('QuestionnaireCompletenessModalHelperCtrl', ['$scope', 'PropertyLookup', 'QuestionnaireService', 'ControllerInfoPasser', 'SelectedProperty', '$q', '$http', 'contextPath', '$timeout', function ($scope, PropertyLookup, QuestionnaireService, ControllerInfoPasser, SelectedProperty, $q, $http, contextPath, $timeout) {
        $scope.propertyList = [];
        $scope.selectedPropertyList = [];
        $scope.weightings = [];
        $scope.questionnaireCompletenessList = [];
        $scope.questionnaireCompletenessMasterData = [];

        $scope.previousSelectedPropertyList = angular.copy($scope.selectedPropertyList);
        $scope.questionnaireCompletenessDataLoading = false;

        $scope.loadWeightingsList = function () {
            QuestionnaireService.getWeightingsOnQuestionnaire({questionnaireId: $scope.questionnaireId}, function (data) {
                $scope.weightings = data;
                for (var x = 0; x < $scope.weightings.length; x++) {
                    var str = angular.copy($scope.weightings[x].title);
                    $scope.weightings[x]["label"] = str.replace(/_/g, ' ');
                }

                var total = {
                    title: "TOTAL_WEIGHT",
                    label: "ALL"
                };

                $scope.selectedWeighting = total.title;
                $scope.weightings.push(total);

                $scope.weightings.sort(function (a, b) {
                    return a.label.localeCompare(b.label);
                });

            });
        };

        $scope.loadWeightingsList();

        $scope.loadPropertiesForSelection = function () {

            var propertyNumbers = $.param({propertyNumbers: $scope.questionnairePropertyExclusions.excludedProperties}, true);
            var types = $.param({types: $scope.questionnairePropertyExclusions.excludedTypes}, true);
            var units = $.param({units: $scope.questionnairePropertyExclusions.excludedUnits}, true);
            var owners = $.param({owners: $scope.questionnairePropertyExclusions.excludedOwners}, true);

            var excluded = types + "&" + units + "&" + owners + "&" + propertyNumbers;

            $http({
                method: 'POST',
                url: contextPath + '/webapi/properties/all/excluding',
                data: excluded,
                headers: {'Content-Type': 'administration/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            }).success(function (data) {
                if ($scope.currentProperty) {
                    var selectedProperty = $scope.searchArrayForProperty(data, 'propertyNumber', $scope.currentProperty.propertyNumber)[0];
                    if (angular.isDefined(selectedProperty)) {
                        $scope.selectedPropertyList.push(selectedProperty);
                    }
                }
                $scope.propertyList = data;
            }).error(function () {
                $scope.propertyList = [];

            });
        };

        $scope.loadPropertiesForSelection();

        $scope.animatingRefresh = false;
        $scope.showRecordRefreshAnimation = function () {
            $scope.animatingRefresh = true;
            $timeout(function () {
                $scope.animatingRefresh = false;
            }, 1000);
        };

        $scope.getQuestionnaireCompleteness = function () {
            // console.log( JSON.stringify( $scope.selectedPropertyList ) + " and " + JSON.stringify( $scope.previousSelectedPropertyList ) );
            var array1 = angular.copy($scope.selectedPropertyList);
            var array2 = angular.copy($scope.previousSelectedPropertyList);
            array1 = array1.sort();
            array2 = array2.sort();

            if (angular.equals(array1, array2) == false) {
                // Request for questionnaire completeness data from the server here...
                var questionnaireCompletenessURL = contextPath + '/webapi/properties/questionnaire/' + $scope.questionnaireId + "/completeness";
                var propertyNumbers = $scope.extractListOfPropertyNumbers($scope.selectedPropertyList);
                $scope.questionnaireCompletenessDataLoading = true;
                $scope.previousSelectedPropertyList = angular.copy($scope.selectedPropertyList);
                $q.all([
                    $http.put(questionnaireCompletenessURL, propertyNumbers)
                        .success(function (data) {
                            $scope.questionnaireCompletenessList = data;
                        })
                ]).then(function () {
                    $scope.questionnaireCompletenessDataLoading = false;

                }, function (httpResponse) {
                    $scope.questionnaireCompletenessDataLoading = false;
                    var errorMsg;
                    switch (httpResponse.status) {
                        case 401:
                            errorMsg = "Current user is not allowed to see questionnaire completeness!";
                            $scope.addAlert(errorMsg, "warning");
                            break;
                        default:
                            errorMsg = "An error occurred while trying to get questionnaire completeness data!";
                            $scope.addAlert(errorMsg, "danger");
                            break;
                    }
                });

            }
        };

        $scope.exportExcelQuestionnaireCompleteness = function () {

            var questionnaireCompletenessURL = contextPath + '/webapi/properties/questionnaire/' + $scope.questionnaireId + '/' + $scope.selectedWeighting + "/completeness/excel";
            var propertyNumbers = $scope.extractListOfPropertyNumbers($scope.selectedPropertyList);

            var data = {
                propertyNumbers: propertyNumbers
            };

            $scope.openInNewWindow('POST', questionnaireCompletenessURL, data);

        };

        $scope.predicate = ["propertyName"];

    }])
    .controller('QuestionnaireReportConfigCtrl', ['$scope', 'QuestionnaireService', 'QuestionnaireReportConfigService', function ($scope, QuestionnaireService, QuestionnaireReportConfigService) {
        $scope.selectedConfiguration = {};
        $scope.questions = [];
        $scope.options = [];
        $scope.reportConfigurations = [];
        $scope.reportFilter = "QUESTION";
        $scope.fullQuestionnaire = undefined;

        $scope.getReportConfigurations = function () {
            $scope.loading = true;
            $scope.reportConfigurations.length = 0;
            QuestionnaireReportConfigService.findByQuestionnaireId({
                questionnaireId: $scope.selectedQuestionnaire.id,
                reportType: $scope.reportFilter
            }, function (data) {
                $scope.loading = false;
                $scope.reportConfigurations = data;
            }, function (httpResponse) {
                $scope.loading = false;
            })
        };

        $scope.getQuestionnaireQuestionsAndOptions = function () {
            $scope.questions.length = 0;
            $scope.options.length = 0;

            QuestionnaireService.getQuestionnaireQuestions({questionnaireId: $scope.selectedQuestionnaire.id}, function (data) {
                $scope.questions = data;
            });

            QuestionnaireService.getOptionsOnQuestionnaire({questionnaireId: $scope.selectedQuestionnaire.id}, function (data) {
                $scope.options = data;
            });
        };

        $scope.saveReportConfig = function () {
            if (angular.isDefined($scope.selectedConfiguration.id)) {
                QuestionnaireReportConfigService.update({}, $scope.selectedConfiguration, function (data) {
                    $scope.getReportConfigurations();
                }, function (httpResponse) {
                    $scope.addAlert('An error has occurred trying to saving the report configuration!', 'danger');
                });
            } else {
                QuestionnaireReportConfigService.save({}, $scope.selectedConfiguration, function (data) {
                    $scope.getReportConfigurations();
                }, function (httpResponse) {
                    $scope.addAlert('An error has occurred trying to saving the report configuration!', 'danger');
                });
            }
        };

        $scope.deleteConfiguration = function () {
            QuestionnaireReportConfigService.delete({id: $scope.selectedConfiguration.id}, function (data) {
                $scope.getReportConfigurations();
            }, function (httpResponse) {
                $scope.addAlert('An error has occurred trying to delete the report configuration!', 'danger');
            });
        };

        $scope.openConfiguration = function (config) {
            $scope.questionFilter = undefined;

            if (angular.isDefined(config)) {
                $scope.selectedConfiguration = angular.copy(config);
            } else {
                $scope.selectedConfiguration = {
                    questionnaire: $scope.selectedQuestionnaire,
                    reportType: $scope.reportFilter,
                    questions: [],
                    options: []
                }
            }
        };

        $scope.checkAll = function () {
            if ($scope.reportFilter === 'QUESTION') {
                angular.forEach($scope.filteredQuestions, function (question) {
                    var isInArr = $scope.searchArrayForProperty($scope.selectedConfiguration.questions, 'uuid', question.uuid).length;
                    if (isInArr == 0) {
                        $scope.selectedConfiguration.questions.push(question)
                    }
                });
            } else {
                angular.forEach($scope.filteredOptions, function (option) {
                    var isInArr = $scope.searchArrayForProperty($scope.selectedConfiguration.options, 'uuid', option.uuid).length;
                    if (isInArr == 0) {
                        $scope.selectedConfiguration.options.push(option)
                    }
                });
            }
        };
        $scope.uncheckAll = function () {
            if ($scope.reportFilter === 'QUESTION') {
                $scope.selectedConfiguration.questions = $scope.selectedConfiguration.questions.filter(function (element) {
                    return $scope.searchArrayForProperty($scope.filteredQuestions, 'uuid', element.uuid).length == 0;
                });
            } else {
                $scope.selectedConfiguration.options = $scope.selectedConfiguration.options.filter(function (element) {
                    return $scope.searchArrayForProperty($scope.filteredOptions, 'uuid', element.uuid).length == 0;
                });
            }
        };

        $scope.getQuestionnaireQuestionsAndOptions();
        $scope.getReportConfigurations();
    }]);
