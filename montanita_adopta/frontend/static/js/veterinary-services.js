/**
 * Sistema de Servicios Veterinarios
 * Este archivo combina todas las funcionalidades para los servicios veterinarios:
 * - API para interactuar con el backend
 * - Gestión de modales
 * - Configuración de tarjetas y formularios
 * - Herramientas de depuración
 */

// Configuración global
const API_BASE_URL = "https://montanitaadopta.onrender.com/adoptme/api/v1"
const SERVICES_ENDPOINT = `${API_BASE_URL}/veterinary_services/`
const RESERVATIONS_ENDPOINT = `${API_BASE_URL}/veterinary_services/reservations/`
const AVAILABILITY_ENDPOINT = `${API_BASE_URL}/veterinary_services/availability/`

// Tiempo de caché en milisegundos (1 hora)
const CACHE_DURATION = 60 * 60 * 1000

// Estado global
let veterinaryServices = []
let currentServiceId = null

// =============================================
// INICIALIZACIÓN
// =============================================

// Inicialización cuando el DOM está listo
document.addEventListener("DOMContentLoaded", initVeterinaryServices)

/**
 * Inicializa el sistema de servicios veterinarios
 */
async function initVeterinaryServices() {
  console.log("Inicializando sistema de servicios veterinarios...")

  try {
    // 1. Cargar servicios desde la API
    await loadServices()

    // 2. Configurar los elementos de la UI
    setupServiceCards()
    setupReservationForm()

    // 3. Añadir botón de depuración si estamos en modo desarrollo
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      addDebugButton()
    }

    console.log("Sistema de servicios veterinarios inicializado correctamente")
  } catch (error) {
    console.error("Error al inicializar servicios veterinarios:", error)
    showNotification("error", "No se pudieron cargar los servicios veterinarios. Por favor, recargue la página.")
  }
}

// =============================================
// FUNCIONES DE LA API
// =============================================

/**
 * Carga los servicios veterinarios desde la API
 */
async function loadServices() {
  console.log("Cargando servicios veterinarios desde la API...")

  try {
    // Verificar si hay datos en caché y si son válidos
    const cachedData = getServicesFromCache()
    if (cachedData) {
      console.log("Usando datos de servicios desde caché")
      veterinaryServices = cachedData
      return true
    }

    console.log("Obteniendo servicios desde la API...")
    const response = await fetch(SERVICES_ENDPOINT)

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`)
    }

    const services = await response.json()

    if (!services || !Array.isArray(services) || services.length === 0) {
      throw new Error("No se recibieron servicios válidos de la API")
    }

    // Guardar en caché
    saveServicesToCache(services)

    // Guardar en variable global
    veterinaryServices = services

    console.log(`Se obtuvieron ${services.length} servicios de la API`)
    return true
  } catch (error) {
    console.error("Error al obtener servicios:", error)

    // Intentar recuperar de caché incluso si está expirada como último recurso
    const expiredCache = localStorage.getItem("veterinaryServices")
    if (expiredCache) {
      try {
        console.warn("Usando caché expirada como respaldo")
        const parsedCache = JSON.parse(expiredCache)
        veterinaryServices = parsedCache.data || parsedCache
        return true
      } catch (e) {
        console.error("Error al parsear caché expirada:", e)
      }
    }

    throw error
  }
}

/**
 * Obtiene un servicio veterinario por su ID
 * @param {number} id - ID del servicio
 * @returns {Promise<Object>} Datos del servicio
 */
async function fetchServiceById(id) {
  if (!id) {
    throw new Error("ID de servicio no proporcionado")
  }

  try {
    // Intentar obtener de la variable global primero
    if (veterinaryServices && veterinaryServices.length > 0) {
      const service = veterinaryServices.find((s) => s.id == id)
      if (service) {
        return service
      }
    }

    // Intentar obtener de caché
    const cachedServices = getServicesFromCache()
    if (cachedServices) {
      const service = cachedServices.find((s) => s.id == id)
      if (service) {
        return service
      }
    }

    // Si no está en caché, obtener de la API
    const response = await fetch(`${SERVICES_ENDPOINT}${id}/`)

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error al obtener servicio ID ${id}:`, error)
    throw error
  }
}

