/* eslint-disable prefer-arrow-callback */
/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-template */
/* eslint-disable require-jsdoc */

'use strict';

// Object.entries polyfill for IE 11
if (!('entries' in Object)) {
  Object.entries = function (obj) {
    return Object.keys(obj).map(function (key) { return [key, obj[key]]; });
  };
}

window.addEventListener('DOMContentLoaded', function () {
  const _categories = {};
  const _years = {};
  const _locations = {};
  const $fragment = document.createDocumentFragment();
  const works = [];
  const $page_wrapper = document.querySelector('#main-pages');
  const $works_container = document.querySelector('#works-container');
  const $works = document.querySelector('#works-container > ul');
  const $title = document.querySelector('#works-container > h2');
  const $container = document.querySelector('#gallery-container');
  const $filters = document.querySelector('#filters');
  const $filter_general = $filters.querySelector('#filter-general ul');
  const $filter_categories = $filters.querySelector('#filter-categories ul');
  const $filter_years = $filters.querySelector('#filter-years ul');
  const $filter_locations = $filters.querySelector('#filter-locations ul');
  const sorter = function (a, b) { return a[0] > b[0]; };

  // Randomize the works
  for (; ;) {
    if (!$works.children.length) {
      break;
    }

    const index = Math.floor(Math.random() * $works.children.length);
    const child = $works.children[index];

    $fragment.appendChild(child);
    works.push(child);
  }

  $works.appendChild($fragment);

  works.forEach(function ($work) {
    const categories = $work.dataset.categories;
    const year = $work.dataset.year;
    const location = $work.dataset.location;
    const $img = $work.querySelector('img');

    categories.split(' ').forEach(function (cat) {
      _categories[cat] = (_categories[cat] || 0) + 1;
    });

    _years[year] = (_years[year] || 0) + 1;
    _locations[location] = (_locations[location] || 0) + 1;

    // Lazy load images
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.intersectionRatio > 0) {
            observer.disconnect();
            $img.src = $img.dataset.src;
          }
        });
      });

      observer.observe($img);
    } else {
      $img.src = $img.dataset.src;
    }
  });

  $filter_general.innerHTML = ' \
    <li role="none"> \
      <a href="#" role="radio" aria-checked="true" data-category="すべて"> \
        すべて (' + works.length + ') \
      </a> \
    </li> \
    <li role="none"> \
      <a href="#" role="radio" aria-checked="false" data-award="*"> \
        最優秀賞受賞作品 (' + works.filter(function (work) { return work.dataset.award; }).length + ') \
      </a> \
    </li> \
  ';

  console.info(Object.entries(_categories).sort(sorter));

  $filter_categories.innerHTML = Object.entries(_categories).sort(sorter).map(function (args) {
    const category = args[0];
    const count = args[1];

    return ' \
      <li role="none"> \
        <a href="#" role="radio" aria-checked="false" data-category="' + category + '"> \
          ' + category + ' (' + count + ') \
        </a> \
      </li> \
    ';
  }).join('');

  $filter_years.innerHTML = Object.entries(_years).sort(sorter).map(function (args) {
    const year = args[0];
    const count = args[1];

    return ' \
      <li role="none"> \
        <a href="#" role="radio" aria-checked="false" data-year="' + year + '"> \
          ' + year + ' (' + count + ') \
        </a> \
      </li> \
    ';
  }).join('');

  $filter_locations.innerHTML = Object.entries(_locations).sort(sorter).map(function (args) {
    const location = args[0];
    const count = args[1];

    return ' \
      <li role="none"> \
        <a href="#" role="radio" aria-checked="false" data-location="' + location + '"> \
          ' + location + ' (' + count + ') \
        </a> \
      </li> \
    ';
  }).join('');

  $container.addEventListener('click', function (event) {
    const $target = event.target;

    if (!$target.matches('a')) {
      return;
    }

    event.preventDefault();

    const award = $target.dataset.award;
    const category = $target.dataset.category;
    const year = $target.dataset.year;
    const location = $target.dataset.location;

    if (award) {
      works.forEach(function ($work) {
        $work.hidden = award && $work.matches('[data-award=""]');
      });

      [].forEach.call($filters.querySelectorAll('[role="radio"]'), function ($radio) {
        $radio.setAttribute('aria-checked', !!$radio.dataset.award);
      });

      $title.textContent = '最優秀賞受賞作品';
    }

    if (category) {
      works.forEach(function ($work) {
        $work.hidden = category !== 'すべて' && !$work.matches('[data-categories~="' + category + '"]');
      });

      [].forEach.call($filters.querySelectorAll('[role="radio"]'), function ($radio) {
        $radio.setAttribute('aria-checked', $radio.dataset.category === category);
      });

      $title.textContent = category;
    }

    if (year) {
      works.forEach(function ($work) {
        $work.hidden = year !== 'すべて' && !$work.matches('[data-year="' + year + '"]');
      });

      [].forEach.call($filters.querySelectorAll('[role="radio"]'), function ($radio) {
        $radio.setAttribute('aria-checked', $radio.dataset.year === year);
      });

      $title.textContent = year;
    }

    if (location) {
      works.forEach(function ($work) {
        $work.hidden = location !== 'すべて' && !$work.matches('[data-location="' + location + '"]');
      });

      [].forEach.call($filters.querySelectorAll('[role="radio"]'), function ($radio) {
        $radio.setAttribute('aria-checked', $radio.dataset.location === location);
      });

      $title.textContent = location;
    }

    $filters.classList.remove('active');

    window.setTimeout(function () {
      $page_wrapper.scrollTo(0, 0);
      $works_container.focus();
    }, 100);
  });

  document.querySelector('#filter-button').addEventListener('click', function () {
    $filters.classList.add('active');
    $filters.focus();
  });
});