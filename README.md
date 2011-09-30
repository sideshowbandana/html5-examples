**Example HTML5 apps for the Boxee Box browser**

Use these examples to jump-start your leanback app!

Dive into the individual app directories to learn more about each approach.


Benefits of HTML5 Approach
----
  * You don't need write a different app for each platform, as long as they have HTML5 compliant browsers (Boxee Box, GoogleTV, etc)
  * Designing interaction based around the d-pad maximizes compatibility across various browsers that run on TVs

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