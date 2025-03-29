/**
 * Clase para manejar las peticiones a la API y funcionalidades de autenticación
 */
class APIConnector {
    constructor(baseURL = "https://montanitaadopta.onrender.com/adoptme/api/v1") {
      this.baseURL = baseURL
      this.token = localStorage.getItem("token") || ""
      console.log("Token al inicializar:", this.token)
  
      // Inicializar listeners después de que se cargue el DOM
      document.addEventListener("DOMContentLoaded", () => this.setupEventListeners())
    }
  
    /**
     * Establece el token de autenticación
     * @param {string} token - Token JWT
     */
    setToken(token) {
      if (!token) return
  
      this.token = token
      localStorage.setItem("token", token)
      console.log("Token guardado correctamente")
    }
  
    /**
     * Elimina el token de autenticación
     */
    clearToken() {
      this.token = ""
      localStorage.removeItem("token")
      console.log("Token eliminado correctamente")
    }
  
    /**
     * Obtiene el encabezado de autorización
     * @returns {Object} - Objeto con headers
     */
    getHeaders(endpoint) {
      const headers = {
        "Content-Type": "application/json",
      }
  
      // Permitir que ciertas rutas sean públicas
      const rutasPublicas = ["mascotas", "formulario_adopcion", "menu"]
  
      if (this.token && !rutasPublicas.includes(endpoint)) {
        headers["Authorization"] = `Bearer ${this.token.trim()}`
        console.log("Enviando token:", this.token)
      } else {
        console.log(`No se requiere token para ${endpoint}`)
      }
  
      return headers
    }
  
    /**
     * Función para construir la URL completa de la imagen
     * @param {string} relativePath - Ruta relativa de la imagen
     * @returns {string} - URL completa de la imagen
     */
    getFullImageUrl(relativePath) {
      if (!relativePath) return ""
  
      // Si ya es una URL completa, devolverla tal cual
      if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
        return relativePath
      }
  
