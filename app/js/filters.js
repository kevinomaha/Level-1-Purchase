four51.app.filter('onproperty', ['$451', function($451) {
	var defaults = {
		'OrderStats': 'Type',
		'Message': 'Box'
	};

	return function(input, query) {
		if (!input || input.length === 0) return;
		if (!query) return input;
		query.Property = query.Property || defaults[query.Model];
		return $451.filter(input, query);
	}
}]);

four51.app.filter('kb', function() {
	return function(value) {
		return isNaN(value) ? value : parseFloat(value) / 1024;
	}
});

four51.app.filter('r', ['$sce', 'WhiteLabel', function($sce, WhiteLabel) {
	return function(value) {
		var result = value, found = false;
		angular.forEach(WhiteLabel.replacements, function(c) {
			if (found) return;
			if (c.key == value) {
				result = $sce.trustAsHtml(c.value);
				found = true;
			}
		});
		return result;
	}
}]);

four51.app.filter('rc', ['$sce', 'WhiteLabel', function($sce, WhiteLabel) {
	return function(value) {
		var result = value, found = false;
		angular.forEach(WhiteLabel.replacements, function(c) {
			if (found) return;
			if (c.key.toLowerCase() == value.toLowerCase()) {
				result = $sce.trustAsHtml(c.value);
				found = true;
			}
		});
		return result;
	}
}]);

four51.app.filter('rl', ['$sce', 'WhiteLabel', function($sce, WhiteLabel) {
	return function(value) {
		var result = value, found = false;
		angular.forEach(WhiteLabel.replacements, function(c) {
			if (found) return;
			if (c.key.toLowerCase() == value.toLowerCase()) {
				result = $sce.trustAsHtml(c.value.toLowerCase());
				found = true;
			}
		});
		return result;
	}
}]);

four51.app.filter('noliverates', function() {
	return function(value) {
		var output = [];
		angular.forEach(value, function(v) {
			if (v.ShipperRateType != 'ActualRates')
				output.push(v);
		});
		return output;
	}
});

four51.app.filter('paginate', function() {
	return function(input, start) {
		start = +start; //parse to int
		return input.slice(start);
	}
});

//GC INCENTIVES PURCHASE
four51.app.filter('gcbuyercompanyurl', function() {
    return function(name) {
        if (name) {
            name = name.replace(/ /g,'').toLowerCase();
            return name;
        }
    }
});

four51.app.filter('invalidRecipients', function() {
    return function(recipients,invalidRecipients) {
        var results = [];

        if (invalidRecipients == 'true') {
            for (var i = 0; i < recipients.length; i++) {
                if (recipients[i].Invalid) {
                    results.push(recipients[i])
                }
            }
        }
        else {
            results = recipients;
        }

        return results;
    }
});

four51.app.filter('awardlessRecipients', function() {
    return function(recipients,awardlessRecipients) {
        var results = [];

        if (awardlessRecipients == 'true') {
            for (var i = 0; i < recipients.length; i++) {
                if (recipients[i].AwardCount == 0) {
                    results.push(recipients[i])
                }
            }
        }
        else {
            results = recipients;
        }

        return results;
    }
});
four51.app.filter('gcshipping', function() {
    return function(value) {
        var name = "";
        var split = value.split('-');
        for (var i = 1; i < split.length; i++) {
            if (i > 1) {
                name += "-" + split[i];
            }
            else {
                name += split[i];
            }
        }
        return name;
    }
});

four51.app.filter('gcshippers', function() {
    return function(shipper,orderTotal,itemCount,isDigital) {
        var results = [];
        if (!isDigital) {
            angular.forEach(shipper, function(s) {

                if (orderTotal > 9999 || itemCount > 399) {
                    if (s.Name.match("13-") || s.Name.match("16-") || s.Name.match("20-")) {
                        results.push(s);
                    }
                }
                else if (orderTotal > 399) {
                    if (s.Name.match("5-") || s.Name.match("13-") || s.Name.match("16-") || s.Name.match("20-") || s.Name.match("75-") || s.Name.match("77-")) {
                        results.push(s);
                    }
                }
                else {
                    if (!(s.Name.match("75-") && s.Name.indexOf('0.00') > -1)) {
                        results.push(s);
                    }
                }
            });

            //Remove Email Delivery
            results.splice(0,1);
        }
        else {
            angular.forEach(shipper, function(s) {
                if (!s.isCustEditable && s.Name.indexOf('Email Delivery') > -1) {
                    results.push(s);
                }
            });
        }

        return results;
    }
});

four51.app.filter('gcshipaddress', function() {
    return function(addresses,isAllDigital) {
        var results = [];
        if (!isAllDigital) {
            angular.forEach(addresses, function(a) {
                //Order is not all digital - return only user created addresses - Email Delivery will be filtered out
                if (a.AddressName != 'Email Delivery' && a.IsCustEditable) {
                    results.push(a);
                }
            });
        }
        else {
            angular.forEach(addresses, function(a) {
                //Order is all digital - return Email Delivery only
                if (a.AddressName == 'Email Delivery' && !a.IsCustEditable) {
                    results.push(a);
                }
            });
        }

        return results;
    }
});

four51.app.filter('specnames', function() {
    return function(value) {
        if (value) {
            switch (value) {
                case "Email1":
                    value = "Email Address";
                    break;
                case "OrderEmailAddress":
                    value = "Email Address for Order Notifications";
                    break;
                case "EmailAddress":
                    value = "Email Address for Order Notifications";
                    break;
                case "Subject1":
                    value = "Subject";
                    break;
                case "Message1":
                    value = "Message";
                    break;
            }
        }

        return value;
    }
});

