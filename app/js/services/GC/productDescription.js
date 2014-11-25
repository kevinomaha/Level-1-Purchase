four51.app.factory('ProductDescription', function() {
    function _parse(product) {

        product.SpaDescription = {};

        var productDescription = $(product.Description);
        var serviceFees = "";
        var termsAndConditions = "";
        angular.forEach(productDescription[0].children, function(section) {
            if (section.attributes && section.attributes['id'] && section.attributes['id'].value == "serviceFees") {
                serviceFees += $(section).html();
            }
            if (section.attributes && section.attributes['id'] && section.attributes['id'].value == "termsAndConditions") {
                termsAndConditions += $(section).html();
            }
        });

        product.SpaDescription.ServiceFees = serviceFees;
        product.SpaDescription.TermsAndConditions = termsAndConditions;

            /*category.SpaDescription = {};

            category.Description = category.Description.replace(/<img/g,"<span"); //jQuery select will attempt to load image tags, resulting in 404
            var categoryDescription = $(category.Description);

            //Find image without jQuery select to avoid 404 images
            var img = "https://www.four51.com/Themes/Custom/" + category.Description.split('../../')[1].split('.jpg')[0] + ".jpg";

            var description = "";
            var textFound = false;
            $(categoryDescription).find('tbody tr > td').contents().each(function() {
                if (this.nodeName == '#text' && !textFound) {
                    textFound = true;
                    description += "<p>" + $(this).text() + "</p>";
                }
            });
            $(categoryDescription).find('p').each(function() {
                if ($(this).html().indexOf('handlingFee') == -1 && $(this).html().indexOf('infoDiv0') == -1
                    && $(this).html().indexOf('infoDiv1') == -1 && $(this).html().indexOf('infoDiv2') == -1
                    && $(this).parent('div').prop('class') != 'infoPanel') {
                    description += "<p>" + $(this).text() + "</p>";
                }
            });

            if (description == "") {
                if ($(categoryDescription).find('td:last').text()) {
                    description +=$(categoryDescription).find('td:last').text();
                }
            }

            *//*var infoTab = $(categoryDescription).find("#infoDiv0 p").text();*//*
            var infoTab = "";

            $(categoryDescription).find("#infoDiv0 p").each(function() {
                infoTab += $(this).html();
            });

            if ($(categoryDescription).find("#infoDiv1 div #handlingFee").length > 0) {
                $(categoryDescription).find("#infoDiv1 div #handlingFee").text("2.50 ");
            }
            else if ($(categoryDescription).find("#infoDiv1 div").length > 0) {
                $(categoryDescription).find("#infoDiv1 div").html($(categoryDescription).find("#infoDiv1 div").html().replace('$','$2.50'));
            }

            var handlingTab = $(categoryDescription).find("#infoDiv1 div").html();

            var canadianTab = $(categoryDescription).find("#infoDiv2 div").html();

            category.SpaDescription.image = img;
            category.SpaDescription.description = description;
            category.SpaDescription.infoTab = infoTab;
            category.SpaDescription.handlingTab = handlingTab;
            if (canadianTab) {
                category.SpaDescription.canadianTab = canadianTab;
            }*/
    }

    return {
        parse: _parse
    }
});