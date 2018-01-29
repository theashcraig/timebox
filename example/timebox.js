/*
ezTimebox 1.0 by Ash Craig
www.ashcraig.com

Please use this as you wish. Hope it helps you.

****REQUIRES JQUERY*****

options:
    time_element  (required)
    starting_time (required)
    responsive (optional - false = dialog style / true = responsive style)
    scale (optional 15 minutes is default but any integer less than 60 will work)

    styling:
    this allows you to programmably color elements based on host application
        primary_color_bg (optional - window color)
        secondary_color_bg (optional - active button elements backcolor)
        secondary_color_fg (optional - active button elements forecolor)
        tertiary_color_bg (optional - button elements backcolor)
        tertiary_color_fg (optional - button elements forecolor)
        save_color_bg (optional -save button backcolor)
        save_color_fg (optional - save button forecolor)

onSave() provides notification when the time has changed.

USAGE:

    vanilla example:

    $(".timebox-time").each(function(){
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


    ##########################


    //example with all options

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

*/
;(function($) {

    var pluginName = 'ezTimebox';

    function Plugin(element, options) {
        var $bk;
        var el = element;
        var $el = $(element);
        var _self = this;
        var $time_pane;
        var _settings;
        var this_hours = [];
        var this_mins = [];
        var this_ampm = [];
        var $time_element;

        options = $.extend({}, $.fn[pluginName].defaults, options);

        function addStyleString(str){

            var node = document.createElement('style');
            node.innerHTML = str;
            document.body.appendChild(node);
        }

        function init() {

            if ( options["time_element"] == undefined) {
                throw Error(pluginName + " requires 'time_element' option to be set.");
            }

            try {
                $time_element = $(options["time_element"]);
            } catch (e) {
                $time_element = $("#" + options["time_element"]);
            }

            //try to parse the start time
            if ( options["starting_time"] == undefined) {
                options["starting_time"] = "12:00am";
                throw Error(pluginName + " requires 'starting_time' option to be set.");
            }

            createTimebox(function(){

                $("body").append($time_pane);
                $("body").append($bk);

                $time_pane.hide();
                $bk.hide();
            });

            hook('onInit', '');
        }

        function createTimebox(cb) {

            $bk = $('<div></div>')
                .addClass("timebox-time-box-bk")
                .on("click", function(){
                    hide();
                })

            var main_class = 'timebox-time-box-hour';
            var isResponseiveClass = '';

            if ( options["responsive"] == true) {
                main_class = 'timebox-time-box-hour timebox-time-box-responsive'
            }

            var $hours = $('<div></div>').addClass(main_class);

            for (var i = 1; i < 13; i++) {

                $hours.append(

                    this_hours[i] = $('<div></div>')
                        .attr("id", i)
                        .addClass("timebox-time-box-hour-item")
                        .addClass("timebox-time-box-item")
                        .data("val", i)
                        .text(i)
                        .on("click", function(){
                            var that = this;

                            if ( $(that).hasClass("item-active") == true ) {
                                //cannot toggle off the hour
                            } else {
                                //user is clicking hour for first time
                                options["hour"] = $(that).data("val");
                                options["hour"] = $(that).data("val");

                                //remove the active status
                                $(".timebox-time-box-hour-item").removeClass("item-active");

                                $(that).addClass("item-active");
                            }
                            onTimeChange();
                        })
                );
            }

            main_class = 'timebox-time-box-min';

            if ( options["responsive"] == true) {
                main_class = 'timebox-time-box-min timebox-time-box-responsive'
            }

            var $mins = $('<div></div>').addClass(main_class);

            var minute;

            //default scale is 15 minutes
            var scale = 15;
            var multiplier = 4;

            console.log(options["scale"]);

            //manage user defined scale
            if ( isNumeric( options["scale"] ) ) {

                if (options["scale"] > 60 && options["scale"] < 1) {
                } else {
                    scale = options["scale"];
                    multiplier = 60 / scale;
                }
            }

            for (var i = 0; i < multiplier; i++) {

                minute = i * scale;

                if (minute < 10) {
                    minute = "0" + minute;
                }

                $mins.append(

                    this_mins[minute] = $('<div></div>')
                        .attr("id", minute)
                        .addClass("timebox-time-box-min-item")
                        .addClass("timebox-time-box-item")
                        .data("val", minute)
                        .text(minute)
                        .on("click", function(){

                            var that = this;

                            if ( $(that).hasClass("item-active") == true ) {
                                //no toggle off min
                            } else {
                                //user is clicking hour for first time
                                options["min"] = $(that).data("val");
                                options["min"] = $(that).data("val");

                                //remove the active status
                                $(".timebox-time-box-min-item").removeClass("item-active");

                                $(that).addClass("item-active");
                            }
                            onTimeChange();
                        })
                    );
            }

            main_class = 'timebox-time-box-ampm';

            if ( options["responsive"] == true) {
                main_class = 'timebox-time-box-ampm timebox-time-box-responsive'
            }

            var $ampm = $('<div></div>').addClass(main_class);

                $ampm.append(

                    this_ampm["am"] = $('<div></div>')
                        .attr("id", "am")
                        .addClass("timebox-time-box-ampm-item")
                        .addClass("timebox-time-box-item")
                        .data("val", "am")
                        .text("AM")
                        .on("click", function(){

                            var that = this;

                            if ( $(that).hasClass("item-active") == true ) {
                                //no toggle off
                            } else {
                                //user is clicking hour for first time
                                options["ampm"] = $(that).data("val");

                                //remove the active status
                                $(".timebox-time-box-ampm-item").removeClass("item-active");

                                $(that).addClass("item-active");
                            }
                            onTimeChange();
                        })
                )
                .append(

                    this_ampm["pm"] = $('<div></div>')
                        .attr("id", "pm")
                        .addClass("timebox-time-box-ampm-item")
                        .addClass("timebox-time-box-item")
                        .data("val", "pm")
                        .text("PM")
                        .on("click", function(){

                            var that = this;

                            if ( $(that).hasClass("item-active") == true ) {
                                //no toggle off
                            } else {
                                //user is clicking hour for first time
                                options["ampm"] = $(that).data("val");
                                options["ampm"] = $(that).data("val");

                                //remove the active status
                                $(".timebox-time-box-ampm-item").removeClass("item-active");

                                $(that).addClass("item-active");
                            }
                            onTimeChange();
                        })
                );

            main_class = 'timebox-time-box';

            if ( options["responsive"] == true) {
                main_class = 'timebox-time-box timebox-time-box-responsive'
                isResponseiveClass = 'timebox-time-box-responsive'
            }

            $time_pane = $('<div></div>')
                .addClass(main_class)
                .append(
                    //hours container
                    $('<div></div>')
                        .addClass("timebox-time-box-hour-container")
                        .append(
                            //hours header
                            $('<div></div>')
                                .addClass("timebox-time-box-header")
                                .text("Hours")
                                .append($hours))
                )
                .append(
                    //mins container
                    $('<div></div>')
                        .addClass("timebox-time-box-min-container")
                        .append(
                            //hours header
                            $('<div></div>')
                                .addClass("timebox-time-box-header")
                                .text("Minutes")
                                .append($mins))
                )
                .append(
                    //ampm container
                    $('<div></div>')
                        .addClass("timebox-time-box-ampm-container")
                        .append(
                            //ampm header
                            $('<div></div>')
                                .addClass("timebox-time-box-header")
                                .text("")
                                .append($ampm))

                )
                .prepend(
                    $('<div></div>')
                        .addClass("timebox-time-box-save")
                        .text("Close")
                        .on("click", function(){
                            hide();
                        })
                )
                .append(
                    $('<div></div>')
                        .addClass("timebox-clear")
                )
                .append(
                    $('<div></div>')
                        .addClass("timebox-time-box-save " + isResponseiveClass)
                        .text("Close")
                        .on("click", function(){
                            hide();
                        })
                )

                if ( options["primary_color_bg"] != undefined || $.trim(options["primary_color_bg"]) != '') {
                    var primary_color_bg = options["primary_color_bg"];

                    addStyleString('.timebox-time-box { background-color: ' + primary_color_bg + ' }');
                    addStyleString('.timebox-time-box.timebox-time-box-responsive { background-color: ' + primary_color_bg + ' }');
                }

                if ( options["secondary_color_bg"] != undefined || $.trim(options["secondary_color_bg"]) != '') {
                    var secondary_color_bg = options["secondary_color_bg"];

                    addStyleString('.timebox-time-box-item.item-active { background-color: ' + secondary_color_bg + ' }');
                }

                if ( options["secondary_color_fg"] != undefined || $.trim(options["secondary_color_fg"]) != '') {
                    var secondary_color_fg = options["secondary_color_fg"];

                    addStyleString('.timebox-time-box-item.item-active { color: ' + secondary_color_fg + ' }');
                }

                if ( options["tertiary_color_bg"] != undefined || $.trim(options["tertiary_color_bg"]) != '') {
                    var tertiary_color_bg = options["tertiary_color_bg"];

                    addStyleString('.timebox-time-box-item { background-color: ' + tertiary_color_bg + ' }');
                    addStyleString('.timebox-time-box-header { color: ' + tertiary_color_bg + ' }');
                }

                if ( options["tertiary_color_fg"] != undefined || $.trim(options["tertiary_color_fg"]) != '') {
                    var tertiary_color_fg = options["tertiary_color_fg"];

                    addStyleString('.timebox-time-box-item { color: ' + tertiary_color_fg + ' }');
                }

                if ( options["save_color_bg"] != undefined || $.trim(options["save_color_bg"]) != '') {
                    var save_color_bg = options["save_color_bg"];

                    addStyleString('.timebox-time-box-save { background-color: ' + save_color_bg + ' }');
                }

                if ( options["save_color_fg"] != undefined || $.trim(options["save_color_fg"]) != '') {
                    var save_color_fg = options["save_color_fg"];

                    addStyleString('.timebox-time-box-save { color: ' + save_color_fg + ' }');
                }

            cb();
        }

        function onTimeChange(){

            if ( options["hour"] == undefined) {
                options["hour"] = "1";
            }

            if ( options["min"] == undefined) {
                options["min"] = "00";
            }

            if ( options["ampm"] == undefined) {
                options["ampm"] = "am";
            }

            options["time"] = options["hour"] + ":" + options["min"] + "" + options["ampm"];

            options["change_flag"] = true;

            hook('onTimeChange', options["time"]);
        }

        function option (key, val) {
            if (val) {
                options[key] = val;
            } else {
                return options[key];
            }
        }

        function destroy() {
            // Iterate over each matching element.
            $el.each(function() {
                var el = this;
                var $el = $(this);

                $time_pane.remove();
                $bk.remove();

                hook('onDestroy', '');
                $el.removeData('plugin_' + pluginName);
            });
        }

        function hide(){

            $time_pane.hide();
            $bk.hide();

            if (options["change_flag"] == true) {

                options["starting_time"] = options["time"];
                options["time"] = options["hour"] + ":" + options["min"] + "" + options["ampm"];

                //update the time element
                $time_element
                    .data("h", options["hour"])
        			.data("m", options["min"])
        			.data("a", options["ampm"])
                    .attr("data-time", options["time"]);

                hook('onSave', options["time"]);
            }

        }

        function show(){

            options = $.extend({}, $.fn[pluginName].defaults, options);
            options["change_flag"] = false;

            $(".timebox-time-box").hide();
            $(".timebox-time-box-bk").hide();

            $time_pane.find(".timebox-time-box-item").removeClass("item-active");

            try {

                //12:00pm
                var a = options["starting_time"];

                a = a.toLowerCase();

                //get rid of spaces on time
                a = a.split(" ").join("");
                //12 00pm
                a = a.split(":").join(" ");
                //12 00 am
                a = a.split("pm").join(" pm");
                //12 00 am
                a = a.split("am").join(" am");
                //split on space
                a = a.split(" ");

                if (a.length == 3) {

                    if (isNumeric(a[0])) {
                        options["hour"] = a[0];
                    }
                    if (isNumeric(a[1])) {
                        options["min"] = a[1];
                    }

                    if (a[2] == "am" || a[2] == "pm") {
                        options["ampm"] = a[2];
                    }

                    //light up the default buttons
                    $(this_hours[options["hour"]]).addClass("item-active");
                    $(this_mins[options["min"]]).addClass("item-active");
                    $(this_ampm[options["ampm"]]).addClass("item-active");
                }

            } catch (e) {}

            if ( options["responsive"] != true) {

                var position = $el.offset();

                position.top = position.top;

                $time_pane
                    .css(position)
                    .show();

                $bk.show();

            }else{

                $bk.show();
                $time_pane.show();
            }
        }

        function hook(hookName, e) {
            if (options[hookName] !== undefined) {
                options[hookName].call(el, e);
            }
        }

        function isNumeric( n ) {
        	return !isNaN(parseFloat(n)) && isFinite(n);
        };

        init();

        return {
            option: option,
            hide: hide,
            show: show,
            destroy: destroy
        };
    }

    $.fn[pluginName] = function(options) {
        if (typeof arguments[0] === 'string') {
            var methodName = arguments[0];
            var args = Array.prototype.slice.call(arguments, 1);
            var returnVal;
            this.each(function() {
                if ($.data(this, 'plugin_' + pluginName) && typeof $.data(this, 'plugin_' + pluginName)[methodName] === 'function') {
                    returnVal = $.data(this, 'plugin_' + pluginName)[methodName].apply(this, args);
                } else {
                    throw new Error('Method ' +  methodName + ' does not exist on jQuery.' + pluginName);
                }
            });
            if (returnVal !== undefined){
                return returnVal;
            } else {
                return this;
            }
        } else if (typeof options === "object" || !options) {
            return this.each(function() {
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
                }
            });
        }
    };

    $.fn[pluginName].defaults = {
        onInit: function() {},
        onDestroy: function() {}
    };

})(jQuery);