/**
 * Obtiene horarios disponibles para una fecha y servicio
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {number} serviceId - ID del servicio
 * @returns {Promise<Array>} Lista de horarios disponibles
 */
async function fetchAvailableTimeSlots(date, serviceId) {
  if (!date) {
    throw new Error("Fecha no proporcionada")
  }

  if (!serviceId) {
    throw new Error("ID de servicio no proporcionado")
  }

  try {
    const requestData = {
      date: date,
      service_id: serviceId,
    }

    const response = await fetch(AVAILABILITY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data || !data.time_slots) {
      throw new Error("Formato de respuesta inválido")
    }

    return data.time_slots
  } catch (error) {
    console.error("Error al obtener horarios disponibles:", error)
    throw error
  }
}

/**
 * Crea una nueva reserva de servicio veterinario
 * @param {Object} reservationData - Datos de la reserva
 * @returns {Promise<Object>} Resultado de la operación
 */
async function createReservation(reservationData) {
  if (!reservationData || !reservationData.service_id) {
    throw new Error("Datos de reserva inválidos")
  }

  try {
    // Obtener token de autenticación si existe
    const token = localStorage.getItem("token")

    // Configurar headers
    const headers = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    // Enviar solicitud
    const response = await fetch(RESERVATIONS_ENDPOINT, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(reservationData),
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(responseData.detail || `Error ${response.status}: ${response.statusText}`)
    }

    return {
      success: true,
      data: responseData,
    }
  } catch (error) {
    console.error("Error al crear reserva:", error)
    return {
      success: false,
      error: error.message || "Error al procesar la reserva",
    }
  }
}

/**
 * Guarda los servicios en caché local
 * @param {Array} services - Lista de servicios a guardar
 */
function saveServicesToCache(services) {
  if (!services || !Array.isArray(services)) return

  const cacheData = {
    timestamp: Date.now(),
    data: services,
  }

  localStorage.setItem("veterinaryServices", JSON.stringify(cacheData))
  console.log(`${services.length} servicios guardados en caché local`)
}

/**
 * Obtiene los servicios desde la caché si son válidos
 * @returns {Array|null} Servicios en caché o null si no hay o están expirados
 */
function getServicesFromCache() {
  try {
    const cachedData = localStorage.getItem("veterinaryServices")

    if (!cachedData) return null

    const parsedData = JSON.parse(cachedData)

    // Verificar si es el formato antiguo o nuevo
    if (parsedData.timestamp && parsedData.data) {
      const { timestamp, data } = parsedData
      const now = Date.now()

      // Verificar si la caché ha expirado
      if (now - timestamp > CACHE_DURATION) {
        console.log("Caché de servicios expirada")
        return null
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn("Datos de caché inválidos")
        return null
      }

      return data
    } else if (Array.isArray(parsedData)) {
      // Formato antiguo, solo el array
      return parsedData
    }

    return null
  } catch (error) {
    console.error("Error al obtener servicios de caché:", error)
    return null
  }
}

/**
 * Limpia la caché de servicios
 */
function clearServicesCache() {
  localStorage.removeItem("veterinaryServices")
  console.log("Caché de servicios eliminada")
}

// =============================================
// GESTIÓN DE MODALES
// =============================================

/**
 * Abre el modal de información de un servicio
 * @param {string|number} serviceId - ID del servicio
 */
function openInfoModal(serviceId) {
  console.log(`Abriendo modal de información para servicio ID: ${serviceId}`)

  if (!serviceId) {
    showNotification("error", "No se pudo determinar el servicio seleccionado.")
    return
  }

  // Buscar el servicio por ID
  fetchServiceById(serviceId)
    .then((service) => {
      if (!service) {
        console.error(`No se encontró servicio con ID: ${serviceId}`)
        showNotification("error", "Servicio no encontrado.")
        return
      }

      // Obtener el modal
      const modal = document.getElementById("infoModal")
      if (!modal) {
        console.error("Modal de información no encontrado en el DOM")
        return
      }

      // Actualizar contenido del modal
      modal.querySelector(".modal-title").textContent = service.name
      modal.querySelector(".modal-description").textContent = service.description || "No hay descripción disponible"
      modal.querySelector(".modal-price").textContent = `${formatCurrency(service.price)}`
      modal.querySelector(".modal-duration").textContent = `${service.duration_minutes} minutos`

      // Configurar botón de reserva en el modal de información
      const reserveButton = document.getElementById("reserve-from-info")
      if (reserveButton) {
        reserveButton.onclick = () => {
          closeModal("infoModal")
          openReservationModal(service.name, service.id)
        }
      }

      // Mostrar el modal
      modal.style.display = "block"
    })
    .catch((error) => {
      console.error("Error al obtener información del servicio:", error)
      showNotification("error", "Error al cargar la información del servicio.")
    })
}

