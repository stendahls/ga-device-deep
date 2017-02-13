/*
 * GOOGLE ANALYTICS DEVICE DEEP-DIVE
 * 2017Q2 (v0.5) Craig Morey - Stendahls AB
 * ----------------------------------------
 * More precise device detection for Google analytics.
 *
 * WHAT IT IS:
 *
 * GA gives a semi-complete picture of the devices that visit your site. 
 * 
 * For instance, Your site could have a massively different UX if your users 
 * visit with a 2016 Samsung S7 Edge, or Trump's favorite, a Samsung S3 from 
 * 2012. But GA will only tell you they are Android phones with the same exact 
 * same viewport size. Some ISPs will give more hints to GA about the identity 
 * of the device, but some (especially in asia/africa) won't, and the individual 
 * GA product IDs don't help band together devices much either (is a GT-9500 
 * high-end? A I9300/I9320 low? What about the I9305N variant?). 
 * 
 * iPads are similar, an iPad2 is a non-retina device with a bad processor and 
 * worse memory, but it will appear to GA to be the same as a desktop-class, 
 * wide-gamut-retina iPad Pro 9.7".
 *
 * This script will give new custom dimensions to your analytics, so you can 
 * better determine the mix of new and old devices amongst your audience.
 * 
 *
 * WHAT IT IS NOT:
 *
 * This does not give a full picture of all your device analytics. If you need 
 * to know what sizes of Android tablet visit, or what version of iOS is common 
 * on iPhones, that information is readily available using existing GA 
 * dimensions and metrics. It only tries to add new dimensions to help analysis.
 *
 * Most importantly, this is a short term indicator. It has built-in 
 * obsolescence, as both the devices in the market and the features in browsers 
 * that help to identify them are constantly changing. And that's even on-top
 * of the normal caveats of using a JS triggered analytics system like GA.
 *
 * BUILT-IN OBSOLESCENCE:
 *
 * Don't be mistaken, this is not magical extra functionality for GA, this is a 
 * hack. 
 * 
 * Using browser features to determine a device type relies on the 
 * browsers never updating their features and no new devices coming out that 
 * mess with our assumptions. That's why this script only runs for a yearly  
 * quarter. 
 * 
 * Androids from Samsung and LG are generally launch in Q1 at MWC, iPhones are 
 * launched in Q3 and the Q4 is still the largest buying season for tech. Not 
 * to mention the browsers' evergreen update schedules. 
 * 
 * This particular script will stop collecting data after the end of the period 
 * at the top of this into (eg, 2017Q2 - the script will stop collecting after 
 * the end of 2017 quarter 2, ie June 30th). Set a recurring reminder in your  
 * calendar and either delete or update this script on the run-up to that date.
 *
 * USAGE:
 * 
 * First, you'll need to understand a bit about GA custom dimensions/metrics:
 * https://developers.google.com/analytics/devguides/collection/analyticsjs/custom-dims-mets
 * ...then you'll need to set up the custom property dimensions you want in 
 * your GA property admin. 
 *
 * Now we're ready, include the script anywhere before the GA pageview (or 
 * event hit if you only want the dimension against events, not pageviews). 
 * Yes, I know that makes it a blocking script if you trigger a pageview in 
 * the HEAD - sorry about that, no way around it. Next, *inbetween* the 
 * 'create' event and the page/event 'send' event and add this code:
 
   var gaCustomDims = gaDeviceDeep.find({'device':'dimension1'});
   ga('set', gaCustomDims);
 
 * NB note that "dimension1" should be replaced by the id that the GA admin 
 * interface gives you when add a new custom dimension for your property. 
 * If you haven't added any other custom dimensions, it will probably be 
 * "dimension1"
 
 * ...you can choose to add more custom dimensions that this script collects, 
 * eg, for the full set, replace the code above with:
 
   var gaCustomDims = gaDeviceDeep.find({'device':'dimension1','orientation':'dimension2','dppx':'dimension3','forceTouch':'dimension4','wideGamut':'dimension5','pointerEvents':'dimension6','touchEvents':'dimension7'});
   ga('set', gaCustomDims);
 
 * 
 * NOTES:
 *
 * - We haven't bothered with Android tablets as of yet. It's not that we don't 
 *   care, but the segment is currently so diverse (with no clear leaders), and  
 *   most of the real dividing factors (screen size, OS version, browser  
 *   version) are already collected by GA. This may change in the future.
 * - Windows 10 devices like the Surface or touch-and-mouse convertibles/ 
 *   laptops are a segment that are not understood enough in front-end.  
 *   Traditionally, touch devices are phones and tablets, mouse devices are  
 *   laptops and desktops, but these devices are both. That's why these devices  
 *   are included here, to give better visibility on the need for testing and  
 *   improving user interface techniques.
 * - Chromebooks (or Android hybrids) might be covered in the future for the 
 *   same reasons as Windows 10 hybrids, but as off yet, most markets we see  
 *   have no call for this capability. Your audience may differ.
 * - Note that when you collect "orientation" (or any optional dimension, but 
 *   particularly orientation), it's only recorded the first time per session, 
 *   before the cookie is dropped, so it will only show users that navigated to 
 *   your site in a particular orientation, not if they change orientation 
 *   during their session on your site. That behaviour was detemined to be out 
 *   of scope.
 * - Note also that orientation will be either 0, 90, 180 or -90, and that 
 *   different devices have different concepts of what is 0˙. An iPad, small 
 *   Android tablet or phone will consider portrait-up as 0˙, but large 
 *   16:9 Android tablets will consider landscape-up as 0˙.
 * - dppx is to one decimal point. eg a Nexus 5X has a dppx of 2.63, but it's 
 *   shortened to 2.6, for simplicity.
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
  var outputDimsObj = {};         // object: THE OUTPUT. object with the custom dimensions that needs to be recorded alow with the pageview, eg, {'dimension1':iPhone7,'dimension2':'0'}
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
    switch(periodArray[1]) {
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
    if (cookie.indexOf(cookName + '=1')) {
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
    if ('touchstart' in document) {
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