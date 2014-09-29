four51.app.controller('CartViewCtrl', ['$scope', '$rootScope', '$location', '$451', '$modal', 'Order', 'OrderConfig', 'User', 'Shipper', 'LineItems', 'AddressList', 'LogoOptions', 'CustomAddressList', 'Address', 'OrderSubmit',
function ($scope, $rootScope, $location, $451, $modal, Order, OrderConfig, User, Shipper,LineItems, AddressList, LogoOptions, CustomAddressList, Address, OrderSubmit) {

	$scope.tempOrder = store.get("451Cache.TempOrder") ? store.get("451Cache.TempOrder") : {LineItems:[]};
    if (typeof($scope.tempOrder) != 'object') {
        $scope.tempOrder = LZString.decompressFromUTF16($scope.tempOrder);
        $scope.tempOrder = JSON.parse($scope.tempOrder);
    }

	$scope.shippers = store.get("451Cache.GCShippers") ? store.get("451Cache.GCShippers") : [];
    $scope.orderfields = store.get("451Cache.GCOrderFields") ? store.get("451Cache.GCOrderFields") : [];
    if ($scope.orderfields && !$scope.tempOrder.OrderFields) {
        $scope.tempOrder.OrderFields = $scope.orderfields;
    }

    $scope.$on('event:shippersObtained', function() {
        $scope.shippers = store.get("451Cache.GCShippers") ? store.get("451Cache.GCShippers") : [];
        $scope.orderfields = store.get("451Cache.GCOrderFields") ? store.get("451Cache.GCOrderFields") : [];
        if (!$scope.tempOrder.OrderFields || ($scope.tempOrder.OrderFields && $scope.tempOrder.OrderFields.length == 0)) $scope.tempOrder.OrderFields = $scope.orderfields;
        LineItems.groupPreSubmit($scope.tempOrder);
        assignDigitalShipInfo();
    });

    if (!$scope.tempOrder.OrderFields || $scope.tempOrder.OrderFields.length == 0) {
        $scope.tempOrder.OrderFields = $scope.orderfields;
    }

    $scope.pagination = {
        "IdentifiedPage":1,
        "IdentifiedLimit":10,
        "MerchantPage":1,
        "MerchantLimit":5
    };

    function getAllAddresses() {
        $scope.addressesLoading = true;
        CustomAddressList.getall(function(list) {
            $scope.addresses = list;
            $scope.addressesLoading = false;
            for (var a = 0; a < list.length; a++) {
                if (list[a].AddressName == 'Email Delivery') {
                    $scope.digitalShipAddressID = list[a].ID;
                    assignDigitalShipInfo();
                }
            }
        });
    }
    getAllAddresses();

    function analyzeTotals() {
        $scope.tempOrder.SubTotal = 0;
        $scope.tempOrder.Total = 0;
        $scope.tempOrder.ShippingTotal = 0;
        angular.forEach($scope.tempOrder.LineItems, function(li) {
            $scope.tempOrder.SubTotal += li.LineTotal;
            $scope.tempOrder.Total += li.LineTotal;
        });

        $scope.tempOrder.SubTotal = $scope.tempOrder.SubTotal.toFixed(2);
        $scope.tempOrder.Total = $scope.tempOrder.Total.toFixed(2);
    }

    if ($scope.tempOrder.LineItems.length > 0) {
        if (!$scope.tempOrder.LineItemGroups) LineItems.groupPreSubmit($scope.tempOrder);

        //Order Submit
        $scope.tempOrder.ExternalID = 'auto';

        //Order Summary
        analyzeTotals();
        /*$scope.tempOrder.SubTotal = 0;
        $scope.tempOrder.Total = 0;
        $scope.tempOrder.ShippingTotal = 0;
        angular.forEach($scope.tempOrder.LineItems, function(li) {
            $scope.tempOrder.SubTotal += li.LineTotal;
            $scope.tempOrder.Total += li.LineTotal;
        });

        $scope.tempOrder.SubTotal = $scope.tempOrder.SubTotal.toFixed(2);
        $scope.tempOrder.Total = $scope.tempOrder.Total.toFixed(2);*/

        analyzeShipping();

        //Order Billing
        $scope.tempOrder.CreditCard = {};

        $scope.cacheOrder($scope.tempOrder);
    }

    $scope.displayErrorMessages = false;
    function assignDigitalShipInfo() {
        $scope.digitalShipper = {};
        for (var s = 0; s < $scope.shippers.length; s++) {
            if ($scope.shippers[s].Name.indexOf('Email Delivery') > -1) {
                $scope.digitalShipper = $scope.shippers[s];
            }
        }
        for (var i = 0; i < $scope.tempOrder.LineItems.length; i++) {
            if ($scope.tempOrder.LineItems[i].Product.ExternalID.indexOf('SCD') > -1 || $scope.tempOrder.LineItems[i].Product.Name.toLowerCase().indexOf('e-gift') > -1) {
                $scope.tempOrder.LineItems[i].ShipAddressID = $scope.digitalShipAddressID;
                $scope.tempOrder.LineItems[i].Shipper = angular.copy($scope.digitalShipper);
                $scope.tempOrder.LineItems[i].ShipperName = $scope.digitalShipper.Name;
                $scope.tempOrder.LineItems[i].ShipMethod = $scope.digitalShipper.Name;
                $scope.tempOrder.LineItems[i].ShipperID = $scope.digitalShipper.ID;
            }
        }
        for (var g = 0; g < $scope.tempOrder.lineItemGroups.length; g++) {
            for (var l = 0; l < $scope.tempOrder.lineItemGroups[g].LineItems.length; l++) {
                if ($scope.tempOrder.lineItemGroups[g].LineItems[l].Product.ExternalID.indexOf('SCD') > -1 || $scope.tempOrder.lineItemGroups[g].LineItems[l].Product.Name.toLowerCase().indexOf('e-gift') > -1) {
                    $scope.tempOrder.lineItemGroups[g].LineItems[l].ShipAddressID = $scope.digitalShipAddressID;
                    $scope.tempOrder.lineItemGroups[g].LineItems[l].Shipper = $scope.digitalShipper;
                    $scope.tempOrder.lineItemGroups[g].LineItems[l].ShipperName = $scope.digitalShipper.Name;
                    $scope.tempOrder.lineItemGroups[g].LineItems[l].ShipMethod = $scope.digitalShipper.Name;
                    $scope.tempOrder.lineItemGroups[g].LineItems[l].ShipperID = $scope.digitalShipper.ID;
                    $scope.tempOrder.lineItemGroups[g].ShipMethod = $scope.digitalShipper.Name;
                }
            }
        }
        $scope.displayErrorMessages = true;
        analyzeErrors();
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
            else {
                if ($scope.tempOrder.LineItems[li].Product.Name.toLowerCase().indexOf("e-gift") == -1) {
                    $scope.tempOrder.isAllDigital = false;
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

				$scope.tempOrder.SubTotal = 0;
				$scope.tempOrder.Total = 0;
				angular.forEach($scope.tempOrder.LineItems, function(li) {
					$scope.tempOrder.SubTotal += li.LineTotal;
					$scope.tempOrder.Total += li.LineTotal;
				});

                analyzeErrors();
                $scope.cacheOrder($scope.tempOrder);
				$rootScope.$broadcast('event:tempOrderUpdated', $scope.tempOrder);
				$scope.actionMessage = 'Your Changes Have Been Saved!';
			}
		}
		else {
			$scope.cancelOrder();
		}
	};

	$scope.removeGroup = function(group) {
		if ($scope.tempOrder.lineItemGroups.length == 1 && $scope.tempOrder.merchantCardLineItems.length == 0) {
			$scope.cancelOrder();
			return;
		}
		else {
			if (confirm('Are you sure you wish to remove this group from your cart?') == true) {
				for (var g = 0; g < $scope.tempOrder.lineItemGroups.length; g++) {
					if (!group.Anonymous && group.UniqueID == $scope.tempOrder.lineItemGroups[g].UniqueID) {
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
                    else if (group.Anonymous && group.UniqueID == $scope.tempOrder.lineItemGroups[g].UniqueID) {
                        for (var d = 0; d < $scope.tempOrder.LineItems.length; d++) {
                            if ($scope.tempOrder.LineItems[d].UniqueID == group.LineItems[0].UniqueID) {
                                $scope.tempOrder.LineItems.splice(d,1);
                            }
                        }
                        $scope.tempOrder.lineItemGroups.splice(g,1);
                    }
				}
			}
		}

		analyzeTotals();
        analyzeShipping();

        $scope.cacheOrder($scope.tempOrder);
		$rootScope.$broadcast('event:tempOrderUpdated', $scope.tempOrder);
        setIsAllDigital();
		$scope.actionMessage = 'Your Changes Have Been Saved!';
	};

    /*var updatedAddresses = 0;
    function updateAddress(id, phone, len, order) {
        Address.get(id, function(add) {
            var address = add;
            address.Phone = phone;
            Address.save(address, function(a) {
                updatedAddresses++;
                if (updatedAddresses == len)
                saveOrder(order);
            });
        });
    }*/

	/*function processOrder() {
        $scope.orderSubmitLoadingIndicator = true;
        $scope.actionErrorMessage = null;
        $scope.actionMessage = null;
        $scope.displayErrorMessages = false;
        var orderSave = angular.copy($scope.tempOrder);
        $scope.tempSave = angular.copy($scope.tempOrder);
        if ($scope.tempSave.PaymentMethod == 'CreditCard') {
            $scope.tempSave.BudgetAccountID = null;
        }
        $scope.tempOrder = {LineItems: []};
        $rootScope.$broadcast('event:tempOrderUpdated');
        delete orderSave.lineItemGroups;
        delete orderSave.merchantCardsAllDigital;
        delete orderSave.merchantCardLineItems;
        delete orderSave.SavedCards;
        angular.forEach(orderSave.LineItems, function (li) {
            delete li.Shipper;
        });

        var shipAddresses = [];
        angular.forEach(orderSave.LineItems, function (item) {
            if (shipAddresses.indexOf(item.ShipAddressID) == -1) {
                shipAddresses.push(item.ShipAddressID);
            }
        });

        var billAddressPhone = orderSave.BillAddress.Phone;
        angular.forEach(shipAddresses, function(id) {
            updateAddress(id, billAddressPhone, shipAddresses.length, orderSave);
        });
    }*/

    /*function saveOrder(orderSave) {
        var CC = orderSave.CreditCard ? orderSave.CreditCard : {};
        Order.save(orderSave,
            function (o) {
                LineItems.clean(o);
                var orderSubmit = angular.copy(o);
                orderSubmit.CreditCard = CC;
                LineItems.cleanPreSubmit(orderSubmit);
                Order.submit(orderSubmit, function (data) {
                        $scope.user.CurrentOrderID = null;
                        $scope.tempOrder = {LineItems: []};
                        $scope.cacheOrder($scope.tempOrder);
                        var recipientList = store.get("451Cache.RecipientList") ? store.get("451Cache.RecipientList") : [];
                        for (var r = 0; r < recipientList.length; r++) {
                            recipientList[r].AwardCount = 0;
                        }
                        store.set("451Cache.RecipientList", []);
                        store.set("451Cache.RecipientList", recipientList);
                        $scope.currentOrder = null;
                        $scope.orderSubmitLoadingIndicator = false;
                        $scope.tempSave = null;
                        $location.path('/order/' + data.ID);
                    },
                    function (ex) {
                        if (ex.Code.is('ObjectExistsException')) { // unique id
                            ex.Message = ex.Message.replace('{0}', 'Order ID (' + $scope.currentOrder.ExternalID + ')');
                        }
                        //$scope.cart_billing.$setValidity('paymentMethod', false);
                        $scope.actionErrorMessage = ex.Message;
                        $scope.orderSubmitLoadingIndicator = false;
                        $scope.shippingUpdatingIndicator = false;
                        $scope.shippingFetchIndicator = false;
                        $scope.showSave = false;
                        $scope.tempOrder = $scope.tempSave;
                    });
            },
            function (ex) {
                $scope.actionErrorMessage = ex.Message;
                $scope.orderSubmitLoadingIndicator = false;
                $scope.tempOrder = $scope.tempSave;
            }
        );
    };*/

	/*$scope.submitOrder = function() {
        processOrder();
    };*/

	/*function submitOrder(skip) {
        //$scope.orderSubmitLoadingIndicator = true;
        $scope.actionErrorMessage = null;
        $scope.actionMessage = null;
        $scope.displayErrorMessages = false;

        if (!skip) {
            $scope.orderSubmitLoadingIndicator = true;
            OrderSubmit.save($scope.tempOrder, true);
            $scope.tempOrder = {LineItems: []};
            $scope.cacheOrder($scope.tempOrder);
            $rootScope.$broadcast('event:tempOrderUpdated');
        }
        else {
            OrderSubmit.submit($scope.tempOrder, false);
            $scope.tempOrder = {LineItems: []};
            $scope.cacheOrder($scope.tempOrder);
            $rootScope.$broadcast('event:tempOrderUpdated');
            $location.path('main');
        }
	}*/

    $scope.orderSaveLoadingIndicator = false;
	$scope.submitOrder = function() {
        $scope.orderSaveLoadingIndicator = true;
        $scope.actionErrorMessage = null;
        $scope.actionMessage = null;
        $scope.displayErrorMessages = false;
        OrderSubmit.save($scope.tempOrder, function(order) {
            if (order.LineItems.length > 49) {
                $scope.orderSaveLoadingIndicator = false;
                var modalInstance = $modal.open({
                    templateUrl: 'partials/controls/GC/orderSubmit.html',
                    controller: function ($scope, $modalInstance) {
                        $scope.okSubmit = function() {
                            $modalInstance.close(true);
                        };
                        $scope.goHomeSubmit = function() {
                            $modalInstance.close(false);
                        };
                    }
                });
                modalInstance.result.then(function (wait) {
                    if (wait) {
                        $scope.orderSubmitLoadingIndicator = true;
                        OrderSubmit.submit(order, true);
                        $scope.tempOrder = {LineItems: []};
                        $scope.cacheOrder($scope.tempOrder);
                        $rootScope.$broadcast('event:tempOrderUpdated');
                    }
                    else {
                        $scope.orderSubmitLoadingIndicator = false;
                        OrderSubmit.submit(order, false);
                        $scope.tempOrder = {LineItems: []};
                        $scope.cacheOrder($scope.tempOrder);
                        $rootScope.$broadcast('event:tempOrderUpdated');
                        $location.path('main');
                    }
                }, function () {
                    $scope.orderSubmitLoadingIndicator = true;
                    OrderSubmit.submit(order, true);
                    $scope.tempOrder = {LineItems: []};
                    $scope.cacheOrder($scope.tempOrder);
                    $rootScope.$broadcast('event:tempOrderUpdated');
                });
            }
            else {
                $scope.orderSaveLoadingIndicator = false;
                $scope.orderSubmitLoadingIndicator = true;
                OrderSubmit.submit(order, true);
            }
        },
        function(ex) {
            console.log(ex);
        });
	};

    $scope.onPrint = function()  {
	    window.print();
    };

	$scope.backToCustomization = function() {
        $location.path('main');
	};

	$scope.browseMerchantCards = function() {
		$location.path('catalog/MGCPROJE00000');
	};

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
        analyzeErrors();
    }

	$scope.updateAllShippers = function() {
        var shipper = {};
        angular.forEach($scope.shippers, function(s) {
            if (s.Name == $scope.tempOrder.ShipMethod) {
                shipper = s;
            }
        });
		for (var g = 0; g < $scope.tempOrder.lineItemGroups.length; g++) {
			if (!$scope.tempOrder.lineItemGroups[g].IsDigital) {
                $scope.tempOrder.lineItemGroups[g].ShipMethod = $scope.tempOrder.ShipMethod;
                $scope.tempOrder.lineItemGroups[g].Shipper = shipper;
            }
		}
        for (var l = 0; l < $scope.tempOrder.LineItems.length; l++) {
            var product = $scope.tempOrder.LineItems[l].Product;
            if (product.Name.indexOf('SuperCert') > -1 && product.ExternalID.indexOf('SCD') == -1) {
                $scope.tempOrder.LineItems[l].Shipper = shipper;
                $scope.tempOrder.LineItems[l].ShipperID = shipper.ID;
                $scope.tempOrder.LineItems[l].ShipperName = shipper.Name;
            }
        }
        analyzeShipping();
        $scope.cacheOrder($scope.tempOrder);
	};

	$scope.updateGroupShipper = function(group) {
        group.ShipperID = null;
        group.Shipper = {};
        angular.forEach($scope.shippers, function(s) {
            if (s.Name == group.ShipMethod && group.ShipMethod.indexOf('Email') == -1) {
                group.Shipper = s;
                group.ShipMethod = s.Name;
                group.ShipperName = s.Name;
                group.ShipperID = s.ID;
            }
        });
		angular.forEach(group.LineItems, function(li) {
            if (!group.IsDigital) {
                li.ShipMethod = group.Shipper.Name;
                li.Shipper = group.Shipper;
                li.ShipperName = group.Shipper.Name;
                li.ShipperID = group.Shipper.ID;
                    var lineItemID = li.UniqueID;
                    angular.forEach($scope.tempOrder.LineItems, function(i) {
                        if (i.UniqueID == lineItemID) {
                            i.Shipper = group.Shipper ? group.Shipper : null;
                            i.ShipperName = group.Shipper ? group.Shipper.Name : null;
                            i.ShipperID = group.Shipper ? group.Shipper.ID : null;
                        }
                    });
            }
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
        analyzeErrors();
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
        var found = false;
        angular.forEach($scope.addresses, function(add) {
            if (add.ID == address.ID) {
                found = true;
                add.AddressName = address.AddressName;
            }
        });
        if (!found) {
            $scope.addresses.push(address);
        }
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

    $scope.editAward = function(lineitem, index) {
        store.set('451Cache:EditingAward', lineitem);
        $location.path('main/edit/' + index);
    };

    $scope.originalItemSpecs = {};
    $scope.editMerchantCard = function(item) {
        $scope.originalItemSpecs[item.MerchantCardUniqueID] = angular.copy(item.Specs);
        item.Specs['Email1'].InputType = "email";
        item.Editing = true;
    };

    $scope.updateMerchantCard = function(item) {
        item.Editing = false;
        for (var i = 0; i < $scope.tempOrder.LineItems; i++) {
            if (item.MerchantCardUniqueID == $scope.tempOrder.LineItem[i].MerchantCardUniqueID) {
                $scope.tempOrder.LineItem[i].Specs = item.Specs;
            }
        }
        $scope.cacheOrder($scope.tempOrder);
    };

    $scope.cancelEditMerchantCard = function(item) {
        item.Editing = false;
        item.Specs = $scope.originalItemSpecs[item.MerchantCardUniqueID];
        $scope.cacheOrder($scope.tempOrder);
    };

    $scope.errorMessages = [];
    function analyzeErrors() {
        var order = angular.copy($scope.tempOrder);
        $scope.errorMessages = [];
        var shipAddressMissing = false; var shipperMissing = false; var qtyError = false;
        angular.forEach(order.LineItems, function(li) {
            if (!li.ShipAddressID) {shipAddressMissing = true;}
            if (!li.ShipperID) {shipperMissing = true;}
            if (!li.Quantity || li.Quantity == 0) {qtyError = true}
        });
        //if (!order.PhoneNumber) {$scope.errorMessages.push("Please enter a valid phone number for the order")}
        if (shipAddressMissing) {$scope.errorMessages.push("Please select a ship address for all items");}
        if (shipperMissing) {$scope.errorMessages.push("Please select a ship method for all items");}
        if (qtyError) {$scope.errorMessages.push("Please select a valid quantity for all items");}

        if (order.PaymentMethod == 'CreditCard' && !order.CreditCardID) {
            var CC = angular.copy(order.CreditCard);
            if (!CC.Type && CC.AccountNumber) {$scope.errorMessages.push("Please select a credit card type");}
            if (!CC.AccountNumber) {$scope.errorMessages.push("Please enter a valid credit card account number");}
            if (!CC.ExpirationDate) {$scope.errorMessages.push("Please enter a valid credit card expiration date");}
            if (!CC.CVN) {$scope.errorMessages.push("Please enter a valid credit card CVN");}
            if (!order.BillAddressID) {$scope.errorMessages.push("Please select a billing address");}
        }
        if (order.CreditCardID && !order.BillAddressID) {
            $scope.errorMessages.push("Please select a billing address");
        }
    }
    analyzeErrors();

    /*$scope.$watch('tempOrder.PhoneNumber', function() {
        if ($scope.tempOrder.PhoneNumber) {
            analyzeErrors();
        }
    });*/

    $scope.$watch('tempOrder.CreditCardID', function() {
        analyzeErrors();
    });

    $scope.$watch('tempOrder.PaymentMethod', function() {
        analyzeErrors();
    });

    $scope.$watch('tempOrder.CreditCard', function() {
        analyzeErrors();
    }, true);

    $scope.$watch('tempOrder.BillAddressID', function() {
        analyzeErrors();
    });

    $scope.$on('event:imageLoaded', function(event, result, id) {
        angular.forEach($scope.tempOrder.lineItemGroups, function(group) {
            angular.forEach(group.LineItems, function(li) {
                if (li.UniqueID == id) {
                    li.loadingImage = !result;
                }
            });
        });
        $scope.$apply();
    });

}]);