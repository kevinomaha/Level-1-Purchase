four51.app.factory('ProductList', function() {

    /*
     These hard-coded product IDs get automatically copied over
     to the $scope.tree products by matching the InteropIDs.
     See mainGCPurchaseCtrl.js
     */
    var products = [
        {
            Name:"Digital e-SuperCertificate® REWARD (emailable)",
            InteropID: "2d549bc6-db1d-46fa-bac6-1555558225fa",
            StandardID:"0C83AB6E-E4A2-4B6C-87D5-9EBE6D5B4E34",
            PremiumID:"SCD-ES12",
            CanadianID:"CSCD-SC12",
            HolidayID:"HOLSCD-GC1",
            PremiumHolidayID:"HOLSCD-ES1",
            DisplayName: "Digital e-SuperCertificate®"
        },
        {
            Name:"Original SuperCertificate® REWARD",
            InteropID: "53fef6f3-d384-432e-a2e1-2de1f20af5e2",
            StandardID:"0767B64D-767B-4F7F-97B6-654ED3B6E04E",
            PremiumID:"SCP-PS12",
            CanadianID:"CSCP-SC12",
            HolidayID:"HOLSCP-FD1",
            PremiumHolidayID:"HOLSCP-PS1",
            DisplayName: "Original SuperCertificate®"
        },
        {
            Name:"Greeting Card SuperCertificate® REWARD",
            InteropID: "5daf87c9-399b-4a48-8b4e-31e3f9c71830",
            /*StandardID:"SCP-GC",*/
            StandardID:"SVF-ECARD-01",
            PremiumID:"SCP-GCS2",
            CanadianID:null,
            HolidayID:"HOLSCP-GC",
            PremiumHolidayID:"HOLSCP-GCS",
            DisplayName: "Greeting Card SuperCertificate®"
        },
        {
            Name: "Merchant Gift Cards",
            InteropID: "L1slctv2MGC3",
            StandardID: "MerchantCards",
            PremiumID: "",
            CanadianID: "",
            HolidayID: "",
            DisplayName: "Merchant Gift Cards",
            ProductType: "MerchantCards"
        },
        {
            Name:"Visa Reward Card",
            InteropID: "5a932e83-eda9-4a01-8b32-139d9b538a95",
            StandardID:"172A0644-487A-4223-A600-A4DC7494FAB1",
            PremiumID:"",
            CanadianID:"",
            HolidayID:"",
            DisplayName: "Visa Reward Card."
        }
    ];

    return {
        products: products,
    };
});