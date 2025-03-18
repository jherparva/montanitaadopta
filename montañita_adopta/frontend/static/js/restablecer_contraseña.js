// Función para validar contraseñas
function validatePassword(password) {
    // Validar longitud mínima de 8 caracteres
    if (password.length < 8) {
        return false;
    }
    
    // Validar que contenga al menos una letra mayúscula
    if (!/[A-Z]/.test(password)) {
        return false;
    }
    
    // Validar que contenga al menos una letra minúscula
    if (!/[a-z]/.test(password)) {
        return false;
    }
    
    // Validar que contenga al menos un número
    if (!/[0-9]/.test(password)) {
        return false;
    }
    
    // Si pasa todas las validaciones
    return true;
}

// Funciones para abrir y cerrar modales
function openModal(modalId) {
    // Cerrar todos los modales primero
    closeAllModals();
    
    // Abrir el modal específico
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        
        // Corregir problemas con los inputs después de abrir el modal
        setTimeout(fixModalInputs, 100);
        
        // Si es el modal de reseteo, enfocamos el campo de correo automáticamente
        if (modalId === 'resetPasswordModal') {
            setTimeout(() => {
                const emailInput = document.getElementById('reset-password-email');
                if (emailInput) {
                    emailInput.focus();
                }
            }, 200);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeAllModals() {
    // Obtener todos los elementos con clase 'modal'
    const modals = document.querySelectorAll('.modal');
    
    // Ocultar todos los modales
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Esta función se encarga de corregir problemas con los inputs en los modales
function fixModalInputs() {
    // Seleccionar todos los inputs en los modales de recuperación de contraseña
    const resetModalInputs = document.querySelectorAll('#resetPasswordModal input, #verifyCodeModal input');
    
    // Agregar listeners para asegurar que los inputs funcionen correctamente
    resetModalInputs.forEach(input => {
        // Asegurar que el input no esté deshabilitado
        input.disabled = false;
        
        // Limpiar cualquier evento que pueda estar bloqueando
        input.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar propagación de eventos
        });
        
        // Asegurar que el input pueda recibir focus
        input.addEventListener('focus', function(e) {
            // Asegurar que el input tiene el foco
            setTimeout(() => {
                this.focus();
            }, 0);
        });
    });
}

// Event listener para el enlace de "Olvidé mi contraseña"
document.addEventListener('DOMContentLoaded', function() {
    // Asumiendo que tienes un enlace con clase 'forgot-password' o similar
    const forgotPasswordLink = document.querySelector('.forgot-password');
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Cerrar modal de login y abrir modal de recuperación
            closeModal('loginModal'); // Asegúrate de que 'loginModal' sea el ID correcto de tu modal de login
            openModal('resetPasswordModal');
        });
    }
    
    // Código existente para reset-password-form
    const resetPasswordForm = document.getElementById('reset-password-form');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const email = document.getElementById('reset-password-email').value;
            
            try {
                const response = await apiConnector.post('auth/recover-password-code', { correo: email });
                
                Swal.fire({
                    icon: 'success',
                    title: 'Código Enviado',
                    text: response.message || 'Si el correo está registrado, recibirás un código de recuperación',
                    confirmButtonText: 'Continuar'
                }).then(() => {
                    closeModal('resetPasswordModal');
                    // Pre-llenar el correo en el modal de verificación
                    document.getElementById('verify-email').value = email;
                    openModal('verifyCodeModal');
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Error al enviar el código de recuperación'
                });
            }
        });
    }
    
    // Código existente para verify-code-form
    const verifyCodeForm = document.getElementById('verify-code-form');
    if (verifyCodeForm) {
        verifyCodeForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const email = document.getElementById('verify-email').value;
            const code = document.getElementById('recovery-code').value;
            const newPassword = document.getElementById('verify-new-password').value;
            const confirmPassword = document.getElementById('verify-confirm-password').value;
            
            // Validar que las contraseñas coincidan
            if (newPassword !== confirmPassword) {
                Swal.fire({
                    icon: 'error',
                    title: 'Las contraseñas no coinciden',
                    text: 'Por favor, verifica que las contraseñas sean iguales.'
                });
                return;
            }
            
            // Validar requisitos de contraseña
            if (!validatePassword(newPassword)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Contraseña no válida',
                    text: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.'
                });
                return;
            }
            
            try {
                const response = await apiConnector.post('auth/verify-code-reset', {
                    correo: email,
                    codigo: code,
                    nueva_contrasena: newPassword
                });
                
                Swal.fire({
                    icon: 'success',
                    title: '¡Contraseña cambiada!',
                    text: response.message || 'Contraseña actualizada exitosamente',
                    confirmButtonText: 'Iniciar sesión'
                }).then(() => {
                    closeModal('verifyCodeModal');
                    openModal('loginModal');
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Error al verificar el código o restablecer la contraseña'
                });
            }
        });
    }
    
    // Asegurarse de que el evento de clic en el modal no cierre el modal
    // Evitar que clicks dentro del contenido del modal cierren el modal
    const modalContents = document.querySelectorAll('.modal-content');
    modalContents.forEach(content => {
        content.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar que el clic se propague al fondo
        });
    });
    
    // También agregar este comportamiento a los modales específicos
    const resetPasswordModal = document.getElementById('resetPasswordModal');
    const verifyCodeModal = document.getElementById('verifyCodeModal');
    
    if (resetPasswordModal) {
        resetPasswordModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal('resetPasswordModal');
            }
        });
    }
    
    if (verifyCodeModal) {
        verifyCodeModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal('verifyCodeModal');
            }
        });
    }
    
    // Inicializar la corrección de inputs
    fixModalInputs();
});