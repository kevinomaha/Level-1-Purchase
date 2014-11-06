four51.app.factory('EmployeeSearch', ['$resource', '$451',
    function($resource, $451) {
        function _then(fn, data) {
            if (angular.isFunction(fn))
                fn(data);
        }

        var _search = function(parameters) {

        };

        return {
            search: _search
        }
    }]);