jQueryPostillonTicker
=====================

Table of contents
-----------------

1. [About](#about)
2. [Requirements](#requirements)
3. [Usage](#usage)
4. [Settings](#settings)
    1. [Set on initialization](#set-on-initialization)
    2. [Set after initialization](#set-after-initialization)
        1. [Set single setting](#set-single-setting)
        2. [Set multiple settings](#set-multiple-settings)
        3. [Set all settings](#set-all-settings)
    3. [Change defaults](#change-defaults)
5. [Functions](#functions)
    1. [Calling](#calling)
6. [Events](#events)
7. [Examples](#examples)
    1. [Simple ticker](#simple-ticker)
    2. [Pause on mouse over](#pause-on-mouse-over)
    3. [Updating manually](#updating-manually)
    4. [No fade](#no-fade)

About
-----

This is a little jQuery plugin that loads the postillon news tickers and displays them in a HTML
container of your choice updating it automatically.

Check out some of the world's most relevant news on
<a href="https://www.der-postillon.com/" target="_blank">Postillon</a>

Requirements
------------

* jQuery
* sense of humor

Usage
-----

    <html>
        <head>
            <script type="text/javascript" src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
            <script type="text/javascript" src="jquery.postillonTicker.js"></script>
            <script type="text/javascript">
            //<!--
                $(function() {
                    $("#ticker").postillonTicker({
                        autoStart: true,
                        format: "+++ %s +++",
                        instantStart: true,
                        interval: 10000,
                        showLinks: true,
                    });                    
                });
            //-->
            </script>
        </head>
        <body>
	        <div id="ticker"></div>
	    </body>
    </html>

Settings
--------

* **autoStart** (*boolean*) - starts automatic ticker updating after initializing the plugin
(default: `true`)
* **fadeInTime** (*integer*) - durance of the fade in animation in milliseconds (default: 1000)
* **fadeOutTime** (*integer*) - durance of the fade out animation in milliseconds (default: 1000)
* **format** (*string*) - format of the shown ticker text that may contain printf-like string
placeholders (`%s`) where the first placeholder is replaced with the ticker text and the second one
with the short name of the ticker's writer (default: `+++ %s +++ (%s)`)
* **instantStart** (*boolean*) - instantly starts the ticker updater after initialization without
waiting one interval (default: `true`)
* **interval** (*integer*) - updating interval in milliseconds (default: `15000`)
* **showLinks** (*boolean*) - shows the text as link to the ticker's article if it has one (default:
`true`)
* **tickerUrl** (*string*) - URL of the postillon ticker API (default:
`https://www.der-postillion.de/ticker/newsticker2.php`)

### Set on initialization

The easiest way to set settings for one ticker is by passing an Object to the plugin's constructor:

    $("#ticker").postillonTicker({
        format: "+++ %s +++",
        interval: 10000,
        showLinks: false,
    });

### Set after initialization

You can also set settings after the plugin has be initialized in three different ways:

#### Set single setting

    $("#ticker").postillonTicker("setSetting", "interval", "5000");
    
#### Set multiple settings:

    $("#ticker").postillonTicker("mergeSettings", {
        format: "+++ %s +++",
        interval: 5000,
    });

#### Set all settings:

You will almost never need this function except maybe for something like restoring previously saved
settings or something like this since this function will wipe out all settings not explicitly set.

**Beware:** Using this function may also cause unexpected behavior since you may delete some
"private" settings like the fetched tickers, the current ticker index or the interval index.

    $("#ticker").postillonTicker("setSettings", {
        autoStart: true,
        fadeInTime: 1000,
        fadeOutTime: 1000,
        format: "+++ %s +++ (%s)",
        instantStart: true,
        interval: 10000,
        showLinks: true,
        tickerUrl: "https://www.der-postillion.de/ticker/newsticker2.php",
        _paused: false,
        _tickerIdx: 0,
        _tickers: [],
        _timer: null,
    });
    
You'd rather use this function in that kind of way:

    var settings = $("#ticker").postillonTicker("getSettings");
    
    settings.interval = 5000;
    
    $("#ticker").postillonTicker("setSettings", settings);
    
This is also the way the `setSetting` and `mergeSettings` functions work internally. However, you
should prefer `setSetting` or `mergeSettings` instead of `setSettings`.

### Change defaults

Beside changing the settings on or after initialization you can also change the default settings of
the plugin which will effect all future plugin constructor calls:

Check this out:

    $("#ticker1").postillonTicker(); // has default interval of 15 seconds
    $("#ticker1").postillonTicker("setSetting", "interval", 10000); // has now 10 seconds interval
    $("#ticker2").postillonTicker(); // ticker nr. 2 has also default of 15 seconds

Changing defaults:

    // all new tickers will have an interval of 5 seconds instead of 15 seconds
    $.fn.postillonTicker.defaults.interval = 5000;
    
    $("#ticker1").postillonTicker(); // 5 seconds interval
    $("#ticker2").postillonTicker(); // also 5 seconds interval

Functions
---------

* **getCurrentTicker()** - returns the current ticker object returned by the ticker API
* **getSetting(name)** - returns the value of the setting with the given name
* **getSettings()** - returns an Object containing all settings
* **isRunning()** - returns whether the updater is running
* **mergeSettings(settings)** - merges the given settings into the existing settings
* **pause()** pauses the updater
* **restart()** - restarts the updater calling stop and start
* **resume()** - resumes the updater when it previously has been paused
* **setSetting(name, value)** - sets the setting with the given name to the given value
* **setSettings(settings)** - sets the whole settings object
* **start()** - starts the updater
* **stop()** - stops the updater
* **update([callback])** - updates the ticker container loading a new ticker text

### Calling

The functions have to be called in the following way:

    $("#ticker").postillonTicker("methodName", argument1, argument2);
    
Example:

    // sets the updating interval to 20 seconds
    $("#ticker").postillonTicker("setSetting", "interval", 20000);

Events
------

* **intervalChanged.postillonTicker** - triggered when the interval has been changed (**note**:
this is an internal event listener on the *settingsChanged.postillonTicker* event, so calling
something like `$("#ticker").off("settingsChanged.postillonTicker")`) will prevent the
*intervalChanged.postillonTicker* event from being triggered)
* **paused.postillonTicker** - triggered when the updater has been paused
* **resumed.postillonTicker** - triggered when the updater has been resumed
* **settingsChanged.postillonTicker** - triggered when settings have changed
* **started.postillonTicker** - triggered when the updater has been started
* **starting.postillonTicker** - triggered when the updater is starting
* **stopped.postillonTicker** - triggered when the updater has been stopped
* **stopping.postillonTicker** - triggered when the updater is stopping
* **updated.postillonTicker** - triggered when the updater finished updating
* **updating.postillonTicker** - triggered when the updater is updating

Examples
--------

You can see some live examples in the examples folder. Here are the short versions of those examples
reduced to the JavaScript part:

### Simple ticker

    $("#ticker").postillonTicker({
        autoStart: true,
        format: "+++ %s +++",
        instantStart: true,
        interval: 10000,
        showLinks: true,
    });

### Pause on mouse over

    $("#ticker").postillonTicker({
        format: "+++ %s +++",
        interval: 3000,
    });
    $("#ticker").on("mouseenter", function() {
        $("#ticker").postillonTicker("pause");
    });
    $("#ticker").on("mouseleave", function() {
        $("#ticker").postillonTicker("resume");
    });
    
### Updating manually

    $("#ticker").postillonTicker({
        autoStart: false,
        format: "+++ %s +++",
    });
    $("#update_button").on("click", function () {
        $("#ticker").postillonTicker("update");
    });

### No fade

    $("#ticker").postillonTicker({
        autoStart: true,
        fadeInTime: 0,
        fadeOutTime: 0,
        format: "+++ %s +++",
        interval: 5000,
    });
