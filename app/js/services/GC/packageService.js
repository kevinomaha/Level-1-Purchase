four51.app.factory('PackageService', ['$location', 'Order', 'User', function($location, Order, User) {
    return {
        deletePackage: _deletePackage,
        setShippers: _setShippers
    };

    function _deletePackage(currentOrder, packageObject) {
        angular.forEach(packageObject.items, function(item) {
            angular.forEach(currentOrder.LineItems, function(lineitem) {
                if (item.ID === lineitem.ID) {
                    //currentOrder.LineItems.splice(index, 1);
                    Order.deletelineitem(currentOrder.ID, item.ID,
                    function(order) {
                        if (order.LineItems.length > 0) {
                            $location.path('cart');
                        } else {
                            User.get(function(user) {
                                user.CurrentOrderID = null;
                                User.save(user);
                            });
                            $location.path('main');
                        }
                    },
                    function(ex) {
                    });
                }
            });
        });
        //Order.save(currentOrder);
    }

    function _setShippers(currentOrder, packageObject) {
        angular.forEach(packageObject.items, function(item) {
            angular.forEach(currentOrder.LineItems, function(lineitem) {
                if (item.ID === lineitem.ID) {
                    lineitem.ShipperID = packageObject.ShipperID;
                }
            });
        });
        Order.save(currentOrder);
    }
}]);
