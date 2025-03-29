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
        'Cambiar foto': 'Cambiar foto',
        'Cerrar sesión': 'Cerrar sesión',
        'Cambiar foto de perfil': 'Cambiar foto de perfil',
        'Seleccionar imagen': 'Seleccionar imagen',
        'Guardar cambios': 'Guardar cambios',
        'Foto actual': 'Foto actual',
        'Vista previa': 'Vista previa',
        'Foto de perfil actualizada con éxito': 'Foto de perfil actualizada con éxito',
        'Error al actualizar la foto': 'Error al actualizar la foto',
        'Error al subir la imagen': 'Error al subir la imagen'
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
        'Cambiar foto': 'Change photo',
        'Cerrar sesión': 'Log out',
        'Cambiar foto de perfil': 'Change profile photo',
        'Seleccionar imagen': 'Select image',
        'Guardar cambios': 'Save changes',
        'Foto actual': 'Current photo',
        'Vista previa': 'Preview',
        'Foto de perfil actualizada con éxito': 'Profile photo successfully updated',
        'Error al actualizar la foto': 'Error updating photo',
        'Error al subir la imagen': 'Error uploading image'
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
        'Cambiar foto': 'Changer la photo',
        'Cerrar sesión': 'Déconnexion',
        'Cambiar foto de perfil': 'Changer la photo de profil',
        'Seleccionar imagen': 'Sélectionner une image',
        'Guardar cambios': 'Enregistrer les modifications',
        'Foto actual': 'Photo actuelle',
        'Vista previa': 'Aperçu',
        'Foto de perfil actualizada con éxito': 'Photo de profil mise à jour avec succès',
        'Error al actualizar la foto': 'Erreur lors de la mise à jour de la photo',
        'Error al subir la imagen': 'Erreur lors du téléchargement de l\'image'
    }
};

// Actualizar el idioma de la página
function updateLanguage(lang) {
    // Guardar la selección en localStorage
    localStorage.setItem('selectedLanguage', lang);
    
    // Actualizar texto del selector de idiomas
    updateLanguageDisplay(lang);
    
    // Aplicar traducciones a los elementos de la página
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Traducir atributos alt de imágenes
    const altElements = document.querySelectorAll('[data-translate-alt]');
    altElements.forEach(element => {
        const key = element.getAttribute('data-translate-alt');
        if (translations[lang] && translations[lang][key]) {
            element.setAttribute('alt', translations[lang][key]);
        }
    });
}

// Actualizar visualización del selector de idiomas
function updateLanguageDisplay(lang) {
    const langSelector = document.querySelector('.language-selector');
    if (langSelector) {
        // Actualizar el texto del selector según el idioma seleccionado
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

// Event listeners para los enlaces de idioma
document.addEventListener('DOMContentLoaded', function() {
    // Detectar el idioma de la URL o del almacenamiento local
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang') || localStorage.getItem('selectedLanguage') || 'es';
    
    // Actualizar el idioma inicialmente
    updateLanguage(lang);
    
    // Añadir atributos data-translate a los elementos
    addTranslateAttributes();
    
    const langLinks = document.querySelectorAll('.submenu a[href^="?lang="]');
    
    langLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevenir la navegación
            const lang = this.href.split('=')[1];
            updateLanguage(lang);
            
            // Actualizar la URL sin recargar la página
            const url = new URL(window.location);
            url.searchParams.set('lang', lang);
            window.history.pushState({}, '', url);
        });
    });
    
    // Configurar eventos de subida de foto
    const photoInput = document.getElementById('profile-photo-upload');
    if (photoInput) {
        photoInput.addEventListener('change', previewProfilePhoto);
    }
    
    const photoForm = document.getElementById('profile-photo-form');
    if (photoForm) {
        photoForm.addEventListener('submit', handleProfilePhotoUpload);
    }
    
    // Configurar hover del menú de usuario
    setupUserMenuHover();
    
    // Mejorar visibilidad de submenús
    const submenus = document.querySelectorAll('.has-submenu');
    submenus.forEach(submenu => {
        submenu.addEventListener('mouseenter', function() {
            const submenuDropdown = this.querySelector('.submenu');
            if (submenuDropdown) {
                submenuDropdown.style.opacity = '1';
                submenuDropdown.style.visibility = 'visible';
            }
        });
        
        submenu.addEventListener('mouseleave', function() {
            const submenuDropdown = this.querySelector('.submenu');
            if (submenuDropdown) {
                submenuDropdown.style.opacity = '0';
                submenuDropdown.style.visibility = 'hidden';
            }
        });
    });
});

