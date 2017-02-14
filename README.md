# ga-device-deep
More precise device detection for Google analytics.
Stendahls AB

----------------------------------------

### EXAMPLE:

Point a device at http://stendahls.github.io/ga-device-deep/ to see the script detect the device and report the dimensions it would could then be sent to Google analytics. For repeat viewings, add `?debug` to the URL, or the cookie will skip the detection.

### WHAT IT IS:
 
GA gives a semi-complete picture of the devices that visit your site. 

For instance, Your site could have a massively different experience if your users visit with a 2016 Samsung S7 Edge, or Trump's favorite, a Samsung S3 from 2012. But GA will only tell you they are Android phones with the exact same screen size (in CSS px). Some ISPs will give more hints to GA about the identity of the device, but some (especially in asia/africa) won't, and the individual GA product IDs don't help band together devices much either (is a Samsung GT-9500 high-end? A I9300/I9320 low? What about the I9305N variant?). 

iPads are similar, an iPad2 is a non-retina device with a bad processor and worse memory, but it will appear to GA to be the same as a desktop-class, wide-gamut-retina iPad Pro 9.7".
 
This script will give new custom GA dimensions to your analytics, so you can better determine the mix of new and old devices amongst your audience. It  sniffs out feature differences between devices and outputs them in a way that they can be integrated with your GA scripts.

This scripts differentiates:
- iPhones: 7+, 7, 6S+, 6S, 6+, 6, 5S/5, 4S/4, 3GS/3G/1
- iPads: iPad Pro 12.9", iPad Pro 9.7", retina iPads (Air2...iPad3, mini3/2), non-retina iPads (iPad1/2, mini1)
- Android Phones: Nexus 6P/6, 5X, 4, 2016/2014/2013/2011 type flagship phone (plus 4K screen)
- Windows 10 Hybrid touch/keyboard devices (Surface, Yoga, etc)

Check the script for the full list of supported tests - it's an easily readable config at the top of the file.

### WHAT IT IS NOT:

It's not npm-and-forget. For one, you'll need to set-up custom property dimensions in your GA property before you can start reporting them.

This does not give a full picture of all your device analytics. If you need to know what sizes of Android tablet visit, or what version of iOS is common on iPhones, that information is readily available using existing GA dimensions and metrics. It only tries to add new dimensions to help analysis.
 
Most importantly, this is a short term indicator. It has built-in obsolescence, as both the devices in the market and the features in browsers that help to identify them are constantly changing. And that's even on-top of the normal caveats of using a JS triggered analytics system like GA.

Devices this script does not differentiate:
- Android tablets
- Laptops & desktops
 
### BUILT-IN OBSOLESCENCE:
 
Don't be mistaken, this is not magical extra functionality for GA, this is a browser feature hack. 

Using browser features to determine a device type relies on the browsers never updating their features and no new devices coming out that mess with our assumptions. Androids from Samsung and LG are generally launched in Q2 at MWC, iPhones are launched in Q3 and Q4 is still the largest buying season for tech. Not to mention the browsers' evergreen update schedules. That's why this script only runs for a yearly quarter. Running any longer without adjustment would just mean the data becoming progressively more unreliable.

This particular script will stop collecting data after the end of the period at the top of the script (eg, 2017Q2 - the script will stop collecting after the end of 2017 quarter 2, ie June 30th). Set a recurring reminder in your  calendar and either delete or update this script on the run-up to that date.

We'll endeavour to keep the script up-to-date when we near the end of a quarter, allowing you to re-download or reinstall from npm (eventually).
 
### USAGE:

First, you'll need to understand a bit about GA custom dimensions/metrics:
https://developers.google.com/analytics/devguides/collection/analyticsjs/custom-dims-mets
...then you'll need to set up the custom property dimensions you want in your GA property admin. We'd recommend setting it up under the "session" scope.
 
Now we're ready, include the script anywhere before the normal GA script. Yes, I know that makes it a blocking script if you trigger GA in the HEAD - sorry about that, no way around it. Next, *inbetween* the `create` event and the page/event `send` event, add this code:
 
```
var gaCustomDims = gaDeviceDeep.find({'device':'dimension1'});
ga('set', gaCustomDims);
```
NB note that "dimension1" should be replaced by the id that the GA admin interface gives you when add a new custom dimension to your property. If you haven't added any other custom dimensions, it will probably be "dimension1" anyway.
 
