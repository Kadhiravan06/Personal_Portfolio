document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  loadSkills();
  loadProjects();
  loadCertifications();
  initContactForm();
  initScrollSpy();
});

function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('portfolio-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = storedTheme || (prefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('portfolio-theme', newTheme);
    });
  }
}

function initMobileNav() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navMenu) {
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-controls', 'nav-menu');

    mobileToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', String(open));
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

async function loadSkills() {
  const container = document.getElementById('skills-container');
  if (!container) return;

  try {
    const res = await fetch('/api/skills');
    if (!res.ok) throw new Error('Failed to fetch skills');
    const groupedSkills = await res.json();

    container.innerHTML = '';

    for (const [category, skills] of Object.entries(groupedSkills)) {
      const card = document.createElement('div');
      card.className = 'skill-category-card';

      const title = document.createElement('h3');
      title.className = 'skill-category-title';
      title.innerHTML = `
        <span>${escapeHtml(category)}</span>
        <span class="skill-count-badge">${skills.length}</span>
      `;

      const chipsBox = document.createElement('div');
      chipsBox.className = 'chips-container';

      skills.forEach((skill) => {
        const chip = document.createElement('div');
        chip.className = 'skill-chip';
        chip.innerHTML = `
          <div class="skill-chip-head">
            <span class="skill-name">${escapeHtml(skill.name)}</span>
            <span class="skill-level-label">${escapeHtml(skill.level)}</span>
          </div>
          <span class="probability-bar" aria-hidden="true">
            <span style="--probability: ${levelToProbability(skill.level)}%"></span>
          </span>
        `;
        chipsBox.appendChild(chip);
      });

      card.appendChild(title);
      card.appendChild(chipsBox);
      container.appendChild(card);
    }

    announceRendered('skills');
  } catch (err) {
    container.innerHTML = `
      <div class="loading-state">
        <p class="alert alert-error">Unable to load skills from database. Please ensure backend is running.</p>
      </div>
    `;
  }
}

async function loadProjects() {
  const container = document.getElementById('projects-container');
  if (!container) return;

  try {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('Failed to fetch projects');
    const projects = await res.json();

    container.innerHTML = '';

    projects.forEach((p) => {
      const card = document.createElement('div');
      const rarity = ['common', 'rare', 'epic', 'legendary'][(p.id - 1) % 4];
      card.className = `project-card rarity-${rarity}`;

      const techBadges = (Array.isArray(p.tech_stack) ? p.tech_stack : [])
        .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
        .join('');

      const isPlaceholder = !p.github_url || p.github_url.includes('placeholder');
      const githubLinkHtml = isPlaceholder
        ? `<a href="${escapeHtml(p.github_url || '#')}" class="btn btn-secondary btn-sm" title="Marked placeholder link until exact repository URL is added">
            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 14px; height: 14px;">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub (Placeholder)
          </a>`
        : `<a href="${escapeHtml(p.github_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 14px; height: 14px;">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>`;

      card.innerHTML = `
        <div>
          <div class="project-header">
            <span class="project-badge">Project #${p.id}</span>
            <h3 class="project-title">${escapeHtml(p.title)}</h3>
          </div>
          <p class="project-desc">${escapeHtml(p.description)}</p>
          <div class="project-part">
            <strong>My Contribution:</strong> ${escapeHtml(p.my_part)}
          </div>
          <div class="project-tags">
            ${techBadges}
          </div>
        </div>
        <div class="project-footer">
          ${githubLinkHtml}
        </div>
      `;

      container.appendChild(card);
    });

    const upcomingCard = document.createElement('div');
    upcomingCard.className = 'project-card project-upcoming';
    upcomingCard.innerHTML = `
      <div class="upcoming-icon" aria-hidden="true">🚀</div>
      <h3 class="upcoming-title">More projects coming soon</h3>
      <p class="upcoming-desc">Currently adding weekly projects from the Thiranex Full Stack Development internship.</p>
    `;
    container.appendChild(upcomingCard);

    announceRendered('projects');
  } catch (err) {
    container.innerHTML = `
      <div class="loading-state">
        <p class="alert alert-error">Unable to load projects from database. Please ensure backend is running.</p>
      </div>
    `;
  }
}

let allCertifications = [];

async function loadCertifications() {
  const container = document.getElementById('certifications-container');
  if (!container) return;

  try {
    const res = await fetch('/api/certifications');
    if (!res.ok) throw new Error('Failed to fetch certifications');
    allCertifications = await res.json();

    renderCertifications(allCertifications);
    setupCertificationFilters();
  } catch (err) {
    container.innerHTML = `
      <div class="loading-state">
        <p class="alert alert-error">Unable to load certifications from database. Please ensure backend is running.</p>
      </div>
    `;
  }
}

function renderCertifications(certs) {
  const container = document.getElementById('certifications-container');
  if (!container) return;

  container.innerHTML = '';

  if (certs.length === 0) {
    container.innerHTML = `
      <div class="loading-state">
        <p>No items found for this category.</p>
      </div>
    `;
    return;
  }

  certs.forEach((c) => {
    const card = document.createElement('div');
    card.className = 'cert-card';

    const typeBadgeClass = c.type === 'hackathon'
      ? 'badge-hackathon'
      : c.type === 'workshop'
        ? 'badge-workshop'
        : 'badge-certificate';

    const isPlaceholder = !c.verify_url || c.verify_url.includes('placeholder');
    const buttonHtml = isPlaceholder
      ? `<a href="${escapeHtml(c.verify_url || '#')}" class="btn btn-secondary btn-sm" title="Marked placeholder verification link">
          Verification Link (Placeholder)
        </a>`
      : `<a href="${escapeHtml(c.verify_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
          Verify Credential
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>`;

    card.innerHTML = `
      <div>
        <span class="cert-badge ${typeBadgeClass}">${escapeHtml(c.type)}</span>
        <h3 class="cert-title">${escapeHtml(c.title)}</h3>
        <p class="cert-issuer">${escapeHtml(c.issuer)}</p>
        <p class="cert-date">${escapeHtml(c.issued_on)}</p>
        <p class="cert-details">${escapeHtml(c.details)}</p>
      </div>
      <div class="cert-footer">
        ${buttonHtml}
      </div>
    `;

    container.appendChild(card);
  });

  announceRendered('certifications');
}

function setupCertificationFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      if (filter === 'all') {
        renderCertifications(allCertifications);
      } else {
        const filtered = allCertifications.filter((c) => c.type === filter);
        renderCertifications(filtered);
      }
    });
  });
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  const alertBox = document.getElementById('form-alert');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn?.querySelector('.btn-text');
  const btnSpinner = submitBtn?.querySelector('.btn-spinner');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || name.length < 2) {
      showAlert('Please enter your name (at least 2 characters).', 'error');
      form.name.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showAlert('Please enter a valid email address.', 'error');
      form.email.focus();
      return;
    }

    if (!message || message.length < 5) {
      showAlert('Please enter a message (at least 5 characters).', 'error');
      form.message.focus();
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit message.');
      }

      showAlert(data.message || 'Thank you! Your message has been saved to the database.', 'success');
      form.reset();
      document.dispatchEvent(new CustomEvent('portfolio:contact-success'));
    } catch (err) {
      showAlert(err.message || 'Error submitting message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  });

  function showAlert(msg, type) {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.className = `alert alert-${type}`;
    alertBox.classList.remove('hidden');
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    if (btnText) btnText.textContent = isLoading ? 'Sending...' : 'Send Message';
    if (btnSpinner) btnSpinner.classList.toggle('hidden', !isLoading);
  }
}

function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const hudSection = document.getElementById('hud-section');

  if (!sections.length || !('IntersectionObserver' in window)) return;

  const setCurrent = (id) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    const section = document.getElementById(id);
    const label = section?.querySelector('.scenario-label')?.textContent.replace(/\s+/g, ' ').trim();
    if (hudSection && label) {
      hudSection.textContent = label.replace('■', '').trim();
    }
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setCurrent(entry.target.id);
    });
  }, { rootMargin: '-42% 0px -52% 0px', threshold: 0 });

  sections.forEach((section) => observer.observe(section));
}

function levelToProbability(level) {
  if (!level) return 50;
  if (/hackathon/i.test(level)) return 82;
  if (/working knowledge/i.test(level)) return 72;
  if (/basics/i.test(level)) return 55;
  if (/beginner to/i.test(level)) return 58;
  if (/beginner/i.test(level)) return 45;
  return 60;
}

function announceRendered(type) {
  document.dispatchEvent(new CustomEvent('portfolio:rendered', { detail: { type } }));
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}