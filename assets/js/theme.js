(function() {
    'use strict';

    const htmlElement = document.documentElement;

    let currentThemeIsDark = false;
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        currentThemeIsDark = true;
    }

    if (currentThemeIsDark) {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    document.addEventListener('DOMContentLoaded', function () {
        const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
        const themeToggleNavCheckbox = document.getElementById('theme-toggle-nav-checkbox');
        
        const iconSun = document.getElementById('icon-sun');
        const iconMoon = document.getElementById('icon-moon');
        const iconSunNav = document.getElementById('icon-sun-nav');
        const iconMoonNav = document.getElementById('icon-moon-nav');

        function updateIconVisibility(isDarkMode) {
            if (iconSun) iconSun.classList.toggle('hidden', isDarkMode);
            if (iconMoon) iconMoon.classList.toggle('hidden', !isDarkMode);
            if (iconSunNav) iconSunNav.classList.toggle('hidden', isDarkMode);
            if (iconMoonNav) iconMoonNav.classList.toggle('hidden', !isDarkMode);
        }

        function toggleAndSetTheme(shouldBeDark) {
            if (shouldBeDark) {
                htmlElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                htmlElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }

            if (themeToggleCheckbox) themeToggleCheckbox.checked = shouldBeDark;
            if (themeToggleNavCheckbox) themeToggleNavCheckbox.checked = shouldBeDark;

            updateIconVisibility(shouldBeDark);
        }

        const initialIsDarkMode = htmlElement.classList.contains('dark');
        if (themeToggleCheckbox) {
            themeToggleCheckbox.checked = initialIsDarkMode;
        }
        if (themeToggleNavCheckbox) {
            themeToggleNavCheckbox.checked = initialIsDarkMode;
        }

        updateIconVisibility(initialIsDarkMode);

        if (themeToggleCheckbox) {
            themeToggleCheckbox.addEventListener('change', (event) => {
                toggleAndSetTheme(event.target.checked);
            });
        }

        if (themeToggleNavCheckbox) {
            themeToggleNavCheckbox.addEventListener('change', (event) => {
                toggleAndSetTheme(event.target.checked);
            });
        }

        const navbarToggle = document.getElementById('navbar-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        if (navbarToggle && mobileMenu) {
            navbarToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

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