# ezTimebox
Yet another jQuery Time Picker. I built this for a mobile first web-app after we couldn't find a solution that met our requirements.

## Features
Dialog or responsive modes
Change color styles in Javascript based on dynamic host colors
Scale can be adjusted to meet application needs. (15 min. 10min... etc)

## Vanilla Example
    $(".timebox").each(function(){
        var that = this;

        $(that).ezTimebox({
            "time_element" : that, //this is the element ID that is used to get/set time data
            "starting_time" : $.trim($(that).text()), //this provides the starting time in h:ma format (3:00pm)
            onSave : function(v){
            }
        });

        //show box on click
        $(that).off("click").on("click", function(){
            $(that).ezTimebox("show");
        });
    });

## Featured Example
    $(".timebox").each(function(){
        var that = this;

        $(that).ezTimebox({
            "time_element" : that, //this is the element ID that is used to get/set time data
            "starting_time" : $.trim($(that).attr("data-time")), //this provides the starting time in h:ma format (3:00pm)
            "responsive" : true,
            "scale" : 10,
            "primary_color_bg" : '#ffffffbf',
            "primary_color_fg" : '#ffffff',
            "secondary_color_bg" : '#009fff',
            "secondary_color_fg" : '#ffffff',
            "tertiary_color_bg" : '#76767694',
            "tertiary_color_fg" : '#ffffff',
            "save_color_bg" : '#0083ff',
            "save_color_fg" : '#ffffff',
            onSave : function(v){

                $(that).text("Time: " + v);
            }
    });

    //show box on click
    $(that).off("click").on("click", function(){
        $(that).ezTimebox("show");
    });

## License
Please use this free of charge or licensing restrictions. Hope it helps you.
