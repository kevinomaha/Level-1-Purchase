four51.app.factory('EmployeeSearch', ['$resource', '$http', '$451', '$filter',
    function($resource, $http, $451, $filter) {
        function _then(fn, data) {
            if (angular.isFunction(fn))
                fn(data);
        }

        //var baseUrl = "https://gca-svcs02-dev.cloudapp.net/ClientService/GetUsersByWildCard";
        var baseUrl = "https://gca-svcs02-dev.cloudapp.net/ClientService/GetUsers";

        function containsObject(obj, list) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].UserID == obj.UserID) {
                    return true;
                }
            }

            return false;
        }

        function _extendEmployee(recipient, recipientList) {
            if (recipientList) recipient.Added = containsObject(recipient, recipientList.List);
            recipient.Address = {IsShipping: true, IsBilling: true};
            recipient.EmployeeNumber = $filter('employeeproperty')(recipient, 'ThirdPartyID');
            recipient.Marketplace = $filter('employeeproperty')(recipient, 'CustomProperty1');
            recipient.JobFamily = $filter('employeeproperty')(recipient, 'CustomProperty2');
            recipient.Supervisor = $filter('employeeproperty')(recipient, 'ManagerID');
            recipient.ADPCompanyCode = $filter('employeeproperty')(recipient, 'CustomProperty3');
        }

        var _search = function(criteria, user, recipientList, success, error) {
            criteria['p'] = user.PortalID;
            $resource(baseUrl, {}).query(criteria).$promise.then(function(data) {
                angular.forEach(data, function(employee) {
                    _extendEmployee(employee);
                });
                _then(success, data);
            },
            function(ex) {
                _then(error)
            });

            /*var testResults = [{"Extrinsics":[{"Key":"ManagerID","Value":"12345"},{"Key":"ThirdPartyID","Value":"345345345"},{"Key":"CustomProperty1","Value":"Mrktplc Example"},{"Key":"CustomProperty2","Value":"Job Family Example"},{"Key":"CustomProperty3","Value":"Company Code Example"},{"Key":"Prefix","Value":""},{"Key":"FirstName","Value":" Elizabeth Palmer"},{"Key":"MiddleName","Value":""},{"Key":"LastName","Value":"Brown"},{"Key":"Biography","Value":""},{"Key":"Photo","Value":""},{"Key":"Telephone","Value":""},{"Key":"Cell","Value":""},{"Key":"Fax","Value":""},{"Key":"Website","Value":""},{"Key":"IM","Value":""},{"Key":"Twitter","Value":""},{"Key":"Skype","Value":""},{"Key":"LinkedIn","Value":""},{"Key":"Facebook","Value":""},{"Key":"Unit","Value":""},{"Key":"Street","Value":""},{"Key":"City","Value":""},{"Key":"Region","Value":""},{"Key":"Country","Value":""},{"Key":"PostalCode","Value":""},{"Key":"PreferredTimeZone","Value":""},{"Key":"PreferredLocale","Value":""}],"FirstName":" Elizabeth Palmer","LastName":"Brown","PortalID":4,"Role":null,"UserID":26581,"Username":"Palmer.Brown@test.com"},{"Extrinsics":[{"Key":"CustomProperty1","Value":""},{"Key":"CustomProperty2","Value":""},{"Key":"CustomProperty3","Value":""},{"Key":"Prefix","Value":"111"},{"Key":"FirstName","Value":" Magenta Leigh"},{"Key":"MiddleName","Value":"````"},{"Key":"LastName","Value":"Brown"},{"Key":"Biography","Value":""},{"Key":"Photo","Value":"-1"},{"Key":"Telephone","Value":"111"},{"Key":"Cell","Value":"4029514148"},{"Key":"Fax","Value":""},{"Key":"Website","Value":""},{"Key":"IM","Value":""},{"Key":"Twitter","Value":""},{"Key":"Skype","Value":""},{"Key":"LinkedIn","Value":""},{"Key":"Facebook","Value":""},{"Key":"Unit","Value":"11"},{"Key":"Street","Value":"11510 Blondo St Suite 102"},{"Key":"City","Value":"Omaha"},{"Key":"Region","Value":""},{"Key":"Country","Value":"United States"},{"Key":"PostalCode","Value":"11111"},{"Key":"PreferredTimeZone","Value":"Dateline Standard Time"},{"Key":"PreferredLocale","Value":""}],"FirstName":" Magenta Leigh","LastName":"Brown","PortalID":4,"Role":null,"UserID":26182,"Username":"Magenta.Brown@test.com"},{"Extrinsics":[{"Key":"CustomProperty1","Value":""},{"Key":"CustomProperty2","Value":""},{"Key":"CustomProperty3","Value":""},{"Key":"Prefix","Value":""},{"Key":"FirstName","Value":" Mario"},{"Key":"MiddleName","Value":""},{"Key":"LastName","Value":"Brown"},{"Key":"Biography","Value":""},{"Key":"Photo","Value":""},{"Key":"Telephone","Value":""},{"Key":"Cell","Value":""},{"Key":"Fax","Value":""},{"Key":"Website","Value":""},{"Key":"IM","Value":""},{"Key":"Twitter","Value":""},{"Key":"Skype","Value":""},{"Key":"LinkedIn","Value":""},{"Key":"Facebook","Value":""},{"Key":"Unit","Value":""},{"Key":"Street","Value":""},{"Key":"City","Value":""},{"Key":"Region","Value":""},{"Key":"Country","Value":""},{"Key":"PostalCode","Value":""},{"Key":"PreferredTimeZone","Value":""},{"Key":"PreferredLocale","Value":""}],"FirstName":" Mario","LastName":"Brown","PortalID":4,"Role":null,"UserID":25500,"Username":"Mario.Brown@test.com"}];
            angular.forEach(testResults, function(employee) {
             _extendEmployee(employee, recipientList);
            });
            _then(success, testResults);*/
        };

        var _getPortalID = function(username, success) {
            //Make service call here

            var portalID = 1;
            _then(success, portalID);
        };

        return {
            search: _search,
            getPortalID: _getPortalID
        }
    }]);