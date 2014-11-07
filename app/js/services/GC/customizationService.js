four51.app.factory('Customization', ['$451',
    function($451) {

        var selectedEmployee = {};

        var _getEmployee = function() {
            return selectedEmployee;
        };

        var _setEmployee = function(employee) {
            selectedEmployee = employee;
        }

        return {
            getEmployee: _getEmployee,
            setEmployee: _setEmployee
        }
    }]);