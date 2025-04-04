// Script mejorado para manejar el cambio de foto de perfil
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado completamente - Inicializando script de foto de perfil");

  // Referencias a elementos del DOM
  const photoModal = document.getElementById("photoModal");
  const profilePhotoForm = document.getElementById("profile-photo-form");
  const photoUpload = document.getElementById("profile-photo-upload");
  const photoPreview = document.getElementById("photo-preview");
  const currentProfilePhoto = document.getElementById("current-profile-photo");
  const mainProfilePhoto = document.getElementById("profile-photo");
  const photoError = document.getElementById("photo-error");
  const savePhotoBtn = document.getElementById("save-photo-btn");
  const newPhotoContainer = document.querySelector(".new-photo");
  const fileUploadButton = document.querySelector(".file-upload-button");

  // Verificar si SweetAlert está disponible
  const Swal = window.Swal || {
    fire: (options) => {
      alert(options.text || options.title);
    },
    showLoading: () => {},
    close: () => {}
  };

  // Función para mostrar errores
  function showError(message) {
    if (photoError) {
      photoError.textContent = message;
      photoError.style.display = "block";
    } else {
      console.error("Error:", message);
    }
  }

  // Función para limpiar errores
  function clearError() {
    if (photoError) {
      photoError.textContent = "";
      photoError.style.display = "none";
    }
  }

  // Función para abrir el modal de foto de perfil
  window.openPhotoModal = () => {
    console.log("Abriendo modal de foto de perfil");

    if (!photoModal) {
      console.error("ERROR: El modal de foto (#photoModal) no existe en el DOM");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se puede abrir el modal de foto de perfil. Por favor, recarga la página."
      });
      return;
    }

    // Mostrar la foto de perfil actual en el modal
    if (mainProfilePhoto && currentProfilePhoto) {
      currentProfilePhoto.src = mainProfilePhoto.src;
    }

    // Limpiar cualquier vista previa anterior
    if (photoPreview) {
      photoPreview.style.display = "none";
      photoPreview.src = "#";
    }
    
    // Limpiar cualquier error anterior
    clearError();
    
    // Resetear el formulario
    if (profilePhotoForm) {
      profilePhotoForm.reset();
    }

    // Mostrar el modal con animación
    photoModal.style.display = "block";
    
    // Añadir un pequeño retraso para permitir que el navegador aplique el display: block
    setTimeout(() => {
      photoModal.classList.add("show");
    }, 10);
  };

  // Función para cerrar el modal de foto de perfil
  window.closePhotoModal = () => {
    if (!photoModal) {
      console.error("ERROR: El modal de foto (#photoModal) no existe en el DOM");
      return;
    }

    photoModal.classList.remove("show");

    // Esperar a que termine la transición de opacidad antes de ocultarlo
    setTimeout(() => {
      photoModal.style.display = "none";
      
      // Limpiar la vista previa al cerrar
      if (photoPreview) {
        photoPreview.style.display = "none";
        photoPreview.src = "#";
      }
      
      // Resetear el formulario
      if (profilePhotoForm) {
        profilePhotoForm.reset();
      }
      
      // Limpiar errores
      clearError();
      
      // Habilitar el botón de guardar
      if (savePhotoBtn) {
        savePhotoBtn.disabled = false;
        savePhotoBtn.classList.remove("loading");
      }
    }, 300); // 300ms coincide con la duración de la transición en CSS
  };

  // Cerrar el modal si se hace clic fuera del contenido
  if (photoModal) {
    photoModal.addEventListener("click", (event) => {
      if (event.target === photoModal) {
        window.closePhotoModal();
      }
    });
  }

  // Función para validar la imagen seleccionada
  function validateImage(file) {
    // Verificar que sea una imagen
    if (!file.type.startsWith("image/")) {
      showError("Solo se permiten archivos de imagen");
      return false;
    }

    // Verificar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("La imagen es demasiado grande. Máximo 5MB.");
      return false;
    }

    clearError();
    return true;
  }

  // Mostrar vista previa de la imagen seleccionada
  if (photoUpload && photoPreview) {
    photoUpload.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        if (!validateImage(file)) {
          photoUpload.value = "";
          return;
        }

        // Mostrar vista previa
        const reader = new FileReader();
        reader.onload = () => {
          photoPreview.src = reader.result;
          photoPreview.style.display = "block";
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Implementar funcionalidad de arrastrar y soltar
  if (newPhotoContainer) {
    // Prevenir comportamiento por defecto para permitir soltar
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      newPhotoContainer.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Añadir clase cuando se arrastra sobre el área
    ['dragenter', 'dragover'].forEach(eventName => {
      newPhotoContainer.addEventListener(eventName, () => {
        newPhotoContainer.classList.add('drag-over');
      }, false);
    });

    // Quitar clase cuando se sale del área
    ['dragleave', 'drop'].forEach(eventName => {
      newPhotoContainer.addEventListener(eventName, () => {
        newPhotoContainer.classList.remove('drag-over');
      }, false);
    });

    // Manejar el evento de soltar
    newPhotoContainer.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const file = dt.files[0];
      
      if (file) {
        if (validateImage(file)) {
          // Crear un objeto de transferencia de archivos para el input
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          photoUpload.files = dataTransfer.files;
          
          // Mostrar vista previa
          const reader = new FileReader();
          reader.onload = () => {
            photoPreview.src = reader.result;
            photoPreview.style.display = "block";
          };
          reader.readAsDataURL(file);
        }
      }
    }, false);
  }

  // Hacer clic en el botón para activar el input de archivo
  if (fileUploadButton && photoUpload) {
    fileUploadButton.addEventListener("click", () => {
      photoUpload.click();
    });
  }

  // Manejar el envío del formulario de foto de perfil
  if (profilePhotoForm && photoUpload) {
    profilePhotoForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Verificar si se ha seleccionado una imagen
      if (!photoUpload.files || photoUpload.files.length === 0) {
        showError("Por favor, selecciona una imagen primero");
        return;
      }

      // Deshabilitar el botón y mostrar estado de carga
      if (savePhotoBtn) {
        savePhotoBtn.disabled = true;
        savePhotoBtn.classList.add("loading");
      }

      // Limpiar errores previos
      clearError();

      // Crear FormData para enviar la imagen
      const formData = new FormData();
      formData.append("photo", photoUpload.files[0]);

      try {
        // Mostrar indicador de carga
        Swal.fire({
          title: "Subiendo imagen...",
          text: "Por favor espera",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Obtener el token de acceso del almacenamiento local
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No se encontró el token de autenticación");
        }

        // Enviar la solicitud con el token de autenticación
        const response = await fetch("https://montanitaadopta.onrender.com/adoptme/api/v1/auth/update-profile-photo", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        // Verificar si la respuesta es exitosa
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error en la respuesta:", response.status, errorData);
          throw new Error(errorData.detail || "Error al actualizar la foto de perfil");
        }

        // Procesar la respuesta
        const data = await response.json();
        console.log("Respuesta del servidor:", data);

        if (data.photoUrl) {
          // Usar la URL completa proporcionada por el servidor
          const photoUrl = data.photoUrl;
          console.log("URL de la foto:", photoUrl);

          // Generar un timestamp para evitar caché
          const timestamp = new Date().getTime();
          
          // Actualizar la interfaz de usuario
          if (mainProfilePhoto) {
            mainProfilePhoto.src = `${photoUrl}?t=${timestamp}`;
          }

          if (currentProfilePhoto) {
            currentProfilePhoto.src = `${photoUrl}?t=${timestamp}`;
          }

          // Actualizar localStorage
          const userData = JSON.parse(localStorage.getItem("userData") || "{}");
          userData.foto_perfil = photoUrl;
          localStorage.setItem("userData", JSON.stringify(userData));

          // Notificar éxito
          Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Foto de perfil actualizada correctamente",
          });

          // Cerrar el modal
          window.closePhotoModal();
        } else {
          throw new Error("No se recibió la URL de la imagen");
        }
      } catch (error) {
        console.error("Error:", error);

        // Mostrar mensaje de error
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Ocurrió un error al actualizar la foto de perfil",
        });
        
        // Mostrar error en el formulario
        showError(error.message || "Ocurrió un error al actualizar la foto de perfil");
        
        // Habilitar el botón nuevamente
        if (savePhotoBtn) {
          savePhotoBtn.disabled = false;
          savePhotoBtn.classList.remove("loading");
        }
      }
    });
  }

  // Función para actualizar el UI del usuario al cargar la página
  async function updateUserUI() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        // Si no hay token, mostrar el menú de login
        console.log("No hay token, mostrando menú de login");
        const loginMenu = document.getElementById("login-menu");
        const userMenu = document.getElementById("user-menu");
        
        if (loginMenu) loginMenu.style.display = "block";
        if (userMenu) userMenu.style.display = "none";
        return;
      }

      // Intentar cargar datos desde localStorage primero
      const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}");

      // Mostrar el menú de usuario y ocultar el de login
      const loginMenu = document.getElementById("login-menu");
      const userMenu = document.getElementById("user-menu");
      const usernameText = document.getElementById("username-text");
      
      if (loginMenu) loginMenu.style.display = "none";
      if (userMenu) userMenu.style.display = "block";

      // Si hay datos en localStorage, usarlos inmediatamente
      if (storedUserData.nombre && usernameText) {
        usernameText.textContent = storedUserData.nombre;
      }

      if (storedUserData.foto_perfil && mainProfilePhoto) {
        console.log("Cargando foto de perfil desde localStorage:", storedUserData.foto_perfil);
        mainProfilePhoto.src = storedUserData.foto_perfil;
        if (currentProfilePhoto) currentProfilePhoto.src = storedUserData.foto_perfil;
      }

      // Luego intentar obtener datos actualizados del servidor
      try {
        // Obtener datos del usuario
        const response = await fetch("https://montanitaadopta.onrender.com/adoptme/api/v1/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // Si hay un error (token inválido, etc.), mostrar menú de login
          localStorage.removeItem("token");
          if (loginMenu) loginMenu.style.display = "block";
          if (userMenu) userMenu.style.display = "none";
          return;
        }

        const userData = await response.json();
        console.log("Datos de usuario recibidos del servidor:", userData);

        // Actualizar el nombre de usuario
        if (userData.nombre && usernameText) {
          usernameText.textContent = userData.nombre;
        }

        // Actualizar localStorage con los datos más recientes
        const updatedUserData = { ...storedUserData, ...userData };

        // Mantener la foto de perfil de localStorage si existe
        if (storedUserData.foto_perfil && !userData.foto_perfil) {
          updatedUserData.foto_perfil = storedUserData.foto_perfil;
        }

        localStorage.setItem("userData", JSON.stringify(updatedUserData));

        // Actualizar la foto de perfil si existe en el servidor
        if (userData.foto_perfil) {
          // Construir la URL completa para la imagen
          let photoUrl = userData.foto_perfil;

          // Si es una ruta relativa, convertirla a absoluta
          if (photoUrl.startsWith("/")) {
            photoUrl = "https://montanitaadopta.onrender.com" + photoUrl;
          }

          console.log("URL de foto de perfil del servidor:", photoUrl);

          if (mainProfilePhoto) mainProfilePhoto.src = photoUrl;
          if (currentProfilePhoto) currentProfilePhoto.src = photoUrl;

          // Actualizar en localStorage
          updatedUserData.foto_perfil = photoUrl;
          localStorage.setItem("userData", JSON.stringify(updatedUserData));
        }
      } catch (serverError) {
        console.warn("Error al obtener datos del servidor:", serverError);
        // Continuamos con los datos de localStorage
      }
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
      // En caso de error, mostrar menú de login
      const loginMenu = document.getElementById("login-menu");
      const userMenu = document.getElementById("user-menu");
      
      if (loginMenu) loginMenu.style.display = "block";
      if (userMenu) userMenu.style.display = "none";
    }
  }

  // Cargar los datos del usuario al iniciar
  updateUserUI();

  // Manejar cierre de sesión
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();

      // Eliminar el token de acceso
      localStorage.removeItem("token");

      // Actualizar UI
      const loginMenu = document.getElementById("login-menu");
      const userMenu = document.getElementById("user-menu");
      
      if (loginMenu) loginMenu.style.display = "block";
      if (userMenu) userMenu.style.display = "none";

      // Notificar al usuario
      Swal.fire({
        icon: "success",
        title: "Cerrar sesión",
        text: "Has cerrado sesión correctamente",
      });
    });
  }
});