four51.app.factory('EmployeeSearch', ['$resource', '$http', '$451',
    function($resource, $http, $451) {
        function _then(fn, data) {
            if (angular.isFunction(fn))
                fn(data);
        }

        var baseUrl = "https://gca-svcs01-dev.cloudapp.net/ClientService/GetUsers?callback=JSON_CALLBACK";

        var _search = function(criteria, success) {
            /*criteria['p'] = 1;
            $resource(baseUrl).get(criteria).$promise.then(function(data) {
                _then(success, data);
            });*/

            var testResults = [{"Extrinsics":[{"Key":"CustomProperty1","Value":""},{"Key":"CustomProperty2","Value":""},{"Key":"CustomProperty3","Value":""},{"Key":"Prefix","Value":""},{"Key":"FirstName","Value":" Elizabeth Palmer"},{"Key":"MiddleName","Value":""},{"Key":"LastName","Value":"Brown"},{"Key":"Biography","Value":""},{"Key":"Photo","Value":""},{"Key":"Telephone","Value":""},{"Key":"Cell","Value":""},{"Key":"Fax","Value":""},{"Key":"Website","Value":""},{"Key":"IM","Value":""},{"Key":"Twitter","Value":""},{"Key":"Skype","Value":""},{"Key":"LinkedIn","Value":""},{"Key":"Facebook","Value":""},{"Key":"Unit","Value":""},{"Key":"Street","Value":""},{"Key":"City","Value":""},{"Key":"Region","Value":""},{"Key":"Country","Value":""},{"Key":"PostalCode","Value":""},{"Key":"PreferredTimeZone","Value":""},{"Key":"PreferredLocale","Value":""}],"FirstName":" Elizabeth Palmer","LastName":"Brown","PortalID":4,"Role":null,"UserID":26581,"Username":"Palmer.Brown@test.com"},{"Extrinsics":[{"Key":"CustomProperty1","Value":""},{"Key":"CustomProperty2","Value":""},{"Key":"CustomProperty3","Value":""},{"Key":"Prefix","Value":"111"},{"Key":"FirstName","Value":" Magenta Leigh"},{"Key":"MiddleName","Value":"````"},{"Key":"LastName","Value":"Brown"},{"Key":"Biography","Value":""},{"Key":"Photo","Value":"-1"},{"Key":"Telephone","Value":"111"},{"Key":"Cell","Value":"4029514148"},{"Key":"Fax","Value":""},{"Key":"Website","Value":""},{"Key":"IM","Value":""},{"Key":"Twitter","Value":""},{"Key":"Skype","Value":""},{"Key":"LinkedIn","Value":""},{"Key":"Facebook","Value":""},{"Key":"Unit","Value":"11"},{"Key":"Street","Value":"11510 Blondo St Suite 102"},{"Key":"City","Value":"Omaha"},{"Key":"Region","Value":""},{"Key":"Country","Value":"United States"},{"Key":"PostalCode","Value":"11111"},{"Key":"PreferredTimeZone","Value":"Dateline Standard Time"},{"Key":"PreferredLocale","Value":""}],"FirstName":" Magenta Leigh","LastName":"Brown","PortalID":4,"Role":null,"UserID":26182,"Username":"Magenta.Brown@test.com"},{"Extrinsics":[{"Key":"CustomProperty1","Value":""},{"Key":"CustomProperty2","Value":""},{"Key":"CustomProperty3","Value":""},{"Key":"Prefix","Value":""},{"Key":"FirstName","Value":" Mario"},{"Key":"MiddleName","Value":""},{"Key":"LastName","Value":"Brown"},{"Key":"Biography","Value":""},{"Key":"Photo","Value":""},{"Key":"Telephone","Value":""},{"Key":"Cell","Value":""},{"Key":"Fax","Value":""},{"Key":"Website","Value":""},{"Key":"IM","Value":""},{"Key":"Twitter","Value":""},{"Key":"Skype","Value":""},{"Key":"LinkedIn","Value":""},{"Key":"Facebook","Value":""},{"Key":"Unit","Value":""},{"Key":"Street","Value":""},{"Key":"City","Value":""},{"Key":"Region","Value":""},{"Key":"Country","Value":""},{"Key":"PostalCode","Value":""},{"Key":"PreferredTimeZone","Value":""},{"Key":"PreferredLocale","Value":""}],"FirstName":" Mario","LastName":"Brown","PortalID":4,"Role":null,"UserID":25500,"Username":"Mario.Brown@test.com"}];
            _then(success, testResults);
        };

        return {
            search: _search
        }
    }]);