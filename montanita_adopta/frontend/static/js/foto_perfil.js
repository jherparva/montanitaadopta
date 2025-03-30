// Script para manejar el cambio de foto de perfil
document.addEventListener("DOMContentLoaded", () => {
    // Referencias a elementos del DOM
    const photoModal = document.getElementById("photoModal")
    const profilePhotoForm = document.getElementById("profile-photo-form")
    const photoUpload = document.getElementById("profile-photo-upload")
    const photoPreview = document.getElementById("photo-preview")
    const currentProfilePhoto = document.getElementById("current-profile-photo")
    const mainProfilePhoto = document.getElementById("profile-photo")
  
    // URL base del servidor
    const BASE_URL = "https://montanitaadopta.onrender.com"
  
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
        closePhotoModal()
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
  
    // Función para construir la URL completa de la imagen
    function getFullImageUrl(relativePath) {
      if (!relativePath) return ""
  
      // Si ya es una URL completa, devolverla tal cual
      if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
        return relativePath
      }
  
      // Si es una ruta relativa, añadir la URL base
      return `${BASE_URL}${relativePath}`
    }
  
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
  
        // Enviar la solicitud con el token de autenticación
        const response = await fetch(`${BASE_URL}/adoptme/api/v1/auth/update-profile-photo`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })
  
        const data = await response.json()
        console.log("Respuesta del servidor:", data)
  
        if (!response.ok) {
          throw new Error(data.detail || "Error al actualizar la foto de perfil")
        }
  
        // Obtener la URL de la foto de perfil
        let photoUrl = ""
        if (data.photoUrl) {
          photoUrl = getFullImageUrl(data.photoUrl)
          console.log("URL de la foto actualizada:", photoUrl)
        } else if (data.foto_perfil) {
          photoUrl = getFullImageUrl(data.foto_perfil)
          console.log("URL de la foto actualizada (alternativa):", photoUrl)
        }
  
        if (!photoUrl) {
          console.error("No se recibió URL de foto de perfil en la respuesta")
          throw new Error("No se recibió URL de foto de perfil en la respuesta")
        }
  
        // Verificar si la imagen existe antes de actualizar la UI
        try {
          console.log("Verificando si la imagen existe:", photoUrl)
          const imgTest = new Image()
          imgTest.onload = () => {
            console.log("✅ La imagen se cargó correctamente")
            updateUIWithNewPhoto(photoUrl)
          }
          imgTest.onerror = () => {
            console.error("❌ Error al cargar la imagen:", photoUrl)
            // Intentar con un retraso para dar tiempo al servidor
            setTimeout(() => {
              console.log("Reintentando cargar la imagen después de un retraso...")
              updateUIWithNewPhoto(photoUrl)
            }, 2000)
          }
          imgTest.src = photoUrl
        } catch (imgError) {
          console.error("Error al verificar la imagen:", imgError)
          // Continuar con la actualización de la UI de todos modos
          updateUIWithNewPhoto(photoUrl)
        }
  
        // Notificar éxito
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Foto de perfil actualizada correctamente",
        })
  
        // Cerrar el modal
        closePhotoModal()
      } catch (error) {
        console.error("Error:", error)
  
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Ocurrió un error al actualizar la foto de perfil",
        })
      }
    })
  
    // Función para actualizar la UI con la nueva foto
    function updateUIWithNewPhoto(photoUrl) {
      console.log("Actualizando UI con la nueva foto:", photoUrl)
  
      // Añadir parámetro de tiempo para evitar caché
      const noCacheUrl = `${photoUrl}?t=${new Date().getTime()}`
  
      // Actualizar la foto en el menú de usuario
      if (mainProfilePhoto) {
        console.log("Actualizando foto principal")
        mainProfilePhoto.src = noCacheUrl
      }
  
      // Actualizar la foto actual en el modal
      if (currentProfilePhoto) {
        console.log("Actualizando foto en modal")
        currentProfilePhoto.src = noCacheUrl
      }
  
      // Actualizar cualquier otra instancia de la foto de perfil en la página
      const allProfilePhotos = document.querySelectorAll(".profile-photo")
      if (allProfilePhotos.length > 0) {
        console.log(`Actualizando ${allProfilePhotos.length} instancias de fotos de perfil`)
        allProfilePhotos.forEach((photo) => {
          photo.src = noCacheUrl
        })
      }
  
      // Actualizar los datos del usuario en localStorage
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        userData.foto_perfil = photoUrl // Guardar sin el parámetro de caché
        localStorage.setItem("userData", JSON.stringify(userData))
        console.log("Datos de usuario actualizados en localStorage")
      } catch (e) {
        console.error("Error al actualizar datos en localStorage:", e)
      }
  
      // Actualizar la interfaz de usuario después de un breve retraso
      setTimeout(() => {
        // Recargar los datos del usuario para asegurarse de que todo esté actualizado
        if (window.apiConnector && typeof window.apiConnector.getUserData === "function") {
          window.apiConnector.getUserData()
        }
  
        // Forzar una actualización de todas las imágenes
        if (window.updateMenu && typeof window.updateMenu === "function") {
          const userData = JSON.parse(localStorage.getItem("userData") || "{}")
          window.updateMenu(userData)
        }
      }, 500)
    }
  
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
  
        // Obtener datos del usuario
        const response = await fetch(`${BASE_URL}/adoptme/api/v1/auth/me`, {
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
        console.log("Datos del usuario:", userData)
  
        // Mostrar el menú de usuario y ocultar el de login
        document.getElementById("login-menu").style.display = "none"
        document.getElementById("user-menu").style.display = "block"
  
        // Actualizar el nombre de usuario
        const usernameElement = document.getElementById("username-text")
        if (usernameElement) {
          usernameElement.textContent = userData.nombre
        }
  
        // Actualizar la foto de perfil si existe
        if (userData.foto_perfil) {
          const photoUrl = getFullImageUrl(userData.foto_perfil)
          console.log("URL de la foto de perfil:", photoUrl)
  
          if (mainProfilePhoto) {
            mainProfilePhoto.src = photoUrl
          }
  
          if (currentProfilePhoto) {
            currentProfilePhoto.src = photoUrl
          }
  
          // Actualizar cualquier otra instancia de la foto de perfil
          const allProfilePhotos = document.querySelectorAll(".profile-photo")
          if (allProfilePhotos.length > 0) {
            allProfilePhotos.forEach((photo) => {
              photo.src = photoUrl
            })
          }
  
          // Actualizar los datos del usuario en localStorage
          try {
            const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}")
            storedUserData.foto_perfil = photoUrl
            localStorage.setItem("userData", JSON.stringify(storedUserData))
          } catch (e) {
            console.error("Error al actualizar datos en localStorage:", e)
          }
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
    const logoutButton = document.getElementById("logout-button")
    if (logoutButton) {
      logoutButton.addEventListener("click", (event) => {
        event.preventDefault()
  
        // Eliminar el token de acceso
        localStorage.removeItem("token")
        localStorage.removeItem("userData")
  
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
    }
  })
  
  