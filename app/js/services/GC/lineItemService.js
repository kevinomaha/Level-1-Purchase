four51.app.factory('LineItems', ['$resource', '$451', 'Address', 'Variant',
function($resource, $451, Address, Variant) {
	function _then(fn, data) {
		if (angular.isFunction(fn))
			fn(data);
	}

	var _groupPreSubmit = function(order) {

		if (!order.lineItemGroups) {
			order.lineItemGroups = [];
		}

		if (!order.merchantCardLineItems) {
			order.merchantCardLineItems = [];
			order.merchantCardsAllDigital = true;
		}

		var addressList = [];

		var randomString = function() {
			var chars = "0123456789abcdefghijklmnop";
			var string_length = 10;
			var randomstring = '';
			for (var i=0; i<string_length; i++) {
				var rnum = Math.floor(Math.random() * chars.length);
				randomstring += chars.substring(rnum,rnum+1);
			}
			return randomstring;
		};

        var itemCount = 0;

		angular.forEach(order.LineItems, function(i) {
            i.loadingImage = true;
			if (i.UniqueID) {
				var addressID = i.ShipAddressID;
				if (!i.InGroup) {
					i.InGroup = true;
                    i.Added = false;
                    if ((!i.Variant.Specs['FirstName1'] && !i.Variant.Specs['LastName1'] && !i.Variant.Specs['Email1'] && !addressID) || (i.Variant.Specs['FirstName1'] && !i.Variant.Specs['FirstName1'].Value && i.Variant.Specs['LastName1'] && !i.Variant.Specs['LastName1'].Value && i.Variant.Specs['Email1'] && !i.Variant.Specs['Email1'].Value)) {
                        i.Anonymous = true;
                        i.UniqueID = 'anonymous' + i.UniqueID;
                        addressID = i.UniqueID;
                    }
                    else {
                        i.Anonymous = false;
                    }
					var randomGroupID = randomString();
                    i.IsDigital = (i.Specs['Physical/Digital'] && i.Specs['Physical/Digital'].Value == 'Digital');

                    if (addressList.indexOf(addressID) == -1) {
                        addressList.push(addressID);
                        order.lineItemGroups.push({"ID":addressID,"UniqueID":randomGroupID,"LineItems":[i],"IsDigital": i.IsDigital,"Total": i.LineTotal,"FaceTotal": i.FaceValue,"Anonymous": i.Anonymous,"Page":1,"Limit":10});
                        itemCount++;
                    }
                    else {
                        for (var g = 0; g < order.lineItemGroups.length; g++) {
                            if ((order.lineItemGroups[g].ID == addressID && order.lineItemGroups[g].LineItems.length < 400 && ((order.lineItemGroups[g].FaceTotal + i.FaceValue) <= 10000)) || i.IsDigital) {
                                if (order.lineItemGroups[g].Shipper) {
                                    i.Shipper = order.lineItemGroups[g].Shipper;
                                    i.ShipMethod = order.lineItemGroups[g].Shipper.Name;
                                    i.ShipperName = order.lineItemGroups[g].Shipper.Name;
                                    i.ShipperID = order.lineItemGroups[g].Shipper.ID;
                                }
                                order.lineItemGroups[g].LineItems.push(i);
                                i.Added = true;
                                order.lineItemGroups[g].Total += i.LineTotal;
                                order.lineItemGroups[g].FaceTotal += i.FaceValue;
                            }
                            else if (!order.lineItemGroups[g+1] && !i.Added) {
                                order.lineItemGroups.push({"ID":addressID,"UniqueID":randomGroupID,"LineItems":[],"IsDigital":i.IsDigital,"Total": 0,"FaceTotal": 0,"Anonymous": i.Anonymous,"Page":1,"Limit":10});
                            }
                        }
                    }

				}
				else {
					if (addressList.indexOf(addressID) == -1) {
						addressList.push(addressID);
					}
				}
			}
			else {
				if (!i.MerchantCardAdded) {
					i.MerchantCardAdded = true;
                    i.Editing = false;
					if (!i.Product.Specs['Email1']) {
						order.merchantCardsAllDigital = false;
					}
                    i.Denomination = +(i.Product.Name.split('$')[1].replace(/\D+/g, ''));
                    i.Markup = (i.Denomination != i.UnitPrice) ? (i.UnitPrice - i.Denomination) : null;
					order.merchantCardLineItems.push(i);
				}
			}
		});

        for (var g = 0; g < order.lineItemGroups.length; g++) {
            order.lineItemGroups[g].Total = 0;
            for (var li = 0; li < order.lineItemGroups[g].LineItems.length; li++) {
                order.lineItemGroups[g].Total += order.lineItemGroups[g].LineItems[li].LineTotal;
            }
        }

        function endsWith(str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }

		for (var i = 0; i < addressList.length; i++) {
            if (addressList[i] && addressList[i].indexOf('anonymous') == -1) {
                Address.get(addressList[i], function(add) {
                    for (var g = 0; g < order.lineItemGroups.length; g++) {
                        if (order.lineItemGroups[g].ID == add.ID) {
                            order.lineItemGroups[g].Address = add;
                        }
                    }
                });
            }
		}

        store.set("451Cache.TempOrder",{});
        var o = angular.copy(order);
        store.set("451Cache.TempOrder",LZString.compressToUTF16(JSON.stringify(o)));

	};

    var _clean = function(order) {
        angular.forEach(order.LineItems, function(li) {
            if (li.Variant && li.Variant.Specs) {
                for (var spec in li.Variant.Specs) {
                    if (!li.Variant.Specs[spec].Value) {
                        delete li.Variant.Specs[spec];
                    }
                }
            }
        });
    };

    var _reduceV = function(variant) {
        var v = {};
        if (variant) {
            v.tempSpecs = angular.copy(variant.Specs);
            v.Specs = {};
            angular.forEach(v.tempSpecs, function(spec) {
                v.Specs[spec.Name] = {"Value": spec.Value, "Name": spec.Name};
            });
            delete v.tempSpecs;
            v.InteropID = variant.InteropID;
            v.ProductInteropID = variant.ProductInteropID;
            v.PreviewUrl = variant.PreviewUrl;
        }

        return v;
    };

    var _reduceP = function(product) {
        var p = {};
        p.InteropID = product.InteropID;
        p.ExternalID = product.ExternalID;
        p.Name = product.Name;
        p.Specs = (product.Specs) ? product.Specs : {};

        if (p.ExternalID.indexOf('SCD') > -1) {
            p.StandardID = "SCD-GC12";
        }
        else if (p.ExternalID.indexOf('SCP-GC') > -1) {
            p.StandardID = "SCP-GC2";
        }
        else {
            p.StandardID = "SCP-FD12";
        }

        return p;
    };

    var _reducePS = function(priceschedule) {
        var ps = {};
        ps.ProductID = priceschedule.ProductID;

        return ps;
    };

    var _groupOrderHistory = function(order) {
        var itemCount = order.LineItems.length;
        var variantCount = 0;

        function groupOrder(order) {
            order.lineItemGroups = [];
            order.merchantCards = [];
            var addressList = [];

            angular.forEach(order.LineItems, function (i) {
                i.Anonymous = false;
                i.InGroup = false;
                i.FaceValue = (i.Specs.Denomination1) ? +(i.Specs.Denomination1.Value.replace('$','')) : 0;
                if ((!i.Specs['FirstName1'] && !i.Specs['LastName1'] && !i.Specs['Email1'] && !addressID) || (i.Specs['FirstName1'] && !i.Specs['FirstName1'].Value && i.Specs['LastName1'] && !i.Specs['LastName1'].Value && i.Specs['Email1'] && !i.Specs['Email1'].Value)) {
                    i.Anonymous = true;
                }
                var addressID = i.ShipAddressID;
                var isDigital = (i.Specs['Physical/Digital'] && i.Specs['Physical/Digital'].Value == 'Digital');
                if (!i.IsMerchantCard) {
                    var productName = i.Product.Name;
                    var productObj = {Name: productName, Count: 0};
                    if (addressList.indexOf(addressID) == -1) {
                        addressList.push(addressID);
                        productObj.Count = (i.Quantity > 1) ? (productObj.Count + i.Quantity) : (productObj.Count + 1);
                        order.lineItemGroups.push({"ID": addressID, "LineItems": [i], "IsDigital": isDigital, "Total": i.LineTotal, "FaceTotal": i.FaceValue, "Product": i.Product, "ShipMethod": i.ShipperName, "ShipAddressID": i.ShipAddressID, "Anonymous": false, "ProductList":[productObj]});
                    }
                    else {
                        for (var g = 0; g < order.lineItemGroups.length; g++) {
                            if ((order.lineItemGroups[g].ID == addressID && order.lineItemGroups[g].LineItems.length < 400 && ((order.lineItemGroups[g].FaceTotal + i.FaceValue) <= 10000)) || isDigital) {
                                order.lineItemGroups[g].LineItems.push(i);
                                order.lineItemGroups[g].Total += i.LineTotal;
                                order.lineItemGroups[g].FaceTotal += i.FaceValue;
                                var found = false;
                                angular.forEach(order.lineItemGroups[g].ProductList, function(p) {
                                    if (p.Name == productName) {
                                        found = true;
                                        p.Count = (i.Quantity > 1) ? (p.Count + i.Quantity) : (p.Count + 1);
                                    }
                                });
                                if (!found) {
                                    productObj.Count = (i.Quantity > 1) ? (productObj.Count + i.Quantity) : (productObj.Count + 1);
                                    order.lineItemGroups[g].ProductList.push(productObj);
                                }
                                i.InGroup = true;
                            }
                            else if (!order.lineItemGroups[g+1] && !i.InGroup) {
                                order.lineItemGroups.push({"ID": addressID, "LineItems": [], "IsDigital": isDigital, "Total": 0, "FaceTotal": 0, "Product": i.Product, "ShipMethod": i.ShipperName, "ShipAddressID": i.ShipAddressID, "Anonymous": false, "ProductList": [productObj]});
                            }
                        }
                    }
                }
                else {
                    order.merchantCards.push(i);
                }
            });
        }

        groupOrder(order);

        if (order.IsMultipleShip()) {
            angular.forEach(order.lineItemGroups, function(group) {
                if (group.ShipAddressID) {
                    Address.get(group.ShipAddressID, function(add) {
                        group.ShipAddress = add;
                    });
                }
            });
            angular.forEach(order.merchantCards, function(item) {
                if (item.ShipAddressID) {
                    Address.get(item.ShipAddressID, function(add) {
                        item.ShipAddress = add;
                    });
                }
            });
        }
        else {
            Address.get(order.ShipAddressID || order.LineItems[0].ShipAddressID, function(add) {
                order.ShipAddress = add;
            });
        }


    };

    var _getProductType = function(lineitem) {
        var type = "";

        if (["SCD-GC1","SCP-FD1","SCP-GC"].indexOf(lineitem.Product.ExternalID) > -1) {
            type = "Standard";
        }
        else if (["SCD-ES1","SCP-PS1","SCP-GCS"].indexOf(lineitem.Product.ExternalID) > -1) {
            type = "Premium";
        }
        else if (["CSCD-SC1","CSCP-SC1"].indexOf(lineitem.Product.ExternalID) > -1) {
            type = "Canadian";
        }
        else {
            type = "Standard";
        }

        return type;
    };

    var _setProductSpecs = function(lineitem, product) {
        switch (lineitem.Product.StandardID) {
            case "SCP-FD12":
                product.designSelection = lineitem.Variant.Specs.V10DesignSelection ? lineitem.Variant.Specs.V10DesignSelection.Value : "";
                product.occasionMessage = lineitem.Variant.Specs.V00MessageSelectionList ? lineitem.Variant.Specs.V00MessageSelectionList.Value : "";
                product.PersonalMessage = lineitem.Variant.Specs.V15Message ? lineitem.Variant.Specs.V15Message.Value : "";
                product.ClosingMessage = lineitem.Variant.Specs.V16Closing ? lineitem.Variant.Specs.V16Closing.Value : "";
                product.OpeningOption = lineitem.Variant.Specs.V14OpeningPesonalization ? lineitem.Variant.Specs.V14OpeningPesonalization.Value : "";
                product.logoID = lineitem.Variant.Specs.V17P_LogoFileID ? lineitem.Variant.Specs.V17P_LogoFileID.Value : "";
                break;
            case "SCD-GC12":
                product.designSelection = lineitem.Variant.Specs.V01Design ? lineitem.Variant.Specs.V01Design.Value : "";
                product.occasionMessage = lineitem.Variant.Specs.V02Occasion ? lineitem.Variant.Specs.V02Occasion.Value.replace(/_/g," ") : "";
                product.PersonalMessage = lineitem.Variant.Specs.V04PersonalMessage ? lineitem.Variant.Specs.V04PersonalMessage.Value : "";
                product.ClosingMessage = lineitem.Variant.Specs.V05ClosingMessage ? lineitem.Variant.Specs.V05ClosingMessage.Value : "";
                product.EmailSubject = lineitem.Specs.EmailSubject ? lineitem.Specs.EmailSubject.Value : "";
                product.DeliveryDate = lineitem.Specs.FutureShipDate ? lineitem.Specs.FutureShipDate.Value : "";
                product.OpeningOption = lineitem.Variant.Specs.V09PersonalMessageOp ? lineitem.Variant.Specs.V09PersonalMessageOp.Value : "";
                product.logoID = lineitem.Variant.Specs.V17D_LogoFileID ? lineitem.Variant.Specs.V17D_LogoFileID.Value : "";
                break;
            case "SCP-GC2":
                product.designSelection = lineitem.Variant.Specs.V10DesignSelection ? lineitem.Variant.Specs.V10DesignSelection.Value : "";
                product.occasionMessage = lineitem.Variant.Specs.V11MessageSelection ? lineitem.Variant.Specs.V11MessageSelection.Value : "";
                product.PersonalMessage = lineitem.Variant.Specs.V04PersonalMessage ? lineitem.Variant.Specs.V04PersonalMessage.Value : "";
                product.ClosingMessage = lineitem.Variant.Specs.V05ClosingMessage ? lineitem.Variant.Specs.V05ClosingMessage.Value : "";
                product.OpeningOption = lineitem.Variant.Specs.V09PersonalMessageOp ? lineitem.Variant.Specs.V09PersonalMessageOp.Value : "";
                product.logoID = lineitem.Variant.Specs.V17P_LogoFileID ? lineitem.Variant.Specs.V17P_LogoFileID.Value : "";
                break;
        }
        product.denomination = lineitem.Variant.Specs.Denomination1 ? lineitem.Variant.Specs.Denomination1.Value : "";

            if (product.OpeningOption.indexOf('first and last') > -1) {
                product.OpeningMessageOption = "First and Last Name";
            }
            else if (product.OpeningOption.indexOf('first name only') > -1) {
                product.OpeningMessageOption = "First Name Only";
            }
            else if (product.OpeningOption.indexOf('custom text') > -1) {
                product.OpeningMessageOption = "Custom Message";
            }
            else{
                product.OpeningMessageOption = "None";
            }
    };

    var _cleanPreSubmit = function(o) {
        angular.forEach(o.LineItems, function(li) {
            var product = {
                "ExternalID":li.Product.ExternalID,
                "InteropID":li.Product.InteropID,
                "Name":li.Product.Name
            };
            li.Product = product;

            if (li.Variant) {
                var variant = {
                    "InteropID":li.Variant.InteropID
                };
                li.Variant = variant;
                delete li.Variant.LargeImageUrl;
                delete li.Variant.PreviewUrl;
                delete li.Variant.ProductionURL;
                delete li.Variant.ProofUrl;
            }

            delete li.PriceSchedule;
            delete li.ShipperName;
            delete li.ProductIDText;
            delete li.HistoryCaptured;
            delete li.TotalShipped;
            delete li.ArchivedOnly;
        });

        delete o.AccountLabel;
        delete o.FromUserFirstName;
        delete o.FromUserLastName;
        delete o.HasShipments;
        delete o.Approvals;
        delete o.PaymentMethodText;
    };

	return {
        groupPreSubmit: _groupPreSubmit,
        clean: _clean,
        reduceVariant: _reduceV,
        reduceProduct: _reduceP,
        reducePriceSchedule: _reducePS,
        groupOrderHistory: _groupOrderHistory,
        getProductType: _getProductType,
        setProductSpecs: _setProductSpecs,
        cleanPreSubmit: _cleanPreSubmit
	}
}]);