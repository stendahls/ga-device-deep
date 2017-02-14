/*
 * GOOGLE ANALYTICS DEVICE DEEP-DIVE
 * 2017Q2 (v0.9) Craig Morey - Stendahls AB
 * ----------------------------------------
 * More precise device detection for Google analytics.
 *
 * ABOUT/USAGE/EXAMPLES:
 * https://github.com/stendahls/ga-device-deep
 * IMPORTANT NOTE, THIS SCRIPT WILL STOP WORKING AFTER 2017Q2!
 * Read the github page to find out why.
 */

var gaDeviceDeep = function() {
  
  var debugMode = false;          // boolean
  var period = '2017Q2';          // string: after this period, this script will no longer collect data.
  var cookName = 'gadd' + period; // string: cookie name used to determine if this user has been recorded this session or not.
  var data = {};                  // object: object to hold all the data we'll collect on the current client
  // data.ua = '';                // string: the user agent - used to determine the basics of the device/OS/browser, but depending on telco (especially in asia), not always 100% reliable.
  // data.screenW = 0;            // integer: screen width in CSS px
  // data.screenH = 0;            // integer: screen height in CSS px
  // data.orientation = 0;        // integer: screen orientation (0,90,180,-90)
  // data.dppx = 0;               // float: the "retina" value of the screen, or the amount of "real" pixels to a CSS px. iPhone3G is 1.0, Samsung S2 is 1.5, iPhone4/SamsungS3 is 2.0, iPhone6+/SamsungS5 is 3.0, SamsungS6 is 4.0.
  // data.forceTouch = false;     // boolean: whether the device/browser supports force touch or not.
  // data.wideGamut = false;      // boolean: whether the device/browser supports widegamut colour or not.
  // data.pointerEvents = false;  // boolean: whether the device/browser supports pointer events or not.
  // data.touchEvents = false;    // boolean: whether the device/browser supports touch events or not.
  var inputDimsObj = {
    'device': 'dimension1'
  };                              // object: custom GA dimensions have ids like "dimension1", "dimension2", etc, so we need to map our internal dimension ids to the ones assigned by the proprty admin in GA. This object map is passed in at script initiation, and if it isn't, it defaults to the values you see here (which would be true if you haven't previously assigned any custom GA dimensions). If you want to collect more custom dimensions such as orientation, you can add that to the map object on initialisation. ie, if you wanted to assign all possible dimensions and map them to GA ids, you'd need to assign 7 custom dimensions in the GA property admin, then call gaDeviceDeep.find({'device':'dimension1','orientation':'dimension2','dppx':'dimension3','forceTouch':'dimension4','wideGamut':'dimension5','pointerEvents':'dimension6','touchEvents':'dimension7'});
  var outputDimsObj = false;         // object: THE OUTPUT. object with the custom dimensions that needs to be recorded alow with the pageview, eg, {'dimension1':iPhone7,'dimension2':'0'}
  var tests = [
    {
      'name' : 'iPhone',
      'tests' : [
        {
          'name': 'iPhone7+',
          'UA': 'iPhone',
          'screen': 414,
          'wideGamut': true
        },
        {
          'name': 'iPhone7',
          'UA': 'iPhone',
          'screen': 375,
          'wideGamut': true
        },
        {
          'name': 'iPhone6S+',
          'UA': 'iPhone',
          'screen': 414,
          'forceTouch': true
        },
        {
          'name': 'iPhone6S',
          'UA': 'iPhone',
          'screen': 375,
          'forceTouch': true
        },
        {
          'name': 'iPhone6+',
          'UA': 'iPhone',
          'screen': 414
        },
        {
          'name': 'iPhone6',
          'UA': 'iPhone',
          'screen': 375,
        },
        {
          'name': 'iPhone5/5S/SE',
          'UA': 'iPhone',
          'screen': 568,
        },
        {
          'name': 'iPhone4/4S',
          'UA': 'iPhone',
          'screen': 320,
          'dppx': 2
        },
        {
          'name': 'iPhone1/3G/3GS',
          'UA': 'iPhone',
          'screen': 320,
        }
      ]
    },
    {
      'name' : 'iPad',
      'tests': [
        {
          'name': 'iPad Pro 12.9"',
          'UA': 'iPad',
          'screen': 1366,
        },
        {
          'name': 'iPad Pro 9.7"',
          'UA': 'iPad',
          'screen': 768,
          'wideGamut': true
        },
        /* yeah, sorry, most retina iPads have no differentiation */
        {
          'name': 'iPad 3/4/Air/Air2/mini2/mini3',
          'UA': 'iPad',
          'screen': 768,
          'dppx': 2
        },
        /* non-retina */
        {
          'name': 'iPad 1/2/mini1',
          'UA': 'iPad',
          'screen': 768,
          'dppx': 1
        }
      ],
    },
    {
      'name' : 'Android Phone',
      'tests': [
        {
          'name': 'Nexus 6/6P',
          'UA': 'Android',
          'screen': 412,
          'dppx': 3.5
        },
        {
          'name': 'Nexus 5X',
          'UA': 'Android',
          'screen': 412,
          'dppx': 2.6
        },
        {
          'name': 'Nexus 4',
          'UA': 'Android',
          'screen': 384
        },
        /* 
         * ANDROID PHONE BAND NAMING:
         * 
         * note the naming of these broad Android categories - they seem 
         * arbitrary, but are so that they are future proofed in as reasonable a 
         * way as possible.
         *
         * The dates are not to be a means of saying when they were launched, but 
         * relate to the "common" flagship standard of that year. For example, 
         * The Samsung A5 was launched in Jan 2017 with Android 6.0.1, but due 
         * to price, it has a 1080P screen and processor that make it closer to 
         * a 2014 class flagship.
         */
        {
          'name': 'Android phone 4K', /* 2160P: **THIS IS A TEMPORARY CATEGORY AS ONLY ONE PHONE IS WIDELY AVAILABLE AT THIS RES** ex: Xperia Z5/Z7 prem */
          'UA': 'Android',
          'screen': 360,
          'dppx': 6
        },
        {
          'name': 'Android phone 2016', /* 1440P: ex: Samsung S6/S7, LG G4/5, Xperia Z5 prem*/
          'UA': 'Android',
          'screen': 360,
          'dppx': 4
        },
        {
          'name': 'Android phone 2014', /* 1080P: ex: Samsung S4/S5/A5, Xperia Z3/Z5, Oneplus3, Nexus5 (not 5X) */
          'UA': 'Android',
          'screen': 360,
          'dppx': 3
        },
        {
          'name': 'Android phone 2013', /* 720P/480P: ex: Samsung S3/J5/J7/A3 */
          'UA': 'Android',
          'screen': 360
        },
        {
          'name': 'Android phone 2011', /* ex: Samsung S2/Ace */
          'UA': 'Android',
          'screen': 320
        }
      ],
    },
    {
      'name' : 'Windows Hybrid',
      'tests': [
        /* 
         * This config tests for both pointer events API and touch events but 
         * returns a single use case, as Edge uses pointer, and Chrome offered 
         * only touch up to Chrome 54 (2016Q4). Sorry, we're ignoring Win8 and 
         * WinRT devices - they're just too few amongs our audience.
         */
        {
          'name': 'Windows 10 convertible',
          'UA': 'Windows NT 1',
          'pointerEvents': true
        },
        {
          'name': 'Windows 10 convertible',
          'UA': 'Windows NT 1',
          'touchEvents': true
        }
      ]
    }
  ];
  
  /*
   * check if we're running debug. Just add "?debug" to the url of the page to run the script every page view (skipping cookies), and reporting to console.
   * with no msg or type params, it'll just retrun true, false.
   */
   
  var inDebugMode = function (msg,type) {
    
    // check for debugmode and start it if ncessary
    if (!debugMode && location.search.indexOf('debug') > -1) {
      debugMode = true;
      if (typeof console !== 'undefined') {
        console.warn('GA device deep - start');
      }
    }
    // if we're printing a message to console
    if (debugMode && msg && typeof console !== 'undefined') {
      if (type === 'warn') {
        console.warn(msg);
      } else {
        console.log(msg);
      }
    }
    // return true/false
    if (debugMode) {
      return true;
    }
    return false;
   };
   
 /*
  * check if we're running debug. Just add "?debug" to the url of the page to run the script every page view (skipping cookies), and reporting to console
  */
  var inDebugMessage = function (msg,type) {
  };
    
  /*
   * run the whole kit and kaboodle.
   */
  var find = function(inputDimsObj) {
    if (cutTheMustard()) {
      return;
    }
    if (madeObsolete()) {
      inDebugMode('script has become obsolete - was configured until end of ' + period);
      return;
    }
    if (sessionMarked()) {
      if (inDebugMode()) {
        inDebugMode('session already marked with cookie (' + cookName + '), this script would normally be skipped, but you are in "?debug" mode.');
      } else {
        return;
      }
    }
    collectData();
    inDebugMode('** data:');
    inDebugMode(data);
    inDebugMode('** inputDimsObj:');
    inDebugMode(inputDimsObj);
    outputDimsObj = testAgainstConfig(inputDimsObj);
    outputDimsObj = additionalDims(outputDimsObj, inputDimsObj);
    markSession();
    inDebugMode('** outputDimsObj:');
    inDebugMode(outputDimsObj);
    inDebugMode('GA device deep - end','warn');
    return outputDimsObj;
  };
  
  /*
   * to run this script at all, we need a minimum level of JS compatibility
   */
  var cutTheMustard = function() {
    if (typeof window.matchMedia === 'undefined') {
      return true;
    }
    return;
  };
  
  /*
   * is this browser's clock telling us that this script has hit it's obsolescence date?
   */
  var madeObsolete = function() {
    var periodArray = period.split('Q');
    var periodYear = periodArray[0] + ''; // stringify
    var periodDate = periodYear + '-12-31';
    switch(parseInt(periodArray[1])) {
      case 1:
        periodDate = periodYear + '-03-31';
        break;
      case 2:
        periodDate = periodYear + '-06-30';
        break;
      case 3:
        periodDate = periodYear + '-09-30';
        break;
    }
    var periodEndDate = new Date(periodDate + 'T00:00:00');
    inDebugMode('** periodEndDate:');
    inDebugMode(periodDate + 'T00:00:00 - translated to date: ' + periodEndDate);
    var currentDate = new Date();
    if (currentDate > periodEndDate) {
      return true;
    }
    return;
  };
  
  /*
   * has this browser session already been marked as recorded?
   */
  var sessionMarked = function() {
    var cookie = document.cookie;
    if (cookie.indexOf(cookName + '=1') >= 0) {
      return true;
    }
    return;
  };
  
  /*
   * mark this browser session as recorded
   */
  var markSession = function() {
    document.cookie = cookName + '=1; path=/';
    return;
  };
  
  /*
   * collect all the data we need to test against the device list
   */
  var collectData = function() {
    
    // get the User agent
    data.ua = window.navigator.userAgent;
    
    // screen width and height
    data.screenW = Math.max(screen.width || 0);
    data.screenH = Math.max(screen.height || 0);
    
    // edge case for older Android Browsers that report screen width/height in actual pixels, not CSS px
    if (data.ua.indexOf('Android') > -1 && data.ua.indexOf('Chrome') === -1 && data.screenW >= 480 && data.screenH >= 480) {
      data.screenW = data.screenW/2;
      data.screenH = data.screenW/2;
    }
    
    // get window orientation
    if (typeof screen.orientation !== 'undefined') {
        data.orientation = screen.orientation.angle;
    } else if (typeof window.orientation !== 'undefined') {
        data.orientation = window.orientation;
    }
    
    // get the dppx of this device
    if (typeof window.devicePixelRatio !== 'undefined') {
      data.dppx = window.devicePixelRatio.toFixed(2);
    } else {
      for(var i=5; i>=1; i = (i-0.05).toFixed(2)) {
        if (window.matchMedia("(-webkit-min-device-pixel-ratio: " + i + ")").matches || window.matchMedia("(min-resolution: " + i + "dppx)").matches) {
          data.dppx = i;
          break;
        }
      }
    }
    
    // get the forcetouch capability of this device
    data.forceTouch = false;
    if ('webkitmouseforcedown' in document) {
      data.forceTouch = true;
    }
    
    // get the wide colour capability of this screen
    data.wideGamut = false;
    if (window.matchMedia("(color-gamut: p3)").matches) {
      data.wideGamut = true;
    }
    
    // get the pointerevents capability of this device
    data.pointerEvents = false;
    if ('pointerover' in document) {
      data.pointerEvents = true;
    }
    
    // get the touch events capability of this device
    data.touchEvents = false;
    if ('ontouchstart' in document || (navigator && navigator.maxTouchPoints)) {
      data.touchEvents = true;
    }
  };
  
  /*
   * run through the device list config and test against the data we've collected
   */
  var testAgainstConfig = function(inputDimsObj) {
    
    // loop test categories
    var i = 0;
    var k = 0;
    var deviceTest = {};
    
    for(i=0; i<tests.length; i++) {
      // loop device tests
      for(k=0; k<tests[i].tests.length; k++) {
        deviceTest = tests[i].tests[k];
        // UA
        if (deviceTest.UA && data.ua.indexOf(deviceTest.UA) === -1) {
          continue;
        }
        // screen W/H
        if (deviceTest.screen && !(parseInt(data.screenW) === parseInt(deviceTest.screen) || parseInt(data.screenH) === parseInt(deviceTest.screen))) {
          continue;
        }
        // screen dppx
        if (deviceTest.dppx && parseFloat(data.dppx).toFixed(1) !== parseFloat(deviceTest.dppx).toFixed(1)) {
          continue;
        }
        // forceTouch
        if (deviceTest.forceTouch && data.forceTouch !== deviceTest.forceTouch) {
          continue;
        }
        // wideGamut
        if (deviceTest.wideGamut && data.wideGamut !== deviceTest.wideGamut) {
          continue;
        }
        // wideGamut
        if (deviceTest.wideGamut && data.wideGamut !== deviceTest.wideGamut) {
          continue;
        }
        // pointer events
        if (deviceTest.pointerEvents && data.pointerEvents !== deviceTest.pointerEvents) {
          continue;
        }
        // touch events
        if (deviceTest.touchEvents && data.touchEvents !== deviceTest.touchEvents) {
          continue;
        }
        // GOTCHA!!
        var output = {};
        output[inputDimsObj.device] =  deviceTest.name;
        return output;
      }
    }
    
  };
  
  /*
   * pull in any additional measurements
   */
  var additionalDims = function(outputDimsObj, inputDimsObj) {
    if (outputDimsObj && inputDimsObj && Object.keys(inputDimsObj).length > 1) {
      var key = '';
      var dimRequested = '';
      for(key in inputDimsObj) {
        if (key === 'device') { // skip the device map, we've already done that.
          continue;
        }
        dimRequested = inputDimsObj[key];
        if (data[dimRequested] !== false) {
          outputDimsObj[inputDimsObj[key]] = data[key];
        }
      }
    }
    return outputDimsObj;
  };
  
  return {
    find: find
  };
  
}();