
var dPadNav = {
  selectedClass: 'selected',
  activeClass: 'active',
  enterNavArea: function($navArea) {
    $navArea = $navArea.first();
    if ($navArea.size() > 0) {
      var selector = this.getSpotSelector($navArea);
      var $nextSpot = $navArea.find(selector).first();
      if (this.selectSpot($nextSpot)) {
        $("." + this.activeClass).removeClass(this.activeClass);
        $($navArea).addClass(this.activeClass);
      }
    }
  },
  enterNavSpot: function($spot) {
    if (this.selectSpot($spot)) {
      if ($spot.closest('.nav-area').size() > 0) {
        $("." + this.activeClass).removeClass(this.activeClass);
        $spot.closest('.nav-area').addClass(this.activeClass);
      }
    }
  },
  selectSpot: function($spot) {
    if ($spot.size() > 0) {
      $("." + this.selectedClass).removeClass('selected')
      $spot.addClass('selected');
      $spot.trigger('nav-selected');
      return true;
    }
    return false;
  },
  getSpot: function(resetIfNone) {
    var $spot = $("." + this.selectedClass).first();

    if (resetIfNone && $spot.size() === 0) {
      this.resetNav();
      $spot = $("." + this.selectedClass).first();
    }

    return $spot;
  },
  getSpotSelector: function($navArea) {
    var dataSpotSelector = $navArea.attr('data-spot-selector');
    if (!dataSpotSelector) {
      if ($navArea.is("ul,ol")) {
        dataSpotSelector = 'li';
      }
    }
    return dataSpotSelector || '*';
  },
  resetNav: function($navArea) {
    if (!$navArea || $navArea.size() === 0) {
      $navArea = $('.nav-area').first();
    }
    this.enterNavArea($navArea);
  },
  init: function($navArea) {
    $(document).keydown(_.bind(this.handleKeyPress, this));
    this.resetNav($navArea);
  },
  handleKeyPress: function(e) {
    e.preventDefault();
    
    this.resetInactivityTimer();
    
    var code = (e.keyCode ? e.keyCode : e.which);
    
    switch(code) {
      case 13: // enter
        this.click();
        break;
      case 27: // escape
        break;
      case 32: // space
        break;
      case 37:
        this.left();
        break;
      case 38:
        this.up();
        break;
      case 39:
        this.right();
        break;
      case 40:
        this.down();
        break;
    }
  },
  left: function() {
    this.getSpot().trigger('nav-left');
  },
  right: function() {
    this.getSpot().trigger('nav-right');
  },
  up: function() {
    this.getSpot().trigger('nav-up');
    
    var $spot = this.getSpot();
    if ($spot.size() === 0) {
      return this.resetNav();
    }
    var $navArea = $spot.closest('.nav-area');
    var $nextSpot = $spot.prevAll(this.getSpotSelector($navArea)).first();
    this.selectSpot($nextSpot);
    
    $spot.trigger('after-nav-up');
  },
  down: function() {
    var $spot = this.getSpot();
    $spot.trigger('nav-down');

    if ($spot.size() === 0) {
      return this.resetNav();
    }
    var $navArea = $spot.closest('.nav-area');    
    var $nextSpot = $spot.nextAll(this.getSpotSelector($navArea)).first();
    this.selectSpot($nextSpot);
    
    $spot.trigger('after-nav-down');
  },
  click: function() {
    this.getSpot().trigger('click');
  },
  resetInactivityTimer: function() {
    clearTimeout(window.dPadInactivityTimer);
    window.dPadInactivityTimer = setTimeout(dPadNav.dispatchInactivity, 5000);
  },
  clearInactivityTimer: function() {
    clearTimeout(window.dPadInactivityTimer);
  },
  dispatchInactivity: function() {
    $('body').trigger('inactivity');
  }
};