/**
 * Abre el modal de reserva para un servicio
 * @param {string} serviceName - Nombre del servicio
 * @param {string|number} serviceId - ID del servicio
 */
function openReservationModal(serviceName, serviceId) {
  console.log(`Abriendo modal de reserva para servicio: ${serviceName} (ID: ${serviceId})`)

  if (!serviceId) {
    showNotification("error", "No se pudo determinar el servicio seleccionado.")
    return
  }

  // Guardar el ID del servicio actual
  currentServiceId = serviceId

  // Obtener el modal
  const modal = document.getElementById("reservationModal")
  if (!modal) {
    console.error("Modal de reserva no encontrado en el DOM")
    return
  }

  // Actualizar elementos del modal
  const serviceTypeElement = document.getElementById("service-type")
  if (serviceTypeElement) {
    serviceTypeElement.textContent = ` - ${serviceName}`
  }

  const serviceInput = document.getElementById("service-input")
  if (serviceInput) {
    serviceInput.value = serviceName
  }

  const serviceIdInput = document.getElementById("service-id-input")
  if (serviceIdInput) {
    serviceIdInput.value = serviceId
  } else {
    // Crear el input si no existe
    const form = document.getElementById("reservation-form")
    if (form) {
      const hiddenInput = document.createElement("input")
      hiddenInput.type = "hidden"
      hiddenInput.id = "service-id-input"
      hiddenInput.name = "serviceId"
      hiddenInput.value = serviceId
      form.appendChild(hiddenInput)
    }
  }

  // Configurar fecha mínima (hoy)
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

  // Limpiar mensajes
  const messageContainer = document.getElementById("reservation-message")
  if (messageContainer) {
    messageContainer.style.display = "none"
    messageContainer.textContent = ""
  }

  // Mostrar el modal
  modal.style.display = "block"
}

/**
 * Cierra un modal por su ID
 * @param {string} modalId - ID del modal a cerrar
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (!modal) return

  modal.style.display = "none"

  // Si es el modal de reserva, resetear el formulario
  if (modalId === "reservationModal") {
    resetReservationForm()
  }
}

/**
 * Resetea el formulario de reserva
 */
function resetReservationForm() {
  const form = document.getElementById("reservation-form")
  if (!form) return

  // Resetear campos
  form.reset()

  // Limpiar mensajes
  const messageContainer = document.getElementById("reservation-message")
  if (messageContainer) {
    messageContainer.style.display = "none"
    messageContainer.textContent = ""
  }

  // Limpiar errores
  form.querySelectorAll(".error-input").forEach((el) => {
    el.classList.remove("error-input")
  })

  form.querySelectorAll(".error-message").forEach((el) => {
    el.remove()
  })

  // Resetear selector de horarios
  const timeSelect = document.getElementById("appointment-time")
  if (timeSelect) {
    timeSelect.innerHTML = '<option value="">Seleccionar...</option>'
  }
}

/**
 * Muestra una notificación en el formulario
 * @param {string} type - Tipo de notificación ('error' o 'success')
 * @param {string} message - Mensaje a mostrar
 */
function showNotification(type, message) {
  const messageContainer = document.getElementById("reservation-message")
  if (!messageContainer) return

  messageContainer.className = type === "error" ? "error-message" : "success-message"
  messageContainer.textContent = message
  messageContainer.style.display = "block"

  // Hacer scroll al mensaje
  messageContainer.scrollIntoView({ behavior: "smooth", block: "nearest" })
}

