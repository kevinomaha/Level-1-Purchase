four51.app.factory('Grouping', function() {
    var service = {
        groupOrder: _groupOrder
    };

    function _groupOrder(lineItems) {
        return groupByProduct(lineItems);
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

    function trimProductName(productName) {
        return productName.replace('Premium ', '').replace('Canadian ', '');
    }

    function groupByAddress(productGroup) {

    }

    function groupByPackage(addressGroup) {

    }

    return service;
});