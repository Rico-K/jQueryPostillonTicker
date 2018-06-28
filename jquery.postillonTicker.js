/**
 * @author Rico-K
 *
 * <b>Settings:</b>
 * <ul>
 *   <li>autoStart - updating starts after initialization (default: true)
 *   <li>fadeInTime - durance of the fade in animation in milliseconds (default: 1000)
 *   <li>fadeOutTime - durance of the fade out animation in milliseconds (default: 1000)
 *   <li>format - format of the ticker that gets the text and the short name of the writer passed as
 *                parameters used as printf like string (%s) (default: "+++ %s +++ (%s)")
 *   <li>instantStart - loads ticker directly after start without waiting the first interval
 *                      (default: true)
 *   <li>interval - interval of updating in milliseconds (default: 15000)
 *   <li>showLinks - defines whether to show tickers with links as links or not (default: true)
 *   <li>tickerUrl - url of postillon ticker API
 * </ul>
 *
 * <b>Methods:</b>
 * <ul>
 *   <li>getCurrentTicker - returns the current ticker object
 *   <li>getSetting - returns the setting with the given name or null
 *   <li>getSettings - returns the settings of the plugin
 *   <li>isRunning - returns whether the ticket updater is running
 *   <li>mergeSettings - merges the given settings into the existing settings
 *   <li>pause - pauses the updater
 *   <li>resume - resumes the updater when previoulsy paused
 *   <li>restart - restarts the ticker updater
 *   <li>setSetting - sets the given setting (expects name and value of setting)
 *   <li>setSettings - sets the givven settings as object
 *   <li>start - starts the ticker updater
 *   <li>stop> - stops the ticker updater
 *   <li>update - updates the ticker container by showing a new ticker
 * </ul>
 *
 * <b>Events:</b>
 * <ul>
 *   <li>intervalChanged.postillonTicker - triggered when the interval has changed
 *   <li>paused.postillonTicker - triggered when the updater gets paused
 *   <li>resumed.postillonTicker - triggered when the updater gets resumed
 *   <li>settingsChanged.postillonTicker - triggered when settings have changed
 *   <li>started.postillonTicker - triggered after the updater has started
 *   <li>starting.postillonTicker - triggered when the updater is starting
 *   <li>stopped.postillonTicker - triggered after the updater has stopped
 *   <li>stopping.postillonTicker - triggered when the updater is stopping
 *   <li>updated.postillonTicker - triggered after the updater has updated
 *   <li>updating.postillonTicker - triggered when the updater is updating
 * </ul>
 */