// =============================================
// CONFIGURACIÓN DE UI
// =============================================

/**
 * Configura las tarjetas de servicios con precios y botones
 */
function setupServiceCards() {
  console.log("Configurando tarjetas de servicios...")

  if (!veterinaryServices || veterinaryServices.length === 0) {
    console.error("No hay servicios disponibles para configurar tarjetas")
    return
  }

  // Crear un mapa de servicios por nombre para búsqueda rápida
  const serviceMap = {}
  veterinaryServices.forEach((service) => {
    if (service && service.name) {
      serviceMap[service.name.toLowerCase()] = service
    }
  })

  // Configurar todas las tarjetas de servicios
  const serviceCards = document.querySelectorAll(".service-card")
  console.log(`Encontradas ${serviceCards.length} tarjetas de servicios`)

  serviceCards.forEach((card) => {
    try {
      // 1. Obtener el nombre del servicio de la tarjeta
      const titleElement = card.querySelector("h3")
      if (!titleElement) {
        console.warn("Tarjeta sin título encontrada, omitiendo...")
        return
      }

      const serviceName = titleElement.textContent.trim()
      const serviceNameLower = serviceName.toLowerCase()

      // 2. Buscar el servicio correspondiente
      const service = serviceMap[serviceNameLower] || findServiceByPartialName(serviceNameLower)

      if (!service) {
        console.warn(`No se encontró servicio para: "${serviceName}"`)
        return
      }

      // 3. Actualizar el precio en la tarjeta
      const priceElement = card.querySelector(".service-price")
      if (priceElement) {
        priceElement.textContent = formatCurrency(service.price)
      }

      // 4. Configurar botón de información
      const infoButton = card.querySelector(".info-btn")
      if (infoButton) {
        infoButton.setAttribute("data-service-id", service.id)
        infoButton.setAttribute("data-service", service.name)

        // Eliminar listeners anteriores para evitar duplicados
        infoButton.replaceWith(infoButton.cloneNode(true))
        const newInfoButton = card.querySelector(".info-btn")

        newInfoButton.addEventListener("click", () => {
          openInfoModal(service.id)
        })
      }

      // 5. Configurar botón de reserva
      const reserveButton = card.querySelector(".reserve-btn")
      if (reserveButton) {
        reserveButton.setAttribute("data-service-id", service.id)
        reserveButton.setAttribute("data-service", service.name)

        // Eliminar listeners anteriores para evitar duplicados
        reserveButton.replaceWith(reserveButton.cloneNode(true))
        const newReserveButton = card.querySelector(".reserve-btn")

        newReserveButton.addEventListener("click", () => {
          openReservationModal(service.name, service.id)
        })
      }

      console.log(`Tarjeta configurada para servicio: ${service.name} (ID: ${service.id})`)
    } catch (error) {
      console.error("Error al configurar tarjeta de servicio:", error)
    }
  })
}

/**
 * Busca un servicio por coincidencia parcial de nombre
 */
function findServiceByPartialName(partialName) {
  if (!partialName || !veterinaryServices) return null

  return veterinaryServices.find(
    (service) => service.name.toLowerCase().includes(partialName) || partialName.includes(service.name.toLowerCase()),
  )
}

/**
 * Configura el formulario de reserva
 */
function setupReservationForm() {
  console.log("Configurando formulario de reserva...")

  const form = document.getElementById("reservation-form")
  if (!form) {
    console.error("Formulario de reserva no encontrado")
    return
  }

  // Configurar selector de fecha
  const dateInput = document.getElementById("appointment-date")
  if (dateInput) {
    // Eliminar listeners anteriores para evitar duplicados
    dateInput.replaceWith(dateInput.cloneNode(true))
    const newDateInput = document.getElementById("appointment-date")

    // Establecer fecha mínima (hoy)
    const today = new Date()
    newDateInput.min = today.toISOString().split("T")[0]

    // Cuando cambia la fecha, cargar horarios disponibles
    newDateInput.addEventListener("change", function () {
      loadAvailableTimes(this.value)
    })
  }

  // Configurar envío del formulario
  form.removeEventListener("submit", handleReservationSubmit)
  form.addEventListener("submit", handleReservationSubmit)

  console.log("Formulario de reserva configurado correctamente")
}

