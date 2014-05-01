four51.app.directive('paymentselectorgc', function() {
   var obj = {
       restrict: 'E',
	   priority: 99,
       templateUrl: 'partials/controls/GC/paymentSelection.html',
       controller: 'PaymentSelectionController'
   };

   return obj;
});