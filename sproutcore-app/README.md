Sproutcore-based leanback app for watching videos from RSS feeds
===

The server takes RSS feeds and translates them into json.  The client displays feeds of videos and lets the user navigate and select them with the d-pad.  Video fills the browser when playing.

Technologies/Frameworks used:
---

Server

   * node.js
   * express.js
   * xml2js
   
Client

   * SproutCore 2.0
   * jQuery
   * Underscore.js
   * Boxee's html5-fullscreen-player


Requirements
---
  * node.js version 0.4.11+
  * npm

Setup
---

     > # install dependencies
     > npm install -d 
     >
     > # start server listening on port 3000
     > node app.js


open a browser to `localhost:3000` to use it!


Questions?
---
ray@boxee.tv
