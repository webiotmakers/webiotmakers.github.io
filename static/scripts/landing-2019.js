/* eslint-disable prefer-arrow-callback */
/* eslint-disable prefer-template */
/* eslint-disable require-jsdoc */

window.addEventListener('DOMContentLoaded', function() {
  'use strict';

  const mql = window.matchMedia('screen and (max-width: 767px)');
  const $menu = document.querySelector('#menu');
  const $home = document.querySelector('#home');
  const $about = document.querySelector('#about');
  const $locations = document.querySelector('#locations');
  const $video = document.querySelector('video');

  function toggle_menu() {
    $menu.hidden = mql.matches;
  }

  mql.addListener(toggle_menu);
  toggle_menu();

  function navigate_page() {
    if (!location.hash || location.hash === '#home') {
      $menu.hidden = mql.matches;
      $home.hidden = false;
      $about.hidden = $locations.hidden = true;
      ga('send', 'pageview', '/');
    }

    if (location.hash === '#about') {
      $menu.hidden = mql.matches;
      $home.hidden = $locations.hidden = true;
      $about.hidden = false;
      ga('send', 'pageview', '/#about');
    }
  }

  window.addEventListener('hashchange', function() {
    navigate_page();
  });

  navigate_page();

  window.addEventListener('click', function(event) {
    if (event.target.matches('a[href^="#location-"]')) {
      event.preventDefault();

      const hash = event.target.getAttribute('href');
      const $current_location = document.querySelector('[id^="location-"]:not([hidden])');
      const $new_location = document.querySelector(hash);

      if ($current_location) {
        $current_location.hidden = true;
      }

      if ($new_location) {
        $locations.hidden = false;
        $new_location.hidden = false;
        ga('send', 'pageview', '/' + hash);
      } else {
        $locations.hidden = true;
      }
    }

    if (event.target.matches('#mobile-header a.menu')) {
      event.preventDefault();
      $menu.hidden = false;
    }

    if (event.target.matches('#menu a.close')) {
      event.preventDefault();
      $menu.hidden = mql.matches;
    }

    if (event.target.matches('#locations a.close')) {
      event.preventDefault();
      $locations.hidden = true;
    }

    console.log(event.target);
  });

  if (!navigator.connection || navigator.connection.type !== 'cellular') {
    if (typeof IntersectionObserver === 'function') {
      new IntersectionObserver(function(entries) {
        if (entries[0].intersectionRatio > 0) {
          $video.play();
        } else {
          $video.pause();
        }
      }).observe($video);
    } else {
      $video.play();
    }
  }

  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
  }
});
