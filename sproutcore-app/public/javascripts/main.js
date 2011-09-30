var scrollToShow = function($list, $item) {
  // $list must have a height set and overflow set to hidden (or auto)
  var currentTop = $list.scrollTop();
  
  var offset = $list.height() * (2/5);
  
  var prevScrollTop = $list.scrollTop();
  
  var scrollAmount = $item.position().top - offset + currentTop;
  $list.scrollTop(scrollAmount);
};

var App = SC.Application.create({
  setSelected: function(view) {
    App.set('selectedView', view);
  },
  
  fullScreenVideo: function() {
    this.set('lastView', this.selectedView);
    App.setSelected(App.VideoController);
    $('body').addClass('full-screen-video');
  },
  
  exitFullScreenVideo: function() {
    $('body').removeClass('full-screen-video');
    App.setSelected(this.lastView);
  },
  
  keyDown: function(e) {
    if (App.selectedView) {
      var code = (e.keyCode ? e.keyCode : e.which);

      switch(code) {
        case 13: // enter
          App.selectedView.enterKey(); 
          break;
        case 37:
          App.selectedView.left();
          break;
        case 38:
          App.selectedView.up();
          break;
        case 39:
          App.selectedView.right();
          break;
        case 40:
          App.selectedView.down();
          break;
      }
    } 
  }
});

App.VideoItemView = SC.View.extend({
  
  templateName: 'video-item-template',
  tagName: 'li',  
  classNames: ['video-item'],
  classNameBindings: ['content.playing', 'content.selected'],
  videoBinding: "content",
  feedBinding: "content.feed",
  
  init: function() {
    this.content.addObserver('selected', this, "onSelection")
    this._super();
  },
  
  onSelection: function() {
    if (this.content.selected) {
      App.setSelected(this);
      this.scrollIntoView();
    }
  },
  
  scrollIntoView: function() {
    scrollToShow(this.$().closest('ul'), this.$());
  },
  
  enterKey: function() {
    console.log('Enter key hit for ' + this.content.title);
        
    this.content.play();
  },
  
  up: function() {
    this.feed.navUpFrom(this.content);    
  },
  
  down: function() {
    this.feed.navDownFrom(this.content);
  },
  
  right: function() {
    if (FullScreenPlayer.video.src) {
      App.fullScreenVideo();
    }
  },
  
  left: function() {
    this.feed.deselectAll();
    this.feed.set('lastSelected', this.content);
    this.feed.activate();
  },
  
  mouseDown: function() {
    this.content.select();
  }
});

App.VideoController = SC.Object.create({
  up: function() {
    App.exitFullScreenVideo();
  },
  
  down: function() {
    App.exitFullScreenVideo();
  },
  
  enterKey: function() {
    $('.boxee-player-osd').css('visibility', 'visible');
    if (FullScreenPlayer.isPaused()) {
      FullScreenPlayer.play();
    } else {
      FullScreenPlayer.pause();
    }
  },
  
  right: function() {
    if ($('.boxee-player-osd').css('visibility') == 'hidden') {
      $('.boxee-player-osd').css('visibility', 'visible');
      return;
    }
    $('.boxee-player-osd').css('visibility', 'visible');
    FullScreenPlayer.seekForward();
  },
  
  left: function() {
    if ($('.boxee-player-osd').css('visibility') == 'hidden') {
      $('.boxee-player-osd').css('visibility', 'visible');
      return;
    }
    $('.boxee-player-osd').css('visibility', 'visible');
    FullScreenPlayer.seekReverse();    
  }
});

App.FeedView = SC.View.extend({
  templateName: "feed-template",
  classNameBindings: ['content.active', 'content.selected', 'content.history'],
  init: function() {
    this.content.addObserver('active', this, "onActivation")
    this._super();
  },
  onActivation: function() {
    if (this.content.active) {
      App.setSelected(this);
      this.scrollIntoView();
    }
  },
  mouseDown: function() {
    this.content.activate();
    App.setSelected(this);
  },
  
  scrollIntoView: function() {
    scrollToShow(this.$().closest('ul'), this.$());
  },  
  
  up: function() {
    App.feedsController.navUpFrom(this.content);
  },
  
  down: function() {
    App.feedsController.navDownFrom(this.content);
  },
  
  enterKey: function() {
    this.right();
  },
  
  right: function() {
    if (this.content.navInto()) {
      this.content.set('selected', false);
      this.content.set('history', true);      
    }
  },
  
  left: function() {
    if (FullScreenPlayer.video.src) {
      App.fullScreenVideo();
    }
  }
});

App.VideoFeedView = SC.CollectionView.extend({
  itemViewClass: App.VideoItemView,
  tagName: 'ul',
  classNames: ['video-feed'],
  classNameBindings: ['content.active']
});

