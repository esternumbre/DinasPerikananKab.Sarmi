document.addEventListener('DOMContentLoaded', () => {
    initializeDateTime();
    initializeMobileMenu();
    initializeProfileDrivenContent();
});

const PROFILE_DATA_PATH = 'assets/data/profil.json';
let slideIntervalId = null;
let refreshDateTime = null;
let activeLocale = 'id-ID';
let activeTimeZone = null;

function initializeDateTime() {
    const dateTimeElement = document.getElementById('date-time');
    if (!dateTimeElement) {
        refreshDateTime = () => {};
        return;
    }

    refreshDateTime = () => {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };

        if (activeTimeZone) {
            options.timeZone = activeTimeZone;
        }

        dateTimeElement.textContent = now.toLocaleString(activeLocale, options);
    };

    refreshDateTime();
    setInterval(refreshDateTime, 1000);
}

function initializeMobileMenu() {
    const menuButton = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!menuButton || !mobileMenu) {
        return;
    }

    menuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

async function initializeProfileDrivenContent() {
    try {
        const response = await fetch(PROFILE_DATA_PATH, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} saat memuat ${PROFILE_DATA_PATH}`);
        }

        const profile = await response.json();
        applyProfile(profile);
    } catch (error) {
        console.error('Gagal memuat profil.json:', error);
    }
}

function applyProfile(profile) {
    if (!profile || typeof profile !== 'object') {
        return;
    }

    if (profile.site?.language) {
        document.documentElement.lang = profile.site.language;
        activeLocale = profile.site.language === 'id' ? 'id-ID' : profile.site.language;
    }

    if (profile.site?.timezone) {
        activeTimeZone = profile.site.timezone;
    }

    if (profile.site?.title) {
        document.title = profile.site.title;
    }

    if (typeof refreshDateTime === 'function') {
        refreshDateTime();
    }

    applyBindingAttributes(profile);
    applyFavicon(profile.branding?.favicon);
    renderHeroSection(profile.hero, profile);
    renderServicesSection(profile.sections?.services);
    renderNewsSection(profile.sections?.news);
    renderAboutSection(profile.sections?.about);
    renderGallerySection(profile.sections?.gallery);
    renderCtaSection(profile.sections?.cta);
    renderFooterSection(profile.footer);
}

function applyBindingAttributes(profile) {
    document.querySelectorAll('[data-bind-text]').forEach((element) => {
        const path = element.getAttribute('data-bind-text');
        const value = getValueByPath(profile, path);
        if (value !== undefined && value !== null) {
            element.textContent = String(value);
        }
    });

    document.querySelectorAll('[data-bind-href]').forEach((element) => {
        const path = element.getAttribute('data-bind-href');
        const value = getValueByPath(profile, path);
        if (value) {
            element.setAttribute('href', String(value));
        }
    });

    document.querySelectorAll('[data-bind-src]').forEach((element) => {
        const path = element.getAttribute('data-bind-src');
        const value = getValueByPath(profile, path);
        if (value) {
            element.setAttribute('src', String(value));
        }
    });

    document.querySelectorAll('[data-bind-alt]').forEach((element) => {
        const path = element.getAttribute('data-bind-alt');
        const value = getValueByPath(profile, path);
        if (value !== undefined && value !== null) {
            element.setAttribute('alt', String(value));
        }
    });
}

function applyFavicon(faviconPath) {
    if (!faviconPath) {
        return;
    }

    ['favicon-main', 'favicon-shortcut'].forEach((id) => {
        const faviconElement = document.getElementById(id);
        if (faviconElement) {
            faviconElement.setAttribute('href', faviconPath);
        }
    });
}

function renderHeroSection(heroConfig, profile) {
    const slidesContainer = document.getElementById('hero-slides');
    const dotsContainer = document.getElementById('hero-dots');
    if (!slidesContainer || !dotsContainer) {
        return;
    }

    slidesContainer.innerHTML = '';
    dotsContainer.innerHTML = '';

    const baseSlides = Array.isArray(heroConfig?.slides) ? heroConfig.slides : [];
    const slides = baseSlides.length > 0
        ? baseSlides
        : [{
            background: '',
            badge: 'Portal Resmi',
            title: profile?.client?.full_name || 'Instansi Pemerintah',
            description: profile?.client?.tagline || '',
            logo_caption: profile?.client?.full_name || profile?.client?.name || 'Instansi'
        }];

    const heroLogoFallback = profile?.branding?.hero_logo || profile?.branding?.logo || '';
    const orgName = profile?.client?.full_name || profile?.client?.name || 'Instansi';

    slides.forEach((slide, index) => {
        const slideElement = createHeroSlide(slide, index, heroLogoFallback, orgName);
        slidesContainer.appendChild(slideElement);

        const dotElement = document.createElement('button');
        dotElement.type = 'button';
        dotElement.className = `slide-dot w-3 h-3 rounded-full transition ${index === 0 ? 'active bg-white/90' : 'bg-white/40 hover:bg-white/70'}`;
        dotElement.setAttribute('aria-label', `Slide ${index + 1}`);
        dotsContainer.appendChild(dotElement);
    });

    const autoplayMs = Number(heroConfig?.autoplay_ms) || 5000;
    initializeSliderControls(autoplayMs);
}

function createHeroSlide(slide, index, logoFallback, orgName) {
    const slideElement = document.createElement('div');
    slideElement.className = `slide absolute inset-0 ${index === 0 ? 'active' : ''}`;
    slideElement.style.backgroundImage = `url('${slide.background || ''}')`;
    slideElement.style.backgroundSize = 'cover';
    slideElement.style.backgroundPosition = 'center';

    const overlay = document.createElement('div');
    overlay.className = 'absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/65';
    slideElement.appendChild(overlay);

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

    const contentGrid = document.createElement('div');
    contentGrid.className = 'grid lg:grid-cols-12 gap-10 items-center h-full';

    const leftColumn = document.createElement('div');
    leftColumn.className = 'lg:col-span-8 text-white max-w-3xl';

    if (slide.badge) {
        const badge = document.createElement('span');
        badge.className = 'inline-flex items-center px-4 py-1.5 rounded-full text-xs tracking-[0.2em] uppercase bg-white/15 backdrop-blur-sm border border-white/25 mb-6';
        badge.textContent = slide.badge;
        leftColumn.appendChild(badge);
    }

    const title = document.createElement('h1');
    title.className = 'text-4xl md:text-5xl xl:text-6xl font-extrabold leading-tight mb-6';
    title.textContent = slide.title || orgName;
    leftColumn.appendChild(title);

    const description = document.createElement('p');
    description.className = 'text-lg md:text-xl text-blue-50 leading-relaxed mb-8';
    description.textContent = slide.description || '';
    leftColumn.appendChild(description);

    const actions = document.createElement('div');
    actions.className = 'flex flex-wrap gap-4';

    if (slide.primary_cta?.label) {
        actions.appendChild(
            createLinkButton(
                slide.primary_cta,
                'inline-flex items-center justify-center px-7 py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-full font-semibold transition shadow-lg shadow-blue-900/30'
            )
        );
    }

    if (slide.secondary_cta?.label) {
        actions.appendChild(
            createLinkButton(
                slide.secondary_cta,
                'inline-flex items-center justify-center px-7 py-3 border border-white/70 text-white rounded-full font-semibold hover:bg-white hover:text-blue-900 transition'
            )
        );
    }

    if (actions.childElementCount > 0) {
        leftColumn.appendChild(actions);
    }

    const rightColumn = document.createElement('div');
    rightColumn.className = 'lg:col-span-4 flex justify-center lg:justify-end';

    const logoCard = document.createElement('div');
    logoCard.className = 'w-full max-w-xs bg-white/10 border border-white/25 backdrop-blur-md rounded-3xl p-6 text-center text-white shadow-2xl';

    const logoImage = document.createElement('img');
    logoImage.className = 'w-44 h-44 xl:w-56 xl:h-56 object-contain mx-auto drop-shadow-[0_18px_24px_rgba(0,0,0,0.3)]';
    logoImage.src = slide.logo || logoFallback;
    logoImage.alt = slide.logo_alt || orgName;
    logoCard.appendChild(logoImage);

    const logoCaption = document.createElement('p');
    logoCaption.className = 'mt-4 text-sm text-blue-100 font-medium';
    logoCaption.textContent = slide.logo_caption || orgName;
    logoCard.appendChild(logoCaption);

    rightColumn.appendChild(logoCard);

    contentGrid.appendChild(leftColumn);
    contentGrid.appendChild(rightColumn);
    contentWrapper.appendChild(contentGrid);
    slideElement.appendChild(contentWrapper);

    return slideElement;
}

function initializeSliderControls(autoplayMs) {
    const slides = Array.from(document.querySelectorAll('#hero-slides .slide'));
    const dots = Array.from(document.querySelectorAll('#hero-dots .slide-dot'));
    const dotsContainer = document.getElementById('hero-dots');
    const nextButton = document.getElementById('next-slide');
    const prevButton = document.getElementById('prev-slide');

    if (slideIntervalId) {
        clearInterval(slideIntervalId);
        slideIntervalId = null;
    }

    if (slides.length === 0 || dots.length === 0) {
        return;
    }

    let currentSlide = 0;

    const showSlide = (index) => {
        slides.forEach((slide) => slide.classList.remove('active'));
        dots.forEach((dot) => {
            dot.classList.remove('active', 'bg-white/90');
            dot.classList.add('bg-white/40');
        });

        slides[index].classList.add('active');
        dots[index].classList.add('active', 'bg-white/90');
        dots[index].classList.remove('bg-white/40');
        currentSlide = index;
    };

    const nextSlide = () => showSlide((currentSlide + 1) % slides.length);
    const prevSlide = () => showSlide((currentSlide - 1 + slides.length) % slides.length);

    if (nextButton) {
        nextButton.onclick = nextSlide;
    }
    if (prevButton) {
        prevButton.onclick = prevSlide;
    }

    dots.forEach((dot, index) => {
        dot.onclick = () => showSlide(index);
    });

    const hasMultipleSlides = slides.length > 1;
    if (nextButton) {
        nextButton.classList.toggle('hidden', !hasMultipleSlides);
    }
    if (prevButton) {
        prevButton.classList.toggle('hidden', !hasMultipleSlides);
    }
    if (dotsContainer) {
        dotsContainer.classList.toggle('hidden', !hasMultipleSlides);
    }

    if (hasMultipleSlides && autoplayMs > 0) {
        slideIntervalId = setInterval(nextSlide, autoplayMs);
    }
}

function renderServicesSection(servicesConfig) {
    setTextById('services-title', servicesConfig?.title);
    setTextById('services-subtitle', servicesConfig?.subtitle);

    const servicesGrid = document.getElementById('services-grid');
    if (!servicesGrid) {
        return;
    }

    servicesGrid.innerHTML = '';
    const items = Array.isArray(servicesConfig?.items) ? servicesConfig.items : [];

    items.forEach((item) => {
        const card = document.createElement('article');
        card.className = 'interactive-card text-center bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md hover:shadow-xl border border-white/60';

        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4';

        const icon = document.createElement('i');
        icon.className = `${item.icon || 'fa-solid fa-circle-info'} text-2xl text-blue-700`;
        iconWrapper.appendChild(icon);
        card.appendChild(iconWrapper);

        const title = document.createElement('h3');
        title.className = 'text-xl font-semibold text-slate-900 mb-2';
        title.textContent = item.title || '';
        card.appendChild(title);

        const description = document.createElement('p');
        description.className = 'text-slate-600 text-sm leading-relaxed';
        description.textContent = item.description || '';
        card.appendChild(description);

        if (item.link) {
            const link = document.createElement('a');
            link.href = item.link;
            link.className = 'inline-block mt-4 text-sm font-semibold text-blue-800 hover:underline';
            link.textContent = item.link_label || 'Lihat Detail';
            card.appendChild(link);
        }

        servicesGrid.appendChild(card);
    });
}

function renderNewsSection(newsConfig) {
    setTextById('news-title', newsConfig?.title);
    setTextById('news-subtitle', newsConfig?.subtitle);
    setLinkById('news-all-link', newsConfig?.all_href, newsConfig?.all_label);

    const newsGrid = document.getElementById('news-grid');
    if (!newsGrid) {
        return;
    }

    newsGrid.innerHTML = '';
    const items = Array.isArray(newsConfig?.items) ? newsConfig.items : [];

    items.forEach((item) => {
        const card = document.createElement('article');
        card.className = 'interactive-card bg-white/85 rounded-2xl overflow-hidden border border-white/70 shadow-md hover:shadow-xl';

        const cover = document.createElement('img');
        cover.src = item.image || '';
        cover.alt = item.title || 'Gambar berita';
        cover.className = 'w-full h-48 object-cover';
        card.appendChild(cover);

        const content = document.createElement('div');
        content.className = 'p-6';

        if (item.date) {
            const date = document.createElement('p');
            date.className = 'text-xs text-blue-800 font-semibold mb-3 tracking-wide uppercase';
            date.textContent = item.date;
            content.appendChild(date);
        }

        const title = document.createElement('h3');
        title.className = 'text-xl font-bold text-slate-900 leading-snug mb-3';
        title.textContent = item.title || '';
        content.appendChild(title);

        const excerpt = document.createElement('p');
        excerpt.className = 'text-slate-600 text-sm leading-relaxed mb-4';
        excerpt.textContent = item.excerpt || '';
        content.appendChild(excerpt);

        if (item.href) {
            const link = document.createElement('a');
            link.href = item.href;
            link.className = 'text-blue-900 font-semibold hover:underline';
            link.textContent = item.link_label || 'Baca Selengkapnya →';
            content.appendChild(link);
        }

        card.appendChild(content);
        newsGrid.appendChild(card);
    });
}

function renderAboutSection(aboutConfig) {
    setTextById('about-title', aboutConfig?.title);
    setActionButtonById('about-primary-cta', aboutConfig?.primary_cta);
    setActionButtonById('about-secondary-cta', aboutConfig?.secondary_cta);

    const paragraphContainer = document.getElementById('about-paragraphs');
    if (paragraphContainer) {
        paragraphContainer.innerHTML = '';
        const paragraphs = Array.isArray(aboutConfig?.paragraphs) ? aboutConfig.paragraphs : [];
        paragraphs.forEach((paragraph) => {
            const item = document.createElement('p');
            item.className = 'text-slate-600 leading-relaxed';
            item.textContent = paragraph;
            paragraphContainer.appendChild(item);
        });
    }

    const highlightContainer = document.getElementById('about-highlights');
    if (highlightContainer) {
        highlightContainer.innerHTML = '';
        const highlights = Array.isArray(aboutConfig?.highlights) ? aboutConfig.highlights : [];
        highlights.forEach((highlight) => {
            const row = document.createElement('div');
            row.className = 'flex items-start gap-4';

            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0';
            const icon = document.createElement('i');
            icon.className = `${highlight.icon || 'fa-solid fa-check'} text-lg`;
            iconWrapper.appendChild(icon);
            row.appendChild(iconWrapper);

            const textWrapper = document.createElement('div');
            const title = document.createElement('h4');
            title.className = 'font-semibold text-lg';
            title.textContent = highlight.title || '';
            textWrapper.appendChild(title);

            const description = document.createElement('p');
            description.className = 'text-sm text-blue-100 mt-1 leading-relaxed';
            description.textContent = highlight.description || '';
            textWrapper.appendChild(description);

            row.appendChild(textWrapper);
            highlightContainer.appendChild(row);
        });
    }
}

function renderGallerySection(galleryConfig) {
    setTextById('gallery-title', galleryConfig?.title);
    setTextById('gallery-subtitle', galleryConfig?.subtitle);
    setLinkById('gallery-all-link', galleryConfig?.all_href, galleryConfig?.all_label);

    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) {
        return;
    }

    galleryGrid.innerHTML = '';
    const items = Array.isArray(galleryConfig?.items) ? galleryConfig.items : [];

    items.forEach((item) => {
        const card = document.createElement('article');
        card.className = 'interactive-card rounded-2xl overflow-hidden bg-white/80 shadow-md hover:shadow-xl border border-white/70';

        const coverWrapper = document.createElement('div');
        coverWrapper.className = 'relative aspect-[4/5] overflow-hidden';

        const image = document.createElement('img');
        image.src = item.image || '';
        image.alt = item.title || 'Album galeri';
        image.className = 'w-full h-full object-cover';
        coverWrapper.appendChild(image);

        const badge = document.createElement('span');
        badge.className = 'absolute top-3 right-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-black/65 text-white';
        const total = Number(item.total) || 0;
        badge.textContent = `${total} ${item.total_label || 'Foto'}`;
        coverWrapper.appendChild(badge);

        card.appendChild(coverWrapper);

        const content = document.createElement('div');
        content.className = 'p-4';
        const title = document.createElement('h3');
        title.className = 'font-semibold text-slate-900';
        title.textContent = item.title || '';
        content.appendChild(title);

        if (item.href) {
            const link = document.createElement('a');
            link.href = item.href;
            link.className = 'inline-flex mt-2 text-sm text-blue-800 font-semibold hover:underline';
            link.textContent = item.link_label || 'Lihat Album';
            content.appendChild(link);
        }

        card.appendChild(content);
        galleryGrid.appendChild(card);
    });
}

function renderCtaSection(ctaConfig) {
    setTextById('cta-title', ctaConfig?.title);
    setTextById('cta-subtitle', ctaConfig?.subtitle);
    setActionButtonById('cta-button', ctaConfig?.button);
}

function renderFooterSection(footerConfig) {
    setTextById('footer-org-name', footerConfig?.organization_name);
    setTextById('footer-tagline', footerConfig?.tagline);
    setTextById('footer-copyright', footerConfig?.copyright);
    setActionButtonById('footer-powered-link', footerConfig?.powered_by);

    renderFooterMenu('footer-nav-menu', footerConfig?.menus?.navigation);
    renderFooterMenu('footer-public-menu', footerConfig?.menus?.public_info);
    renderFooterMenu('footer-service-menu', footerConfig?.menus?.quick_services);
}

function renderFooterMenu(targetId, items) {
    const menu = document.getElementById(targetId);
    if (!menu) {
        return;
    }

    menu.innerHTML = '';
    const list = Array.isArray(items) ? items : [];

    list.forEach((item) => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = item.href || '#';
        link.className = 'hover:text-white transition';
        link.textContent = item.label || '';
        li.appendChild(link);
        menu.appendChild(li);
    });
}

function createLinkButton(config, className) {
    const link = document.createElement('a');
    link.href = config?.href || '#';
    link.textContent = config?.label || '';
    link.className = className;
    return link;
}

function setTextById(id, value) {
    const element = document.getElementById(id);
    if (!element || value === undefined || value === null) {
        return;
    }
    element.textContent = String(value);
}

function setLinkById(id, href, label) {
    const element = document.getElementById(id);
    if (!element) {
        return;
    }

    if (href) {
        element.setAttribute('href', String(href));
    }
    if (label !== undefined && label !== null) {
        element.textContent = String(label);
    }
}

function setActionButtonById(id, config) {
    if (!config || typeof config !== 'object') {
        return;
    }
    setLinkById(id, config.href, config.label);
}

function getValueByPath(source, path) {
    if (!source || !path) {
        return undefined;
    }

    return path.split('.').reduce((currentValue, key) => {
        if (currentValue && Object.prototype.hasOwnProperty.call(currentValue, key)) {
            return currentValue[key];
        }
        return undefined;
    }, source);
}
