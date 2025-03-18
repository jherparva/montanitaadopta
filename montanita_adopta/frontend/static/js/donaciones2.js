document.addEventListener('DOMContentLoaded', function() {
    // Manejar el efecto de las opciones de entrega
    const deliveryOptions = document.querySelectorAll('.delivery-option');
    const pickupAddressDiv = document.getElementById('pickup-address');
    const pickupAddressInput = document.getElementById('pickup-address-input');
    const shelterLocationDiv = document.getElementById('shelter-location');

    deliveryOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Eliminar clase activa de todas las opciones
            deliveryOptions.forEach(opt => opt.classList.remove('active'));
            // Añadir clase activa a la opción seleccionada
            this.classList.add('active');
            
            // Mostrar/ocultar campos según la opción seleccionada
            const optionType = this.getAttribute('data-option');
            
            if (optionType === 'pickup') {
                pickupAddressDiv.style.display = 'block';
                shelterLocationDiv.style.display = 'none';
                pickupAddressInput.setAttribute('required', 'required');
            } else if (optionType === 'self') {
                pickupAddressDiv.style.display = 'none';
                shelterLocationDiv.style.display = 'block';
                pickupAddressInput.removeAttribute('required');
            } else {
                pickupAddressDiv.style.display = 'none';
                shelterLocationDiv.style.display = 'none';
                pickupAddressInput.removeAttribute('required');
            }
        });
    });

    // Manejar el envío del formulario de donación de alimentos
    const donationForm = document.querySelector('.donation-form');
    if (donationForm) {
        donationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Verificar que se haya seleccionado una opción de entrega
            const selectedOption = document.querySelector('.delivery-option.active');
            if (!selectedOption) {
                alert('Por favor selecciona una opción de entrega');
                return;
            }
            
            // Recopilar datos del formulario
            const formData = {
                foodType: document.getElementById('food-type').value,
                quantity: document.getElementById('quantity').value,
                deliveryOption: selectedOption.getAttribute('data-option'),
                pickupAddress: selectedOption.getAttribute('data-option') === 'pickup' ? 
                    document.getElementById('pickup-address-input').value : null
            };
            
            // Aquí puedes enviar los datos a tu backend
            console.log('Datos de donación:', formData);
            
            // Mostrar mensaje de confirmación
            showConfirmationMessage();
        });
    }

    // Función para mostrar mensaje de confirmación
    function showConfirmationMessage() {
        // Crear elemento de mensaje
        const confirmationMsg = document.createElement('div');
        confirmationMsg.className = 'alert alert-success mt-4';
        confirmationMsg.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            <strong>¡Gracias por tu donación!</strong> Hemos registrado tu aporte y nos pondremos en contacto contigo pronto.
        `;
        
        // Limpiar formulario y mostrar mensaje
        donationForm.reset();
        document.querySelectorAll('.delivery-option').forEach(opt => opt.classList.remove('active'));
        pickupAddressDiv.style.display = 'none';
        shelterLocationDiv.style.display = 'none';
        
        // Añadir mensaje al final del formulario
        donationForm.appendChild(confirmationMsg);
        
        // Eliminar mensaje después de 5 segundos
        setTimeout(() => {
            confirmationMsg.remove();
        }, 5000);
    }

    // Efecto de desplazamiento suave para los enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Manejar cambio de ciudad para la recogida
    const pickupCitySelect = document.getElementById('pickup-city');
    const localPickupDiv = document.getElementById('local-pickup');
    const remotePickupDiv = document.getElementById('remote-pickup');

    if (pickupCitySelect) {
        pickupCitySelect.addEventListener('change', function() {
            if (this.value === 'mismo-ciudad') {
                localPickupDiv.style.display = 'block';
                remotePickupDiv.style.display = 'none';
            } else {
                localPickupDiv.style.display = 'none';
                remotePickupDiv.style.display = 'block';
            }
        });
    }

    // Manejar los botones de enviar evidencia
    const evidenceButtons = document.querySelectorAll('.send-evidence');
    evidenceButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Obtener el tipo de método de pago desde el padre
            const paymentMethod = this.closest('.payment-method');
            const paymentType = paymentMethod ? paymentMethod.id : 'general';
            const paymentNumber = paymentMethod ? paymentMethod.querySelector('.payment-number').innerText.trim() : '';
            
            // Número de WhatsApp de la fundación
            const whatsappNumber = '57314555789';
            // Mensaje predefinido
            let message = `Hola! He realizado una donación a través de ${paymentType}`;
            if (paymentNumber) {
                message += ` al número ${paymentNumber}. Aquí está mi comprobante de pago.`;
            }
            
            // Crear link de WhatsApp
            const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
            
            // Abrir WhatsApp en una nueva ventana
            window.open(whatsappLink, '_blank');
        });
    });

    // Comprobar si hay problemas de visualización del mapa
    const mapIframes = document.querySelectorAll('.map-container iframe');
    mapIframes.forEach(iframe => {
        // Verificar si se cargó correctamente el iframe
        iframe.addEventListener('error', function() {
            // Si hay error, mostrar los botones alternativos
            const alternativeLinks = iframe.parentElement.querySelector('.map-alternatives');
            if (alternativeLinks) {
                alternativeLinks.style.display = 'block';
            }
        });
    });

    // Añadir estilos adicionales para mejorar visibilidad de los botones
    const addStylesToPage = () => {
        const style = document.createElement('style');
        style.textContent = `
            .donations-page .delivery-option {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                color: #212529;
                margin-bottom: 10px;
                transition: all 0.3s ease;
            }
            
            .donations-page .delivery-option:hover {
                background-color: #e9ecef;
            }
            
            .donations-page .delivery-option.active {
                background-color: #198754;
                color: white;
                border-color: #198754;
            }
            
            .donations-page .btn-primary {
                background-color:rgb(46, 69, 197);
                border-color:rgb(4, 0, 255);
                color: white;
            }
            
            .donations-page .btn-primary:hover {
                background-color:rgb(36, 24, 199);
                border-color:rgb(57, 18, 230);
            }
            
            .donations-page .btn-outline-primary {
                color:rgb(49, 30, 224);
                border-color:rgb(66, 30, 224);
            }
            
            .donations-page .btn-outline-primary:hover {
                background-color:rgb(30, 33, 224);
                color: white;
            }
            
            .donations-page .map-alternatives {
                margin-top: 10px;
                text-align: center;
                display: none;
            }
            
            .pulse-animation {
                animation: pulse 1s;
            }
            @keyframes pulse {
                0% {
                    transform: scale(1);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                }
                50% {
                    transform: scale(1.05);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
                }
                100% {
                    transform: scale(1);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                }
            }
        `;
        document.head.appendChild(style);
    };
    
    // Ejecutar la función para añadir estilos
    addStylesToPage();

    // Animación para los números estadísticos
    const statNumbers = document.querySelectorAll('.stat-number');
    
    function animateNumbers() {
        statNumbers.forEach(stat => {
            const finalValue = stat.innerText;
            const isPercentage = finalValue.includes('%');
            const numericValue = parseFloat(finalValue.replace(/[^0-9.-]+/g, ''));
            
            let startValue = 0;
            const duration = 2000;
            const frameDuration = 1000/60;
            const totalFrames = Math.round(duration / frameDuration);
            const increment = numericValue / totalFrames;
            
            const counter = setInterval(() => {
                startValue += increment;
                
                if (startValue >= numericValue) {
                    stat.innerText = finalValue;
                    clearInterval(counter);
                } else {
                    if (isPercentage) {
                        stat.innerText = Math.floor(startValue) + '%';
                    } else if (finalValue.includes('+')) {
                        stat.innerText = Math.floor(startValue) + '+';
                    } else {
                        stat.innerText = Math.floor(startValue);
                    }
                }
            }, frameDuration);
        });
    }

    // Ejecutar animación cuando los elementos sean visibles
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    // Observar la sección de estadísticas
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        observer.observe(statsSection);
    }

    // Efecto de resaltado para los métodos de pago
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            const paymentInfo = this.querySelector('.payment-number');
            
            // Copiar al portapapeles si es posible
            if (paymentInfo && navigator.clipboard) {
                const textToCopy = paymentInfo.innerText.replace(/[📱🏦]/g, '').trim();
                navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        // Mostrar mensaje de copiado
                        const copyMsg = document.createElement('div');
                        copyMsg.className = 'copy-message';
                        copyMsg.textContent = '¡Copiado al portapapeles!';
                        copyMsg.style.position = 'absolute';
                        copyMsg.style.bottom = '10px';
                        copyMsg.style.left = '50%';
                        copyMsg.style.transform = 'translateX(-50%)';
                        copyMsg.style.backgroundColor = 'rgba(16, 134, 6, 0.8)';
                        copyMsg.style.color = 'white';
                        copyMsg.style.padding = '5px 10px';
                        copyMsg.style.borderRadius = '5px';
                        copyMsg.style.fontSize = '0.9rem';
                        
                        this.style.position = 'relative';
                        this.appendChild(copyMsg);
                        
                        setTimeout(() => {
                            copyMsg.remove();
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Error al copiar: ', err);
                    });
            }
            
            // Animar el método de pago
            this.classList.add('pulse-animation');
            setTimeout(() => {
                this.classList.remove('pulse-animation');
            }, 1000);
        });
    });

    // Validar cantidad de donación
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', function() {
            const value = parseFloat(this.value);
            if (value <= 0) {
                this.setCustomValidity('La cantidad debe ser mayor que cero');
            } else if (value > 1000) {
                this.setCustomValidity('Para donaciones mayores a 1000 kg, por favor contáctanos directamente');
            } else {
                this.setCustomValidity('');
            }
        });
    }

    // Mostrar u ocultar la información de urgencia basada en la fecha
    const urgentMessage = document.querySelector('.urgent-message');
    if (urgentMessage) {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 es domingo, 6 es sábado
        
        // Mostrar el mensaje de urgencia solo de lunes a viernes
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            urgentMessage.style.display = 'none';
        }
    }

    // Configurar el modal para evidencias de pago
    const donationButtons = document.querySelectorAll('.donate-button');
    if (donationButtons.length > 0) {
        donationButtons.forEach(button => {
            button.addEventListener('click', function() {
                const donationAmount = document.getElementById('donation-amount');
                if (donationAmount && parseFloat(donationAmount.value) <= 0) {
                    alert('Por favor ingresa un monto válido para donar');
                    return;
                }
                
                // Aquí podría abrir un modal de confirmación o redireccionar
                console.log('Procesando donación de', donationAmount ? donationAmount.value : 'monto no especificado');
            });
        });
    }
    
    // Manejar solicitud de certificado de donación
    const requestCertificateCheckbox = document.getElementById('request-certificate');
    const certificateFields = document.getElementById('certificate-fields');
    
    if (requestCertificateCheckbox && certificateFields) {
        requestCertificateCheckbox.addEventListener('change', function() {
            if (this.checked) {
                certificateFields.style.display = 'block';
                document.getElementById('certificate-name').setAttribute('required', 'required');
                document.getElementById('certificate-email').setAttribute('required', 'required');
                document.getElementById('certificate-id').setAttribute('required', 'required');
            } else {
                certificateFields.style.display = 'none';
                document.getElementById('certificate-name').removeAttribute('required');
                document.getElementById('certificate-email').removeAttribute('required');
                document.getElementById('certificate-id').removeAttribute('required');
            }
        });
    }
    
    // Función para manejar la cantidad de donación monetaria
    const donationAmountInput = document.getElementById('donation-amount');
    if (donationAmountInput) {
        donationAmountInput.addEventListener('input', function() {
            const value = parseFloat(this.value);
            if (isNaN(value) || value <= 0) {
                this.setCustomValidity('Por favor ingresa un monto válido mayor a cero');
            } else {
                this.setCustomValidity('');
            }
        });
    }
    
    // Función para manejar el formulario de donación monetaria
    const monetaryDonationForm = document.getElementById('monetary-donation-form');
    if (monetaryDonationForm) {
        monetaryDonationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Recopilar datos del formulario
            const formData = {
                amount: document.getElementById('donation-amount').value,
                paymentMethod: document.querySelector('input[name="payment-method"]:checked')?.value || 'not-selected',
                name: document.getElementById('donor-name')?.value || '',
                email: document.getElementById('donor-email')?.value || '',
                message: document.getElementById('donor-message')?.value || '',
                requestCertificate: document.getElementById('request-certificate')?.checked || false
            };
            
            // Si se solicita certificado, agregar esos datos
            if (formData.requestCertificate) {
                formData.certificateName = document.getElementById('certificate-name').value;
                formData.certificateEmail = document.getElementById('certificate-email').value;
                formData.certificateId = document.getElementById('certificate-id').value;
            }
            
            // Aquí puedes enviar los datos a tu backend
            console.log('Datos de donación monetaria:', formData);
            
            // Mostrar mensaje de confirmación
            showMonetaryConfirmationMessage();
        });
    }
    
    // Función para mostrar mensaje de confirmación de donación monetaria
    function showMonetaryConfirmationMessage() {
        // Crear elemento de mensaje
        const confirmationMsg = document.createElement('div');
        confirmationMsg.className = 'alert alert-success mt-4';
        confirmationMsg.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            <strong>¡Gracias por tu donación!</strong> Tu aporte hace una gran diferencia en la vida de nuestros animales rescatados.
        `;
        
        // Limpiar formulario y mostrar mensaje
        if (monetaryDonationForm) {
            monetaryDonationForm.reset();
            monetaryDonationForm.appendChild(confirmationMsg);
            
            // Eliminar mensaje después de 5 segundos
            setTimeout(() => {
                confirmationMsg.remove();
            }, 5000);
        }
    }
    
    // Función para manejar el formulario de contacto rápido
    const quickContactForm = document.getElementById('quick-contact-form');
    if (quickContactForm) {
        quickContactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Recopilar datos del formulario
            const formData = {
                name: document.getElementById('quick-name').value,
                email: document.getElementById('quick-email').value,
                message: document.getElementById('quick-message').value
            };
            
            // Aquí puedes enviar los datos a tu backend
            console.log('Datos de contacto rápido:', formData);
            
            // Mostrar mensaje de confirmación
            const confirmationMsg = document.createElement('div');
            confirmationMsg.className = 'alert alert-success mt-3';
            confirmationMsg.innerHTML = `
                <i class="fas fa-check-circle me-2"></i>
                <strong>¡Mensaje enviado!</strong> Nos pondremos en contacto contigo pronto.
            `;
            
            quickContactForm.reset();
            quickContactForm.appendChild(confirmationMsg);
            
            setTimeout(() => {
                confirmationMsg.remove();
            }, 5000);
        });
    }
    
    // Función para actualizar el resumen de donación
    function updateDonationSummary() {
        const donationAmount = document.getElementById('donation-amount');
        const summaryAmount = document.getElementById('summary-amount');
        const summaryImpact = document.getElementById('summary-impact');
        
        if (donationAmount && summaryAmount && summaryImpact) {
            const amount = parseFloat(donationAmount.value);
            
            if (!isNaN(amount) && amount > 0) {
                summaryAmount.textContent = `$${amount.toLocaleString()}`;
                
                // Calcular impacto aproximado
                let impact = '';
                if (amount < 50000) {
                    impact = 'Comida para 1 animal durante 1 semana';
                } else if (amount < 100000) {
                    impact = 'Tratamiento básico veterinario para 1 animal';
                } else if (amount < 200000) {
                    impact = 'Alimentación y cuidados básicos para 3 animales durante 1 mes';
                } else {
                    impact = 'Tratamiento completo, alimentación y cuidados para múltiples animales';
                }
                
                summaryImpact.textContent = impact;
            }
        }
    }
    
    // Configurar eventos relacionados con la donación monetaria
    const donationAmountForSummary = document.getElementById('donation-amount');
    if (donationAmountForSummary) {
        donationAmountForSummary.addEventListener('input', updateDonationSummary);
        // Actualizar el resumen cuando se carga la página
        updateDonationSummary();
    }
    
    // Cerrar la donación final
});