// Script para manejar el cambio de foto de perfil
document.addEventListener("DOMContentLoaded", () => {
    // Referencias a elementos del DOM
    const photoModal = document.getElementById("photoModal")
    const profilePhotoForm = document.getElementById("profile-photo-form")
    const photoUpload = document.getElementById("profile-photo-upload")
    const photoPreview = document.getElementById("photo-preview")
    const currentProfilePhoto = document.getElementById("current-profile-photo")
    const mainProfilePhoto = document.getElementById("profile-photo")
  
    // Verificar si SweetAlert está disponible
    const Swal = window.Swal || {
      fire: (options) => {
        alert(options.text || options.title)
      },
      showLoading: () => {},
    }
  
    // Función para abrir el modal de foto de perfil
    window.openPhotoModal = () => {
      console.log("Opening photo modal")
      console.log("photoModal element:", photoModal)
  
      // Mostrar la foto de perfil actual en el modal
      if (mainProfilePhoto && mainProfilePhoto.src) {
        currentProfilePhoto.src = mainProfilePhoto.src
      }
      photoModal.style.display = "block"
  
      // Añadir un pequeño retraso para permitir que el navegador aplique el display: block
      setTimeout(() => {
        photoModal.classList.add("show")
      }, 10)
    }
  
    // Función para cerrar el modal de foto de perfil
    window.closePhotoModal = () => {
      photoModal.classList.remove("show")
  
      // Esperar a que termine la transición de opacidad antes de ocultarlo
      setTimeout(() => {
        photoModal.style.display = "none"
        // Limpiar la vista previa al cerrar
        photoPreview.style.display = "none"
        photoPreview.src = "#"
        photoUpload.value = ""
      }, 300) // 300ms coincide con la duración de la transición en CSS
    }
  
    // Cerrar el modal si se hace clic fuera del contenido
    window.addEventListener("click", (event) => {
      if (event.target === photoModal) {
        window.closePhotoModal()
      }
    })
  
    // Mostrar vista previa de la imagen seleccionada
    photoUpload.addEventListener("change", (event) => {
      const file = event.target.files[0]
      if (file) {
        // Verificar que sea una imagen
        if (!file.type.startsWith("image/")) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Solo se permiten archivos de imagen",
          })
          photoUpload.value = ""
          return
        }
  
        // Verificar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "La imagen es demasiado grande. Máximo 5MB.",
          })
          photoUpload.value = ""
          return
        }
  
        // Mostrar vista previa
        const reader = new FileReader()
        reader.onload = () => {
          photoPreview.src = reader.result
          photoPreview.style.display = "block"
        }
        reader.readAsDataURL(file)
      }
    })
  
    // Manejar el envío del formulario de foto de perfil
    profilePhotoForm.addEventListener("submit", async (event) => {
      event.preventDefault()
  
      // Verificar si se ha seleccionado una imagen
      if (!photoUpload.files || photoUpload.files.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Advertencia",
          text: "Por favor, selecciona una imagen primero",
        })
        return
      }
  
      // Crear FormData para enviar la imagen
      const formData = new FormData()
      formData.append("photo", photoUpload.files[0])
  
      try {
        // Mostrar indicador de carga
        Swal.fire({
          title: "Subiendo imagen...",
          text: "Por favor espera",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          },
        })
  
        // Obtener el token de acceso del almacenamiento local
        const token = localStorage.getItem("token")
  
        if (!token) {
          throw new Error("No se encontró el token de autenticación")
        }
  
        // Comprimir la imagen antes de procesarla
        const file = photoUpload.files[0]
        const compressedDataURL = await compressImage(file, {
          maxWidth: 400,
          maxHeight: 400,
          quality: 0.7,
        })
  
        console.log("Imagen comprimida correctamente")
  
        // Intentar enviar al backend primero
        let backendSuccess = false
        let photoUrl = ""
  
        try {
          // Convertir Data URL a Blob para enviar al backend
          const blob = await dataURLtoBlob(compressedDataURL)
          const photoFormData = new FormData()
          photoFormData.append("photo", blob, "profile-photo.jpg")
  
          // Enviar la solicitud con el token de autenticación
          const response = await fetch("https://montanitaadopta.onrender.com/adoptme/api/v1/auth/update-profile-photo", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: photoFormData,
          })
  
          const data = await response.json()
  
          if (!response.ok) {
            throw new Error(data.detail || "Error al actualizar la foto de perfil en el backend")
          }
  
          console.log("Respuesta del servidor:", data)
  
          if (data.photoUrl) {
            // Construir la URL completa para la imagen
            if (data.photoUrl.startsWith("http")) {
              photoUrl = data.photoUrl
            } else {
              // Asegurarse de usar el dominio correcto
              const apiDomain = "https://montanitaadopta.onrender.com"
              photoUrl = data.photoUrl.startsWith("/") ? `${apiDomain}${data.photoUrl}` : `${apiDomain}/${data.photoUrl}`
            }
  
            console.log("URL completa de la foto (backend):", photoUrl)
            console.log("Intentando cargar imagen desde:", photoUrl)
  
            // Verificar si la imagen es accesible
            const testImg = new Image()
            testImg.onload = () => {
              console.log("✅ Imagen cargada correctamente desde el servidor")
            }
            testImg.onerror = () => {
              console.warn("⚠️ No se pudo cargar la imagen desde el servidor, usando versión local")
              // Si no se puede cargar la imagen, usar la versión comprimida local
              photoUrl = compressedDataURL
  
              // Actualizar la interfaz con la versión local
              if (mainProfilePhoto) mainProfilePhoto.src = photoUrl
              if (currentProfilePhoto) currentProfilePhoto.src = photoUrl
  
              // Actualizar localStorage
              const userData = JSON.parse(localStorage.getItem("userData") || "{}")
              userData.foto_perfil = photoUrl
              localStorage.setItem("userData", JSON.stringify(userData))
            }
            testImg.src = photoUrl
  
            backendSuccess = true
          }
        } catch (backendError) {
          console.warn("No se pudo actualizar la foto en el backend:", backendError)
          // Continuamos con el guardado local
        }
  
        // Si el backend falló o no devolvió una URL, usamos la versión local
        if (!backendSuccess) {
          photoUrl = compressedDataURL
          console.log("Usando versión local de la imagen")
        }
  
        // Guardar la URL en localStorage para persistencia
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        userData.foto_perfil = photoUrl
        localStorage.setItem("userData", JSON.stringify(userData))
  
        console.log("Datos de usuario actualizados en localStorage")
  
        // Actualizar la interfaz de usuario
        if (mainProfilePhoto) {
          mainProfilePhoto.src = photoUrl
          console.log("Foto de perfil principal actualizada")
        }
  
        if (currentProfilePhoto) {
          currentProfilePhoto.src = photoUrl
          console.log("Foto de perfil en modal actualizada")
        }
  
        // Limpiar la vista previa
        photoPreview.style.display = "none"
        photoUpload.value = ""
  
        // Notificar éxito
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Foto de perfil actualizada correctamente",
        })
  
        // Cerrar el modal
        window.closePhotoModal()
      } catch (error) {
        console.error("Error:", error)
  
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Ocurrió un error al actualizar la foto de perfil",
        })
      }
    })
  
    // Función para mostrar el nombre de usuario y la foto de perfil al cargar la página
    async function updateUserUI() {
      try {
        const token = localStorage.getItem("token")
  
        if (!token) {
          // Si no hay token, mostrar el menú de login
          document.getElementById("login-menu").style.display = "block"
          document.getElementById("user-menu").style.display = "none"
          return
        }
  
        // Intentar cargar datos desde localStorage primero
        const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}")
  
        // Mostrar el menú de usuario y ocultar el de login
        document.getElementById("login-menu").style.display = "none"
        document.getElementById("user-menu").style.display = "block"
  
        // Si hay datos en localStorage, usarlos inmediatamente
        if (storedUserData.nombre) {
          document.getElementById("username-text").textContent = storedUserData.nombre
        }
  
        if (storedUserData.foto_perfil) {
          console.log("Cargando foto de perfil desde localStorage")
          if (mainProfilePhoto) {
            mainProfilePhoto.src = storedUserData.foto_perfil
          }
          if (currentProfilePhoto) {
            currentProfilePhoto.src = storedUserData.foto_perfil
          }
        }
  
        // Luego intentar obtener datos actualizados del servidor
        try {
          // Obtener datos del usuario
          const response = await fetch("https://montanitaadopta.onrender.com/adoptme/api/v1/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
  
          if (!response.ok) {
            // Si hay un error (token inválido, etc.), mostrar menú de login
            localStorage.removeItem("token")
            document.getElementById("login-menu").style.display = "block"
            document.getElementById("user-menu").style.display = "none"
            return
          }
  
          const userData = await response.json()
          console.log("Datos de usuario recibidos del servidor:", userData)
  
          // Actualizar el nombre de usuario
          document.getElementById("username-text").textContent = userData.nombre
  
          // Actualizar localStorage con los datos más recientes
          const updatedUserData = { ...storedUserData, ...userData }
  
          // Mantener la foto de perfil de localStorage si existe
          if (storedUserData.foto_perfil && !userData.foto_perfil) {
            updatedUserData.foto_perfil = storedUserData.foto_perfil
          }
  
          localStorage.setItem("userData", JSON.stringify(updatedUserData))
  
          // Actualizar la foto de perfil si existe en el servidor y no tenemos una local
          if (userData.foto_perfil && !storedUserData.foto_perfil) {
            // Construir la URL completa para la imagen
            let photoUrl = userData.foto_perfil
  
            // Si es una ruta relativa, convertirla a absoluta
            if (photoUrl.startsWith("/")) {
              photoUrl = window.location.origin + photoUrl
            }
  
            console.log("URL de foto de perfil del servidor:", photoUrl)
  
            if (mainProfilePhoto) {
              mainProfilePhoto.src = photoUrl
            }
  
            if (currentProfilePhoto) {
              currentProfilePhoto.src = photoUrl
            }
  
            // Actualizar en localStorage
            updatedUserData.foto_perfil = photoUrl
            localStorage.setItem("userData", JSON.stringify(updatedUserData))
          }
        } catch (serverError) {
          console.warn("Error al obtener datos del servidor:", serverError)
          // Continuamos con los datos de localStorage
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error)
        // En caso de error, mostrar menú de login
        document.getElementById("login-menu").style.display = "block"
        document.getElementById("user-menu").style.display = "none"
      }
    }
  
    // Cargar los datos del usuario al iniciar
    updateUserUI()
  
    // Manejar cierre de sesión
    document.getElementById("logout-button").addEventListener("click", (event) => {
      event.preventDefault()
  
      // Eliminar el token de acceso
      localStorage.removeItem("token")
  
      // Actualizar UI
      document.getElementById("login-menu").style.display = "block"
      document.getElementById("user-menu").style.display = "none"
  
      // Notificar al usuario
      Swal.fire({
        icon: "success",
        title: "Cerrar sesión",
        text: "Has cerrado sesión correctamente",
      })
    })
  
    // ===== FUNCIONES AUXILIARES PARA COMPRESIÓN DE IMÁGENES =====
  
    /**
     * Comprime una imagen
     * @param {File|Blob} file - Archivo de imagen a comprimir
     * @param {Object} options - Opciones de compresión
     * @returns {Promise<string>} - Data URL de la imagen comprimida
     */
    async function compressImage(file, options = {}) {
      const { maxWidth = 800, maxHeight = 800, quality = 0.8, format = "jpeg" } = options
  
      return new Promise((resolve, reject) => {
        // Crear un elemento de imagen para cargar el archivo
        const img = new Image()
        img.onload = () => {
          // Liberar la URL del objeto
          URL.revokeObjectURL(img.src)
  
          // Calcular las dimensiones manteniendo la proporción
          let width = img.width
          let height = img.height
  
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
  
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
  
          // Crear un canvas para dibujar la imagen redimensionada
          const canvas = document.createElement("canvas")
          canvas.width = width
          canvas.height = height
  
          // Dibujar la imagen en el canvas
          const ctx = canvas.getContext("2d")
          ctx.drawImage(img, 0, 0, width, height)
  
          // Convertir el canvas a Data URL
          const dataURL = canvas.toDataURL(`image/${format}`, quality)
          resolve(dataURL)
        }
  
        img.onerror = () => {
          URL.revokeObjectURL(img.src)
          reject(new Error("Error al cargar la imagen"))
        }
  
        // Cargar la imagen desde el archivo
        img.src = URL.createObjectURL(file)
      })
    }
  
    /**
     * Convierte un Data URL a Blob
     * @param {string} dataURL - Data URL a convertir
     * @returns {Promise<Blob>} - Blob resultante
     */
    function dataURLtoBlob(dataURL) {
      return new Promise((resolve) => {
        const parts = dataURL.split(";base64,")
        const contentType = parts[0].split(":")[1]
        const raw = window.atob(parts[1])
        const rawLength = raw.length
        const uInt8Array = new Uint8Array(rawLength)
  
        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i)
        }
  
        resolve(new Blob([uInt8Array], { type: contentType }))
      })
    }
  })
  
  