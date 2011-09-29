$(document).ready(function () {
  
  dPadNav.init();
  
  window.notify = function(message, seconds) {
    boxee.notify(message, seconds);
  }
  
  var rssFeedTemplate = Handlebars.compile($('#rss-feed-template').html());
  var rssItemTemplate = Handlebars.compile($('#rss-item-template').html());
  var rssListTemplate = Handlebars.compile($('#rss-item-list-template').html());
  
  function initPage() {
    
    FullScreenPlayer.init({
      container: $('#video-container')
    });
    
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    if (windowHeight === 1080 && windowWidth === 1920) {
      $('html').css({zoom: 1});
    }
        
    $.ajax("/userfeeds").success(function(feedList) {
      var promises = [], promise;
      
      _.each(feedList, function(feed) {
        promise = $.get("/feeds/" + encodeURIComponent(feed.url)).success(function(f) {
          addRSSFeed(feed, f.videos);
        });
        promises.push(promise);
      });
      
      $.when.apply(null, promises).then(function() {
        dPadNav.resetNav($("#feed-list"));
        $('#add-feed').css('display', 'block');
      });
    });
  };
  
  setTimeout(initPage, 500);
  
  var feeds = 0;
  
  var scrollToShow = function($list, $item) {
    // $list must have a height set and overflow set to hidden (or auto)
    var currentTop = $list.scrollTop();
    
    var offset = $list.height() * (2/5);
    
    var prevScrollTop = $list.scrollTop();
    
    var scrollAmount = $item.position().top - offset + currentTop;
    $list.scrollTop(scrollAmount);
  };
    
  var addRSSFeed = function(feed, videos) {
    feed.id = feeds;
    feeds = feeds + 1;
    
    // create li for left menu
    $('#add-feed').before(rssFeedTemplate(feed))
    
    // create list for containing videos
    feed.videos = videos;
    var options = {partials: {item_partial: rssItemTemplate}};
    var $list = $(rssListTemplate(feed, options));
    $("#sub-menu").append($list);
        
    // handle events on the video
    $list.delegate('li', 'nav-left', function(e) {
      var feedId = $list.attr('data-feed-id');
      var $target = $("ul#feed-list li[data-feed-id=" + feedId + "]");
      dPadNav.enterNavSpot($target);
    });
    
    $list.delegate('li', 'nav-right', function(e) {
      if (player && player.src) {
        dPadNav.enterNavArea($("#video-container"));
        $('body').addClass('full-screen-video');
      }
    });
    
    $list.delegate('li', 'click', function(e) {
      var $li = $(this);
      
      $('.return-from-video').removeClass('return-from-video');
      $li.addClass('return-from-video');
      $('body').addClass('full-screen-video');
      dPadNav.enterNavArea($("#video-container"));
      
      // show controls when starting/switching video
      $('.boxee-player-osd').css('visibility', 'visible');
      
      var player = document.getElementById('player');
      player.src = $li.attr('data-video-src');
      player.load();
      player.play();
      $('.boxee-player-title-text').text($li.attr('data-video-title'));
    });
    
    $list.delegate('li', 'nav-selected', function(e) {
      var $li = $(this);
      scrollToShow($list, $li);
    });
    
  }
  
  var startFeedShowcase = function() {
    var $showcaseList = $('#showcase-list');
    if ($showcaseList.children().size() === 0) {
      $showcaseList.html('');
      
      var promise = $.ajax("/guides/popular").success(function(data) {
        _.each(data.feeds, function(feed) {
          $showcaseList.append(rssFeedTemplate(feed));
        });
      });
      
      $.when(promise).then(function() {
        dPadNav.enterNavArea($showcaseList);
        
        $showcaseList.delegate('li', 'nav-selected', function(e) {
          var $li = $(this);
          scrollToShow($showcaseList, $li);
        });

        $showcaseList.delegate('li', 'click', function(e) {
          boxee.notify('showcase click');
          var $li = $(this);
          var feed = {
            url: $li.attr('data-feed-url'),
            id: feeds++,
            thumbnail: $li.find('img').attr('src')
          }
          
          var promise = $.get("/feeds/" + encodeURIComponent(feed.url)).success(function(f) {
            addRSSFeed(feed, f.videos);
          });
          
          $.when(promise).then(function() {
            $('#feed-showcase').hide();
            dPadNav.enterNavSpot($('#add-feed').prev('li'));
          });
        });
        
        $showcaseList.delegate('li', 'nav-left', function(e) {
          var $li = $(this);
          $('#feed-showcase').hide();
          dPadNav.enterNavSpot($('#add-feed'));
        });
        
      });
    } else {
      dPadNav.enterNavArea($showcaseList);
    }
    $('#feed-showcase').show();
  };
  
  var clickFeed = function(e) {
    e.preventDefault();
    
    var $li = $(this);
    
    if ($li.attr('id') == 'add-feed') {
      return startFeedShowcase();
    }
    
    var feedId = $li.attr('data-feed-id');
    dPadNav.enterNavArea($("ul#feed-" + feedId));    
  };
  
  $("#feed-list").delegate('li', 'click', clickFeed).delegate('li', 'nav-right', clickFeed);

  $("#feed-list").delegate('li', 'nav-left', function() {
    if (player && player.src) {
      dPadNav.enterNavArea($("#video-container"));
      $('body').addClass('full-screen-video');
    }
  });

  $("#feed-list").delegate('li', 'nav-selected', function(e) {
    e.preventDefault();
    var $li = $(this);
    scrollToShow($("#feed-list"), $li);
    var feedId = $li.attr('data-feed-id');
    $('ul.video-feed').hide();
    $("ul#feed-" + feedId).show();
  });
  
  var player = document.getElementById('player');

  $('body').bind('boxee:play', function() {
    player.play();
  });
  
  $('body').bind('boxee:pause', function() {
    player.pause();
  });
  
  $('body').bind('inactivity', function() {
    console.log('inactivity triggered');
    
    if ($('.boxee-player-osd').is(':visible') && $('.boxee-player-osd').css('visibility') == 'visible') {
      if (player.paused || player.ended || player.seeking || player.currentTime < 1) {
        dPadNav.resetInactivityTimer();
      } else {
        $('.boxee-player-osd').css('visibility', 'hidden');
      }
    } else {
      // $('.boxee-player-osd').css('visibility', 'hidden');
      // if video is playing?
      if (player.src) {
        dPadNav.enterNavArea($("#video-container"));
        $('body').addClass('full-screen-video');
      }
    }
  });
    
  $('#player').bind('after-nav-up', function() {
    $('.boxee-player-osd').css('visibility', 'hidden');
    var $spot = $('.return-from-video');
    $('body').removeClass('full-screen-video');
    dPadNav.selectSpot($spot);
  });
  
  $('#player').bind('after-nav-down', function() {    
    $('.boxee-player-osd').css('visibility', 'hidden');
    var $spot = $('.return-from-video');
    $('body').removeClass('full-screen-video');
    dPadNav.selectSpot($spot);
  });
    
  $("#player").bind('nav-left', function() {
    if ($('.boxee-player-osd').css('visibility') == 'hidden') {
      $('.boxee-player-osd').css('visibility', 'visible');
      return;
    }
    $('.boxee-player-osd').css('visibility', 'visible');
    FullScreenPlayer.seekReverse();
  });
  
  $("#player").bind('nav-right', function() {
    if ($('.boxee-player-osd').css('visibility') == 'hidden') {
      $('.boxee-player-osd').css('visibility', 'visible');
      return 
    }
    
    $('.boxee-player-osd').css('visibility', 'visible');
    FullScreenPlayer.seekForward();
  });
  
});
