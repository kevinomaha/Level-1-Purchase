four51.app.controller('MainGCPurchaseCtrl', ['$routeParams', '$sce', '$rootScope', '$scope', '$location', '$451', 'Security', 'Category', 'Product', 'Address', 'AddressList', 'Resources', 'RecipientList', 'Variant', 'Order', 'User', 'AddressValidate', 'LogoOptions', 'CategoryDescription', 'ExistingAddress', 'LineItems', 'CustomAddressList', 'Customization', 'ProductList',
function ($routeParams, $sce, $rootScope, $scope, $location, $451, Security, Category, Product, Address, AddressList, Resources, RecipientList, Variant, Order, User, AddressValidate, LogoOptions, CategoryDescription,ExistingAddress,LineItems, CustomAddressList, Customization, ProductList) {

    $scope.productList = ProductList.products;
    var today = new Date();
    $scope.currentDate = angular.copy(today);
    $scope.maxDate = today.setDate(today.getDate() + 120);

    $scope.selectProduct = function (product) {
        $rootScope.$broadcast('event:ProductSelected', product);
        // Affects cartCtrl.js line 343
        //$scope.productType != 'MerchantCards' ? $scope.step = 2 : $location.path('catalog/L1slctv2MGC3');
        Customization.setProduct(product);
        Customization.clearRecipients();
        $location.path('recipients');
    };

    $scope.$on('treeComplete', function() {
        //merge code for actual catalog values against hardcoded top level product list
        angular.forEach($scope.productList, function(pval) {
            angular.forEach($scope.tree, function(tval, tindex) {
                if (pval.InteropID == tval.InteropID) {
                    //$scope.tree[tindex] = angular.extend(tval,pval);
                    $scope.tree[tindex].StandardID = pval.StandardID;
                    $scope.tree[tindex].PremiumID = pval.PremiumID;
                    $scope.tree[tindex].CanadianID = pval.CanadianID;
                    $scope.tree[tindex].HolidayID = pval.HolidayID;
                    $scope.tree[tindex].PremiumHolidayID = pval.PremiumHolidayID;
                    $scope.tree[tindex].ProductType=  pval.ProductType;
                }
            });
        });
    });

    $scope.selectAllRecipients = "true";

    $scope.selectedProductDetails = store.get("451Cache.SelectedProductDetails") ? store.get("451Cache.SelectedProductDetails") : {};

    function getPersonalMessages(variants) {
        var variantArray = [];
        var startIndex = variants.length > 10 ? (variants.length - 10) : 0;
        var stopIndex = variants.length;

        if (variants.length > 0) {
            for (var i = startIndex; i <= stopIndex; i++) {
                if (variants[i] && variants[i].InteropID) {
                    variantArray.push(variants[i].InteropID);
                }
            }
        }

        $scope.selectedProductDetails.PersonalMessages = [];

        /*for (var v = 0; v < variantArray.length; v++) {
            Variant.get({VariantInteropID: variantArray[v], ProductInteropID: $scope.selectedProduct.StandardID}, function (data) {
                if ($scope.selectedProductDetails.PersonalMessages) {
                    switch ($scope.selectedProduct.StandardID) {
                        case "SCD002-GC1-02":
                            if ($scope.selectedProductDetails.PersonalMessages.indexOf(data.Specs['V04PersonalMessage'].Value) == -1 && data.Specs['V04PersonalMessage'].Value != "") {
                                $scope.selectedProductDetails.PersonalMessages.push(data.Specs['V04PersonalMessage'].Value);
                            }
                            break;
                        case "SCP002-FD1-02":
                            if ($scope.selectedProductDetails.PersonalMessages.indexOf(data.Specs['V15Message'].Value) == -1 && data.Specs['V15Message'].Value != "") {
                                $scope.selectedProductDetails.PersonalMessages.push(data.Specs['V15Message'].Value);
                            }
                            break;
                        case "SCP-GC2":
                            if ($scope.selectedProductDetails.PersonalMessages.indexOf(data.Specs['V04PersonalMessage'].Value) == -1 && data.Specs['V04PersonalMessage'].Value != "") {
                                $scope.selectedProductDetails.PersonalMessages.push(data.Specs['V04PersonalMessage'].Value);
                            }
                            break;
                    }
                }
                store.set("451Cache.SelectedProductDetails", $scope.selectedProductDetails);
            }, function (ex) {
                $scope.selectedProductDetails.PersonalMessages = [];
            });
        }*/
    }

    var _extendProduct = function (product, lineitem) {
        $scope.selectedProduct = angular.copy(product);
        $scope.selectedProductDetails = {};
        $scope.selectedProduct.occasionMessage = null;
        $scope.selectedProduct.occasionMessageID = null;
        $scope.selectedProduct.imageName = null;
        $scope.selectedProduct.designSelection = null;
        $scope.selectedProduct.selectedDesignID = null;
        $scope.selectedProduct.OpeningMessageOption = 'None';
        $scope.occasionMessages = [];

        angular.forEach($scope.productList, function(pval, pindex) {
            if (pval.InteropID == $scope.selectedProduct.InteropID) {
                //$scope.tree[tindex] = angular.extend(tval,pval);
                $scope.selectedProduct.StandardID = pval.StandardID;
                $scope.selectedProduct.PremiumID = pval.PremiumID;
                $scope.selectedProduct.CanadianID = pval.CanadianID;
                $scope.selectedProduct.HolidayID = pval.HolidayID;
                $scope.selectedProduct.PremiumHolidayID = pval.PremiumHolidayID;
                return;
            }
        });
        if (!$scope.selectedProduct.StandardID) {
            console.warn("Could not find stored IDs for the selected product: " + $scope.selectedProduct.Name);
        }
        else {
            $scope.digitalProduct = $scope.selectedProduct.StandardID.indexOf("SCD") > -1 ? true : false;
        }

        if (lineitem) {
            $scope.checkForLogos();
        }

        product.IsDigital = (product.Name.indexOf('Digital') > -1 || product.Name.indexOf('e-') > -1);

        console.log(product.ProductType);
        switch (product.ProductType) {
            case "DigitalSC":
                $scope.digitalProduct = true;
                $scope.physicalProduct = false;
                $scope.merchantCards = false;
                $scope.productType = "DigitalSuperCert";
                $scope.selectedProductType = 'Standard';
                $scope.selectedProduct.InteropID = product.InteropID;
                break;
            case "OriginalSC":
                $scope.digitalProduct = false;
                $scope.physicalProduct = true;
                $scope.merchantCards = false;
                $scope.productType = "PhysicalSuperCert";
                $scope.selectedProductType = 'Standard';
                $scope.selectedProduct.InteropID = product.InteropID;
                break;
            case "e-card":
                $scope.digitalProduct = true;
                $scope.physicalProduct = false;
                $scope.merchantCards = false;
                $scope.productType = "eCard";
                $scope.selectedProductType = 'Standard';
                $scope.selectedProduct.InteropID = product.InteropID;
                break;
            case "MerchantCards":
                $scope.digitalProduct = false;
                $scope.physicalProduct = false;
                $scope.merchantCards = true; 
                $scope.productType = "MerchantCards";
                $scope.selectedProductType = "MerchantCards";
                $scope.selectedProduct.InteropID = "MerchantCards";
            case "Visa":
                $scope.digitalProduct = false;
                $scope.physicalProduct = true;
                $scope.merchantCards = false;
                $scope.productType = "PrePaid";
                $scope.selectedProductType = "Standard";
                $scope.selectedProduct.InteropID = product.InteropID;
        }


        if ($scope.selectedProduct.StandardID && $scope.selectedProduct.StandardID != "MerchantCards") {
            if ($scope.selectedProductDetails) {
                $scope.selectedProductDetails.Variants = [];
                $scope.selectedProductDetails = {};
            }
            var productList = $scope.selectedProduct;
            Product.get($scope.selectedProduct.StandardID, function (product) {
                $scope.selectedProductDetails = angular.copy(product);
                product.ProductList = productList;
                Customization.setProduct(product);
                //Call function to obtain variant information and save personal messages
                getPersonalMessages($scope.selectedProductDetails.Variants);
                if (lineitem) {
                    var type = LineItems.getProductType(lineitem);
                    $scope.$broadcast('event:ProductTypeSelected', type, lineitem);
                }
            });
        }
        else if ($scope.selectedProduct.StandardID == "MerchantCards" && $scope.tree) {
            for (var c = 0; c < $scope.tree.length; c++) {
                if ($scope.tree[c].Name == "Merchant Gift Cards") {
                    $scope.merchantCardCategories = $scope.tree[c].SubCategories;
                }
            }
            $scope.merchantProducts = null;
            $scope.selectedProduct.selectedMerchantCategory = null;
        }

        store.set("451Cache.SelectedProduct", $scope.selectedProduct);
        store.set("451Cache.SelectedProductType", $scope.selectedProductType);
        store.set("451Cache.SelectedProductDetails", $scope.selectedProductDetails);
        store.set("451Cache.SelectedProductInteropID", $scope.selectedProduct.InteropID);
    };

    $scope.$on('event:ProductSelected', function (event, product, lineitem) {
        _extendProduct(product, lineitem);
        RecipientList.validate($scope.recipientList, $scope.digitalProduct);
        store.set("451Cache.RecipientList", $scope.recipientList);
        $scope.selectedProduct = product;
    });

    $scope.selectedProduct = store.get("451Cache.SelectedProduct") ? store.get("451Cache.SelectedProduct") : {};


    if ($scope.selectedProduct.StandardID) {
        _extendProduct($scope.selectedProduct);
    }

    $scope.addType = 'manual';

    $scope.digitalAddressID = null;
    if (Security.isAuthenticated()) {
        CustomAddressList.getall(function (list) {
            $scope.addresses = list;
            angular.forEach(list, function (a) {
                if (a.IsShipping && !a.IsCustEditable) {
                    $scope.digitalAddressID = a.ID;
                }
            });
        });
    }

    $scope.editAdditionalInformation = false;

    $scope.clearRecipient = function (r) {
        var country = $scope[r] ? $scope[r].Country : "US";

        $scope[r] = {
            FirstName: null, LastName: null, RecipientID: null, Email: null, ShipToFirstName: null, ShipToLastName: null, ShipToCompanyName: null,
            Street1: null, Street2: null, City: null, State: null, Zip: null, Country: country, Phone: "", Invalid: false, ErrorMessage: null, Selected: false, AwardCount: 0, ShipAddressID: null
        };

        if (r == 'recipient' && $scope.recipient_form) {
            $scope.recipient_form.$setPristine();
        }
    };

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

    $scope.clearRecipient('recipient');


    $scope.isDesktop = function () {
        var result = window.innerWidth >= 992;
        return result;
    };

    $rootScope.showMaker = true;

    $scope.countries = Resources.countries;
    $scope.states = Resources.states;
    $scope.country = function (item) {
        return $scope.recipient != null ? $scope.recipient.Country == item.country : false;
    };

    $scope.saveRecipient = function () {
        var recipient = $scope.recipient;
        recipient.savingIndicator = true;
        recipient['ID'] = randomString();
        var address = {};
        if (recipient.Street1 && recipient.Street1 != "" && !recipient.ShipAddressID) {
            address.AddressName = recipient.Street1;
            address.FirstName = recipient.ShipToFirstName;
            address.LastName = recipient.ShipToLastName;
            address.Street1 = recipient.Street1;
            address.Street2 = recipient.Street2;
            address.City = recipient.City;
            address.State = recipient.State;
            address.Zip = recipient.Zip;
            address.Country = recipient.Country;
            address.IsShipping = true;
            address.IsBilling = false;

            ExistingAddress.check($scope.addresses, address);

            if (address.IsExisting) {
                recipient.ShipAddressID = address.AddressID;
                recipient.savingIndicator = false;
                $scope.recipientList.push(recipient);
                store.set("451Cache.RecipientList", $scope.recipientList);
                $scope.clearRecipient('recipient');
                AddressList.query(function (list) {
                    $scope.addresses = list;
                });
            }
            else {
                AddressValidate.validate(address, function (address, newAddress) {
                        $scope.$apply(function () {
                            if (address.status == "Valid") {
                                Address.save(address,
                                    function (add) {
                                        recipient.ShipAddressID = add.ID;
                                        $scope.recipientList.push(recipient);
                                        store.set("451Cache.RecipientList", $scope.recipientList);
                                        $scope.clearRecipient('recipient');
                                        AddressList.query(function (list) {
                                            $scope.addresses = list;
                                        });
                                    },
                                    function (ex) {
                                        //
                                    }
                                );
                            }
                            else if (address.status == "ValidWithRecommendation") {
                                $scope.recipient.newAddress = newAddress;
                                $scope.recipient.addressMessage = "This is the suggested address based on the information provided.";
                            }
                            else if (address.status == "Invalid") {
                                $scope.recipient.addressMessage = "This address is invalid."
                            }
                            recipient.savingIndicator = false;
                        });
                    },
                    function (ex) {
                        recipient.savingIndicator = false;
                    });
            }
        }
        else {
            recipient.savingIndicator = false;
            $scope.recipientList.push(recipient);
            store.set("451Cache.RecipientList", $scope.recipientList);
            $scope.clearRecipient('recipient');
            AddressList.query(function (list) {
                $scope.addresses = list;
            });
            recipient.savingIndicator = false;
        }
    };

    $scope.saveRecipientWithSuggestedAddress = function () {
        var recipient = $scope.recipient;
        recipient.Street1 = $scope.recipient.newAddress.Street1;
        recipient.Street2 = $scope.recipient.newAddress.Street2;
        recipient.City = $scope.recipient.newAddress.City;
        recipient.State = $scope.recipient.newAddress.State;
        recipient.Zip = $scope.recipient.newAddress.Zip;
        var address = angular.copy($scope.recipient.newAddress);
        address.IsShipping = true;
        address.IsBilling = false;
        $scope.recipient.newAddress = null;
        recipient.addressMessage = null;

        ExistingAddress.check($scope.addresses, address);

        if (address.IsExisting) {
            recipient.ShipAddressID = address.AddressID;
            recipient.savingIndicator = false;
            $scope.recipientList.push(recipient);
            store.set("451Cache.RecipientList", $scope.recipientList);
            $scope.clearRecipient('recipient');
            AddressList.query(function (list) {
                $scope.addresses = list;
            });
        }
        else {
            Address.save(address,
                function (add) {
                    recipient.ShipAddressID = add.ID;
                    $scope.recipientList.push(recipient);
                    store.set("451Cache.RecipientList", $scope.recipientList);
                    $scope.clearRecipient('recipient');
                    AddressList.query(function (list) {
                        $scope.addresses = list;
                    });
                },
                function (ex) {
                    //
                }
            );
        }
    };

    $scope.saveRecipientWithUserAddress = function () {
        var recipient = $scope.recipient;
        recipient.newAddress = null;
        recipient.addressMessage = null;
        var address = {};
        address.AddressName = $scope.recipient.Street1;
        address.FirstName = $scope.recipient.ShipToFirstName;
        address.LastName = $scope.recipient.ShipToLastName;
        address.Street1 = $scope.recipient.Street1;
        address.Street2 = $scope.recipient.Street2;
        address.City = $scope.recipient.City;
        address.State = $scope.recipient.State;
        address.Zip = $scope.recipient.Zip;
        address.Country = $scope.recipient.Country;
        address.IsShipping = true;
        address.IsBilling = false;

        ExistingAddress.check($scope.addresses, address);

        if (address.IsExisting) {
            recipient.ShipAddressID = address.AddressID;
            recipient.savingIndicator = false;
            $scope.recipientList.push(recipient);
            store.set("451Cache.RecipientList", $scope.recipientList);
            $scope.clearRecipient('recipient');
            AddressList.query(function (list) {
                $scope.addresses = list;
            });
        }
        else {
            Address.save(address,
                function (add) {
                    recipient.ShipAddressID = add.ID;
                    $scope.recipientList.push(recipient);
                    store.set("451Cache.RecipientList", $scope.recipientList);
                    $scope.clearRecipient('recipient');
                    AddressList.query(function (list) {
                        $scope.addresses = list;
                    });
                },
                function (ex) {
                    //
                }
            );

        }
    };

    $scope.editRecipient = function (recipient) {
        if ($scope.tempRecipient) $scope.cancelEditRecipient();
        $scope.step = 2;
        $scope.tempRecipient = angular.copy(recipient);
        $scope.recipient = recipient;
        $scope.editingRecipient = true;

        if (recipient.ShipAddressID) {
            angular.forEach($scope.addresses, function (address) {
                if (address.ID == recipient.ShipAddressID) {
                    $scope.existingAddress = address;
                }
            });
        }
        else {
            $scope.existingAddress = null;
        }

        var editingRecipientID = recipient.ID;
        for (var r = 0; r < $scope.recipientList.length; r++) {
            $scope.recipientList[r].BeingEdited = $scope.recipientList[r].ID == editingRecipientID;
        }
    };

    $scope.changeAddType = function (a) {
        $scope.addType = a;
        $('#myPasteBox').on('paste', function () {
            setTimeout(function () {
                $rootScope.$broadcast('event:recipientspasted');
            }, 5);
        });
        $("#uploadRecipients").bind('click', function () {
            $rootScope.$broadcast('event:generaterecipients');
        });
    };

    $scope.editRecipientSave = function () {
        RecipientList.validate($scope.recipientList, $scope.digitalProduct);
        var recipient = {};
        for (var r = 0; r < $scope.recipientList.length; r++) {
            if ($scope.recipientList[r].BeingEdited) {
                recipient = $scope.recipientList[r];
            }
        }
        if (recipient.Street1 && recipient.Street2 != "" && recipient.City && recipient.City != "" && recipient.State && recipient.State != "" && recipient.Zip && recipient.Zip != "" && recipient.Country && recipient.Country != "") {
            var address = {};
            address.AddressName = recipient.Street1;
            address.FirstName = recipient.ShipToFirstName;
            address.LastName = recipient.ShipToLastName;
            address.Street1 = recipient.Street1;
            address.Street2 = recipient.Street2;
            address.City = recipient.City;
            address.State = recipient.State;
            address.Zip = recipient.Zip;
            address.Country = recipient.Country;
            address.IsShipping = true;
            address.IsBilling = false;

            ExistingAddress.check($scope.addresses, address);

            if (address.IsExisting) {
                for (var r = 0; r < $scope.recipientList.length; r++) {
                    if ($scope.recipientList[r].BeingEdited) {
                        $scope.recipientList[r].ShipAddressID = address.AddressID;
                    }
                }
                $scope.clearRecipient('recipient');
                $scope.editingRecipient = false;
                for (var r = 0; r < $scope.recipientList.length; r++) {
                    $scope.recipientList[r].BeingEdited = false;
                }
                store.set("451Cache.RecipientList", $scope.recipientList);
                AddressList.query(function (list) {
                    $scope.addresses = list;
                });
            }
            else {
                Address.save(address,
                    function (add) {
                        for (var r = 0; r < $scope.recipientList.length; r++) {
                            if ($scope.recipientList[r].BeingEdited) {
                                $scope.recipientList[r].ShipAddressID = add.ID;
                                $scope.recipientList[r].BeingEdited = false;
                            }
                        }
                        store.set("451Cache.RecipientList", $scope.recipientList);
                        $scope.clearRecipient('recipient');
                        $scope.editingRecipient = false;
                        AddressList.query(function (list) {
                            $scope.addresses = list;
                        });
                    },
                    function (ex) {
                        //
                    }
                );
            }
        }
        else {
            for (var r = 0; r < $scope.recipientList.length; r++) {
                $scope.recipientList[r].BeingEdited = false;
            }
            store.set("451Cache.RecipientList", $scope.recipientList);
            $scope.clearRecipient('recipient');
            $scope.editingRecipient = false;
            AddressList.query(function (list) {
                $scope.addresses = list;
            });
        }
        $scope.clearRecipient('tempRecipient');
        $scope.clearRecipient('recipient');
    };

    $scope.cancelEditRecipient = function (recipient) {
        if ($scope.tempRecipient && $scope.tempRecipient.ID) {
            for (var i = 0; i < $scope.recipientList.length; i++) {
                if ($scope.recipientList[i].ID == $scope.tempRecipient.ID) {
                    $scope.recipientList[i] = $scope.tempRecipient;
                }
            }
        }
        $scope.clearRecipient('tempRecipient');
        $scope.clearRecipient('recipient');
        $scope.editingRecipient = false;
        AddressList.query(function (list) {
            $scope.addresses = list;
        });
        for (var r = 0; r < $scope.recipientList.length; r++) {
            $scope.recipientList[r].BeingEdited = false;
        }
        RecipientList.validate($scope.recipientList, $scope.digitalProduct);
        store.set("451Cache.RecipientList", $scope.recipientList);
    };

    $scope.deleteRecipient = function (recipient) {
        for (var i = 0; i < $scope.recipientList.length; i++) {
            if ($scope.recipientList[i].ID == recipient.ID) {
                $scope.recipientList.splice(i, 1);
                break;
            }
        }
        store.set("451Cache.RecipientList", $scope.recipientList);
    };

    $scope.useExistingAddress = function () {
        var address = this.existingAddress;
        if (address) {
            $scope.recipient.Street1 = address.Street1;
            $scope.recipient.Street2 = address.Street2;
            $scope.recipient.City = address.City;
            $scope.recipient.State = address.State;
            $scope.recipient.Zip = address.Zip;
            $scope.recipient.Country = address.Country;
            $scope.recipient.ShipToFirstName = address.FirstName;
            $scope.recipient.ShipToLastName = address.LastName;
            $scope.recipient.ShipToCompanyName = address.CompanyName;
            $scope.recipient.ShipAddressID = address.ID;
        }
        else {
            $scope.recipient.Street1 = "";
            $scope.recipient.Street2 = "";
            $scope.recipient.City = "";
            $scope.recipient.State = "";
            $scope.recipient.Zip = "";
            $scope.recipient.Country = "";
            $scope.recipient.ShipToFirstName = "";
            $scope.recipient.ShipToLastName = "";
            $scope.recipient.ShipToCompanyName = "";
        }
    };

    $scope.savingRecipientsLoadingIndicator = false;

    $scope.generateRecipients = function (list) {
        $scope.savingRecipientsLoadingIndicator = true;
        this.recipientPasteList = [];
        var addresses = [];
        for (var i = 0; i < list.length; i++) {
            var recipient = {};
            recipient = list[i];
            recipient['ID'] = randomString();
            var address = {};
            address.AddressName = recipient.Street1;
            address.FirstName = recipient.ShipToFirstName;
            address.LastName = recipient.ShipToLastName;
            address.Street1 = recipient.Street1;
            address.Street2 = recipient.Street2;
            address.City = recipient.City;
            address.State = recipient.State;
            address.Zip = recipient.Zip;
            address.Country = recipient.Country;
            address.IsShipping = true;
            address.IsBilling = false;

            ExistingAddress.check($scope.addresses, address);

            if (!recipient.AddressInvalid) {
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
                    recipient.ShipAddressID = address.AddressID;
                }
            }

            $scope.recipientList.push(recipient);
        };

        var assignAddresses = function () {
            for (var r = 0; r < $scope.recipientList.length; r++) {
                if (!$scope.recipientList[r].ShipAddressID && !$scope.recipientList[r].Invalid) {
                    var recip = $scope.recipientList[r];
                    if (!recip.ShipAddressID) {
                        for (var a = 0; a < $scope.addresses.length; a++) {
                            var add = $scope.addresses[a];
                            if (recip.Street1 == add.AddressName && recip.ShipToFirstName == add.FirstName && recip.ShipToLastName == add.LastName &&
                                recip.Street1 == add.Street1 && recip.Street2 == add.Street2 && recip.City == add.City && recip.State == add.State &&
                                recip.Zip == add.Zip && recip.Country == add.Country) {
                                $scope.recipientList[r].ShipAddressID = add.ID;
                            }
                        }
                    }
                }
            }
            RecipientList.validate($scope.recipientList, $scope.digitalProduct);
            store.set("451Cache.RecipientList", $scope.recipientList);
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
            RecipientList.validate($scope.recipientList, $scope.digitalProduct);
            store.set("451Cache.RecipientList", $scope.recipientList);
            $("#myPasteBox").val('');
            $scope.savingRecipientsLoadingIndicator = false;
        }
    };

    $scope.showAwardMaker = false;

    $scope.selectedLogoSRC = "";
    $scope.logoCheckingIndicator = true;

    $scope.showLogoSelection = false;
    $scope.selectedLogoPath = "";
    $scope.digitalOM = Resources.digitalOM;
    $scope.physicalOM = Resources.physicalOM;
    $scope.digitalDesignPreview = Resources.digitalDesignPreview;
    $scope.physicalDesignPreview = Resources.physicalDesignPreview;
    $scope.giftcardDesignPreview = Resources.giftcardDesignPreview;

    $scope.occasionMessages = [];

    $scope.productTypeSelect = function (type) {
        $rootScope.$broadcast('event:ProductTypeSelected', type);
    };

    $scope.selectedProduct.productLoadingIndicator = false;

    $scope.$on('event:ProductTypeSelected', function (event, type, lineitem) {
        $scope.selectedProduct.productLoadingIndicator = true;
        $scope.selectedProductType = type;
        $scope.selectedProductDetails = {};
        $scope.selectedProduct.occasionMessage = null;
        $scope.selectedProduct.occasionMessageID = null;
        $scope.selectedProduct.imageName = null;
        $scope.selectedProduct.designSelection = null;
        $scope.selectedProduct.selectedDesignID = null;
        $scope.occasionMessages = [];

        angular.forEach($scope.productList, function(p) {
            if (p.StandardID == $scope.selectedProduct.StandardID) {
                $scope.selectedProduct.PremiumID = p.PremiumID;
                $scope.selectedProduct.CanadianID = p.CanadianID;
                $scope.selectedProduct.HolidayID = p.HolidayID;
            }
        });

        switch ($scope.selectedProductType) {
            case "Standard":
                $scope.selectedProduct.InteropID = $scope.selectedProduct.StandardID;
                break;
            case "Premium":
                $scope.selectedProduct.InteropID = $scope.selectedProduct.PremiumID;
                break;
            case "Canadian":
                $scope.selectedProduct.InteropID = $scope.selectedProduct.CanadianID;
                break;
            case "Holiday":
                $scope.selectedProduct.InteropID = $scope.selectedProduct.HolidayID;
                break;
        }

        store.set("451Cache.SelectedProductType", $scope.selectedProductType);
        store.set("451Cache.SelectedProductInteropID", $scope.selectedProduct.InteropID);

        if ($scope.selectedProduct.InteropID && $scope.selectedProduct.InteropID != "MerchantCards") {
            $scope.selectedProduct.productLoadingIndicator = true;
            Product.get($scope.selectedProduct.InteropID, function (product) {
                $scope.selectedProductDetails = angular.copy(product);
                if (lineitem) {
                    LineItems.setProductSpecs(lineitem, $scope.selectedProduct);
                    $scope.designChanged(lineitem);
                    $scope.occasionMessageChanged();
                }
                Customization.setProduct($scope.selectedProduct);
                $scope.selectedProduct.productLoadingIndicator = false;
            });
        }

        store.set("451Cache.SelectedProductDetails", $scope.selectedProductDetails);
    });

    $scope.selectedProductType = store.get("451Cache.SelectedProductType") ? store.get("451Cache.SelectedProductType") : "Standard";
    $scope.selectedProduct.InteropID = store.get("451Cache.SelectedProductInteropID") ? store.get("451Cache.SelectedProductInteropID") : "SCP-FD12";

    $scope.selectedProduct.loadingMerchantProducts = false;

    $scope.selectedProduct.buildingProductsIndicator = false;

    /*** Handle Step On 'Main' Return ***/

    if ($scope.step != 4) $scope.step = 1;
}]);