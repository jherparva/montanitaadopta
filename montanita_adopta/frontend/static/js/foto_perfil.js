// Script mejorado para manejar el cambio de foto de perfil con mejor manejo de errores
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado completamente - Inicializando script de foto de perfil")

  // Referencias a elementos del DOM con verificación de existencia
  const photoModal = document.getElementById("photoModal")
  const profilePhotoForm = document.getElementById("profile-photo-form")
  const photoUpload = document.getElementById("profile-photo-upload")
  const photoPreview = document.getElementById("photo-preview")
  const currentProfilePhoto = document.getElementById("current-profile-photo")
  const mainProfilePhoto = document.getElementById("profile-photo")
  const loginMenu = document.getElementById("login-menu")
  const userMenu = document.getElementById("user-menu")
  const usernameText = document.getElementById("username-text")
  const logoutButton = document.getElementById("logout-button")

  // Registrar elementos encontrados y faltantes
  console.log("Elementos encontrados en el DOM:", {
    photoModal: !!photoModal,
    profilePhotoForm: !!profilePhotoForm,
    photoUpload: !!photoUpload,
    photoPreview: !!photoPreview,
    currentProfilePhoto: !!currentProfilePhoto,
    mainProfilePhoto: !!mainProfilePhoto,
    loginMenu: !!loginMenu,
    userMenu: !!userMenu,
    usernameText: !!usernameText,
    logoutButton: !!logoutButton,
  })

  // Verificar si SweetAlert está disponible
  const Swal = window.Swal || {
    fire: (options) => {
      alert(options.text || options.title)
    },
    showLoading: () => {},
  }

  // Función segura para actualizar el texto de un elemento
  function safeSetTextContent(elementId, text) {
    const element = document.getElementById(elementId)
    if (element) {
      element.textContent = text
    } else {
      console.warn(`Elemento con ID '${elementId}' no encontrado en el DOM`)
    }
  }

  // Función segura para actualizar la visibilidad de un elemento
  function safeSetDisplay(element, displayValue) {
    if (element) {
      element.style.display = displayValue
    } else {
      console.warn("Intento de cambiar la visibilidad de un elemento nulo")
    }
  }

  // Función segura para actualizar la src de una imagen
  function safeSetImageSrc(element, src) {
    if (element && element instanceof HTMLImageElement) {
      // Añadir parámetro de tiempo para evitar caché
      element.src = src + "?t=" + new Date().getTime()
    } else {
      console.warn("Intento de cambiar la src de un elemento que no es una imagen o es nulo")
    }
  }

  // Función para abrir el modal de foto de perfil
  window.openPhotoModal = () => {
    console.log("Abriendo modal de foto de perfil")

    if (!photoModal) {
      console.error("ERROR: El modal de foto (#photoModal) no existe en el DOM")
      alert("No se puede abrir el modal de foto de perfil. Por favor, recarga la página.")
      return
    }

    // Mostrar la foto de perfil actual en el modal
    if (mainProfilePhoto && currentProfilePhoto) {
      safeSetImageSrc(currentProfilePhoto, mainProfilePhoto.src)
    }

    photoModal.style.display = "block"

    // Añadir un pequeño retraso para permitir que el navegador aplique el display: block
    setTimeout(() => {
      photoModal.classList.add("show")
    }, 10)
  }

  // Función para cerrar el modal de foto de perfil
  window.closePhotoModal = () => {
    if (!photoModal) {
      console.error("ERROR: El modal de foto (#photoModal) no existe en el DOM")
      return
    }

    photoModal.classList.remove("show")

    // Esperar a que termine la transición de opacidad antes de ocultarlo
    setTimeout(() => {
      photoModal.style.display = "none"
      // Limpiar la vista previa al cerrar
      if (photoPreview) {
        photoPreview.style.display = "none"
        photoPreview.src = "#"
      }
      if (photoUpload) {
        photoUpload.value = ""
      }
    }, 300) // 300ms coincide con la duración de la transición en CSS
  }

  // Cerrar el modal si se hace clic fuera del contenido
  if (photoModal) {
    window.addEventListener("click", (event) => {
      if (event.target === photoModal) {
        window.closePhotoModal()
      }
    })
  }

  // Mostrar vista previa de la imagen seleccionada
  if (photoUpload && photoPreview) {
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
  }

  // Manejar el envío del formulario de foto de perfil
  if (profilePhotoForm && photoUpload) {
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

        // Verificar si la respuesta es exitosa
        if (!response.ok) {
          const errorData = await response.json()
          console.error("Error en la respuesta:", response.status, errorData)
          throw new Error(errorData.detail || "Error al actualizar la foto de perfil")
        }

        // Procesar la respuesta
        const data = await response.json()
        console.log("Respuesta del servidor:", data)

        if (data.photoUrl) {
          // Usar la URL completa proporcionada por el servidor
          const photoUrl = data.photoUrl

          console.log("URL de la foto:", photoUrl)

          // Actualizar la interfaz de usuario
          if (mainProfilePhoto) {
            safeSetImageSrc(mainProfilePhoto, photoUrl)
          }

          if (currentProfilePhoto) {
            safeSetImageSrc(currentProfilePhoto, photoUrl)
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
  }

  // Función para actualizar el UI del usuario al cargar la página
  async function updateUserUI() {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        // Si no hay token, mostrar el menú de login
        console.log("No hay token, mostrando menú de login")
        safeSetDisplay(loginMenu, "block")
        safeSetDisplay(userMenu, "none")
        return
      }

      // Intentar cargar datos desde localStorage primero
      const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}")

      // Mostrar el menú de usuario y ocultar el de login
      safeSetDisplay(loginMenu, "none")
      safeSetDisplay(userMenu, "block")

      // Si hay datos en localStorage, usarlos inmediatamente
      if (storedUserData.nombre && usernameText) {
        safeSetTextContent("username-text", storedUserData.nombre)
      }

      if (storedUserData.foto_perfil) {
        console.log("Cargando foto de perfil desde localStorage:", storedUserData.foto_perfil)
        safeSetImageSrc(mainProfilePhoto, storedUserData.foto_perfil)
        safeSetImageSrc(currentProfilePhoto, storedUserData.foto_perfil)
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
          safeSetDisplay(loginMenu, "block")
          safeSetDisplay(userMenu, "none")
          return
        }

        const userData = await response.json()
        console.log("Datos de usuario recibidos del servidor:", userData)

        // Actualizar el nombre de usuario
        if (userData.nombre && usernameText) {
          safeSetTextContent("username-text", userData.nombre)
        }

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

          safeSetImageSrc(mainProfilePhoto, photoUrl)
          safeSetImageSrc(currentProfilePhoto, photoUrl)

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
      safeSetDisplay(loginMenu, "block")
      safeSetDisplay(userMenu, "none")
    }
  }

  // Cargar los datos del usuario al iniciar
  updateUserUI()

  // Manejar cierre de sesión
  if (logoutButton) {
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault()

      // Eliminar el token de acceso
      localStorage.removeItem("token")

      // Actualizar UI
      safeSetDisplay(loginMenu, "block")
      safeSetDisplay(userMenu, "none")

      // Notificar al usuario
      Swal.fire({
        icon: "success",
        title: "Cerrar sesión",
        text: "Has cerrado sesión correctamente",
      })
    })
  }
})

