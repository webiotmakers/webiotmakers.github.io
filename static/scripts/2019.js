/* eslint-disable prefer-arrow-callback */
/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-template */
/* eslint-disable require-jsdoc */

window.addEventListener('DOMContentLoaded', function() {
  'use strict';

  const mql = window.matchMedia('screen and (max-width: 767px)');
  const $menu = document.querySelector('#menu');
  const $home = document.querySelector('#home') || document.createElement('div');
  const $about = document.querySelector('#about') || document.createElement('div');
  const $locations = document.querySelector('#locations') || document.createElement('div');
  const $video = document.querySelector('video') || document.createElement('video');

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
    // navigate_page();
  });

  // navigate_page();

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

window.addEventListener('DOMContentLoaded', function() {
  'use strict';

  if (document.body.id !== 'winners') {
    return;
  }

  const animated = 'animate' in HTMLElement.prototype;

  Array.prototype.forEach.call(document.querySelectorAll('.winner'), function($winner) {
    const $slider = $winner.querySelector('.pictures .slider');
    const $thumbnails = $winner.querySelector('.pictures .thumbnails');
    const images = $slider.querySelectorAll('img');

    /** @type {HTMLElement} */
    let $style;

    /** @type {HTMLElement[]} */
    const thumbnails = [];

    let current_index = 0;
    let autoplay = 0;

    const scroll = function(index, manual) {
      if (typeof requestAnimationFrame === 'function') {
        window.requestAnimationFrame(function() {
          scroll_delay(index, manual);
        });
      } else {
        scroll_delay(index, manual);
      }
    };

    const scroll_delay = function(index, manual) {
      if (index === current_index) {
        return;
      }

      const $prev_image = images[current_index];
      const $prev_thumbnail = thumbnails[current_index];

      $prev_image.tabIndex = $prev_thumbnail.tabIndex = -1;
      $prev_image.setAttribute('aria-hidden', 'true');
      $prev_thumbnail.setAttribute('aria-selected', 'false');

      if (index === undefined) {
        current_index++;
      } else {
        current_index = index;
      }

      if (current_index === images.length) {
        current_index = 0;
      } else if (current_index === -1) {
        current_index = images.length - 1;
      }

      const $new_image = images[current_index];
      const $new_thumbnail = thumbnails[current_index];

      $new_image.tabIndex = $new_thumbnail.tabIndex = 0;
      $new_image.setAttribute('aria-hidden', 'false');
      $new_thumbnail.setAttribute('aria-selected', 'true');

      if (animated) {
        $prev_image.animate([
          { zIndex: 2, opacity: 1, transform: 'translateX(0)' },
          { zIndex: 2, opacity: 0, transform: 'translateX(-100%)' },
        ], {
          duration: 1200,
          easing: 'linear',
          fill: 'both',
        });
        $new_image.animate([
          { zIndex: 3, opacity: 1, transform: 'translateX(100%)' },
          { zIndex: 3, opacity: 1, transform: 'translateX(0)' },
        ], {
          duration: 600,
          easing: 'ease-out',
          fill: 'both',
        });
      } else {
        $slider.scrollLeft = $new_image.offsetLeft;
      }

      if (manual) {
        $new_thumbnail.focus();
      }
    };

    Array.prototype.forEach.call(images, function($image, index) {
      const first = index === 0;
      const id = $image.src.match(/([\w\-]+)\.\w+$/)[1];
      const label = $image.alt;

      /** @type {HTMLElement} */
      const $thumbnail = $image.cloneNode(false);

      $image.id = id + '-image';
      $image.alt = '';
      $image.tabIndex = first ? 0 : -1;
      $image.setAttribute('role', 'tabpanel');
      $image.setAttribute('aria-hidden', !first);
      $image.setAttribute('aria-labelledby', id + '-thumbnail');

      $thumbnail.id = id + '-thumbnail';
      $thumbnail.alt = '';
      $thumbnail.tabIndex = first ? 0 : -1;
      $thumbnail.setAttribute('role', 'tab');
      $thumbnail.setAttribute('aria-controls', id + '-image');
      $thumbnail.setAttribute('aria-label', label);
      $thumbnail.setAttribute('aria-selected', first);
      $thumbnail.removeAttribute('itemprop');

      $thumbnails.appendChild($thumbnail);
      thumbnails.push($thumbnail);

      $thumbnail.addEventListener('click', function() {
        $thumbnail.focus();
        window.clearInterval(autoplay);
        scroll(index, true);
      });
    });

    if (animated) {
      $slider.classList.add('animated');
    } else {
      $style = document.head.appendChild(document.createElement('style'));
    }

    $thumbnails.setAttribute('role', 'tablist');

    $thumbnails.addEventListener('keydown', function(event) {
      if (event.key === 'ArrowLeft') {
        window.clearInterval(autoplay);
        scroll(current_index - 1, true);
      }

      if (event.key === 'ArrowRight') {
        window.clearInterval(autoplay);
        scroll(current_index + 1, true);
      }
    });

    // Autoplay
    if (typeof IntersectionObserver === 'function') {
      new IntersectionObserver(function(entries) {
        if (entries[0].intersectionRatio > 0) {
          autoplay = window.setInterval(function() {
            scroll();
          }, 3000);
        } else {
          window.clearInterval(autoplay);
        }
      }).observe($slider);
    } else {
      autoplay = window.setInterval(function() {
        scroll();
      }, 3000);
    }
  });
});
