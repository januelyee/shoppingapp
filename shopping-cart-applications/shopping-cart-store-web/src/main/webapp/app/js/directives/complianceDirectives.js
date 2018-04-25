angular.module('myApp.complianceDirectives', []).
    directive('appVersion', ['version', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    }])
    .directive('loadingComplianceRevisionsPostProcess', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
        return function (scope, element, attrs) {
            if (scope.$last) {
                $timeout(function () {
                    scope.$emit("event:loadingComplianceRevisionsComplete");
                });

            }
        };
    }]);