// Añade este script para ayudar a depurar problemas con el DOM
document.addEventListener("DOMContentLoaded", () => {
  console.log("=== DEPURACIÓN DE ELEMENTOS DEL DOM ===")

  // Lista de IDs importantes a verificar
  const importantIds = [
    "photoModal",
    "profile-photo-form",
    "profile-photo-upload",
    "photo-preview",
    "current-profile-photo",
    "profile-photo",
    "login-menu",
    "user-menu",
    "username-text",
    "logout-button",
  ]

  // Verificar cada ID
  importantIds.forEach((id) => {
    const element = document.getElementById(id)
    console.log(`Elemento #${id}: ${element ? "ENCONTRADO ✅" : "NO ENCONTRADO ❌"}`)

    if (element) {
      // Mostrar información adicional sobre el elemento
      console.log(`  - Tipo: ${element.tagName}`)
      console.log(`  - Visible: ${element.style.display !== "none"}`)
      console.log(`  - Contenido: ${element.tagName === "IMG" ? "Imagen" : element.textContent.substring(0, 50)}`)
    }
  })

  // Verificar estructura del DOM
  console.log("\n=== ESTRUCTURA DEL DOM ===")
  const userMenu = document.getElementById("user-menu")
  if (userMenu) {
    console.log("Estructura del menú de usuario:")
    console.log(userMenu.innerHTML)
  } else {
    console.log("Menú de usuario no encontrado")
  }

  const photoModal = document.getElementById("photoModal")
  if (photoModal) {
    console.log("Estructura del modal de foto:")
    console.log(photoModal.innerHTML)
  } else {
    console.log("Modal de foto no encontrado")
  }

  console.log("=== FIN DE DEPURACIÓN ===")
})

