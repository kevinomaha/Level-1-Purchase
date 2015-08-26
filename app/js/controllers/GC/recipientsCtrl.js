four51.app.controller('RecipientsCtrl', ['$routeParams', '$sce', '$scope', '$451', '$filter', '$rootScope', '$location', 'EmployeeSearch', 'Customization', 'Address', 'AddressList', 'AddressValidate', 'Resources', 'ExistingAddress',
    function ($routeParams, $sce, $scope, $451, $filter, $rootScope, $location, EmployeeSearch, Customization, Address, AddressList, AddressValidate, Resources, ExistingAddress) {

        $scope.recipientListOptions = {};
        var productName = Customization.getProduct().Name;
        if ($scope.BuyerSettings.Recipients.Groups[productName]) {
            angular.forEach($scope.BuyerSettings.Recipients.Groups[productName], function(value, key) {
                $scope.recipientListOptions[key] = value;
            });
        }
        else {
            angular.forEach($scope.BuyerSettings.Recipients, function(value, key) {
                if (key != 'Groups') {
                    $scope.recipientListOptions[key] = value;
                }
            });
        }
        if ($scope.BuyerSettings.Recipients.Groups) {
            angular.forEach($scope.user.Groups, function(group) {
                if ($scope.BuyerSettings.Recipients.Groups[group.Name]) {
                    angular.forEach($scope.BuyerSettings.Recipients.Groups[group.Name], function(v, k) {
                        $scope.recipientListOptions[k] = v;
                    });
                }
            });
        }

        $scope.recipientListMode = null;
        $scope.recipientListMethodCount = 0;
        angular.forEach($scope.recipientListOptions, function(value, key) {
            if (value) {
                $scope.recipientListMethodCount++;
                if (!$scope.recipientListMode) $scope.recipientListMode = key;
            }
        });

        $scope.changeListMode = function(mode) {
            $scope.recipientListMode = mode;
        };

        //$scope.newRecipient = false;
        $scope.$watch('recipientListMode', function(newval, oldval) {
            if (newval != 'Manual' && oldval != 'Upload') $scope.cancelEditRecipient();
        });

        $scope.recipientsReady = false;
        $scope.selectedProduct = Customization.getProduct();
        $scope.selectedProduct.Name = $scope.selectedProduct.Name ? $scope.selectedProduct.Name : "";
        $scope.selectedProduct.Name = $scope.selectedProduct.Name.replace('<sup>&reg;</sup>', '')

        $scope.recipientList = Customization.getRecipients();
        Customization.validateRecipientList($scope.recipientList);


        function getAddresses() {
            AddressList.query(function(list) {
                $scope.addresses = list;
            });
        }
        getAddresses();

        $scope.countries = Resources.countries;
        $scope.states = Resources.states;

        $scope.country = function(item) {
            if (!$scope.tempRecipient.Address || !$scope.tempRecipient.Address.Country) {
                return 'US';
            } else {
                return $scope.tempRecipient.Address.Country == item.country;
            }
        };

        $scope.$watch('tempRecipient.Address.Country', function(newVal) {
            if (!newVal) return;
            angular.forEach($scope.states, function(state) {
                if (state.value === $scope.tempRecipient.Address.State) {
                    if (state.country !== $scope.tempRecipient.Address.Country) {
                        $scope.tempRecipient.Address.State = null;
                    }
                }
            });
            //$scope.tempRecipient.Address.State = null;
        });

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
                    if (newEmployeeCount(data) > 0) {
                        $scope.employees = data;
                        $scope.searchIndicator = false;
                    }
                    else {
                        $scope.searchError = "No results were returned. Please try again.";
                    }
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

        function newEmployeeCount(list) {
            var count = 0;
            angular.forEach(list, function(employee) {
                if (!employee.Added) count++;
            });
            return count;
        }

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
            $scope.changeListMode('Manual');
            angular.forEach($scope.recipientList.List, function(r) {
                if (r.UserID == recipient.UserID) {
                    r.BeingEdited = true;
                }
            });
            $scope.tempRecipient = angular.copy(recipient);
            //$scope.newRecipient = recipient.Manual;
            $scope.tempRecipient.Address = recipient.Address ? angular.copy(recipient.Address) : {IsShipping: true, IsBilling: true};
        };

        function randomString() {
            var chars = "0123456789";
            var string_length = 10;
            var randomstring = '';
            for (var i=0; i<string_length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum,rnum+1);
            }
            return randomstring;
        }

        $scope.saveIndicator = false;

        $scope.saveRecipient = function(tempRecipient) {
            $scope.saveIndicator = true;
            if (tempRecipient.BeingEdited) {
                if (tempRecipient.BeingEdited === true) {
                    angular.forEach($scope.recipientList.List, function(r, index) {
                        if (r.BeingEdited === true) {
                            $scope.recipientList.List.splice(index, 1);
                        }
                    });
                }
            }
            tempRecipient.BeingEdited = false;
            tempRecipient.Address.AddressName = tempRecipient.Address.Street1;
            tempRecipient.Address.IsShipping = true;
            if (!tempRecipient.UserID) {
                tempRecipient.UserID = (tempRecipient.EmployeeNumber || randomString());
                tempRecipient.Manual = true;
            }
            $scope.addressMessage = null;
            $scope.newAddress = null;
            if (tempRecipient.Address.IsShipping) {
                AddressValidate.validate(tempRecipient.Address,
                    function (address, newAddress) {
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
                    function (ex) {
                        $scope.saveIndicator = false;
                    });
                //Use this when the Address Validation service is down
                //$scope.saveOriginalAddress();
            }
            else {
                $scope.saveOriginalAddress();
            }
            //$scope.newRecipient = false;
        };

        $scope.saveDigitalRecipient = function(tempRecipient){
            if (tempRecipient.BeingEdited) {
                if (tempRecipient.BeingEdited === true) {
                    angular.forEach($scope.recipientList.List, function(r, index) {
                        if (r.BeingEdited === true) {
                            $scope.recipientList.List.splice(index, 1);
                        }
                    });
                }
            }
            if (!tempRecipient.UserID) {
                tempRecipient.UserID = (tempRecipient.EmployeeNumber || randomString());
                tempRecipient.Manual = true;
            }
            $scope.tempRecipient.BeingEdited = false;
            $scope.recipientList.List.push($scope.tempRecipient);
            Customization.saveEmailAddress(tempRecipient, $scope.recipientList);
            angular.forEach($scope.recipientList.List, function(recipient) {
                recipient.BeingEdited = false;
            });
            $scope.tempRecipient = {};
            //$scope.newRecipient = false;
        };

        $scope.saveAnonRecipient = function() {
            var anonRecipient = {};
            anonRecipient.BeingEdited = false;
            angular.forEach($scope.addresses, function(a){
                if(a.CompanyName == "GiftCertificates.com"){
                    anonRecipient.Address = a;
                }
            });
            anonRecipient.Address.IsShipping = true;
            if (!anonRecipient.UserID) {
                anonRecipient.UserID = "Anon-" + randomString();
                anonRecipient.Manual = true;
                anonRecipient.Anon = true;
            }
            $scope.saveIndicator = true;
            Address.save(anonRecipient.Address, function(data) {
                $scope.recipientList.List.push(anonRecipient);
                Customization
                    .setAddress(data, anonRecipient, $scope.recipientList)
                    .validateRecipientList($scope.recipientList)
                    .setRecipients($scope.recipientList);
                $scope.saveIndicator = false;
                clearRecipient();
                getAddresses();
                $scope.goToCustomization();
            });
        };

        $scope.saveOriginalAddress = function() {
            $scope.saveIndicator = true;
            Address.save($scope.tempRecipient.Address, function(data) {
                $scope.recipientList.List.push($scope.tempRecipient);
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
            $scope.newAddress.AddressName = $scope.newAddress.Street1;
            $scope.newAddress.IsShipping = true;
            Address.save($scope.newAddress , function(data) {
                $scope.recipientList.List.push($scope.tempRecipient);
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
            //$scope.newRecipient = ($scope.recipientListMode == 'Manual');
            //$scope.newRecipient = false;
            clearRecipient();
            Customization
                .validateRecipientList($scope.recipientList)
                .setRecipients($scope.recipientList);
        };

        $scope.cancelEditRecipientDigital = function(){
            clearRecipient();
            $scope.allEmailPresent();
            Customization.setRecipients($scope.recipientList);
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
        $scope.setAnonRecipient = function(){
            $scope.saveAnonRecipient();
        };

        $scope.goToCustomization = function() {
            switch($scope.selectedProduct.ProductType) {
                case "Digital":
                    $location.path('supercertificate');
                    break;
                case "Original":
                    $location.path('supercertificate');
                    break;
                case "Greeting Card":
                    $location.path('supercertificate');
                    break;
                case "e-Cards":
                    $location.path('ecard');
                    break;
                case "Visa":
                    $location.path('visa');
                    break;
                case "eCodes":
                    $location.path('ecodes');
                    break;
                default:
                    $location.path('catalog/' + $scope.selectedProduct.InteropID);
            }
        };

        $scope.allEmailPresent = function(){
            var k=0;
            if($scope.selectedProduct.IsDigital)
            {
                angular.forEach($scope.recipientList.List, function(recipient) {
                    if(recipient.RecipientEmailAddress){
                        k++;
                        recipient.Valid=true;
                    }
                });
                if(k==$scope.recipientList.List.length)
                    return "true";
                else
                    return "false";
            }
        };

        $scope.emailPresent = function(recipient){
            if(recipient.RecipientEmailAddress) {
                recipient.selected = true;
                return "true";
            }
            else
                return "false";
        };

        $scope.clearSearch = function() {
            $scope.searchCriterion = {};
            $scope.employees = [];
        };

        $scope.ifMerchant = function(){
            if($scope.selectedProduct.ProductType=="Merchant")
                return "true";
            else
                return "false";
        };

        //Recipient Upload

        var randomString = function () {
            var chars = "0123456789abcdefghijklmnop";
            var string_length = 7;
            var randomstring = '';
            for (var i = 0; i < string_length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum, rnum + 1);
            }
            return randomstring;
        };

        $scope.savingRecipientsLoadingIndicator = false;

        $scope.generateRecipients = function (list) {
            $scope.savingRecipientsLoadingIndicator = true;
            this.recipientPasteList = [];
            var addresses = [];
            for (var i = 0; i < list.length; i++) {
                var recipient = {};
                recipient = list[i];
                recipient.UserID = randomString();
                var address = angular.copy(recipient.Address);

                ExistingAddress.check($scope.addresses, address);

                if (recipient.Address.Street1 && !recipient.AddressInvalid) {
                    if (!address.IsExisting) {
                        recipient.ShipAddressID = null;
                        if (addresses.length == 0) {
                            addresses.push(address);
                        }
                        else {
                            address.matchCount = 0;
                            for (var a = 0; a < addresses.length; a++) {
                                var add = addresses[a];
                                if (address.AddressName == add.AddressName && address.FirstName == add.FirstName && address.LastName == add.LastName &&
                                    address.Street1 == add.Street1 && address.Street2 == add.Street2 && address.City == add.City && address.State == add.State &&
                                    address.Zip == add.Zip && address.Country == add.Country) {
                                    address.matchCount++;
                                }
                            }
                            if (address.matchCount == 0) {
                                addresses.push(address);
                            }
                        }
                    }
                    else {
                        recipient.Address = address;
                    }
                }

                $scope.recipientList.List.push(recipient);
            }

            var assignAddresses = function () {
                Customization
                    .assignAddresses($scope.recipientList, $scope.addresses)
                    .validateRecipientList($scope.recipientList)
                    .setRecipients($scope.recipientList);
                $("#myPasteBox").val('');
                $scope.savingRecipientsLoadingIndicator = false;
            };

            var addressSaveCount = 0;
            for (var i = 0; i < addresses.length; i++) {
                Address.save(addresses[i], function (add) {
                    $scope.addresses.push(add);
                    addressSaveCount++;
                    if (addressSaveCount == addresses.length) assignAddresses();
                });
            }
            if (addresses.length == 0) {
                Customization
                    .assignAddresses($scope.recipientList, $scope.addresses)
                    .validateRecipientList($scope.recipientList)
                    .setRecipients($scope.recipientList);
                $("#myPasteBox").val('');
                $scope.savingRecipientsLoadingIndicator = false;
            }
        };

        $scope.cancelUpload = function () {
            $rootScope.$broadcast('event:cancelUpload');
        };

    }]);