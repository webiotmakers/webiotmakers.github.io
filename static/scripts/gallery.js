window.addEventListener(
  'DOMContentLoaded',
  () => {
    const _categories = {};
    const _years = {};
    const _locations = {};
    const $fragment = document.createDocumentFragment();
    const works = [];
    const $pageWrapper = document.querySelector('#main-pages');
    const $worksContainer = document.querySelector('#works-container');
    const $works = document.querySelector('#works-container > ul');
    const $title = document.querySelector('#works-container > h2');
    const $container = document.querySelector('#gallery-container');
    const $filters = document.querySelector('#filters');
    const $filterGeneral = $filters.querySelector('#filter-general ul');
    const $filterCategories = $filters.querySelector('#filter-categories ul');
    const $filterYears = $filters.querySelector('#filter-years ul');
    const $filterLocations = $filters.querySelector('#filter-locations ul');
    const sorter = (a, b) => a[0] > b[0];

    // Randomize the works
    for (;;) {
      if (!$works.children.length) {
        break;
      }

      const index = Math.floor(Math.random() * $works.children.length);
      const child = $works.children[index];

      $fragment.appendChild(child);
      works.push(child);
    }

    $works.appendChild($fragment);

    works.forEach(($work) => {
      const { categories, year, location } = $work.dataset;
      const $img = $work.querySelector('img');

      categories.split(' ').forEach((cat) => {
        _categories[cat] = (_categories[cat] || 0) + 1;
      });

      _years[year] = (_years[year] || 0) + 1;
      _locations[location] = (_locations[location] || 0) + 1;

      // Lazy load images
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > 0) {
            observer.disconnect();
            $img.src = $img.dataset.src;
          }
        });
      });

      observer.observe($img);
    });

    $filterGeneral.innerHTML = ` \
      <li role="none"> \
        <a href="#" role="radio" aria-checked="true" data-category="すべて"> \
          すべて (${works.length}) \
        </a> \
      </li> \
      <li role="none"> \
        <a href="#" role="radio" aria-checked="false" data-award="*"> \
          最優秀賞受賞作品 (${works.filter((work) => work.dataset.award).length}) \
        </a> \
      </li> \
    `;

    $filterCategories.innerHTML = Object.entries(_categories)
      .sort(sorter)
      .map(
        ([category, count]) => ` \
          <li role="none"> \
            <a href="#" role="radio" aria-checked="false" data-category="${category}"> \
              ${category} (${count}) \
            </a> \
          </li> \
        `,
      )
      .join('');

    $filterYears.innerHTML = Object.entries(_years)
      .sort(sorter)
      .map(
        ([year, count]) => ` \
          <li role="none"> \
            <a href="#" role="radio" aria-checked="false" data-year="${year}"> \
              ${year} (${count}) \
            </a> \
          </li> \
        `,
      )
      .join('');

    $filterLocations.innerHTML = Object.entries(_locations)
      .sort(sorter)
      .map(
        ([location, count]) => ` \
          <li role="none"> \
            <a href="#" role="radio" aria-checked="false" data-location="${location}"> \
              ${location} (${count}) \
            </a> \
          </li> \
        `,
      )
      .join('');

    /**
     * Replace the current URL with the given search params.
     * @param {Object} init Params.
     */
    const updateLocation = (init) => {
      window.history.replaceState({}, '', `?${new URLSearchParams(init).toString()}`);
    };

    /**
     * Apply a filter to the work list, and update the view accordingly. Multiple filters like
     * year+location are not supported at this time.
     * @param {Object} filter Filtering condition in the form of key-value pairs, where keys are
     * `award`, `category`, `year` and `location`.
     */
    const applyFilter = ({ award, category, year, location }) => {
      if (award) {
        works.forEach(($work) => {
          // eslint-disable-next-line no-param-reassign
          $work.hidden = award && $work.matches('[data-award=""]');
        });

        $filters.querySelectorAll('[role="radio"]').forEach(($radio) => {
          $radio.setAttribute('aria-checked', !!$radio.dataset.award);
        });

        $title.textContent = '最優秀賞受賞作品';
        updateLocation({ award: '最優秀賞' });

        return;
      }

      if (category) {
        works.forEach(($work) => {
          // eslint-disable-next-line no-param-reassign
          $work.hidden =
            category !== 'すべて' && !$work.matches(`[data-categories~="${category}"]`);
        });

        $filters.querySelectorAll('[role="radio"]').forEach(($radio) => {
          $radio.setAttribute('aria-checked', $radio.dataset.category === category);
        });

        $title.textContent = category;
        updateLocation({ category });

        return;
      }

      if (year) {
        works.forEach(($work) => {
          // eslint-disable-next-line no-param-reassign
          $work.hidden = year !== 'すべて' && !$work.matches(`[data-year="${year}"]`);
        });

        $filters.querySelectorAll('[role="radio"]').forEach(($radio) => {
          $radio.setAttribute('aria-checked', $radio.dataset.year === year);
        });

        $title.textContent = `${year} 年度`;
        updateLocation({ year });

        return;
      }

      if (location) {
        works.forEach(($work) => {
          // eslint-disable-next-line no-param-reassign
          $work.hidden = location !== 'すべて' && !$work.matches(`[data-location="${location}"]`);
        });

        $filters.querySelectorAll('[role="radio"]').forEach(($radio) => {
          $radio.setAttribute('aria-checked', $radio.dataset.location === location);
        });

        $title.textContent = location;
        updateLocation({ location });
      }
    };

    $container.addEventListener('click', (event) => {
      const $target = event.target;

      if (!$target.matches('a')) {
        return;
      }

      const { award, category, year, location } = $target.dataset;

      event.preventDefault();
      applyFilter({ award, category, year, location });
      $filters.classList.remove('active');

      window.setTimeout(() => {
        $pageWrapper.scrollTo(0, 0);
        $worksContainer.focus();
      }, 100);
    });

    window.addEventListener(
      'load',
      () => {
        const params = new URLSearchParams(window.location.search);

        applyFilter({
          award: params.get('award'),
          category: params.get('category'),
          year: params.get('year'),
          location: params.get('location'),
        });
      },
      { once: true },
    );

    document.querySelector('#filter-button').addEventListener('click', () => {
      $filters.classList.add('active');
      $filters.focus();
    });
  },
  { once: true },
);
