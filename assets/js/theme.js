// Fungsi ini akan berjalan segera setelah script dimuat
(function() {
    'use strict';

    // --- LOGIKA TOGGLE TEMA (TERANG/GELAP) ---
    // Fungsi ini dijalankan segera untuk menghindari "flash" tema yang salah
    function applyTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const iconSun = document.getElementById('icon-sun');
        const iconMoon = document.getElementById('icon-moon');
        const htmlElement = document.documentElement;

        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            htmlElement.classList.add('dark');
            if (iconSun) iconSun.classList.remove('hidden');
            if (iconMoon) iconMoon.classList.add('hidden');
        } else {
            htmlElement.classList.remove('dark');
            if (iconSun) iconSun.classList.add('hidden');
            if (iconMoon) iconMoon.classList.remove('hidden');
        }
    }

    // Panggil fungsi tema segera
    applyTheme();

    // Tambahkan event listener setelah halaman selesai dimuat
    document.addEventListener('DOMContentLoaded', function () {
        const themeToggle = document.getElementById('theme-toggle');
        const iconSun = document.getElementById('icon-sun');
        const iconMoon = document.getElementById('icon-moon');
        const htmlElement = document.documentElement;
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                htmlElement.classList.toggle('dark');
                const isDarkMode = htmlElement.classList.contains('dark');
                localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
                if (iconSun) iconSun.classList.toggle('hidden', !isDarkMode);
                if (iconMoon) iconMoon.classList.toggle('hidden', isDarkMode);
            });
        }

        // --- LOGIKA TOGGLE MENU MOBILE ---
        const navbarToggle = document.getElementById('navbar-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        if (navbarToggle && mobileMenu) {
            navbarToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // --- LOGIKA BARU UNTUK TOMBOL SCROLL TO TOP ---
        const toTopBtn = document.getElementById('to-top-btn');

        if (toTopBtn) {
            // Tampilkan tombol jika scroll lebih dari 300px
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    toTopBtn.classList.remove('hidden');
                    toTopBtn.classList.add('flex'); // Gunakan flex untuk memusatkan ikon
                } else {
                    toTopBtn.classList.add('hidden');
                    toTopBtn.classList.remove('flex');
                }
            });

            // Fungsi untuk scroll ke atas saat tombol diklik
            toTopBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    });

})();