/**
 * Maneja el envío del formulario de reserva
 */
async function handleReservationSubmit(event) {
  event.preventDefault()

  // Validar el formulario
  if (!validateReservationForm()) {
    return
  }

  // Obtener el ID del servicio
  const serviceIdInput = document.getElementById("service-id-input")
  const serviceId = serviceIdInput ? Number.parseInt(serviceIdInput.value) : currentServiceId

  if (!serviceId || isNaN(serviceId)) {
    showNotification("error", "ID de servicio inválido. Por favor, intente nuevamente.")
    console.error("ID de servicio inválido:", serviceIdInput ? serviceIdInput.value : "No encontrado")
    return
  }

  // Recopilar datos del formulario
  const form = event.target
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

  console.log("Datos de reserva a enviar:", reservationData)

  // Mostrar indicador de carga
  const submitButton = form.querySelector('button[type="submit"]')
  const originalButtonText = submitButton.textContent
  submitButton.disabled = true
  submitButton.textContent = "Procesando..."

  try {
    // Enviar datos a la API
    const result = await createReservation(reservationData)

    if (result.success) {
      showNotification("success", "¡Reserva realizada con éxito! En breve recibirás un correo de confirmación.")

      // Cerrar el modal después de un tiempo
      setTimeout(() => {
        closeModal("reservationModal")
      }, 3000)
    } else {
      showNotification("error", result.error || "Error en la reserva")
    }
  } catch (error) {
    showNotification("error", error.message || "Error al procesar la reserva")
  } finally {
    // Restaurar botón
    submitButton.disabled = false
    submitButton.textContent = originalButtonText
  }
}

/**
 * Carga los horarios disponibles para una fecha
 */
async function loadAvailableTimes(selectedDate) {
  if (!selectedDate) return

  const timeSelect = document.getElementById("appointment-time")
  if (!timeSelect) return

  // Obtener el ID del servicio
  const serviceIdInput = document.getElementById("service-id-input")
  const serviceId = serviceIdInput ? Number.parseInt(serviceIdInput.value) : currentServiceId

  // Mostrar indicador de carga
  timeSelect.disabled = true
  timeSelect.innerHTML = '<option value="">Cargando horarios...</option>'

  try {
    // Obtener horarios disponibles usando la función de la API
    const timeSlots = await fetchAvailableTimeSlots(selectedDate, serviceId)

    // Limpiar y actualizar opciones
    timeSelect.innerHTML = '<option value="">Seleccionar horario...</option>'

    if (timeSlots && timeSlots.length > 0) {
      // Filtrar y ordenar horarios disponibles
      const availableSlots = timeSlots.filter((slot) => slot.available).sort((a, b) => a.time.localeCompare(b.time))

      if (availableSlots.length > 0) {
        availableSlots.forEach((slot) => {
          const option = document.createElement("option")
          option.value = slot.time
          option.textContent = formatTime(slot.time)
          timeSelect.appendChild(option)
        })
      } else {
        const noTimesOption = document.createElement("option")
        noTimesOption.disabled = true
        noTimesOption.textContent = "No hay horarios disponibles"
        timeSelect.appendChild(noTimesOption)
      }
    } else {
      const noTimesOption = document.createElement("option")
      noTimesOption.disabled = true
      noTimesOption.textContent = "No hay horarios disponibles"
      timeSelect.appendChild(noTimesOption)
    }
  } catch (error) {
    console.error("Error al cargar horarios:", error)
    timeSelect.innerHTML = '<option value="">Error al cargar horarios</option>'
  } finally {
    timeSelect.disabled = false
  }
}

/**
 * Valida el formulario de reserva
 */
function validateReservationForm() {
  const form = document.getElementById("reservation-form")
  if (!form) return false

  // Limpiar errores anteriores
  form.querySelectorAll(".error-input").forEach((el) => {
    el.classList.remove("error-input")
  })

  form.querySelectorAll(".error-message").forEach((el) => {
    el.remove()
  })

  // Verificar campos obligatorios
  const requiredFields = ["petOwner", "petName", "petType", "appointmentDate", "appointmentTime"]
  let isValid = true

  requiredFields.forEach((fieldName) => {
    const input = form.querySelector(`[name="${fieldName}"]`)
    if (!input || !input.value.trim()) {
      isValid = false
      highlightError(input)
    }
  })

  if (!isValid) {
    showNotification("error", "Por favor, complete todos los campos obligatorios.")
  }

  return isValid
}

