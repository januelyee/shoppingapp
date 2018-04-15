/*
 *
 *  * Copyright (c) 2015. Refined Data Solutions. All Rights Reserved
 *
 */

/**
 * Created with JetBrains WebStorm.
 * User: Januel
 * Date: 06/11/13
 * Time: 2:07 PM
 * To change this template use File | Settings | File Templates.
 */

angular.module('myApp.environmentalControllers', [])
    .controller('EnvironmentalFormCtrl', ['$scope', '$http', 'SelectedProperty', 'ControllerInfoPasser', 'PropertyLookup', 'PropertyDocumentService', 'BuildingDocumentService', 'RegionDocumentService', 'FloorDocumentService', 'RoomDocumentService', 'contextPath', '$uibModal', 'GeneralDocumentService', 'GeneralTasksService', 'AuditLogService',
        function ($scope, $http, SelectedProperty, ControllerInfoPasser, PropertyLookup, PropertyDocumentService, BuildingDocumentService, RegionDocumentService, FloorDocumentService, RoomDocumentService, contextPath, $modal, GeneralDocumentService, GeneralTasksService, AuditLogService) {

            // $scope.currentProperty = SelectedProperty.getSelectedProperty();

            $scope.linkedDocuments = [];
            $scope.linkedTasks = [];
            $scope.linkedTasksOrder = ['-dueDate'];
            $scope.unlockWholeScreen();

            $scope.$on($scope.EVENT_CHANGE_PROPERTY, function () {
                $scope.changeMenuItem($scope.selectedEnvironmentalMenuItem);
            });

            $scope.finishTransaction = function (transactionType) {
                $scope.unlockWholeScreen();
                if (transactionType == "save") {
                    $scope.addAlert('Successfully saved record for property: ' + $scope.currentProperty.propertyNumber, 'success', $scope.DEFAULT_ALERT_LENGTH);
                    $scope.nextAction = null;
                    $scope.action = 'Saved';

                } else {
                    if (transactionType == "update") {
                        $scope.addAlert('Successfully updated record for property: ' + $scope.currentProperty.propertyNumber, 'success', $scope.DEFAULT_ALERT_LENGTH);
                        $scope.nextAction = null;
                        $scope.action = 'Saved';

                    } else {
                        $scope.addAlert('Successfully removed record for property: ' + $scope.currentProperty.propertyNumber, 'success', $scope.DEFAULT_ALERT_LENGTH);
                        $scope.nextAction = null;
                        $scope.action = 'Deleted';
                    }
                }

                $scope.clearFormObject();
                $scope.changeMenuItem($scope.selectedEnvironmentalMenuItem);
            };

            $scope.submitRecord = function () {
                var transactionType = "save";
                if ($scope.form.$valid) {
                    // var propertyNumber = $scope.currentProperty.propertyNumber;
                    if ($scope.currentProperty) {

                        $scope.lockWholeScreen();

                        var entry = [];
                        var sectionIdList = [];

                        for (var mapKey in $scope.document) {
                            if ($scope.document[mapKey]) {
                                entry.push({key: mapKey, value: $scope.document[mapKey]});
                                sectionIdList.push({documentType_FK: $scope.record.typeId, section: mapKey});
                            }
                        }

                        var sectionContentsMap = {};
                        var active = "ACTIVE";
                        sectionContentsMap.entry = entry;
                        var document = {
                            description: $scope.record.recordDescription,
                            parentName: " ",
                            parentType: " ",
                            dateCreated: " ",
                            lastUpdated: " ",
                            parent_FK: " ",
                            parent_property_FK: " ",
                            propertyNumber: " ",
                            sectionContentsMap: sectionContentsMap,
                            title: $scope.record.title,
                            status: active,
                            type: {
                                id: $scope.record.typeId,
                                name: $scope.record.typeName,
                                documentTypeSectionsList: sectionIdList
                            },
                            attachments: $scope.attachments
                        };

                        document.dateCreated = new Date();
                        document.lastUpdated = new Date();
                        document.parent_property_FK = $scope.currentProperty.id;
                        document.propertyNumber = $scope.currentProperty.propertyNumber;
                        document.documentLinkList = $scope.documentLinkList;
                        if ($scope.isPropertyLevel()) {
                            // Attach document to property
                            document.parentName = $scope.currentPropertyComponent.name;
                            document.parentType = "Property";
                            document.parent_FK = $scope.currentPropertyComponent.id;
                            PropertyDocumentService.save({propertyId: $scope.currentPropertyComponent.id}, document, function (value, responseHeaders) {
                                // Success
                                $scope.finishTransaction(transactionType);
                            }, function (httpResponse) {
                                // Error
                                errorPersisting();
                                $scope.showToast('There was an error saving the record!', 'danger');
                            });

                        } else {
                            if ($scope.isBuildingLevel()) {
                                // Attach document to building
                                document.parentName = $scope.currentPropertyComponent.name;
                                document.parentType = "Building";
                                document.parent_FK = $scope.currentPropertyComponent.id;
                                BuildingDocumentService.save({buildingId: $scope.currentPropertyComponent.id}, document, function (value, responseHeaders) {
                                    // Success
                                    $scope.finishTransaction(transactionType);
                                }, function (httpResponse) {
                                    // Error
                                    errorPersisting();
                                    $scope.showToast('There was an error saving the record!', 'danger');
                                });

                            } else {
                                if ($scope.isRegionLevel()) {
                                    // Attach document to region
                                    document.parentName = $scope.currentPropertyComponent.name;
                                    document.parentType = "Region";
                                    document.parent_FK = $scope.currentPropertyComponent.id;
                                    RegionDocumentService.save({regionId: $scope.currentPropertyComponent.id}, document, function (value, responseHeaders) {
                                        // Success
                                        $scope.finishTransaction(transactionType);
                                    }, function (httpResponse) {
                                        // Error
                                        errorPersisting();
                                        $scope.showToast('There was an error saving the record!', 'danger');
                                    });

                                } else {
                                    if ($scope.isFloorLevel()) {
                                        // Attach document to floor
                                        document.parentName = $scope.currentPropertyComponent.name;
                                        document.parentType = "Floor";
                                        document.parent_FK = $scope.currentPropertyComponent.id;
                                        FloorDocumentService.save({floorId: $scope.currentPropertyComponent.id}, document, function (value, responseHeaders) {
                                            // Success
                                            $scope.finishTransaction(transactionType);
                                        }, function (httpResponse) {
                                            // Error
                                            errorPersisting();
                                            $scope.showToast('There was an error saving the record!', 'danger');
                                        });

                                    } else {
                                        // Attach document to room
                                        document.parentName = $scope.currentPropertyComponent.name;
                                        document.parentType = "Room";
                                        document.parent_FK = $scope.currentPropertyComponent.id;
                                        RoomDocumentService.save({roomId: $scope.currentPropertyComponent.id}, document, function (value, responseHeaders) {
                                            // Success
                                            $scope.finishTransaction(transactionType);
                                        }, function (httpResponse) {
                                            // Error
                                            errorPersisting();
                                            $scope.showToast('There was an error saving the record!', 'danger');
                                        });
                                    }
                                }
                            }
                        }

                    } else {
                        // No property selected
                        errorPersisting();
                        $scope.showToast('Please select a property before trying to add a record', 'danger');
                    }
                } else {
                    // Invalid form
                    errorPersisting();
                    $scope.showToast('One or more fields are missing and/or invalid', 'warning');
                }
            };

            $scope.deleteRecord = function () {
                var transactionType = "delete";
                var selectedDocument = ControllerInfoPasser.get('selectedDocument');
                if (selectedDocument.parentType == 'Property') {
                    // Delete document from property
                    $scope.lockWholeScreen();
                    PropertyDocumentService.delete({documentId: $scope.record.id}, function (value, responseHeaders) {
                        // Success
                        $scope.finishTransaction(transactionType);
                    }, function (httpResponse) {
                        // Error
                        errorPersisting();
                        $scope.showToast('There was an error deleting the record!', 'danger');
                    });
                } else {
                    if (selectedDocument.parentType == 'Building') {
                        // Delete document from building
                        $scope.lockWholeScreen();
                        BuildingDocumentService.delete({documentId: $scope.record.id}, $scope.record, function (value, responseHeaders) {
                            // Success
                            $scope.finishTransaction(transactionType);
                        }, function (httpResponse) {
                            // Error
                            errorPersisting();
                            $scope.showToast('There was an error deleting the record!', 'danger');
                        });

                    } else {
                        if (selectedDocument.parentType == 'Region') {
                            // Delete document from region
                            $scope.lockWholeScreen();
                            RegionDocumentService.delete({documentId: $scope.record.id}, $scope.record, function (value, responseHeaders) {
                                // Success
                                $scope.finishTransaction(transactionType);
                            }, function (httpResponse) {
                                // Error
                                errorPersisting();
                                $scope.showToast('There was an error deleting the record!', 'danger');
                            });

                        } else {
                            if (selectedDocument.parentType == 'Floor') {
                                // Delete document from floor
                                $scope.lockWholeScreen();
                                FloorDocumentService.delete({documentId: $scope.record.id}, $scope.record, function (value, responseHeaders) {
                                    // Success
                                    $scope.finishTransaction(transactionType);
                                }, function (httpResponse) {
                                    // Error
                                    $scope.showToast('There was an error deleting the record!', 'danger');
                                });

                            } else {
                                $scope.lockWholeScreen();
                                // Delete document from room
                                RoomDocumentService.delete({documentId: $scope.record.id}, $scope.record, function (value, responseHeaders) {
                                    // Success
                                    $scope.finishTransaction(transactionType);
                                }, function (httpResponse) {
                                    // Error
                                    $scope.showToast('There was an error deleting the record!', 'danger');
                                });
                            }
                        }
                    }
                }
            };

            $scope.updateRecord = function () {
                var transactionType = "update";
                if ($scope.form.$valid) {
                    // var propertyNumber = $scope.currentProperty.propertyNumber;
                    if ($scope.currentProperty) {
                        $scope.lockWholeScreen();

                        var entry = [];
                        var sectionIdList = [];

                        for (var mapKey in $scope.document) {
                            if ($scope.document[mapKey]) {
                                entry.push({key: mapKey, value: $scope.document[mapKey]});
                                sectionIdList.push({documentType_FK: $scope.record.typeId, section: mapKey});
                            }
                        }

                        var sectionContentsMap = {};
                        sectionContentsMap.entry = entry;

                        var selectedDocument = ControllerInfoPasser.get('selectedDocument');

                        selectedDocument.sectionContentsMap = sectionContentsMap;
                        selectedDocument.attachments = $scope.attachments;
                        selectedDocument.lastUpdated = new Date();
                        selectedDocument.parent_property_FK = $scope.currentProperty.id;
                        selectedDocument.documentLinkList = $scope.documentLinkList;
                        selectedDocument.propertyNumber = $scope.currentProperty.propertyNumber;
                        if (selectedDocument.parentType == 'Property') {
                            // Update property document
                            PropertyDocumentService.update(selectedDocument, function (value, responseHeaders) {
                                // Success
                                $scope.finishTransaction(transactionType);
                            }, function (httpResponse) {
                                // Error
                                errorPersisting();
                                $scope.showToast('There was an error updating the record!', 'danger');
                            });

                        } else {
                            if (selectedDocument.parentType == 'Building') {
                                // Update building document
                                BuildingDocumentService.update(selectedDocument, function (value, responseHeaders) {
                                    // Success
                                    $scope.finishTransaction(transactionType);
                                }, function (httpResponse) {
                                    // Error
                                    errorPersisting();
                                    $scope.showToast('There was an error updating the record!', 'danger');
                                });

                            } else {
                                if (selectedDocument.parentType == 'Region') {
                                    // Update region document
                                    RegionDocumentService.update(selectedDocument, function (value, responseHeaders) {
                                        // Success
                                        $scope.finishTransaction(transactionType);
                                    }, function (httpResponse) {
                                        // Error
                                        errorPersisting();
                                        $scope.showToast('There was an error updating the record!', 'danger');
                                    });

                                } else {
                                    if (selectedDocument.parentType == 'Floor') {
                                        // Update floor document
                                        FloorDocumentService.update(selectedDocument, function (value, responseHeaders) {
                                            // Success
                                            $scope.finishTransaction(transactionType);
                                        }, function (httpResponse) {
                                            // Error
                                            errorPersisting();
                                            $scope.showToast('There was an error updating the record!', 'danger');
                                        });

                                    } else {
                                        // Update room document
                                        RoomDocumentService.update(selectedDocument, function (value, responseHeaders) {
                                            // Success
                                            $scope.finishTransaction(transactionType);
                                        }, function (httpResponse) {
                                            // Error
                                            errorPersisting();
                                            $scope.showToast('There was an error updating the record!', 'danger');
                                        });
                                    }
                                }
                            }
                        }
                    } else {
                        // No property selected
                        $scope.showToast('Please select a property before trying to update a record', 'danger');
                        errorPersisting();
                    }
                } else {
                    // Invalid form
                    $scope.showToast('One or more fields are missing and/or invalid', 'warning');
                    errorPersisting();
                }
            };

            $scope.clearFormObject = function () {
                $scope.refreshPropertyInfo();
                $scope.attachments.length = 0;
                if ($scope.form) {
                    $scope.clearForm($scope.form, $scope.document);
                }

                if (ControllerInfoPasser.get('selectedDocumentForViewOnly')) {
                    $scope.isViewOnly = true;

                    var selectedDocument = ControllerInfoPasser.get('selectedDocumentForViewOnly');
                    $scope.document = selectedDocument.sectionContentsMap;
                    $scope.record = {};
                    $scope.record.parentName = selectedDocument.parentName;
                    $scope.record.id = selectedDocument.id;
                    $scope.record.dateCreated = selectedDocument.dateCreated;
                    $scope.record.breadcrumb = selectedDocument.breadcrumb;
                    $scope.attachments = selectedDocument.attachments;
                    $scope.documentLinkList = selectedDocument.documentLinkList;

                } else {
                    $scope.isViewOnly = false;
                    if (ControllerInfoPasser.get('selectedDocument')) {
                        var selectedDocument = ControllerInfoPasser.get('selectedDocument');
                        $scope.document = selectedDocument.values;
                        $scope.record = {};
                        $scope.record.parentName = selectedDocument.parentName;
                        $scope.record.id = selectedDocument.id;
                        $scope.record.dateCreated = selectedDocument.dateCreated;
                        $scope.record.breadcrumb = selectedDocument.breadcrumb;
                        $scope.attachments = selectedDocument.attachments;
                        $scope.documentLinkList = [];

                        $scope.refreshLinkedDocumentList();

                        $scope.action = 'Edit';
                    } else {
                        $scope.documentLinkList = [];
                        $scope.action = 'Add';
                    }
                }


            };

            $scope.refreshDocumentInfo = function () {
                $scope.currentProperty = SelectedProperty.getSelectedProperty();
                $scope.masterForm = {};

                if ($scope.document) {
                    // initialize the parent location here field here..
                } else {
                    $scope.document = angular.copy($scope.masterForm);
                }

            };

            $scope.$on('event:resetRecord', function () {
                $scope.clearFormObject();
            });

            $scope.$on('event:environmentalRecordSaved', function () {
                if ($scope.action == 'Saved') {
                    // $scope.refreshPropertyInfo();
                    // $scope.refreshRecordsInfo();
                }
            });

            $scope.$on('event:environmentalRecordDeleted', function () {
                if ($scope.action == 'Deleted') {
                    // $scope.refreshPropertyInfo();
                    // $scope.refreshRecordsInfo();
                }
            });

            $scope.$on('event:persistEnvironmentalRecord', function () {
                $scope.currentPropertyComponent = ControllerInfoPasser.get("currentPropertyComponent");
                $scope.selectedEnvironmentalMenuItem = ControllerInfoPasser.get("selectedEnvironmentalMenuItem");
                // $scope.selectedBuildingsOrRegions = ControllerInfoPasser.get( "selectedBuildingsOrRegions" );
                // $scope.selectedFloorsOrAreas = ControllerInfoPasser.get( "selectedFloorsOrAreas" );
                // $scope.selectedRooms = ControllerInfoPasser.get( "selectedRooms" );
                if ($scope.nextAction == 'Save') {
                    $scope.submitRecord();
                } else {
                    if ($scope.nextAction == 'Update') {
                        $scope.updateRecord();
                    }
                }

            });

            $scope.$on('event:deleteEnvironmentalRecord', function () {
                $scope.selectedEnvironmentalMenuItem = ControllerInfoPasser.get("selectedEnvironmentalMenuItem");
                $scope.selectedBuildingsOrRegions = ControllerInfoPasser.get("selectedBuildingsOrRegions");
                $scope.selectedFloorsOrAreas = ControllerInfoPasser.get("selectedFloorsOrAreas");
                $scope.selectedRooms = ControllerInfoPasser.get("selectedRooms");
                $scope.deleteRecord();
            });

            $scope.attachments = [];


            $scope.$on('event:localAttachmentOpen', function (event, attachment) {
                if (!attachment.id) {
                    return;
                }

                var selectedDocument = ControllerInfoPasser.get('selectedDocument');
                var level = angular.isDefined(attachment.level) ? attachment.level : selectedDocument.parentType;

                if (level === 'Property') {
                    level = 'propertydocuments';
                } else {
                    if (level === 'Building') {
                        level = 'buildingdocuments';
                    } else {
                        if (level === 'Floor') {
                            level = 'floordocuments';
                        } else {
                            // Room level
                            level = 'roomdocuments';
                        }
                    }
                }

                $scope.openInNewWindow('GET', contextPath + '/webapi/' + level + '/attachments/' + attachment.id, {}, '_blank');
            });

            var errorPersisting = function () {
                ControllerInfoPasser.broadcast('event:errorPersisting');
            };


            // Functions for linked document starts here

            $scope.previewDocument = function (document) {

                var formattedDocument = $scope.formatSingleEnvironmentalDocumentForDisplay(document);

                var modalInstance = $modal.open({
                    templateUrl: 'linkedDocumentPreviewModal.html',
                    controller: 'PreviewLinkedDocumentCtrl',
                    windowClass: 'preview-record-modal-window',
                    resolve: {
                        formattedDocument: function () {
                            return formattedDocument;
                        }
                    }
                });

                modalInstance.result.then(function (selectedItem) {
                    ControllerInfoPasser.clear('selectedDocumentForViewOnly');
                    // $scope.selected = selectedItem;
                }, function () {
                    ControllerInfoPasser.clear('selectedDocumentForViewOnly');
                    // $log.info('Modal dismissed at: ' + new Date());
                });

            };

            $scope.openListOfAvailableRecordsToLink = function () {
                var currentPropertyComponent = $scope.currentPropertyComponent;
                var selectedBuildingsOrRegions = $scope.selectedBuildingsOrRegions;
                var selectedFloorsOrAreas = $scope.selectedFloorsOrAreas;
                var selectedRooms = $scope.selectedRooms;
                var linkedDocumentList = $scope.linkedDocuments;

                var modalInstance = $modal.open({
                    templateUrl: 'availableRecordsToLinkModal.html',
                    controller: 'AvailableRecordsToLinkCtrl',
                    windowClass: 'preview-record-modal-window',
                    resolve: {
                        currentPropertyComponent: function () {
                            return currentPropertyComponent;
                        },
                        selectedBuildingsOrRegions: function () {
                            return selectedBuildingsOrRegions;
                        },
                        selectedFloorsOrAreas: function () {
                            return selectedFloorsOrAreas;
                        },
                        selectedRooms: function () {
                            return selectedRooms;
                        },
                        linkedDocumentList: function () {
                            return linkedDocumentList;
                        }

                    }
                });

                modalInstance.result.then(function (document) {
                    GeneralDocumentService.createDocumentLink({}, document, function (value, responseHeaders) {
                        // Success
                        ControllerInfoPasser.clear("selectedDocumentForViewOnly");
                        $scope.addLinkToDocument(value);

                    }, function (httpResponse) {
                        // Error
                        $scope.addAlert("Failed to create a link between the records!", "warning", $scope.DEFAULT_ALERT_LENGTH);
                    });

                }, function () {
                    ControllerInfoPasser.clear('selectedDocumentForViewOnly');
                    // $log.info('Modal dismissed at: ' + new Date());
                });

            };

            $scope.loadSingleLinkedDocument = function (documentLink) {

                var hasError = false;

                if (documentLink.linkedDocumentType == "PROPERTY_DOCUMENT") {
                    PropertyDocumentService.findDocumentById({documentId: documentLink.linkedDocumentId}, function (value, responseHeaders) {
                        // Success
                        $scope.linkedDocuments.push(value);
                    }, function (httpResponse) {
                        // Error
                        hasError = true;
                    });

                } else {
                    if (documentLink.linkedDocumentType == "BUILDING_DOCUMENT") {
                        BuildingDocumentService.findDocumentById({documentId: documentLink.linkedDocumentId}, function (value, responseHeaders) {
                            // Success
                            $scope.linkedDocuments.push(value);
                        }, function (httpResponse) {
                            // Error
                            hasError = true;
                        });

                    } else {
                        if (documentLink.linkedDocumentType == "FLOOR_DOCUMENT") {
                            FloorDocumentService.findDocumentById({documentId: documentLink.linkedDocumentId}, function (value, responseHeaders) {
                                // Success
                                $scope.linkedDocuments.push(value);
                            }, function (httpResponse) {
                                // Error
                                hasError = true;
                            });

                        } else {
                            if (documentLink.linkedDocumentType == "ROOM_DOCUMENT") {
                                RoomDocumentService.findDocumentById({documentId: documentLink.linkedDocumentId}, function (value, responseHeaders) {
                                    // Success
                                    $scope.linkedDocuments.push(value);
                                }, function (httpResponse) {
                                    // Error
                                    hasError = true;
                                });

                            } else {
                                if (documentLink.linkedDocumentType == "REGION_DOCUMENT") {
                                    RegionDocumentService.findDocumentById({documentId: documentLink.linkedDocumentId}, function (value, responseHeaders) {
                                        // Success
                                        $scope.linkedDocuments.push(value);
                                    }, function (httpResponse) {
                                        // Error
                                        hasError = true;
                                    });

                                } else {
                                    if (documentLink.linkedDocumentType == "AREA_DOCUMENT") {
                                        // No implementation for area documents yet.
                                        hasError = true;
                                    }
                                }
                            }
                        }
                    }
                }

                return hasError;
            };

            $scope.addLinkToDocument = function (documentLink) {
                $scope.documentLinkList.push(documentLink);
                $scope.loadSingleLinkedDocument(documentLink);
            };

            $scope.setLinkedDocumentList = function (documentLinkList) {
                $scope.documentLinkList = documentLinkList;
            };

            $scope.refreshLinkedDocumentList = function () {
                var selectedDocument = ControllerInfoPasser.get('selectedDocument');
                if (selectedDocument.parentType == 'Property') {
                    // Update property document
                    PropertyDocumentService.findDocumentById({documentId: selectedDocument.id}, function (value, responseHeaders) {
                        // Success
                        $scope.setLinkedDocumentList(value.documentLinkList);
                        $scope.loadLinkedDocuments();
                    }, function (httpResponse) {
                        // Error
                        errorPersisting();
                        $scope.addAlert('There was an error refreshing linked document list!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                    });

                } else {
                    if (selectedDocument.parentType == 'Building') {
                        // Update building document
                        BuildingDocumentService.findDocumentById({documentId: selectedDocument.id}, function (value, responseHeaders) {
                            // Success
                            $scope.setLinkedDocumentList(value.documentLinkList);
                            $scope.loadLinkedDocuments();
                        }, function (httpResponse) {
                            // Error
                            errorPersisting();
                            $scope.addAlert('There was an error refreshing linked document list!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                        });

                    } else {
                        if (selectedDocument.parentType == 'Region') {
                            // Update region document
                            RegionDocumentService.findDocumentById({documentId: selectedDocument.id}, function (value, responseHeaders) {
                                // Success
                                $scope.setLinkedDocumentList(value.documentLinkList);
                                $scope.loadLinkedDocuments();
                            }, function (httpResponse) {
                                // Error
                                errorPersisting();
                                $scope.addAlert('There was an error refreshing linked document list!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                            });

                        } else {
                            if (selectedDocument.parentType == 'Floor') {
                                // Update floor document
                                FloorDocumentService.findDocumentById({documentId: selectedDocument.id}, function (value, responseHeaders) {
                                    // Success
                                    $scope.setLinkedDocumentList(value.documentLinkList);
                                    $scope.loadLinkedDocuments();
                                }, function (httpResponse) {
                                    // Error
                                    errorPersisting();
                                    $scope.addAlert('There was an error refreshing linked document list!', 'danger');
                                });

                            } else {
                                if (selectedDocument.parentType == 'Area') {
                                    // TODO - implement update area document here..

                                } else {
                                    // Update room document
                                    RoomDocumentService.findDocumentById({documentId: selectedDocument.id}, function (value, responseHeaders) {
                                        // Success
                                        $scope.setLinkedDocumentList(value.documentLinkList);
                                        $scope.loadLinkedDocuments();
                                    }, function (httpResponse) {
                                        // Error
                                        errorPersisting();
                                        $scope.addAlert('There was an error refreshing linked document list!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                                    });

                                }
                            }
                        }
                    }
                }
            };

            $scope.documentLinkingDisabled = false;
            $scope.disableDocumentLinking = function (isDisabled) {
                $scope.documentLinkingDisabled = isDisabled;
            };

            $scope.isEnvironmentalReportRecord = function (document) {
                if (document.type.id == 22) {
                    return true;
                } else {
                    return false;
                }
            };

            $scope.getSpecificRecordFieldValue = function (key, document) {
                var value = "";
                if ($scope.isEnvironmentalReportRecord(document)) {
                    if (document.sectionContentsMap) {
                        value = document.sectionContentsMap[key];
                    }
                }

                return value;
            };

            $scope.linkedDocumentsTableRecordTypeColumnDisabled = false;
            $scope.disableRecordTypeColumn = function (disabled) {
                $scope.linkedDocumentsTableRecordTypeColumnDisabled = disabled;
            };

            $scope.documentHasSingleAttachmentOnly = function (document) {
                if (document.attachments) {
                    if (document.attachments.length == 1) {
                        return true;
                    } else {
                        return false;
                    }
                }
            };

            $scope.openDefaultLinkedDocumentAttachment = function (document) {
                var attachment = document.attachments[0];
                attachment.level = document.parentType;

                if ($scope.isSharePointEnabled == true) {
                    $scope.downloadSharePointFile(attachment.sharepointLink, attachment.fileName);
                } else {
                    $scope.downloadLocalAttachment(attachment);
                }
            };

            $scope.unlinkDocument = function (document) {

                var linkedDocumentParentType = document.parentType;
                var candidateLinkedDocumentType = "";
                if (linkedDocumentParentType == "Property") {
                    candidateLinkedDocumentType = "PROPERTY_DOCUMENT";

                } else {
                    if (linkedDocumentParentType == "Building") {
                        candidateLinkedDocumentType = "BUILDING_DOCUMENT";

                    } else {
                        if (linkedDocumentParentType == "Floor") {
                            candidateLinkedDocumentType = "FLOOR_DOCUMENT";

                        } else {
                            if (linkedDocumentParentType == "Room") {
                                candidateLinkedDocumentType = "ROOM_DOCUMENT";

                            } else {
                                if (linkedDocumentParentType == "Region") {
                                    candidateLinkedDocumentType = "REGION_DOCUMENT";

                                } else {
                                    if (linkedDocumentParentType == "Area") {
                                        candidateLinkedDocumentType = "AREA_DOCUMENT";

                                    }
                                }
                            }
                        }
                    }
                }

                // Find all document with the document id first
                var candidateDocumentLinks = [];
                for (var x = 0; x < $scope.documentLinkList.length; x++) {
                    if ($scope.documentLinkList[x].linkedDocumentId == document.id) {
                        candidateDocumentLinks.push($scope.documentLinkList[x]);

                    }
                }

                var selectedDocumentLink = undefined;
                for (var x = 0; x < candidateDocumentLinks.length; x++) {
                    if (candidateDocumentLinks[x].linkedDocumentType == candidateLinkedDocumentType) {
                        selectedDocumentLink = candidateDocumentLinks[x];
                    }
                }

                if (selectedDocumentLink) {
                    var position = $scope.documentLinkList.indexOf(selectedDocumentLink);
                    $scope.documentLinkList.splice(position, 1);
                }

                $scope.loadLinkedDocuments();

                /*var position = $scope.linkedDocuments.indexOf( document )
                 $scope.linkedDocuments.splice( position, 1 );*/

            };

            $scope.loadLinkedDocuments = function () {
                $scope.linkedDocuments = [];
                if (angular.isDefined($scope.documentLinkList)) {
                    for (var x = 0; x < $scope.documentLinkList.length; x++) {
                        var hasError = $scope.loadSingleLinkedDocument($scope.documentLinkList[x]);

                        if (hasError) {
                            $scope.addAlert("Failed to load linked records", "warning", $scope.DEFAULT_ALERT_LENGTH);
                            break;
                        }
                    }
                }
            };

            // Functions for linked document ends here

            $scope.getLinkedTasks = function () {
                var document = ControllerInfoPasser.get("selectedDocument");

                if (angular.isDefined(document)) {
                    $scope.linkedTasks.length = 0;
                    var entityClass = document.parentType + "Document";

                    GeneralTasksService.findLinkedEntities({
                        linkedEntityId: document.id,
                        linkedEntityClass: entityClass,
                        purposeToLinkedEntity: undefined
                    }, function (data) {
                        $scope.linkedTasks = data;
                    }, function (httpResponse) {
                        $scope.displayMessageInElement("#linkedTasksError", "An error has occurred getting the tasks associated with this record!", $scope.DEFAULT_ALERT_LENGTH);
                    });
                }
            };

            $scope.createTaskForRecord = function () {
                var document = ControllerInfoPasser.get('selectedDocument');

                if (angular.isUndefined(document.type.id)) {
                    $scope.addAlert('Record type is not recognized, cannot create a task for this record.', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                } else {
                    $http.get(contextPath + '/webapi/service/entity/fields/' + document.id + '/' + document.parentType + 'Document').success(function (documentData, status) {


                        GeneralTasksService.createTask({propertyNumber: $scope.currentProperty.propertyNumber}, function (data) {
                            var taskToCreate = angular.copy(data);
                            taskToCreate.hideFields = ["status", "createdBy", "module", "properties", "lastUpdated", "comments"];
                            taskToCreate.description = angular.copy(documentData);
                            taskToCreate.linkedEntityId = document.id;
                            taskToCreate.linkedEntityClass = document.parentType + "Document";
                            taskToCreate.module = $scope.moduleEnums.environmental;
                            taskToCreate.tags.push({
                                type: $scope.taskTagTypes.ENVIRONMENTAL_DOCUMENT_TYPE_ID,
                                value: document.type.id
                            });

                            ControllerInfoPasser.put('selectedTask', taskToCreate);

                            var modalInstance = $modal.open({
                                templateUrl: 'partials/taskFromRecordCreateModal.html',
                                controller: 'TaskCreateModalCtrl',
                                size: 'lg',
                                windowClass: 'standalone-report-modal-window',
                                scope: $scope,
                                resolve: {
                                    taskToCreate: function () {
                                        return taskToCreate;
                                    }
                                }
                            });

                            modalInstance.result.then(function (result) {
                                $scope.addAlert("Successfully created task '" + result.title + "'", 'success', 5000);
                                $scope.getLinkedTasks();
                            }, function () {
                                // On cancel -- Nothing to do
                            });

                        }, function (httpResponse) {
                            $scope.addAlert('There was a problem trying to create a task for this record', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                        });
                    }).error(function (status) {
                        $scope.addAlert('There was a problem trying to create a task for this record', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                    });
                }

            };

            $scope.getLinkedTasks();

            $scope.getSelectedProperty();
            $scope.loadDropboxes(['spillStatus', 'priority', 'boolean', 'environmentalIncidentType', 'causedBy', 'responsible', 'quantityUnit', 'infractionIssuedTo']);
        }])
    .controller('EnvironmentalDocumentListCtrl', ['$scope', 'SelectedProperty', 'ControllerInfoPasser', '$q', 'contextPath', '$filter', "BusinessContactService", function ($scope, SelectedProperty, ControllerInfoPasser, $q, contextPath, $filter, BusinessContactService) {

        $scope.extractTypeEnums = {
            REPORTS_BY_PROPERTY: "REPORTS_BY_PROPERTY",
            MISSING_REPORTS: "MISSING_REPORTS"
        };

        $scope.selectedOwners = [];
        $scope.owners = [];
        $scope.selectedReportTypes = [];
        $scope.reportTypes = [];

        $scope.excelExportReportTypeSelectionLabel = "Report Types";

        $scope.extractType = $scope.extractTypeEnums.REPORTS_BY_PROPERTY;

        ControllerInfoPasser.clear('selectedDocument');
//        $scope.loadDocuments( $scope.selectedBuildingsOrRegions, $scope.selectedFloorsOrAreas, $scope.selectedRooms );
        var defaultPredicates = ['location', '-dateCreated'];
        var defaultPredicatesEnvReports = ['-values.date'];

        var loadReportTypes = function () {
            $scope.reportTypes = $scope.dropboxes["reports"].itemMap;
        };

        $scope.loadDropboxes(["reports"], loadReportTypes);

        $scope.currentProperty = SelectedProperty.getSelectedProperty();

        //$scope.loadedDocuments = ControllerInfoPasser.get( "loadedListOfDocuments" );

        $scope.selectedMenuItem = ControllerInfoPasser.get("selectedEnvironmentalMenuItem");

        $scope.$on("event:loadedListOfDocumentsUpdated", function () {
            $scope.loadedDocuments = ControllerInfoPasser.get("loadedListOfDocuments");
            $scope.selectedMenuItem = ControllerInfoPasser.get("selectedEnvironmentalMenuItem");
            //$scope.formatEnvironmentalDocumentsForDisplay();
        });

        $scope.$on('event:currentPropertyComponentChanged', function (ignoreEvent, ignoreCategory) {
            $scope.loadDocumentsForType();
        });

        $scope.editRecord = function (document) {
            ControllerInfoPasser.clear("selectedDocument");
            ControllerInfoPasser.put("selectedDocument", document);
            ControllerInfoPasser.broadcast("event:editEnvironmentalRecord");
            $scope.changeMiddleSectionTo($scope.selectedMenuItem.inputPartialHTML);
        };

        $scope.resetTableDataOrder = function () {
            if ($scope.selectedMenuItem.label === 'Environmental Reports') {
                $scope.tableDataOrder = angular.copy(defaultPredicatesEnvReports);
            } else {
                $scope.tableDataOrder = angular.copy(defaultPredicates);
            }
        };

        $scope.loadDocumentsForType = function () {
            $scope.loadingDocuments = true;
            var type = $scope.selectedMenuItem.environmentalDocumentTypeId;
            $scope.loadedDocuments.length = 0;
            $scope.formattedEnvironmentalDocuments.length = 0;
            // use $q to wait for all asynchronous calls before formatting the records for display
            if ($scope.isPropertyLevel()) {

                if ($scope.selectedBuildingsOrRegions.name == 'All Buildings') { // Exclude property documents
                    $q.all([
                        $scope.loadDocumentsByBuildingIdAndType(SelectedProperty.getBuildingIds(), type),
                        $scope.loadDocumentsByFloorIdAndType(SelectedProperty.getFloorIds(), type),
                        $scope.loadDocumentsByRoomIdAndType(SelectedProperty.getRoomIds(), type)
                    ]).then(function () {
                        $scope.loadingDocuments = false;
                        $scope.formatEnvironmentalDocumentsForDisplay();
                    });
                } else {
                    $q.all([
                        $scope.loadDocumentsByPropertyIdAndType($scope.currentPropertyComponent.id, type),
                        $scope.loadDocumentsByBuildingIdAndType(SelectedProperty.getBuildingIds(), type),
                        $scope.loadDocumentsByFloorIdAndType(SelectedProperty.getFloorIds(), type),
                        $scope.loadDocumentsByRoomIdAndType(SelectedProperty.getRoomIds(), type)
                    ]).then(function () {
                        $scope.loadingDocuments = false;
                        $scope.formatEnvironmentalDocumentsForDisplay();
                    });
                }


            } else {
                var floorIds = [], roomIds = [];

                if ($scope.isBuildingLevel()) {
                    floorIds = [];
                    roomIds = [];
                    var j;

                    for (var i = 0; i < $scope.currentPropertyComponent.floorList.length; i++) {
                        var floor = $scope.currentPropertyComponent.floorList[i];
                        floorIds.push(floor.id);
                        for (j = 0; j < floor.roomList.length; j++) {
                            var room = floor.roomList[j];
                            roomIds.push(room.id);
                        }
                    }

                    if ($scope.selectedFloorsOrAreas.name == 'All Floors') { // Exclude building documents
                        $q.all([
                            $scope.loadDocumentsByFloorIdAndType(floorIds, type),
                            $scope.loadDocumentsByRoomIdAndType(roomIds, type)
                        ]).then(function () {
                            $scope.loadingDocuments = false;
                            $scope.formatEnvironmentalDocumentsForDisplay();
                        });
                    } else {
                        $q.all([
                            $scope.loadDocumentsByBuildingIdAndType($scope.currentPropertyComponent.id, type),
                            $scope.loadDocumentsByFloorIdAndType(floorIds, type),
                            $scope.loadDocumentsByRoomIdAndType(roomIds, type)
                        ]).then(function () {
                            $scope.loadingDocuments = false;
                            $scope.formatEnvironmentalDocumentsForDisplay();
                        });
                    }

                } else {
                    if ($scope.isFloorLevel()) {
                        roomIds = [];

                        for (j = 0; j < $scope.currentPropertyComponent.roomList.length; j++) {
                            var room = $scope.currentPropertyComponent.roomList[j];
                            roomIds.push(room.id);
                        }

                        if ($scope.selectedRooms.name == 'All Rooms') { //Exclude floor documents
                            $q.all([
                                $scope.loadDocumentsByRoomIdAndType(roomIds, type)
                            ]).then(function () {
                                $scope.loadingDocuments = false;
                                $scope.formatEnvironmentalDocumentsForDisplay();
                            });
                        } else {
                            $q.all([
                                $scope.loadDocumentsByFloorIdAndType($scope.currentPropertyComponent.id, type),
                                $scope.loadDocumentsByRoomIdAndType(roomIds, type)
                            ]).then(function () {
                                $scope.loadingDocuments = false;
                                $scope.formatEnvironmentalDocumentsForDisplay();
                            });
                        }

                    } else { // room level
                        $q.all([
                            $scope.loadDocumentsByRoomIdAndType($scope.currentPropertyComponent.id, type)
                        ]).then(function () {
                            $scope.loadingDocuments = false;
                            $scope.formatEnvironmentalDocumentsForDisplay();
                        });
                    }
                }
            }
        };

        $scope.fillArrayReportTypes = function () {
            $scope.selectedReportTypes.length = 0;

            if ($scope.extractType === $scope.extractTypeEnums.REPORTS_BY_PROPERTY) {
                for (var i = 0; i < $scope.reportTypes.length; i++) {
                    $scope.selectedReportTypes.push($scope.reportTypes[i]);
                }
            }
        };

        $scope.modalPropertiesSelectorVisible = function () {
            if (angular.isUndefined($scope.selectedOwners) || $scope.selectedOwners.length <= 0) {
                return true;
            }

            return false;
        };

        var loadAllOwners = function () {
            if ($scope.owners.length === 0) {
                BusinessContactService.query({}, function (data) {
                    $scope.owners = data;
                }, function (ignoreHttpResponse) {
                });
            }
        };

        $scope.loadExtractExcelModalData = function () {
            $scope.loadAllProperties();
            $scope.fillArrayReportTypes();
            loadAllOwners();
        };

        $scope.isReportTypeSelectorSingleSelect = function () {
            if ($scope.extractType === $scope.extractTypeEnums.MISSING_REPORTS) {
                return true;
            }

            return false;
        };

        $scope.getReportTypes = function (types) {
            var reportTypes = [];
            angular.forEach(types, function (type, index) {
                reportTypes.push(type.value);
            });

            return reportTypes;
        };

        $scope.selectExtractType = function () {
            if ($scope.extractType === $scope.extractTypeEnums.MISSING_REPORTS) {
                $scope.selectedReportTypes.length = 0;
                $scope.excelExportReportTypeSelectionLabel = "Report Type";
            } else {
                $scope.fillArrayReportTypes();
                $scope.excelExportReportTypeSelectionLabel = "Report Types";
            }
        };

        $scope.isExtractButtonDisabled = function () {
            var isReportDateFromFieldInvalid = angular.isUndefined($scope.from) || $scope.from === null || $scope.from === "";

            var areReportTypesOrPropertiesNotSelected = ($scope.selectedProperties.length === 0 || $scope.selectedReportTypes.length === 0);

            var isTypedMissingReports = ($scope.extractType === $scope.extractTypeEnums.MISSING_REPORTS);
            var isReportsOptionMandatoryFieldsNotFilledIn = false;
            if (isTypedMissingReports) {
                isReportsOptionMandatoryFieldsNotFilledIn = ($scope.selectedReportTypes.length < 1 || isReportDateFromFieldInvalid || !$scope.form.from.$valid);
            }

            return areReportTypesOrPropertiesNotSelected || isReportsOptionMandatoryFieldsNotFilledIn;
        };

        $scope.exportExcel = function () {

            var from = $filter('date')($scope.from, 'yyyy-MM-dd', $scope.getTimezoneOffset());
            var to = $filter('date')($scope.to, 'yyyy-MM-dd', $scope.getTimezoneOffset());

            var fromCreated;
            var toCreated;

            if (angular.isUndefined(from) || from === null) {
                from = '';
            }
            if (angular.isUndefined(to) || to === null) {
                to = '';
            }

            if (angular.isUndefined($scope.fromCreatedDate) || $scope.fromCreatedDate === null) {
                fromCreated = '';
            } else {
                fromCreated = $scope.fromCreatedDate;
            }

            if (angular.isUndefined($scope.toCreatedDate) || $scope.toCreatedDate === null) {
                toCreated = '';
            } else {
                toCreated = $scope.toCreatedDate;
            }

            if (new Date(from) > new Date(to)) {
                $scope.addAlert('From Report Date can not be past To Report Date', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                return;
            }

            var data = {
                properties: $scope.selectedProperties.map(function (property) {
                    return property.propertyNumber;
                }),
                ownerIds: $scope.selectedOwners.map(function (owner) {
                    return owner.id;
                }),
                types: $scope.getReportTypes($scope.selectedReportTypes),
                from: from,
                to: to,
                fromCreatedDate: fromCreated,
                toCreatedDate: toCreated
            };

            var docType = $scope.selectedMenuItem.environmentalDocumentTypeId;

            var url = contextPath + '/webapi/documents/export/excel/reports/' + docType + '/' + $scope.extractType;

            $scope.openInNewWindow('POST', url, data);
        };

        $scope.loadDocumentsForType();
        $scope.resetTableDataOrder();

        $scope.$on("event:buildingChange", function () {
            $scope.loadDocumentsForType();
        });

        $scope.$on("event:floorChange", function () {
            $scope.loadDocumentsForType();
        });

        $scope.$on("event:roomChange", function () {
            $scope.loadDocumentsForType();
        });
    }])
    .controller('EnvironmentalViewCtrl', ['$scope', '$http', 'SelectedProperty', 'ControllerInfoPasser', 'contextPath', 'SelectedProperty', 'DropboxLookup',
        function ($scope, $http, SelectedProperty, ControllerInfoPasser, contextPath, DropboxLookup) {

            $scope.noWritePermission = true;

            $scope.linkedDocumentPreviewBodySection = '';

            $scope.changedLinkedDocumentPreviewBodySection = function (section) {
                $scope.linkedDocumentPreviewBodySection = section;
            };

            ControllerInfoPasser.put("selectedDocumentForViewOnly", $scope.formattedDocument);

            $scope.changedLinkedDocumentPreviewBodySection($scope.getInputPartialHTML($scope.formattedDocument.type.name));

        }])
    .controller('PreviewLinkedDocumentCtrl', ['$scope', '$http', 'SelectedProperty', 'ControllerInfoPasser', '$uibModalInstance', 'formattedDocument', 'DropboxLookup', function ($scope, $http, SelectedProperty, ControllerInfoPasser, $modalInstance, formattedDocument, DropboxLookup) {

        $scope.formattedDocument = formattedDocument;

        // $scope.environmentalEnabled = true;

        $scope.formatDocumentValues = function (unformattedValues) {
            var formattedValues = {};
            if (unformattedValues.entry) {
                var entryArray = unformattedValues.entry;
                for (var x = 0; x < entryArray.length; x++) {
                    formattedValues[entryArray[x].key] = entryArray[x].value;
                }
            }

            return formattedValues;
        };

        $scope.formattedDocument.values = $scope.formatDocumentValues(formattedDocument.values);

        $scope.cancel = function () {
            ControllerInfoPasser.clear('selectedDocumentForViewOnly');
            $modalInstance.dismiss('cancel');
        };
    }])
    .controller('PreviewLinkedDocumentHelperCtrl', ['$scope', function ($scope) {
        // This controller is needed for constants that needs to be set from the GlobalCtrl.
        $scope.environmentalEnabled = true;

    }])
    .controller('AvailableRecordsToLinkCtrl', ['$scope', 'ControllerInfoPasser', '$q', '$uibModalInstance', 'currentPropertyComponent', 'selectedBuildingsOrRegions', 'selectedFloorsOrAreas', 'selectedRooms', 'PropertyDocumentService', 'BuildingDocumentService', 'FloorDocumentService', 'RoomDocumentService', 'DropboxLookup', 'linkedDocumentList',
        function ($scope, ControllerInfoPasser, $q, $modalInstance, currentPropertyComponent, selectedBuildingsOrRegions, selectedFloorsOrAreas, selectedRooms, PropertyDocumentService, BuildingDocumentService, FloorDocumentService, RoomDocumentService, DropboxLookup, linkedDocumentList) {

            /*$scope.currentPropertyComponent = currentPropertyComponent;*/
            $scope.linkedDocumentList = linkedDocumentList;
            ControllerInfoPasser.put("linkedDocumentList", $scope.linkedDocumentList);

            $scope.formattedDocument = {};

            $scope.isPreviewingRecord = false;
            $scope.viewRecordToLink = function (document) {
                // ControllerInfoPasser.put( "recordToView", document );
                $scope.formattedDocument = document;
                $scope.isPreviewingRecord = true;
            };

            $scope.backToAvailableDocuments = function () {
                $scope.isPreviewingRecord = false;
            };

            $scope.linkSelectedRecord = function (document) {
                $modalInstance.close(document);
            };

            $scope.cancel = function () {
                ControllerInfoPasser.clear('selectedDocumentForViewOnly');
                $modalInstance.dismiss('cancel');
            };

            $scope.isDocumentAvailable = function (document) {
                if (document.type.id != 22) {
                    return false;
                }
                var linkedDocumentList = ControllerInfoPasser.get("linkedDocumentList");
                var isAvailable = true;
                $scope.unavailableDocumentList = linkedDocumentList;
                for (var x = 0; x < $scope.unavailableDocumentList.length; x++) {
                    if (document.id == $scope.unavailableDocumentList[x].id && document.parentType == $scope.unavailableDocumentList[x].parentType) {
                        isAvailable = false;
                        break;
                    }
                }
                return isAvailable;
            };

        }])
    .controller('RecordsSummaryCtrl', ['$scope', '$http', 'SelectedProperty', 'ControllerInfoPasser', '$q', 'contextPath', '$filter', function ($scope, $http, SelectedProperty, ControllerInfoPasser, $q, contextPath, $filter) {

        var inputPartialPrefix = 'partials/environmental/';
        var miscReportDocumentsInputPartial = inputPartialPrefix + 'miscellaneousIssuesInput.html';
        var propertyHistoryInputPartial = inputPartialPrefix + 'propertyHistoryInput.html';
        var surroundingPropertiesInputPartial = inputPartialPrefix + 'surroundingPropertiesInput.html';
        var indoorAirInputPartial = inputPartialPrefix + 'indoorAirQualityInput.html';
        var asbestosInputPartial = inputPartialPrefix + 'asbestosMaterialInput.html';
        var pcbEquipmentInputPartial = inputPartialPrefix + 'pcbEquipmentInput.html';
        var pcbStorageInputPartial = inputPartialPrefix + 'pcbStorageLocationInput.html';
        var mouldInputPartial = inputPartialPrefix + 'mouldInput.html';
        var ozoneInputPartial = inputPartialPrefix + 'ozoneDepletingSubstancesInput.html';
        var radonInputPartial = inputPartialPrefix + 'radonInput.html';
        var secondaryHazardInputPartial = inputPartialPrefix + 'secondaryHazardousSubstancesInput.html';
        var materialsStorageInputPartial = inputPartialPrefix + 'materialsStorageInput.html';
        var ustsInputPartial = inputPartialPrefix + 'ustsInput.html';
        var astsInputPartial = inputPartialPrefix + 'astsInput.html';
        var containersInputPartial = inputPartialPrefix + 'containersInput.html';
        var sumpsInputPartial = inputPartialPrefix + 'sumpsInput.html';
        var hoistsInputPartial = inputPartialPrefix + 'hoistsInput.html';
        var dryCleaningSolventsInputPartial = inputPartialPrefix + 'dryCleaningSolventsInput.html';
        var investigationInputPartial = inputPartialPrefix + 'investigationInput.html';
        var remediationInputPartial = inputPartialPrefix + 'remediationInput.html';
        var spillsIncidentInputPartial = inputPartialPrefix + 'spillsIncidentsInput.html';
        var tenantRiskInputPartial = inputPartialPrefix + 'tenantRiskLevelsInput.html';
        var propertyReportDocumentsInputPartial = inputPartialPrefix + 'propertyReportDocumentsInput.html';

        // ControllerInfoPasser.clear( 'selectedDocument' );

        $scope.currentProperty = SelectedProperty.getSelectedProperty();

        var defaultPredicates = ['-dateCreated'];

        $scope.resetTableDataOrder = function () {
            $scope.tableDataOrder = angular.copy(defaultPredicates);
        };

        $scope.$on('event:currentPropertyComponentChanged', function (event, category) {
            $scope.loadRecordSummary();
        });

        $scope.loadRecordSummary = function () {
            $scope.loadingDocuments = true;
            $scope.loadedDocuments.length = 0;
            $scope.formattedEnvironmentalDocuments.length = 0;
            // use $q to wait for all asynchronous calls before formatting the records for display
            if ($scope.isPropertyLevel()) {

                if ($scope.selectedBuildingsOrRegions.name == 'All Buildings') { // Exclude property documents
                    $q.all([
                        $scope.loadDocumentsByBuildingId(SelectedProperty.getBuildingIds()),
                        $scope.loadDocumentsByFloorId(SelectedProperty.getFloorIds()),
                        $scope.loadDocumentsByRoomId(SelectedProperty.getRoomIds())
                    ]).then(function () {
                        $scope.loadingDocuments = false;
                        $scope.formatEnvironmentalDocumentsForDisplay();
                    });
                } else {
                    $q.all([
                        $scope.loadDocumentsByPropertyId($scope.currentPropertyComponent.id),
                        $scope.loadDocumentsByBuildingId(SelectedProperty.getBuildingIds()),
                        $scope.loadDocumentsByFloorId(SelectedProperty.getFloorIds()),
                        $scope.loadDocumentsByRoomId(SelectedProperty.getRoomIds())
                    ]).then(function () {
                        $scope.loadingDocuments = false;
                        $scope.formatEnvironmentalDocumentsForDisplay();
                    });
                }


            } else {
                if ($scope.isBuildingLevel()) {
                    var floorIds = [], roomIds = [];

                    for (var i = 0; i < $scope.currentPropertyComponent.floorList.length; i++) {
                        var floor = $scope.currentPropertyComponent.floorList[i];
                        floorIds.push(floor.id);
                        for (var j = 0; j < floor.roomList.length; j++) {
                            var room = floor.roomList[j];
                            roomIds.push(room.id);
                        }
                    }

                    if ($scope.selectedFloorsOrAreas.name == 'All Floors') { // Exclude building documents
                        $q.all([
                            $scope.loadDocumentsByFloorId(floorIds),
                            $scope.loadDocumentsByRoomId(roomIds)
                        ]).then(function () {
                            $scope.loadingDocuments = false;
                            $scope.formatEnvironmentalDocumentsForDisplay();
                        });
                    } else {
                        $q.all([
                            $scope.loadDocumentsByBuildingId($scope.currentPropertyComponent.id),
                            $scope.loadDocumentsByFloorId(floorIds),
                            $scope.loadDocumentsByRoomId(roomIds)
                        ]).then(function () {
                            $scope.loadingDocuments = false;
                            $scope.formatEnvironmentalDocumentsForDisplay();
                        });
                    }

                } else {
                    if ($scope.isFloorLevel()) {
                        var roomIds = [];

                        for (var j = 0; j < $scope.currentPropertyComponent.roomList.length; j++) {
                            var room = $scope.currentPropertyComponent.roomList[j];
                            roomIds.push(room.id);
                        }

                        if ($scope.selectedRooms.name == 'All Rooms') { //Exclude floor documents
                            $q.all([
                                $scope.loadDocumentsByRoomId(roomIds)
                            ]).then(function () {
                                $scope.loadingDocuments = false;
                                $scope.formatEnvironmentalDocumentsForDisplay();
                            });
                        } else {
                            $q.all([
                                $scope.loadDocumentsByFloorId($scope.currentPropertyComponent.id),
                                $scope.loadDocumentsByRoomId(roomIds)
                            ]).then(function () {
                                $scope.loadingDocuments = false;
                                $scope.formatEnvironmentalDocumentsForDisplay();
                            });
                        }

                    } else { // room level
                        $q.all([
                            $scope.loadDocumentsByRoomId($scope.currentPropertyComponent.id)
                        ]).then(function () {
                            $scope.loadingDocuments = false;
                            $scope.formatEnvironmentalDocumentsForDisplay();
                        });
                    }
                }
            }
        };

        $scope.exportExcel = function () {

            var documents = [];
            var filteredDocuments = $filter('orderBy')($filter('filter')($scope.formattedEnvironmentalDocuments, {
                type: '!Environmental Report',
                $: $scope.recordFilter
            }), ['parentType', 'parentName', 'type.name', '-lastUpdated']);

            for (var i = 0; i < filteredDocuments.length; i++) {
                var doc = filteredDocuments[i];
                documents.push({
                    parentType: doc.parentType,
                    parentName: doc.parentName,
                    type: doc.type.name,
                    dateCreated: doc.dateCreated,
                    lastUpdated: doc.lastUpdated,
                    status: doc.values['status'],
                    condition: doc.values['condition'],
                    estimatedRisk: doc.values['estimatedRisk']
                });
            }

            var data = {
                documents: documents
            };

            var url = contextPath + '/webapi/documents/' + $scope.currentProperty.propertyNumber + '/export/excel';
            $scope.openInNewWindow('POST', url, data);
        };

        $scope.$on("event:buildingChange", function () {
            $scope.loadRecordSummary();
        });

        $scope.$on("event:floorChange", function () {
            $scope.loadRecordSummary();
        });

        $scope.$on("event:roomChange", function () {
            $scope.loadRecordSummary();
        });

        $scope.editRecord = function (document) {
            ControllerInfoPasser.put("selectedDocument", document);
            ControllerInfoPasser.broadcast("event:editEnvironmentalRecord");
            $scope.changeMiddleSectionTo($scope.getInputPartialHTML(document.type.name));
        };

        $scope.getInputPartialHTML = function (name) {
            switch (name) {
                case 'Property History' :
                    return propertyHistoryInputPartial;
                case 'Surrounding Property' :
                    return surroundingPropertiesInputPartial;
                case 'Indoor Air Quality' :
                    return indoorAirInputPartial;
                case 'Mould' :
                    return mouldInputPartial;
                case 'Ozone Depleting Substance' :
                    return ozoneInputPartial;
                case 'Radon' :
                    return radonInputPartial;
                case 'Asbestos Material' :
                    return asbestosInputPartial;
                case 'PCB Equipment' :
                    return pcbEquipmentInputPartial;
                case 'PCB Storage Location' :
                    return pcbStorageInputPartial;
                case 'Secondary Hazardous Substance' :
                    return secondaryHazardInputPartial;
                case 'Materials Storage' :
                    return materialsStorageInputPartial;
                case 'Underground Storage Tank' :
                    return ustsInputPartial;
                case 'Aboveground Storage Tank' :
                    return astsInputPartial;
                case 'Container' :
                    return containersInputPartial;
                case 'Sump' :
                    return sumpsInputPartial;
                case 'Hoist' :
                    return hoistsInputPartial;
                case 'Dry Cleaning Solvents' :
                    return dryCleaningSolventsInputPartial;
                case 'Investigation' :
                    return investigationInputPartial;
                case 'Remediation' :
                    return remediationInputPartial;
                case 'Environmental Incident' :
                    return spillsIncidentInputPartial;
                case 'Spill or Incident' :
                    return spillsIncidentInputPartial;
                case 'Tenant Risk Level' :
                    return tenantRiskInputPartial;
                case 'Environmental Report':
                    return propertyReportDocumentsInputPartial;
                case 'Material Concerns':
                    return miscReportDocumentsInputPartial;
            }

        };

        $scope.loadRecordSummary();
        $scope.resetTableDataOrder();

    }])
    .controller('EnvironmentalCtrl', ['$scope', '$rootScope', '$http', '$timeout', '$location', 'SelectedEnvironmentalMenuItem', 'PropertyLookup', 'SelectedProperty', 'ControllerInfoPasser', 'DropboxLookup', 'contextPath', '$uibModal', '$route', function ($scope, $rootScope, $http, $timeout, $location, SelectedEnvironmentalMenuItem, PropertyLookup, SelectedProperty, ControllerInfoPasser, DropboxLookup, contextPath, $modal, $route) {
        // $scope.currentProperty = SelectedProperty.getSelectedProperty();

        $scope.clipboard = [];

        $scope.$on('event:environmentalRefresh', function () {
            $route.reload();
        });

        $scope.currentProperty = SelectedProperty.getSelectedProperty();


        if ($scope.environmentalEnabled == false) {
            $location.url("/");
        }

        $scope.writeNotAllowed = !$scope.currentUserHaveWritePermissionToModule($scope.moduleEnums.environmental);

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

        $scope.main = 'partials/environmental/environmentalMain.html';
        $scope.yearlyQuestionnaire = 'partials/yearlyQuestionnaire.html';
        $scope.monthlyQuestionnaire = 'partials/yearlyQuestionnaire.html';
        $scope.checklistsSurvey = 'partials/checklists-surveys.html';
        $scope.propertyDetails = 'partials/propertyInformation/detailedPropertyInformation.html';

        $scope.selection = 'main';

        $scope.selectedYear = new Date().getFullYear();

        $scope.changeSelection = function (selection) {
            $scope.clipboard.length = 0;
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
                if (new Date().getMonth() > 9) {
                    $scope.selectedQuestionnaireName = (new Date().getMonth() + 1) + "-" + new Date().getFullYear();
                } else {
                    $scope.selectedQuestionnaireName = "0" + (new Date().getMonth() + 1) + "-" + new Date().getFullYear();
                }
            }
        };

        $scope.changeQuestionnaireName = function (questionnaireName, questionnaireSubType) {
            // $scope.selectedYear = year;
            $scope.selectedQuestionnaireName = questionnaireName;
            $scope.selectedQuestionnaireSubType = questionnaireSubType;
            $scope.selectedQuestionnaireType = "Environmental";
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
    .controller('EnvironmentalMainCtrl', ['$scope', '$rootScope', '$http', '$timeout', '$location', 'SelectedEnvironmentalMenuItem', 'PropertyLookup', 'SelectedProperty', 'DropboxService', 'ComplianceService', '$filter',
        'ControllerInfoPasser', 'DropboxLookup', 'contextPath', 'RoomDocumentService', 'FloorDocumentService', 'BuildingDocumentService', 'RegionDocumentService', 'PropertyDocumentService', '$uibModal', 'GeneralDocumentService',
        function ($scope, $rootScope, $http, $timeout, $location, SelectedEnvironmentalMenuItem, PropertyLookup, SelectedProperty, DropboxService, ComplianceService, $filter,
                  ControllerInfoPasser, DropboxLookup, contextPath, RoomDocumentService, FloorDocumentService, BuildingDocumentService, RegionDocumentService, PropertyDocumentService, $modal, GeneralDocumentService) {

            if ($scope.currentProperty) {
                buildings = $scope.currentProperty.buildingList;
                regions = $scope.currentProperty.regionList;
            } else {
                $location.url('/');
            }

            $scope.showFloorsAndAreasDropbox = false;
            $scope.showRoomsDropbox = false;
            $scope.showAddButton = true;
            $scope.currentPropertyComponent = SelectedProperty.getSelectedProperty();

            $scope.formattedEnvironmentalDocuments = [];
            $scope.formattedDocumentsForInvestigation = [];

            var nothingSelected = "----------";

            $scope.persisting = false;

            var buildings, regions, floors = [], rooms;

            var parentType, parentFK;

            var defineParentType = function () {
                if ($scope.isFloorLevel()) {
                    parentType = "Floor";
                    parentFK = $scope.currentPropertyComponent.building_FK;
                } else {
                    if ($scope.isPropertyLevel()) {
                        parentType = "Property";
                        parentFK = $scope.currentPropertyComponent.id;
                    } else {
                        if ($scope.isBuildingLevel()) {
                            parentType = "Building";
                            parentFK = $scope.currentPropertyComponent.id;
                        } else {
                            parentType = "Room";
                            parentFK = $scope.currentPropertyComponent.id;
                        }
                    }
                }
            };

            $scope.middleSection = 'partials/moduleLandingPropertyInfo.html';
            $scope.similarPropertiesPartial = 'partials/similarProperties.html';

            $scope.propertyInformationLinkAttr = {
                icon: "icon-info",
                iconColor: "i-green",
                fontColor: "",
                isSelected: true
            };

            $scope.similarPropertiesLinkAttr = {
                icon: "icon-office",
                iconColor: "i-grey",
                fontColor: "text-muted",
                isSelected: false
            };

            $scope.buildingInformationLinkAttr = {
                icon: "icon-office",
                iconColor: "i-grey",
                fontColor: "text-muted",
                isSelected: false
            };

            $scope.inventorySummaryLinkAttr = {
                icon: "icon-book",
                iconColor: "i-grey",
                fontColor: "text-muted",
                isSelected: false
            };

            $scope.activeLink = $scope.propertyInformationLinkAttr;

            $scope.documentList = [];

            $scope.selectedBuildingsOrRegions = null;
            $scope.selectedFloorsOrAreas = null;
            $scope.selectedRooms = null;

            $scope.loadedDocuments = [];

            $scope.jumping = false;
            $scope.jumpToSection = ControllerInfoPasser.get('jumpToMenuItem');

            $scope.properties = [];
            $scope.selectedProperties = [];

            var currentProperty = SelectedProperty.getSelectedProperty();

            $scope.initializeSelectedProperty = function () {
                $scope.selectedProperties.length = 0;
                currentProperty = SelectedProperty.getSelectedProperty();
                if (angular.isDefined(currentProperty)) {
                    $scope.selectedProperties.push($scope.searchArrayForProperty($scope.properties, "propertyNumber", currentProperty.propertyNumber)[0]);
                }
            };

            $scope.loadAllProperties = function () {
                PropertyLookup.findAllAsDTO({}, function (data) {
                    $scope.properties = data;
                    $scope.initializeSelectedProperty();
                });
            };


            $scope.removeExternalMenuHighlights = function () {
                $scope.buildingInformationLinkAttr.iconColor = "i-grey";
                $scope.propertyInformationLinkAttr.iconColor = "i-grey";
                $scope.inventorySummaryLinkAttr.iconColor = "i-grey";

                $scope.buildingInformationLinkAttr.fontColor = "text-muted";
                $scope.propertyInformationLinkAttr.fontColor = "text-muted";
                $scope.inventorySummaryLinkAttr.fontColor = "text-muted";
            };

            $scope.isSelected = function (link) {
                $scope.$broadcast('event:externalMenuSelected', "");
                if (link === $scope.propertyInformationLinkAttr) {
                    $scope.propertyInformationLinkAttr.iconColor = "i-green";
                    $scope.propertyInformationLinkAttr.fontColor = "";

                    $scope.buildingInformationLinkAttr.iconColor = "i-grey";
                    $scope.buildingInformationLinkAttr.fontColor = "text-muted";
                    $scope.inventorySummaryLinkAttr.iconColor = "i-grey";
                    $scope.inventorySummaryLinkAttr.fontColor = "text-muted";

                    $scope.similarPropertiesLinkAttr.iconColor = "i-grey";
                    $scope.similarPropertiesLinkAttr.fontColor = "text-muted";
                } else {
                    if (link === $scope.similarPropertiesLinkAttr) {
                        $scope.propertyInformationLinkAttr.iconColor = "i-grey";
                        $scope.propertyInformationLinkAttr.fontColor = "text-muted";

                        $scope.buildingInformationLinkAttr.iconColor = "i-grey";
                        $scope.buildingInformationLinkAttr.fontColor = "text-muted";

                        $scope.inventorySummaryLinkAttr.iconColor = "i-grey";
                        $scope.inventorySummaryLinkAttr.fontColor = "text-muted";

                        $scope.similarPropertiesLinkAttr.iconColor = "i-green";
                        $scope.similarPropertiesLinkAttr.fontColor = "";
                    } else {
                        if (link === $scope.buildingInformationLinkAttr) {
                            $scope.propertyInformationLinkAttr.iconColor = "i-grey";
                            $scope.propertyInformationLinkAttr.fontColor = "text-muted";

                            $scope.buildingInformationLinkAttr.iconColor = "i-green";
                            $scope.buildingInformationLinkAttr.fontColor = "";

                            $scope.inventorySummaryLinkAttr.iconColor = "i-grey";
                            $scope.inventorySummaryLinkAttr.fontColor = "text-muted";

                            $scope.similarPropertiesLinkAttr.iconColor = "i-grey";
                            $scope.similarPropertiesLinkAttr.fontColor = "text-muted";
                        } else {
                            $scope.propertyInformationLinkAttr.iconColor = "i-grey";
                            $scope.propertyInformationLinkAttr.fontColor = "text-muted";

                            $scope.buildingInformationLinkAttr.iconColor = "i-grey";
                            $scope.buildingInformationLinkAttr.fontColor = "text-muted";

                            $scope.inventorySummaryLinkAttr.iconColor = "i-green";
                            $scope.inventorySummaryLinkAttr.fontColor = "";

                            $scope.similarPropertiesLinkAttr.iconColor = "i-grey";
                            $scope.similarPropertiesLinkAttr.fontColor = "text-muted";
                        }
                    }
                }
            };

            $scope.loadAllBuildingsAndRegions = function () {
                // Use a blank order to force these to the top of the list
                $scope.currentBuildingsOrRegionsList = [{
                    name: "Property",
                    id: -1,
                    finalBuildingNumber: "",
                    order: ""
                }, {name: "All Buildings", id: -2, finalBuildingNumber: "", order: ""}];

                if (buildings) {
                    for (var x = 0; x < buildings.length; x++) {
                        if (buildings[x].buildingNumber) {
                            var finalBuildingNumber = buildings[x].buildingNumber + ":";
                            var building = buildings[x];
                            building["finalBuildingNumber"] = finalBuildingNumber;
                            buildings[x] = building;
                        }
                    }
                    $scope.currentBuildingsOrRegionsList = $scope.currentBuildingsOrRegionsList.concat(buildings);
                }

                if (regions) {
                    $scope.currentBuildingsOrRegionsList = $scope.currentBuildingsOrRegionsList.concat(regions);
                }

                if (!$scope.selectedBuildingsOrRegions) {
                    $scope.selectedBuildingsOrRegions = {};
                    $scope.selectedBuildingsOrRegions = $scope.currentBuildingsOrRegionsList[0];
                    $scope.currentPropertyComponent = $scope.currentProperty;
                } else {
                    for (var x = 0; x < $scope.currentBuildingsOrRegionsList.length; x++) {
                        if ($scope.currentBuildingsOrRegionsList[x].id == $scope.selectedBuildingsOrRegions.id && $scope.currentBuildingsOrRegionsList[x].name == $scope.selectedBuildingsOrRegions.name) {
                            $scope.selectedBuildingsOrRegions = $scope.currentBuildingsOrRegionsList[x];
                            if (( $scope.selectedFloorsOrAreas.name == nothingSelected || $scope.selectedFloorsOrAreas.name == "All Floors" || !$scope.selectedFloorsOrAreas ) &&
                                ( $scope.selectedBuildingsOrRegions.name != "Property" && $scope.selectedBuildingsOrRegions.name != "All Buildings" )) {
                                $scope.currentPropertyComponent = $scope.currentBuildingsOrRegionsList[x];
                            } else {
                                if ($scope.selectedBuildingsOrRegions.name == "Property" || $scope.selectedBuildingsOrRegions.name == "All Buildings") {
                                    $scope.currentPropertyComponent = $scope.currentProperty;
                                }
                            }
                            break;
                        }
                    }
                }
            };

            $scope.loadAllFloorsAndAreas = function () {
                // Use a blank order to force these to the top of the list
                $scope.currentFloorsOrAreasList = [{name: nothingSelected, id: -1, order: ""}, {
                    name: "All Floors",
                    id: -2,
                    order: ""
                }];

                if ($scope.selectedBuildingsOrRegions.name == "All Buildings") {
                    if (buildings && regions) {

                        for (var x = 0; x < buildings.length; x++) {
                            $scope.currentFloorsOrAreasList = $scope.currentFloorsOrAreasList.concat(buildings[x].floorList);
                        }

                        for (var y = 0; y < regions.length; y++) {
                            $scope.currentFloorsOrAreasList = $scope.currentFloorsOrAreasList.concat(regions[y].areaList);
                        }

                    } else {
                        if (buildings) {
                            for (var x = 0; x < buildings.length; x++) {
                                $scope.currentFloorsOrAreasList = $scope.currentFloorsOrAreasList.concat(buildings[x].floorList);
                            }
                        } else {
                            if (regions) {
                                for (var y = 0; y < regions.length; y++) {
                                    $scope.currentFloorsOrAreasList = $scope.currentFloorsOrAreasList.concat(regions[y].areaList);
                                }
                            }
                        }
                    }
                } else {
                    if ($scope.selectedBuildingsOrRegions.floorList) {
                        $scope.currentFloorsOrAreasList = $scope.currentFloorsOrAreasList.concat($scope.selectedBuildingsOrRegions.floorList);
                    }

                    if ($scope.selectedBuildingsOrRegions.areaList) {
                        $scope.currentFloorsOrAreasList = $scope.currentFloorsOrAreasList.concat($scope.selectedBuildingsOrRegions.areaList);
                    }
                }

                if (!$scope.selectedFloorsOrAreas) {
                    $scope.selectedFloorsOrAreas = {};
                    $scope.selectedFloorsOrAreas = $scope.currentFloorsOrAreasList[0];
                    if ($scope.selectedBuildingsOrRegions.name == "Property") {
                        $scope.currentPropertyComponent = $scope.currentProperty;
                    } else {
                        if ($scope.selectedBuildingsOrRegions.name != "All Buildings") {
                            $scope.currentPropertyComponent = $scope.selectedBuildingsOrRegions;
                        }
                    }
                } else {
                    for (var x = 0; x < $scope.currentFloorsOrAreasList.length; x++) {
                        if ($scope.currentFloorsOrAreasList[x].id == $scope.selectedFloorsOrAreas.id && $scope.currentFloorsOrAreasList[x].name == $scope.selectedFloorsOrAreas.name) {

                            $scope.selectedFloorsOrAreas = $scope.currentFloorsOrAreasList[x];

                            if (( $scope.selectedRooms.name == nothingSelected || $scope.selectedRooms.name == "All Rooms" ) &&
                                ( $scope.selectedFloorsOrAreas.name != nothingSelected && $scope.selectedFloorsOrAreas.name != "All Floors" )) {
                                $scope.currentPropertyComponent = $scope.currentFloorsOrAreasList[x];
                            } else {
                                if ($scope.selectedBuildingsOrRegions.name != "Property" && $scope.selectedBuildingsOrRegions.name != "All Buildings") {
                                    $scope.currentPropertyComponent = $scope.selectedBuildingsOrRegions;
                                } else {
                                    $scope.currentPropertyComponent = $scope.currentProperty;
                                }
                            }
                            break;
                        }
                    }
                }
            };

            $scope.loadAllRooms = function () {
                // Use a blank order to force these to the top of the list
                $scope.currentRoomsList = [{
                    name: nothingSelected,
                    id: -1,
                    finalTenantName: "",
                    order: ""
                }, {name: "All Rooms", id: -2, finalTenantName: "", order: ""}];

                if ($scope.selectedFloorsOrAreas.name == "All Floors") {
                    $scope.currentPropertyComponent = $scope.selectedBuildingsOrRegions;
                    if (buildings) {
                        for (var x = 0; x < buildings.length; x++) {
                            var floorList = buildings[x].floorList;
                            for (var z = 0; z < floorList.length; z++) {

                                var roomList = floorList[z].roomList;
                                for (var i = 0; i < roomList.length; i++) {
                                    if (roomList[i].tenant) {
                                        var finalTenantName = roomList[i].tenant + ":";
                                        var room = roomList[i];
                                        room["finalTenantName"] = finalTenantName;
                                        roomList[i] = room;
                                    }
                                }
                                $scope.currentRoomsList = $scope.currentRoomsList.concat(roomList);
                            }
                        }
                    }

                } else {
                    if ($scope.selectedFloorsOrAreas.name != nothingSelected) {
                        $scope.currentPropertyComponent = $scope.selectedFloorsOrAreas;
                        if ($scope.selectedFloorsOrAreas.roomList) {
                            var roomList = $scope.selectedFloorsOrAreas.roomList;
                            for (var i = 0; i < roomList.length; i++) {
                                if (roomList[i].tenant) {
                                    var finalTenantName = ":" + roomList[i].tenant;
                                    var room = roomList[i];
                                    room["finalTenantName"] = finalTenantName;
                                    roomList[i] = room;
                                }
                            }
                            $scope.currentRoomsList = $scope.currentRoomsList.concat(roomList);
                        }
                    }
                }

                if (!$scope.selectedRooms) {
                    $scope.selectedRooms = {};
                    $scope.selectedRooms = $scope.currentRoomsList[0];
                    if ($scope.selectedFloorsOrAreas.name == nothingSelected || $scope.selectedFloorsOrAreas.name == "All Floors") {
                        if ($scope.selectedBuildingsOrRegions.name == "Property") {
                            $scope.currentPropertyComponent = $scope.currentProperty;
                        } else {
                            if ($scope.selectedBuildingsOrRegions.name != "All Buildings") {
                                $scope.currentPropertyComponent = $scope.selectedBuildingsOrRegions;
                            }
                        }
                    } else {
                        $scope.currentPropertyComponent = $scope.selectedFloorsOrAreas;
                    }
                } else {
                    for (var x = 0; x < $scope.currentRoomsList.length; x++) {
                        if ($scope.currentRoomsList[x].id == $scope.selectedRooms.id && $scope.currentRoomsList[x].name == $scope.selectedRooms.name) {
                            $scope.selectedRooms = $scope.currentRoomsList[x];
                            if ($scope.selectedRooms.name != nothingSelected && $scope.selectedRooms.name != "All Rooms") {
                                $scope.currentPropertyComponent = $scope.currentRoomsList[x];
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
                    $location.url = contextPath + '/app'
                }

                $scope.loadAllBuildingsAndRegions();
                $scope.loadAllFloorsAndAreas();
                $scope.loadAllRooms();
            };

            $scope.fixIE = function () {
                //check if IE so the other browsers don't get this ugly hack.
                if ($scope.detectIE()) {
                    var selectLists = document.querySelectorAll(".propertyComponentSelectList");
                    for (var x = 0; x < selectLists.length; x++) {
                        selectLists[x].parentNode.insertBefore(selectLists[x], selectLists[x]);
                    }
                }
            };

            $scope.changeSelectedBuildingsOrRegions = function (selectedBuildingsOrRegions) {
                $scope.selectedBuildingsOrRegions = selectedBuildingsOrRegions;

                // Use a blank order to force these to the top of the list
                $scope.currentFloorsOrAreasList = [{name: nothingSelected, id: -1, order: ""}, {
                    name: "All Floors",
                    id: -2,
                    order: ""
                }];

                if (selectedBuildingsOrRegions.name == "All Buildings") {
                    $scope.currentPropertyComponent = $scope.currentProperty;
                    $scope.showFloorsAndAreasDropbox = false;
                    $scope.showRoomsDropbox = false;
                    $scope.showAddButton = false;
                    $scope.loadAllFloorsAndAreas();

                } else {
                    if (selectedBuildingsOrRegions.name == "Property") {
                        $scope.currentPropertyComponent = $scope.currentProperty;
                        $scope.showFloorsAndAreasDropbox = false;
                        $scope.showRoomsDropbox = false;
                        $scope.showAddButton = true;
                    } else {
                        $scope.currentPropertyComponent = selectedBuildingsOrRegions;
                        if (selectedBuildingsOrRegions.floorList) {
                            if (selectedBuildingsOrRegions.floorList.length != 0) {
                                $scope.showFloorsAndAreasDropbox = true;
                                $scope.showRoomsDropbox = false;
                                $scope.currentFloorsOrAreasList = $scope.currentFloorsOrAreasList.concat(selectedBuildingsOrRegions.floorList);
                            } else {
                                $scope.showFloorsAndAreasDropbox = true;
                                $scope.showRoomsDropbox = false;
                            }
                        }

                        if (selectedBuildingsOrRegions.areaList) {
                            if (selectedBuildingsOrRegions.areaList.length != 0) {
                                $scope.showFloorsAndAreasDropbox = true;
                                $scope.showRoomsDropbox = false;
                                $scope.currentFloorsOrAreasList = $scope.currentFloorsOrAreasList.concat(selectedBuildingsOrRegions.areaList);
                            } else {
                                $scope.showFloorsAndAreasDropbox = true;
                                $scope.showRoomsDropbox = false;
                            }
                        }
                        $scope.showAddButton = true;
                    }
                }
                $scope.selectedFloorsOrAreas = $scope.currentFloorsOrAreasList[0];
                $scope.fixIE();
                ControllerInfoPasser.broadcast('event:buildingChange');
            };

            $scope.changeSelectedFloorsOrAreas = function (selectedFloorsOrAreas) {
                // Use a blank order to force these to the top of the list
                $scope.selectedFloorsOrAreas = selectedFloorsOrAreas;

                $scope.currentRoomsList = [{
                    name: nothingSelected,
                    id: -1,
                    finalTenantName: "",
                    order: ""
                }, {name: "All Rooms", id: -2, finalTenantName: "", order: ""}];

                if (selectedFloorsOrAreas.name == nothingSelected) {
                    if ($scope.selectedBuildingsOrRegions.name == "Property" || $scope.selectedBuildingsOrRegions.name == "All Buildings") {
                        $scope.currentPropertyComponent = $scope.currentProperty;
                    } else {
                        if ($scope.selectedBuildingsOrRegions.name != "All Buildings") {
                            $scope.currentPropertyComponent = $scope.selectedBuildingsOrRegions;
                        }
                    }
                    $scope.showRoomsDropbox = false;

                    if ($scope.selectedBuildingsOrRegions.name != "All Buildings") {
                        $scope.showAddButton = true;
                    }

                } else {
                    if (selectedFloorsOrAreas.name == "All Floors") {
                        if ($scope.selectedBuildingsOrRegions.name == "Property" || $scope.selectedBuildingsOrRegions.name == "All Buildings") {
                            $scope.currentPropertyComponent = $scope.currentProperty;
                        } else {
                            if ($scope.selectedBuildingsOrRegions.name != "All Buildings") {
                                $scope.currentPropertyComponent = $scope.selectedBuildingsOrRegions;
                            }
                        }
                        $scope.showRoomsDropbox = false;
                        $scope.showAddButton = false;
                    } else {
                        $scope.currentPropertyComponent = selectedFloorsOrAreas;
                        if (selectedFloorsOrAreas.roomList) {
                            if (selectedFloorsOrAreas.roomList.length != 0) {
                                var roomList = selectedFloorsOrAreas.roomList;
                                for (var i = 0; i < roomList.length; i++) {
                                    if (roomList[i].tenant) {
                                        var finalTenantName = ":" + roomList[i].tenant;
                                        var room = roomList[i];
                                        room["finalTenantName"] = finalTenantName;
                                        roomList[i] = room;
                                    }
                                }
                                // $scope.showRoomsDropbox = true;
                                $scope.currentRoomsList = $scope.currentRoomsList.concat(roomList);
                            }
                            $scope.showRoomsDropbox = true;
                            $scope.showAddButton = true;
                        }
                    }
                }
                $scope.selectedRooms = $scope.currentRoomsList[0];
                $scope.fixIE();
                ControllerInfoPasser.broadcast('event:floorChange');
            };

            $scope.changeSelectedRooms = function (selectedRooms) {

                $scope.selectedRooms = selectedRooms;

                if (selectedRooms.name == "All Rooms") {
                    $scope.currentPropertyComponent = $scope.selectedFloorsOrAreas;
                    $scope.showAddButton = false;
                } else {
                    if (selectedRooms.name == nothingSelected) {
                        $scope.currentPropertyComponent = $scope.selectedFloorsOrAreas;
                    } else {
                        $scope.currentPropertyComponent = selectedRooms;
                    }

                    if ($scope.selectedFloorsOrAreas.name != "All Floors") {
                        $scope.showAddButton = true;
                    }
                }
                $scope.fixIE();
                ControllerInfoPasser.broadcast('event:roomChange');
            };

            $scope.toggleCollapse = function (category) {
                category.collapsed = !category.collapsed;
                if (category.collapsed) {
                    category.collapseIcon = "icon-plus";
                } else {
                    category.collapseIcon = "icon-minus";
                }
            };

            $scope.changeMiddleSectionTo = function (section) {
                $scope.persisting = false;
                $scope.middleSection = section;
                if ($scope.middleSection == 'partials/moduleLandingPropertyInfo.html') {
                    $scope.selectedEnvironmentalMenuItem = undefined;
                }
            };

            $scope.changeMenuItem = function (menuItem) {
                if (menuItem.type == "menu") {
                    SelectedEnvironmentalMenuItem.setSelectedMenuItem(menuItem);
                    if ($scope.selectedEnvironmentalMenuItem !== menuItem) {
                        $scope.clipboard.length = 0;
                    }
                    $scope.selectedEnvironmentalMenuItem = angular.copy(menuItem);
                    $scope.action = "";
                    $scope.changeMiddleSectionTo(menuItem.overviewPartialHTML);
                    ControllerInfoPasser.put("selectedEnvironmentalMenuItem", $scope.selectedEnvironmentalMenuItem);
                }
            };

            $scope.clearSelectedEnvironmentalMenuItem = function () {
                $scope.selectedEnvironmentalMenuItem = undefined;
            };

            $scope.resetPropertyComponentSelector = function () {
                $scope.selectedBuildingsOrRegions = undefined;
                $scope.selectedFloorsOrAreas = undefined;
                $scope.selectedRooms = undefined;

                $scope.refreshRecordsInfo();
                $scope.currentPropertyComponent = $scope.currentProperty;
                $scope.showFloorsAndAreasDropbox = false;
                $scope.showRoomsDropbox = false;
                $scope.showAddButton = true;
            };

            $scope.$on($scope.EVENT_CHANGE_PROPERTY, function (event, category) {
                if ($scope.currentPropertyComponent !== SelectedProperty.getSelectedProperty()) {
                    $scope.clipboard.length = 0;
                }
                $scope.currentPropertyComponent = SelectedProperty.getSelectedProperty();
                $scope.refreshPropertyInfo();
                $scope.resetPropertyComponentSelector();
                $scope.initializeSelectedProperty();
                $rootScope.$broadcast('event:currentPropertyComponentChanged', "");
            });

            $scope.isViewingData = function () {
                if ($scope.middleSection != 'partials/moduleLandingPropertyInfo.html' &&
                    $scope.middleSection != '' && $scope.middleSection != 'partials/environmental/recordsSummary.html' && $scope.action == "") {
                    return true;
                } else {
                    return false;
                }
            };

            $scope.isEditingData = function () {
                if ($scope.action == "Edit") {
                    return true;
                } else {
                    return false;
                }
            };

            $scope.isEnteringData = function () {
                if ($scope.middleSection.search('Input.html$') > -1) {
                    return true;
                } else {
                    return false;
                }
            };

            $scope.resetRecord = function () {
                ControllerInfoPasser.broadcast("event:resetRecord");
            };

            $scope.cancelDataEntry = function () {
                $scope.changeMenuItem($scope.selectedEnvironmentalMenuItem);
            };

            $scope.$on('event:editEnvironmentalRecord', function () {
                $scope.nextAction = 'Update';
                $scope.action = 'Edit';
            });

            $scope.addNewRecord = function () {
                $scope.nextAction = 'Save';
                $scope.action = 'Add';
                if ($scope.selectedEnvironmentalMenuItem.isCustomMenu) {
                    ControllerInfoPasser.broadcast("event:createNewCustomEnvironmentalRecord");

                } else {
                    $scope.changeMiddleSectionTo($scope.selectedEnvironmentalMenuItem.inputPartialHTML);

                }
            };

            $scope.isPropertyLevel = function () {
                if ($scope.currentPropertyComponent.propertyNumber) {
                    return true;
                } else {
                    return false;
                }
            };

            $scope.isBuildingLevel = function () {
                if ($scope.currentPropertyComponent.floorList) {
                    return true;
                } else {
                    return false;
                }
            };

            $scope.deleteRecord = function () {
                $scope.nextAction = '';
                // $scope.action = 'Delete';
                ControllerInfoPasser.put("selectedEnvironmentalMenuItem", $scope.selectedEnvironmentalMenuItem);
                ControllerInfoPasser.put("selectedBuildingsOrRegions", $scope.selectedBuildingsOrRegions);
                ControllerInfoPasser.put("selectedFloorsOrAreas", $scope.selectedFloorsOrAreas);
                ControllerInfoPasser.put("selectedRooms", $scope.selectedRooms);
                $scope.persisting = true;

                if ($scope.selectedEnvironmentalMenuItem.isCustomMenu) {
                    ControllerInfoPasser.broadcast("event:deleteCustomEnvironmentalRecord");

                } else {
                    ControllerInfoPasser.broadcast("event:deleteEnvironmentalRecord");

                }

            };

            $scope.isRegionLevel = function () {
                if ($scope.currentPropertyComponent.areaList) {
                    return true;
                } else {
                    return false;
                }
            };

            $scope.isFloorLevel = function () {
                if ($scope.currentPropertyComponent.roomList) {
                    return true;
                } else {
                    return false;
                }
            };

            var getMergedInvestigationStatusFieldsString = function (status, investigationStatus) {
                var mergedString = '';

                var isInvestigationStatusPresent = function () {
                    if (angular.isDefined(investigationStatus) && investigationStatus !== null && investigationStatus !== '') {
                        return true;
                    }

                    return false;
                };

                if (angular.isDefined(status) && status !== '') {
                    mergedString = mergedString + status;

                    if (isInvestigationStatusPresent()) {
                        mergedString = mergedString + ' / ' + investigationStatus;
                    }

                } else {
                    if (isInvestigationStatusPresent()) {
                        mergedString = mergedString + investigationStatus;
                    }
                }

                return mergedString;
            };

            var formatDocumentsForInvestigationRecordsDisplay = function (formattedEnvironmentalDocuments) {
                if (angular.isDefined(formattedEnvironmentalDocuments)) {
                    $scope.formattedDocumentsForInvestigation = angular.copy(formattedEnvironmentalDocuments);

                    var x = 0;
                    for (x = 0; x < $scope.formattedDocumentsForInvestigation.length; x++) {
                        var finalStatusField = getMergedInvestigationStatusFieldsString($scope.formattedDocumentsForInvestigation[x].values.status, $scope.formattedDocumentsForInvestigation[x].values.investigationStatus);
                        $scope.formattedDocumentsForInvestigation[x].values['finalStatus'] = finalStatusField;
                    }
                }
            };

            $scope.formatEnvironmentalDocumentsForDisplay = function () {
                $scope.formattedEnvironmentalDocuments = [];
                for (var x = 0; x < $scope.loadedDocuments.length; x++) {

                    $scope.loadedDocuments[x].values = {};

                    // var documentTypeSectionsList = $scope.loadedDocuments[ x ].type.documentTypeSectionsList;
                    var sectionContentsMap = $scope.loadedDocuments[x].sectionContentsMap;

                    $scope.loadedDocuments[x].values = angular.copy(sectionContentsMap);

                    /*for( var y = 0; y < documentTypeSectionsList.length; y++ ) {
                     var sectionId = documentTypeSectionsList[ y ].section;
                     // alert( JSON.stringify( sectionId ) );
                     $scope.loadedDocuments[ x ].values[ sectionId ] = sectionContentsMap[ sectionId ];
                     }*/

                    $scope.loadedDocuments[x];
                    var breadcrumb = $scope.getDocumentParentBreadCrumb($scope.loadedDocuments[x].parent_FK, $scope.loadedDocuments[x].parentType);

                    var locationBreadcrumb = angular.copy(breadcrumb);
                    if (locationBreadcrumb.length <= 0) {
                        locationBreadcrumb.unshift($scope.currentProperty.propertyNumber);
                    }
                    var locationString = locationBreadcrumb.join(" > ");
                    $scope.loadedDocuments[x]['location'] = locationString;

                    breadcrumb.unshift($scope.currentProperty.propertyNumber);

                    $scope.loadedDocuments[x]['breadcrumb'] = breadcrumb;
                    $scope.formattedEnvironmentalDocuments.push($scope.loadedDocuments[x]);
                }

                formatDocumentsForInvestigationRecordsDisplay($scope.formattedEnvironmentalDocuments);
            };


            $scope.persistRecord = function () {
                ControllerInfoPasser.put("currentPropertyComponent", $scope.currentPropertyComponent);
                ControllerInfoPasser.put("selectedEnvironmentalMenuItem", $scope.selectedEnvironmentalMenuItem);
                $scope.persisting = true;

                if ($scope.selectedEnvironmentalMenuItem.isCustomMenu) {
                    ControllerInfoPasser.broadcast("event:persistCustomEnvironmentalRecord");
                } else {
                    ControllerInfoPasser.broadcast("event:persistEnvironmentalRecord");
                }

            };

            $scope.formatSingleEnvironmentalDocumentForDisplay = function (unformattedDocument) {
                unformattedDocument.values = {};
                var sectionContentsMap = unformattedDocument.sectionContentsMap;
                unformattedDocument.values = angular.copy(sectionContentsMap);
                return unformattedDocument;
            };

            $scope.loadDocumentsByPropertyId = function (id) {
                return PropertyDocumentService.findDocumentsByPropertyId({propertyId: id}, function (data, responseHeaders) {
                    // Success
                    $scope.appendLoadedDocuments(data);
                }, function (httpResponse) {
                    // Error
                    $scope.addAlert('There was an error loading the records!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                }).$promise;
            };

            $scope.loadDocumentsByBuildingId = function (id) {
                if (angular.isArray(id)) {
                    return BuildingDocumentService.findDocumentsInBuildingIds({}, id, function (data, responseHeaders) {
                        // Success
                        $scope.appendLoadedDocuments(data);
                    }, function (httpResponse) {
                        // Error
                        $scope.addAlert('There was an error loading the records!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                    }).$promise;
                } else {
                    return BuildingDocumentService.findDocumentsByBuildingId({buildingId: id}, function (data, responseHeaders) {
                        // Success
                        $scope.appendLoadedDocuments(data);
                    }, function (httpResponse) {
                        // Error
                        $scope.addAlert('There was an error loading the records!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                    }).$promise;
                }
            };

            $scope.loadDocumentsByFloorId = function (id) {
                if (angular.isArray(id)) {
                    return FloorDocumentService.findDocumentsInFloorIds({}, id, function (data, responseHeaders) {
                        // Success
                        $scope.appendLoadedDocuments(data);
                    }, function (httpResponse) {
                        // Error
                        $scope.addAlert('There was an error loading the records!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                    }).$promise;
                } else {
                    return FloorDocumentService.findDocumentsByFloorId({floorId: id}, function (data, responseHeaders) {
                        // Success
                        $scope.appendLoadedDocuments(data);
                    }, function (httpResponse) {
                        // Error
                        $scope.addAlert('There was an error loading the records!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                    }).$promise;
                }
            };

            $scope.loadDocumentsByRoomId = function (id) {
                if (angular.isArray(id)) {
                    return RoomDocumentService.findDocumentsInRoomIds({}, id, function (value, responseHeaders) {
                        // Success
                        $scope.appendLoadedDocuments(value);
                    }, function (httpResponse) {
                        // Error
                        $scope.addAlert('There was an error loading the records!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                    }).$promise;
                } else {
                    return RoomDocumentService.findDocumentsByRoomId({roomId: id}, function (data, responseHeaders) {
                        // Success
                        $scope.appendLoadedDocuments(data);
                    }, function (httpResponse) {
                        // Error
                        $scope.addAlert('There was an error loading the records!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                    }).$promise;
                }
            };

            $scope.loadDocumentsByPropertyIdAndType = function (id, type) {
                return PropertyDocumentService.findDocumentsByPropertyAndType({
                    propertyId: id,
                    documentTypeId: type
                }, function (data, responseHeaders) {
                    $scope.appendLoadedDocuments(data);
                }, function (httpResponse) {
                    // Error
                    $scope.addAlert('There was an error loading the records!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                }).$promise;
            };

            $scope.loadDocumentsByBuildingIdAndType = function (id, type) {
                if (angular.isArray(id)) {
                    return BuildingDocumentService.findDocumentsInBuildingIdsAndType({documentTypeId: type}, id, function (data, responseHeaders) {
                        // Success
                        $scope.appendLoadedDocuments(data);
                    }, function (httpResponse) {
                        // Error
                        $scope.addAlert('There was an error loading the records!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                    }).$promise;
                } else {
                    return BuildingDocumentService.findDocumentsByBuildingAndType({
                        buildingId: id,
                        documentTypeId: type
                    }, function (data, responseHeaders) {
                        // Success
                        $scope.appendLoadedDocuments(data);
                    }, function (httpResponse) {
                        // Error
                        $scope.addAlert('There was an error loading the records!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                    }).$promise;
                }
            };

            $scope.loadDocumentsByFloorIdAndType = function (id, type) {
                if (angular.isArray(id)) {
                    return FloorDocumentService.findDocumentsInFloorIdsAndType({documentTypeId: type}, id, function (data, responseHeaders) {
                        // Success
                        $scope.appendLoadedDocuments(data);
                    }, function (httpResponse) {
                        // Error
                        $scope.addAlert('There was an error loading the records!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                    }).$promise;
                } else {
                    return FloorDocumentService.findDocumentsByFloorAndType({
                        floorId: id,
                        documentTypeId: type
                    }, function (data, responseHeaders) {
                        // Success
                        $scope.appendLoadedDocuments(data);
                    }, function (httpResponse) {
                        // Error
                        $scope.addAlert('There was an error loading the records!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                    }).$promise;
                }
            };

            $scope.loadDocumentsByRoomIdAndType = function (id, type) {
                if (angular.isArray(id)) {
                    return RoomDocumentService.findDocumentsInRoomIdsAndType({documentTypeId: type}, id, function (value, responseHeaders) {
                        // Success
                        $scope.appendLoadedDocuments(value);
                    }, function (httpResponse) {
                        // Error
                        $scope.addAlert('There was an error loading the records!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                    }).$promise;
                } else {
                    return RoomDocumentService.findDocumentsByRoomAndType({
                        roomId: id,
                        documentTypeId: type
                    }, function (value, responseHeaders) {
                        // Success
                        $scope.appendLoadedDocuments(value);
                    }, function (httpResponse) {
                        // Error
                        $scope.addAlert('There was an error loading the records!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                    }).$promise;
                }
            };

            $scope.initializeDocumentViewer = function (complianceRecord) {
                var documentURL = $scope.getProtocol() + '://' + window.location.host + contextPath + '/webapi/compliancerecords/attachment/' + complianceRecord.id;

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

            $scope.appendLoadedDocuments = function (documents) {
                $scope.loadedDocuments = $scope.loadedDocuments.concat(documents);
            };

            $scope.moveToEnvironmentalDocumentsClipboard = function () {

                if ($scope.middleSection.contains('Input')) {
                    $scope.clipboard = [ControllerInfoPasser.get('selectedDocument')];
                } else {
                    defineParentType();

                    $scope.clipboard = angular.copy($filter('filter')($scope.formattedEnvironmentalDocuments, {
                        type: '!Environmental Report',
                        parentType: parentType,
                        $: $scope.recordFilter
                    }));
                }
                $scope.addAlert($scope.clipboard.length + ' record(s) were successfully selected to be moved!', 'success', $scope.DEFAULT_ALERT_LENGTH);
                $scope.cancelDataEntry();
            };

            $scope.showPasteButton = function () {
                if (angular.isDefined($scope.clipboard)) {
                    if ($scope.clipboard.length > 0) {
                        return true;
                    }
                }
                return false;
            };

            $scope.showMoveButton = function () {
                if ($scope.middleSection != 'partials/moduleLandingPropertyInfo.html' && $scope.middleSection != 'partials/environmental/recordsSummary.html' && angular.isDefined($scope.loadedDocuments)) {
                    if ($scope.loadedDocuments.length > 0 && $scope.loadedDocuments[0].type.name !== 'Environmental Report') {
                        if (angular.isDefined($scope.currentProperty.buildingList) && $scope.currentProperty.buildingList.length > 0) {
                            if ((angular.isDefined($scope.clipboard) && $scope.clipboard.length == 0) || angular.isUndefined($scope.clipboard)) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            };

            $scope.clearEnvironmentalDocumentsClipboard = function () {
                $scope.clipboard.length = 0;
            };

            $scope.pasteFromEnvironmentalDocumentsClipboard = function () {

                defineParentType();

                GeneralDocumentService.pasteDocuments({
                    parentType: parentType,
                    parentName: $scope.currentPropertyComponent.name,
                    parentFK: parentFK
                }, $scope.clipboard, function (data, responseHeaders) {
                    // Success
                    $scope.addAlert('Successfully pasted ' + $scope.clipboard.length + ' document(s) to ' + parentType + ' level!', 'success', $scope.DEFAULT_ALERT_LENGTH);
                    ControllerInfoPasser.broadcast('event:buildingChange');
                    $scope.clipboard.length = 0;
                }, function (httpResponse) {
                    // Error
                    $scope.addAlert('There was an error when pasting the document(s) to ' + parentType + ' level!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                });
            };

            $scope.getDocumentParentBreadCrumb = function (componentId, componentType) {
                var breadCrumb = []; // Parent to child from left to right of the array...
                if (componentType == "Property") {
                    // breadCrumb.push($scope.currentProperty.propertyNumber);
                    return breadCrumb;

                } else {
                    if (componentType == "Building") {
                        var building = SelectedProperty.getBuilding(componentId);
                        if (angular.isDefined(building)) {
                            breadCrumb.push(building.name);
                        }
                        return breadCrumb;

                    } else {
                        if (componentType == "Floor") {
                            var floor = SelectedProperty.getFloor(componentId);
                            var building;
                            if (angular.isDefined(floor)) {
                                building = SelectedProperty.getBuilding(floor.building_FK);
                                if (angular.isDefined(building)) {
                                    breadCrumb.push(building.name);
                                    breadCrumb.push(floor.name);
                                }

                            }
                            return breadCrumb;

                        } else {
                            if (componentType == "Room") {
                                var room = SelectedProperty.getRoom(componentId);
                                var floor;
                                if (angular.isDefined(room)) {
                                    floor = SelectedProperty.getFloor(room.floor_FK);
                                    var building;
                                    if (angular.isDefined(floor)) {
                                        building = SelectedProperty.getBuilding(floor.building_FK);
                                        if (angular.isDefined(building)) {
                                            breadCrumb.push(building.name);
                                            breadCrumb.push(floor.name);
                                            breadCrumb.push(room.name);
                                        }
                                    }
                                }
                                return breadCrumb;
                            }
                        }
                    }
                }
            };

            var dashboardMenuItemToView = undefined;
            var dashboardNumberDetailsRecordTypeControllerInfoPasserKey = 'dashboardNumberDetailsRecordTypeMenuId';
            $scope.checkEnvironmentalRecordType = function (key, value, menuItem) {
                var recordTypeMenuId = ControllerInfoPasser.get(dashboardNumberDetailsRecordTypeControllerInfoPasserKey);
                if (key == 'id') {
                    if (value == recordTypeMenuId) {
                        dashboardMenuItemToView = menuItem;
                        return true;
                    }
                }
            };

            $scope.menuSelectedThroughController = {};

            $scope.loadMenuItems = function () {
                $http.get('json/environmentalMenus.json').success(function (data) {
                    $scope.items = data;

                    if (angular.isDefined(ControllerInfoPasser.get(dashboardNumberDetailsRecordTypeControllerInfoPasserKey)) && ControllerInfoPasser.get(dashboardNumberDetailsRecordTypeControllerInfoPasserKey) != null) {
                        for (var x = 0; x < $scope.items.length; x++) {
                            $scope.traverseMenuTree($scope.items[x], $scope.checkEnvironmentalRecordType);
                        }

                        ControllerInfoPasser.clear(dashboardNumberDetailsRecordTypeControllerInfoPasserKey);
                        if (angular.isDefined(dashboardMenuItemToView) && angular.isDefined(dashboardMenuItemToView.overviewPartialHTML)) {
                            ControllerInfoPasser.broadcast('event:treeModelMenuSelectedExternally', dashboardMenuItemToView);
                            $scope.removeExternalMenuHighlights();
                            $scope.changeMenuItem(dashboardMenuItemToView);
                            $scope.dashboardMenuItemToView = undefined;
                        }
                    }
                });
            };

            $scope.$on('event:dashboardSwitchToEnvironmentalRecord', function (event, environmentalMenuId) {
                ControllerInfoPasser.put(dashboardNumberDetailsRecordTypeControllerInfoPasserKey, environmentalMenuId);
                $scope.loadMenuItems();
            });


            $scope.$on('event:errorPersisting', function () {
                $scope.persisting = false;
            });

            $scope.$on('event:showAddButton', function () {
                $scope.showAddButton = true;
            });

            $scope.$on('event:hideAddButton', function () {
                $scope.showAddButton = false;
            });

            $scope.$on('event:hideFloorsAndAreasDropbox', function () {
                $scope.showFloorsAndAreasDropbox = false;
            });

            $scope.$on('event:hideRoomsDropbox', function () {
                $scope.showRoomsDropbox = false;
            });

            $scope.$on('event:complianceDocumentOpen', function (event, complianceRevision) {
                $scope.initializeDocumentViewer(complianceRevision);
            });

            $scope.$on('event:fileUploadRejected', function (event, message) {
                $scope.addAlert(message, 'warning', $scope.DEFAULT_ALERT_LENGTH);
            });

            $scope.$on('event:disableCRUD', function () {
                $scope.persisting = true;
            });

            $scope.$on('event:enableCRUD', function () {
                $scope.persisting = false;
            });

            $scope.refreshPropertyInfo();
            $scope.refreshRecordsInfo();

            if (angular.isDefined($scope.jumpToSection)) {
                $scope.jumping = true;
                $scope.changeMenuItem($scope.jumpToSection);
                ControllerInfoPasser.clear('jumpToMenuItem');
            }

            var backToQuestionnaire = ControllerInfoPasser.get('backToQuestionnaire');
            if (angular.isDefined(backToQuestionnaire)) {
                ControllerInfoPasser.clear('backToQuestionnaire');
                $scope.changeSelection('yearlyQuestionnaire');
            }

            $scope.loadDropboxes(['environmentalComplianceCategory']);

            $scope.loadMenuItems();

        }])
    .controller('HazardousWasteCtrl', ['$scope', '$http', 'SelectedProperty', 'ControllerInfoPasser', '$q', 'WasteService',
        function ($scope, $http, SelectedProperty, ControllerInfoPasser, $q, WasteService) {

            $scope.hazardousWasteRecords = [];
            $scope.loadingWasteRecords = false;
            var defaultPredicates = ['location'];

            $scope.createNewHazardousWasteRecord = function () {
                WasteService.createStandardWasteRecordWithGeneratorNumber({propertyNumber: $scope.currentProperty.propertyNumber}, function (value, responseHeaders) {
                    // Success
                    $scope.openHazardousWasteRecord(value);

                }, function (httpResponse) {
                    // Error
                    $scope.addAlert('There was an error loading the records!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                });
            };

            $scope.resetTableDataOrder = function () {
                $scope.tableDataOrder = angular.copy(defaultPredicates);
            };


            $scope.loadHazardousWasteBreadcrumbs = function () {
                for (var x = 0; x < $scope.hazardousWasteRecords.length; x++) {
                    var breadcrumb = $scope.getDocumentParentBreadCrumb($scope.hazardousWasteRecords[x].parent_FK, $scope.hazardousWasteRecords[x].parentType);
                    var locationBreadcrumb = angular.copy(breadcrumb);
                    if (locationBreadcrumb.length <= 0) {
                        locationBreadcrumb.unshift($scope.currentProperty.propertyNumber);
                    }
                    var locationString = locationBreadcrumb.join(" > ");
                    $scope.hazardousWasteRecords[x]['location'] = locationString;

                    breadcrumb.unshift($scope.currentProperty.propertyNumber);
                    $scope.hazardousWasteRecords[x]['breadcrumb'] = breadcrumb;
                }
            };


            $scope.getHazardousWasteRecords = function () {
                $scope.loadingWasteRecords = true;

                if ($scope.selectedFloorsOrAreas.name == "All Floors") {
                    ControllerInfoPasser.broadcast('event:hideAddButton');

                } else {
                    if ($scope.isBuildingLevel()) {
                        WasteService.findByBuildingId({buildingId: $scope.currentPropertyComponent.id}, function (value, responseHeaders) {
                            // Success
                            $scope.loadingWasteRecords = false;
                            $scope.hazardousWasteRecords = value;
                            $scope.loadHazardousWasteBreadcrumbs();
                            ControllerInfoPasser.broadcast('event:showAddButton');

                        }, function (httpResponse) {
                            // Error
                            $scope.loadingWasteRecords = false;
                            $scope.addAlert('There was an error loading the records!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                        });

                    } else {
                        if ($scope.selectedBuildingsOrRegions.name == "All Buildings") {
                            $scope.hazardousWasteRecords.length = 0;
                            var buildings = $scope.currentProperty.buildingList;
                            for (var x = 0; x < buildings.length; x++) {
                                WasteService.findByBuildingIdAndModule({
                                    buildingId: buildings[x].id,
                                    module: $scope.moduleEnums.environmental
                                }, function (value, responseHeaders) {
                                    // Success
                                    $scope.loadingWasteRecords = false;
                                    $scope.hazardousWasteRecords = $scope.hazardousWasteRecords.concat(value);
                                    $scope.loadHazardousWasteBreadcrumbs();
                                    ControllerInfoPasser.broadcast('event:hideAddButton');

                                }, function (httpResponse) {
                                    // Error
                                    $scope.loadingWasteRecords = false;
                                    $scope.addAlert('There was an error loading the records!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                                });
                            }
                        } else {
                            if ($scope.isPropertyLevel()) {
                                WasteService.findByParentPropertyAndModule({
                                    propertyId: $scope.currentPropertyComponent.id,
                                    module: $scope.moduleEnums.environmental
                                }, function (value, responseHeaders) {
                                    // Success
                                    $scope.loadingWasteRecords = false;
                                    $scope.hazardousWasteRecords = value;
                                    $scope.loadHazardousWasteBreadcrumbs();
                                    ControllerInfoPasser.broadcast('event:showAddButton');

                                }, function (httpResponse) {
                                    // Error
                                    $scope.loadingWasteRecords = false;
                                    $scope.addAlert('There was an error loading the records!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                                });

                            } else {
                                $scope.hazardousWasteRecords.length = 0;
                                ControllerInfoPasser.broadcast('event:hideAddButton');

                            }
                        }
                    }
                }

                $scope.hideUnusedPropertySelectorDropboxes();

            };

            $scope.openHazardousWasteRecord = function (record) {
                ControllerInfoPasser.put("selectedWasteRecord", record);
                if (angular.isDefined(record.id)) {
                    ControllerInfoPasser.broadcast("event:editEnvironmentalRecord"); // This broadcast is needed for button label changes..
                }
                $scope.changeMiddleSectionTo($scope.selectedEnvironmentalMenuItem.inputPartialHTML);
            };

            $scope.hideUnusedPropertySelectorDropboxes = function () {
                ControllerInfoPasser.broadcast('event:hideFloorsAndAreasDropbox');
                ControllerInfoPasser.broadcast('event:hideRoomsDropbox');
            };

            $scope.$on('event:createNewCustomEnvironmentalRecord', function (event, item) {
                $scope.createNewHazardousWasteRecord();
            });

            $scope.$on('event:buildingChange', function (event, item) {
                $scope.getHazardousWasteRecords();
            });

            $scope.$on('event:floorChange', function (event, item) {
                $scope.getHazardousWasteRecords();
            });

            $scope.$on('event:roomChange', function (event, item) {
                $scope.getHazardousWasteRecords();
            });

            $scope.$on('event:currentPropertyComponentChanged', function (event, category) {
                $scope.getHazardousWasteRecords();
                $scope.hideUnusedPropertySelectorDropboxes();
            });

            $scope.getHazardousWasteRecords();
            $scope.hideUnusedPropertySelectorDropboxes();
            $scope.resetTableDataOrder();
        }])
    .controller('HazardousWasteInputCtrl', ['$scope', '$http', 'SelectedProperty', 'ControllerInfoPasser', '$q', 'WasteService', 'WasteStreamsService', 'contextPath',
        function ($scope, $http, SelectedProperty, ControllerInfoPasser, $q, WasteService, WasteStreamsService, contextPath) {

            $scope.record = {};
            $scope.wasteStreams = [];
            $scope.selectedWasteStream = {};
            $scope.attachments = [];

            var addHazardousWaste = function () {
                WasteService.save({wastestreamid: $scope.selectedWasteStream}, $scope.record, function (data, headers) {
                    // Success
                    $scope.addAlert('Successfully saved record for property: ' + $scope.currentProperty.propertyNumber, 'success', $scope.DEFAULT_ALERT_LENGTH);
                    $scope.nextAction = null;
                    $scope.action = 'Saved';
                    $scope.changeMenuItem($scope.selectedEnvironmentalMenuItem);

                }, function (httpResponse) {
                    // Error
                    switch (httpResponse.status) {
                        case 405:
                            showInvalidInputErrorMessage();
                            break;
                        default:
                            errorPersisting();
                            break;
                    }

                });

            };


            var updateHazardousWaste = function () {
                WasteService.update({}, $scope.record, function (data, headers) {
                    // Success
                    $scope.addAlert('Successfully updated record for property: ' + $scope.currentProperty.propertyNumber, 'success', $scope.DEFAULT_ALERT_LENGTH);
                    $scope.nextAction = null;
                    $scope.action = 'Saved';
                    $scope.changeMenuItem($scope.selectedEnvironmentalMenuItem);

                }, function (httpResponse) {
                    // Error
                    switch (httpResponse.status) {
                        case 405:
                            showInvalidInputErrorMessage();
                            break;
                        default:
                            errorPersisting();
                            break;
                    }
                });

            };


            var initializeController = function () {
                $scope.record = ControllerInfoPasser.get("selectedWasteRecord");
                $scope.selectedWasteStream = $scope.record.wasteStream.id;
                if (angular.isDefined($scope.record.attachments)) {
                    $scope.attachments = $scope.record.attachments;
                } else {
                    $scope.attachments = [];
                }

                WasteStreamsService.query({}, function (value, responseHeaders) {
                    // Success
                    $scope.wasteStreams = value;

                }, function (httpResponse) {
                    // Error
                    $scope.addAlert('There was an error loading waste streams!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                });
            };


            var assignCurrentPropertyComponent = function () {
                var assigned = false;

                if ($scope.isPropertyLevel()) {
                    $scope.record.propertyNumber = $scope.currentPropertyComponent.propertyNumber;
                    $scope.record.propertyId = $scope.currentPropertyComponent.id;
                    assigned = true;

                } else {
                    if ($scope.isBuildingLevel()) {
                        $scope.record.buildingNumber = $scope.currentPropertyComponent.buildingNumber;
                        $scope.record.buildingId = $scope.currentPropertyComponent.id;
                        assigned = true;

                    }
                }

                $scope.record.parent_property_FK = $scope.currentProperty.id;

                return assigned;
            };


            var errorPersisting = function () {
                ControllerInfoPasser.broadcast('event:errorPersisting');
                $scope.addAlert('There was an error saving the record!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
            };


            var showInvalidInputErrorMessage = function () {
                ControllerInfoPasser.broadcast('event:errorPersisting');
                $scope.addAlert('Invalid input. Please check the form fields', 'warning', $scope.DEFAULT_ALERT_LENGTH);
            };

            $scope.persistHazardousWaste = function () {
                $scope.persisting = true;

                $scope.record.attachments = $scope.attachments;
                $scope.record.module = 'ENVIRONMENTAL';

                for (var x = 0; x < $scope.wasteStreams.length; x++) {
                    if ($scope.wasteStreams[x].id == $scope.selectedWasteStream) {
                        $scope.record.wasteStream = $scope.wasteStreams[x];
                        break;
                    }
                }

                if ($scope.nextAction == 'Update') {
                    updateHazardousWaste();

                } else {
                    var assigned = assignCurrentPropertyComponent();
                    if (assigned) {
                        addHazardousWaste();
                    }
                }
            };


            $scope.deleteHazardousWaste = function () {
                WasteService.delete({id: $scope.record.id}, $scope.record, function (data, headers) {
                    // $scope.propertyList = data;
                    $scope.addAlert('Successfully removed record for property: ' + $scope.currentProperty.propertyNumber, 'success', $scope.DEFAULT_ALERT_LENGTH);
                    $scope.nextAction = null;
                    $scope.action = 'Deleted';
                    $scope.changeMenuItem($scope.selectedEnvironmentalMenuItem);

                }, function (httpResponse) {
                    // Error here
                    ControllerInfoPasser.broadcast('event:errorPersisting');
                    $scope.addAlert('There was an error deleting the record!', 'danger', $scope.DEFAULT_ALERT_LENGTH);
                });
            };


            $scope.$on($scope.EVENT_CHANGE_PROPERTY, function () {
                $scope.changeMenuItem($scope.selectedEnvironmentalMenuItem);
            });


            $scope.$on("event:persistCustomEnvironmentalRecord", function () {
                if ($scope.form.$valid) {
                    $scope.persistHazardousWaste();
                } else {
                    showInvalidInputErrorMessage();
                }

            });


            $scope.$on("event:deleteCustomEnvironmentalRecord", function () {
                $scope.deleteHazardousWaste();
            });


            $scope.$on('event:localAttachmentOpen', function (event, attachment) {
                if (angular.isUndefined(attachment.id)) {
                    return;
                }
                $scope.openInNewWindow('GET', contextPath + '/webapi/waste/management/records/attachments/' + attachment.id, {}, '_blank');
            });

            $scope.loadDropboxes(['wasteCompanyName', 'wasteStatus', 'wasteManifest']);
            initializeController();
        }]);

