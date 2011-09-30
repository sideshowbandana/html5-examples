**Example HTML5 apps for the Boxee Box browser**

Use these examples to jump-start your leanback app!

Dive into the individual app directories to learn more about each approach.


Benefits of HTML5 Approach
----
  * You don't need write a different app for each platform, as long as they have HTML5 compliant browsers (Boxee Box, GoogleTV, etc)
  * Designing interaction based around the d-pad maximizes compatibility across various browsers that run on TVs


Do's and Don'ts for leanback apps
---

  * Use bold colors and large text.  Don't be subtle.  A user sitting 10 feet away will not notice a 1 pixel border.
  * Make sure the app can be controlled **completely** using just the d-pad. 
      * That's **UP**, **DOWN**, **LEFT**, **RIGHT**, and **ENTER**.
      * Make the user type **sparringly**.  Some remotes will not have a keyboard, and typing via a d-pad is *painful*
      * Many TV-based browser users will not have a mouse!  Test your app.  If you *need* to click, it won't work.
  * The back button should make it easy for the user to get out of your app quickly.  It you need to click back more than a few times to get to the page that referred you there, something is wrong.  Try to keep the user on one page and don't add things to the browser's history unless absolutely necessary.
  * Design for 720p or 1080p and use the whole screen.  Don't put anything "below the fold".
  * Use css `zoom` on the `html` tag to scale content designed for one resolution to the resolution of the user's browser.

rss-app
===

A leanback video rss feed viewer.

A simple node.js backend turns rss feeds into json.  The client javascript uses jQuery, Underscore, and the Boxee html5-fullscreen-player to display a simple menu navigable using the d-pad, which shows fullscreen video once a video is selected.


sproutcore-app
===

Similar to the rss-app, using the same node.js backend, but the client uses the SproutCore 2.0 javascript framework, which results in a different approach to handling keyboard input and managing application state.  SproutCore has a bit of a learning curve, but it is very powerful.


Questions?
---
ray@boxee.tv