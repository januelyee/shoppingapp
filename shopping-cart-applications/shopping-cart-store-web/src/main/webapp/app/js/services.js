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
        }]);
