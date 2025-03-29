// Script para manejar el cambio de foto de perfil
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const photoModal = document.getElementById('photoModal');
    const profilePhotoForm = document.getElementById('profile-photo-form');
    const photoUpload = document.getElementById('profile-photo-upload');
    const photoPreview = document.getElementById('photo-preview');
    const currentProfilePhoto = document.getElementById('current-profile-photo');
    const mainProfilePhoto = document.getElementById('profile-photo');

    // Función para abrir el modal de foto de perfil
    window.openPhotoModal = function() {
        console.log('Opening photo modal');
        console.log('photoModal element:', photoModal);
        
        // Mostrar la foto de perfil actual en el modal
        if (mainProfilePhoto && mainProfilePhoto.src) {
            currentProfilePhoto.src = mainProfilePhoto.src;
        }
        photoModal.style.display = 'block';
        
        // Añadir un pequeño retraso para permitir que el navegador aplique el display: block
        setTimeout(() => {
            photoModal.classList.add('show');
        }, 10);
    };

    // Función para cerrar el modal de foto de perfil
    window.closePhotoModal = function() {
        photoModal.classList.remove('show');
        
        // Esperar a que termine la transición de opacidad antes de ocultarlo
        setTimeout(() => {
            photoModal.style.display = 'none';
            // Limpiar la vista previa al cerrar
            photoPreview.style.display = 'none';
            photoPreview.src = '#';
            photoUpload.value = '';
        }, 300); // 300ms coincide con la duración de la transición en CSS
    };

    // Cerrar el modal si se hace clic fuera del contenido
    window.addEventListener('click', function(event) {
        if (event.target === photoModal) {
            closePhotoModal();
        }
    });

    // Mostrar vista previa de la imagen seleccionada
    photoUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            // Verificar que sea una imagen
            if (!file.type.startsWith('image/')) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Solo se permiten archivos de imagen',
                });
                photoUpload.value = '';
                return;
            }

            // Verificar tamaño (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'La imagen es demasiado grande. Máximo 5MB.',
                });
                photoUpload.value = '';
                return;
            }

            // Mostrar vista previa
            const reader = new FileReader();
            reader.onload = function() {
                photoPreview.src = reader.result;
                photoPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Manejar el envío del formulario de foto de perfil
    profilePhotoForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Verificar si se ha seleccionado una imagen
        if (!photoUpload.files || photoUpload.files.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                text: 'Por favor, selecciona una imagen primero',
            });
            return;
        }

        // Crear FormData para enviar la imagen
        const formData = new FormData();
        formData.append('photo', photoUpload.files[0]);

        try {
            // Mostrar indicador de carga
            Swal.fire({
                title: 'Subiendo imagen...',
                text: 'Por favor espera',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Obtener el token de acceso del almacenamiento local
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            // Enviar la solicitud con el token de autenticación
            const response = await fetch('https://montanitaadopta.onrender.com/adoptme/api/v1/auth/update-profile-photo', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Error al actualizar la foto de perfil');
            }

            // Actualizar las imágenes de perfil en la página
            if (data.photoUrl) {
                // Actualizar la foto en el menú de usuario
                if (mainProfilePhoto) {
                    mainProfilePhoto.src = data.photoUrl;
                }
                
                // Actualizar la foto actual en el modal
                currentProfilePhoto.src = data.photoUrl;
                
                // Limpiar la vista previa
                photoPreview.style.display = 'none';
                photoUpload.value = '';
            }

            // Notificar éxito
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Foto de perfil actualizada correctamente',
            });

            // Cerrar el modal
            closePhotoModal();
            
        } catch (error) {
            console.error('Error:', error);
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Ocurrió un error al actualizar la foto de perfil',
            });
        }
    });

    // Función para mostrar el nombre de usuario y la foto de perfil al cargar la página
    async function updateUserUI() {
        try {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                // Si no hay token, mostrar el menú de login
                document.getElementById('login-menu').style.display = 'block';
                document.getElementById('user-menu').style.display = 'none';
                return;
            }

            // Obtener datos del usuario
            const response = await fetch('https://montanitaadopta.onrender.com/adoptme/api/v1/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // Si hay un error (token inválido, etc.), mostrar menú de login
                localStorage.removeItem('access_token');
                document.getElementById('login-menu').style.display = 'block';
                document.getElementById('user-menu').style.display = 'none';
                return;
            }

            const userData = await response.json();
            
            // Mostrar el menú de usuario y ocultar el de login
            document.getElementById('login-menu').style.display = 'none';
            document.getElementById('user-menu').style.display = 'block';
            
            // Actualizar el nombre de usuario
            document.getElementById('username-text').textContent = userData.nombre;
            
            // Actualizar la foto de perfil si existe
            if (userData.foto_perfil) {
                mainProfilePhoto.src = userData.foto_perfil;
                currentProfilePhoto.src = userData.foto_perfil;
            }
        } catch (error) {
            console.error('Error al cargar datos del usuario:', error);
            // En caso de error, mostrar menú de login
            document.getElementById('login-menu').style.display = 'block';
            document.getElementById('user-menu').style.display = 'none';
        }
    }

    // Cargar los datos del usuario al iniciar
    updateUserUI();

    // Manejar cierre de sesión
    document.getElementById('logout-button').addEventListener('click', function(event) {
        event.preventDefault();
        
        // Eliminar el token de acceso
        localStorage.removeItem('access_token');
        
        // Actualizar UI
        document.getElementById('login-menu').style.display = 'block';
        document.getElementById('user-menu').style.display = 'none';
        
        // Notificar al usuario
        Swal.fire({
            icon: 'success',
            title: 'Cerrar sesión',
            text: 'Has cerrado sesión correctamente',
        });
    });
});