...you can choose to add more custom dimensions that this script collects, eg, for the full set of possible dimensions, replace the code above with:
 
 ```
var gaCustomDims = gaDeviceDeep.find(
  {
    'device':'dimension1',
    'orientation':'dimension2',
    'dppx':'dimension3',
    'forceTouch':'dimension4',
    'wideGamut':'dimension5',
    'pointerEvents':'dimension6',
    'touchEvents':'dimension7'
  }
);
 ga('set', gaCustomDims);
```

NB The script runs once every session (session defined by a cookie session), then it drops a cookie to prevent the script running for repeat page views. In theory, it could keep posting dimensions, and GA's 'session' scope would deal with it, but as a piece of runtime code running on the main thread, it seems pointless to take up any more CPU time (or XHR calls) than is necessary.

### DEBUGGING:

There is a *debug* mode, just add `debug` to the url, eg `http://mydomain.com?debug` or `http://mydomain.com?id=1234567890&debug`. This will show up in the console and list:
- the period this script is valid for (ie, when it will become obsolete).
- the data collected from this client.
- the input map object of dimensions (as above).
- the output object of custom dimensions and their values.

Debug mode will also bypass the cookie that stops it running more than once a session, so it will run on every page refresh.

Debug mode will help diagnose most things, but possible reasons the script is not sending custom dimensions to GA are:
- The dimensions are not set up in the GA property admin
- The dimension names (as determined by the GA property) aren't mapped properly to the internal dimensions in the script initialisation.
- The script has already run once this session, dropped a cookie and is skipping further pageviews.
- The device you're using has no test against it (eg, most laptops, Android tablets, etc), so it's not passing any of the configured tests, and is returning no data.
- You're initialising the script either before the GA `create` line, or after the `send` line.
- Your client doesn't pass the basic "cut-the-mustard" test (basic test for media.matches compatibility).
- You're offline and the GA script can't be fetched from Google, so the core GA function is not initialised.

### READING THE RESULTS IN GA:

We're still investigating the most effective way of using these extra custom dimensions, but the first way is to use them as secondary dimensions in almost any GA report (eg, audience:mobile:overview, and add "device" as a secondary dimension).

### NOTES:
 
- We haven't bothered with Android tablets as of yet. It's not that we don't care, but the segment is currently so diverse (with no clear leaders), and most of the real dividing factors (screen size, OS version, browser version) are already collected by GA. This may change in the future.
- Windows 10 devices like the Surface or touch-and-mouse convertibles/laptops are a segment that are not understood enough in front-end.  Traditionally, touch devices are phones and tablets, mouse devices are  laptops and desktops, but these devices are both. That's why these devices  are included here, to give better visibility on the need for testing and  improving user interface techniques.
- Chromebooks (or Android hybrids) might be covered in the future for the same reasons as Windows 10 hybrids, but as off yet, most markets we see  have no call for this capability. Your audience may differ.
- Note that when you collect "orientation" (or any optional dimension, but particularly orientation), it's only recorded the first time per session, before the cookie is dropped, so it will only show users that navigated to your site in a particular orientation, not if they change orientation during their session on your site. That behavior was determined to be out of scope.
- Note also that orientation will be either 0, 90, 180 or -90, and that different devices have different concepts of what is 0˙. An iPad, small Android tablet or phone will consider portrait-up as 0˙, but large 16:9 Android tablets will consider landscape-up as 0˙.
- dppx is to one decimal point. eg a Nexus 5X has a dppx of 2.63, but it's shortened to 2.6, for simplicity.
- A note about performance. This script may have to be a "blocking" script depending on your GA set-up, but it is pretty performant. It carries out no forced layout calculations (screen width/height and orientation are not the same as viewport measurements), and in Chrome devtools, simulating a 5x slowdown CPU (low-end device) on a 2014 Macbook Pro, a measurement run takes 7ms to evaluate the JS, plus 13ms to process, and then 4ms on subsequent runs (Unthrottled, a measurement run takes 6ms to evaluate and process, 2ms on subsequent runs). With debug mode on, the console logging triples the script time (who knew console.log took so much time?). This is pretty easily within a single non-janky 16ms frame depending on the speed of your device.

### TO DO:
- test, test, test.
- get onto npm.