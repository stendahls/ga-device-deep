# ga-device-deep
More precise device detection for Google analytics.
2017Q2 (v0.5) CM - Stendahls AB
----------------------------------------
 
### WHAT IT IS:
 
GA gives a semi-complete picture of the devices that visit your site. 

For instance, Your site could have a massively different experience if your users visit with a 2016 Samsung S7 Edge, or Trump's favorite, a Samsung S3 from 2012. But GA will only tell you they are Android phones with the exact same viewport size. Some ISPs will give more hints to GA about the identity of the device, but some (especially in asia/africa) won't, and the individual GA product IDs don't help band together devices much either (is a Samsung GT-9500 high-end? A I9300/I9320 low? What about the I9305N variant?). 

iPads are similar, an iPad2 is a non-retina device with a bad processor and worse memory, but it will appear to GA to be the same as a desktop-class, wide-gamut-retina iPad Pro 9.7".
 
This script will give new custom GA dimensions to your analytics, so you can better determine the mix of new and old devices amongst your audience. It  sniffs out feature differences between devices and outputs them in a way that they can be integrated with your GA scripts.

### WHAT IT IS NOT:

It's not npm-and-forget. For one, you'll need to set-up custom property dimensions in your GA property before you can start reporting them.

This does not give a full picture of all your device analytics. If you need to know what sizes of Android tablet visit, or what version of iOS is common on iPhones, that information is readily available using existing GA dimensions and metrics. It only tries to add new dimensions to help analysis.
 
Most importantly, this is a short term indicator. It has built-in obsolescence, as both the devices in the market and the features in browsers that help to identify them are constantly changing. And that's even on-topof the normal caveats of using a JS triggered analytics system like GA.
 
### BUILT-IN OBSOLESCENCE:
 
Don't be mistaken, this is not magical extra functionality for GA, this is a hack. 

Using browser features to determine a device type relies on the browsers never updating their features and no new devices coming out that mess with our assumptions. That's why this script only runs for a yearly  quarter. 

Androids from Samsung and LG are generally launch in Q1 at MWC, iPhones are launched in Q3 and the Q4 is still the largest buying season for tech. Not to mention the browsers' evergreen update schedules. 

This particular script will stop collecting data after the end of the period at the top of this into (eg, 2017Q2 - the script will stop collecting after the end of 2017 quarter 2, ie June 30th). Set a recurring reminder in your  calendar and either delete or update this script on the run-up to that date.
 
### USAGE:

First, you'll need to understand a bit about GA custom dimensions/metrics:
https://developers.google.com/analytics/devguides/collection/analyticsjs/custom-dims-mets
...then you'll need to set up the custom property dimensions you want in your GA property admin. 
 
Now we're ready, include the script anywhere before the GA pageview (or event hit if you only want the dimension against events, not pageviews). Yes, I know that makes it a blocking script if you trigger a pageview in the HEAD - sorry about that, no way around it. Next, *inbetween* the 'create' event and the page/event 'send' event and add this code:
 
```
var gaCustomDims = gaDeviceDeep.find({'device':'dimension1'});
ga('set', gaCustomDims);
```
NB note that "dimension1" should be replaced by the id that the GA admin interface gives you when add a new custom dimension for your property. If you haven't added any other custom dimensions, it will probably be "dimension1"
 
...you can choose to add more custom dimensions that this script collects, eg, for the full set, replace the code above with:
 
 ```
var gaCustomDims = gaDeviceDeep.find({'device':'dimension1','orientation':'dimension2','dppx':'dimension3','forceTouch':'dimension4','wideGamut':'dimension5','pointerEvents':'dimension6','touchEvents':'dimension7'});
 ga('set', gaCustomDims);
```

### NOTES:
 
- We haven't bothered with Android tablets as of yet. It's not that we don't care, but the segment is currently so diverse (with no clear leaders), and most of the real dividing factors (screen size, OS version, browser version) are already collected by GA. This may change in the future.
- Windows 10 devices like the Surface or touch-and-mouse convertibles/laptops are a segment that are not understood enough in front-end.  Traditionally, touch devices are phones and tablets, mouse devices are  laptops and desktops, but these devices are both. That's why these devices  are included here, to give better visibility on the need for testing and  improving user interface techniques.
- Chromebooks (or Android hybrids) might be covered in the future for the same reasons as Windows 10 hybrids, but as off yet, most markets we see  have no call for this capability. Your audience may differ.
- Note that when you collect "orientation" (or any optional dimension, but particularly orientation), it's only recorded the first time per session, before the cookie is dropped, so it will only show users that navigated to your site in a particular orientation, not if they change orientation during their session on your site. That behaviour was detemined to be out of scope.
- Note also that orientation will be either 0, 90, 180 or -90, and that different devices have different concepts of what is 0˙. An iPad, small Android tablet or phone will consider portrait-up as 0˙, but large 16:9 Android tablets will consider landscape-up as 0˙.
- dppx is to one decimal point. eg a Nexus 5X has a dppx of 2.63, but it's shortened to 2.6, for simplicity.

### TO DO:
- test, test, test.
- get onto npm.