App.Feed = SC.ArrayProxy.extend({
  title: null,
  thumbnail: null,
  url: null,
  content: [],
  active: false,
  selected: false,
  navInto: function() {    
    var item = this.getItem();
    
    if (item) {
      item.select();
      return true;
    }
    return false;
  },
  navUpFrom: function(videoItem) {
    var nextVideoItem = null;
    var i = this.content.indexOf(videoItem);
    if (i > -1) {
      if (i > 0) {
        nextVideoItem = this.content[i - 1];
        if (nextVideoItem) {
          nextVideoItem.select();
        }        
      } else {
        console.log("already at the top");
      }
    } else {
      console.log("feed not found in list")
    }    
  },
  navDownFrom: function(videoItem) {
    var nextVideoItem = null;
    var i = this.content.indexOf(videoItem);
    if (i > -1) {
      if (i < (this.content.length -1)) {
        nextVideoItem = this.content[i + 1];
        if (nextVideoItem) {
          nextVideoItem.select();
        }        
      } else {
        console.log("already at the bottom");
      }
    } else {
      console.log("feed not found in list")
    }
  },
  deselectAll: function() {
    _.each(this.content, function(videoItem) {
      videoItem.deselect();
    });
  },
  load: function() {
    
  },
  
  getItem: function() {
    if (this.lastSelected && this.content.indexOf(this.lastSelected) > -1) {
      return this.lastSelected;
    }
    return this.content[0];
  },
  
  activate: function() {
    console.log('activating ' + this.title);
    App.feedsController.deactivateAll();
    this.set('active', true);
    this.set('selected', true);
    
  },
  deactivate: function() {
    this.set('active', false);
    this.set('selected', false);
    this.set('history', false);
  },
  setVideos: function(videos) {
    var self = this;
    self.set('content', []); // Not sure I understand why this is needed but otherwise both lists have the same content.
    _.each(videos, function(video) {
      var videoItem = App.VideoItem.create(video);
      videoItem.set('feed', self);
      self.pushObject(videoItem);
    });
  }
});

App.VideoItem = SC.Object.extend({
  title: null,
  thumbnail: null,
  url: null,
  playing: false,
  selected: false,
  
  play: function() {
    App.feedsController.setAllVideosNotPlaying();
    this.set('playing', true);
    
    console.log('Loading video url ' + this.url);
    FullScreenPlayer.loadSrc(this.url);
    FullScreenPlayer.setVideoTitle(this.title);
    App.fullScreenVideo();
  },
  
  select: function() {
    console.log('selecting ' + this.title);
    this.feed.deselectAll();
    this.set('selected', true);
  },
  
  deselect: function() {
    this.set('selected', false);
  }
});

App.feedsController = SC.ArrayProxy.create({
  content: [],
  
  addFeed: function(feed) {
    var feed = App.Feed.create(feedData);
    this.pushObject(feed);
  },
  
  setAllVideosNotPlaying: function() {
    this.content.forEach(function(feed) {
      feed.content.forEach(function(videoItem) {
        videoItem.set('playing', false);
      });
    });
  },
  
  navUpFrom: function(feed) {
    var nextFeed = null;
    var i = this.content.indexOf(feed);
    if (i > -1) {
      if (i > 0) {
        nextFeed = this.content[i - 1];
        if (nextFeed) {
          nextFeed.activate();
        }        
      } else {
        console.log("already at the top");
      }
    } else {
      console.log("feed not found in list")
    }
  },
  
  navDownFrom: function(feed) {
    var nextFeed = null;
    var i = this.content.indexOf(feed);
    if (i > -1) {
      if (i < (this.content.length - 1)) {
        nextFeed = this.content[i + 1];
        if (nextFeed) {
          nextFeed.activate();
        }        
      } else {
        console.log("already at the top");
      }
    } else {
      console.log("feed not found in list")
    }
  },
  
  deactivateAll: function() {
    this.content.forEach(function(feed) {
      feed.deactivate();
    });
  }
});

$(function() {
  setTimeout(function() {
    FullScreenPlayer.init({
      container: $('#video-container')
    });
  }, 1000);

  var h = $(window).height();
  var w = $(window).width();
  if (h == 480 && w == 720) {
    $('html').css('zoom', 720/1920);
  }
  
  var processFeeds = function(feeds) {
    var promises = [], promise;

    _.each(feeds, function(feed) {
      var feedObj;
      console.log("Loading videos json for " + feed.url);
      promise = $.ajax("/feeds/" + encodeURIComponent(feed.url)).success(function(response) {
        var videos = response.videos;
        feedObj = App.Feed.create(feed);
        feedObj.setVideos(videos);
        App.feedsController.pushObject(feedObj);
      });
      
      promises.push(promise);
    });
    
    $.when.apply(null, promises).then(function() {
      var firstFeed = App.feedsController.content[0];
      if (firstFeed) {
        firstFeed.activate();
      }
    });
  };
  
  var feeds = [];
  feeds.push({
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
  });
  
  App.set('title', "Video RSS Feeds");
  
  processFeeds(feeds);
  
  $(document).keydown(_.bind(App.keyDown, App));
});