four51.app.filter('gccustomorderfieldemail', function() {
    return function(fields) {
        var results = [];
        angular.forEach(fields, function(f) {
            if (f.Name == 'OrderEmailAddress' || f.Name == 'EmailAddress') {
                results.push(f);
            }
        });

        return results;
    }
});

four51.app.filter('gccustomorderfieldsnonemail', function() {
    return function(fields,isAllDigital) {
        var results = [];
        if (!isAllDigital) {
            angular.forEach(fields, function(f) {
                if (f.Name != 'OrderEmailAddress') {
                    results.push(f);
                }
            });
        }

        return results;
    }
});

four51.app.filter('gcproductnames', function() {
    return function(name) {
        if (name) {
            name = name.split(' $')[0] + name.split(' $')[1].replace(/\d/g,'');

            return name;
        }
    }
});


four51.app.filter('gcbuyercompanyurl', function() {
    return function(name) {
        if (name) {
            name = name.replace(/ /g,'').toLowerCase();
            var url = 'css/images/company/'+ name +'.png'
            return url;
        }
    }
});

four51.app.filter('billingAddresses', function() {
    return function(addresses,order) {
        if (addresses) {
            var results = [];
            if (order.PaymentMethod && order.PaymentMethod == 'BudgetAccount') {
                angular.forEach(addresses, function(a) {
                    if (a.AddressName == 'Main Billing Address') {
                        results.push(a);
                    }
                });
            }
            else {
                angular.forEach(addresses, function(a) {
                    if (a.AddressName != 'Main Billing Address') {
                        results.push(a);
                    }
                });
            }

            return results;
        }
        else {
            return [];
        }
    }
});

four51.app.filter('gcProductDesignNames', function() {
    return function(name,selectedproduct) {
        var value = "";

        if (name) {
            value = name.split(' |')[0];
        }

        return value;
    }
});

four51.app.filter('gcProductDesigns', function() {
    return function(specs,selectedproduct) {
        var results = [];

        if (specs) {
            for (var s in specs) {
                switch (selectedproduct.StandardID) {
                    case "SCD-GC12":
                        if (specs[s].Name == "V01Design") {
                            for (var o in specs[s].Options) {
                                results.push(specs[s].Options[o]);
                            }
                        }
                        break;
                    case "SCP-FD12":
                        if (specs[s].Name == "V10DesignSelection") {
                            for (var o in specs[s].Options) {
                                results.push(specs[s].Options[o]);
                            }
                        }
                        break;
                    case "SCP-GC2":
                        if (specs[s].Name == "V10DesignSelection") {
                            for (var o in specs[s].Options) {
                                results.push(specs[s].Options[o]);
                            }
                        }
                        break;
                }
            }
        }

        return results;
    }
});

four51.app.filter('gcProductDenominations', function() {
    return function(specs) {
        var results = [];

        if (specs) {
            for (var s in specs) {
                if (specs[s].Name == "Denomination1") {
                    for (var o in specs[s].Options) {
                        results.push(specs[s].Options[o]);
                    }
                }
            }
        }

        return results;
    }
});

four51.app.filter('gcProductOpeningMessageOptions', function() {
    return function(specs) {
        var results = [];

        if (specs) {
            for (var s in specs) {
                if (specs[s].Name == "V14OpeningPesonalization" || specs[s].Name == "V09PersonalMessageOp") {
                    for (var o in specs[s].Options) {
                        results.push(specs[s].Options[o]);
                    }
                }
            }
        }

        return results;
    }
});

four51.app.filter('merchantTree', function() {
    return function(tree) {
        var results = [];

        for (var cat in tree) {
            if (tree[cat].Name == "Merchant Gift Cards" || tree[cat].SubCategories.length == 0 && tree[cat].Name.indexOf('Super') == -1) {
                results.push(tree[cat]);
            }
        }

        return results;
    }
});

four51.app.filter('merchantFilter', function() {
    return function(merchants,term) {
        var results = [];

        if (term) {
            term = term.toLowerCase();
            angular.forEach(merchants, function(m) {
                m.Name.toLowerCase().indexOf(term) > -1 ?
                    results.push(m) :
                    null;
            });
        }
        else {
            results = merchants;
        }

        return results;
    }
});

four51.app.filter('telephone', function() {
    return function(tel) {
        if (!tel) { return ''; }

        var value = tel.toString().trim().replace(/^\+/, '');

        if (value.match(/[^0-9]/)) {
            return tel;
        }

        var country, city, number;

        switch (value.length) {
            case 10: // +1PPP####### -> C (PPP) ###-####
                country = 1;
                city = value.slice(0, 3);
                number = value.slice(3);
                break;

            case 11: // +CPPP####### -> CCC (PP) ###-####
                country = value[0];
                city = value.slice(1, 4);
                number = value.slice(4);
                break;

            case 12: // +CCCPP####### -> CCC (PP) ###-####
                country = value.slice(0, 3);
                city = value.slice(3, 5);
                number = value.slice(5);
                break;

            default:
                return tel;
        }

        if (country == 1) {
            country = "";
        }

        number = number.slice(0, 3) + '-' + number.slice(3);

        return (country + " (" + city + ") " + number).trim();
    }
});