document.addEventListener("DOMContentLoaded", function () {
    // Referencias a elementos del DOM
    const form = document.getElementById("contact-form");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const subjectInput = document.getElementById("subject");
    const messageInput = document.getElementById("message");
    const privacyPolicyLink = document.getElementById("privacy-policy-link");
    const privacyCheckbox = document.getElementById("privacy-policy");
    const acceptPrivacyBtn = document.getElementById("accept-privacy");

    // Crear elementos para mejoras visuales
    function createElements() {
        // 1. Barra de progreso
        const progressContainer = document.createElement('div');
        progressContainer.className = 'form-progress';
        progressContainer.innerHTML = '<div class="progress-bar"></div>';
        form.insertBefore(progressContainer, form.firstChild);
        
        // 2. Mensaje de estado
        const statusMessage = document.createElement('div');
        statusMessage.className = 'status-message';
        form.appendChild(statusMessage);
        
        // 3. Toast de notificación
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = 'Mensaje enviado con éxito';
        document.body.appendChild(toast);
        
        // 4. Agregar textos de ayuda
        addHelpTexts();
        
        // 5. Agregar íconos de completado
        addCompleteIcons();
    }
    
    // Agregar textos de ayuda para los campos
    function addHelpTexts() {
        const helpTexts = {
            'name': 'Ingresa tu nombre completo',
            'email': 'Usa un correo electrónico válido',
            'subject': 'Indica el motivo de tu mensaje',
            'message': 'Detalla aquí tu consulta o comentario'
        };
        
        for (let fieldId in helpTexts) {
            const field = document.getElementById(fieldId);
            if (field) {
                const helpSpan = document.createElement('span');
                helpSpan.className = 'help-text';
                helpSpan.textContent = helpTexts[fieldId];
                field.parentNode.appendChild(helpSpan);
            }
        }
    }
    
    // Agregar íconos de completado
    function addCompleteIcons() {
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            const icon = document.createElement('span');
            icon.className = 'input-complete';
            icon.innerHTML = '✓';
            input.parentNode.appendChild(icon);
        });
    }
    
    // Actualizar la barra de progreso
    function updateProgressBar() {
        const inputs = form.querySelectorAll('input[type="text"], input[type="email"], textarea');
        const totalFields = inputs.length;
        let completedFields = 0;
        
        inputs.forEach(input => {
            if (input.value.trim() !== '') {
                completedFields++;
            }
        });
        
        const progressPercent = (completedFields / totalFields) * 100;
        document.querySelector('.progress-bar').style.width = progressPercent + '%';
    }
    
    // Efecto de onda en el botón
    function createRippleEffect(e) {
        const button = e.currentTarget;
        const ripple = document.createElement('span');
        ripple.className = 'button-ripple';
        
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 800);
    }
    
    // Mostrar toast de notificación
    function showToast() {
        const toast = document.querySelector('.toast-notification');
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Mostrar mensaje de estado
    function showStatusMessage(type, message) {
        const statusMsg = document.querySelector('.status-message');
        statusMsg.textContent = message;
        statusMsg.className = 'status-message status-' + type;
        statusMsg.style.display = 'block';
        
        setTimeout(() => {
            statusMsg.style.display = 'none';
        }, 5000);
    }
    
    // Validar formulario
    function validateForm() {
        if (nameInput.value.trim() === "") {
            showStatusMessage('error', "Por favor, ingrese su nombre completo.");
            return false;
        }
        if (!validateEmail(emailInput.value.trim())) {
            showStatusMessage('error', "Por favor, ingrese un correo electrónico válido.");
            return false;
        }
        if (subjectInput.value.trim() === "") {
            showStatusMessage('error', "Por favor, ingrese un asunto.");
            return false;
        }
        if (messageInput.value.trim() === "") {
            showStatusMessage('error', "Por favor, ingrese un mensaje.");
            return false;
        }
        if (!privacyCheckbox.checked) {
            showStatusMessage('error', "Debe aceptar la política de privacidad.");
            return false;
        }
        return true;
    }
    
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Manejar el modal de política de privacidad
    function setupPrivacyPolicy() {
        // Abrir modal al hacer clic en el enlace
        privacyPolicyLink.addEventListener('click', function(e) {
            e.preventDefault();
            const privacyModal = new bootstrap.Modal(document.getElementById('privacyPolicyModal'));
            privacyModal.show();
        });
        
        // Aceptar política de privacidad
        acceptPrivacyBtn.addEventListener('click', function() {
            privacyCheckbox.checked = true;
            bootstrap.Modal.getInstance(document.getElementById('privacyPolicyModal')).hide();
        });
    }
    
    // Mostrar modal de agradecimiento
    function showThankYouModal() {
        const thankYouModal = new bootstrap.Modal(document.getElementById('thankYouModal'));
        thankYouModal.show();
    }
    
    // Detectar si la imagen de fondo no carga
    function handleBackgroundImage() {
        const img = new Image();
        img.src = '../img/fondo-contacto.jpg';
        
        img.onerror = function() {
            document.body.classList.add('image-fallback');
        };
    }
    
    // Inicializar elementos visuales
    createElements();
    setupPrivacyPolicy();
    handleBackgroundImage();
    
    // Event Listeners para los campos de entrada
    const inputs = form.querySelectorAll('input[type="text"], input[type="email"], textarea');
    inputs.forEach(input => {
        input.addEventListener('input', updateProgressBar);
        
        // Efecto de flotar el label cuando el campo tiene contenido
        input.addEventListener('blur', function() {
            if (this.value.trim() !== '') {
                this.classList.add('has-content');
            } else {
                this.classList.remove('has-content');
            }
        });
    });
    
    // Event Listener para el efecto de onda en el botón
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.addEventListener('mousedown', createRippleEffect);
    
    // Event Listener para el envío del formulario
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!validateForm()) {
            form.classList.add('error-shake');
            setTimeout(() => {
                form.classList.remove('error-shake');
            }, 600);
            return;
        }

        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            subject: subjectInput.value.trim(),
            message: messageInput.value.trim(),
        };

        // Envío al backend
        fetch("http://localhost:8000/adoptme/api/v1/contacto", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.mensaje) {
                showStatusMessage('success', "¡Gracias! Tu mensaje ha sido enviado correctamente.");
                showToast();
                showThankYouModal();
                form.reset();
                updateProgressBar();
            } else {
                showStatusMessage('error', "Error al enviar el mensaje. Inténtalo de nuevo.");
            }
        })
        .catch(error => {
            console.error("Error en la solicitud:", error);
            showStatusMessage('error', "Hubo un problema al enviar el formulario.");
        });
    });
});