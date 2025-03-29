;(() => {
    // Función para actualizar el menú dependiendo de si el usuario está autenticado
    function updateMenu(userData) {
      const userMenu = document.getElementById("user-menu")
      const loginMenu = document.getElementById("login-menu")
      const userNameElement = document.getElementById("user-name")
      const profilePhoto = document.getElementById("profile-photo")
  
      // Si el usuario está autenticado
      if (userData) {
        userMenu.style.display = "inline-block" // Mostrar el menú del usuario
        loginMenu.style.display = "none" // Ocultar el menú de login
        userNameElement.innerText = userData.nombre // Mostrar solo el nombre del usuario
  
        // Actualizar la foto de perfil si existe
        if (userData.foto_perfil && profilePhoto) {
          profilePhoto.src = userData.foto_perfil
  
          // Actualizar todas las instancias de la foto de perfil
          if (typeof window.updateProfilePhotoUI === "function") {
            window.updateProfilePhotoUI(userData.foto_perfil)
          }
        }
      } else {
        userMenu.style.display = "none" // Ocultar el menú del usuario
        loginMenu.style.display = "inline-block" // Mostrar el menú de login
      }
    }
  
    // Función para abrir un modal
    function openModal(modalId) {
      var modal = document.getElementById(modalId)
      if (modal) {
        modal.style.display = "block"
      }
    }
  
    // Función para cerrar un modal
    function closeModal(modalId) {
      var modal = document.getElementById(modalId)
      if (modal) {
        modal.style.display = "none"
      }
    }
  
    // Hacer accesibles las funciones globalmente
    window.openModal = openModal
    window.closeModal = closeModal
    window.showModal = openModal // Compatibilidad con `showModal()`
  
    // Cerrar modal al hacer clic fuera del contenido
    window.onclick = (event) => {
      var modals = document.querySelectorAll(".modal")
      modals.forEach((modal) => {
        // Si el clic fue fuera del modal, cerramos el modal
        if (event.target === modal) {
          closeModal(modal.id) // Cerramos el modal específico
        }
      })
    }
  
    // Hacer accesible la función `updateMenu` globalmente
    window.updateMenu = updateMenu
  
    // Función para cerrar sesión
    const logoutButton = document.getElementById("logout-button")
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        // Eliminar el token y los datos del usuario del localStorage
        localStorage.removeItem("token")
        localStorage.removeItem("userData")
  
        // Actualizar el menú
        updateMenu(null) // Actualiza el menú al estado de "no autenticado"
  
        // Cerrar cualquier modal abierto
        closeModal("userMenuModal") // Ajusta el ID del modal según sea necesario
  
        // Evitar redirección, solo actualizar la interfaz
        // Aquí no se realiza la redirección a /login, solo se actualiza el estado del menú
      })
    }
  })()
  
  // Inicialización de flatpickr después de que el DOM esté completamente cargado
  document.addEventListener("DOMContentLoaded", () => {
    if (typeof flatpickr === "function") {
      flatpickr("#register-fecha-nacimiento", {
        dateFormat: "Y-m-d", // Puedes cambiar el formato de fecha si lo necesitas
        allowInput: true, // Permitir entrada manual
        minDate: "1900-01-01", // Fecha mínima si lo necesitas
        maxDate: "2025-12-31", // Fecha máxima si lo necesitas
      })
    }
  })
  
  // Función para actualizar la foto de perfil en la UI
  function updateProfilePhotoUI(photoUrl) {
    if (!photoUrl) return
  
    console.log("Actualizando foto de perfil en UI con URL:", photoUrl)
  
    // Actualizar todas las instancias de la foto de perfil
    const profilePhotos = [
      document.getElementById("profile-photo"),
      document.getElementById("current-profile-photo"),
      ...Array.from(document.querySelectorAll(".profile-photo")),
    ]
  
    profilePhotos.forEach((photo) => {
      if (photo) {
        console.log("Actualizando elemento:", photo)
        photo.src = photoUrl
      }
    })
  
    console.log("Interfaz de usuario actualizada con la nueva foto de perfil")
  }
  
  // Hacer accesible la función globalmente
  window.updateProfilePhotoUI = updateProfilePhotoUI
  
  