/**
 * Resalta un campo con error
 */
function highlightError(input) {
  if (!input) return

  input.classList.add("error-input")

  // Añadir mensaje de error
  const container = input.closest(".form-group")
  if (container) {
    const errorMsg = document.createElement("div")
    errorMsg.className = "error-message"
    errorMsg.style.fontSize = "0.8rem"
    errorMsg.style.color = "#dc3545"
    errorMsg.style.marginTop = "5px"
    errorMsg.textContent = "Este campo es obligatorio"
    container.appendChild(errorMsg)
  }
}

// =============================================
// UTILIDADES
// =============================================

/**
 * Formatea un valor numérico como moneda (COP)
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado
 */
function formatCurrency(value) {
  if (value === undefined || value === null) return "$ 0"

  return `$ ${Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
}

/**
 * Formatea una hora de 24h a formato 12h
 */
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

// =============================================
// HERRAMIENTAS DE DEPURACIÓN
// =============================================

/**
 * Añade un botón de depuración a la página
 */
function addDebugButton() {
  const button = document.createElement("button")
  button.textContent = "🔍 Debug"
  button.style.position = "fixed"
  button.style.bottom = "20px"
  button.style.right = "20px"
  button.style.zIndex = "9999"
  button.style.padding = "8px 12px"
  button.style.backgroundColor = "#007bff"
  button.style.color = "white"
  button.style.border = "none"
  button.style.borderRadius = "4px"
  button.style.cursor = "pointer"

  button.addEventListener("click", showDebugPanel)

  document.body.appendChild(button)
}

/**
 * Muestra un panel de depuración con información útil
 */
function showDebugPanel() {
  // Crear el panel si no existe
  let panel = document.getElementById("debug-panel")

  if (!panel) {
    panel = document.createElement("div")
    panel.id = "debug-panel"
    panel.style.position = "fixed"
    panel.style.top = "50%"
    panel.style.left = "50%"
    panel.style.transform = "translate(-50%, -50%)"
    panel.style.backgroundColor = "white"
    panel.style.padding = "20px"
    panel.style.borderRadius = "8px"
    panel.style.boxShadow = "0 0 20px rgba(0,0,0,0.3)"
    panel.style.zIndex = "10000"
    panel.style.maxWidth = "80%"
    panel.style.maxHeight = "80%"
    panel.style.overflow = "auto"

    document.body.appendChild(panel)
  }

  // Recopilar información de depuración
  const debugInfo = collectDebugInfo()

  // Actualizar contenido del panel
  panel.innerHTML = `
    <h2 style="margin-top:0">Información de Depuración</h2>
    <button id="close-debug" style="position:absolute;top:10px;right:10px;background:none;border:none;font-size:20px;cursor:pointer;">&times;</button>
    
    <h3>Servicios Veterinarios</h3>
    <pre style="background:#f5f5f5;padding:10px;overflow:auto;max-height:200px">${JSON.stringify(debugInfo.services, null, 2)}</pre>
    
    <h3>Elementos DOM</h3>
    <ul>
      ${debugInfo.domElements.map((item) => `<li>${item.name}: ${item.found ? "✅" : "❌"} ${item.details || ""}</li>`).join("")}
    </ul>
    
    <h3>Estado Actual</h3>
    <ul>
      <li>Modal de información: ${debugInfo.modals.infoModal ? "✅" : "❌"}</li>
      <li>Modal de reserva: ${debugInfo.modals.reservationModal ? "✅" : "❌"}</li>
      <li>Formulario de reserva: ${debugInfo.forms.reservationForm ? "✅" : "❌"}</li>
    </ul>
    
    <h3>Acciones</h3>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button onclick="reloadServices()" style="padding:8px 12px;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer">Recargar Servicios</button>
      <button onclick="resetLocalStorage()" style="padding:8px 12px;background:#dc3545;color:white;border:none;border-radius:4px;cursor:pointer">Limpiar LocalStorage</button>
      <button onclick="testConnection()" style="padding:8px 12px;background:#17a2b8;color:white;border:none;border-radius:4px;cursor:pointer">Probar Conexión API</button>
    </div>
    
    <div id="debug-result" style="margin-top:15px;padding:10px;background:#f8f9fa;border-radius:4px;display:none"></div>
  `

  // Añadir event listeners
  document.getElementById("close-debug").addEventListener("click", () => {
    panel.remove()
  })

  // Exponer funciones de depuración
  window.reloadServices = async () => {
    const resultDiv = document.getElementById("debug-result")
    resultDiv.style.display = "block"
    resultDiv.innerHTML = "Recargando servicios..."

    try {
      localStorage.removeItem("veterinaryServices")
      const success = await loadServices()
      if (success) {
        setupServiceCards()
        resultDiv.innerHTML = "✅ Servicios recargados correctamente"
      } else {
        resultDiv.innerHTML = "❌ Error al recargar servicios"
      }
    } catch (error) {
      resultDiv.innerHTML = `❌ Error: ${error.message}`
    }
  }

  window.resetLocalStorage = () => {
    const resultDiv = document.getElementById("debug-result")
    resultDiv.style.display = "block"

    localStorage.removeItem("veterinaryServices")
    resultDiv.innerHTML = "✅ LocalStorage limpiado"
  }

  window.testConnection = async () => {
    const resultDiv = document.getElementById("debug-result")
    resultDiv.style.display = "block"
    resultDiv.innerHTML = "Probando conexión..."

    try {
      const response = await fetch(SERVICES_ENDPOINT)
      const status = response.ok ? "✅" : "❌"
      resultDiv.innerHTML = `${status} Estado: ${response.status} ${response.statusText}`

      if (response.ok) {
        const data = await response.json()
        resultDiv.innerHTML += `<br>Recibidos ${data.length} servicios`
      }
    } catch (error) {
      resultDiv.innerHTML = `❌ Error de conexión: ${error.message}`
    }
  }
}

/**
 * Recopila información de depuración
 */
function collectDebugInfo() {
  // Obtener servicios del localStorage
  let services = []
  try {
    const servicesJson = localStorage.getItem("veterinaryServices")
    if (servicesJson) {
      const parsedData = JSON.parse(servicesJson)
      services = parsedData.data || parsedData
    }
  } catch (e) {
    console.error("Error al parsear servicios:", e)
  }

  // Verificar elementos DOM importantes
  const domElements = [
    {
      name: "Tarjetas de servicios",
      found: document.querySelectorAll(".service-card").length > 0,
      details: `Encontradas: ${document.querySelectorAll(".service-card").length}`,
    },
    {
      name: "Botones de información",
      found: document.querySelectorAll(".info-btn").length > 0,
      details: `Encontrados: ${document.querySelectorAll(".info-btn").length}`,
    },
    {
      name: "Botones de reserva",
      found: document.querySelectorAll(".reserve-btn").length > 0,
      details: `Encontrados: ${document.querySelectorAll(".reserve-btn").length}`,
    },
    {
      name: "Elementos de precio",
      found: document.querySelectorAll(".service-price").length > 0,
      details: `Encontrados: ${document.querySelectorAll(".service-price").length}`,
    },
  ]

  // Verificar modales
  const modals = {
    infoModal: document.getElementById("infoModal") !== null,
    reservationModal: document.getElementById("reservationModal") !== null,
  }

  // Verificar formularios
  const forms = {
    reservationForm: document.getElementById("reservation-form") !== null,
  }

  return {
    services,
    domElements,
    modals,
    forms,
  }
}

// =============================================
// EXPORTAR FUNCIONES GLOBALES
// =============================================

// Exponer funciones necesarias al ámbito global
window.openInfoModal = openInfoModal
window.openReservationModal = openReservationModal
window.closeModal = closeModal
window.loadServices = loadServices
window.setupServiceCards = setupServiceCards
window.handleReservationSubmit = handleReservationSubmit
window.validateReservationForm = validateReservationForm

