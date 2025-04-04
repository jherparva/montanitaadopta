// Componente de cambio de foto de perfil
document.addEventListener("DOMContentLoaded", function() {
  // Referencias a elementos DOM
  const photoModal = document.getElementById("photoProfileModal");
  const photoForm = document.getElementById("profilePhotoForm");
  const fileInput = document.getElementById("photoFileInput");
  const currentPhoto = document.getElementById("currentProfilePhoto");
  const newPhotoPreview = document.getElementById("newPhotoPreview");
  const dragOverlay = document.getElementById("dragOverlay");
  const uploadError = document.getElementById("uploadError");
  const rotateLeftBtn = document.getElementById("rotateLeftBtn");
  const rotateRightBtn = document.getElementById("rotateRightBtn");
  const zoomInBtn = document.getElementById("zoomInBtn");
  const zoomOutBtn = document.getElementById("zoomOutBtn");
  const resetBtn = document.getElementById("resetBtn");
  const mainProfilePhoto = document.getElementById("profile-photo"); // Foto en la página principal

  // Variables para edición de imagen
  let rotation = 0;
  let scale = 1;
  let selectedFile = null;
  
  // Verificar que todos los elementos existen
  function verifyElements() {
    const elements = [
      { name: "photoModal", el: photoModal },
      { name: "photoForm", el: photoForm },
      { name: "fileInput", el: fileInput },
      { name: "currentPhoto", el: currentPhoto },
      { name: "newPhotoPreview", el: newPhotoPreview },
      { name: "dragOverlay", el: dragOverlay },
      { name: "uploadError", el: uploadError }
    ];
    
    let allExist = true;
    elements.forEach(item => {
      if (!item.el) {
        console.error(`Elemento '${item.name}' no encontrado en el DOM`);
        allExist = false;
      }
    });
    
    return allExist;
  }

  // ----- Funciones para manejo del modal -----
  
  // Abrir el modal y cargar datos
  window.openPhotoProfileModal = function() {
    if (!verifyElements()) {
      console.error("No se puede abrir el modal: faltan elementos en el DOM");
      return;
    }
    
    // Verificar si hay un usuario autenticado
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Acceso denegado",
        text: "Debes iniciar sesión para cambiar tu foto de perfil"
      });
      return;
    }
    
    // Cargar la foto actual desde localStorage o usar la predeterminada
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (userData.foto_perfil) {
      currentPhoto.src = userData.foto_perfil;
    }
    
    // Resetear el formulario y la vista previa
    resetImageEditor();
    photoForm.reset();
    
    // Mostrar el modal con animación
    photoModal.style.display = "block";
    setTimeout(() => {
      photoModal.classList.add("show");
    }, 10);
  };
  
  // Cerrar el modal
  window.closePhotoProfileModal = function() {
    photoModal.classList.remove("show");
    setTimeout(() => {
      photoModal.style.display = "none";
    }, 300);
  };
  
  // Cerrar al hacer clic fuera del contenido
  if (photoModal) {
    photoModal.addEventListener("click", function(event) {
      if (event.target === photoModal) {
        closePhotoProfileModal();
      }
    });
  }
  
  // ----- Funciones para selección y vista previa de imagen -----
  
  // Manejar el cambio en el input de archivo
  if (fileInput) {
    fileInput.addEventListener("change", function() {
      handleFileSelection(this.files[0]);
    });
  }
  
  // Función para manejar la selección de archivos
  function handleFileSelection(file) {
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.type.match('image.*')) {
      showError("El archivo seleccionado no es una imagen válida");
      return;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("La imagen es demasiado grande. El tamaño máximo es 5MB");
      return;
    }
    
    selectedFile = file;
    
    // Leer y mostrar la vista previa
    const reader = new FileReader();
    reader.onload = function(e) {
      newPhotoPreview.src = e.target.result;
      resetImageEditor(); // Resetear la edición
      uploadError.textContent = ""; // Limpiar errores previos
    };
    reader.onerror = function() {
      showError("Error al leer el archivo seleccionado");
    };
    reader.readAsDataURL(file);
  }
  
  // Mostrar mensaje de error
  function showError(message) {
    uploadError.textContent = message;
    // Limpiar el error después de 5 segundos
    setTimeout(() => {
      uploadError.textContent = "";
    }, 5000);
  }
  
  // ----- Funciones para arrastrar y soltar -----
  
  // Configurar área de arrastrar y soltar
  if (newPhotoPreview) {
    const dropArea = newPhotoPreview.parentElement;
    
    // Prevenir comportamiento predeterminado
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, function(e) {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });
    
    // Resaltar área al arrastrar sobre ella
    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, function() {
        dropArea.classList.add('drag-over');
      }, false);
    });
    
    // Quitar resaltado al salir
    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, function() {
        dropArea.classList.remove('drag-over');
      }, false);
    });
    
    // Manejar soltar archivo
    dropArea.addEventListener('drop', function(e) {
      const files = e.dataTransfer.files;
      if (files.length) {
        handleFileSelection(files[0]);
        
        // También actualizar el input de archivo para consistencia
        if (fileInput) {
          // Crear un nuevo DataTransfer y añadir el archivo
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(files[0]);
          fileInput.files = dataTransfer.files;
        }
      }
    }, false);
  }
  
  // ----- Funciones para edición de imagen -----
  
  // Aplicar cambios de edición a la vista previa
  function applyImageEdits() {
    if (newPhotoPreview) {
      newPhotoPreview.style.transform = `rotate(${rotation}deg) scale(${scale})`;
    }
  }
  
  // Resetear el editor de imagen
  function resetImageEditor() {
    rotation = 0;
    scale = 1;
    applyImageEdits();
  }
  
  // Configurar botones de edición
  if (rotateLeftBtn) {
    rotateLeftBtn.addEventListener("click", function() {
      rotation -= 90;
      applyImageEdits();
    });
  }
  
  if (rotateRightBtn) {
    rotateRightBtn.addEventListener("click", function() {
      rotation += 90;
      applyImageEdits();
    });
  }
  
  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", function() {
      scale = Math.min(scale + 0.1, 2.0); // Limitar zoom máximo
      applyImageEdits();
    });
  }
  
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", function() {
      scale = Math.max(scale - 0.1, 0.5); // Limitar zoom mínimo
      applyImageEdits();
    });
  }
  
  if (resetBtn) {
    resetBtn.addEventListener("click", resetImageEditor);
  }
  
  // ----- Funciones para subir la imagen -----
  
  // Manejar el envío del formulario
  if (photoForm) {
    photoForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      
      if (!selectedFile) {
        showError("Por favor selecciona una imagen primero");
        return;
      }
      
      // Mostrar indicador de carga
      const loadingSwal = Swal.fire({
        title: "Subiendo imagen...",
        text: "Por favor espera",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      try {
        // Obtener el token de autenticación
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No estás autenticado. Por favor inicia sesión.");
        }
        
        // Si hay ediciones (rotación o zoom), necesitamos procesar la imagen
        let fileToUpload = selectedFile;
        
        if (rotation !== 0 || scale !== 1) {
          try {
            fileToUpload = await processImageWithEdits(selectedFile, rotation, scale);
          } catch (err) {
            console.error("Error procesando la imagen:", err);
            // Si falla el procesamiento, intentamos con la imagen original
          }
        }
        
        // Preparar FormData para la subida
        const formData = new FormData();
        formData.append("photo", fileToUpload);
        
        // Realizar la solicitud al servidor
        const response = await fetch("https://montanitaadopta.onrender.com/adoptme/api/v1/auth/update-profile-photo", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });
        
        // Procesar respuesta
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Error al subir la imagen");
        }
        
        const data = await response.json();
        
        // Actualizar la interfaz
        if (data.photoUrl) {
          // Actualizar la imagen en el modal
          if (currentPhoto) {
            currentPhoto.src = data.photoUrl;
          }
          
          // Actualizar la imagen principal si existe
          if (mainProfilePhoto) {
            mainProfilePhoto.src = data.photoUrl;
          }
          
          // Actualizar en localStorage
          const userData = JSON.parse(localStorage.getItem("userData") || "{}");
          userData.foto_perfil = data.photoUrl;
          localStorage.setItem("userData", JSON.stringify(userData));
          
          // Cerrar el modal
          closePhotoProfileModal();
          
          // Mostrar mensaje de éxito
          Swal.fire({
            icon: "success",
            title: "¡Imagen actualizada!",
            text: "Tu foto de perfil ha sido actualizada correctamente"
          });
        } else {
          throw new Error("No se recibió la URL de la imagen");
        }
      } catch (error) {
        console.error("Error:", error);
        
        // Cerrar el indicador de carga
        loadingSwal.close();
        
        // Mostrar mensaje de error
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Ocurrió un error al actualizar la foto de perfil"
        });
      }
    });
  }
  
  // Función para procesar la imagen con ediciones (rotación/zoom)
  async function processImageWithEdits(file, rotation, scale) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = function() {
        try {
          // Crear canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Determinar las dimensiones del canvas según la rotación
          let width = img.width;
          let height = img.height;
          
          if (rotation % 180 !== 0) {
            // Intercambiar dimensiones si la rotación es 90 o 270 grados
            [width, height] = [height, width];
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Limpiar canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Trasladar al centro para rotar correctamente
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(rotation * Math.PI / 180);
          ctx.scale(scale, scale);
          
          // Dibujar imagen centrada
          ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
          
          // Convertir a blob
          canvas.toBlob(function(blob) {
            if (blob) {
              // Crear archivo para subir
              const processedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: new Date().getTime()
              });
              resolve(processedFile);
            } else {
              reject(new Error("Error al procesar la imagen"));
            }
          }, file.type);
        } catch (err) {
          reject(err);
        }
      };
      
      img.onerror = function() {
        reject(new Error("Error al cargar la imagen para procesar"));
      };
      
      // Cargar la imagen desde el archivo
      img.src = URL.createObjectURL(file);
    });
  }
  
  // ----- Funciones de utilidad -----
  
  // Función para detectar si estamos en un dispositivo móvil
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  // Ajustar la interfaz si es dispositivo móvil
  if (isMobileDevice()) {
    // Opcional: hacer ajustes específicos para móviles
  }
  
  // ----- Inicialización -----
  
  // Verificar si tenemos SweetAlert2
  if (typeof Swal === 'undefined') {
    console.warn("SweetAlert2 no está disponible. Usando alertas nativas.");
    window.Swal = {
      fire: function(options) {
        alert(options.text || options.title);
        return { close: function() {} };
      },
      showLoading: function() {}
    };
  }
  
  // Log de inicialización
  console.log("Módulo de cambio de foto de perfil inicializado");
});