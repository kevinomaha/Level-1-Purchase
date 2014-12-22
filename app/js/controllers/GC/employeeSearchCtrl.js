four51.app.controller('EmployeeSearchCtrl', ['$routeParams', '$sce', '$scope', '$451', '$rootScope', '$location', 'EmployeeSearch', 'Customization', 'Address', 'AddressList', 'AddressValidate', 'Resources',
    function ($routeParams, $sce, $scope, $451, $rootScope, $location, EmployeeSearch, Customization, Address, AddressList, AddressValidate, Resources) {

        $scope.recipientsReady = false;
        $scope.selectedProduct = Customization.getProduct();
        //console.log($scope.selectedProduct);
        $scope.selectedProduct.Name = $scope.selectedProduct.Name ? $scope.selectedProduct.Name : "";

        $scope.recipientList = Customization.getRecipients();
        Customization.validateRecipientList($scope.recipientList);

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
            areRecipientsReady();
        };

        $scope.removeRecipient = function(recipient) {
            Customization
                .removeRecipient(recipient, $scope.recipientList)
                .validateRecipientList($scope.recipientList)
                .setRecipients($scope.recipientList);
            console.log("calling areRecipientsReady from removeRecipient");
            areRecipientsReady();
        };

        $scope.tempRecipient = {};
        $scope.editRecipient = function(recipient) {
            angular.forEach($scope.recipientList.List, function(r) {
                if (r.UserID == recipient.UserID) {
                    r.BeingEdited = true;
                }
            });
            $scope.tempRecipient = angular.copy(recipient);
            $scope.tempRecipient.Address = recipient.Address ? angular.copy(recipient.Address) : {IsShipping: true, IsBilling: true};
        };

        $scope.saveIndicator = false;
        $scope.saveRecipient = function(tempRecipient) {
            console.log("inside saveRecipient");
            $scope.saveIndicator = true;
            tempRecipient.Address.AddressName = tempRecipient.Address.Street1;
            $scope.addressMessage = null;
            $scope.newAddress = null;
            if (tempRecipient.Address.Country == 'US' && tempRecipient.Address.IsShipping && !tempRecipient.Address.ID) {
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

            console.log("calling areRecipientsReady from saveRecipient"+ $scope.recipientList);
            areRecipientsReady();
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
            angular.forEach($scope.recipientList.List, function(recipient) {
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

        function areRecipientsReady() {
            Customization.validateRecipientList($scope.recipientList);
            var list = recipientList.List;
            if( ($scope.selectedProduct.ProductType == "Digital" || $scope.selectedProduct.ProductType == "e-Cards")&& list.length>0 ) {
                console.log($scope.selectedProduct.ProductType);
                var j=0;
                for(var i=0; i<list.length; i++) {
                    console.log(list[i]);
                    if (list[i].EmailAddress)
                    {
                        // check the pattern of the email address and if needed get new from user
                        j++;
                        console.log("in if" + j);
                    }
                    else
                    {
                        console.log("in else");
                        $scope.onlyEmail = true; // for getting emailaddress from user in case not present already
                    }
                }
                if(j==list.length) {
                    console.log( "recipientList.List.length:" + list.length );
                    $scope.recipientsReady = true;
                }
            }
            else if ( ($scope.selectedProduct.ProductType == "Original" | $scope.selectedProduct.ProductType == "Visa")&& list.length>0 ){
                console.log($scope.selectedProduct.ProductType);
                var j=0;
                for( var i=0; i<list.length; i++ ) {
                    console.log(list[i]);
                    console.log("checking if user " + list[i].FirstName + "is valid:" + list[i].Valid + "ValidCount" + list.ValidCount );
                    if(list[i].Valid){
                        console.log("inside the if condition");
                        j++;
                    }
                }
                console.log("outside for loop");
                if( j==list.length )
                    $scope.recipientsReady = true;
            }
            console.log("at the end recipientsready is: " + $scope.recipientsReady );
        }


        $scope.goToCustomization = function() {
            switch($scope.selectedProduct.ProductType) {
                case "Digital":
                    $location.path('supercertificate');
                    break;
                case "Original":
                    $location.path('supercertificate');
                    break;
                case "e-Cards":
                    $location.path('ecard');
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