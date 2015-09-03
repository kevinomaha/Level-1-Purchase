four51.app.factory('Grouping', ['Address', function(Address) {
    var service = {
        groupOrder: _groupOrder
    };

    function _groupOrder(lineItems) {
        var productGroupedOrder = groupByProduct(lineItems);
        var addressGroupedOrder = [];
        var packageGroupedOrder = [];
        angular.forEach(productGroupedOrder, function(subOrder) {
            if (subOrder.length > 1 && !subOrder[0].IsDigital) {
                addressGroupedOrder = addressGroupedOrder.concat(groupByAddress(subOrder));
            }
            else {
                addressGroupedOrder.push(subOrder);
            }
        });
        angular.forEach(addressGroupedOrder, function(subOrder, index) {
            packageGroupedOrder.push(createPackageObject(subOrder, index + 1));
        });
        if(packageGroupedOrder.length > 1){
            angular.forEach(packageGroupedOrder, function(packageObject, index) {
                if(packageObject.itemCount > 1){
                    if (!packageObject.items[0].IsDigital && (packageObject.itemCount > 400 || packageObject.packageTotal > 10000)) {
                        //Split package
                        var splitPackages = splitPackage([], packageObject); //Return array of package objects
                        //Remove old package
                        packageGroupedOrder.splice(index, 1);
                        //Push split packages (could be two or more)
                        packageGroupedOrder = packageGroupedOrder.concat(splitPackages);
                    }
                }
            });
        }

        return packageGroupedOrder;
    }

    function groupByProduct(lineItems) {
        var productGroups = [];
        var productsArray = [];

        // Create a list of all the product types available in the order
        angular.forEach(lineItems, function(item) {
            var name = trimProductName(item.Product.Name);
            if (productsArray.indexOf(name) === -1) {
                productsArray.push(name);
            }
        });

        angular.forEach(productsArray, function() {
            productGroups.push([]);
        });

        angular.forEach(lineItems, function(item) {
            for(var i = 0; i < productsArray.length; i++) {
                if (item.Product.Name.indexOf(productsArray[i]) > -1) {
                    productGroups[i].push(item);
                }
            }
        });

        return productGroups;
    }

    // Removes extra data from product name to manage grouping
    function trimProductName(productName) {
        return productName.replace('Premium ', '').replace('Canadian ', '');
    }

    function groupByAddress(productGroup) {
        var addressGroups = [];
        var addressesArray = [];

        // Create a list of all address within product group
        angular.forEach(productGroup, function(item) {
            if (addressesArray.indexOf(item.ShipAddressID) === -1) {
                addressesArray.push(item.ShipAddressID)
            }
        });

        angular.forEach(addressesArray, function() {
            addressGroups.push([]);
        });

        angular.forEach(productGroup, function(item) {
            for (var i = 0; i < addressesArray.length; i++) {
                if (item.ShipAddressID.indexOf(addressesArray[i]) > -1) {
                    addressGroups[i].push(item);
                }
            }
        });

        return addressGroups;
    }

    function splitPackage(packages, packageObject) {
        var package1 = [];
        var package2 = [];
        var returnArray = packages || [];
        var total = 0;
        var numItems = 0;
        angular.forEach(packageObject.items, function(item) {
            if ((total + item.LineTotal) <= 10000 && numItems < 400) {
                package1.push(item);
                total += item.LineTotal;
                numItems += 1;
            }
            else {
                package2.push(item);
            }
        });
        returnArray.push(createPackageObject(package1));
        if(package2){
            var secPackage = createPackageObject(package2);
        }
        if (secPackage.packageTotal > 10000 || secPackage.itemCount > 400) {
            splitPackage(returnArray, secPackage);
        }
        else {
            returnArray.push(secPackage);
        }

        return completedArray;
    }

    function createPackageObject(orderPackage, packageIndex) {
        var packageObject = {
            packageNum: 0,
            packageTotal: 0,
            itemCount: 0,
            shipTo: '',
            shipAddress: {},
            digital: false,
            items: []
        };
        packageObject.packageNum = packageIndex;
        packageObject.itemCount = orderPackage.length;
        packageObject.items = orderPackage;
        packageObject.digital = orderPackage[0].IsDigital;
        packageObject.shipTo = orderPackage[0].ShipFirstName + ' ' + orderPackage[0].ShipLastName;
        Address.get(orderPackage[0].ShipAddressID, function(address) {
            packageObject.shipAddress = address;
        })
        var total = 0;
        angular.forEach(orderPackage, function(item) {
            total += item.LineTotal;
        });
        packageObject.packageTotal = total.toFixed(2);

        return packageObject;
    }

    return service;
}]);