document.addEventListener('DOMContentLoaded', function() {
    // Cargar los servicios veterinarios
    loadVeterinaryServices();
    
    // Configurar botones de reserva
    setupReservationButtons();
    
    // Configurar el formulario de reserva
    setupReservationForm();
});

// Función para cargar los servicios veterinarios desde la API
async function loadVeterinaryServices() {
    try {
        const response = await fetch("https://montanitaadopta.onrender.com/adoptme/api/v1/veterinary_services/");
        
        if (!response.ok) {
            throw new Error('Error al cargar los servicios veterinarios');
        }
        
        const services = await response.json();
        
        // Actualizar los servicios en la página
        if (services && services.length > 0) {
            const serviceButtons = document.querySelectorAll('.reserve-btn');
            const servicePrices = document.querySelectorAll('.service-price');
            
            services.forEach((service, index) => {
                // Si hay botones disponibles, actualizar su información
                if (index < serviceButtons.length) {
                    const button = serviceButtons[index];
                    button.setAttribute('data-service-id', service.id);
                    button.setAttribute('data-service', service.name);
                }
                
                // Actualizar precio si existe el elemento
                if (index < servicePrices.length) {
                    const priceElement = servicePrices[index];
                    priceElement.textContent = formatColombiaPesos(service.price);
                }
            });
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Formatear precio en formato de pesos colombianos
function formatColombiaPesos(price) {
    // Formatear número sin decimales y con punto como separador de miles
    const formattedPrice = Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `$ ${formattedPrice}`;
}

// Configurar los botones de reserva
function setupReservationButtons() {
    const reserveButtons = document.querySelectorAll('.reserve-btn');
    
    reserveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const service = this.getAttribute('data-service');
            const serviceId = this.getAttribute('data-service-id');
            openReservationModal(service, serviceId);
        });
    });
}

// Abrir el modal de reserva
function openReservationModal(service, serviceId) {
    const modal = document.getElementById('reservationModal');
    const serviceTypeElement = document.getElementById('service-type');
    const serviceInput = document.getElementById('service-input');
    const serviceIdInput = document.getElementById('service-id-input');
    
    if (!modal) return;
    
    serviceTypeElement.textContent = `- ${service}`;
    serviceInput.value = service;
    
    if (serviceIdInput) {
        serviceIdInput.value = serviceId;
    }
    
    // Restablecer fecha mínima
    const today = new Date();
    const appointmentDate = document.getElementById('appointment-date');
    if (appointmentDate) {
        appointmentDate.min = today.toISOString().split('T')[0];
        appointmentDate.value = '';
    }
    
    // Limpiar horarios
    const timeSelect = document.getElementById('appointment-time');
    if (timeSelect) {
        timeSelect.innerHTML = '<option value="">Seleccionar...</option>';
    }
    
    modal.style.display = 'block';
}

// Cerrar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'none';
    
    // Si es el modal de reserva, resetear el formulario
    if (modalId === 'reservationModal') {
        const form = document.getElementById('reservation-form');
        if (form) {
            form.reset();
        }
    }
}

// Configurar el formulario de reserva
function setupReservationForm() {
    const form = document.getElementById('reservation-form');
    const appointmentDate = document.getElementById('appointment-date');
    const timeSelect = document.getElementById('appointment-time');
    
    if (!form) return;
    
    // Configurar la fecha mínima como hoy
    if (appointmentDate) {
        const today = new Date();
        appointmentDate.min = today.toISOString().split('T')[0];
        
        // Cuando cambia la fecha, cargar horas disponibles
        appointmentDate.addEventListener('change', function() {
            loadAvailableTimes(this.value);
        });
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validar el formulario
        if (!validateReservationForm()) {
            return;
        }
        
        // Recopilar datos del formulario
        const formData = new FormData(form);
        const reservationData = {
            service_id: parseInt(document.getElementById('service-id-input')?.value || "0"),
            pet_owner: formData.get('petOwner'),
            pet_name: formData.get('petName'),
            pet_type: formData.get('petType'),
            appointment_date: formData.get('appointmentDate'),
            appointment_time: formData.get('appointmentTime'),
            notes: formData.get('notes') || ""
        };
        
        // Enviar datos a la API
        try {
            const result = await submitReservation(reservationData);
            if (result.success) {
                showSuccessMessage();
                
                // Cerrar el modal después de un tiempo
                setTimeout(() => {
                    closeModal('reservationModal');
                    resetReservationForm();
                }, 3000);
            } else {
                showErrorMessage(result.error || "Error en la reserva");
            }
        } catch (error) {
            showErrorMessage(error.message);
        }
    });
}

