/* global gtag */

window.addEventListener(
  'DOMContentLoaded',
  () => {
    const mql = window.matchMedia('screen and (max-width: 1023px)');
    const $menu = document.querySelector('#menu');
    const $locations = document.querySelector('#locations') || document.createElement('div');
    const $video = document.querySelector('video') || document.createElement('video');

    const toggleMenu = () => {
      $menu.hidden = mql.matches;
    };

    mql.addListener(toggleMenu);
    toggleMenu();

    window.addEventListener('click', (event) => {
      if (event.target.matches('a[href^="#location-"]')) {
        event.preventDefault();

        const hash = event.target.getAttribute('href');
        const $currentLocation = document.querySelector('[id^="location-"]:not([hidden])');
        const $newLocation = document.querySelector(hash);

        if ($currentLocation) {
          $currentLocation.hidden = true;
        }

        if ($newLocation) {
          $locations.hidden = false;
          $newLocation.hidden = false;
          gtag('event', 'page_view', {
            page_title: document.title,
            page_location: `${window.location.href}${hash}`,
          });
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
      new IntersectionObserver((entries) => {
        if (entries[0].intersectionRatio > 0) {
          $video.play();
        } else {
          $video.pause();
        }
      }).observe($video);
    }
  },
  { once: true },
);

window.addEventListener(
  'DOMContentLoaded',
  () => {
    if (document.body.id !== 'winners') {
      return;
    }

    const animated = 'animate' in HTMLElement.prototype;

    document.querySelectorAll('.winner').forEach(($winner) => {
      const $slider = $winner.querySelector('.pictures .slider');
      const $thumbnails = $winner.querySelector('.pictures .thumbnails');
      const images = $slider.querySelectorAll('img');
      const thumbnails = [];
      let currentIndex = 0;
      let autoplay = 0;

      const scrollDelay = (index, manual) => {
        if (index === currentIndex) {
          return;
        }

        const $prevImage = images[currentIndex];
        const $prevThumbnail = thumbnails[currentIndex];

        $prevImage.tabIndex = -1;
        $prevThumbnail.tabIndex = -1;
        $prevImage.setAttribute('aria-hidden', 'true');
        $prevThumbnail.setAttribute('aria-selected', 'false');

        if (index === undefined) {
          currentIndex += 1;
        } else {
          currentIndex = index;
        }

        if (currentIndex === images.length) {
          currentIndex = 0;
        } else if (currentIndex === -1) {
          currentIndex = images.length - 1;
        }

        const $newImage = images[currentIndex];
        const $newThumbnail = thumbnails[currentIndex];

        $newImage.tabIndex = 0;
        $newThumbnail.tabIndex = 0;
        $newImage.setAttribute('aria-hidden', 'false');
        $newThumbnail.setAttribute('aria-selected', 'true');

        if (animated) {
          $prevImage.animate(
            [
              { zIndex: 2, opacity: 1, transform: 'translateX(0)' },
              { zIndex: 2, opacity: 0, transform: 'translateX(-100%)' },
            ],
            {
              duration: 1200,
              easing: 'linear',
              fill: 'both',
            },
          );
          $newImage.animate(
            [
              { zIndex: 3, opacity: 1, transform: 'translateX(100%)' },
              { zIndex: 3, opacity: 1, transform: 'translateX(0)' },
            ],
            {
              duration: 600,
              easing: 'ease-out',
              fill: 'both',
            },
          );
        } else {
          $slider.scrollLeft = $newImage.offsetLeft;
        }

        if (manual) {
          $newThumbnail.focus();
        }
      };

      const scroll = (index, manual) => {
        if (typeof requestAnimationFrame === 'function') {
          window.requestAnimationFrame(() => {
            scrollDelay(index, manual);
          });
        } else {
          scrollDelay(index, manual);
        }
      };

      images.forEach(($image, index) => {
        const first = index === 0;
        const id = $image.src.match(/([\w-]+)\.\w+$/)[1];
        const label = $image.alt;
        const $thumbnail = $image.cloneNode(false);

        $image.setAttribute('id', `${id}-image`);
        $image.setAttribute('alt', '');
        $image.setAttribute('tabindex', first ? 0 : -1);
        $image.setAttribute('role', 'tabpanel');
        $image.setAttribute('aria-hidden', !first);
        $image.setAttribute('aria-labelledby', `${id}-thumbnail`);

        $thumbnail.setAttribute('id', `${id}-thumbnail`);
        $thumbnail.setAttribute('alt', '');
        $thumbnail.setAttribute('tabindex', first ? 0 : -1);
        $thumbnail.setAttribute('role', 'tab');
        $thumbnail.setAttribute('aria-controls', `${id}-image`);
        $thumbnail.setAttribute('aria-label', label);
        $thumbnail.setAttribute('aria-selected', first);
        $thumbnail.removeAttribute('itemprop');

        $thumbnails.appendChild($thumbnail);
        thumbnails.push($thumbnail);

        $thumbnail.addEventListener('click', () => {
          $thumbnail.focus();
          window.clearInterval(autoplay);
          scroll(index, true);
        });
      });

      if (animated) {
        $slider.classList.add('animated');
      }

      $thumbnails.setAttribute('role', 'tablist');

      $thumbnails.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
          window.clearInterval(autoplay);
          scroll(currentIndex - 1, true);
        }

        if (event.key === 'ArrowRight') {
          window.clearInterval(autoplay);
          scroll(currentIndex + 1, true);
        }
      });

      // Autoplay
      new IntersectionObserver((entries) => {
        if (entries[0].intersectionRatio > 0) {
          autoplay = window.setInterval(() => {
            scroll();
          }, 3000);
        } else {
          window.clearInterval(autoplay);
        }
      }).observe($slider);
    });
  },
  { once: true },
);

window.addEventListener(
  'DOMContentLoaded',
  () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          target.classList.toggle('visible', isIntersecting);
        });
      },
      {
        threshold: [0, 0.5, 1],
      },
    );

    document.querySelectorAll('.animate').forEach((element) => {
      observer.observe(element);
    });
  },
  { once: true },
);
