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
}

// Modificar el código de event listeners para los enlaces de idioma
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
});

// Añadir atributos data-translate a los elementos que necesitan traducción
function addTranslateAttributes() {
    // Menú principal
    document.querySelector('a[href="/"]').setAttribute('data-translate', 'INICIO');
    document.querySelector('a[href="/contacto"]').setAttribute('data-translate', 'CONTACTO');
    document.querySelector('a[href="#"]:not(.language-selector)').setAttribute('data-translate', 'ADOPTA');
    
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
    
    // Modal de foto
    document.querySelector('div.photo-upload-container h2').setAttribute('data-translate', 'Cambiar foto de perfil');
    document.querySelector('label[for="profile-photo-upload"]').setAttribute('data-translate', 'Seleccionar imagen');
    document.querySelector('button.upload-button').setAttribute('data-translate', 'Guardar cambios');
    document.querySelector('img#current-profile-photo').setAttribute('alt', 'Foto actual');
    document.querySelector('img#current-profile-photo').setAttribute('data-translate-alt', 'Foto actual');
    document.querySelector('img#photo-preview').setAttribute('alt', 'Vista previa');
    document.querySelector('img#photo-preview').setAttribute('data-translate-alt', 'Vista previa');
}

// Mejorar la funcionalidad de foto de perfil
document.addEventListener('DOMContentLoaded', function() {
    const photoInput = document.getElementById('profile-photo-upload');
    const photoPreview = document.getElementById('photo-preview');
    
    if (photoInput) {
        photoInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                // Validar el tamaño del archivo (máximo 5MB)
                const maxSize = 5 * 1024 * 1024; // 5MB en bytes
                if (this.files[0].size > maxSize) {
                    showAlert('El archivo es demasiado grande. Tamaño máximo: 5MB', 'error');
                    this.value = ''; // Limpiar el input
                    photoPreview.style.display = 'none';
                    return;
                }
                
                // Validar tipo de archivo
                const fileType = this.files[0].type;
                if (!fileType.match('image.*')) {
                    showAlert('Solo se permiten imágenes (jpg, png, gif)', 'error');
                    this.value = ''; // Limpiar el input
                    photoPreview.style.display = 'none';
                    return;
                }
                
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    photoPreview.src = e.target.result;
                    photoPreview.style.display = 'block';
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // Manejar el envío del formulario de foto de perfil
    const photoForm = document.getElementById('profile-photo-form');
    if (photoForm) {
        photoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Verificar si hay un archivo seleccionado
            const fileInput = document.getElementById('profile-photo-upload');
            if (!fileInput.files || fileInput.files.length === 0) {
                showAlert('Por favor selecciona una imagen', 'error');
                return;
            }
            
            // Verificar si el usuario está autenticado
            const token = localStorage.getItem('authToken');
            if (!token) {
                showAlert('Debes iniciar sesión para cambiar tu foto de perfil', 'error');
                closeModal('photoModal');
                openModal('loginModal'); // Abrir modal de login
                return;
            }
            
            const formData = new FormData(this);
            
            // Mostrar indicador de carga
            const uploadButton = document.querySelector('.upload-button');
            const originalText = uploadButton.textContent;
            uploadButton.textContent = 'Subiendo...';
            uploadButton.disabled = true;
            
            fetch('/api/update-profile-photo', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Actualizar la foto de perfil en el menú
                    document.getElementById('profile-photo').src = data.photoUrl + '?t=' + new Date().getTime(); // Añadir timestamp para evitar caché
                    
                    // Cerrar el modal
                    closeModal('photoModal');
                    
                    // Mostrar mensaje de éxito
                    showAlert('Foto de perfil actualizada con éxito', 'success');
                    
                    // Limpiar el formulario
                    photoForm.reset();
                    photoPreview.style.display = 'none';
                } else {
                    showAlert('Error al actualizar la foto: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('Error al subir la imagen: ' + error.message, 'error');
            })
            .finally(() => {
                // Restaurar el botón
                uploadButton.textContent = originalText;
                uploadButton.disabled = false;
            });
        });
    }
});

// Función mejorada para mostrar mensajes de alerta
function showAlert(message, type) {
    // Remover alertas existentes
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type === 'success' ? 'alert-success' : 'alert-danger'}`;
    alertDiv.textContent = message;
    
    // Añadir estilos inline para las alertas
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.left = '50%';
    alertDiv.style.transform = 'translateX(-50%)';
    alertDiv.style.padding = '10px 20px';
    alertDiv.style.borderRadius = '5px';
    alertDiv.style.zIndex = '9999';
    
    if (type === 'success') {
        alertDiv.style.backgroundColor = '#d4edda';
        alertDiv.style.color = '#155724';
        alertDiv.style.border = '1px solid #c3e6cb';
    } else {
        alertDiv.style.backgroundColor = '#f8d7da';
        alertDiv.style.color = '#721c24';
        alertDiv.style.border = '1px solid #f5c6cb';
    }
    
    document.body.appendChild(alertDiv);
    
    // Animación de entrada
    alertDiv.style.opacity = '0';
    alertDiv.style.transition = 'opacity 0.3s ease';
    
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