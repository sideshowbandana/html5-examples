
/**
 * Module dependencies.
 */

var express = require('express');
var xml2js = require('xml2js');
var http = require('http');
var url = require('url');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});


MIRO_GUIDES = ['new', 'featured', 'popular', 'toprated'];

// Routes

app.get('/guides', function(req, res) {
  res.send(MIRO_GUIDES);
});

app.get('/guides/:name', function(req, res) {
  var name = req.params['name'];
  
  if (MIRO_GUIDES.indexOf(name) === -1) {
    throw new Error("guide not found");
  }
  
  var options = url.parse("http://feeds.feedburner.com/miroguide/" + req.params['name']);
  var urlOptions = {
    host: options.host,
    port: 80,
    path: options.pathname
  };
  
  var parser = new xml2js.Parser();
  parser.addListener('end', function(result) {    
    var guide = {
      name: name,
      title: result.channel.title,
      description: result.channel.description,
      thumbnail: result.channel.image.url      
    };
    var feeds = [];
    
    result.channel.item.forEach(function(feedItem) {
      var url = '';
      if (feedItem.description) {
        var md = feedItem.description.match(/(http.....feeds.feedburner.com\/(.*))/);
        if (md) {
          url = md[0].split('&')[0];
          url = decodeURIComponent(url);
        }
      }
      if (url) {
        feeds.push({
          title: feedItem.title,
          description: feedItem.description,
          thumbnail: feedItem.thumbnail,
          url: url
        });        
      }
    });
    
    guide.feeds = feeds;
    
    res.send(guide);
  });
  
  http.get(urlOptions, function(res) {
    res.on('data', function(chunk) {
      parser.parseString(chunk);
    });
  }).on('error', function(e) {
    throw new Error("parse error: " + e.message);
  });
});

app.get('/userfeeds', function(req, res) {  
  var feeds = [{
    title: "HD weekly wildlife highlights",
    thumbnail: "http://www.earth-touch.com/i/podcast/ET_IT5.jpg",
    url: "http://feeds.feedburner.com/earth-touch_podcast_720p"
  }, {
    title: "TEDTalks (hd)",
    thumbnail: "http://video.ted.com/assets/images/itunes/podcast_poster_600x600.jpg",
    url: "http://feeds.feedburner.com/tedtalksHD"
  }, {
    title: "Doctype",
    thumbnail: "http://doctype.tv/images/itunes.png",
    url: "http://feeds.feedburner.com/doctype/episodes"
  }, {
    title: "HD Nation (HD Quicktime)",
    thumbnail: "http://bitcast-a.bitgravity.com/revision3/images/shows/hdnation/hdnation.jpg",
    url: "http://revision3.com/hdnation/feed/Quicktime-High-Definition"
  }];
  
  res.send(feeds);
});

app.get('/feeds/*', function(req, res) {
  var feedUrl = req.params[0];
  
  var options = url.parse(feedUrl);
  var urlOptions = {
    host: options.host,
    port: 80,
    path: options.pathname
  };
  
  if (options.host == null) {
    throw new Error('bad feed url');
  }
  
  var parser = new xml2js.Parser();
  parser.addListener('end', function(result) {
    var channel = result.channel;
    var feed = {
      url: feedUrl,
      title: channel.title,
      description: channel.description,
      thumbnail: channel.image ? channel.image.url : null
    };
    var videos = [];
    
    channel.item.forEach(function(videoItem) {
      var video = {
        title: videoItem.title,
        description: videoItem.description
      }
      if (videoItem['media:content'] && videoItem['media:content']['@']) {
        video.url = videoItem['media:content']['@']['url'];
      } else if (videoItem['media:content'] && videoItem['media:content'].length) {
        if (videoItem['media:content'][0]['@']) {
          video.url = videoItem['media:content'][0]['@']['url'];
        }
      }
      if (videoItem['media:thumbnail']) {
        video.thumbnail = videoItem['media:thumbnail']['@']['url'];
      }
      videos.push(video);
    });
    
    feed.videos = videos;    
    res.send(feed);
  });
  
  http.get(urlOptions, function(res) {
    res.on('data', function(chunk) {
      parser.parseString(chunk);
    });
  }).on('error', function(e) {
    throw new Error("parse error: " + e.message);
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
