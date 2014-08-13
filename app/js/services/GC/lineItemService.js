four51.app.factory('LineItems', ['$resource', '$451', 'Address',
function($resource, $451, Address) {
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
			order.merchangeCardsAllDigital = true;
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
		}

		angular.forEach(order.LineItems, function(i) {
			if (i.UniqueID) {
				var addressID = i.ShipAddressID;
				if (!i.InGroup) {
					i.InGroup = true;
                    if (!i.Variant.Specs['FirstName1'] && !i.Variant.Specs['LastName1'] && !i.Variant.Specs['Email1'] && !addressID) {
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
						order.lineItemGroups.push({"ID":addressID,"UniqueID":randomGroupID,"LineItems":[i],"IsDigital":isDigital,"Total": i.LineTotal,"Anonymous": i.Anonymous});
					}
					else {
						if (addressList.indexOf(addressID) == -1) {
							addressList.push(addressID);
							order.lineItemGroups.push({"ID":addressID,"UniqueID":randomGroupID,"LineItems":[i],"IsDigital":isDigital,"Total": i.LineTotal,"Anonymous": i.Anonymous});
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
					if (!i.Product.Specs['Email1']) {
						order.merchangeCardsAllDigital = false;
					}
                    i.Denomination = +(i.Product.Name.split('$')[1].replace(/\D+/g, ''));
                    i.Markup = (i.Denomination != i.UnitPrice) ? (i.UnitPrice - i.Denomination) : null;
					order.merchantCardLineItems.push(i);
				}
			}
		});

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

	}

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
    }

    var _reduceV = function(variant) {
        var v = {};
        v.tempSpecs = angular.copy(variant.Specs);
        v.Specs = {};
        angular.forEach(v.tempSpecs, function(spec) {
            v.Specs[spec.Name] = {"Value": spec.Value, "Name": spec.Name};
        });
        delete v.tempSpecs;
        v.InteropID = variant.InteropID;
        v.ProductInteropID = variant.ProductInteropID;
        v.PreviewUrl = variant.PreviewUrl;

        return v;
    }

    var _reduceP = function(product) {
        var p = {};
        p.InteropID = product.InteropID;
        p.ExternalID = product.ExternalID;

        return p;
    }

    var _reducePS = function(priceschedule) {
        var ps = {};
        ps.ProductID = priceschedule.ProductID;

        return ps;
    }

    var _groupOrderHistory = function(order) {
        order.lineItemGroups = [];
        var addressList = [];

        angular.forEach(order.LineItems, function(i) {
            var addressID = i.ShipAddressID;
            var isDigital = (i.Specs['Physical/Digital'] && i.Specs['Physical/Digital'].Value == 'Digital');
            if (i.LineTotal > 399) {
                order.lineItemGroups.push({"ID":addressID,"LineItems":[i],"IsDigital":isDigital,"Total": i.LineTotal});
            }
            else {
                if (addressList.indexOf(addressID) == -1) {
                    addressList.push(addressID);
                    order.lineItemGroups.push({"ID":addressID,"LineItems":[i],"IsDigital":isDigital,"Total": i.LineTotal});
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

	return {
        groupPreSubmit: _groupPreSubmit,
        clean: _clean,
        reduceVariant: _reduceV,
        reduceProduct: _reduceP,
        reducePriceSchedule: _reducePS,
        groupOrderHistory: _groupOrderHistory
	}
}]);