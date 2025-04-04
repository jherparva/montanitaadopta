// Script para manejar el cambio de foto de perfil
document.addEventListener("DOMContentLoaded", () => {
  // Referencias a elementos del DOM
  const photoModal = document.getElementById("photoModal")
  const profilePhotoForm = document.getElementById("profile-photo-form")
  const photoUpload = document.getElementById("profile-photo-upload")
  const photoPreview = document.getElementById("photo-preview")
  const currentProfilePhoto = document.getElementById("current-profile-photo")
  const mainProfilePhoto = document.getElementById("profile-photo")

  // Verificar elementos críticos
  if (!mainProfilePhoto) {
    console.error("ELEMENTO CRÍTICO NO ENCONTRADO: #profile-photo no existe en el DOM")
  }

  if (!photoModal) {
    console.error("ELEMENTO CRÍTICO NO ENCONTRADO: #photoModal no existe en el DOM")
  }

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

      // Enviar la solicitud con el token de autenticación
      const response = await fetch("https://montanitaadopta.onrender.com/adoptme/api/v1/auth/update-profile-photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Error al actualizar la foto de perfil")
      }

      const data = await response.json()
      console.log("Respuesta del servidor:", data)

      if (data.photoUrl) {
        // Usar la URL completa proporcionada por el servidor
        const photoUrl = data.photoUrl

        console.log("URL de la foto:", photoUrl)

        // Actualizar la interfaz de usuario
        if (mainProfilePhoto) {
          mainProfilePhoto.src = photoUrl
        }

        if (currentProfilePhoto) {
          currentProfilePhoto.src = photoUrl
        }

        // Actualizar localStorage
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        userData.foto_perfil = photoUrl
        localStorage.setItem("userData", JSON.stringify(userData))

        // Notificar éxito
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Foto de perfil actualizada correctamente",
        })

        // Cerrar el modal
        window.closePhotoModal()
      } else {
        throw new Error("No se recibió la URL de la imagen")
      }
    } catch (error) {
      console.error("Error:", error)

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Ocurrió un error al actualizar la foto de perfil",
      })
    }
  })

  // Función para actualizar el UI del usuario al cargar la página
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

        // Actualizar la foto de perfil si existe en el servidor
        if (userData.foto_perfil) {
          // Construir la URL completa para la imagen
          let photoUrl = userData.foto_perfil

          // Si es una ruta relativa, convertirla a absoluta
          if (photoUrl.startsWith("/")) {
            photoUrl = "https://montanitaadopta.onrender.com" + photoUrl
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
})

