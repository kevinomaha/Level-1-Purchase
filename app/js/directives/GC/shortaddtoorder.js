four51.app.directive('shortaddtoorder', function(){
    var obj = {
        scope: {
            user: '=',
            order: '='
        },
        link: function(scope){

        },
        restrict: "E",
        templateUrl:'partials/GC/shortAddToOrder.html',
        controller: 'ProductCtrl'
    };

    return obj;
});