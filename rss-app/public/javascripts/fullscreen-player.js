// Requires underscore.js and jQuery
window.FullScreenPlayer = {
  init: function(options) {
    _.extend(this.options, options);
    if (this.options.video && !$(this.options.video).is("video")) {
      this.options.video = null;
    }
    
    this.$container = $(this.options.container);
    
    if (this.options.video) {
      this.$video = $(this.options.video);
    } else {
      this.$video = this.$container.find('video').first();
    }
    
    this.video = this.$video.get(0);
    
    this.bindEvents();
    
    this.setVideoTime(0);
    this.setVideoDuration(0);
    
    if (this.options.buildHTML) {
      this.appendHTML();
    }
    
    FullScreenPlayer.seek = _.debounce(FullScreenPlayer.doSeek, this.options.seekThreshold);
  },
  
  options: {
    seekThreshold: 500,
    seekBy: 10, // seconds, when using seekForward() or seekReverse()
    container: 'body',
    buildHTML: true, // unless you want to add the html manually
    video: null // defaults to container.find('video').first();
  },
  
  onPlay: function() {
    this.$container.removeClass('paused ended seeking');
  },
  
  onPause: function() {
    this.$container.addClass('paused').removeClass('ended');
  },
  
  onEnded: function() {
    this.$container.addClass('ended').removeClass('paused');
    this.$container.find('.boxee-player-osd').css('visibility', 'visible');  
  },
  
  onSeeking: function() {
    this.$container.addClass('seeking');
  },
  
  onSeeked: function() {
    this.$container.removeClass('seeking');
  },
  
  onTimeupdate: function() {
    var position = this.currentTime;
    if (position === null) {
      position = this.video.currentTime;
    }
    var duration = this.video.duration;

    this.setVideoTime(position);
    this.setVideoDuration(duration);

    var bufferedWidth = 0;
    if (this.video.buffered.length > 0) {
      bufferedWidth = ((this.video.buffered.end(0) / duration) * 100);
    }

    var positionWidth = ((position / duration) * 100);
    this.$container.find('.boxee-scrubber').css({'left': positionWidth + "%"})
    this.$container.find('.boxee-progressbar-wrapper').width(this.$container.find('.boxee-progressbar').width());

    this.$container.find('.boxee-progressbar-buffered').css({'width': bufferedWidth + "%"});
    this.$container.find('.boxee-progressbar-position').css({'width': positionWidth + "%"});
  },
  
  onBoxeePlay: function() {
    this.video.play();
  },
  
  onBoxeePause: function() {
    this.video.pause();
  },
  
  bindEvents: function() {
    this.$video.bind('play', _.bind(this.onPlay, this));
    this.$video.bind('pause', _.bind(this.onPause, this));
    this.$video.bind('ended', _.bind(this.onEnded, this));
    this.$video.bind('seeking', _.bind(this.onSeeking, this));
    this.$video.bind('seeked', _.bind(this.onSeeked, this));
    this.$video.bind('timeupdate', _.bind(this.onTimeupdate, this));
    
    /* if using boxee-utils.js and boxee-control.js controller, running on box */
    $('body').bind('boxee:play', _.bind(this.onBoxeePlay, this));
    $('body').bind('boxee:pause', _.bind(this.onBoxeePause, this));
  },
  
  formatSeconds: function(s) {
    total = parseInt(s);

    if (isNaN(total) || total < 0) {
      return "00:00:00";
    }

    seconds = total % 60;

    total = total - seconds;
    minutes = total % (60 * 60);
    minutes = minutes / 60;

    total = total - (minutes * 60);
    hours = total / (60 * 60);

    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    return hours + ":" + minutes + ":" + seconds;
  },  
  
  setVideoTime: function(seconds) {
    this.$container.find('.boxee-progressbar-elapsed-text').text(this.formatSeconds(seconds));
  },

  setVideoDuration: function(seconds) {
    this.$container.find('.boxee-progressbar-duration-text').text(this.formatSeconds(seconds));
  },
  
  setVideoTitle: function(title) {
    this.$container.find('.boxee-player-title-text').text(title);
  },
  
  togglePause: function() {
    if (this.isPaused()) {
      this.play();
    } else {
      this.pause();
    }
  },
  
  isPaused: function() {
    return this.video.paused;
  },
  
  play: function() {
    this.video.play();
  },
  
  pause: function() {
    this.video.pause();
  },
  
  loadSrc: function(src) {
    this.video.src = src;
    this.video.load();
    this.video.play();
  },
  
  /* Time Proxy */
  
  currentTime: null,
  
  seekForward: function() {
    if (this.currentTime === null) {
      this.currentTime = this.video.currentTime;
    }
    this.seekTo(this.currentTime + this.options.seekBy);
  },

  seekReverse: function() {
    if (this.currentTime === null) {
      this.currentTime = this.video.currentTime;
    }
    this.seekTo(this.currentTime - this.options.seekBy);
  },

  doSeek: function() {
    console.log('in doSeek ' + this.currentTime);
    if (this.currentTime !== null && this.video && this.video.duration && this.currentTime >= 0 && this.currentTime < this.video.duration) {
      this.$container.addClass('seeking');
      this.video.currentTime = this.currentTime;
      this.currentTime = null;
    }
  },
  
  updateScrubber: function() {
    this.$video.trigger('timeupdate');
  },
  
  seekTo: function(time) {
    if (time >= this.video.duration) {
      time = this.video.duration - 1;
    }
    if (time <= 0) {
      time = 0;
    }
    if (time === this.video.currentTime) {
      return;
    }
    this.currentTime = time;
    this.updateScrubber();
    this.seek();
  },
  
  /* construct the block of html that makes up the controls */
  
  appendHTML: function() {
    this.$container.append(this.buildHTML());
  },
  
  d: function(className) {
    return $("<div/>").addClass('boxee-' + className);
  },
  
  buildHTML: function() {
    var b = this;
    return b
      .d('player-osd')
        .append(b.d('player-title').append(b.d('player-title-text')))
        .append(b.d('seeking').text('Loading'))
        .append(
          b.d('progressbar-container')
            .append(b.d('progressbar-elapsed-container').append(b.d('progressbar-elapsed-text')))
            .append(b.d('progressbar-duration-container').append(b.d('progressbar-duration-text')))
            .append(
              b.d('progressbar').append(
                b.d('progressbar-wrapper')
                  .append(b.d('progressbar-buffered'))
                  .append(b.d('progressbar-position'))
                  .append(b.d('scrubber-container').append(b.d('scrubber')))
              )
            )
        );
  }
  
};