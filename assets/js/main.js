document.addEventListener('DOMContentLoaded', () => {
    const dateTimeElement = document.getElementById('date-time');
    if (dateTimeElement) {
        const updateDateTime = () => {
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
            dateTimeElement.textContent = now.toLocaleDateString('id-ID', options);
        };

        updateDateTime();
        setInterval(updateDateTime, 1000);
    }

    const slides = Array.from(document.querySelectorAll('.slide'));
    const dots = Array.from(document.querySelectorAll('.slide-dot'));
    const nextButton = document.getElementById('next-slide');
    const prevButton = document.getElementById('prev-slide');
    let currentSlide = 0;

    if (slides.length > 0 && dots.length > 0) {
        const showSlide = (index) => {
            slides.forEach((slide) => slide.classList.remove('active'));
            dots.forEach((dot) => dot.classList.remove('active'));
            slides[index].classList.add('active');
            dots[index].classList.add('active');
            currentSlide = index;
        };

        const nextSlide = () => {
            const nextIndex = (currentSlide + 1) % slides.length;
            showSlide(nextIndex);
        };

        const prevSlide = () => {
            const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(prevIndex);
        };

        if (nextButton) {
            nextButton.addEventListener('click', nextSlide);
        }

        if (prevButton) {
            prevButton.addEventListener('click', prevSlide);
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showSlide(index));
        });

        setInterval(nextSlide, 5000);
    }

    const menuButton = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
});