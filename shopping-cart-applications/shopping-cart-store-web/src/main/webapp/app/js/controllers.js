'use strict';

/* Controllers */

angular.module('MyShoppingApp.controllers', [])
    .controller('GlobalCtrl', ['$scope', '$http', 'contextPath', '$window', '$timeout', '$location', '$filter', '$q', function ($scope, $http, contextPath, $window, $timeout, $location, $filter, $q) {

        $scope.isDefined = function (x) {
            return angular.isDefined(x);
        };

        $scope.isUndefined = function (x) {
            return angular.isUndefined(x);
        };

        $scope.closeModalWithPromise = function (target) {
            var promise = $q.defer();

            $(target).on('hidden.bs.modal', function () {
                promise.resolve();
            });
            $(target).modal('hide');

            return promise.promise;
        };

    }])
    .controller('SlideNavCtrl', ['$rootScope', '$scope', '$window', '$timeout', '$cookies', '$http', '$q', '$document', '$location', function ($rootScope, $scope, $window, $timeout, $cookies, $http, $q, $document, $location) {

        var spinnerTarget = document.getElementById('navSearchSpinner');
        //var spinnerTargetSm = document.getElementById('navSearchSpinnerSm');
        var opts = {
            lines: 10, // The number of lines to draw
            length: 3, // The length of each line
            width: 2, // The line thickness
            radius: 5 // The radius of the inner circle
        };
        var spinner = new Spinner(opts);

        var menus = [
            '',
            'admin',
            'profile',
            'tasks',
            'help',
            'search'
        ];

        //$scope.isCollapsed = true;
        $scope.navText = 'Jump to...';
        $scope.icon = 'icon-arrow-down-3';
        $scope.searching = false;
        $scope.isCollapsed = true;
        $scope.isSearchCollapsed = true;
        var refreshModule = false;
        var transitioning = false;
        var inside;

        var navBarPromise;

        //ui - jump links
        $scope.toggle = function () {
            if (!transitioning) {

                navBarPromise = $q.defer();

                if (!$scope.isSearchCollapsed) {
                    $scope.toggleSearch();
                }

                if ($scope.isCollapsed) {
                    $scope.openNav();
                } else {
                    $scope.closeNav();
                }

                return navBarPromise.promise;
            }
        };

        $scope.toggleSearch = function () {
            $scope.isSearchCollapsed = !$scope.isSearchCollapsed;
            $('#searchlist').toggle();
        };

        $scope.searchSelect = function () {
            if (!transitioning) {
                if (!$scope.isCollapsed) {
                    $scope.toggle().then(function () {
                        $scope.toggleSearch();
                    });
                } else {
                    $scope.toggleSearch();
                }
            }
        };

        $scope.searchMouseOver = function () {
            if ($scope.isSearchCollapsed) {
                if (!transitioning) {
                    if (!$scope.isCollapsed) {
                        $scope.toggle().then(function () {
                            $scope.toggleSearch();
                        });
                    } else {
                        $scope.toggleSearch();
                    }
                }
            }
        };

        $scope.searchMouseLeave = function () {
            if (!$scope.isSearchCollapsed) {
                $scope.toggleSearch();
            }
        };

        $scope.goToModule = function (module, id, toggle) {
            if (toggle) {
                $scope.toggle();
            }

            $location.url('/' + module);
        };

        $scope.toggleSlideLocation = function () {
            if (inside === undefined) {
                inside = true;
            } else {
                inside = !inside;
            }
        };


        //events
        $document.on('click', function (event) {
            if (inside === false && !$scope.isCollapsed) {
                $scope.toggle();
                inside = undefined;
                $scope.$apply();
            }
        });

        $('#navCollapse').on('hide.bs.collapse', function () {
            // Called when hide event starts
            transitioning = true;
        });

        $('#navCollapse').on('hidden.bs.collapse', function () {
            // Called after hide css transitions
            transitioning = false;

            if (refreshModule) {
                ControllerInfoPasser.broadcast('event:' + $scope.getCurrentModule() + 'Refresh');
                refreshModule = false;
            }

            navBarPromise.resolve();
        });

        $('#navCollapse').on('show.bs.collapse', function () {
            // Called when show event starts
            transitioning = true;
        });

        $('#navCollapse').on('shown.bs.collapse', function () {
            // Called after show css transitions
            transitioning = false;
            navBarPromise.resolve();
        });

        //nav
        $scope.closeNav = function () {
            $('#navCollapse').collapse('hide');
            $scope.isCollapsed = true;
            $scope.navText = 'Jump to...';
            $scope.icon = 'icon-arrow-down-3';
        };

        $scope.openNav = function () {
            $('#navCollapse').collapse('show');
            $scope.isCollapsed = false;
            $scope.navText = 'Close';
            $scope.icon = 'icon-arrow-up-3';
        };

    }])
    .controller('AdminCtrl', ['$scope', '$http', 'contextPath', '$window', '$timeout', '$location', '$filter', '$q', function ($scope, $http, contextPath, $window, $timeout, $location, $filter) {

        $scope.middleSection = '';

        var loadMenus = function() {
            $http.get('partials/adminMenus.json').success(function (data) {
                $scope.adminMenuItems = data;
            });
        };

        var initializeController = function() {
            loadMenus();
        };

        var changeMiddleSectionTo = function(section) {
            $scope.middleSection = section;
        };

        $scope.isSelectedMenuItem = function (subMenuItem) {
            return subMenuItem === $scope.selectedMenuItem ? 'i-green' : 'i-grey';
        };

        $scope.changeMenuItem = function (menuItem) {
            if (menuItem.type === 'menu') {
                $scope.selectedMenuItem = menuItem;
                changeMiddleSectionTo(menuItem.mainPartialHTML);
            }
        };

        initializeController();

    }])
    .controller('ProductsCatalogCtrl', ['$scope', '$http', 'contextPath', '$window', '$timeout', '$location', '$filter', '$q', function ($scope, $http, contextPath, $window, $timeout, $location, $filter, q) {

        $scope.productsCatalogCtrl = {
            selectedProduct: {}
        };

        $scope.overviewPartial = undefined;
        $scope.inputPartial = undefined;

        var initProductsCatalogCtrl = function () {
            if (angular.isDefined($scope.selectedMenuItem)) {
                $scope.overviewPartial = angular.copy($scope.selectedMenuItem.overviewPartialHTML);
                $scope.inputPartial = angular.copy($scope.selectedMenuItem.inputPartialHTML);

                $scope.switchToProductsOverviewView();
            }
        };

        $scope.switchToProductInputView = function () {
            $scope.productsCatalogPartial = $scope.inputPartial;
        };

        $scope.switchToProductsOverviewView = function () {
            $scope.productsCatalogPartial = $scope.overviewPartial;
        };

        initProductsCatalogCtrl();

    }])
    .controller('ProductsCatalogOverviewCtrl', ['$scope', '$http', 'contextPath', '$window', '$timeout', '$location', '$filter', '$q', 'ProductAdminService', function ($scope, $http, contextPath, $window, $timeout, $location, $filter, q, ProductAdminService) {

        $scope.products = [];
        $scope.loadingProducts = false;

        $scope.loadRecordList = function () {
            $scope.loadingProducts = true;

            ProductAdminService.getProductsFromCatalog({}, function (value, ignoreResponseHeaders) {
                // Success
                $scope.setRecordList(value);
                $scope.loadingProducts = false;
            }, function (ignoreHttpResponse) {
                // Error
                $scope.loadingProducts = false;
            });
        };

        $scope.hasTableRows = function () {
            var numberOfRows = $scope.products.length;
            return numberOfRows > 0;
        };

        $scope.setRecordList = function (records) {
            $scope.products = records;
        };

        $scope.createNewProduct = function () {
            $scope.productsCatalogCtrl.selectedProduct = {
                template: true,
                name: 'New Product',
                price: 10,
                productNumber: 'AASDGAS123',
                productAttributes: []
            };
            $scope.switchToProductInputView();
        };

        $scope.editProduct = function (product) {
            $scope.productsCatalogCtrl.selectedProduct = product;
            $scope.switchToProductInputView();
        };

        var initProductCatalogOverviewCtrl = function () {
            $scope.loadRecordList();
        };

        initProductCatalogOverviewCtrl();

    }])
    .controller('ProductInputCtrl', ['$scope', '$http', 'contextPath', '$window', '$timeout', '$location', '$filter', '$q', 'ProductAdminService', function ($scope, $http, contextPath, $window, $timeout, $location, $filter, q, ProductAdminService) {

        $scope.persistingProduct = false;
        $scope.product = undefined;

        var initializeInsuranceClaim = function () {
            $scope.product = angular.copy($scope.productsCatalogCtrl.selectedProduct);
        };

        var initProductInputCtrl = function () {
            initializeInsuranceClaim();
        };

        var areFormFieldsValid = function () {
            return $scope.productForm.$valid;
        };

        var finishPersisting = function (value, ignoreResponseHeaders) {
            $scope.persisitingProduct = false;
            $scope.productsCatalogCtrl.selectedProduct = value;
            $scope.switchToProductsOverviewView();
        };

        var addNewProduct = function () {
            if (areFormFieldsValid()) {
                $scope.persisitingProduct = true;
                ProductAdminService.save({}, $scope.product,
                    finishPersisting,
                    function (ignoreHttpResponse) {
                        // error
                    }
                );

            }
        };

        var updateProduct = function () {
            if (areFormFieldsValid()) {
                $scope.persisitingProduct = true;
                $scope.product.type = undefined;
                ProductAdminService.update({}, $scope.product,
                    finishPersisting,
                    function (ignoreHttpResponse) {
                        // Error
                    }
                );
            }
        };

        $scope.deleteProduct = function () {
            if (angular.isUndefined($scope.product.template)) {

                // delete
                ProductAdminService.delete({productNumber: $scope.product.productNumber}, function (ignoreValue, ignoreResponseHeaders) {
                    // Success

                    $scope.closeModalWithPromise('#deleteProductModal').then(function () {
                        $scope.productsCatalogCtrl.selectedProduct = {};
                        $scope.switchToProductsOverviewView();
                    });

                }, function (ignoreHttpResponse) {
                    // Error
                });
            }
        };

        $scope.saveProduct = function () {
            if (angular.isDefined($scope.product.template)) {
                // Add
                addNewProduct();

            } else {
                // Update
                updateProduct();

            }
        };

        $scope.cancelProductDataEntry = function () {
            $scope.switchToProductsOverviewView();
        };

        initProductInputCtrl();

    }])
    .controller('ShopCtrl', ['$scope', '$http', 'contextPath', '$window', '$timeout', '$location', '$filter', '$q', function ($scope, $http, contextPath, $window, $timeout, $location, $filter) {

        $scope.middleSection = '';

        var loadMenus = function() {
            $http.get('partials/shopMenus.json').success(function (data) {
                $scope.shopMenuItems = data;
            });
        };

        var initializeController = function() {
            loadMenus();
        };

        var changeMiddleSectionTo = function(section) {
            $scope.middleSection = section;
        };

        $scope.isSelectedMenuItem = function (subMenuItem) {
            return subMenuItem === $scope.selectedMenuItem ? 'i-yellow' : 'i-grey';
        };

        $scope.changeMenuItem = function (menuItem) {
            if (menuItem.type === 'menu') {
                $scope.selectedMenuItem = menuItem;
                changeMiddleSectionTo(menuItem.mainPartialHTML);
            }
        };

        initializeController();

    }])
    .controller('StoreCtrl', ['$scope', '$http', 'contextPath', '$window', '$timeout', '$location', '$filter', '$q', 'ShoppingService', function ($scope, $http, contextPath, $window, $timeout, $location, $filter, q, ShoppingService) {

        $scope.storeCtrl = {
            cart: {}
        };

        $scope.overviewPartial = undefined;

        var setCartValue = function(cartValue) {
            $scope.storeCtrl.cart = cartValue;
        };

        var initStoreCtrl = function () {
            if (angular.isDefined($scope.selectedMenuItem)) {
                ShoppingService.getCart({}, function (value, ignoreResponseHeaders) {
                    // Success
                    setCartValue(value);
                    $scope.overviewPartial = angular.copy($scope.selectedMenuItem.overviewPartialHTML);
                    $scope.switchToStoreOverviewView();

                }, function (ignoreHttpResponse) {
                    // Error
                });

            }
        };

        $scope.switchToStoreOverviewView = function () {
            $scope.storePartial = $scope.overviewPartial;
        };

        initStoreCtrl();

    }])
    .controller('StoreOverviewCtrl', ['$scope', '$http', 'contextPath', '$window', '$timeout', '$location', '$filter', '$q', 'ShoppingService', function ($scope, $http, contextPath, $window, $timeout, $location, $filter, q, ShoppingService) {

        $scope.inventory = [];
        $scope.loadingInventory = false;

        $scope.loadRecordList = function () {
            $scope.loadingInventory = true;

            ShoppingService.getInventory({}, function (value, ignoreResponseHeaders) {
                // Success
                $scope.setRecordList(value);
                $scope.loadingInventory = false;
            }, function (ignoreHttpResponse) {
                // Error
                $scope.loadingInventory = false;
            });
        };

        $scope.hasTableRows = function () {
            var numberOfRows = $scope.inventory.length;
            return numberOfRows > 0;
        };

        $scope.setRecordList = function (records) {
            $scope.inventory = records;
        };

        $scope.addToCart = function (item) {
            ShoppingService.addItemToCart({itemCode: item.itemCode, quantity: 1}, function (value, ignoreResponseHeaders) {
                // Success
            }, function (ignoreHttpResponse) {
                // Error
            });
        };

        var initStoreOverviewCtrl = function () {
            $scope.loadRecordList();
        };

        initStoreOverviewCtrl();

    }])
    .controller('CartOverviewCtrl', ['$scope', '$http', 'contextPath', '$window', '$timeout', '$location', '$filter', '$q', 'ShoppingService', function ($scope, $http, contextPath, $window, $timeout, $location, $filter, q, ShoppingService) {

        $scope.cartItems = [];

        $scope.loadCart = function () {
            ShoppingService.getCart({}, function (value, ignoreResponseHeaders) {
                // Success
                $scope.cartItems = value.items;

            }, function (ignoreHttpResponse) {
                // Error
            });
        };

        var initStoreOverviewCtrl = function () {
            $scope.loadCart();
        };

        initStoreOverviewCtrl();

    }]);