// Añadir atributos data-translate a los elementos que necesitan traducción
function addTranslateAttributes() {
    // Menú principal
    const homeLink = document.querySelector('a[href="/"]');
    if (homeLink) homeLink.setAttribute('data-translate', 'INICIO');
    
    const contactLink = document.querySelector('a[href="/contacto"]');
    if (contactLink) contactLink.setAttribute('data-translate', 'CONTACTO');
    
    const adoptLink = document.querySelector('.main-menu > li:nth-child(3) > a');
    if (adoptLink) adoptLink.setAttribute('data-translate', 'ADOPTA');
    
    // Submenús
    const submenuItems = {
        'a[href="/adopcion"]': 'Adopciones',
        'a[href="/donaciones"]': 'Donaciones',
        'a[href="/voluntario"]': 'Voluntario',
        'a[onclick="openModal(\'loginModal\')"]': 'Iniciar sesión',
        'a[onclick="openModal(\'registerModal\')"]': 'Registrarse',
        'a[onclick="openModal(\'settingsModal\')"]': 'Configuración',
        'a[onclick="openPhotoModal()"]': 'Cambiar foto',
        'a[id="logout-button"]': 'Cerrar sesión'
    };
    
    for (const [selector, translation] of Object.entries(submenuItems)) {
        const element = document.querySelector(selector);
        if (element) {
            element.setAttribute('data-translate', translation);
        }
    }
}

// Función para configurar hover del menú de usuario
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

// Función para mostrar alertas
function showAlert(message, type) {
    // Remover alertas existentes
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type === 'success' ? 'alert-success' : 'alert-danger'}`;
    alertDiv.textContent = message;
    
    // Estilos inline para las alertas
    Object.assign(alertDiv.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        borderRadius: '5px',
        zIndex: '9999',
        backgroundColor: type === 'success' ? '#d4edda' : '#f8d7da',
        color: type === 'success' ? '#155724' : '#721c24',
        border: `1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
        opacity: '0',
        transition: 'opacity 0.3s ease'
    });
    
    document.body.appendChild(alertDiv);
    
    // Animación de entrada
    setTimeout(() => {
        alertDiv.style.opacity = '1';
    }, 10);
    
    // Remover la alerta después de 3 segundos
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => {
            alertDiv.remove();
        }, 300);
    }, 3000);
}

// Función para previsualizar la imagen de perfil
function previewProfilePhoto() {
    const fileInput = document.getElementById('profile-photo-upload');
    const photoPreview = document.getElementById('photo-preview');
    
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            photoPreview.src = e.target.result;
            photoPreview.style.display = 'block';
        };
        
        reader.readAsDataURL(fileInput.files[0]);
    }
}

// Función para manejar la subida de foto de perfil
function handleProfilePhotoUpload(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById('profile-photo-upload');
    const photoPreview = document.getElementById('photo-preview');
    const currentLang = getCurrentLanguage();
    
    // Validaciones de archivo
    if (!fileInput.files || fileInput.files.length === 0) {
        showAlert(translations[currentLang]['Error al subir la imagen'], 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    // Validaciones de tamaño y tipo
    if (file.size > maxSize) {
        showAlert('El archivo es demasiado grande. Tamaño máximo: 5MB', 'error');
        fileInput.value = '';
        photoPreview.style.display = 'none';
        return;
    }
    
    if (!file.type.match('image.*')) {
        showAlert('Solo se permiten imágenes (jpg, png, gif)', 'error');
        fileInput.value = '';
        photoPreview.style.display = 'none';
        return;
    }
    
    // Verificar token de autenticación
    const token = localStorage.getItem('authToken');
    if (!token) {
        showAlert('Debes iniciar sesión para cambiar tu foto de perfil', 'error');
        return;
    }
    
    const formData = new FormData(event.target);
    const uploadButton = document.querySelector('.upload-button');
    const originalText = uploadButton.textContent;
    
    // Deshabilitar botón durante la subida
    uploadButton.textContent = 'Subiendo...';
    uploadButton.disabled = true;
    
    // Envío de foto al backend
    fetch('/adoptme/api/v1/update-profile-photo', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
    })
    .then(data => {
        if (data.photoUrl) {
            // Actualizar todas las referencias de la foto de perfil
            const profilePhotos = document.querySelectorAll('#profile-photo, #current-profile-photo');
            profilePhotos.forEach(photo => {
                photo.src = data.photoUrl + '?t=' + Date.now();
            });
            
            // Cerrar modal y mostrar mensaje de éxito
            closePhotoModal();
            showAlert(translations[currentLang]['Foto de perfil actualizada con éxito'], 'success');
            
            // Limpiar formulario
            event.target.reset();
            photoPreview.style.display = 'none';
        } else {
            showAlert(translations[currentLang]['Error al actualizar la foto'], 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert(translations[currentLang]['Error al subir la imagen'] + ': ' + error.message, 'error');
    })
    .finally(() => {
        // Restaurar botón
        uploadButton.textContent = originalText;
        uploadButton.disabled = false;
    });
}

// Función para obtener el idioma actual
function getCurrentLanguage() {
    return localStorage.getItem('selectedLanguage') || 'es';
}

// Función mejorada para abrir el modal de foto
function openPhotoModal() {
    const modal = document.getElementById('photoModal');
    if (modal) {
        modal.style.display = 'block';
        // Agregar la clase 'show' después de un pequeño retraso para activar la transición
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
}

// Función mejorada para cerrar el modal de foto
function closePhotoModal() {
    const modal = document.getElementById('photoModal');
    if (modal) {
        modal.classList.remove('show');
        // Esperar a que termine la transición antes de ocultar
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}
