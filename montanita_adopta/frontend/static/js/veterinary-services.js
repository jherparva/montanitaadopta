document.addEventListener("DOMContentLoaded", () => {
    console.log("Documento cargado, inicializando...")
  
    // Cargar los servicios veterinarios inmediatamente
    loadVeterinaryServices().then(() => {
      // Configurar botones solo después de cargar los servicios
      setupAllButtons()
    })
  })
  
  // Función para cargar los servicios veterinarios desde la API
  async function loadVeterinaryServices() {
    try {
      console.log("Cargando servicios veterinarios...")
      const response = await fetch("https://montanitaadopta.onrender.com/adoptme/api/v1/veterinary_services/")
  
      if (!response.ok) {
        throw new Error(`Error al cargar los servicios veterinarios: ${response.status} ${response.statusText}`)
      }
  
      const services = await response.json()
      console.log("Servicios cargados:", services)
  
      if (!services || services.length === 0) {
        console.error("No se recibieron servicios de la API")
        return false
      }
  
      // Guardar los servicios en localStorage para uso posterior
      localStorage.setItem("veterinaryServices", JSON.stringify(services))
      console.log("Servicios guardados en localStorage")
  
      // Mapear servicios por nombre para facilitar su búsqueda
      const serviceMap = {}
      services.forEach((service) => {
        serviceMap[service.name.toLowerCase()] = service
      })
      localStorage.setItem("veterinaryServicesMap", JSON.stringify(serviceMap))
  
      return true
    } catch (error) {
      console.error("Error al cargar servicios:", error)
      return false
    }
  }
  
  // Configurar todos los botones después de cargar los servicios
  function setupAllButtons() {
    // Intentar obtener los servicios del localStorage
    const servicesJson = localStorage.getItem("veterinaryServices")
    if (!servicesJson) {
      console.error("No se encontraron servicios en localStorage para configurar botones")
      return
    }
  
    const services = JSON.parse(servicesJson)
    console.log(`Configurando botones con ${services.length} servicios disponibles`)
  
    // Configurar botones de reserva
    setupReservationButtons(services)
  
    // Configurar botones de más información
    setupInfoButtons(services)
  
    // Actualizar precios
    updatePrices(services)
  }
  
  // Formatear precio en formato de pesos colombianos
  function formatColombiaPesos(price) {
    if (price === undefined || price === null) return "$ 0"
    // Formatear número sin decimales y con punto como separador de miles
    const formattedPrice = Math.round(price)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    return `$ ${formattedPrice}`
  }
  
  // Actualizar precios en la página
  function updatePrices(services) {
    // Actualizar precios en elementos con clase service-price
    const priceElements = document.querySelectorAll(".service-price")
    console.log(`Encontrados ${priceElements.length} elementos de precio`)
  
    if (priceElements.length === 0) {
      console.warn("No se encontraron elementos con clase 'service-price'")
    }
  
    // Intentar diferentes estrategias para actualizar los precios
  
    // Estrategia 1: Si hay tantos elementos de precio como servicios, asignar en orden
    if (priceElements.length === services.length) {
      priceElements.forEach((element, index) => {
        if (index < services.length) {
          element.textContent = formatColombiaPesos(services[index].price)
          console.log(`Precio actualizado (estrategia 1): ${formatColombiaPesos(services[index].price)}`)
        }
      })
    }
    // Estrategia 2: Buscar elementos cercanos que contengan el nombre del servicio
    else {
      priceElements.forEach((element) => {
        // Buscar el contenedor padre (puede ser un div, card, etc.)
        const container = element.closest(".service-card") || element.parentElement
        if (!container) return
  
        // Buscar texto que pueda contener el nombre del servicio
        const textElements = container.querySelectorAll("h2, h3, h4, .service-name, .title")
  
        for (const textEl of textElements) {
          const serviceName = textEl.textContent.trim().toLowerCase()
  
          // Buscar un servicio que coincida con este nombre
          for (const service of services) {
            if (service.name.toLowerCase().includes(serviceName) || serviceName.includes(service.name.toLowerCase())) {
              element.textContent = formatColombiaPesos(service.price)
              console.log(`Precio actualizado (estrategia 2) para ${service.name}: ${formatColombiaPesos(service.price)}`)
              break
            }
          }
        }
      })
    }
  
    // Actualizar también precios estáticos
    const staticPrices = document.querySelectorAll(".static-price")
    staticPrices.forEach((element) => {
      const originalValue = element.getAttribute("data-price")
      if (originalValue) {
        element.textContent = formatColombiaPesos(Number.parseFloat(originalValue))
      }
    })
  }
  
  // Configurar los botones de reserva
  function setupReservationButtons(services) {
    const reserveButtons = document.querySelectorAll(".reserve-btn")
    console.log(`Configurando ${reserveButtons.length} botones de reserva`)
  
    if (reserveButtons.length === 0) {
      console.warn("No se encontraron botones con clase 'reserve-btn'")
    }
  
    reserveButtons.forEach((button, index) => {
      // Intentar determinar qué servicio corresponde a este botón
      let serviceId = null
      let serviceName = null
  
      // Estrategia 1: Usar atributos data existentes
      serviceId = button.getAttribute("data-service-id")
      serviceName = button.getAttribute("data-service")
  
      // Estrategia 2: Si no hay ID pero hay nombre, buscar el ID por nombre
      if ((!serviceId || serviceId === "null") && serviceName) {
        const service = services.find((s) => s.name.toLowerCase() === serviceName.toLowerCase())
        if (service) {
          serviceId = service.id
          console.log(`ID de servicio encontrado por nombre: ${serviceId}`)
        }
      }
  
      // Estrategia 3: Buscar texto cercano que pueda ser el nombre del servicio
      if (!serviceId || serviceId === "null") {
        // Buscar el contenedor padre (puede ser un div, card, etc.)
        const container = button.closest(".service-card") || button.parentElement
        if (container) {
          // Buscar texto que pueda contener el nombre del servicio
          const textElements = container.querySelectorAll("h2, h3, h4, .service-name, .title")
  
          for (const textEl of textElements) {
            const text = textEl.textContent.trim()
  
            // Buscar un servicio que coincida con este nombre
            const service = services.find(
              (s) =>
                s.name.toLowerCase().includes(text.toLowerCase()) || text.toLowerCase().includes(s.name.toLowerCase()),
            )
  
            if (service) {
              serviceId = service.id
              serviceName = service.name
              console.log(`Servicio encontrado por texto cercano: ${serviceName} (ID: ${serviceId})`)
              break
            }
          }
        }
      }
  
      // Estrategia 4: Si hay tantos botones como servicios, asignar en orden
      if ((!serviceId || serviceId === "null") && reserveButtons.length === services.length) {
        if (index < services.length) {
          serviceId = services[index].id
          serviceName = services[index].name
          console.log(`Servicio asignado por posición: ${serviceName} (ID: ${serviceId})`)
        }
      }
  
      // Actualizar los atributos data del botón
      if (serviceId && serviceId !== "null") {
        button.setAttribute("data-service-id", serviceId)
        if (serviceName) {
          button.setAttribute("data-service", serviceName)
        }
        console.log(`Botón de reserva configurado: ID=${serviceId}, Nombre=${serviceName}`)
      } else {
        console.warn(`No se pudo determinar el servicio para un botón de reserva`)
      }
  
      // Añadir evento click
      button.addEventListener("click", function () {
        const service = this.getAttribute("data-service")
        const serviceId = this.getAttribute("data-service-id")
        console.log(`Botón de reserva clickeado: servicio=${service}, id=${serviceId}`)
        openReservationModal(service, serviceId)
      })
    })
  }
  
  // Configurar los botones de más información
  function setupInfoButtons(services) {
    const infoButtons = document.querySelectorAll(".info-btn")
    console.log(`Configurando ${infoButtons.length} botones de información`)
  
    if (infoButtons.length === 0) {
      console.warn("No se encontraron botones con clase 'info-btn'")
    }
  
    infoButtons.forEach((button, index) => {
      // Intentar determinar qué servicio corresponde a este botón (similar a setupReservationButtons)
      let serviceId = null
      let serviceName = null
  
      // Estrategia 1: Usar atributos data existentes
      serviceId = button.getAttribute("data-service-id")
      serviceName = button.getAttribute("data-service")
  
      // Estrategia 2: Si no hay ID pero hay nombre, buscar el ID por nombre
      if ((!serviceId || serviceId === "null") && serviceName) {
        const service = services.find((s) => s.name.toLowerCase() === serviceName.toLowerCase())
        if (service) {
          serviceId = service.id
        }
      }
  
      // Estrategia 3: Buscar texto cercano que pueda ser el nombre del servicio
      if (!serviceId || serviceId === "null") {
        // Buscar el contenedor padre (puede ser un div, card, etc.)
        const container = button.closest(".service-card") || button.parentElement
        if (container) {
          // Buscar texto que pueda contener el nombre del servicio
          const textElements = container.querySelectorAll("h2, h3, h4, .service-name, .title")
  
          for (const textEl of textElements) {
            const text = textEl.textContent.trim()
  
            // Buscar un servicio que coincida con este nombre
            const service = services.find(
              (s) =>
                s.name.toLowerCase().includes(text.toLowerCase()) || text.toLowerCase().includes(s.name.toLowerCase()),
            )
  
            if (service) {
              serviceId = service.id
              serviceName = service.name
              break
            }
          }
        }
      }
  
      // Estrategia 4: Si hay tantos botones como servicios, asignar en orden
      if ((!serviceId || serviceId === "null") && infoButtons.length === services.length) {
        if (index < services.length) {
          serviceId = services[index].id
          serviceName = services[index].name
        }
      }
  
      // Actualizar los atributos data del botón
      if (serviceId && serviceId !== "null") {
        button.setAttribute("data-service-id", serviceId)
        if (serviceName) {
          button.setAttribute("data-service", serviceName)
        }
        console.log(`Botón de información configurado: ID=${serviceId}, Nombre=${serviceName}`)
      } else {
        console.warn(`No se pudo determinar el servicio para un botón de información`)
      }
  
      // Añadir evento click
      button.addEventListener("click", function () {
        const serviceId = this.getAttribute("data-service-id")
        console.log(`Botón de información clickeado: id=${serviceId}`)
        openInfoModal(serviceId)
      })
    })
  }
  
  // Abrir modal de información
  function openInfoModal(serviceId) {
    console.log(`Intentando abrir modal de información para servicio ID=${serviceId}`)
  
    // Si no hay ID de servicio, intentar recuperarlo
    if (!serviceId || serviceId === "null" || serviceId === "undefined") {
      console.error("ID de servicio inválido para modal de información:", serviceId)
      alert("Error: No se pudo determinar el servicio seleccionado.")
      return
    }
  
    // Obtener los servicios del localStorage
    const servicesJson = localStorage.getItem("veterinaryServices")
    if (!servicesJson) {
      console.error("No se encontraron servicios en localStorage")
      loadVeterinaryServices().then((success) => {
        if (success) {
          // Intentar nuevamente después de cargar los servicios
          openInfoModal(serviceId)
        } else {
          alert("Error: No se pudieron cargar los servicios. Por favor, recargue la página.")
        }
      })
      return
    }
  
    const services = JSON.parse(servicesJson)
    const service = services.find((s) => s.id == serviceId)
  
    if (!service) {
      console.error(`No se encontró el servicio con ID ${serviceId}`)
      alert("Error: Servicio no encontrado.")
      return
    }
  
    // Obtener el modal de información
    let modal = document.getElementById("infoModal")
    if (!modal) {
      console.log("Modal de información no encontrado, creándolo dinámicamente")
      createInfoModal()
      modal = document.getElementById("infoModal")
    }
  
    // Actualizar contenido del modal
    const modalTitle = modal.querySelector(".modal-title")
    const modalDescription = modal.querySelector(".modal-description")
    const modalPrice = modal.querySelector(".modal-price")
    const modalDuration = modal.querySelector(".modal-duration")
  
    if (modalTitle) modalTitle.textContent = service.name
    if (modalDescription) modalDescription.textContent = service.description || "No hay descripción disponible"
    if (modalPrice) modalPrice.textContent = `Precio: ${formatColombiaPesos(service.price)}`
    if (modalDuration) modalDuration.textContent = `Duración: ${service.duration_minutes} minutos`
  
    // Mostrar el modal
    modal.style.display = "block"
  }
  
  // Crear modal de información dinámicamente si no existe
  function createInfoModal() {
    const modalHtml = `
      <div id="infoModal" class="modal">
          <div class="modal-content">
              <span class="close" onclick="closeModal('infoModal')">&times;</span>
              <h2 class="modal-title">Información del Servicio</h2>
              <p class="modal-description"></p>
              <p class="modal-price"></p>
              <p class="modal-duration"></p>
              <button class="btn btn-primary" onclick="closeModal('infoModal')">Cerrar</button>
          </div>
      </div>
      `
  
    // Añadir el modal al body
    document.body.insertAdjacentHTML("beforeend", modalHtml)
  
    // Añadir estilos si es necesario
    const style = document.createElement("style")
    style.textContent = `
      .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgba(0,0,0,0.4);
      }
      .modal-content {
          background-color: #fefefe;
          margin: 15% auto;
          padding: 20px;
          border: 1px solid #888;
          width: 80%;
          max-width: 500px;
          border-radius: 5px;
      }
      .close {
          color: #aaa;
          float: right;
          font-size: 28px;
          font-weight: bold;
          cursor: pointer;
      }
      .close:hover {
          color: black;
      }
      `
    document.head.appendChild(style)
  }
  
  // Abrir el modal de reserva
  function openReservationModal(service, serviceId) {
    console.log(`Abriendo modal de reserva: servicio=${service}, id=${serviceId}`)
  
    const modal = document.getElementById("reservationModal")
    const serviceTypeElement = document.getElementById("service-type")
    const serviceInput = document.getElementById("service-input")
    const serviceIdInput = document.getElementById("service-id-input")
  
    if (!modal) {
      console.error("Modal de reserva no encontrado")
      alert("Error: Modal de reserva no encontrado.")
      return
    }
  
    // Verificar que el ID del servicio sea válido
    if (!serviceId || serviceId === "null" || serviceId === "undefined") {
      console.error("ID de servicio inválido:", serviceId)
  
      // Intentar obtener el ID del servicio desde localStorage
      const servicesJson = localStorage.getItem("veterinaryServices")
      if (servicesJson) {
        const services = JSON.parse(servicesJson)
  
        // Buscar por nombre exacto
        let foundService = services.find((s) => s.name === service)
  
        // Si no se encuentra, buscar por nombre parcial
        if (!foundService && service) {
          foundService = services.find(
            (s) =>
              s.name.toLowerCase().includes(service.toLowerCase()) ||
              service.toLowerCase().includes(s.name.toLowerCase()),
          )
        }
  
        if (foundService) {
          serviceId = foundService.id
          service = foundService.name
          console.log(`ID de servicio recuperado de localStorage: ${serviceId}`)
        }
      }
  
      // Si aún no tenemos un ID válido, mostrar error
      if (!serviceId || serviceId === "null" || serviceId === "undefined") {
        alert("Error: No se pudo determinar el servicio seleccionado. Por favor, intente nuevamente.")
        return
      }
    }
  
    if (serviceTypeElement) serviceTypeElement.textContent = `- ${service}`
    if (serviceInput) serviceInput.value = service
  
    if (serviceIdInput) {
      serviceIdInput.value = serviceId
      console.log("ID de servicio establecido en el formulario:", serviceId)
    } else {
      console.error("Elemento service-id-input no encontrado")
  
      // Crear el input si no existe
      const form = document.getElementById("reservation-form")
      if (form) {
        const hiddenInput = document.createElement("input")
        hiddenInput.type = "hidden"
        hiddenInput.id = "service-id-input"
        hiddenInput.name = "serviceId"
        hiddenInput.value = serviceId
        form.appendChild(hiddenInput)
        console.log("Creado input oculto para service-id-input con valor:", serviceId)
      }
    }
  
    // Restablecer fecha mínima
    const today = new Date()
    const appointmentDate = document.getElementById("appointment-date")
    if (appointmentDate) {
      appointmentDate.min = today.toISOString().split("T")[0]
      appointmentDate.value = ""
    }
  
    // Limpiar horarios
    const timeSelect = document.getElementById("appointment-time")
    if (timeSelect) {
      timeSelect.innerHTML = '<option value="">Seleccionar...</option>'
    }
  
    modal.style.display = "block"
  }
  
  // Cerrar modal
  function closeModal(modalId) {
    const modal = document.getElementById(modalId)
    if (!modal) return
  
    modal.style.display = "none"
  
    // Si es el modal de reserva, resetear el formulario
    if (modalId === "reservationModal") {
      const form = document.getElementById("reservation-form")
      if (form) {
        form.reset()
      }
    }
  }
  
  // Configurar el formulario de reserva
  function setupReservationForm() {
    const form = document.getElementById("reservation-form")
    const appointmentDate = document.getElementById("appointment-date")
    const timeSelect = document.getElementById("appointment-time")
  
    if (!form) {
      console.error("Formulario de reserva no encontrado")
      return
    }
  
    // Configurar la fecha mínima como hoy
    if (appointmentDate) {
      const today = new Date()
      appointmentDate.min = today.toISOString().split("T")[0]
  
      // Cuando cambia la fecha, cargar horas disponibles
      appointmentDate.addEventListener("change", function () {
        loadAvailableTimes(this.value)
      })
    }
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault()
  
      // Validar el formulario
      if (!validateReservationForm()) {
        return
      }
  
      // Obtener el ID del servicio y verificar que sea válido
      const serviceIdInput = document.getElementById("service-id-input")
      const serviceId = serviceIdInput ? Number.parseInt(serviceIdInput.value) : 0
  
      if (!serviceId || isNaN(serviceId) || serviceId <= 0) {
        showErrorMessage("ID de servicio inválido. Por favor, intente nuevamente.")
        console.error("ID de servicio inválido:", serviceIdInput ? serviceIdInput.value : "No encontrado")
        return
      }
  
      // Recopilar datos del formulario
      const formData = new FormData(form)
      const reservationData = {
        service_id: serviceId,
        pet_owner: formData.get("petOwner"),
        pet_name: formData.get("petName"),
        pet_type: formData.get("petType"),
        appointment_date: formData.get("appointmentDate"),
        appointment_time: formData.get("appointmentTime"),
        notes: formData.get("notes") || "",
      }
  
      // Imprimir los datos para depuración
      console.log("Datos de reserva a enviar:", reservationData)
  
      // Enviar datos a la API
      try {
        const result = await submitReservation(reservationData)
        if (result.success) {
          showSuccessMessage()
  
          // Cerrar el modal después de un tiempo
          setTimeout(() => {
            closeModal("reservationModal")
            resetReservationForm()
          }, 3000)
        } else {
          showErrorMessage(result.error || "Error en la reserva")
        }
      } catch (error) {
        showErrorMessage(error.message)
      }
    })
  }
  
  // Cargar horas disponibles para citas
  async function loadAvailableTimes(selectedDate) {
    const timeSelect = document.getElementById("appointment-time")
    const serviceIdInput = document.getElementById("service-id-input")
  
    if (!timeSelect || !selectedDate) return
  
    // Limpiar opciones actuales
    timeSelect.innerHTML = '<option value="">Seleccionar...</option>'
    timeSelect.disabled = true
  
    // Añadir indicador de carga
    const loadingOption = document.createElement("option")
    loadingOption.textContent = "Cargando horarios..."
    timeSelect.appendChild(loadingOption)
  
    try {
      // Preparar datos para la solicitud
      const requestData = {
        date: selectedDate,
        service_id: serviceIdInput ? Number.parseInt(serviceIdInput.value) : undefined,
      }
  
      // Enviar solicitud a la API para verificar disponibilidad
      const response = await fetch(
        "https://montanitaadopta.onrender.com/adoptme/api/v1/veterinary_services/availability/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        },
      )
  
      if (!response.ok) {
        throw new Error("Error al cargar los horarios disponibles")
      }
  
      const availabilityData = await response.json()
  
      // Limpiar opciones
      timeSelect.innerHTML = '<option value="">Seleccionar horario...</option>'
  
      // Añadir las opciones de horarios disponibles
      if (availabilityData.time_slots && availabilityData.time_slots.length > 0) {
        availabilityData.time_slots.forEach((slot) => {
          if (slot.available) {
            const option = document.createElement("option")
            option.value = slot.time
            option.textContent = formatTime(slot.time)
            timeSelect.appendChild(option)
          }
        })
      } else {
        const noTimesOption = document.createElement("option")
        noTimesOption.textContent = "No hay horarios disponibles"
        timeSelect.appendChild(noTimesOption)
      }
    } catch (error) {
      console.error("Error:", error)
      timeSelect.innerHTML = '<option value="">Error al cargar horarios</option>'
    } finally {
      timeSelect.disabled = false
    }
  }
  
  // Formatear la hora para mostrar (de 24h a 12h)
  function formatTime(time) {
    try {
      const [hours, minutes] = time.split(":").map((num) => Number.parseInt(num))
      let period = "AM"
      let formattedHours = hours
  
      if (hours >= 12) {
        period = "PM"
        formattedHours = hours === 12 ? 12 : hours - 12
      } else if (hours === 0) {
        formattedHours = 12
      }
  
      return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`
    } catch (e) {
      return time
    }
  }
  
  // Validar el formulario de reserva
  function validateReservationForm() {
    const form = document.getElementById("reservation-form")
  
    // Verificar campos obligatorios
    const requiredFields = ["petOwner", "petName", "petType", "appointmentDate", "appointmentTime"]
    let isValid = true
  
    requiredFields.forEach((field) => {
      const input = form.querySelector(`[name="${field}"]`)
      if (input && !input.value.trim()) {
        isValid = false
        highlightError(input)
      } else if (input) {
        removeHighlight(input)
      }
    })
  
    if (!isValid) {
      showErrorMessage("Por favor, complete todos los campos obligatorios.")
    }
  
    return isValid
  }
  
  // Resaltar campo con error
  function highlightError(input) {
    input.classList.add("error-input")
  
    // Si hay un contenedor padre, añadir mensaje de error
    const parentContainer = input.closest(".form-group")
    if (parentContainer) {
      // Eliminar mensaje de error anterior si existe
      const existingError = parentContainer.querySelector(".error-message")
      if (existingError) {
        existingError.remove()
      }
  
      // Añadir nuevo mensaje de error
      const errorMessage = document.createElement("div")
      errorMessage.className = "error-message"
      errorMessage.textContent = "Este campo es obligatorio"
      parentContainer.appendChild(errorMessage)
    }
  }
  
  // Quitar resaltado de error
  function removeHighlight(input) {
    input.classList.remove("error-input")
  
    // Eliminar mensaje de error si existe
    const parentContainer = input.closest(".form-group")
    if (parentContainer) {
      const errorMessage = parentContainer.querySelector(".error-message")
      if (errorMessage) {
        errorMessage.remove()
      }
    }
  }
  
  // Enviar datos de reserva a la API
  async function submitReservation(reservationData) {
    try {
      // Verificar que el ID del servicio sea válido
      if (!reservationData.service_id || isNaN(reservationData.service_id) || reservationData.service_id <= 0) {
        throw new Error("ID de servicio inválido")
      }
  
      // Obtener el token de autenticación del localStorage o donde lo tengas almacenado
      const token = localStorage.getItem("token") // Ajusta esto según donde almacenes tu token
  
      const headers = {
        "Content-Type": "application/json",
      }
  
      // Añadir el token de autorización si existe
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
  
      console.log("Enviando solicitud con headers:", headers)
      console.log("Datos de reserva:", JSON.stringify(reservationData))
  
      const response = await fetch(
        "https://montanitaadopta.onrender.com/adoptme/api/v1/veterinary_services/reservations/",
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(reservationData),
        },
      )
  
      // Imprimir información de la respuesta para depuración
      console.log("Respuesta del servidor:", response.status, response.statusText)
  
      const responseData = await response.json()
      console.log("Datos de respuesta:", responseData)
  
      if (!response.ok) {
        throw new Error(responseData.detail || "Error al realizar la reserva")
      }
  
      return {
        success: true,
        data: responseData,
      }
    } catch (error) {
      console.error("Error en submitReservation:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }
  
  // Mostrar mensaje de éxito
  function showSuccessMessage() {
    const messageContainer = document.getElementById("reservation-message")
    if (!messageContainer) return
  
    messageContainer.className = "success-message"
    messageContainer.textContent = "¡Reserva realizada con éxito! En breve recibirás un correo de confirmación."
    messageContainer.style.display = "block"
  }
  
  // Mostrar mensaje de error
  function showErrorMessage(message) {
    const messageContainer = document.getElementById("reservation-message")
    if (!messageContainer) return
  
    messageContainer.className = "error-message"
    messageContainer.textContent = message || "Ha ocurrido un error en el proceso de reserva."
    messageContainer.style.display = "block"
  }
  
  // Resetear formulario de reserva
  function resetReservationForm() {
    const form = document.getElementById("reservation-form")
    if (!form) return
  
    form.reset()
  
    // Limpiar mensajes
    const messageContainer = document.getElementById("reservation-message")
    if (messageContainer) {
      messageContainer.style.display = "none"
      messageContainer.textContent = ""
    }
  
    // Limpiar errores
    const errorInputs = form.querySelectorAll(".error-input")
    errorInputs.forEach((input) => removeHighlight(input))
  
    // Resetear selectores
    const timeSelect = document.getElementById("appointment-time")
    if (timeSelect) {
      timeSelect.innerHTML = '<option value="">Seleccionar...</option>'
    }
  }
  
  // Exponer funciones al ámbito global para que puedan ser llamadas desde HTML
  window.closeModal = closeModal
  window.openInfoModal = openInfoModal
  window.openReservationModal = openReservationModal
  
  // Inicializar cuando se carga el documento
  document.addEventListener("DOMContentLoaded", () => {
    // Configurar el formulario de reserva
    setupReservationForm()
  })
  
  