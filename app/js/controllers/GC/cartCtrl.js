four51.app.controller('CartViewCtrl', ['$scope', '$rootScope', '$location', '$451', 'Order', 'OrderConfig', 'User', 'Shipper', 'LineItems', 'AddressList', 'LogoOptions', 'CustomAddressList',
function ($scope, $rootScope, $location, $451, Order, OrderConfig, User, Shipper,LineItems, AddressList, LogoOptions, CustomAddressList) {

	$scope.tempOrder = store.get("451Cache.TempOrder") ? store.get("451Cache.TempOrder") : {LineItems:[]};
    if (typeof($scope.tempOrder) != 'object') {
        $scope.tempOrder = LZString.decompressFromUTF16($scope.tempOrder);
        $scope.tempOrder = JSON.parse($scope.tempOrder);
    }

	$scope.shippers = store.get("451Cache.GCShippers") ? store.get("451Cache.GCShippers") : [];
    $scope.orderfields = store.get("451Cache.GCOrderFields") ? store.get("451Cache.GCOrderFields") : [];

    $scope.$on('event:shippersObtained', function() {
        $scope.shippers = store.get("451Cache.GCShippers") ? store.get("451Cache.GCShippers") : [];
    });

    if (!$scope.tempOrder.OrderFields) {
        $scope.tempOrder.OrderFields = $scope.orderfields;
    }

    function getAllAddresses() {
        $scope.addressesLoading = true;
        CustomAddressList.getall(function(list) {
            $scope.addresses = list;
            $scope.addressesLoading = false;
        });
    }
    getAllAddresses();

    $scope.digitalShipper = {};
    for (var s = 0; s < $scope.shippers.length; s++) {
        if ($scope.shippers[s].Name.indexOf('Email Delivery') > -1) {
            $scope.digitalShipper = $scope.shippers[s];
        }
    }

    if ($scope.tempOrder.LineItems.length > 0) {
        LineItems.groupPreSubmit($scope.tempOrder);

        //Order Submit
        $scope.tempOrder.ExternalID = 'auto';

        for (var i = 0; i < $scope.tempOrder.LineItems.length; i++) {
            if ($scope.tempOrder.LineItems[i].Product.ExternalID.indexOf('SCD') > -1) {
                $scope.tempOrder.LineItems[i].Shipper = $scope.digitalShipper;
                $scope.tempOrder.LineItems[i].ShipperName = $scope.digitalShipper.Name;
                $scope.tempOrder.LineItems[i].ShipMethod = $scope.digitalShipper.Name;
                $scope.tempOrder.LineItems[i].ShipperID = $scope.digitalShipper.ID;
            }
        }
        for (var g = 0; g < $scope.tempOrder.lineItemGroups.length; g++) {
            for (var l = 0; l < $scope.tempOrder.lineItemGroups[g].LineItems.length; l++) {
                if ($scope.tempOrder.lineItemGroups[g].LineItems[l].Product.ExternalID.indexOf('SCD') > -1) {
                    $scope.tempOrder.lineItemGroups[g].LineItems[l].Shipper = $scope.digitalShipper;
                    $scope.tempOrder.lineItemGroups[g].LineItems[l].ShipperName = $scope.digitalShipper.Name;
                    $scope.tempOrder.lineItemGroups[g].LineItems[l].ShipMethod = $scope.digitalShipper.Name;
                    $scope.tempOrder.lineItemGroups[g].LineItems[l].ShipperID = $scope.digitalShipper.ID;

                    $scope.tempOrder.lineItemGroups[g].ShipMethod = $scope.digitalShipper.Name;
                }
            }
        }

        //Order Summary
        $scope.tempOrder.SubTotal = 0;
        $scope.tempOrder.Total = 0;
        $scope.tempOrder.ShippingTotal = 0;
        angular.forEach($scope.tempOrder.LineItems, function(li) {
            $scope.tempOrder.SubTotal += li.LineTotal;
            $scope.tempOrder.Total += li.LineTotal;
        });

        $scope.tempOrder.SubTotal = $scope.tempOrder.SubTotal.toFixed(2);
        $scope.tempOrder.Total = $scope.tempOrder.Total.toFixed(2);
        analyzeShipping();

        //Order Billing
        $scope.tempOrder.CreditCard = {};

        $scope.cacheOrder($scope.tempOrder);
    }

    $scope.tempOrder.isAllDigital;

    var setIsAllDigital = function() {
        for (var li = 0; li < $scope.tempOrder.LineItems.length; li++) {
            if ($scope.tempOrder.LineItems[li].UniqueID) {
                for (var s in $scope.tempOrder.LineItems[li].Specs) {
                    if ($scope.tempOrder.LineItems[li].Specs[s].Name == "Physical/Digital") {
                        if ($scope.tempOrder.LineItems[li].Specs[s].Value == "Physical") {
                            $scope.tempOrder.isAllDigital = false;
                        }
                        else{
                            $scope.tempOrder.isAllDigital = true;
                        }
                    }
                }
            }
        }
    }

    setIsAllDigital();

	$scope.continueShopping = function() {
	    if (!$scope.cart.$invalid) {
	        if (confirm('Do you want to save changes to your order before continuing?') == true)
		        $scope.saveChanges(function() { $location.path('catalog') });
        }
	    else
		    $location.path('catalog');
    };

	$scope.cancelOrder = function() {
		if (confirm('Are you sure you wish to cancel your order?') == true) {
			$scope.actionMessage = null;
			$scope.tempOrder = {};
			$scope.tempOrder.LineItems = [];
            $scope.cacheOrder($scope.tempOrder);
			$scope.$broadcast("event:tempOrderUpdated", $scope.tempOrder);
			recipientList = store.get("451Cache.RecipientList") ? store.get("451Cache.RecipientList") : [];
			for (var r = 0; r < recipientList.length; r++) {
				recipientList[r].AwardCount = 0;
			}
            localStorage.clear();
			store.set("451Cache.RecipientList",recipientList);
			$location.path('main');
		}
	};

	$scope.saveChanges = function(callback) {
		/*$scope.actionMessage = null;
		$scope.errorMessage = null;
		if($scope.currentOrder.LineItems.length == $451.filter($scope.currentOrder.LineItems, {Property:'Selected', Value: true}).length) {
			$scope.cancelOrder();
		}
		else {
			$scope.displayLoadingIndicator = true;
			Order.save($scope.currentOrder,
				function(data) {
					$scope.currentOrder = data;
					OrderConfig.costcenter(data, $scope.user).address(data, $scope.user);
					$scope.displayLoadingIndicator = false;
					if (callback) callback();
	                $scope.actionMessage = 'Your Changes Have Been Saved!';
				},
				function(ex) {
					$scope.errorMessage = ex.Message;
					$scope.displayLoadingIndicator = false;
				}
			);
		}*/

        $scope.cacheOrder($scope.tempOrder);
        $scope.actionMessage = 'Your Changes Have Been Saved!';

        /*var orderSave = angular.copy($scope.tempOrder);
        orderSave.lineItemGroups = [];
        Order.save(orderSave,
            function(data) {
                console.log(data);
            },
            function(ex) {
                console.log(ex);
            }
        );*/
	};

	$scope.removeItem = function(item) {
		if ($scope.tempOrder.LineItems.length > 1) {
			if (confirm('Are you sure you wish to remove this item from your cart?') == true) {
				if (item.UniqueID) {
					var lineItemID = item.UniqueID;
					for (var g = 0; g < $scope.tempOrder.lineItemGroups.length; g++) {
						for (var li = 0; li < $scope.tempOrder.lineItemGroups[g].LineItems.length; li++) {
							if ($scope.tempOrder.lineItemGroups[g].LineItems[li].UniqueID == lineItemID) {
								$scope.tempOrder.lineItemGroups[g].Total -= item.LineTotal;
								$scope.tempOrder.lineItemGroups[g].LineItems.splice(li,1);
							}
						}
					}
					recipientList = store.get("451Cache.RecipientList") ? store.get("451Cache.RecipientList") : [];
					for (var li = 0; li < $scope.tempOrder.LineItems.length; li++) {
						if ($scope.tempOrder.LineItems[li].UniqueID == lineItemID) {
							var recipID = $scope.tempOrder.LineItems[li].Variant.Specs['R1CL2'].Value;
							for (var r = 0; r < recipientList.length; r++) {
								if (recipientList[r].ID == recipID) {
									recipientList[r].AwardCount--;
								}
							}
							$scope.tempOrder.LineItems.splice(li,1);
						}
					}
					store.set("451Cache.RecipientList",[]);
					store.set("451Cache.RecipientList",recipientList);
				}
				else {
					for (var i = 0; i < $scope.tempOrder.merchantCardLineItems.length; i++) {
						if ($scope.tempOrder.merchantCardLineItems[i].MerchantCardUniqueID == item.MerchantCardUniqueID) {
							$scope.tempOrder.merchantCardLineItems.splice(i,1);
						}
					}
					for (var li = 0; li < $scope.tempOrder.LineItems.length; li++) {
						if ($scope.tempOrder.LineItems[li].MerchantCardUniqueID == item.MerchantCardUniqueID) {
							$scope.tempOrder.LineItems.splice(li,1);
						}
					}
				}

				$scope.tempOrder.Total = 0;
				angular.forEach($scope.tempOrder.LineItems, function(li) {
					$scope.tempOrder.Total += li.LineTotal;
				});

                $scope.cacheOrder($scope.tempOrder);
				$rootScope.$broadcast('event:tempOrderUpdated', $scope.tempOrder);
				$scope.actionMessage = 'Your Changes Have Been Saved!';
			}
		}
		else {
			$scope.cancelOrder();
		}
	}

	$scope.removeGroup = function(group) {
		if ($scope.tempOrder.lineItemGroups.length == 1 && $scope.tempOrder.merchantCardLineItems.length == 0) {
			$scope.cancelOrder();
			return;
		}
		else {
			if (confirm('Are you sure you wish to remove this group from your cart?') == true) {
				for (var g = 0; g < $scope.tempOrder.lineItemGroups.length; g++) {
					if (group.UniqueID == $scope.tempOrder.lineItemGroups[g].UniqueID) {
						for (var li = 0; li < $scope.tempOrder.lineItemGroups[g].LineItems.length; li++) {
							var groupLineItemID = $scope.tempOrder.lineItemGroups[g].LineItems[li].UniqueID;
							recipientList = store.get("451Cache.RecipientList") ? store.get("451Cache.RecipientList") : [];
							for (var i = 0; i < $scope.tempOrder.LineItems.length; i++) {
								if ($scope.tempOrder.LineItems[i].UniqueID == groupLineItemID) {
									var recipID = $scope.tempOrder.LineItems[i].Variant.Specs['R1CL2'].Value;
									for (var r = 0; r < recipientList.length; r++) {
										if (recipientList[r].ID == recipID) {
											recipientList[r].AwardCount--;
										}
									}
									$scope.tempOrder.LineItems.splice(i,1);
								}
							}
							store.set("451Cache.RecipientList",[]);
							store.set("451Cache.RecipientList",recipientList);
						}
						$scope.tempOrder.lineItemGroups.splice(g,1);
					}
				}
			}
		}

		$scope.tempOrder.Total = 0;
		angular.forEach($scope.tempOrder.LineItems, function(li) {
			$scope.tempOrder.Total += li.LineTotal;
		});

        $scope.cacheOrder($scope.tempOrder);
		$rootScope.$broadcast('event:tempOrderUpdated', $scope.tempOrder);
        setIsAllDigital();
		$scope.actionMessage = 'Your Changes Have Been Saved!';
	}

	function submitOrder() {
        $scope.orderSubmitLoadingIndicator = true;
        var orderSave = angular.copy($scope.tempOrder);
        orderSave.lineItemGroups = [];
        var CC = orderSave.CreditCard ? orderSave.CreditCard : {};
        Order.save(orderSave,
            function(o) {
                LineItems.clean(o);
                var orderSubmit = angular.copy(o);
                orderSubmit.CreditCard = CC;
                Order.submit(orderSubmit, function(data) {
                    $scope.user.CurrentOrderID = null;
                    $scope.tempOrder = {LineItems:[]};
                    $scope.cacheOrder($scope.tempOrder);
                    recipientList = store.get("451Cache.RecipientList") ? store.get("451Cache.RecipientList") : [];
                    for (var r = 0; r < recipientList.length; r++) {
                        recipientList[r].AwardCount = 0;
                    }
                    store.set("451Cache.RecipientList",[]);
                    store.set("451Cache.RecipientList",recipientList);
                    $scope.currentOrder = null;
                    $scope.orderSubmitLoadingIndicator = false;
                    $location.path('/order/' + data.ID);
                },
                function(ex) {
                    if (ex.Code.is('ObjectExistsException')) { // unique id
                        ex.Message = ex.Message.replace('{0}', 'Order ID (' + $scope.currentOrder.ExternalID + ')');
                    }
                    //$scope.cart_billing.$setValidity('paymentMethod', false);
                    if (ex.Message.indexOf('Processing of the HTTP request resulted in an exception') > -1) {
                        ex.Message = "There was an error submitting your order. If paying by credit card, please verify your card information and attempt to submit the order again.";
                    }
                    $scope.actionMessage = ex.Message;
                    $scope.orderSubmitLoadingIndicator = false;
                    $scope.shippingUpdatingIndicator = false;
                    $scope.shippingFetchIndicator = false;
                    $scope.showSave = false;
                });
            },
            function(ex) {
                $scope.errorMessage = ex.Message;
                $scope.orderSubmitLoadingIndicator = false;
            }
        );
	};

	$scope.submitOrder = function() {
		submitOrder();
	};

    $scope.onPrint = function()  {
	    window.print();
    };

	$scope.backToCustomization = function() {
        $location.path('main');
	}

	$scope.browseMerchantCards = function() {
		$location.path('catalog/MGCPROJE00000');
	}

    function analyzeShipping() {
        $scope.tempOrder.ShippingTotal = 0;
        $scope.tempOrder.Total = +($scope.tempOrder.SubTotal);
        angular.forEach($scope.tempOrder.lineItemGroups, function(group) {
            if (group.ShipMethod && group.ShipMethod.indexOf('$') > -1) {
                var shipRate = +(group.ShipMethod.split('$')[1]);
                $scope.tempOrder.ShippingTotal += shipRate;
                $scope.tempOrder.Total += shipRate;
            }
        });
        var merchantCardShipMethod = $scope.tempOrder.MerchantCardShipMethod;
        angular.forEach($scope.tempOrder.merchantCardLineItems, function(item) {
            if (merchantCardShipMethod) {
                var shipRate = +(merchantCardShipMethod.split('$')[1]);
                if (!item.IsDigital) {
                    $scope.tempOrder.ShippingTotal += shipRate;
                    $scope.tempOrder.Total += shipRate;
                }
            }
        });
    }

	$scope.updateAllShippers = function() {
		for (var g = 0; g < $scope.tempOrder.lineItemGroups.length; g++) {
			$scope.tempOrder.lineItemGroups[g].ShipMethod = $scope.tempOrder.ShipMethod;
			$scope.updateGroupShipper($scope.tempOrder.lineItemGroups[g]);
		}
	}

	$scope.updateGroupShipper = function(group) {
		angular.forEach($scope.shippers, function(s) {
			if (s.Name == group.ShipMethod) {
				group.Shipper = s;
				group.ShipMethod = s.Name;
				group.ShipperName = s.Name;
				group.ShipperID = s.ID;
			}
		});
		angular.forEach(group.LineItems, function(li) {
			li.ShipMethod = group.Shipper.Name;
			li.Shipper = group.Shipper;
			li.ShipperName = group.Shipper.Name;
			li.ShipperID = group.Shipper.ID;
			var lineItemID = li.UniqueID;
			angular.forEach($scope.tempOrder.LineItems, function(i) {
			     if (i.UniqueID == lineItemID) {
				     i.Shipper = group.Shipper;
				     i.ShipperName = group.Shipper.Name;
				     i.ShipperID = group.Shipper.ID;
			     }
			});
		});
        analyzeShipping();
        $scope.cacheOrder($scope.tempOrder);
	};

	$scope.updateLineItemShipper = function(li) {
		angular.forEach($scope.shippers, function(s) {
			if (s.Name == li.ShipMethod) {
				li.Shipper = s;
			}
		});
		li.ShipperName = li.Shipper.Name;
		li.ShipperID = li.Shipper.ID;
		var lineItemID = li.UniqueID;
		angular.forEach($scope.tempOrder.LineItems, function(i) {
			if (i.UniqueID == lineItemID) {
				i.Shipper = li.Shipper;
				i.ShipperName = li.Shipper.Name;
				i.ShipperID = li.Shipper.ID;
			}
		});

		angular.forEach($scope.tempOrder.lineItemGroups, function(group) {
			if (group.ID == li.ShipAddressID) {
				var allShippersEqual = true;
				angular.forEach(group.LineItems, function(x) {
					if (x.Shipper.ID != li.Shipper.ID) {
						allShippersEqual = false;
					}
				});
				if (allShippersEqual) {
					group.Shipper = li.Shipper;
					group.ShipMethod = li.Shipper.Name;
					group.ShipperName = li.Shipper.Name;
					group.ShipperID = li.Shipper.ID;
				}
			}

		});
        $scope.cacheOrder($scope.tempOrder);
	};

	AddressList.query(function(list) {
		$scope.addresses = list;
	});

	$scope.setShipAddress = function(address) {
        $scope.tempOrder.AnonymousShipAddressID = address ? address.ID : $scope.tempOrder.AnonymousShipAddressID;
        $scope.tempOrder.MerchantCardShipAddressID = address ? address.ID : $scope.tempOrder.MerchantCardShipAddressID;
		for (var i = 0; i < $scope.tempOrder.LineItems.length; i++) {
			if (!$scope.tempOrder.LineItems[i].ShipAddressID && $scope.tempOrder.LineItems[i].MerchantCardUniqueID) {
				$scope.tempOrder.LineItems[i].ShipAddressID = $scope.tempOrder.MerchantCardShipAddressID;
			}
            if ($scope.tempOrder.LineItems[i].UniqueID && $scope.tempOrder.LineItems[i].UniqueID.indexOf('anonymous') == 0) {
                $scope.tempOrder.LineItems[i].ShipAddressID = $scope.tempOrder.AnonymousShipAddressID;
            }
		}
		for (var li = 0; li < $scope.tempOrder.merchantCardLineItems.length; li++) {
			if (!$scope.tempOrder.merchantCardLineItems[li].ShipAddressID && $scope.tempOrder.merchantCardLineItems[li].MerchantCardUniqueID) {
				$scope.tempOrder.merchantCardLineItems[li].ShipAddressID = $scope.tempOrder.MerchantCardShipAddressID;
			}
		}
        $scope.cacheOrder($scope.tempOrder);
	}

	$scope.setShipper = function() {
		var shipper = {};
		angular.forEach($scope.shippers, function(s) {
			if (s.Name == $scope.tempOrder.MerchantCardShipMethod) {
				shipper = s;
			}
		});
		for (var i = 0; i < $scope.tempOrder.LineItems.length; i++) {
			if ($scope.tempOrder.LineItems[i].MerchantCardUniqueID && !$scope.tempOrder.LineItems[i].IsDigital) {
				$scope.tempOrder.LineItems[i].Shipper = shipper;
				$scope.tempOrder.LineItems[i].ShipperName = shipper.Name;
				$scope.tempOrder.LineItems[i].ShipperID = shipper.ID;
			}
		}
		for (var li = 0; li < $scope.tempOrder.merchantCardLineItems.length; li++) {
			if ($scope.tempOrder.merchantCardLineItems[li].MerchantCardUniqueID && !$scope.tempOrder.merchantCardLineItems[li].IsDigital) {
				$scope.tempOrder.merchantCardLineItems[li].Shipper = shipper;
				$scope.tempOrder.merchantCardLineItems[li].ShipperName = shipper.Name;
				$scope.tempOrder.merchantCardLineItems[li].ShipperID = shipper.ID;
			}
		}
        analyzeShipping();
        $scope.cacheOrder($scope.tempOrder);
	}

	function calculateOrderTotal() {
		$scope.tempOrder.Total = 0;
		$scope.tempOrder.Total = 0;
		angular.forEach($scope.tempOrder.LineItems, function(li) {
			$scope.tempOrder.Total += li.LineTotal;
		});
        $scope.cacheOrder($scope.tempOrder);
	}

	$scope.$watch('tempOrder.merchantCardLineItems', function(event) {
        $scope.tempOrder.merchantCardsAllDigital = true;
		angular.forEach(event, function(li) {
			var mID = li.MerchantCardUniqueID;
            if (!li.IsDigital) {
                $scope.tempOrder.merchantCardsAllDigital = false;
            }
			for (var i = 0; i < $scope.tempOrder.LineItems.length; i++) {
				if ($scope.tempOrder.LineItems[i].MerchantCardUniqueID && $scope.tempOrder.LineItems[i].MerchantCardUniqueID == mID) {
					$scope.tempOrder.LineItems[i] = li;
				}
			}
		});
		calculateOrderTotal();
        analyzeShipping();
	}, true);

	if ($scope.tempOrder.merchantCardLineItems.length > 0 && $scope.tempOrder.MerchantCardShipAddressID) {
		if ($scope.tempOrder.MerchantCardShipAddressID) $scope.setShipAddress();

		if ($scope.tempOrder.MerchantCardShipMethod) $scope.setShipper();
	}

	$scope.shipaddress = { Country: 'US', IsShipping: true, IsBilling: false };
	$scope.billaddress = { Country: 'US', IsShipping: false, IsBilling: true };

	$scope.$on('event:AddressSaved', function(event, address) {
        $scope.addresses.push(address);
		if (address.IsShipping) {
			$scope.tempOrder.MerchantCardShipAddressID = address.ID;
            $scope.tempOrder.AnonymousAwardShippAddressID = address.ID;
			$scope.setShipAddress(address);
			$scope.shipaddressform = false;
            $scope.tempOrder.anonymousShipAddressForm = false;
		}
		if (address.IsBilling) {
			$scope.tempOrder.BillAddressID = address.ID;
			$scope.billaddressform = false;
		}
		/*AddressList.query(function(list) {
			$scope.addresses = list;
		});*/
		$scope.shipaddress = { Country: 'US', IsShipping: true, IsBilling: false };
		$scope.billaddress = { Country: 'US', IsShipping: false, IsBilling: true };
	});

	$scope.$on('event:AddressCancel', function(event) {
		$scope.billaddressform = false;
		$scope.shipaddressform = false;
        $scope.tempOrder.anonymousShipAddressForm = false;
	});

}]);