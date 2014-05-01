four51.app.directive('shortcategoryview', function(){
    var obj = {
        restrict: "E",
        link: function(scope){

        },
        scope: {
            c: '=',
            user: '='
        },
        templateUrl:'partials/GC/shortCategoryView.html',
        controller: 'ShortCategoryViewCtrl'
    };

    return obj;
});