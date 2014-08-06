four51.app.controller('MainGCPurchaseCtrl', ['$routeParams', '$sce', '$rootScope', '$scope', '$location', '$451', 'Category', 'Product', 'Address', 'AddressList', 'Resources', 'RecipientList', 'Variant', 'Order', 'User', 'AddressValidate', 'LogoOptions', 'CategoryDescription', 'ExistingAddress', 'LineItems',
function ($routeParams, $sce, $rootScope, $scope, $location, $451, Category, Product, Address, AddressList, Resources, RecipientList, Variant, Order, User, AddressValidate, LogoOptions, CategoryDescription,ExistingAddress,LineItems) {

	$scope.productList = Resources.products;
    var today = new Date();
    $scope.currentDate = angular.copy(today);
    $scope.maxDate = today.setDate(today.getDate()+120);

	$scope.selectProduct = function(product) {
		$rootScope.$broadcast('event:ProductSelected', product);
        $scope.productType != 'MerchantCards' ? $scope.step = 2 : $location.path('catalog/MGCPROJE00000');
	}

    $scope.selectAllRecipients = "true";

	$scope.selectedProductDetails = store.get("451Cache.SelectedProductDetails") ? store.get("451Cache.SelectedProductDetails") : {};

	function getPersonalMessages(variants) {
		var variantArray = [];
		for (var i = 0; i < variants.length; i++) {
			if (variants[i].InteropID) {
				variantArray.push(variants[i].InteropID);
			}
		}

		$scope.selectedProductDetails.PersonalMessages = [];

		for (var v = 0; v < variantArray.length; v++) {
			Variant.get({VariantInteropID: variantArray[v], ProductInteropID: $scope.selectedProduct.StandardID}, function(data){
                if ($scope.selectedProductDetails.PersonalMessages) {
                    switch ($scope.selectedProduct.StandardID) {
                        case "SCD-GC1":
                            if ($scope.selectedProductDetails.PersonalMessages.indexOf(data.Specs['V04PersonalMessage'].Value) == -1 && data.Specs['V04PersonalMessage'].Value != "") {
                                $scope.selectedProductDetails.PersonalMessages.push(data.Specs['V04PersonalMessage'].Value);
                            }
                            break;
                        case "SCP-FD1":
                            if ($scope.selectedProductDetails.PersonalMessages.indexOf(data.Specs['V15Message'].Value) == -1 && data.Specs['V15Message'].Value !=  "") {
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
				store.set("451Cache.SelectedProductDetails",{});
				store.set("451Cache.SelectedProductDetails",$scope.selectedProductDetails);
			}, function(ex){
				$scope.selectedProductDetails.PersonalMessages = [];
			});
		}
	}

	var _extendProduct = function(product) {
		$scope.selectedProduct = angular.copy(product);
		$scope.digitalProduct = product.StandardID.indexOf("SCD") > -1 ? true : false;
		$scope.selectedProductDetails = {};
		$scope.selectedProduct.occasionMessage = null;
		$scope.selectedProduct.occasionMessageID = null;
		$scope.selectedProduct.imageName = null;
		$scope.selectedProduct.designSelection = null;
		$scope.selectedProduct.selectedDesignID = null;
		$scope.occasionMessages = [];

		switch (product.StandardID) {
			case "SCD-GC1":
				$scope.digitalProduct = true;
				$scope.physicalProduct = false;
				$scope.merchantCards = false;
				$scope.productType = "DigitalSuperCert";
				$scope.selectedProductType = 'Standard';
				$scope.selectedProduct.InteropID = "SCD-GC1";
				break;
			case "SCP-FD1":
				$scope.digitalProduct = false;
				$scope.physicalProduct = true;
				$scope.merchantCards = false;
				$scope.productType = "PhysicalSuperCert";
				$scope.selectedProductType = 'Standard';
				$scope.selectedProduct.InteropID = "SCP-FD1";
				break;
			case "SCP-GC2":
				$scope.digitalProduct = false;
				$scope.physicalProduct = true;
				$scope.merchantCards = false;
				$scope.productType = "GreetingCardSuperCert";
				$scope.selectedProductType = 'Standard';
				$scope.selectedProduct.InteropID = "SCP-GC2";
				break;
			case "MerchantCards":
				$scope.digitalProduct = false;
				$scope.physicalProduct = false;
				$scope.merchantCards = true;
				$scope.productType = "MerchantCards";
				$scope.selectedProductType = "MerchantCards";
				$scope.selectedProduct.InteropID = "MerchantCards";
		}

		if ($scope.selectedProduct.StandardID && $scope.selectedProduct.StandardID != "MerchantCards") {
            Product.get($scope.selectedProduct.StandardID, function(product){
				$scope.selectedProductDetails = product;
				//Call function to obtain variant information and save personal messages
				getPersonalMessages($scope.selectedProductDetails.Variants);
			});
		}
		else if ($scope.selectedProduct.StandardID == "MerchantCards") {
			for (var c = 0; c < $scope.tree.length; c++) {
				if ($scope.tree[c].Name == "Merchant Gift Cards") {
					$scope.merchantCardCategories = $scope.tree[c].SubCategories;
				}
			}
			$scope.merchantProducts = null;
			$scope.selectedProduct.selectedMerchantCategory = null;
		}

		store.set("451Cache.SelectedProduct",{});
		store.set("451Cache.SelectedProduct",$scope.selectedProduct);

		store.set("451Cache.SelectedProductType","");
		store.set("451Cache.SelectedProductType",$scope.selectedProductType);

		store.set("451Cache.SelectedProductDetails",{});
		store.set("451Cache.SelectedProductDetails",$scope.selectedProductDetails);

		store.set("451Cache.SelectedProductInteropID","");
		store.set("451Cache.SelectedProductInteropID",$scope.selectedProduct.InteropID);
	}

	$scope.$on('event:ProductSelected', function(event,product) {
		_extendProduct(product);

		RecipientList.validate($scope.recipientList,$scope.digitalProduct);
		store.set("451Cache.RecipientList",[]);
		store.set("451Cache.RecipientList",$scope.recipientList);

	});

	$scope.selectedProduct = store.get("451Cache.SelectedProduct") ? store.get("451Cache.SelectedProduct") : {};

	if ($scope.selectedProduct.StandardID) {
		_extendProduct($scope.selectedProduct);
	}

	$scope.addType = 'manual';

	AddressList.query(function(list) {
		$scope.addresses = list;
	});

    $scope.editAdditionalInformation = false;

	$scope.clearRecipient = function(r) {
		var country = $scope[r] ? $scope[r].Country : "US";

		$scope[r] = {
			FirstName:"",
			LastName:"",
			RecipientID:"",
			Email:"",
			ShipToFirstName:"",
			ShipToLastName:"",
			ShipToCompanyName:"",
			Street1:"",
			Street2:"",
			City:"",
			State:"",
			Zip:"",
			Country:country,
			Phone:"",
			Invalid:false,
			ErrorMessage:null,
			Selected: false,
			AwardCount:0,
			ShipAddressID:null
		};
	}

	var randomString = function() {
		var chars = "0123456789abcdefghijklmnop";
		var string_length = 7;
		var randomstring = '';
		for (var i=0; i<string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum,rnum+1);
		}
		return randomstring;
	}

	$scope.clearRecipient('recipient');
	$scope.recipientList = store.get("451Cache.RecipientList") ? store.get("451Cache.RecipientList") : [];

    if ($scope.recipientList.length > 0) {
        angular.forEach($scope.recipientList, function(recipient) {
            recipient.FullName = recipient.FirstName + " " + recipient.LastName;
        });
    }


    $scope.isDesktop = function(){
        var result = window.innerWidth >= 992;
        return result;
    }

    $rootScope.showMaker = true;
    if ($scope.recipientList.length != 0) {$scope.showMaker = false;}

	$scope.countries = Resources.countries;
	$scope.states = Resources.states;
	$scope.country = function(item) {
		return $scope.recipient != null ? $scope.recipient.Country == item.country : false;
	};

	$scope.saveRecipient = function() {
		var recipient = $scope.recipient;
        recipient.savingIndicator = true;
		recipient['ID'] = randomString();
        var address = {};
        if (recipient.Street1 != "") {
            address.AddressName = recipient.Street1;
	        address.FirstName = recipient.ShipToFirstName;
	        address.LastName = recipient.ShipToLastName;
            address.Street1 = recipient.Street1;
            address.Street2 = recipient.Street2;
            address.City = recipient.City;
            address.State = recipient.State;
            address.Zip = recipient.Zip;
	        address.Country = recipient.Country;
	        address.Phone = recipient.Phone;
	        address.IsShipping = true;
	        address.IsBilling = false;

	        ExistingAddress.check($scope.addresses,address);

	        if (address.IsExisting) {
		        recipient.ShipAddressID = address.AddressID;
		        recipient.savingIndicator = false;
		        $scope.recipientList.push(recipient);
		        store.set("451Cache.RecipientList",[]);
		        store.set("451Cache.RecipientList",$scope.recipientList);
		        $scope.clearRecipient('recipient');
		        AddressList.query(function(list) {
			        $scope.addresses = list;
		        });
	        }
	        else {
		        AddressValidate.validate(address, function(address,newAddress) {
			        $scope.$apply(function() {
				        if (address.status == "Valid") {
					        Address.save(address,
						        function(add) {
							        recipient.ShipAddressID = add.ID;
							        $scope.recipientList.push(recipient);
							        store.set("451Cache.RecipientList",[]);
							        store.set("451Cache.RecipientList",$scope.recipientList);
							        $scope.clearRecipient('recipient');
							        AddressList.query(function(list) {
								        $scope.addresses = list;
							        });
						        },
						        function(ex) {
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
		        function(ex) {
			        recipient.savingIndicator = false;
		        });
	        }
        }
        else {
            recipient.savingIndicator = false;
            $scope.recipientList.push(recipient);
            store.set("451Cache.RecipientList",[]);
            store.set("451Cache.RecipientList",$scope.recipientList);
            $scope.clearRecipient('recipient');
            AddressList.query(function(list) {
                $scope.addresses = list;
            });
            recipient.savingIndicator = false;
        }
	};

    $scope.saveRecipientWithSuggestedAddress = function() {
        var recipient = $scope.recipient;
        recipient.Street1 = $scope.recipient.newAddress.Street1;
        recipient.Street2 = $scope.recipient.newAddress.Street2;
        recipient.City = $scope.recipient.newAddress.City;
        recipient.State = $scope.recipient.newAddress.State;
        recipient.Zip = $scope.recipient.newAddress.Zip;
	    var address = {};
	    address.AddressName = $scope.recipient.newAddress.Street1;
	    address.FirstName = $scope.recipient.ShipToFirstName;
	    address.LastName = $scope.recipient.ShipToLastName;
	    address.Street1 = $scope.recipient.newAddress.Street1;
	    address.Street2 = $scope.recipient.newAddress.Street2;
	    address.City = $scope.recipient.newAddress.City;
	    address.State = $scope.recipient.newAddress.State;
	    address.Zip = $scope.recipient.newAddress.Zip;
	    address.Country = $scope.recipient.newAddress.Country;
	    address.Phone = $scope.recipient.Phone;
	    address.IsShipping = true;
	    address.IsBilling = false;
	    $scope.recipient.newAddress = null;
        recipient.addressMessage = null;

        ExistingAddress.check($scope.addresses,address);

        if (address.IsExisting) {
            recipient.ShipAddressID = address.AddressID;
            recipient.savingIndicator = false;
            $scope.recipientList.push(recipient);
            store.set("451Cache.RecipientList",[]);
            store.set("451Cache.RecipientList",$scope.recipientList);
            $scope.clearRecipient('recipient');
            AddressList.query(function(list) {
                $scope.addresses = list;
            });
        }
        else {
            Address.save(address,
                function(add) {
                    recipient.ShipAddressID = add.ID;
                    $scope.recipientList.push(recipient);
                    store.set("451Cache.RecipientList",[]);
                    store.set("451Cache.RecipientList",$scope.recipientList);
                    $scope.clearRecipient('recipient');
                    AddressList.query(function(list) {
                        $scope.addresses = list;
                    });
                },
                function(ex) {
                    //
                }
            );
        }
    }

    $scope.saveRecipientWithUserAddress = function() {
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
	    address.Phone = $scope.recipient.Phone;
	    address.IsShipping = true;
	    address.IsBilling = false;

        ExistingAddress.check($scope.addresses,address);

        if (address.IsExisting) {
            recipient.ShipAddressID = address.AddressID;
            recipient.savingIndicator = false;
            $scope.recipientList.push(recipient);
            store.set("451Cache.RecipientList",[]);
            store.set("451Cache.RecipientList",$scope.recipientList);
            $scope.clearRecipient('recipient');
            AddressList.query(function(list) {
                $scope.addresses = list;
            });
        }
        else {
            Address.save(address,
                function(add) {
                    recipient.ShipAddressID = add.ID;
                    $scope.recipientList.push(recipient);
                    store.set("451Cache.RecipientList",[]);
                    store.set("451Cache.RecipientList",$scope.recipientList);
                    $scope.clearRecipient('recipient');
                    AddressList.query(function(list) {
                        $scope.addresses = list;
                    });
                },
                function(ex) {
                    //
                }
            );

        }
    }

	$scope.editRecipient = function(recipient) {
		$scope.step = 2;
        $scope.tempRecipient = angular.copy(recipient);
		$scope.recipient = recipient;
		$scope.editingRecipient = true;

        var editingRecipientID = recipient.ID;
        for (var r = 0; r < $scope.recipientList.length; r ++) {
            $scope.recipientList[r].BeingEdited = $scope.recipientList[r].ID == editingRecipientID;
        }
	}

    $scope.changeAddType = function(a){
	    $scope.addType = a;
	    $('#myPasteBox').on('paste', function() {
		    setTimeout(function() {
			    $rootScope.$broadcast('event:recipientspasted');
		    },5);
	    });
	    $("#uploadRecipients").bind('click', function() {
		   $rootScope.$broadcast('event:generaterecipients');
	    });
    }

	$scope.editRecipientSave = function() {
        RecipientList.validate($scope.recipientList,$scope.digitalProduct);
        var recipient = {};
        for (var r = 0; r < $scope.recipientList.length; r ++) {
            if ($scope.recipientList[r].BeingEdited) {
                recipient = $scope.recipientList[r];
            }
        }
        if (recipient.Street1 != "" && recipient.City != "" && recipient.State != "" && recipient.Zip != "" && recipient.Country != "" && recipient.Phone != "") {
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
            address.Phone = recipient.Phone;
            address.IsShipping = true;
            address.IsBilling = false;

            ExistingAddress.check($scope.addresses,address);

            if (address.IsExisting) {
                for (var r = 0; r < $scope.recipientList.length; r ++) {
                    if ($scope.recipientList[r].BeingEdited) {
                        $scope.recipientList[r].ShipAddressID = address.AddressID;
                    }
                }
                $scope.clearRecipient('recipient');
                $scope.editingRecipient = false;
                for (var r = 0; r < $scope.recipientList.length; r ++) {
                    $scope.recipientList[r].BeingEdited = false;
                }
                store.set("451Cache.RecipientList",[]);
                store.set("451Cache.RecipientList",$scope.recipientList);
                AddressList.query(function(list) {
                    $scope.addresses = list;
                });
            }
            else {
                Address.save(address,
                    function(add) {
                        for (var r = 0; r < $scope.recipientList.length; r ++) {
	                        if ($scope.recipientList[r].BeingEdited) {
		                        $scope.recipientList[r].ShipAddressID = add.ID;
		                        $scope.recipientList[r].BeingEdited = false;
	                        }
                        }
                        store.set("451Cache.RecipientList",[]);
                        store.set("451Cache.RecipientList",$scope.recipientList);
                        $scope.clearRecipient('recipient');
                        $scope.editingRecipient = false;
                        AddressList.query(function(list) {
                            $scope.addresses = list;
                        });
                    },
                    function(ex) {
                        //
                    }
                );
            }
        }
        else {
            for (var r = 0; r < $scope.recipientList.length; r ++) {
                $scope.recipientList[r].BeingEdited = false;
            }
            store.set("451Cache.RecipientList",[]);
            store.set("451Cache.RecipientList",$scope.recipientList);
            $scope.clearRecipient('recipient');
            $scope.editingRecipient = false;
            AddressList.query(function(list) {
                $scope.addresses = list;
            });
        }
    }

	$scope.cancelEditRecipient = function(recipient) {
		for (var i = 0; i < $scope.recipientList.length; i++) {
			if ($scope.recipientList[i].ID == $scope.tempRecipient.ID) {
				$scope.recipientList[i] = $scope.tempRecipient;
			}
		}
		$scope.clearRecipient('tempRecipient');
		$scope.clearRecipient('recipient');
		$scope.editingRecipient = false;
		AddressList.query(function(list) {
			$scope.addresses = list;
		});
        for (var r = 0; r < $scope.recipientList.length; r ++) {
            $scope.recipientList[r].BeingEdited = false;
        }
		RecipientList.validate($scope.recipientList,$scope.digitalProduct);
		store.set("451Cache.RecipientList",[]);
		store.set("451Cache.RecipientList",$scope.recipientList);
    }

	$scope.deleteRecipient = function(recipient) {
		for (var i = 0; i < $scope.recipientList.length; i++) {
			if ($scope.recipientList[i].ID == recipient.ID) {
				$scope.recipientList.splice(i,1);
				break;
			}
		}
		store.set("451Cache.RecipientList",[]);
		store.set("451Cache.RecipientList",$scope.recipientList);
	}

	$scope.useExistingAddress = function() {
		var address = this.existingAddress;
		if (address) {
			$scope.recipient.Street1 = address.Street1;
			$scope.recipient.Street2 = address.Street2;
			$scope.recipient.City = address.City;
			$scope.recipient.State = address.State;
			$scope.recipient.Zip = address.Zip;
			$scope.recipient.Country = address.Country;
			$scope.recipient.Phone = address.Phone;
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
			$scope.recipient.Phone = "";
			$scope.recipient.ShipToFirstName = "";
			$scope.recipient.ShipToLastName = "";
			$scope.recipient.ShipToCompanyName = "";
		}
	}

	$scope.savingRecipientsLoadingIndicator = false;

	$scope.generateRecipients = function(list) {
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
			address.Phone = recipient.Phone;
			address.IsShipping = true;
			address.IsBilling = false;

			ExistingAddress.check($scope.addresses,address);


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
							if (address.AddressName == add.AddressName &&
								address.FirstName == add.FirstName &&
								address.LastName == add.LastName &&
								address.Street1 == add.Street1 &&
								address.Street2 == add.Street2 &&
								address.City == add.City &&
								address.State == add.State &&
								address.Zip == add.Zip &&
								address.Country == add.Country &&
								address.Phone == add.Phone)
							{
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

		var assignAddresses = function() {
			 for (var r = 0; r < $scope.recipientList.length; r++) {
				 if (!$scope.recipientList[r].ShipAddressID && !$scope.recipientList[r].Invalid) {
					 var recip = $scope.recipientList[r];
					 if (!recip.ShipAddressID) {
						 for (var a = 0; a < $scope.addresses.length; a++) {
							 var add = $scope.addresses[a];
							 if (recip.Street1 == add.AddressName &&
								 recip.ShipToFirstName == add.FirstName &&
								 recip.ShipToLastName == add.LastName &&
								 recip.Street1 == add.Street1 &&
								 recip.Street2 == add.Street2 &&
								 recip.City == add.City &&
								 recip.State == add.State &&
								 recip.Zip == add.Zip &&
								 recip.Country == add.Country)
							 {
								 $scope.recipientList[r].ShipAddressID = add.ID;
							 }
						 }
					 }
				 }
			 }
			RecipientList.validate($scope.recipientList,$scope.digitalProduct);
			store.set("451Cache.RecipientList",[]);
			store.set("451Cache.RecipientList",$scope.recipientList);
			$("#myPasteBox").val('');
			$scope.savingRecipientsLoadingIndicator = false;
		}

		for (var i = 0; i < addresses.length; i++) {
            addresses[i].Phone = addresses[i].Phone == "" ? " " : addresses[i].Phone;
			Address.save(addresses[i], function(add) {
				$scope.addresses.push(add);
				if (i == addresses.length) assignAddresses();
			});
		}
		if (addresses.length == 0) {
			RecipientList.validate($scope.recipientList,$scope.digitalProduct);
			store.set("451Cache.RecipientList",[]);
			store.set("451Cache.RecipientList",$scope.recipientList);
			$("#myPasteBox").val('');
			$scope.savingRecipientsLoadingIndicator = false;
		}
	}

    $scope.showAwardMaker = false;

	$scope.recipientGroup = [];
	$scope.recipientGroup = store.get("451Cache.RecipientGroup") ? store.get("451Cache.RecipientGroup") : [];

    $scope.denominationRequired = false;
    $scope.anonymousAwardsChecked = 'false';

    $scope.analyzeRecipientGroup = function(anon) {
        $scope.denominationRequired = false;
        $scope.emailSubjectRequired = false;
        $scope.deliveryDateRequired = false;
        for (var r = 0; r < $scope.recipientGroup.length; r++) {
            $scope.denominationRequired = $scope.recipientGroup[r].Denomination ? $scope.denominationRequired : true;
            $scope.emailSubjectRequired = ($scope.digitalProduct && !$scope.recipientGroup[r].EmailSubject) ? true : $scope.emailSubjectRequired;
            //$scope.deliveryDateRequired = ($scope.digitalProduct && !$scope.recipientGroup[r].DeliveryDate) ? true : $scope.deliveryDateRequired;
        }

        if (anon == 'true') {
            $scope.denominationRequired = true;
            $scope.emailSubjectRequired = $scope.digitalProduct;
            $scope.deliveryDateRequired = $scope.digitalProduct;
        }

        else if ($scope.anonymousAwardsChecked == 'true') {
            $scope.denominationRequired = true;
            $scope.emailSubjectRequired = $scope.digitalProduct;
            $scope.deliveryDateRequired = $scope.digitalProduct;
        }
    }

    $scope.analyzeRecipientGroup();

    $scope.anonymousChecker = function(anon){
        if(anon == 'true'){
            $scope.anonymousAwardsChecked = 'true';
            $scope.selectedProduct.anonymousQty = "";
        }
        else{
            $scope.anonymousAwardsChecked = 'false';
        }
        $scope.analyzeRecipientGroup();
    }

	$scope.selectRecipient = function(recipient) {
		if (recipient.Selected) {
			recipient.Selected = false;
			for (var i = 0; i < $scope.recipientGroup.length; i++) {
				if ($scope.recipientGroup[i].ID == recipient.ID) {
					$scope.recipientGroup.splice(i,1);
					break;
				}
			}
		}
		else {
			if (!recipient.Invalid) {
				recipient.Selected = true;
				$scope.recipientGroup.push(recipient);
			}
			else {
				$scope.editRecipient(recipient);
				$scope.changeAddType('manual');
				$scope.$parent.showMaker = true;
			}
		}
        $scope.analyzeRecipientGroup();
		store.set("451Cache.RecipientGroup",[]);
		store.set("451Cache.RecipientGroup",$scope.recipientGroup);
		store.set("451Cache.RecipientList",[]);
		store.set("451Cache.RecipientList",$scope.recipientList);
	}

	$scope.selectAllRecipientsToggle = function(selectAllRecipients) {
		//Value will be the previous value
		if (!selectAllRecipients || selectAllRecipients == "false") {
			$scope.recipientGroup = [];
			for (var r = 0; r < $scope.recipientList.length; r++) {
				if (!$scope.recipientList[r].Invalid) {
					$scope.recipientList[r].Selected = true;
					$scope.recipientGroup.push($scope.recipientList[r]);
				}
			}
		}
		else {
			$scope.recipientGroup = [];
			for (var r = 0; r < $scope.recipientList.length; r++) {
				$scope.recipientList[r].Selected = false;
			}
		}
        $scope.analyzeRecipientGroup();
		store.set("451Cache.RecipientGroup",[]);
		store.set("451Cache.RecipientGroup",$scope.recipientGroup);
		store.set("451Cache.RecipientList",[]);
		store.set("451Cache.RecipientList",$scope.recipientList);
	}
    $scope.selectedLogoSRC = "";
    $scope.logoCheckingIndicator = true;

    $scope.checkForLogos = function(){
        $scope.showLogoSelection = false;
        $scope.selectedLogoSRC = "https://www.four51.com/Themes/Custom/61a587a4-70db-45d4-a97a-5b54bef0d55a/GC_Main/Previews/placeholder.jpg";


        switch ($scope.digitalProduct) {
            case true:
                LogoOptions.getlogos($scope.user.Username,"DigitalLogo", function(result) {
                    $scope.$apply(function() {
                        if(result == true){
                            if(store.get("451Cache.LogoList").length > 0){
                                $scope.logoOptions = store.get("451Cache.LogoList") ? store.get("451Cache.LogoList") : [];
                                $scope.showLogoSelection = true;
                            }
                            $scope.logoCheckingIndicator = false;
                        }
                    });
                });
                break;
            case false:
                LogoOptions.getlogos($scope.user.Username,"PhysicalLogo", function(result) {
                    $scope.$apply(function() {
                        if(result == true){
                            if(store.get("451Cache.LogoList").length > 0){
                                $scope.logoOptions = store.get("451Cache.LogoList") ? store.get("451Cache.LogoList") : [];
                                $scope.showLogoSelection = true;
                            }
                            $scope.logoCheckingIndicator = false;
                        }
                    });
                });
                break;
        }
    }

    $scope.showLogoSelection = false;
    $scope.selectedLogoPath = "";
    $scope.digitalOM = Resources.digitalOM;
	$scope.physicalOM = Resources.physicalOM;
    console.log($scope.physicalOM);
    $scope.digitalDesignPreview = Resources.digitalDesignPreview;
    $scope.physicalDesignPreview = Resources.physicalDesignPreview;
    $scope.giftcardDesignPreview = Resources.giftcardDesignPreview;

    $scope.stepToCustomization = function(){
        $scope.checkForLogos();
        $scope.selectAllRecipientsToggle();
        $scope.step = 3;
    }

    $scope.stepToAnonCustomization = function(){
        $scope.checkForLogos();
        $scope.selectAllRecipientsToggle();
        $scope.anonymousAwards = 'true';
        $scope.analyzeRecipientGroup($scope.anonymousAwards);
        $scope.selectedProduct.anonymousQty = "";
        $scope.step = 3;
    }

    $scope.digitalOM = digitalOM;
    $scope.physicalOM = physicalOM;
    $scope.digitalDesignPreview = Resources.digitalDesignPreview;
    $scope.physicalDesignPreview = Resources.physicalDesignPreview;
    $scope.giftcardDesignPreview = Resources.giftcardDesignPreview;

	$scope.occasionMessages = [];

	$scope.productTypeSelect = function(type) {
		$rootScope.$broadcast('event:ProductTypeSelected', type);
	}

	$scope.selectedProduct.productLoadingIndicator = false;

	$scope.$on('event:ProductTypeSelected', function(event,type) {
		$scope.selectedProduct.productLoadingIndicator = true;
        $scope.selectedProductType = type;
		$scope.selectedProductDetails = {};
		$scope.selectedProduct.occasionMessage = null;
		$scope.selectedProduct.occasionMessageID = null;
		$scope.selectedProduct.imageName = null;
		$scope.selectedProduct.designSelection = null;
        $scope.selectedProduct.selectedDesignID = null;
		$scope.occasionMessages = [];

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

		store.set("451Cache.SelectedProductType","");
		store.set("451Cache.SelectedProductType",$scope.selectedProductType);

		store.set("451Cache.SelectedProductInteropID","");
		store.set("451Cache.SelectedProductInteropID",$scope.selectedProduct.InteropID);

        if ($scope.selectedProduct.InteropID && $scope.selectedProduct.InteropID != "MerchantCards") {
            $scope.selectedProduct.productLoadingIndicator = true;
            Product.get($scope.selectedProduct.InteropID, function(product){
                $scope.selectedProductDetails = product;
                $scope.selectedProduct.productLoadingIndicator = false;
            });
        }

		store.set("451Cache.SelectedProductDetails",{});
		store.set("451Cache.SelectedProductDetails",$scope.selectedProductDetails);
	});

	$scope.selectedProductType = store.get("451Cache.SelectedProductType") ? store.get("451Cache.SelectedProductType") : "Standard";
	$scope.selectedProduct.InteropID = store.get("451Cache.SelectedProductInteropID") ? store.get("451Cache.SelectedProductInteropID") : "SCP-FD1";

	$scope.selectedProduct.loadingMerchantProducts = false;

    $scope.designPreviewSRC = "";

    $scope.showPreview = function(type, design){
        var digPath = 'https://www.four51.com/Themes/Custom/61a587a4-70db-45d4-a97a-5b54bef0d55a/GC_Main/Previews/';
        var physPath = 'https://www.four51.com/Themes/Custom/61a587a4-70db-45d4-a97a-5b54bef0d55a/GC_Main/Previews/SCP/';
        var giftcardPath = 'https://www.four51.com/Themes/Custom/61a587a4-70db-45d4-a97a-5b54bef0d55a/GC_Main/Previews/GC01/';

        switch (type) {
            case "digital":
                $scope.designPreviewSRC = digPath + ($scope.digitalDesignPreview[design] ? $scope.digitalDesignPreview[design] : "digitalplaceholder.png");
                break;
            case "physical":
                $scope.designPreviewSRC = physPath + ($scope.physicalDesignPreview[design] ? $scope.physicalDesignPreview[design] : "physicallplaceholder.png");
                break;
            case "giftcard":
                $scope.designPreviewSRC = giftcardPath + ($scope.giftcardDesignPreview[design] ? $scope.giftcardDesignPreview[design] : "giftcardplaceholder.png");
                break;
        }
    };

    $scope.showLogo = function(){
        var digPath = 'http://images.giftcertificates.com/content/business/MyFiles/email/';
        var physPath = 'http://images.giftcertificates.com/content/business/MyFiles/physical/';

        switch ($scope.digitalProduct) {
            case true:
                $scope.selectedLogoSRC = digPath + $scope.selectedProduct.selectedLogo.path;
                break;
            case false:
                $scope.selectedLogoSRC = physPath + $scope.selectedProduct.selectedLogo.path;
                break;
        }
    };

	$scope.designChanged = function() {

		$scope.occasionMessages = [];
        $scope.selectedProduct.selectedDesignName = (this.selectedProduct.designSelection) ? this.selectedProduct.designSelection.Value.split(' | ')[0] : "Select a design";
        $scope.selectedProduct.selectedDesignID = (this.selectedProduct.designSelection) ? this.selectedProduct.designSelection.Value.split(' | ')[1] : "Select a design";
		$scope.selectedProduct.occasionMessage = null;
		$scope.selectedProduct.occasionMessageID = null;
		$scope.selectedProduct.imageName = null;

		switch ($scope.selectedProduct.StandardID) {
			case "SCD-GC1":
				for (var i = 0; i < $scope.digitalOM.length; i++) {
					if ($scope.digitalOM[i].TemplateID == $scope.selectedProduct.selectedDesignID) {
						$scope.occasionMessages.push($scope.digitalOM[i].OccasionName)
						$scope.selectedProduct.occasionMessage = null;
					}
				}
                $scope.showPreview("digital", $scope.selectedProduct.selectedDesignName);
				break;
			case "SCP-FD1":
				for (var i = 0; i < $scope.physicalOM.length; i++) {
					if ($scope.physicalOM[i].TemplateID.replace('pht_','') == $scope.selectedProduct.selectedDesignID) {
						$scope.occasionMessages.push($scope.physicalOM[i].OccasionName)
						$scope.selectedProduct.occasionMessage = null;
					}
				}
                $scope.showPreview("physical", $scope.selectedProduct.selectedDesignName);
				break;
			case "SCP-GC2":
				for (var i = 0; i < $scope.physicalOM.length; i++) {
					if ($scope.physicalOM[i].TemplateID.replace('pht_','') == $scope.selectedProduct.selectedDesignID) {
						$scope.occasionMessages.push($scope.physicalOM[i].OccasionName)
						$scope.selectedProduct.occasionMessage = null;
					}
				}
                $scope.showPreview("giftcard", $scope.selectedProduct.selectedDesignName);
				break;
		}
	}

	$scope.occasionMessageChanged = function() {
		switch ($scope.selectedProduct.StandardID) {
			case "SCD-GC1":
				for (var i = 0; i < $scope.digitalOM.length; i++) {
					if ($scope.digitalOM[i].TemplateID == $scope.selectedProduct.selectedDesignID && $scope.digitalOM[i].OccasionName == this.selectedProduct.occasionMessage) {
						$scope.selectedProduct.imageName = $scope.digitalOM[i].ImageFileName;
						$scope.selectedProduct.occasionMessageID = null;
					}
				}
				break;
			case "SCP-FD1":
				for (var i = 0; i < $scope.physicalOM.length; i++) {
					if ($scope.physicalOM[i].TemplateID.replace('pht_','') == $scope.selectedProduct.selectedDesignID && $scope.physicalOM[i].OccasionName == this.selectedProduct.occasionMessage) {
						$scope.selectedProduct.imageName = $scope.physicalOM[i].ImageFileName;
						$scope.selectedProduct.occasionMessageID = $scope.physicalOM[i].OccasionID;
					}
				}
				break;
			case "SCP-GC2":
				for (var i = 0; i < $scope.physicalOM.length; i++) {
					if ($scope.physicalOM[i].TemplateID.replace('pht_','') == $scope.selectedProduct.selectedDesignID && $scope.physicalOM[i].OccasionName == this.selectedProduct.occasionMessage) {
						$scope.selectedProduct.imageName = $scope.physicalOM[i].ImageFileName;
						$scope.selectedProduct.occasionMessageID = $scope.physicalOM[i].OccasionID;
					}
				}
				break;
		}
	}

	$scope.selectOpeningMessageOption = function() {
		  if ($scope.selectedProduct.OpeningMessageOption.Value.indexOf('Custom') == -1) {
			  $scope.selectedProduct.CustomOpeningMessage = '';
		  }
	}

	$scope.selectedProduct.buildingProductsIndicator = false;

    $scope.messagepopover = {title: 'Custom Personal Message', content: 'Ex. Thanks for your hard work!<br/>(Up to 300 characters)'};
    $scope.closingpopover = {title: 'Custom Closing Message', content: 'Ex. Your Company<br/>(Up to 50 characters)'};

	$scope.digitalAddressID = null;

	AddressList.query(function(list) {
		angular.forEach(list,function(a) {
			if (a.AddressName == "Email Delivery") {
				$scope.digitalAddressID = a.ID;
			}
		});
	});

	$scope.tempOrder = store.get("451Cache.TempOrder") ? store.get("451Cache.TempOrder") : {LineItems:[]};

	$scope.createAwards = function() {

        $scope.selectedProduct.buildingProductsIndicator = true;

		var variants = [];

        if ($scope.recipientGroup.length == 0 && $scope.selectedProduct.anonymousQty < 1) {
            $scope.selectedProduct.buildingProductsIndicator = false;
	        return;
        }

        var date = new Date();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var year = date.getFullYear();
        var saveAs = month + '/' + day + '/' + year + ' - Recipients: ' + $scope.recipientGroup.length;

		for (var recip = 0; recip < $scope.recipientGroup.length; recip++) {

			var recipUniqueID = $scope.recipientGroup[recip].ID;
			for (var r = 0; r < $scope.recipientList.length; r++) {
				if ($scope.recipientList[r].ID == recipUniqueID) {
					$scope.recipientList[r].AwardCount++;
				}
			}

            var denominationValue = $scope.recipientGroup[recip].Denomination ? $scope.recipientGroup[recip].Denomination : $scope.selectedProduct.denomination.Value;
            var personalMessage = $scope.recipientGroup[recip].PersonalMessage ? $scope.recipientGroup[recip].PersonalMessage : $scope.selectedProduct.PersonalMessage;
            var closingMessage = $scope.recipientGroup[recip].ClosingMessage ? $scope.recipientGroup[recip].ClosingMessage : $scope.selectedProduct.ClosingMessage;
            var emailSubject = $scope.recipientGroup[recip].EmailSubject ? $scope.recipientGroup[recip].EmailSubject : $scope.selectedProduct.EmailSubject;
            var deliveryDate = $scope.recipientGroup[recip].DeliveryDate ? $scope.recipientGroup[recip].DeliveryDate : $scope.selectedProduct.DeliveryDate;

            switch ($scope.selectedProduct.StandardID) {
                case "SCP-FD1":
                    var messageSelection = $scope.selectedProduct.occasionMessage.replace(/ /g,"_") + " | " + $scope.selectedProduct.occasionMessageID;
                    var customMessageText = "";
                    var openingText = "";
	                if ($scope.selectedProduct.OpeningMessageOption) {
	                    var customMessageOption = $scope.selectedProduct.OpeningMessageOption;
		                if (customMessageOption.indexOf('First and Last Name') > -1) {
			                openingText = $scope.recipientGroup[recip].FirstName + " " + $scope.recipientGroup[recip].LastName;
			                customMessageText = $scope.recipientGroup[recip].FirstName + " " + $scope.recipientGroup[recip].LastName;
		                }
		                else if (customMessageOption.indexOf('First Name Only') > -1) {
			                openingText = $scope.recipientGroup[recip].FirstName;
			                customMessageText = $scope.recipientGroup[recip].FirstName;
		                }
		                else if (customMessageOption.indexOf('Custom Message') > -1) {
			                openingText = "";
			                customMessageText = $scope.recipientGroup[recip].OpeningMessage != "" ? $scope.recipientGroup[recip].OpeningMessage : $scope.selectedProduct.CustomOpeningMessage;
		                }
		                else {
			                openingText = "";
			                customMessageText = "";
		                }
	                }

                    var variant = {
                        "ProductInteropID":$scope.selectedProduct.InteropID,
                        "Specs": {
                            "V10DesignSelection":{
                                "Value":$scope.selectedProduct.designSelection.Value
                            },
                            "V00MessageSelectionList":{
                                "Value":$scope.selectedProduct.occasionMessage
                            },
                            "V11MessageSelection":{
                                "Value":messageSelection
                            },
                            "Denomination1":{
                                "Value":denominationValue
                            },
                            "FirstName1":{
                                "Value":$scope.recipientGroup[recip].FirstName
                            },
                            "LastName1":{
                                "Value":$scope.recipientGroup[recip].LastName
                            },
                            "EnvelopeLineTwo1":{
                                "Value":$scope.recipientGroup[recip].EnvelopeLineTwo
                            },
                            "R1CL1":{
                                "Value":$scope.recipientGroup[recip].RecipientID
                            },
	                        "R1CL2":{
		                        "Value":$scope.recipientGroup[recip].ID
	                        },
                            "V15Message":{
                                "Value":personalMessage
                            },
                            "V16Closing":{
                                "Value":closingMessage
                            },
                            "V14Opening":{
                                "Value":customMessageText
                            },
	                        "Opening1": {
		                        "Value":openingText
	                        },
                            "IsMultiRecipient":{
                                "Value":"True"
                            },
                            "V17OccasionMessageImage":{
                                "Value":$scope.selectedProduct.imageName
                            },
                            "SaveAs":{
                                "Value":saveAs
                            },
                            "V14OpeningPesonalization":{
                                "Value":customMessageOption
                            },
	                        "PersonalMessageCheck":{
		                        "Value":"Pass"
	                        },
                            "V11_CustomerLogo":{
                                "Value":($scope.selectedProduct.selectedLogo) ? $scope.selectedProduct.selectedLogo.path : ""
                            },
                            "V17P_LogoFileID":{
                                "Value":($scope.selectedProduct.selectedLogo) ? $scope.selectedProduct.selectedLogo.fileID : ""
                            }
                        }
                    };
                    break;
                case "SCD-GC1":
                    var messageSelection = $scope.selectedProduct.occasionMessage.replace(/ /g,"_");
	                var customMessageText = "";
	                var openingText = "";
	                if ($scope.selectedProduct.OpeningMessageOption) {
		                var customMessageOption = $scope.selectedProduct.OpeningMessageOption;
		                if (customMessageOption.indexOf('First and Last Name') > -1) {
			                openingText = $scope.recipientGroup[recip].FirstName + " " + $scope.recipientGroup[recip].LastName;
			                customMessageText = $scope.recipientGroup[recip].FirstName + " " + $scope.recipientGroup[recip].LastName;
		                }
		                else if (customMessageOption.indexOf('First Name Only') > -1) {
			                openingText = $scope.recipientGroup[recip].FirstName;
			                customMessageText = $scope.recipientGroup[recip].FirstName;
		                }
		                else if (customMessageOption.indexOf('Custom Message') > -1) {
			                openingText = "";
                            customMessageText = $scope.recipientGroup[recip].OpeningMessage != "" ? $scope.recipientGroup[recip].OpeningMessage : $scope.selectedProduct.CustomOpeningMessage;
		                }
		                else {
			                openingText = "";
			                customMessageText = "";
		                }
	                }

                    var variant = {
                        "ProductInteropID":$scope.selectedProduct.InteropID,
                        "Specs": {
                            "V01Design":{
                                "Value":$scope.selectedProduct.designSelection.Value
                            },
                            "V00OccasionList":{
                                "Value":$scope.selectedProduct.occasionMessage
                            },
                            "V02Occasion":{
                                "Value":messageSelection
                            },
                            "Denomination1":{
                                "Value":denominationValue
                            },
                            "FirstName1":{
                                "Value":$scope.recipientGroup[recip].FirstName
                            },
                            "LastName1":{
                                "Value":$scope.recipientGroup[recip].LastName
                            },
                            "Email1":{
                                "Value":$scope.recipientGroup[recip].Email
                            },
                            "R1CL1":{
                                "Value":$scope.recipientGroup[recip].RecipientID
                            },
	                        "R1CL2":{
		                        "Value":$scope.recipientGroup[recip].ID
	                        },
                            "R1CL3":{
                                "Value":emailSubject
                            },
                            "R1CL4":{
                                "Value":deliveryDate
                            },
                            "V04PersonalMessage":{
                                "Value":personalMessage
                            },
                            "V05ClosingMessage":{
                                "Value":closingMessage
                            },
                            "Opening1":{
                                "Value":openingText
                            },
	                        "V03OpeningMessage":{
		                        "Value":customMessageText
	                        },
                            "IsMultiRecipient":{
                                "Value":"True"
                            },
                            "V14OccasionImageName":{
                                "Value":$scope.selectedProduct.imageName
                            },
                            "SaveAs":{
                                "Value":saveAs
                            },
                            "V14OpeningPesonalization":{
                                "Value":customMessageOption
                            },
	                        "PersonalMessageCheck":{
		                        "Value":"Pass"
	                        },
                            "V11_CustomerLogo":{
                                "Value":($scope.selectedProduct.selectedLogo) ? $scope.selectedProduct.selectedLogo.path : ""
                            },
                            "V17D_LogoFileID":{
                                "Value":($scope.selectedProduct.selectedLogo) ? $scope.selectedProduct.selectedLogo.fileID : ""
                            }
                        }
                    };
                    break;
                case "SCP-GC2":
                    var messageSelection = $scope.selectedProduct.occasionMessage.replace(/ /g,"_");
                    var customMessageOption = $scope.selectedProduct.OpeningMessageOption ? $scope.selectedProduct.OpeningMessageOption : "";
	                var customMessageText = "";
	                var openingText = "";
	                if (customMessageOption.indexOf('First and Last Name') > -1) {
		                openingText = $scope.recipientGroup[recip].FirstName + " " + $scope.recipientGroup[recip].LastName;
		                customMessageText = $scope.recipientGroup[recip].FirstName + " " + $scope.recipientGroup[recip].LastName;
	                }
	                else if (customMessageOption.indexOf('First Name Only') > -1) {
		                openingText = $scope.recipientGroup[recip].FirstName;
		                customMessageText = $scope.recipientGroup[recip].FirstName;
	                }
	                else if (customMessageOption.indexOf('Custom Message') > -1) {
		                openingText = "";
                        customMessageText = $scope.recipientGroup[recip].OpeningMessage != "" ? $scope.recipientGroup[recip].OpeningMessage : $scope.selectedProduct.CustomOpeningMessage;
	                }
	                else {
		                openingText = "";
		                customMessageText = "";
	                }

                    var variant = {
                        "ProductInteropID":$scope.selectedProduct.InteropID,
                        "Specs": {
                            "V10DesignSelection":{
                                "Value":$scope.selectedProduct.designSelection.Value
                            },
                            "V11MessageSelection":{
                                "Value":$scope.selectedProduct.occasionMessage
                            },
                            "V02Occasion":{
                                "Value":messageSelection
                            },
                            "Denomination1":{
                                "Value":denominationValue
                            },
                            "FirstName1":{
                                "Value":$scope.recipientGroup[recip].FirstName
                            },
                            "LastName1":{
                                "Value":$scope.recipientGroup[recip].LastName
                            },
                            "EnvelopeLineTwo1":{
                                "Value":$scope.recipientGroup[recip].EnvelopeLineTwo
                            },
                            "Email1":{
                                "Value":$scope.recipientGroup[recip].Email
                            },
                            "R1CL1":{
                                "Value":$scope.recipientGroup[recip].RecipientID
                            },
	                        "R1CL2":{
		                        "Value":$scope.recipientGroup[recip].ID
	                        },
                            "V04PersonalMessage":{
                                "Value":personalMessage
                            },
                            "V05ClosingMessage":{
                                "Value":closingMessage
                            },
                            "Opening1":{
                                "Value":openingText
                            },
	                        "V03OpeningMessage":{
		                        "Value":customMessageText
	                        },
                            "IsMultiRecipient":{
                                "Value":"True"
                            },
                            "V14OccasionImageName":{
                                "Value":$scope.selectedProduct.imageName
                            },
                            "SaveAs":{
                                "Value":saveAs
                            },
	                        "PersonalMessageCheck":{
		                        "Value":"Pass"
	                        },
                            "V11_CustomerLogo":{
                                "Value":($scope.selectedProduct.selectedLogo) ? $scope.selectedProduct.selectedLogo.path : ""
                            },
                            "V17P_LogoFileID":{
                                "Value":($scope.selectedProduct.selectedLogo) ? $scope.selectedProduct.selectedLogo.fileID : ""
                            }
                        }
                    };
                    break;
            }

			variants.push(variant);
		}

        if ($scope.selectedProduct.anonymousQty > 0) {
            var denominationValue = $scope.selectedProduct.denomination.Value;
            var personalMessage = $scope.selectedProduct.PersonalMessage;
            var closingMessage = $scope.selectedProduct.ClosingMessage;
            var emailSubject = $scope.selectedProduct.EmailSubject;

            switch ($scope.selectedProduct.StandardID) {
                case "SCP-FD1":
                    var messageSelection = $scope.selectedProduct.occasionMessage.replace(/ /g,"_") + " | " + $scope.selectedProduct.occasionMessageID;
                    var customMessageText = "";
                    var openingText = "";
                    if ($scope.selectedProduct.OpeningMessageOption) {
                        var customMessageOption = $scope.selectedProduct.OpeningMessageOption;
                        if (customMessageOption.indexOf('First and Last Name') > -1) {
                            openingText = "";
                            customMessageText = "";
                        }
                        else if (customMessageOption.indexOf('First Name Only') > -1) {
                            openingText = "";
                            customMessageText = "";
                        }
                        else if (customMessageOption.indexOf('Custom Message') > -1) {
                            openingText = "";
                            customMessageText = $scope.selectedProduct.CustomOpeningMessage;
                        }
                        else {
                            openingText = "";
                            customMessageText = "";
                        }
                    }

                    var variant = {
                        "ProductInteropID":$scope.selectedProduct.InteropID,
                        "Specs": {
                            "V10DesignSelection":{
                                "Value":$scope.selectedProduct.designSelection.Value
                            },
                            "V00MessageSelectionList":{
                                "Value":$scope.selectedProduct.occasionMessage
                            },
                            "V11MessageSelection":{
                                "Value":messageSelection
                            },
                            "Denomination1":{
                                "Value":denominationValue
                            },
                            "FirstName1":{
                                "Value":""
                            },
                            "LastName1":{
                                "Value":""
                            },
                            "R1CL1":{
                                "Value":""
                            },
                            "R1CL2":{
                                "Value":""
                            },
                            "V15Message":{
                                "Value":personalMessage
                            },
                            "V16Closing":{
                                "Value":closingMessage
                            },
                            "V14Opening":{
                                "Value":customMessageText
                            },
                            "Opening1": {
                                "Value":openingText
                            },
                            "IsMultiRecipient":{
                                "Value":"True"
                            },
                            "V17OccasionMessageImage":{
                                "Value":$scope.selectedProduct.imageName
                            },
                            "SaveAs":{
                                "Value":saveAs
                            },
                            "V14OpeningPesonalization":{
                                "Value":customMessageOption
                            },
                            "PersonalMessageCheck":{
                                "Value":"Pass"
                            },
                            "V11_CustomerLogo":{
                                "Value":($scope.selectedProduct.selectedLogo) ? $scope.selectedProduct.selectedLogo.path : ""
                            },
                            "V17P_LogoFileID":{
                                "Value":($scope.selectedProduct.selectedLogo) ? $scope.selectedProduct.selectedLogo.fileID : ""
                            }
                        }
                    };
                    break;
                case "SCD-GC1":
                    var messageSelection = $scope.selectedProduct.occasionMessage.replace(/ /g,"_");
                    var customMessageText = "";
                    var openingText = "";
                    if ($scope.selectedProduct.OpeningMessageOption) {
                        var customMessageOption = $scope.selectedProduct.OpeningMessageOption;
                        if (customMessageOption.indexOf('First and Last Name') > -1) {
                            openingText = "";
                            customMessageText = "";
                        }
                        else if (customMessageOption.indexOf('First Name Only') > -1) {
                            openingText = "";
                            customMessageText = "";
                        }
                        else if (customMessageOption.indexOf('Custom Message') > -1) {
                            openingText = "";
                            customMessageText = $scope.selectedProduct.CustomOpeningMessage;
                        }
                        else {
                            openingText = "";
                            customMessageText = "";
                        }
                    }

                    var variant = {
                        "ProductInteropID":$scope.selectedProduct.InteropID,
                        "Specs": {
                            "V01Design":{
                                "Value":$scope.selectedProduct.designSelection.Value
                            },
                            "V00OccasionList":{
                                "Value":$scope.selectedProduct.occasionMessage
                            },
                            "V02Occasion":{
                                "Value":messageSelection
                            },
                            "Denomination1":{
                                "Value":denominationValue
                            },
                            "FirstName1":{
                                "Value":""
                            },
                            "LastName1":{
                                "Value":""
                            },
                            "Email1":{
                                "Value":""
                            },
                            "R1CL1":{
                                "Value":""
                            },
                            "R1CL2":{
                                "Value":""
                            },
                            "R1CL3":{
                                "Value":emailSubject
                            },
                            "R1CL4":{
                                "Value":deliveryDate
                            },
                            "V04PersonalMessage":{
                                "Value":personalMessage
                            },
                            "V05ClosingMessage":{
                                "Value":closingMessage
                            },
                            "Opening1":{
                                "Value":openingText
                            },
                            "V03OpeningMessage":{
                                "Value":customMessageText
                            },
                            "IsMultiRecipient":{
                                "Value":"True"
                            },
                            "V14OccasionImageName":{
                                "Value":$scope.selectedProduct.imageName
                            },
                            "SaveAs":{
                                "Value":saveAs
                            },
                            "V14OpeningPesonalization":{
                                "Value":customMessageOption
                            },
                            "PersonalMessageCheck":{
                                "Value":"Pass"
                            },
                            "V11_CustomerLogo":{
                                "Value":($scope.selectedProduct.selectedLogo) ? $scope.selectedProduct.selectedLogo.path : ""
                            },
                            "V17D_LogoFileID":{
                                "Value":($scope.selectedProduct.selectedLogo) ? $scope.selectedProduct.selectedLogo.fileID : ""
                            }
                        }
                    };
                    break;
                case "SCP-GC2":
                    var messageSelection = $scope.selectedProduct.occasionMessage.replace(/ /g,"_");
                    var customMessageOption = $scope.selectedProduct.OpeningMessageOption ? $scope.selectedProduct.OpeningMessageOption : "";
                    var customMessageText = "";
                    var openingText = "";
                    if (customMessageOption.indexOf('First and Last Name') > -1) {
                        openingText = "";
                        customMessageText = "";
                    }
                    else if (customMessageOption.indexOf('First Name Only') > -1) {
                        openingText = "";
                        customMessageText = "";
                    }
                    else if (customMessageOption.indexOf('Custom Message') > -1) {
                        openingText = "";
                        customMessageText = $scope.selectedProduct.CustomOpeningMessage;
                    }
                    else {
                        openingText = "";
                        customMessageText = "";
                    }

                    var variant = {
                        "ProductInteropID":$scope.selectedProduct.InteropID,
                        "Specs": {
                            "V01Design":{
                                "Value":$scope.selectedProduct.designSelection.Value
                            },
                            "V11MessageSelection":{
                                "Value":$scope.selectedProduct.occasionMessage
                            },
                            "V02Occasion":{
                                "Value":messageSelection
                            },
                            "Denomination1":{
                                "Value":denominationValue
                            },
                            "FirstName1":{
                                "Value":""
                            },
                            "LastName1":{
                                "Value":""
                            },
                            "Email1":{
                                "Value":""
                            },
                            "R1CL1":{
                                "Value":""
                            },
                            "R1CL2":{
                                "Value":""
                            },
                            "V04PersonalMessage":{
                                "Value":personalMessage
                            },
                            "V05ClosingMessage":{
                                "Value":closingMessage
                            },
                            "Opening1":{
                                "Value":openingText
                            },
                            "V03OpeningMessage":{
                                "Value":customMessageText
                            },
                            "IsMultiRecipient":{
                                "Value":"True"
                            },
                            "V14OccasionImageName":{
                                "Value":$scope.selectedProduct.imageName
                            },
                            "SaveAs":{
                                "Value":saveAs
                            },
                            "PersonalMessageCheck":{
                                "Value":"Pass"
                            },
                            "V11_CustomerLogo":{
                                "Value":($scope.selectedProduct.selectedLogo) ? $scope.selectedProduct.selectedLogo.path : ""
                            },
                            "V17P_LogoFileID":{
                                "Value":($scope.selectedProduct.selectedLogo) ? $scope.selectedProduct.selectedLogo.fileID : ""
                            }
                        }
                    };
                    break;
            }

            variants.push(variant);
        }

		var variantCount = variants.length;

		var _orderSave = function(lineItems) {

			if(!$scope.tempOrder){
				$scope.tempOrder = {};
				$scope.tempOrder.LineItems = [];
			}
			if (!$scope.tempOrder.LineItems) {
				$scope.tempOrder.LineItems = [];
			}

			for (var li = 0; li < lineItems.length; li++) {
				if (lineItems[li].UniqueID) {
					if (lineItems[li].Product.ExternalID.indexOf('SCD') > -1) {
						$scope.tempOrder.LineItems.push(lineItems[li]);
					}
					else {
						var shipAddressID = "";
						for (var r = 0; r < $scope.recipientGroup.length; r++) {
							if ($scope.recipientGroup[r].ID == lineItems[li].Variant.Specs['R1CL2'].Value) {
								shipAddressID = $scope.recipientGroup[r].ShipAddressID;
							}
						}
						lineItems[li].ShipAddressID = shipAddressID;
						$scope.tempOrder.LineItems.push(lineItems[li]);
					}
				}
			}

			for (var li = 0; li < $scope.tempOrder.LineItems.length; li++) {
				if ($scope.tempOrder.LineItems[li].UniqueID) {
					var lineItemVariantSpecs = {};
					for (var s in $scope.tempOrder.LineItems[li].Variant.Specs) {
						if ($scope.tempOrder.LineItems[li].Variant.Specs[s].Value && $scope.tempOrder.LineItems[li].Variant.Specs[s].Value != "") {
							lineItemVariantSpecs[$scope.tempOrder.LineItems[li].Variant.Specs[s].Name] = $scope.tempOrder.LineItems[li].Variant.Specs[s];
						}
					}
					$scope.tempOrder.LineItems[li].Variant.Specs = lineItemVariantSpecs;
				}
			}

			store.set("451Cache.TempOrder",$scope.tempOrder);

			$scope.recipientGroup = [];
			for (var i = 0; i < $scope.recipientList.length; i++) {
				$scope.recipientList[i].Selected = false;
			}
			$scope.occasionMessages = [];
			store.set("451Cache.RecipientGroup",[]);
			store.set("451Cache.RecipientGroup",$scope.recipientGroup);
			store.set("451Cache.RecipientList",[]);
			store.set("451Cache.RecipientList",$scope.recipientList);
            $scope.selectedProduct.buildingProductsIndicator = false;
            $scope.selectedProduct = {};
            store.set("451Cache.SelectedProduct", $scope.selectedProduct);
			$location.path('cart');
		}

		var lineItems = [];

		for (var v = 0; v < variants.length; v++) {
			Variant.save(variants[v], function(data){
				variantCount--;

				var variantData = data;
				var selectedDenom = variantData.Specs['Denomination1'].Value;
				var markUp = 0;
				for (var m = 0; m < variantData.Specs['Denomination1'].Options.length; m++) {
					if (variantData.Specs['Denomination1'].Options[m].Value == selectedDenom) {
						markUp += variantData.Specs['Denomination1'].Options[m].Markup;
					}
				}

				var lineTotal = markUp + $scope.selectedProductDetails.StandardPriceSchedule.PriceBreaks[0].Price;

				var selectedProduct = $scope.selectedProductDetails;
				selectedProduct.Specs = {};
				selectedProduct.Description = "";

                var qty = (variantData.Specs['FirstName1'].Value == "" && variantData.Specs['LastName1'].Value == "" && selectedProduct.ExternalID.indexOf('SCD') == -1 && $scope.selectedProduct.anonymousQty) ? $scope.selectedProduct.anonymousQty : 1;

                if (qty > 1) {
                    lineTotal = (markUp*qty) + $scope.selectedProductDetails.StandardPriceSchedule.PriceBreaks[0].Price;
                }

                if ($scope.digitalProduct) {
                    var date = (variantData.Specs['R1CL4'] && variantData.Specs['R1CL4'].Value) ? new Date(variantData.Specs['R1CL4'].Value) : ($scope.selectedProduct.DeliveryDate ? new Date($scope.selectedProduct.DeliveryDate) : null);
                    if (date) {
                        var month = date.getMonth() + 1;
                        var day = date.getDate();
                        var year = date.getFullYear();
                    }
                    var futureShipDate = date ? month + "/" + day + "/" + year : "";
                    var emailSubject = data.Specs['R1CL3'].Value != "" ? data.Specs['R1CL3'].Value : $scope.selectedProduct.EmailSubject;
                    var li = {
                        "LineTotal":lineTotal,
                        "PriceSchedule":$scope.selectedProductDetails.StandardPriceSchedule,
                        "Product":selectedProduct,
                        "Quantity":qty,
	                    "ShipAddressID":$scope.digitalAddressID,
                        "Specs":{
                            "EmailSubject":{
                                "Name":"EmailSubject",
                                "Value":emailSubject
                            },
                            "FutureShipDate":{
                                "Name":"FutureShipDate",
                                "Value":futureShipDate
                            },
                            "Physical/Digital":{
                                "Name":"Physical/Digital",
                                "Value":"Digital"
                            }
                        },
                        "UnitPrice":$scope.selectedProductDetails.StandardPriceSchedule.PriceBreaks[0].Price,
                        "Variant":variantData,
                        "qtyError":null,
                        "FaceValue":Number(data.Specs['Denomination1'].Value.split('$')[1]),
                        "ProductType":$scope.selectedProductType,
	                    "UniqueID":randomString()
                    }
                }
                else {
                    var li = {
                        "LineTotal":lineTotal,
                        "PriceSchedule":$scope.selectedProductDetails.StandardPriceSchedule,
                        "Product":selectedProduct,
                        "Quantity":qty,
	                    "Specs":{
		                    "Physical/Digital":{
			                    "Name":"Physical/Digital",
			                    "Value":"Physical"
		                    }
	                    },
                        "UnitPrice":$scope.selectedProductDetails.StandardPriceSchedule.PriceBreaks[0].Price,
                        "Variant":variantData,
                        "qtyError":null,
                        "FaceValue":Number(data.Specs['Denomination1'].Value.split('$')[1]),
                        "ProductType":$scope.selectedProductType,
	                    "UniqueID":randomString()
                    }
                }

				lineItems.push(li);

				if (variantCount == 0) {
					_orderSave(lineItems);
				}
			});
		}
	}

	/*** Handle Step On 'Main' Return ***/

	$scope.step = 1;

	if ($scope.selectedProduct.InteropID && $scope.recipientList.length > 0 && $scope.selectedProduct.InteropID != "MerchantCards") {
        $scope.step = 3;
	}
}]);