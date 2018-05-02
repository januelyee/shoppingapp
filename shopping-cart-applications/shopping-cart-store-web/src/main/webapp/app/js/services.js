/*
 *
 *  * Copyright (c) 2015. Refined Data Solutions. All Rights Reserved
 *
 */

'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('MyShoppingApp.services', ['ngResource'])
    .value('version', '0.1')
    .constant('contextPath', '/shopping')
    .constant('RESTContextPath', '/shopping')
    .factory('ProductAdminService', ['$resource', 'RESTContextPath',
        function ($resource, RESTContextPath) {
            var baseUrl = RESTContextPath + '/webapi/admin/products';
            return $resource(baseUrl, {}, {
                save: {method: 'POST'},
                update: {method: 'PUT', url: baseUrl + '/:id'},
                delete: {method: 'DELETE', url: baseUrl + '/:productNumber'},
                getProductsFromCatalog: {method: 'GET', isArray: true}
            });
        }
    ])
    .factory('ShoppingService', ['$resource', 'RESTContextPath',
        function ($resource, RESTContextPath) {
            var baseUrl = RESTContextPath + '/webapi/shop';
            return $resource(baseUrl, {}, {
                getCart: {method: 'GET', url: baseUrl + '/cart'},
                addItemToCart: {method: 'GET', url: baseUrl + '/cart/:itemCode/:quantity'},
                returnCart: {method: 'PUT', url: baseUrl + '/cart/return'},
                increaseCartItemQuantity: {method: 'GET', url: baseUrl + '/cart/increase/quantity/:itemCode'},
                decreaseCartItemQuantity: {method: 'GET', url: baseUrl + '/cart/decrease/quantity/:itemCode'},
                order: {method: 'PUT', url: baseUrl + '/order'},
                getUpdatedCartInformation: {method: 'GET', url: baseUrl + '/refresh'},
                getInventory: {method: 'GET', url: baseUrl + '/inventory', isArray: true}
            });
        }
    ]);