// Cargar horas disponibles para citas
async function loadAvailableTimes(selectedDate) {
    const timeSelect = document.getElementById('appointment-time');
    const serviceIdInput = document.getElementById('service-id-input');
    
    if (!timeSelect || !selectedDate) return;
    
    // Limpiar opciones actuales
    timeSelect.innerHTML = '<option value="">Seleccionar...</option>';
    timeSelect.disabled = true;
    
    // Añadir indicador de carga
    const loadingOption = document.createElement('option');
    loadingOption.textContent = 'Cargando horarios...';
    timeSelect.appendChild(loadingOption);
    
    try {
        // Preparar datos para la solicitud
        const requestData = {
            date: selectedDate,
            service_id: serviceIdInput ? parseInt(serviceIdInput.value) : undefined
        };
        
        // Enviar solicitud a la API para verificar disponibilidad
        const response = await fetch("https://montanitaadopta.onrender.com/adoptme/api/v1/veterinary_services/availability/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar los horarios disponibles');
        }
        
        const availabilityData = await response.json();
        
        // Limpiar opciones
        timeSelect.innerHTML = '<option value="">Seleccionar horario...</option>';
        
        // Añadir las opciones de horarios disponibles
        if (availabilityData.time_slots && availabilityData.time_slots.length > 0) {
            availabilityData.time_slots.forEach(slot => {
                if (slot.available) {
                    const option = document.createElement('option');
                    option.value = slot.time;
                    option.textContent = formatTime(slot.time);
                    timeSelect.appendChild(option);
                }
            });
        } else {
            const noTimesOption = document.createElement('option');
            noTimesOption.textContent = 'No hay horarios disponibles';
            timeSelect.appendChild(noTimesOption);
        }
    } catch (error) {
        console.error('Error:', error);
        timeSelect.innerHTML = '<option value="">Error al cargar horarios</option>';
    } finally {
        timeSelect.disabled = false;
    }
}

// Formatear la hora para mostrar (de 24h a 12h)
function formatTime(time) {
    try {
        const [hours, minutes] = time.split(':').map(num => parseInt(num));
        let period = 'AM';
        let formattedHours = hours;
        
        if (hours >= 12) {
            period = 'PM';
            formattedHours = hours === 12 ? 12 : hours - 12;
        } else if (hours === 0) {
            formattedHours = 12;
        }
        
        return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (e) {
        return time;
    }
}

// Validar el formulario de reserva
function validateReservationForm() {
    const form = document.getElementById('reservation-form');
    
    // Verificar campos obligatorios
    const requiredFields = ['petOwner', 'petName', 'petType', 'appointmentDate', 'appointmentTime'];
    let isValid = true;
    
    requiredFields.forEach(field => {
        const input = form.querySelector(`[name="${field}"]`);
        if (input && !input.value.trim()) {
            isValid = false;
            highlightError(input);
        } else if (input) {
            removeHighlight(input);
        }
    });
    
    if (!isValid) {
        showErrorMessage('Por favor, complete todos los campos obligatorios.');
    }
    
    return isValid;
}

// Resaltar campo con error
function highlightError(input) {
    input.classList.add('error-input');
    
    // Si hay un contenedor padre, añadir mensaje de error
    const parentContainer = input.closest('.form-group');
    if (parentContainer) {
        // Eliminar mensaje de error anterior si existe
        const existingError = parentContainer.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Añadir nuevo mensaje de error
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Este campo es obligatorio';
        parentContainer.appendChild(errorMessage);
    }
}

// Quitar resaltado de error
function removeHighlight(input) {
    input.classList.remove('error-input');
    
    // Eliminar mensaje de error si existe
    const parentContainer = input.closest('.form-group');
    if (parentContainer) {
        const errorMessage = parentContainer.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
}

// Enviar datos de reserva a la API
async function submitReservation(reservationData) {
    try {
        const response = await fetch("https://montanitaadopta.onrender.com/adoptme/api/v1/veterinary_services/reservations/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservationData)
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.detail || 'Error al realizar la reserva');
        }
        
        return {
            success: true,
            data: responseData
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Mostrar mensaje de éxito
function showSuccessMessage() {
    const messageContainer = document.getElementById('reservation-message');
    if (!messageContainer) return;
    
    messageContainer.className = 'success-message';
    messageContainer.textContent = '¡Reserva realizada con éxito! En breve recibirás un correo de confirmación.';
    messageContainer.style.display = 'block';
}

// Mostrar mensaje de error
function showErrorMessage(message) {
    const messageContainer = document.getElementById('reservation-message');
    if (!messageContainer) return;
    
    messageContainer.className = 'error-message';
    messageContainer.textContent = message || 'Ha ocurrido un error en el proceso de reserva.';
    messageContainer.style.display = 'block';
}

// Resetear formulario de reserva
function resetReservationForm() {
    const form = document.getElementById('reservation-form');
    if (!form) return;
    
    form.reset();
    
    // Limpiar mensajes
    const messageContainer = document.getElementById('reservation-message');
    if (messageContainer) {
        messageContainer.style.display = 'none';
        messageContainer.textContent = '';
    }
    
    // Limpiar errores
    const errorInputs = form.querySelectorAll('.error-input');
    errorInputs.forEach(input => removeHighlight(input));
    
    // Resetear selectores
    const timeSelect = document.getElementById('appointment-time');
    if (timeSelect) {
        timeSelect.innerHTML = '<option value="">Seleccionar...</option>';
    }
}

// Inicializar la visualización de precios en elementos existentes en la página
function initializePrices() {
    const staticPrices = document.querySelectorAll('.static-price');
    
    staticPrices.forEach(element => {
        // Obtener el valor original
        const originalValue = element.getAttribute('data-price');
        if (originalValue) {
            // Formatear y mostrar
            element.textContent = formatColombiaPesos(parseFloat(originalValue));
        }
    });
}

// Llamar a la función de inicialización de precios cuando se carga el documento
document.addEventListener('DOMContentLoaded', function() {
    initializePrices();
});