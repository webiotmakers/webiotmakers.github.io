window.addEventListener(
  'DOMContentLoaded',
  () => {
    const works = [];
    const filters = {};
    const awardMap = {};
    const categoryMap = {};
    const yearMap = {};
    const locationMap = {};
    const $fragment = document.createDocumentFragment();
    const $pageWrapper = document.querySelector('#main-pages');
    const $worksContainer = document.querySelector('#works-container');
    const $works = document.querySelector('#works-container > ul');
    const $title = document.querySelector('#works-container > h2');
    const $container = document.querySelector('#gallery-container');
    const $filters = document.querySelector('#filters');
    const $clearFilter = document.querySelector('#clear-filter');
    const $filterAward = $filters.querySelector('#filter-award ul');
    const $filterCategory = $filters.querySelector('#filter-category ul');
    const $filterYear = $filters.querySelector('#filter-year ul');
    const $filterLocation = $filters.querySelector('#filter-location ul');
    const sorter = (a, b) => b[0].localeCompare(a[1]);

    // Randomize the works
    for (;;) {
      if (!$works.children.length) {
        break;
      }

      const index = Math.floor(Math.random() * $works.children.length);
      // const index = 0; // Stop randomizing
      const child = $works.children[index];

      $fragment.appendChild(child);
      works.push(child);
    }

    $works.appendChild($fragment);

    works.forEach(($work) => {
      const { award, categories, year, location } = $work.dataset;
      const $img = $work.querySelector('img');

      categories.split(' ').forEach((cat) => {
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });

      awardMap[award] = (awardMap[award] || 0) + 1;
      yearMap[year] = (yearMap[year] || 0) + 1;
      locationMap[location] = (locationMap[location] || 0) + 1;

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

    $filterAward.innerHTML = ` \
      <li role="none"> \
        <a href="#" role="radio" aria-checked="true" data-award="">指定なし (${works.length})</a> \
      </li> \
      <li role="none"> \
        <a href="#" role="radio" aria-checked="false" data-award="最優秀賞"> \
          最優秀賞 (${works.filter((work) => work.dataset.award).length}) \
        </a> \
      </li> \
    `;

    $filterCategory.innerHTML = [
      `
        <li role="none"> \
          <a href="#" role="radio" aria-checked="true" data-category="">すべて (${works.length})</a> \
        </li> \
      `,
      ...Object.entries(categoryMap)
        .sort(sorter)
        .map(
          ([category, count]) => ` \
            <li role="none"> \
              <a href="#" role="radio" aria-checked="false" data-category="${category}"> \
                ${category} (${count}) \
              </a> \
            </li> \
          `,
        ),
    ].join('');

    $filterYear.innerHTML = [
      `
        <li role="none"> \
          <a href="#" role="radio" aria-checked="true" data-year="">すべて (${works.length})</a> \
        </li> \
      `,
      ...Object.entries(yearMap)
        .sort(sorter)
        .map(
          ([year, count]) => ` \
            <li role="none"> \
              <a href="#" role="radio" aria-checked="false" data-year="${year}"> \
                ${year} (${count}) \
              </a> \
            </li> \
          `,
        ),
    ].join('');

    $filterLocation.innerHTML = [
      `
        <li role="none"> \
          <a href="#" role="radio" aria-checked="true" data-location="">すべて (${works.length})</a> \
        </li> \
      `,
      ...Object.entries(locationMap)
        .sort(sorter)
        .map(
          ([location, count]) => ` \
            <li role="none"> \
              <a href="#" role="radio" aria-checked="false" data-location="${location}"> \
                ${location} (${count}) \
              </a> \
            </li> \
          `,
        ),
    ].join('');

    /**
     * Apply a filter to the work list, and update the view accordingly. Multiple filters like
     * year+location are not supported at this time.
     */
    const applyFilter = () => {
      const params = new URLSearchParams(window.location.search);
      const award = params.get('award') || undefined;
      const category = params.get('category') || undefined;
      const year = params.get('year') || undefined;
      const location = params.get('location') || undefined;
      const titleText = [];

      works.forEach(($work) => {
        // eslint-disable-next-line no-param-reassign
        $work.hidden =
          (award ? !$work.matches(`[data-award="${award}"]`) : false) ||
          (category ? !$work.matches(`[data-categories~="${category}"]`) : false) ||
          (year ? !$work.matches(`[data-year="${year}"]`) : false) ||
          (location ? !$work.matches(`[data-location="${location}"]`) : false);
      });

      if (award in awardMap) {
        titleText.push(award);
      }

      $filters.querySelectorAll('[role="radio"][data-award]').forEach(($radio) => {
        $radio.setAttribute('aria-checked', $radio.dataset.award === (award || ''));
      });

      if (category in categoryMap) {
        titleText.push(category);
      }

      $filters.querySelectorAll('[role="radio"][data-category]').forEach(($radio) => {
        $radio.setAttribute('aria-checked', $radio.dataset.category === (category || ''));
      });

      if (year in yearMap) {
        titleText.push(`${year} 年度`);
      }

      $filters.querySelectorAll('[role="radio"][data-year]').forEach(($radio) => {
        $radio.setAttribute('aria-checked', $radio.dataset.year === (year || ''));
      });

      if (location in locationMap) {
        titleText.push(location);
      }

      $filters.querySelectorAll('[role="radio"][data-location]').forEach(($radio) => {
        $radio.setAttribute('aria-checked', $radio.dataset.location === (location || ''));
      });

      $title.textContent = titleText.join(' / ');
      $clearFilter.hidden = !award && !category && !year && !location;
    };

    $container.addEventListener('click', (event) => {
      const $target = event.target;

      if (!$target.matches('a')) {
        return;
      }

      event.preventDefault();

      Object.entries($target.dataset).forEach(([key, value]) => {
        if (value) {
          filters[key] = value;
        } else {
          delete filters[key];
        }
      });

      const params = new URLSearchParams(JSON.parse(JSON.stringify(filters)));

      params.sort();
      window.history.replaceState({}, '', `?${params.toString()}`);
      window.dispatchEvent(new PopStateEvent('popstate'));

      $filters.classList.remove('active');

      window.setTimeout(() => {
        $pageWrapper.scrollTo(0, 0);
        $worksContainer.focus();
      }, 100);
    });

    document.querySelector('#filter-button').addEventListener('click', () => {
      $filters.classList.add('active');
      $filters.focus();
    });

    window.addEventListener('load', () => {
      applyFilter();
    });

    window.addEventListener('popstate', () => {
      applyFilter();
    });
  },
  { once: true },
);
