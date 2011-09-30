/*
  Note about exec2:  On the boxee box, exec2 is a blocking function that returns a string.  For example,
  boxee.exec2("load url xyz and give me the xml from it") will block until the url is loaded and return
  actual xml from that function.
  
  In normal JS, you would need to set up an AJAX request with a callback function that would be called when
  the xml was eventually received.
  
  In order to conform to the normal way of doing things in client-side JS, callbacks are used for functions that need
  to fetch data and pass it back to the page.
*/



/* _.defaults will leave existing properties in window.boxee untouched, but fill in non-existant ones from the second argument */


window.boxee = window.boxee || {};

if (!window.boxee.exec) {
  window.boxee.fake = true;
}

_.defaults(window.boxee, {
  
  exec: function(string) {
    console.log("boxee.exec : " + string);
  },
  exec2: function(string) {
    console.log("boxee.exec2 : " + string);
    return '';
  },
  notify: function(message, seconds) {
    seconds = seconds ? seconds : 2;
    boxee.exec('boxee.showNotification("' + message +'", ".", ' + seconds + ');');
  },
  showBoxeeOSD: function() {
    boxee.exec("boxee.showBoxeeOSD()");
  },
  getURL: function(url, callback) {
    return $.Deferred(function(dfd) {
      var data = boxee.exec2("getURL('" + url + "')");
      setTimeout(function() {
        dfd.resolve();
        callback(data);
      }, 0);
    }).promise();
  },
  getXML: function(url, callback) {
    return $.Deferred(function(dfd) {
      var xmlString = boxee.exec2("getXML('" + url + "')");
      if (!xmlString) return dfd.resolve();
      var parsedXML = $.parseXML(xmlString);
      setTimeout(function() {
        callback($(parsedXML));
        dfd.resolve();
      }, 0);      
    }).promise();
  },
  onPlay: function() {
    $('body').trigger('boxee:play');
  },
  onPause: function() {
    $('body').trigger('boxee:pause');
  },
  clearPauseOverlay: function() {
    boxee.exec("playerState.isPaused = false;");
  },
  showPauseOverlay: function() {
    boxee.exec("playerState.isPaused = true;");
  },
  updateTimeBuffer: function(time, duration) {
    boxee.exec("updateTimeBuffer(" + time + ", " + duration + ")");
  }
});

$(window).unload(function() {
  boxee.clearPauseOverlay()
});