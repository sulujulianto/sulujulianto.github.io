(function() {
    'use strict';

    const htmlElement = document.documentElement;

    // Periksa preferensi tema pengguna dari localStorage atau sistem
    let currentThemeIsDark = false;
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        currentThemeIsDark = true;
    }

    // Terapkan kelas 'dark' ke elemen HTML root segera
    if (currentThemeIsDark) {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    // --- LOGIKA SETELAH DOM SEPENUHNYA DIMUAT ---
    document.addEventListener('DOMContentLoaded', function () {
        // Mendapatkan referensi ke elemen checkbox theme toggle
        const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
        const themeToggleNavCheckbox = document.getElementById('theme-toggle-nav-checkbox');
        
        // Mendapatkan referensi ke ikon matahari dan bulan
        const iconSun = document.getElementById('icon-sun');
        const iconMoon = document.getElementById('icon-moon');
        const iconSunNav = document.getElementById('icon-sun-nav');
        const iconMoonNav = document.getElementById('icon-moon-nav');


        // Fungsi untuk memperbarui status ikon (HANYA visibilitas)
        function updateIconVisibility(isDarkMode) {
            if (iconSun) iconSun.classList.toggle('hidden', isDarkMode);
            if (iconMoon) iconMoon.classList.toggle('hidden', !isDarkMode);
            if (iconSunNav) iconSunNav.classList.toggle('hidden', isDarkMode);
            if (iconMoonNav) iconMoonNav.classList.toggle('hidden', !isDarkMode);
        }

        // Fungsi untuk memperbarui status tema (HTML class, localStorage, dan status checkbox lainnya)
        function toggleAndSetTheme(shouldBeDark) {
            if (shouldBeDark) {
                htmlElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                htmlElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }

            // Sinkronkan status checked pada kedua checkbox (jika keduanya ada)
            if (themeToggleCheckbox) themeToggleCheckbox.checked = shouldBeDark;
            if (themeToggleNavCheckbox) themeToggleNavCheckbox.checked = shouldBeDark;
            
            // Perbarui visibilitas ikon
            updateIconVisibility(shouldBeDark);
        }

        // --- PENGATURAN STATUS AWAL SETELAH DOM DIMUAT ---
        // Atur status awal checkbox dan ikon sesuai dengan tema yang sudah diterapkan oleh applyTheme
        const initialIsDarkMode = htmlElement.classList.contains('dark');
        if (themeToggleCheckbox) {
            themeToggleCheckbox.checked = initialIsDarkMode;
        }
        if (themeToggleNavCheckbox) {
            themeToggleNavCheckbox.checked = initialIsDarkMode;
        }
        // Panggil updateIconVisibility untuk mengatur visibilitas ikon awal berdasarkan tema yang sudah ada
        updateIconVisibility(initialIsDarkMode);


        // Tambahkan event listener ke checkbox tema utama (desktop)
        if (themeToggleCheckbox) {
            themeToggleCheckbox.addEventListener('change', (event) => {
                toggleAndSetTheme(event.target.checked);
            });
        }

        // Tambahkan event listener ke checkbox tema navigasi (mobile)
        if (themeToggleNavCheckbox) {
            themeToggleNavCheckbox.addEventListener('change', (event) => {
                toggleAndSetTheme(event.target.checked);
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

        // --- LOGIKA SMOOTH SCROLL ---
        const allNavLinks = document.querySelectorAll('nav a[href^="#"], #mobile-menu a[href^="#"]');

        allNavLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault(); 

                const targetId = this.getAttribute('href'); 
                const targetElement = document.querySelector(targetId); 

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });

                    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.add('hidden');
                    }
                    history.pushState(null, '', targetId); 
                }
            });
        });


        // --- LOGIKA TOMBOL SCROLL TO TOP ---
        const toTopBtn = document.getElementById('to-top-btn');

        if (toTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    toTopBtn.classList.remove('hidden');
                    toTopBtn.classList.add('flex'); 
                } else {
                    toTopBtn.classList.add('hidden');
                    toTopBtn.classList.remove('flex');
                }
            });

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