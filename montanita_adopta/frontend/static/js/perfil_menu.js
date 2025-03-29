// Definir traducciones
const translations = {
    'es': {
        'INICIO': 'INICIO',
        'CONTACTO': 'CONTACTO',
        'ADOPTA': 'ADOPTA',
        'Adopciones': 'Adopciones',
        'Donaciones': 'Donaciones',
        'Voluntario': 'Voluntario',
        'Iniciar sesión': 'Iniciar sesión',
        'Registrarse': 'Registrarse',
        'Configuración': 'Configuración',
        'Cerrar sesión': 'Cerrar sesión'
    },
    'en': {
        'INICIO': 'HOME',
        'CONTACTO': 'CONTACT',
        'ADOPTA': 'ADOPT',
        'Adopciones': 'Adoptions',
        'Donaciones': 'Donations',
        'Voluntario': 'Volunteer',
        'Iniciar sesión': 'Log in',
        'Registrarse': 'Register',
        'Configuración': 'Settings',
        'Cerrar sesión': 'Log out'
    },
    'fr': {
        'INICIO': 'ACCUEIL',
        'CONTACTO': 'CONTACT',
        'ADOPTA': 'ADOPTER',
        'Adopciones': 'Adoptions',
        'Donaciones': 'Donations',
        'Voluntario': 'Bénévole',
        'Iniciar sesión': 'Connexion',
        'Registrarse': 'S\'inscrire',
        'Configuración': 'Paramètres',
        'Cerrar sesión': 'Déconnexion'
    }
};

// Actualizar el idioma de la página
function updateLanguage(lang) {
    localStorage.setItem('selectedLanguage', lang);
    updateLanguageDisplay(lang);
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

function updateLanguageDisplay(lang) {
    const langSelector = document.querySelector('.language-selector');
    if (langSelector) {
        switch (lang) {
            case 'es':
                langSelector.innerHTML = '<i class="fa-solid fa-globe"></i> ES <i class="fa-solid fa-chevron-down"></i>';
                break;
            case 'en':
                langSelector.innerHTML = '<i class="fa-solid fa-globe"></i> EN <i class="fa-solid fa-chevron-down"></i>';
                break;
            case 'fr':
                langSelector.innerHTML = '<i class="fa-solid fa-globe"></i> FR <i class="fa-solid fa-chevron-down"></i>';
                break;
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang') || localStorage.getItem('selectedLanguage') || 'es';
    updateLanguage(lang);
    addTranslateAttributes();
    const langLinks = document.querySelectorAll('.submenu a[href^="?lang="]');
    langLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.href.split('=')[1];
            updateLanguage(lang);
            const url = new URL(window.location);
            url.searchParams.set('lang', lang);
            window.history.pushState({}, '', url);
        });
    });
    setupUserMenuHover();
});

function addTranslateAttributes() {
    const homeLink = document.querySelector('a[href="/"]');
    if (homeLink) homeLink.setAttribute('data-translate', 'INICIO');
    const contactLink = document.querySelector('a[href="/contacto"]');
    if (contactLink) contactLink.setAttribute('data-translate', 'CONTACTO');
    const adoptLink = document.querySelector('.main-menu > li:nth-child(3) > a');
    if (adoptLink) adoptLink.setAttribute('data-translate', 'ADOPTA');
    const submenuItems = {
        'a[href="/adopcion"]': 'Adopciones',
        'a[href="/donaciones"]': 'Donaciones',
        'a[href="/voluntario"]': 'Voluntario',
        'a[onclick="openModal(\'loginModal\')"]': 'Iniciar sesión',
        'a[onclick="openModal(\'registerModal\')"]': 'Registrarse',
        'a[onclick="openModal(\'settingsModal\')"]': 'Configuración'
    };
    for (const [selector, translation] of Object.entries(submenuItems)) {
        const element = document.querySelector(selector);
        if (element) {
            element.setAttribute('data-translate', translation);
        }
    }
}

function setupUserMenuHover() {
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
        userMenu.addEventListener('mouseenter', function() {
            const submenu = this.querySelector('.submenu');
            if (submenu) {
                submenu.style.opacity = '1';
                submenu.style.visibility = 'visible';
            }
        });
        userMenu.addEventListener('mouseleave', function() {
            const submenu = this.querySelector('.submenu');
            if (submenu) {
                submenu.style.opacity = '0';
                submenu.style.visibility = 'hidden';
            }
        });
    }
}
