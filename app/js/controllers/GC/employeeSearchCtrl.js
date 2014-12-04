four51.app.controller('EmployeeSearchCtrl', ['$routeParams', '$sce', '$scope', '$451', '$rootScope', '$location', 'EmployeeSearch', 'Customization', 'Address', 'AddressList', 'AddressValidate', 'Resources',
    function ($routeParams, $sce, $scope, $451, $rootScope, $location, EmployeeSearch, Customization, Address, AddressList, AddressValidate, Resources) {

        $scope.selectedProduct = Customization.getProduct();
        $scope.selectedProduct.Name = $scope.selectedProduct.Name ? $scope.selectedProduct.Name : "";

        $scope.recipientList = Customization.getRecipients();
        Customization.validateRecipientList($scope.recipientList)

        $scope.searchCriterion = {};
        $scope.employees = [];
        $scope.searchError = "";
        $scope.searchIndicator = false;
        $scope.seachEmployees = function(searchCriterion) {
            $scope.searchIndicator = true;
            $scope.searchError = "";
            $scope.employees = [];
            if (objKeyCount(searchCriterion) > 0) {
                EmployeeSearch.search(searchCriterion, $scope.user, $scope.recipientList, function(data) {
                    $scope.employees = data;
                        $scope.searchIndicator = false;
                },
                function() {
                    $scope.searchError = "No results were returned. Please try again.";
                    $scope.searchIndicator = false;
                });
            }
            else {
                $scope.searchError = "You must enter at least one search criterion";
                $scope.searchIndicator = false;
            }
        };

        function objKeyCount(obj) {
            var count = 0;
            angular.forEach(obj, function(key) {
                if (key && key != "") {
                    count++;
                }
            });
            return count;
        }


        $scope.selectEmployee = function(employee) {
            Customization
                .addRecipient(employee, $scope.recipientList)
                .validateRecipientList($scope.recipientList)
                .setRecipients($scope.recipientList);
        };

        $scope.removeRecipient = function(recipient) {
            Customization
                .removeRecipient(recipient, $scope.recipientList)
                .validateRecipientList($scope.recipientList)
                .setRecipients($scope.recipientList);
        };

        $scope.tempRecipient = {};
        $scope.editRecipient = function(recipient) {
            angular.forEach($scope.recipientList, function(recipient) {
                recipient.BeingEdited = false;
            });
            recipient.BeingEdited = true;
            $scope.tempRecipient = angular.copy(recipient);
            $scope.tempRecipient.Address = recipient.Address ? angular.copy(recipient.Address) : {IsShipping: true, IsBilling: true};
        };

        $scope.saveIndicator = false;
        $scope.saveRecipient = function(tempRecipient) {
            $scope.saveIndicator = true;
            tempRecipient.Address.AddressName = tempRecipient.Address.Street1;
            $scope.addressMessage = null;
            $scope.newAddress = null;
            if (tempRecipient.Address.Country == 'US' && tempRecipient.Address.IsShipping) {
                AddressValidate.validate(tempRecipient.Address,
                    function(address,newAddress) {
                        if (address.status == "Valid") {
                            $scope.saveOriginalAddress();
                        }
                        else if (address.status == "ValidWithRecommendation") {
                            $scope.newAddress = newAddress;
                            $scope.addressMessage = "This is the suggested address based on the information provided.";
                        }
                        else if (address.status == "Invalid") {
                            $scope.addressMessage = "This address is invalid."
                        }
                        else if (address.status == "Error") {
                            $scope.addressMessage = address.response;
                        }
                        $scope.saveIndicator = false;
                    },
                    function(ex) {
                        $scope.saveIndicator = false;
                    });
                //Use this when the Address Validation service is down
                //$scope.saveOriginalAddress();
            }
            else {
                $scope.saveOriginalAddress();
            }
        };

        $scope.saveOriginalAddress = function() {
            $scope.saveIndicator = true;
            Address.save($scope.tempRecipient.Address, function(data) {
                Customization
                    .setAddress(data, $scope.tempRecipient, $scope.recipientList)
                    .validateRecipientList($scope.recipientList)
                    .setRecipients($scope.recipientList);
                $scope.saveIndicator = false;
                clearRecipient();
                getAddresses();
            });
        };

        $scope.saveRecommendedAddress = function() {
            $scope.saveIndicator = true;
            Address.save($scope.newAddress , function(data) {
                Customization
                    .setAddress(data, $scope.tempRecipient, $scope.recipientList)
                    .validateRecipientList($scope.recipientList)
                    .setRecipients($scope.recipientList);
                clearRecipient();
                $scope.saveIndicator = false;
                getAddresses();
            });
        };

        $scope.cancelEditRecipient = function() {
            clearRecipient();
            Customization
                .validateRecipientList($scope.recipientList)
                .setRecipients($scope.recipientList);
        };

        function clearRecipient() {
            angular.forEach($scope.recipientList, function(recipient) {
                recipient.BeingEdited = false;
            });
            $scope.tempRecipient = {};
            $scope.existingAddress = {};
            $scope.addressMessage = null;
            $scope.newAddress = null;
        }

        $scope.useExistingAddress = function() {
            var address = angular.copy($scope.existingAddress);
            var assignToAll = $scope.tempRecipient.Address ? $scope.tempRecipient.Address.AssignToAll : false;
            $scope.tempRecipient.Address = address;
            $scope.tempRecipient.Address.AssignToAll = assignToAll;
        };

        $scope.goToCustomization = function() {
            switch($scope.selectedProduct.ProductType) {
                case "Digital":
                    $location.path('customizationStep1');
                    break;
                case "Original":
                    $location.path('customizationStep1'); //should be updated to new path or this step should be dynamic
                    break;
                case "e-Cards":
                    $location.path('customizationStep1'); //should be updated to new path or this step should be dynamic
                    break;
                case "Visa":
                    $location.path('visa');
                    break;
                default:
                    $location.path('catalog/' + $scope.selectedProduct.InteropID);
            }
        };

        $scope.clearSearch = function() {
            $scope.searchCriterion = {};
            $scope.employees = [];
        };

        $scope.countries = Resources.countries;
        $scope.states = Resources.states;

        function getAddresses() {
            AddressList.query(function(list) {
                $scope.addresses = list;
            });
        }
        getAddresses();
    }]);