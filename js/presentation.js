/**
 * PRESENTATION ENGINE & DYNAMIC SLIDE LOADER
 */
let currentSlide = 0;
let slides = [];
let totalSlides = 0;
let counterEl = null;
let headerTagEl = null;
let headerTitleEl = null;
let progressBarEl = null;

const slideFiles = [
  'slides/slide_01.html',
  'slides/slide_02.html',
  'slides/slide_03.html',
  'slides/slide_04.html',
  'slides/slide_05.html',
  'slides/slide_06.html',
  'slides/slide_07.html',
  'slides/slide_08.html',
  'slides/slide_09.html',
  'slides/slide_10.html',
  'slides/slide_11.html',
  'slides/slide_12.html',
  'slides/slide_13.html',
  'slides/slide_14.html',
  'slides/slide_15.html',
  'slides/slide_16.html',
  'slides/slide_17.html',
  'slides/slide_18.html',
  'slides/slide_19.html',
  'slides/slide_20.html'
];

async function loadSlides() {
  const container = document.getElementById('slide-container');
  if (!container) return;

  try {
    const timestamp = Date.now();
    const fetchPromises = slideFiles.map(file =>
      fetch(`${file}?v=${timestamp}`, { cache: 'no-cache' }).then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.text();
      })
    );

    const htmlContents = await Promise.all(fetchPromises);
    container.innerHTML = htmlContents.join('\n');

    // Make sure slide 1 has active class if none specified
    const loadedSlides = container.querySelectorAll('.slide');
    if (loadedSlides.length > 0 && !container.querySelector('.slide.active')) {
      loadedSlides[0].classList.add('active');
    }

    initPresentation();
  } catch (error) {
    console.warn('Carga via fetch no disponible (posible restricción file://):', error);
    
    // Fallback: If slides are already in DOM or if fetch failed, attempt init
    const existingSlides = container.querySelectorAll('.slide');
    if (existingSlides.length > 0) {
      initPresentation();
    } else {
      container.innerHTML = `
        <div class="slide active" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; height: 100%; gap: 15px;">
          <div class="card card-accent" style="max-width: 600px; padding: 20px;">
            <div class="card-title" style="font-size: 1.2rem; margin-bottom: 10px;">Modo Servidor Recomendado</div>
            <p style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.5;">
              Para cargar las diapositivas dinámicamente desde la carpeta <code>slides/</code> sin duplicar código, ejecute un servidor web local sencillo (por ejemplo, <code>python3 -m http.server</code> o la extensión Live Server de VS Code) y abra <code>http://localhost:8000</code>.
            </p>
          </div>
        </div>
      `;
    }
  }
}

function initPresentation() {
  slides = document.querySelectorAll('.slide');
  totalSlides = slides.length;
  counterEl = document.getElementById('slide-counter');
  headerTagEl = document.getElementById('header-tag');
  headerTitleEl = document.getElementById('header-title');
  progressBarEl = document.getElementById('progress-bar');

  if (totalSlides > 0) {
    updateSlide(0);
  }
  setupLightbox();
}

function updateSlide(index) {
  if (index < 0) index = 0;
  if (index >= totalSlides) index = totalSlides - 1;

  if (slides[currentSlide]) {
    slides[currentSlide].classList.remove('active');
  }
  currentSlide = index;
  if (slides[currentSlide]) {
    slides[currentSlide].classList.add('active');

    // Update Header Metadata
    const tag = slides[currentSlide].getAttribute('data-tag') || 'PRESENTACIÓN TÉCNICA';
    const title = slides[currentSlide].getAttribute('data-title') || 'TP1';
    if (headerTagEl) headerTagEl.textContent = tag;
    if (headerTitleEl) headerTitleEl.textContent = title;
  }

  // Update Footer Counter
  if (counterEl) counterEl.textContent = `${currentSlide + 1} / ${totalSlides}`;

  // Update Progress Bar
  if (progressBarEl) {
    const progressPercent = ((currentSlide + 1) / totalSlides) * 100;
    progressBarEl.style.width = `${progressPercent}%`;
  }
}

function nextSlide() {
  if (currentSlide < totalSlides - 1) {
    updateSlide(currentSlide + 1);
  }
}

function prevSlide() {
  if (currentSlide > 0) {
    updateSlide(currentSlide - 1);
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// Keyboard Event Listener
document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('image-lightbox');
  if (e.key === 'Escape' && lightbox && lightbox.classList.contains('open')) {
    lightbox.classList.remove('open');
    return;
  }
  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
    e.preventDefault();
    nextSlide();
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault();
    prevSlide();
  } else if (e.key === 'f' || e.key === 'F') {
    e.preventDefault();
    toggleFullscreen();
  }
});

// Touch Swipe Navigation
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const swipeThreshold = 50;
  if (touchEndX < touchStartX - swipeThreshold) {
    nextSlide();
  }
  if (touchEndX > touchStartX + swipeThreshold) {
    prevSlide();
  }
}

// Click any presentation image to inspect it at full-screen size
function setupLightbox() {
  const lightbox = document.getElementById('image-lightbox');
  if (!lightbox) return;
  const lightboxImg = lightbox.querySelector('img');
  
  document.querySelectorAll('.img-box img').forEach(img => {
    img.title = 'Clic para ampliar';
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      if (lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || 'Imagen ampliada';
      }
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  lightbox.addEventListener('click', (e) => {
    if (e.target !== lightboxImg) closeLightbox();
  });
  
  const closeBtn = lightbox.querySelector('.close-lightbox');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }
}

// Initialize dynamic load on DOM load
document.addEventListener('DOMContentLoaded', loadSlides);
