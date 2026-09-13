(() => {
  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('#site-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuButton.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
      });
    });
  }

  const get = (obj, path) =>
    path.split('.').reduce((value, key) => {
      if (value == null) return undefined;
      return /^\d+$/.test(key) ? value[Number(key)] : value[key];
    }, obj);

  const setLines = (el, value) => {
    if (!el || typeof value !== 'string') return;
    el.innerHTML = '';
    value.split('\n').forEach((line, index, arr) => {
      el.append(document.createTextNode(line));
      if (index < arr.length - 1) el.append(document.createElement('br'));
    });
  };

  const applyContent = (data) => {
    if (!data) return;

    if (data.seo?.title) {
      document.title = data.seo.title;
      const titleEl = document.querySelector('#seo-title');
      if (titleEl) titleEl.textContent = data.seo.title;
    }
    if (data.seo?.description) {
      const meta = document.querySelector('#seo-description');
      if (meta) meta.setAttribute('content', data.seo.description);
    }

    document.querySelectorAll('[data-cms]').forEach((el) => {
      const value = get(data, el.dataset.cms);
      if (value !== undefined && value !== null) el.textContent = String(value);
    });

    document.querySelectorAll('[data-cms-lines]').forEach((el) => {
      const value = get(data, el.dataset.cmsLines);
      setLines(el, value);
    });

    document.querySelectorAll('[data-cms-href]').forEach((el) => {
      const value = get(data, el.dataset.cmsHref);
      if (value) el.setAttribute('href', value);
    });

    document.querySelectorAll('[data-cms-image]').forEach((el) => {
      const value = get(data, el.dataset.cmsImage);
      if (value) el.setAttribute('src', value);
    });

    const pillRow = document.querySelector('#cms-x-pills');
    if (pillRow && Array.isArray(data.coverage?.x?.pills)) {
      pillRow.innerHTML = data.coverage.x.pills.map((item) => `<span>${escapeHtml(item)}</span>`).join('');
    }

    const tags = document.querySelector('#cms-about-tags');
    if (tags && Array.isArray(data.about?.tags)) {
      tags.innerHTML = data.about.tags.map((item) => `<span>${escapeHtml(item)}</span>`).join('');
    }

    const deck = document.querySelector('#cms-ondeck-items');
    if (deck && Array.isArray(data.ondeck?.items)) {
      deck.innerHTML = data.ondeck.items.map((item) => `
        <div class="deck-item">
          <span>${escapeHtml(item.number || '')}</span>
          <strong>${escapeHtml(item.title || '')}</strong>
          <em>${escapeHtml(item.status || '')}</em>
        </div>`).join('');
    }
  };

  const escapeHtml = (value) =>
    String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  fetch('site.json', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(`site.json returned ${response.status}`);
      return response.json();
    })
    .then(applyContent)
    .catch((error) => {
      console.warn('Diamond GCU CMS content could not be loaded; using HTML fallback.', error);
    });
})();