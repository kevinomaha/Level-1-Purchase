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

		angular.forEach(order.LineItems, function(i) {
            i.loadingImage = true;
			if (i.UniqueID) {
				var addressID = i.ShipAddressID;
				if (!i.InGroup) {
					i.InGroup = true;
                    if ((!i.Variant.Specs['FirstName1'] && !i.Variant.Specs['LastName1'] && !i.Variant.Specs['Email1'] && !addressID) || (i.Variant.Specs['FirstName1'] && !i.Variant.Specs['FirstName1'].Value && i.Variant.Specs['LastName1'] && !i.Variant.Specs['LastName1'].Value && i.Variant.Specs['Email1'] && !i.Variant.Specs['Email1'].Value)) {
                        i.Anonymous = true;
                        i.UniqueID = 'anonymous' + i.UniqueID;
                        addressID = i.UniqueID;
                    }
                    else {
                        i.Anonymous = false;
                    }
					var randomGroupID = randomString();
					var isDigital = (i.Specs['Physical/Digital'] && i.Specs['Physical/Digital'].Value == 'Digital');
					if (i.LineTotal > 399) {
                        addressList.push(addressID);
						order.lineItemGroups.push({"ID":addressID,"UniqueID":randomGroupID,"LineItems":[i],"IsDigital":isDigital,"Total": i.LineTotal,"Anonymous": i.Anonymous,"Page":1,"Limit":10});
					}
					else {
						if (addressList.indexOf(addressID) == -1) {
							addressList.push(addressID);
							order.lineItemGroups.push({"ID":addressID,"UniqueID":randomGroupID,"LineItems":[i],"IsDigital":isDigital,"Total": i.LineTotal,"Anonymous": i.Anonymous,"Page":1,"Limit":10});
						}
						else {
							for (var g = 0; g < order.lineItemGroups.length; g++) {
								if (order.lineItemGroups[g].ID == addressID) {
									if (order.lineItemGroups[g].Shipper) {
										i.Shipper = order.lineItemGroups[g].Shipper;
										i.ShipMethod = order.lineItemGroups[g].Shipper.Name;
										i.ShipperName = order.lineItemGroups[g].Shipper.Name;
										i.ShipperID = order.lineItemGroups[g].Shipper.ID;
									}
									order.lineItemGroups[g].LineItems.push(i);
									order.lineItemGroups[g].Total += i.LineTotal;
								}
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
            var addressList = [];

            angular.forEach(order.LineItems, function (i) {
                var addressID = i.ShipAddressID;
                var isDigital = (i.Specs['Physical/Digital'] && i.Specs['Physical/Digital'].Value == 'Digital');
                if (i.LineTotal > 399) {
                    order.lineItemGroups.push({"ID": addressID, "LineItems": [i], "IsDigital": isDigital, "Total": i.LineTotal});
                }
                else {
                    if (addressList.indexOf(addressID) == -1) {
                        addressList.push(addressID);
                        order.lineItemGroups.push({"ID": addressID, "LineItems": [i], "IsDigital": isDigital, "Total": i.LineTotal});
                    }
                    else {
                        for (var g = 0; g < order.lineItemGroups.length; g++) {
                            if (order.lineItemGroups[g].ID == addressID) {
                                order.lineItemGroups[g].LineItems.push(i);
                                order.lineItemGroups[g].Total += i.LineTotal;
                            }
                        }
                    }
                }
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
                product.CustomOpeningMessage = lineitem.Variant.Specs.V14Opening ? lineitem.Variant.Specs.V14Opening.Value : "";
                break;
            case "SCD-GC12":
                product.designSelection = lineitem.Variant.Specs.V01Design ? lineitem.Variant.Specs.V01Design.Value : "";
                product.occasionMessage = lineitem.Variant.Specs.V02Occasion ? lineitem.Variant.Specs.V02Occasion.Value.replace(/_/g," ") : "";
                product.PersonalMessage = lineitem.Variant.Specs.V04PersonalMessage ? lineitem.Variant.Specs.V04PersonalMessage.Value : "";
                product.ClosingMessage = lineitem.Variant.Specs.V05ClosingMessage ? lineitem.Variant.Specs.V05ClosingMessage.Value : "";
                product.EmailSubject = lineitem.Specs.EmailSubject ? lineitem.Specs.EmailSubject.Value : "";
                product.DeliveryDate = lineitem.Specs.FutureShipDate ? lineitem.Specs.FutureShipDate.Value : "";
                product.CustomOpeningMessage = lineitem.Variant.Specs.V03OpeningMessage ? lineitem.Variant.Specs.V03OpeningMessage.Value : "";
                break;
            case "SCP-GC2":
                product.designSelection = lineitem.Variant.Specs.V10DesignSelection ? lineitem.Variant.Specs.V10DesignSelection.Value : "";
                product.occasionMessage = lineitem.Variant.Specs.V11MessageSelection ? lineitem.Variant.Specs.V11MessageSelection.Value : "";
                product.PersonalMessage = lineitem.Variant.Specs.V04PersonalMessage ? lineitem.Variant.Specs.V04PersonalMessage.Value : "";
                product.ClosingMessage = lineitem.Variant.Specs.V05ClosingMessage ? lineitem.Variant.Specs.V05ClosingMessage.Value : "";
                product.CustomOpeningMessage = lineitem.Variant.Specs.V03OpeningMessage ? lineitem.Variant.Specs.V03OpeningMessage.Value : "";
                break;
        }
        product.denomination = lineitem.Variant.Specs.Denomination1 ? lineitem.Variant.Specs.Denomination1.Value : "";

        if (product.CustomOpeningMessage) {
            if (lineitem.Variant.Specs.FirstName1 && lineitem.Variant.Specs.LastName1 && product.CustomOpeningMessage == (lineitem.Variant.Specs.FirstName1.Value + ' ' + lineitem.Variant.Specs.LastName1.Value)) {
                product.OpeningMessageOption = "First and Last Name";
            }
            else if (lineitem.Variant.Specs.FirstName1 && product.CustomOpeningMessage == lineitem.Variant.Specs.FirstName1.Value) {
                product.OpeningMessageOption = "First Name Only";
            }
            else {
                product.OpeningMessageOption = "Custom Message";
            }
        }
        else {
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