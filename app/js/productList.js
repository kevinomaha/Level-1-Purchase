four51.app.factory('ProductList', function() {

    /*
     These hard-coded product IDs get automatically copied over
     to the $scope.tree products by matching the InteropIDs.
     See mainGCPurchaseCtrl.js
     */
    var products = [
        {
            Name:"Digital e-SuperCertificate® REWARD",
            InteropID: "LEV1DIGSC",
            StandardID: "BEE47855-694E-4CFC-B675-57196F1A207C",
            PremiumID: "41031b07-2dad-42ba-9733-e5794186921f",
            CanadianID: null,
            HolidayID: null,
            PremiumHolidayID: null,
            DisplayName: "Digital e-SuperCertificate®",
            ProductType: "DigitalSC"
        },
        {
            Name:"Original SuperCertificate® REWARD",
            InteropID: "LEVEL1ORIGSC",
            StandardID:"75475BB2-480C-45F4-8AA3-3162BB505B72",
            PremiumID: "A288A4DA-7615-4697-B7E7-CC3B55B39205",
            CanadianID: null,
            HolidayID: null,
            PremiumHolidayID: null,
            DisplayName: "Original SuperCertificate®",
            ProductType: "OriginalSC"
        },
        {
            Name:"Greeting Card SuperCertificate® REWARD",
            InteropID: "LEVEL1GC",
            StandardID:"6474D97E-97C9-4526-BE33-994888C879DE",
            PremiumID: "BD5A7183-D278-41DC-8158-745D29DCDAE1",
            CanadianID: null,
            HolidayID: null,
            PremiumHolidayID: null,
            DisplayName: "Greeting Card SuperCertificate®",
            ProductType: "Greeting Card"
        },
        {
            Name:"SuperCertificate® eCodes",
            InteropID: "LEV1SIGSC",
            StandardID:"8305e929-d049-47f2-9cbe-46dca7f59f14",
            PremiumID: "ccfedc27-e7f6-4bfe-b2f8-2d8f9614ba5b",
            CanadianID: null,
            HolidayID: null,
            PremiumHolidayID: null,
            DisplayName: "SuperCertificate® eCodes",
            ProductType: "eCodes"
        },
        {
            Name:"Non-Monetary eCards",
            InteropID: "LEVEL1NMEC",
            StandardID:"DE2A7DB2-9AB7-46B9-99CB-3F610A227014",
            PremiumID: null,
            CanadianID: null,
            HolidayID: null,
            PremiumHolidayID: null,
            DisplayName: "e-Cards Non Monetary",
            ProductType: "e-Cards"
        },
        {
            Name: "Merchant Gift Cards",
            InteropID: "L1WPMGCAPI",
            StandardID: "MerchantCards",
            PremiumID: null,
            CanadianID: null,
            HolidayID: null,
            DisplayName: "Merchant Gift Cards",
            ProductType: "MerchantCards"
        },
        {
            Name: "Merchant Gift Cards for DealDash",
            InteropID: "L1DDHMGCAPI",
            StandardID: "MerchantCards",
            PremiumID: null,
            CanadianID: null,
            HolidayID: null,
            DisplayName: "Merchant Gift Cards",
            ProductType: "MerchantCards"
        },
        {
            Name: "Merchant Gift Cards for Quibids",
            InteropID: "L1QUIMGCAPI",
            StandardID: "MerchantCards",
            PremiumID: null,
            CanadianID: null,
            HolidayID: null,
            DisplayName: "Merchant Gift Cards",
            ProductType: "MerchantCards"
        }
    ];

    return {
        products: products
    };
});