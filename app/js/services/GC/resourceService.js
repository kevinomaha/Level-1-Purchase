four51.app.factory('Resources', function() {
    var countries = [
        { "label": "United States of America", "value": "US"},
        { "label": "Canada", "value": "CA"}
    ];
    var states = [
        { "label": "Alabama", "value": "AL", "country": "US" },
        { "label": "Alaska", "value": "AK", "country": "US" },
        { "label": "Arizona", "value": "AZ", "country": "US" },
        { "label": "Arkansas", "value": "AR", "country": "US" },
        { "label": "California", "value": "CA", "country": "US" },
        { "label": "Colorado", "value": "CO", "country": "US" },
        { "label": "Connecticut", "value": "CT", "country": "US" },
        { "label": "Delaware", "value": "DE", "country": "US" },
        { "label": "District of Columbia", "value": "DC", "country": "US" },
        { "label": "Florida", "value": "FL", "country": "US" },
        { "label": "Georgia", "value": "GA", "country": "US" },
        { "label": "Hawaii", "value": "HI", "country": "US" },
        { "label": "Idaho", "value": "ID", "country": "US" },
        { "label": "Illinois", "value": "IL", "country": "US" },
        { "label": "Indiana", "value": "IN", "country": "US" },
        { "label": "Iowa", "value": "IA", "country": "US" },
        { "label": "Kansas", "value": "KS", "country": "US" },
        { "label": "Kentucky", "value": "KY", "country": "US" },
        { "label": "Louisiana", "value": "LA", "country": "US" },
        { "label": "Maine", "value": "ME", "country": "US" },
        { "label": "Maryland", "value": "MD", "country": "US" },
        { "label": "Massachusetts", "value": "MA", "country": "US" },
        { "label": "Michigan", "value": "MI", "country": "US" },
        { "label": "Minnesota", "value": "MN", "country": "US" },
        { "label": "Mississippi", "value": "MS", "country": "US" },
        { "label": "Missouri", "value": "MO", "country": "US" },
        { "label": "Montana", "value": "MT", "country": "US" },
        { "label": "Nebraska", "value": "NE", "country": "US" },
        { "label": "Nevada", "value": "NV", "country": "US" },
        { "label": "New Hampshire", "value": "NH", "country": "US" },
        { "label": "New Jersey", "value": "NJ", "country": "US" },
        { "label": "New Mexico", "value": "NM", "country": "US" },
        { "label": "New York", "value": "NY", "country": "US" },
        { "label": "North Carolina", "value": "NC", "country": "US" },
        { "label": "North Dakota", "value": "ND", "country": "US" },
        { "label": "Ohio", "value": "OH", "country": "US" },
        { "label": "Oklahoma", "value": "OK", "country": "US" },
        { "label": "Oregon", "value": "OR", "country": "US" },
        { "label": "Pennsylvania", "value": "PA", "country": "US" },
        { "label": "Rhode Island", "value": "RI", "country": "US" },
        { "label": "South Carolina", "value": "SC", "country": "US" },
        { "label": "South Dakota", "value": "SD", "country": "US" },
        { "label": "Tennessee", "value": "TN", "country": "US" },
        { "label": "Texas", "value": "TX", "country": "US" },
        { "label": "Utah", "value": "UT", "country": "US" },
        { "label": "Vermont", "value": "VT", "country": "US" },
        { "label": "Virginia", "value": "VA", "country": "US" },
        { "label": "Washington", "value": "WA", "country": "US" },
        { "label": "West Virginia", "value": "WV", "country": "US" },
        { "label": "Wisconsin", "value": "WI", "country": "US" },
        { "label": "Wyoming", "value": "WY", "country": "US" },
        { "label": "Puerto Rico", "value": "PR", "country": "US" },
        { "label": "Drenthe", "value": "Drenthe", "country": "NL" },
        { "label": "Flevoland", "value": "Flevoland", "country": "NL" },
        { "label": "Friesland", "value": "Friesland", "country": "NL" },
        { "label": "Gelderland", "value": "Gelderland", "country": "NL" },
        { "label": "Groningen", "value": "Groningen", "country": "NL" },
        { "label": "Limburg", "value": "Limburg", "country": "NL" },
        { "label": "Noord-Brabant", "value": "Noord-Brabant", "country": "NL" },
        { "label": "Noord-Holland", "value": "Noord-Holland", "country": "NL" },
        { "label": "Overijssel", "value": "Overijssel", "country": "NL" },
        { "label": "Utrecht", "value": "Utrecht", "country": "NL" },
        { "label": "Zeeland", "value": "Zeeland", "country": "NL" },
        { "label": "Zuid-Holland", "value": "Zuid-Holland", "country": "NL" },
        { "label": "Alberta", "value": "AB", "country": "CA" },
        { "label": "British Columbia", "value": "BC", "country": "CA" },
        { "label": "Manitoba", "value": "MB", "country": "CA" },
        { "label": "New Brunswick", "value": "NB", "country": "CA" },
        { "label": "Newfoundland and Labrador", "value": "NL", "country": "CA" },
        { "label": "Northwest Territories", "value": "NT", "country": "CA" },
        { "label": "Nova Scotia", "value": "NS", "country": "CA" },
        { "label": "Nunavut", "value": "NU", "country": "CA" },
        { "label": "Ontario", "value": "ON", "country": "CA" },
        { "label": "Prince Edward Island", "value": "PE", "country": "CA" },
        { "label": "Saskatchewan", "value": "SK", "country": "CA" },
        { "label": "Yukon", "value": "YT", "country": "CA" }
    ];

	var productCategories = {
		"Auto, Home & Office": [
			"American Home Shield",
			"Amerispec",
			"AutoZone",
			"Bed, Bath & Beyond",
			"Chevron",
			"Cooking.com",
			"Crate and Barrel",
			"Furniture Medic",
			"HomeGoods",
			"Lowe's",
			"Merry Maids",
			"Pep Boys",
			"Pier 1 Imports",
			"Pottery Barn",
			"ServiceMaster Clean",
			"Shell",
			"Terminix",
			"The Container Store",
			"The Home Depot",
			"TruGreen",
			"Williams-Sonoma",
			"Williams-Sonoma®"
		],
		"Babies, Kids & Toys": [
			"babyGap",
			"Crewcuts by J. Crew",
			"Crewcuts by J.Crew",
			"Fat Brain Toys",
			"GapKids",
			"Kids Foot Locker",
			"Pottery Barn Kids",
			"The Children's Place"
		],
		"Clothing, Shoes & Accessories": [
			"A Pea in the Pod",
			"aerie by American Eagle",
			"American Eagle Outfitters",
			"Ann Taylor",
			"Ann Taylor LOFT",
			"Banana Republic",
			"Buckle",
			"Destination Maternity",
			"DOTS",
			"DSW Shoe Warehouse",
			"EXPRESS",
			"Finish Line",
			"Foot Locker",
			"FootLocker.com",
			"Gap",
			"J. Crew",
			"J. Jill",
			"L.L. Bean",
			"Lady Foot Locker",
			"Lands' End",
			"Lane Bryant",
			"Men's Wearhouse",
			"Motherhood Maternity",
			"New York & Company",
			"Old Navy",
			"Payless ShoeSource",
			"Sunglass Hut",
			"Talbots",
			"The Limited",
			"Zales",
			"Zappos.com"
		],
		"Department Stores": [
			"Amazon.com",
			"Belk",
			"Bergner's",
			"Bloomingdale's",
			"BonTon",
			"Boston Store",
			"Carson Pirie Scott",
			"Dillard's",
			"Elder Beerman",
			"Gordmans",
			"Herberger's",
			"Kmart",
			"Kohl's",
			"Macy's",
			"Marshalls",
			"Neiman Marcus",
			"Neiman Marcus Last Call",
			"Neiman Marcus 'Last Call'",
			"Overstock.com",
			"Saks Fifth Avenue",
			"Sears",
			"T.J. Maxx",
			"Target",
			"Walmart",
			"Younkers"
		],
		"e-Gift Cards": [
			"1-800-Baskets.com",
			"1-800-Flowers.com",
			"Amazon.com",
			"Austad's Golf ",
			"Austad's Golf",
			"Barnes & Noble",
			"Beauty.com",
			"BedandBreakfast.com",
			"Cabela's",
			"Celebrity Cruises",
			"CharityChoice",
			"Cheryl & Co's Cookies",
			"Cooking.com",
			"Crutchfield",
			"DicksSportingGoods.com",
			"drugstore.com",
			"Fandango",
			"Fannie May Chocolates.com",
			"Fat Brain Toys",
			"FootLocker.com",
			"Harry London Chocolates",
			"L.L. Bean",
			"Lands' End",
			"Macy's",
			"NFLShop.com",
			"Nike",
			"Omaha Steaks",
			"Overstock.com",
			"Papa John's Pizza",
			"REI",
			"Sears",
			"Sephora",
			"Shutterfly.com",
			"Spa Week",
			"SpaFinder",
			"SportsAuthority.com",
			"The Popcorn Factory",
			"The Popcorn Factory.com",
			"TicketsNow.com",
			"TigerDirect.com",
			"Travelocity",
			"Travelocity Hotel Gift Cards.com",
			"Walmart",
			"WaySpa.com",
			"Zappos.com"
		],
		"Entertainment & Electronics": [
			"AMC Theatres",
			"Barnes & Noble",
			"Best Buy",
			"Cineplex Odeon",
			"Crutchfield",
			"F.Y.E.",
			"Fandango",
			"GameStop",
			"iTunes",
			"Loews Cineplex",
			"Regal Entertainment Group",
			"Staples",
			"Staples®",
			"Suncoast",
			"TicketsNow.com",
			"TigerDirect.com",
			"Wherehouse Music"
		],
		"Gift Card Accepted in Canada": [
			"aerie by American Eagle",
			"American Eagle Outfitters",
			"Applebee's",
			"Avis Car Rental",
			"babyGap",
			"Banana Republic",
			"Bass Pro Shops",
			"Bath & Body Works",
			"Bed, Bath & Beyond",
			"BedandBreakfast.com",
			"Best Western Travel Card",
			"Budget® Car Rental",
			"Carnival® Cruise Lines",
			"Celebrity Cruises",
			"Crewcuts by J.Crew",
			"Gap",
			"GapKids",
			"Golfsmith",
			"Hard Rock Cafe",
			"Hyatt Hotels and Resorts",
			"Hyatt House",
			"Hyatt Place",
			"J. Crew",
			"Lowe's",
			"Marriott Hotels & Resorts",
			"Marriott Vacation Club",
			"Old Navy",
			"Pier 1 Imports",
			"Rainforest Cafe",
			"Renaissance® Hotels & Resorts",
			"Saks Fifth Avenue",
			"Spa Week",
			"SpaFinder",
			"SpaWish.com",
			"Starbucks",
			"Subway",
			"Sunglass Hut",
			"Talbots",
			"The Home Depot",
			"The Ritz-Carlton®",
			"Travelocity",
			"WaySpa.com"
		],
		"Health & Beauty": [
			"Bath & Body Works",
			"Beauty.com",
			"Best Cuts",
			"BoRics",
			"Carlton Hair International",
			"CVS/pharmacy",
			"drugstore.com",
			"Famous Hair",
			"Fiesta Salons",
			"First Choice",
			"First Choice Haircutters",
			"GNC",
			"Hair by Stewarts",
			"Hair Excitement",
			"Hair Plus",
			"HairMasters",
			"HeadStart",
			"Holiday Hair",
			"Jean Louis David",
			"MasterCuts",
			"Mia & Maxx",
			"Mitchell's Hair Styling",
			"Nutrisystem",
			"Outlook for Hair",
			"Panopoulos Hair Salon",
			"Regis Salons",
			"Regis Signature Salon",
			"Regis Signature Salons",
			"Sally Beauty",
			"Sally Beauty Supply",
			"Saturday's",
			"Sephora",
			"SmartStyle",
			"Spa Week",
			"SpaFinder",
			"SpaWish.com",
			"Style America",
			"StyleAmerica",
			"TGF Hair Salons",
			"WaySpa.com"
		],
		"Merchant Ships to Canada": [
			"1-800-Flowers.com",
			"aerie by American Eagle",
			"Amazon.com",
			"American Eagle Outfitters",
			"Austad's Golf ",
			"babyGap",
			"Banana Republic",
			"Barnes & Noble",
			"Bass Pro Shops",
			"Bath & Body Works",
			"Bed, Bath & Beyond",
			"Cabela's",
			"Crewcuts by J.Crew",
			"Fat Brain Toys",
			"Gap",
			"GapKids",
			"Golfsmith",
			"J. Crew",
			"L.L. Bean",
			"Lands' End",
			"NFLShop.com",
			"NutriSystem",
			"Old Navy",
			"Omaha Steaks",
			"Pier 1 Imports",
			"REI",
			"Saks Fifth Avenue",
			"Shutterfly.com",
			"Sunglass Hut",
			"Talbots",
			"The Container Store",
			"The Home Depot",
			"The Limited",
			"The Popcorn Factory.com",
			"TicketsNow.com"
		],
		"Premium Merchants (additional fee may apply)": [
			"Amazon.com",
			"Bahama Breeze",
			"Best Buy",
			"Chevron",
			"GameStop",
			"iTunes",
			"Kohl's",
			"LongHorn Steakhouse",
			"Lowe's",
			"Olive Garden",
			"Red Lobster",
			"Shell",
			"Starbucks",
			"Subway",
			"Target",
			"The Home Depot",
			"Walmart"
		],
		"Restaurants": [
			"Applebee's",
			"Bahama Breeze",
			"Bertucci's",
			"Black Angus Steakhouse",
			"Bonefish Grill",
			"Boston Market",
			"Bubba Gump Shrimp Co.",
			"Buca di Beppo",
			"Buffalo Wild Wings",
			"Carrabba's",
			"Chart House",
			"Chili's Grill & Bar",
			"ChopHouse & Brewery",
			"Claim Jumper Restaurants",
			"Dave & Buster's",
			"Fleming's",
			"Hard Rock Cafe",
			"iHOP",
			"Landry's Restaurants, Inc.",
			"Landry's Seafood Restaurant",
			"LongHorn Steakhouse",
			"Maggiano's Little Italy",
			"McCormick & Schmick's",
			"Morton's Steakhouse",
			"Ninety Nine",
			"Ninety Nine Restaurant",
			"Oceanaire Restaurant",
			"O'Charley's",
			"Old Chicago",
			"Olive Garden",
			"On The Border",
			"On the Border Mexican Grill & Cantina",
			"Outback Steakhouse",
			"Panera Bread",
			"Panera Bread®",
			"Papa John's Pizza",
			"Rainforest Cafe",
			"Red Lobster",
			"Red Robin",
			"Red Robin Restaurant",
			"Rock Bottom Restaurant",
			"Romano's Macaroni Grill",
			"Roy's",
			"Ruby Tuesday",
			"Ruby Tuesday®",
			"Saltgrass Steakhouse",
			"Sing-Sing Restaurant",
			"SONIC",
			"SONIC®",
			"Starbucks",
			"Subway",
			"The Palm",
			"Tony Roma's",
			"Uno Chicago Grill",
			"Walnut Brewery"
		],
		"Specialty": [
			"1-800-Baskets.com",
			"1-800-Flowers.com",
			"CharityChoice",
			"Cheryl & Co's Cookies",
			"Cheryl & Co's Cookies.com",
			"Fannie May Chocolates.com",
			"Harry London Chocolates",
			"Harry London Chocolates.com",
			"Omaha Steaks",
			"PETCO",
			"Shutterfly.com",
			"The Popcorn Factory",
			"The Popcorn Factory.com"
		],
		"Sports & Leisure": [
			"Austad's Golf ",
			"Austad's Golf",
			"Bass Pro Shops",
			"Cabela's",
			"DicksSportingGoods.com",
			"Fanatics",
			"Golfsmith",
			"GolfThere",
			"NFLShop.com",
			"Nike",
			"REI",
			"SportsAuthority.com"
		],
		"Top Sellers": [
			"Ann Taylor",
			"Applebee's",
			"Banana Republic",
			"Barnes & Noble",
			"Crutchfield",
			"Gap",
			"Kmart",
			"Lands' End",
			"Macy's",
			"Old Navy",
			"Overstock.com",
			"Ruby Tuesday",
			"Ruby Tuesday®",
			"Sears",
			"SONIC",
			"SONIC®",
			"Staples",
			"Staples®",
			"T.J. Maxx",
			"WaySpa.com",
			"Zales",
			"Zappos.com"
		],
		"Travel": [
			"American Airlines",
			"Avis Car Rental",
			"BedandBreakfast.com",
			"Best Western Travel Card",
			"Budget Car Rental",
			"Budget® Car Rental",
			"Carnival Cruise Lines",
			"Carnival® Cruise Lines",
			"Celebrity Cruises",
			"Courtyard by Marriott",
			"Courtyard by Marriott Gift Cards",
			"Fairfield Inn by Marriott",
			"Global Hotel Card Powered by Orbitz",
			"Golden Nugget",
			"Golden Nugget Hotel",
			"Hyatt Hotels & Resorts",
			"Hyatt Hotels and Resorts",
			"Hyatt House",
			"Hyatt Place",
			"Marriott Hotels & Resorts",
			"Marriott Vacation Club",
			"Renaissance Hotels & Resorts",
			"Renaissance® Hotels & Resorts",
			"Residence Inn by Marriott",
			"Residence Inn® by Marriott",
			"Springhill Suites by Marriott",
			"SpringHill Suites® by Marriott",
			"The Ritz-Carlton",
			"The Ritz-Carlton®",
			"TownePlace Suites",
			"TownePlace Suites® by Marriott",
			"Travelocity",
			"Travelocity Hotel Gift Cards.com"
		]
	};

    var products = [
        {
            Name:"Digital e-SuperCertificate® REWARD (emailable)",
            StandardID:"SCD-GC1",
            PremiumID:"SCD-ES1",
            CanadianID:"CSCD-SC1",
            HolidayID:"#HOL#SCD-GC1",
            PremiumHolidayID:"#HOL#SCD-ES1",
            DisplayName: "Digital e-SuperCertificate®"
        },
        {
            Name:"Original SuperCertificate® REWARD",
            StandardID:"SCP-FD1",
            PremiumID:"SCP-PS1",
            CanadianID:"CSCP-SC1",
            HolidayID:"#HOL#SCP-FD1",
            PremiumHolidayID:"#HOL#SCP-PS1",
            DisplayName: "Original SuperCertificate®"
        },
        {
            Name:"Greeting Card SuperCertificate® REWARD",
            /*StandardID:"SCP-GC",*/
            StandardID:"SCP-GC2",
            PremiumID:"SCP-GCS",
            CanadianID:null,
            HolidayID:"#HOL#SCP-GC",
            PremiumHolidayID:"#HOL#SCP-GCS",
            DisplayName: "Greeting Card SuperCertificate®"
        },
        {
            Name:"Merchant Gift Cards",
            StandardID:"MerchantCards",
            PremiumID:"",
            CanadianID:"",
            HolidayID:"",
            DisplayName: "Merchant Gift Cards"
        }
    ];

    var digitalDesignPreview = {
        "Select a design" : "digitalplaceholder.png",
        "Basic Blue": "1006_BasicBlue_Preview.jpg",
        "Classical Leaves": "1101_eSC_ClassicLeaves_Preview.jpg",
        "Country Floral": "1006_eSC_CountryFloral_Preview.jpg",
        "Sparkling Blues": "1006_Design4Glitter_Preview.jpg",
        "Formal Midnight": "1101_eSC_MidnightDelight_Preview.jpg",
        "Fancy Frame": "1006_eSC_FancyFrame_Preview.jpg",
        "Celebrate Success": "1101_eSC_Celebrate_Preview.jpg",
        "Silver Lights" : "SilverLights_eSC2.gif",
        "Simply Chic" : "SimplyChic_eSC2.gif",
        "Standard": "1006_Standard_Preview.jpg",
        "Gift Wrap" : "GiftWrap_ESC.jpg",
        "White Bow" : "WhiteBow_ESC.jpg",
        "Basic Green Ribbon": "1006_BasicGreenRibbon_Preview.jpg"
    };

    var physicalDesignPreview = {
        "Select a design" : "physicallplaceholder.png",
        "Basic Blue": "BasicBlue.jpg",
        "Classical Leaves": "ClassicLeaves.jpg",
        "Sparkling Blues": "SparklingBlues.jpg",
        "Formal Midnight": "MidnightDelight.jpg",
        "Celebrate Success": "Celebrate.jpg",
        "Silver Lights" : "SilverLightsSC_Four51Preview.jpg",
        "Simply Chic" : "SimplyChicSC_Four51Preview.jpg",
        "Gift Wrap" : "GiftWrapSC_Four51Preview.jpg",
        "White Bow" : "WhiteBowSC_Four51Preview.jpg",
        "Basic Green Ribbon": "BasicGreenRibbon.jpg"
    };

    var giftcardDesignPreview = {
        "Select a design" : "giftcardplaceholder.png",
        "Basic Blue": "GC_BasicBlue_Preview.jpg",
        "Basic Green Ribbon": "GC_BasicGreenRibbon_Preview.jpg",
        "Candy Cane": "giftcardplaceholder.png",
        "Celebrate Success": "GC_Celebrate_Preview.jpg",
        "Classical Leaves": "GC_ClassicLeaves_Preview.jpg",
        "Country Snow": "giftcardplaceholder.png",
        "Formal Midnight": "GC_MidnightDelight_Preview.jpg",
        "Gift Wrap" : "giftcardplaceholder.png",
        "Holiday Wreath": "giftcardplaceholder.png",
        "Holiday Greetings": "giftcardplaceholder.png",
        "Outside Ornaments": "giftcardplaceholder.png",
        "Sparkling Blues": "GC_SparklingBlues_Preview.jpg",
        "Silver Lights" : "giftcardplaceholder.png",
        "White Bow" : "giftcardplaceholder.png",
        "Simply Chic" : "giftcardplaceholder.png",
        "Traditional Greetings": "h_TraditionalGreetings.jpg"
    };

    return {
        countries:  countries,
        states: states,
	    productCategories: productCategories,
        products: products,
        digitalOM: digitalOM,
        physicalOM: physicalOM,
        digitalDesignPreview: digitalDesignPreview,
        physicalDesignPreview: physicalDesignPreview,
        giftcardDesignPreview: giftcardDesignPreview
    };
});