      // Si es una ruta relativa, añadir la URL base
      const baseUrl = this.baseURL.split("/adoptme/api/v1")[0] // Obtener solo la parte del dominio
      return `${baseUrl}${relativePath}`
    }
  
    /**
     * Realiza una petición GET
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} params - Parámetros de la consulta
     * @returns {Promise} - Promesa con la respuesta
     */
    async get(endpoint, params = {}) {
      const url = new URL(`${this.baseURL}/${endpoint}`)
  
      // Añadir parámetros de consulta
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
          url.searchParams.append(key, params[key])
        }
      })
  
      try {
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: this.getHeaders(),
          credentials: "include", // Incluir cookies si es necesario
        })
  
        if (!response.ok) {
          throw await this.handleError(response)
        }
  
        return await response.json()
      } catch (error) {
        console.error("API GET Error:", error)
        throw error
      }
    }
  
    /**
     * Realiza una petición POST
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} data - Datos a enviar
     * @returns {Promise} - Promesa con la respuesta
     */
    async post(endpoint, data = {}) {
      try {
        const response = await fetch(`${this.baseURL}/${endpoint}`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(data),
          credentials: "include", // Incluir cookies si es necesario
        })
  
        if (!response.ok) {
          throw await this.handleError(response)
        }
  
        return await response.json()
      } catch (error) {
        console.error("API POST Error:", error)
        throw error
      }
    }
  
    /**
     * Realiza una petición POST con FormData
     * @param {string} endpoint - Endpoint de la API
     * @param {FormData} formData - FormData a enviar
     * @returns {Promise} - Promesa con la respuesta
     */
    async postFormData(endpoint, formData) {
      const headers = {}
      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`
      }
  
      try {
        const response = await fetch(`${this.baseURL}/${endpoint}`, {
          method: "POST",
          headers: headers,
          body: formData,
          credentials: "include", // Incluir cookies si es necesario
        })
  
        if (!response.ok) {
          throw await this.handleError(response)
        }
  
        return await response.json()
      } catch (error) {
        console.error("API POST FormData Error:", error)
        throw error
      }
    }
  
    /**
     * Realiza una petición PUT
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} data - Datos a enviar
     * @returns {Promise} - Promesa con la respuesta
     */
    async put(endpoint, data = {}) {
      try {
        const response = await fetch(`${this.baseURL}/${endpoint}`, {
          method: "PUT",
          headers: this.getHeaders(),
          body: JSON.stringify(data),
          credentials: "include", // Incluir cookies si es necesario
        })
  
        if (!response.ok) {
          throw await this.handleError(response)
        }
  
        return await response.json()
      } catch (error) {
        console.error("API PUT Error:", error)
        throw error
      }
    }
  
    /**
     * Realiza una petición DELETE
     * @param {string} endpoint - Endpoint de la API
     * @returns {Promise} - Promesa con la respuesta
     */
    async delete(endpoint) {
      try {
        const response = await fetch(`${this.baseURL}/${endpoint}`, {
          method: "DELETE",
          headers: this.getHeaders(),
          credentials: "include", // Incluir cookies si es necesario
        })
  
        if (!response.ok) {
          throw await this.handleError(response)
        }
  
        return await response.json()
      } catch (error) {
        console.error("API DELETE Error:", error)
        throw error
      }
    }
  
    /**
     * Maneja los errores de la API
     * @param {Response} response - Respuesta de fetch
     * @returns {Promise} - Promesa con el error
     */
    async handleError(response) {
      let errorData = {}
  
      try {
        errorData = await response.json()
      } catch (e) {
        errorData = {
          detail: `Error de la API: ${response.statusText}`,
        }
      }
  
      if (response.status === 401) {
        // Token expirado, limpiar y notificar
        this.clearToken()
        if (window.notifyAuthError) {
          window.notifyAuthError()
        }
      }
  
      return {
        status: response.status,
        message: errorData.detail || "Error desconocido",
        data: errorData,
      }
    }
  
    // ============= MÉTODOS DE AUTENTICACIÓN =============
  
    /**
     * Función para calcular la edad a partir de la fecha de nacimiento
     * @param {string} fechaNacimiento - Fecha de nacimiento en formato YYYY-MM-DD
     * @returns {number} - Edad calculada
     */
    calcularEdad(fechaNacimiento) {
      if (!fechaNacimiento) return 0
  
      const fechaNac = new Date(fechaNacimiento)
      const hoy = new Date()
      let edad = hoy.getFullYear() - fechaNac.getFullYear()
      const mesDiff = hoy.getMonth() - fechaNac.getMonth()
  
      if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--
      }
  
      return edad
    }
  
    /**
     * Función para cerrar modales
     * @param {string} modalId - ID del modal a cerrar
     */
    closeModal(modalId) {
      if (typeof window.closeModal === "function") {
        window.closeModal(modalId)
      } else {
        const modal = document.getElementById(modalId)
        if (modal) {
          modal.style.display = "none"
        }
      }
    }
  
    /**
     * Función para abrir modales
     * @param {string} modalId - ID del modal a abrir
     */
    openModal(modalId) {
      if (typeof window.openModal === "function") {
        window.openModal(modalId)
      } else {
        const modal = document.getElementById(modalId)
        if (modal) {
          modal.style.display = "block"
        }
      }
    }
  
    /**
     * Realiza el inicio de sesión de un usuario
     * @param {Event} event - Evento del formulario
     */
    async loginHandler(event) {
      if (event) event.preventDefault()
  
      const email = document.getElementById("login-email").value
      const password = document.getElementById("login-password").value
  
      try {
        const data = await this.login(email, password)
        const userData = await this.verificarSesion()
  
        // Actualizar la foto de perfil en la UI si existe
        if (userData.foto_perfil && typeof window.updateProfilePhotoUI === "function") {
          const photoUrl = this.getFullImageUrl(userData.foto_perfil)
          window.updateProfilePhotoUI(photoUrl)
        }
  
        // Mostrar alerta de bienvenida bonita
        Swal.fire({
          icon: "success",
          title: `¡Bienvenido, ${userData.nombre}!`,
          text: "Nos alegra verte de nuevo en Montañita Adopta",
          timer: 3000,
          showConfirmButton: false,
        })
  
        this.closeModal("loginModal")
        setTimeout(() => {
          window.location.href = "/"
        }, 3500)
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error de inicio de sesión",
          text: error.message || "Credenciales incorrectas",
        })
      }
    }
  
    /**
     * Realiza el login y obtiene el token
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Promise} - Promesa con el token de acceso
     */
    async login(email, password) {
      // Crear un FormData para enviar como application/x-www-form-urlencoded
      const formData = new URLSearchParams()
      formData.append("username", email) // FastAPI OAuth2 espera 'username', no 'email'
      formData.append("password", password)
  
      try {
        console.log("Iniciando solicitud a:", `${this.baseURL}/auth/token`)
        console.log("Datos de la solicitud:", {
          username: email,
          password: "********", // No mostrar la contraseña real
        })
  
        const response = await fetch(`${this.baseURL}/auth/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
          credentials: "include", // Incluir cookies si es necesario
        })
  
        console.log("Respuesta recibida:", response.status)
  
        if (!response.ok) {
          // Intentar obtener detalles del error
          let errorDetail = "Credenciales inválidas"
          try {
            const errorData = await response.json()
            errorDetail = errorData.detail || errorDetail
          } catch (e) {
            // Si no se puede parsear la respuesta como JSON
            errorDetail = response.statusText || errorDetail
          }
          throw new Error(errorDetail)
        }
  
        const data = await response.json()
  
        // Guardar el token de acceso
        if (data.access_token) {
          this.setToken(data.access_token)
        } else {
          throw new Error("No se recibió token de acceso")
        }
  
        return data
      } catch (error) {
        console.error("Error en login:", error)
        throw error
      }
    }
  
    /**
     * Obtiene los datos del usuario desde el backend
     * @returns {Promise} - Promesa con los datos del usuario
     */
    async getUserData() {
      const token = localStorage.getItem("token")
  
      if (!token) {
        console.log("No hay token almacenado")
        if (typeof updateMenu === "function") updateMenu(null)
        return null
      }
  
      try {
        const userData = await this.verificarSesion()
  
        if (userData && userData.nombre) {
          // Calcular la edad a partir de la fecha de nacimiento
          if (userData.fecha_nacimiento) {
            userData.edad = this.calcularEdad(userData.fecha_nacimiento)
          }
  
          // Procesar la URL de la foto de perfil
          if (userData.foto_perfil) {
            userData.foto_perfil = this.getFullImageUrl(userData.foto_perfil)
          }
  
          localStorage.setItem("userData", JSON.stringify(userData))
          console.log("Usuario autenticado:", userData)
  
          // Actualizar la foto de perfil en la UI si existe
          if (userData.foto_perfil && typeof window.updateProfilePhotoUI === "function") {
            window.updateProfilePhotoUI(userData.foto_perfil)
          }
  
          if (typeof updateMenu === "function") updateMenu(userData)
          return userData
        } else {
          console.log("No se pudieron obtener datos del usuario")
          if (typeof updateMenu === "function") updateMenu(null)
          return null
        }
      } catch (error) {
        console.error("Error al verificar sesión:", error)
        if (typeof updateMenu === "function") updateMenu(null)
        return null
      }
    }
  
    /**
     * Carga el menú del usuario autenticado
     */
    async loadMenu() {
      const navElement = document.querySelector("nav")
  
      if (!navElement) {
        console.warn("⚠️ No se encontró el elemento <nav> en el DOM.")
        return
      }
  
      const token = localStorage.getItem("token")
      console.log("Token recuperado en loadMenu:", token)
  
      if (!token) {
        console.warn("⚠️ No hay token almacenado. No se cargará el menú.")
        if (typeof updateMenu === "function") updateMenu(null)
        return
      }
  
      try {
        // Usar el método get para obtener el menú
        const html = await this.get("menu")
  
        if (typeof html === "string") {
          navElement.innerHTML = html
        } else {
          console.error("Respuesta inesperada del servidor para el menú:", html)
        }
      } catch (error) {
        console.error("❌ Error al obtener el menú:", error)
        if (typeof updateMenu === "function") updateMenu(null)
      }
    }
  
    /**
     * Cierra la sesión del usuario
     */
    logout() {
      this.clearToken()
      localStorage.removeItem("userData")
      window.location.reload()
    }
  
    /**
        /**
     * Registra un nuevo usuario
     * @param {Event} event - Evento del formulario
     */
    async registerHandler(event) {
      if (event) event.preventDefault()
  
      const userData = {
        nombre: document.getElementById("register-nombres").value,
        apellido: document.getElementById("register-prefijo")?.value || "",
        correo: document.getElementById("register-email").value,
        contrasenia: document.getElementById("register-password").value,
        confirm_password: document.getElementById("register-confirm-password").value,
        direccion: document.getElementById("register-direccion").value,
        telefono: document.getElementById("register-telefono").value,
        fecha_nacimiento: document.getElementById("register-fecha-nacimiento").value,
        codigo_postal: document.getElementById("register-codigo-postal")?.value || "",
      }
  
      if (userData.contrasenia !== userData.confirm_password) {
        Swal.fire({
          icon: "error",
          title: "Error de validación",
          text: "Las contraseñas no coinciden.",
        })
        return
      }
  
      try {
        // Mostrar indicador de carga
        Swal.fire({
          title: "Procesando registro...",
          text: "Por favor espere un momento",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading()
          },
        })
  
        // Registrar usuario
        const registerData = await this.register(userData)
        console.log("Registro exitoso:", registerData)
  
        // Si el registro es exitoso, hacer login automáticamente
        const loginResult = await this.login(userData.correo, userData.contrasenia)
        console.log("Inicio de sesión exitoso:", loginResult)
  
        // Obtener datos del usuario
        const user = await this.getUserData()
  
        // Alerta de éxito
        Swal.fire({
          icon: "success",
          title: "¡Bienvenido a Montañita Adopta!",
          text: `Tu cuenta ha sido registrada exitosamente. ¡Gracias por unirte a nuestra comunidad, ${user?.nombre || "amante de los animales"}!`,
          confirmButtonText: "Continuar",
          timer: 4500,
          timerProgressBar: true,
        })
  
        this.closeModal("registerModal")
  
        setTimeout(() => {
          window.location.reload()
        }, 4500)
      } catch (error) {
        console.error("Error en el registro/inicio de sesión:", error)
  
        Swal.fire({
          icon: "error",
          title: "Error en el registro",
          text: error.message || "Hubo un problema al registrar el usuario. Por favor, inténtalo nuevamente.",
          confirmButtonText: "Entendido",
        })
      }
    }
  
    /**
     * Registra un nuevo usuario
     * @param {Object} userData - Datos del usuario
     * @returns {Promise} - Promesa con los datos del usuario registrado
     */
    async register(userData) {
      return this.post("auth/register", userData)
    }
  
    /**
     * Actualiza la información del usuario
     * @param {Event} event - Evento del formulario
     */
    async updateUserHandler(event) {
      if (event) event.preventDefault()
  
      const token = localStorage.getItem("token")
  
      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "Sesión no encontrada",
          text: "No se ha encontrado el token de autenticación.",
        })
        return
      }
  
      try {
        const currentUserData = await this.verificarSesion()
  
        // Crear objeto con solo los campos que se han modificado
        const updatedUserData = {}
  
        // Añadir solo los campos que existen en el formulario y han sido modificados
        const nombre = document.getElementById("nombre")
        if (nombre && nombre.value && nombre.value !== currentUserData.nombre) {
          updatedUserData.nombre = nombre.value
        }
  
        const correo = document.getElementById("correo_electronico")
        if (correo && correo.value && correo.value !== currentUserData.correo) {
          updatedUserData.correo = correo.value
        }
  
        const direccion = document.getElementById("direccion")
        if (direccion && direccion.value && direccion.value !== currentUserData.direccion) {
          updatedUserData.direccion = direccion.value
        }
  
        const telefono = document.getElementById("telefono")
        if (telefono && telefono.value && telefono.value !== currentUserData.telefono) {
          updatedUserData.telefono = telefono.value
        }
  
        const codigoPostal = document.getElementById("codigo_postal")
        if (codigoPostal && codigoPostal.value && codigoPostal.value !== currentUserData.codigo_postal) {
          updatedUserData.codigo_postal = codigoPostal.value
        }
  
        // Solo incluir contraseña si se ha introducido una nueva
        const contrasenia = document.getElementById("contrasena")
        const confirmarContrasenia = document.getElementById("confirmar_contrasena")
        if (contrasenia && contrasenia.value) {
          if (confirmarContrasenia && contrasenia.value === confirmarContrasenia.value) {
            updatedUserData.contrasenia = contrasenia.value
          } else {
            Swal.fire({
              icon: "error",
              title: "Error de validación",
              text: "Las contraseñas no coinciden.",
            })
            return
          }
        }
  
        // Si no se ha modificado ningún campo, mostrar mensaje y salir
        if (Object.keys(updatedUserData).length === 0) {
          Swal.fire({
            icon: "info",
            title: "Sin cambios",
            text: "No se ha modificado ningún dato.",
            timer: 3000,
            showConfirmButton: false,
          })
          return
        }
  
        // Mostrar cargando mientras se actualiza
        Swal.fire({
          title: "Actualizando datos...",
          text: "Por favor espere",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          },
        })
  
        // Enviar solo los datos modificados al backend
        const data = await this.updateUserData(updatedUserData)
  
        // Mostrar mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "¡Perfil actualizado!",
          text: "Tu información ha sido actualizada correctamente.",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: true,
          confirmButtonText: "Aceptar",
        })
  
        // Actualizar datos en localStorage
        let userData = JSON.parse(localStorage.getItem("userData") || "{}")
        userData = { ...userData, ...data }
        localStorage.setItem("userData", JSON.stringify(userData))
  
        // Actualizar el menú o UI con los nuevos datos
        if (typeof updateMenu === "function") updateMenu(data)
  
        this.closeModal("settingsModal")
        return data
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error al actualizar",
          text: error.message || "Hubo un problema al actualizar la información.",
        })
        console.error("Error al actualizar los datos:", error)
        throw error
      }
    }
  
    /**
     * Actualiza los datos del usuario
     * @param {Object} userData - Datos del usuario a actualizar
     * @returns {Promise} - Promesa con los datos actualizados
     */
    async updateUserData(userData) {
      return this.put("auth/update", userData)
    }
  
    /**
     * Actualiza la foto de perfil del usuario
     * @param {FormData} formData - FormData con la foto
     * @returns {Promise} - Promesa con los datos actualizados
     */
    async updateProfilePhoto(formData) {
      const headers = {}
      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`
      }
  
      try {
        const response = await fetch(`${this.baseURL}/auth/update-profile-photo`, {
          method: "POST",
          headers: headers,
          body: formData,
          credentials: "include",
        })
  
        if (!response.ok) {
          throw await this.handleError(response)
        }
  
        const data = await response.json()
        console.log("Respuesta de updateProfilePhoto:", data)
  
        // Obtener la URL de la foto de perfil
        let photoUrl = ""
        if (data.photoUrl) {
          photoUrl = this.getFullImageUrl(data.photoUrl)
        } else if (data.foto_perfil) {
          photoUrl = this.getFullImageUrl(data.foto_perfil)
        }
  
        console.log("URL de la foto procesada:", photoUrl)
  
        // Actualizar datos en localStorage
        if (photoUrl) {
          const userData = JSON.parse(localStorage.getItem("userData") || "{}")
          userData.foto_perfil = photoUrl
          localStorage.setItem("userData", JSON.stringify(userData))
  
          // Actualizar elementos de la UI
          if (typeof window.updateProfilePhotoUI === "function") {
            window.updateProfilePhotoUI(photoUrl)
          }
        }
  
        return data
      } catch (error) {
        console.error("Error al actualizar foto de perfil:", error)
        throw error
      }
    }
  
    /**
     * Maneja la recuperación de contraseña
     */
    async recoverPasswordHandler(event) {
      if (event) event.preventDefault()
  
      // Validar que existe el formulario para recuperar contraseña
      const emailInput = document.getElementById("reset-password-email")
      if (emailInput) {
        // Si el modal de recuperación está abierto, usar el valor del input
        const email = emailInput.value.trim()
        if (!email) {
          Swal.fire({
            icon: "error",
            title: "Campo requerido",
            text: "Por favor, ingrese su correo electrónico",
          })
          return
        }
  
        try {
          // Mostrar indicador de carga
          Swal.fire({
            title: "Enviando código...",
            text: "Por favor espere un momento",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading()
            },
          })
          const response = await this.post("auth/recover-password-code", { correo: email })
  
          Swal.fire({
            icon: "success",
            title: "Código Enviado",
            text: response.message || "Si el correo está registrado, recibirás un código de recuperación",
            confirmButtonText: "Continuar",
          }).then(() => {
            closeModal("resetPasswordModal")
            // Pre-llenar el correo en el modal de verificación
            document.getElementById("verify-email").value = email
            openModal("verifyCodeModal")
          })
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "Error al enviar el código de recuperación",
          })
        }
      } else {
        // Si no está abierto el modal, mostrar un mensaje de error
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo iniciar el proceso de recuperación de contraseña",
        })
      }
    }
  
    /**
     * Envía una solicitud de recuperación de contraseña
     * @param {string} email - Email del usuario
     * @returns {Promise} - Promesa con la respuesta
     */
    async recoverPassword(email) {
      try {
        return await this.post("auth/recover-password", { correo: email })
      } catch (error) {
        // Manejo estructurado del error
        console.error("Error al recuperar contraseña:", error)
        throw new Error(error.message || "No se pudo procesar la solicitud")
      }
    }
  
    /**
     * Verifica el estado de la sesión del usuario
     * @returns {Promise} - Promesa con los datos del usuario
     */
    async verificarSesion() {
      console.log("🔍 Verificando sesión...")
  
      const token = localStorage.getItem("token")
      console.log("📌 Token recuperado en verificarSesion():", token)
  
      if (!token) {
        console.warn("⚠️ No hay token disponible en localStorage.")
        return Promise.reject("No hay token disponible")
      }
  
      try {
        const response = await fetch(`${this.baseURL}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
  
        console.log("📩 Respuesta del backend:", response.status, response.statusText)
  
        if (!response.ok) {
          console.warn("⚠️ Sesión no válida. Redirigiendo al login...")
          throw new Error("Sesión no válida")
        }
  
        const data = await response.json()
        console.log("✅ Datos del usuario autenticado:", data)
  
        // Procesar la URL de la foto de perfil
        if (data.foto_perfil) {
          data.foto_perfil = this.getFullImageUrl(data.foto_perfil)
          console.log("🖼️ URL de la foto de perfil procesada:", data.foto_perfil)
  
          // Actualizar la foto de perfil en la UI
          if (typeof window.updateProfilePhotoUI === "function") {
            window.updateProfilePhotoUI(data.foto_perfil)
          }
        }
  
        return data
      } catch (error) {
        console.error("❌ Error al verificar sesión:", error)
        return Promise.reject(error)
      }
    }
  
    // ============= MÉTODOS PARA MASCOTAS =============
  
    /**
     * Obtiene la lista de mascotas
     * @param {Object} params - Parámetros de filtrado
     * @returns {Promise} - Promesa con la lista de mascotas
     */
    async getMascotas(params = {}) {
      return this.get("mascotas", params)
    }
  
    /**
     * Obtiene una mascota por su ID
     * @param {number} id - ID de la mascota
     * @returns {Promise} - Promesa con los datos de la mascota
     */
    async getMascota(id) {
      return this.get(`mascotas/${id}`)
    }
  
    /**
     * Envía una solicitud de adopción
     * @param {Object} data - Datos del formulario
     * @returns {Promise} - Promesa con la respuesta de la solicitud
     */
    async enviarSolicitudAdopcion(data) {
      return this.post("mascotas/adoptar", data) // Agregar "mascotas" en la URL
    }
  
    /**
     * Obtiene las historias de éxito
     * @returns {Promise} - Promesa con las historias
     */
    async getSuccessStories() {
      return this.get("success_stories")
    }
  
    /**
     * Envía una nueva historia de éxito
     * @param {FormData} formData - Datos del formulario
     * @returns {Promise} - Promesa con la respuesta
     */
    async submitSuccessStory(formData) {
      return this.postFormData("success_stories", formData)
    }
  
    // ============= CONFIGURACIÓN DE EVENT LISTENERS =============
  
    /**
     * Configura los event listeners para los formularios
     */
    setupEventListeners() {
      // Login form
      const loginForm = document.getElementById("login-form")
      if (loginForm) {
        loginForm.addEventListener("submit", (e) => this.loginHandler(e))
      } else {
        console.log("Formulario de inicio de sesión no encontrado o no disponible aún")
      }
  
      // Logout button
      const logoutButton = document.getElementById("logout-button")
      if (logoutButton) {
        logoutButton.addEventListener("click", () => this.logout())
      } else {
        console.log("Botón de cerrar sesión no encontrado o no disponible aún")
      }
  
      // Register form
      const registerForm = document.getElementById("register-form")
      if (registerForm) {
        registerForm.addEventListener("submit", (e) => this.registerHandler(e))
      } else {
        console.log("Formulario de registro no encontrado o no disponible aún")
      }
  
      // Formulario de recuperación de contraseña
      const resetPasswordForm = document.getElementById("reset-password-form")
      if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", (e) => this.recoverPasswordHandler(e))
        console.log("Formulario de recuperación de contraseña configurado correctamente")
      } else {
        console.log("Formulario de recuperación de contraseña no encontrado o no disponible aún")
      }
  
      // Enlace de "Olvidé mi contraseña"
      const forgotPasswordLink = document.querySelector(".forgot-password")
      if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", (e) => {
          e.preventDefault()
          this.openModal("resetPasswordModal")
        })
      } else {
        console.log('Enlace de "Olvidé mi contraseña" no encontrado o no disponible aún')
      }
  
      // Actualización de perfil
      const updateProfileForm = document.getElementById("settings-form")
      if (updateProfileForm) {
        updateProfileForm.addEventListener("submit", (e) => this.updateUserHandler(e))
      } else {
        console.log("Formulario de actualización de perfil no encontrado o no disponible aún")
      }
  
      // Cargar datos del usuario al iniciar
      this.getUserData()
    }
  }
  
  // Crear una instancia global
  const apiConnector = new APIConnector("https://montanitaadopta.onrender.com/adoptme/api/v1")
  
  /**
   * Función para actualizar la foto de perfil en la UI
   * @param {string} photoUrl - URL de la foto de perfil
   */
  function updateProfilePhotoUI(photoUrl) {
    if (!photoUrl) return
  
    // Añadir parámetro de tiempo para evitar caché
    const noCacheUrl = `${photoUrl}?t=${new Date().getTime()}`
  
    console.log("Actualizando foto de perfil en UI con URL:", noCacheUrl)
  
    // Actualizar todas las instancias de la foto de perfil
    const profilePhotos = [
      document.getElementById("profile-photo"),
      document.getElementById("current-profile-photo"),
      ...Array.from(document.querySelectorAll(".profile-photo")),
    ]
  
    profilePhotos.forEach((photo) => {
      if (photo) {
        console.log("Actualizando elemento:", photo)
        photo.src = noCacheUrl
  
        // Forzar recarga de la imagen
        photo.onload = () => {
          console.log("Imagen cargada correctamente:", photo.src)
        }
        photo.onerror = () => {
          console.error("Error al cargar la imagen:", photo.src)
          // Intentar con la URL original sin caché como fallback
          photo.src = photoUrl
        }
      }
    })
  
    console.log("Interfaz de usuario actualizada con la nueva foto de perfil")
  }
  
  // Hacer accesible la función globalmente
  window.updateProfilePhotoUI = updateProfilePhotoUI
  
  // Declarar las variables globales
  const Swal = window.Swal
  const updateMenu = window.updateMenu
  const closeModal = window.closeModal
  const openModal = window.openModal
  
  