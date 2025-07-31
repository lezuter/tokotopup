// =================================================================
// ## SCRIPT UTAMA VERSI FINAL (EFEK HOVER STABIL) ##
// =================================================================

// Fungsi global untuk Sidebar
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
    }
}

// Fungsi untuk menampilkan semua konten dinamis
async function displayContent() {
    const mainContentArea = document.querySelector('main');
    if (!mainContentArea) return;

    const cardWidth = 206;
    const gap = 16;
    const sectionWidth = 1350;
    const cardsPerRow = Math.floor((sectionWidth + gap) / (cardWidth + gap));
    const initialLimit = cardsPerRow * 2;
    const increment = cardsPerRow * 2;

    try {
        const response = await fetch('/api/sections');
        const result = await response.json();

        if (result.success) {
            const banner = mainContentArea.querySelector('.banner');
            mainContentArea.innerHTML = '';
            if (banner) mainContentArea.appendChild(banner);

            result.data.forEach(section => {
                if (section.games.length === 0) return;

                const sectionElement = document.createElement('div');
                sectionElement.className = 'game-section';

                const titleElement = document.createElement('h2');
                titleElement.textContent = section.sectionName;
                sectionElement.appendChild(titleElement);

                const gridElement = document.createElement('div');
                gridElement.className = 'game-grid';

                section.games.forEach((game, index) => {
                    const card = document.createElement('div');
                    card.className = 'game-card';
                    if (index >= initialLimit) {
                        card.style.display = 'none';
                        card.classList.add('hidden-card');
                    }
                    const imageUrl = game.image ? `/images/card/${game.image}` : '';
                    
                    // ### INI STRUKTUR HTML YANG SIMPEL & BENAR ###
                    card.innerHTML = `
                        <img src="${imageUrl}" alt="${game.name}" class="card-image" />
                        <div class="card-overlay">
                            <h3 class="card-title">${game.name}</h3>
                        </div>
                    `;
                    gridElement.appendChild(card);
                });

                sectionElement.appendChild(gridElement);

                if (section.games.length > initialLimit) {
                    const showMoreBtn = document.createElement('button');
                    showMoreBtn.textContent = 'Tampilkan Lainnya';
                    showMoreBtn.className = 'btn-show-more';

                    showMoreBtn.addEventListener('click', () => {
                        const hiddenCards = gridElement.querySelectorAll('.hidden-card');
                        let shownCount = 0;
                        for (let i = 0; i < hiddenCards.length; i++) {
                            if (shownCount < increment) {
                                hiddenCards[i].style.display = 'block';
                                hiddenCards[i].classList.remove('hidden-card');
                                shownCount++;
                            }
                        }
                        if (gridElement.querySelectorAll('.hidden-card').length === 0) {
                            showMoreBtn.style.display = 'none';
                        }
                    });
                    sectionElement.appendChild(showMoreBtn);
                }
                mainContentArea.appendChild(sectionElement);
            });
        } else {
            mainContentArea.innerHTML += '<p style="color: white;">Gagal memuat data game.</p>';
        }
    } catch (error) {
        console.error('Error fetching content:', error);
        mainContentArea.innerHTML += '<p style="color: white;">Terjadi kesalahan saat menyambung ke server.</p>';
    }
}

// Event listener utama
document.addEventListener('DOMContentLoaded', function () {
    displayContent();

    const loading = document.getElementById('loading');
    const cookiePopup = document.getElementById('cookiePopup');
    const acceptBtn = document.getElementById('acceptCookie');
    const overlay = document.getElementById('sidebar-overlay');
    const searchIcon = document.getElementById('searchIcon');
    const searchInput = document.getElementById('searchInput');
    const carouselTrack = document.querySelector(".carousel-track");
    const hamburgerBtn = document.querySelector('.hamburger');
    const closeBtn = document.querySelector('.close-btn');

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleMenu);
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', toggleMenu);
    }

    if (loading) {
        loading.style.display = 'flex';
        setTimeout(function () {
            loading.style.display = 'none';
            if (cookiePopup && !localStorage.getItem('cookieAccepted')) {
                cookiePopup.classList.add('show');
            }
        }, 2000);
    }
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function () {
            localStorage.setItem('cookieAccepted', 'true');
            cookiePopup.classList.remove('show');
        });
    }
    if (overlay) {
        overlay.addEventListener('click', toggleMenu);
    }
    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            searchInput.classList.toggle('show');
            if (searchInput.classList.contains('show')) {
                searchInput.focus();
            }
        });
    }
    document.addEventListener('click', function (e) {
        if (searchInput && searchIcon && !searchInput.contains(e.target) && !searchIcon.contains(e.target)) {
            searchInput.classList.remove('show');
        }
    });
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const keyword = searchInput.value.toLowerCase();
            const allGameCards = document.querySelectorAll('.game-card');
            allGameCards.forEach(card => {
                const title = card.querySelector('img')?.alt.toLowerCase() || '';
                if (title.includes(keyword)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    if (carouselTrack) {
        const slides = document.querySelectorAll(".carousel-image");
        const dots = document.querySelectorAll(".dot");
        const prevBtn = document.querySelector(".carousel-btn.prev");
        const nextBtn = document.querySelector(".carousel-btn.next");
        let current = 0;
        let interval;
        function updateCarousel() { carouselTrack.style.transform = `translateX(-${current * 100}%)`; dots.forEach((dot, i) => dot.classList.toggle("active", i === current)); }
        function nextSlide() { current = (current + 1) % slides.length; updateCarousel(); }
        function startAutoSlide() { interval = setInterval(nextSlide, 4000); }
        function stopAutoSlide() { clearInterval(interval); }
        if (nextBtn) { nextBtn.addEventListener("click", () => { stopAutoSlide(); nextSlide(); startAutoSlide(); }); }
        if (prevBtn) { prevBtn.addEventListener("click", () => { stopAutoSlide(); current = (current - 1 + slides.length) % slides.length; updateCarousel(); startAutoSlide(); }); }
        dots.forEach((dot, index) => { dot.addEventListener("click", () => { stopAutoSlide(); current = index; updateCarousel(); startAutoSlide(); }); });
        updateCarousel();
        startAutoSlide();
    }
});