(function ($, w) {
    "use strict";

    var NS = "postillonTicker";
    var methods = {
        /********************/
        /* public functions */
        /********************/

        /**
         * Returns the current ticker object.
         * @returns {Object}
         */
        getCurrentTicker: function () {
            var tickers     = methods.getSetting.call(this, "_tickers");
            var tickerIdx   = methods.getSetting.call(this, "_tickerIdx");

            return tickers[tickerIdx];
        },

        /**
         * Checks whether the updater is running.
         * @returns {bool}
         */
        isRunning: function() {
            var timer = methods._getTimer.call(this);
            return timer ? true : false;
        },

        /**
         * Pauses the updater.
         * @returns {jQuery}
         */
        pause: function() {
            var jObj = $(this);
            if (!methods.getSetting.call(this, "_paused"))
                jObj.trigger($.Event("paused." + NS, {}));

            methods.setSetting.call(this, "_paused", true);

            return this;
        },

        /**
         * Restarts the updater.
         * @returns {jQuery}
         */
        restart: function() {
            methods.stop.call(this);
            methods.start.call(this);
            return this;
        },

        /**
         * Resumes the updater if it has been paused previously.
         * @returns {jQuery}
         */
        resume: function () {
            var jObj = $(this);
            if (methods.getSetting.call(this, "_paused"))
                jObj.trigger($.Event("resumed." + NS, {}));

            methods.setSetting.call(this, "_paused", false);

            return this;
        },

        /**
         * Starts the updater.
         * @returns {jQuery}
         */
        start: function() {
            var timer = methods._getTimer.call(this);
            if (timer) return this;

            var jObj = $(this);

            jObj.trigger($.Event("starting." + NS, {}));

            if (methods.getSetting.call(this, "instantStart"))
                methods.update.call(this);

            methods._setTimer.call(this, w.setInterval(function() {
                if (methods.getSetting.call(jObj, "_paused")) return;
                methods.update.call(jObj);
            }, methods.getSetting.call(this, "interval")));

            jObj.trigger($.Event("started." + NS, {}));

            return this;
        },

        /**
         * Stops the updater.
         * @returns {jQuery}
         */
        stop: function() {
            var timer = methods._getTimer.call(this);
            if (!timer) return this;

            var jObj = $(this);

            jObj.trigger($.Event("stopping." + NS, {}));

            w.clearInterval(timer);

            methods._setTimer.call(this, null);

            jObj.trigger($.Event("stopped." + NS, {}));

            return this
        },

        /**
         * Loads the next ticker and updates the container.
         * @returns {jQuery}
         */
        update: function() {
            var jObj = $(this);
            jObj.trigger($.Event("updating." + NS, {}));

            var tickers     = methods.getSetting.call(this, "_tickers");
            var tickerIdx   = methods.getSetting.call(this, "_tickerIdx");
            var newIdx      = tickerIdx + 1;

            var update = function () {
                var ticker      = methods.getCurrentTicker.call(jObj);
                var fadeOutTime = methods.getSetting.call(jObj, "fadeOutTime") * 1;
                jObj.fadeOut(fadeOutTime, function() {
                    var format      = methods.getSetting.call(jObj, "format");
                    var text        = ticker.text;
                    var fadeInTime  = methods.getSetting.call(jObj, "fadeInTime") * 1;
                    if ("link" in ticker && methods.getSetting.call(jObj, "showLinks"))
                        text = "<a href=\"" + ticker.link + "\" target=\"_blank\">" + text + "</a>";

                    text = format.replace("%s", text);
                    text = text.replace("%s", ticker.short);

                    jObj.html(text);
                    jObj.fadeIn(fadeInTime, function() {
                        jObj.trigger($.Event("updated." + NS, {ticker: ticker}));
                    });
                });
            };

            if (newIdx < tickers.length) {
                methods.setSetting.call(jObj, "_tickerIdx", newIdx);
                update.call(this);
            }
            else {
                methods._loadTickers.call(this, update);
            }

            return this;
        },

        /*********************/
        /* setting functions */
        /*********************/

        /**
         * Returns the setting with the given name or null if it does not exist.
         * @param {string} name
         * @return {mixed}
         */
        getSetting: function (name) {
            var settings = methods.getSettings.call(this);
            return name in settings ? settings[name] : null;
        },

        /**
         * Returns the settings of the plugin.
         * @return Object
         */
        getSettings: function () {
            return this.data(NS + ".settings");
        },

        /**
         * Merges the given settings into the existing settings.
         * @param settings
         * @return jQuery
         */
        mergeSettings: function (settings) {
            var existing = methods.getSettings.call(this);
            methods.setSettings.call(this, $.extend(true, existing, settings));

            return this;
        },

        /**
         * Sets the given setting.
         * @param setting
         * @param value
         * @return jQuery
         */
        setSetting: function (setting, value) {
            var settings = $.extend({}, methods.getSettings.call(this));
            settings[setting] = value;
            methods.setSettings.call(this, settings);

            return this;
        },

        /**
         * Sets the settings for the plugin.
         * @param settings
         * @return jQuery
         */
        setSettings: function (settings) {
            var old = methods.getSettings.call(this);
            this.data(NS + ".settings", settings);
            this.trigger($.Event("settingsChanged." + NS, {old: old, "new": settings}));

            return this;
        },

        /*********************/
        /* private functions */
        /*********************/

        /**
         * Returns the timer.
         * @returns {number}
         * @private
         */
        _getTimer: function() {
            return methods.getSetting.call(this, "_timer");
        },

        /**
         * Initializes the postillonTicker.
         * @param options
         * @private
         */
        _init: function (options) {
            var defaults = $.fn.postillonTicker.defaults;

            return this.each(function () {
                var jObj = $(this);
                var settings = $.extend(true, {}, defaults, options);

                var set = jObj.data(NS + ".settings");
                if (set && set._initialized) {
                    return;
                }

                // save settings in data
                settings._initialized = true;
                jObj.data(NS + ".settings", settings);

                // register interval changed event
                jObj.on("settingsChanged." + NS, function(e) {
                    if (e.old.interval !== e.new.interval) {
                        $(this).trigger($.Event("intervalChanged." + NS, {old: e.old.interval, "new": e.new.interval}));
                    }
                });
                jObj.on("intervalChanged." + NS, function(e) {
                    $(this).postillonTicker("restart");
                });

                if (settings.autoStart) methods.start.call(jObj);
            });
        },

        /**
         * Loads a new set of tickers.
         * @param {callback} callback
         * @returns {jQuery}
         * @private
         */
        _loadTickers: function (callback) {
            var pt = this;
            $.get({
                data: {},
                dataType: "json",
                success: function (data, status, jqXHR) {
                    methods.setSetting.call(pt, "_tickers", data.tickers);
                    methods.setSetting.call(pt, "_tickerIdx", 0);
                    if ($.isFunction(callback))
                        callback.call(pt);
                },
                url: methods.getSetting.call(this, "tickerUrl"),
            });

            return this;
        },

        /**
         * Sets the timer.
         * @private
         */
        _setTimer: function(timer) {
            return methods.setSetting.call(this, "_timer", timer);
        },
    };

    /**
     * jQuery plugin constructor
     * @param method
     */
    $.fn.postillonTicker = function (method) {
        // constructor call with either no parameters or an object
        if (method instanceof Object || !method) {
            return methods._init.apply(this, arguments);
        }
        // public method call
        else if (method in methods && !String(method).match(/^_/) && $.isFunction(methods[method])) {
            var args = Array.prototype.slice.call(arguments, 1);
            var ret = [];
            this.each(function () {
                ret.push(methods[method].apply($(this), args));
            });
            return ret.length == 1 ? ret[0] : ret;
        }
        else {
            $.error("There is no such method \"" + method + "\" in " + NS);
        }
    };

    $.fn.postillonTicker.NS = NS;

    $.fn.postillonTicker.defaults = {
        autoStart: true,
        fadeInTime: 1000,
        fadeOutTime: 1000,
        format: "+++ %s +++ (%s)",
        instantStart: true,
        interval: 15000,
        showLinks: true,
        tickerUrl: "https://www.der-postillion.de/ticker/newsticker2.php",
        _paused: false,
        _tickerIdx: 0,
        _tickers: [],
        _timer: null,
    };
})(jQuery, window);