boxee.apiMinVersion = 7.0;
boxee.reloadOnPageChange = true;
boxee.setMode(boxee.KEYBOARD_MODE);

playerState.canPause = true;

function showMessage(message) {
  boxee.showNotification(message, ".", 1);
}

function updateTimeBuffer(time, duration) {
  playerState.time = time;
  playerState.duration = duration;
}

function getURL(url) {
  return boxee.getHttp(url);  
}

function getXML(url) {
  if (url.substr(0, 3) == 'rss') {
    url = 'http' + url.substring(3);
  }
  
  return getURL(url);
}

boxee.onPlay = function() {
  browser.execute('boxee.onPlay();');  
}

boxee.onPause = function() {  
  browser.execute('boxee.onPause()');
}
