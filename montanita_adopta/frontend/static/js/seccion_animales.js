// Estado global
let currentPage = 1
let totalPages = 1
let animalData = []
let favorites = []
let currentCategory = "all"
let currentFilters = {
  edad: "",
  tamano: "",
}

// Cargar datos al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
  // Cargar favoritos desde localStorage
  loadFavorites()

  // Cargar animales para la sección principal
  fetchAnimals()

  // Configurar eventos
  setupEventListeners()

  // Añadir evento para el botón de favoritos
  const favoritesButton = document.getElementById("favorites-button")
  if (favoritesButton) {
    favoritesButton.addEventListener("click", function () {
      document.querySelectorAll(".tab-button").forEach((btn) => btn.classList.remove("active"))
      this.classList.add("active")
      showFavorites()
    })
  }

  // Verificar si hay un animal pendiente para adopción después de iniciar sesión
  checkPendingAdoption()
})

// Verificar si hay una mascota pendiente para adopción
function checkPendingAdoption() {
  const animalId = sessionStorage.getItem("animalParaAdoptar")
  if (animalId && apiConnector.token) {
    // Verificar la sesión primero
    apiConnector
      .verificarSesion()
      .then(() => {
        // Sesión válida, redirigir al formulario de adopción
        sessionStorage.removeItem("animalParaAdoptar")
        window.location.href = `/formulario_adopcion?id=${animalId}`
      })
      .catch((error) => {
        console.error("Error al verificar la sesión:", error)
        // Limpiar el token en caso de error
        apiConnector.clearToken()
      })
  }
}

// Cargar favoritos desde localStorage
function loadFavorites() {
  const storedFavorites = localStorage.getItem("animalFavorites")
  if (storedFavorites) {
    favorites = JSON.parse(storedFavorites)
  }
}

// Guardar favoritos en localStorage
function saveFavorites() {
  localStorage.setItem("animalFavorites", JSON.stringify(favorites))
}

// Configurar eventos
function setupEventListeners() {
  // Eventos para los tabs de categorías
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", function () {
      // Actualizar UI de tabs
      document.querySelectorAll(".tab-button").forEach((btn) => btn.classList.remove("active"))
      this.classList.add("active")

      // Actualizar categoría actual
      currentCategory = this.dataset.category
      currentPage = 1

      // Recargar animales
      fetchAnimals()
    })
  })

  // Evento para botón de filtro
  const filterButton = document.getElementById("filter-button")
  if (filterButton) {
    filterButton.addEventListener("click", () => {
      currentFilters.edad = document.getElementById("edad-filter").value
      currentFilters.tamano = document.getElementById("tamano-filter").value
      currentPage = 1
      fetchAnimals()
    })
  }

  // Eventos de paginación
  const prevButton = document.getElementById("prev-page")
  if (prevButton) {
    prevButton.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--
        fetchAnimals()
      }
    })
  }

  const nextButton = document.getElementById("next-page")
  if (nextButton) {
    nextButton.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++
        fetchAnimals()
      }
    })
  }

  // Evento para el botón de cerrar modal
  const closeModalBtn = document.querySelector(".close")
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      closeModal("animalModal")
    })
  }

  // Si utilizas verificarSesionYRedirigir para los botones de adoptar:
  document.querySelectorAll(".adoptarBtn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const mascotaId = this.dataset.mascotaId
      verificarSesionYRedirigir(mascotaId)
    })
  })
}

// Obtener animales de la API usando APIConnector
async function fetchAnimals() {
  // Mostrar spinner de carga
  const container = document.querySelector(".animals-container")
  if (!container) return

  container.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-paw fa-spin"></i>
            <p>Cargando animales...</p>
        </div>
    `

  // Preparar parámetros para la consulta
  const params = {
    page: currentPage,
    limit: 16, // Cambiado a 16 para mostrar 4x4
    age: currentFilters.edad,
    size: currentFilters.tamano,
  }

  // Añadir categoría si no es 'all'
  if (currentCategory !== "all") {
    params.species = currentCategory
  }

  try {
    // Obtener datos de la API
    const result = await apiConnector.getMascotas(params)
    console.log("Resultado de fetchAnimals:", result)

    // Actualizar datos globales
    if (result && (result.items || Array.isArray(result))) {
      animalData = result.items || result
      totalPages = result.total_pages || 1

      // Verificar si animalData es un array
      if (!Array.isArray(animalData)) {
        console.error("animalData no es un array:", animalData)
        animalData = []
      }

      // Renderizar animales
      renderAnimals(animalData)

      // Actualizar UI de paginación
      updatePaginationUI()
    } else {
      throw new Error("Formato de respuesta inválido")
    }
  } catch (error) {
    console.error("Error al obtener animales:", error)
    container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar los animales: ${error.message}. Por favor, intenta nuevamente.</p>
                <button id="retry-button" class="btn btn-primary">Reintentar</button>
            </div>
        `

    // Añadir evento al botón de reintentar
    const retryButton = document.getElementById("retry-button")
    if (retryButton) {
      retryButton.addEventListener("click", fetchAnimals)
    }
  }
}

// Renderizar animales en el contenedor
function renderAnimals(animals) {
  const container = document.querySelector(".animals-container")
  if (!container) return

  if (animals.length === 0) {
    container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No se encontraron animales con los filtros seleccionados.</p>
                <button id="clear-filters" class="btn btn-secondary">Limpiar filtros</button>
            </div>
        `

    const clearFiltersButton = document.getElementById("clear-filters")
    if (clearFiltersButton) {
      clearFiltersButton.addEventListener("click", () => {
        document.getElementById("edad-filter").value = ""
        document.getElementById("tamano-filter").value = ""
        currentFilters = { edad: "", tamano: "" }
        fetchAnimals()
      })
    }

    return
  }

  // Eliminamos la creación de un div adicional que rompe el grid
  let html = ""

  animals.forEach((animal) => {
    const isFavorite = favorites.includes(animal.id.toString())

    html += `
            <div class="animal-card" data-id="${animal.id}">
                <div class="animal-image">
                    <img src="${animal.imagen || "/static/img/placeholder_pet.jpg"}" alt="${animal.nombre}">
                    <button class="favorite-toggle ${isFavorite ? "active" : ""}" data-id="${animal.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="animal-info">
                    <h3>${animal.nombre}</h3>
                    <p class="animal-breed">${animal.raza || "Mestizo"}</p>
                    <p class="animal-details">
                        <span><i class="fas fa-birthday-cake"></i> ${animal.edad || "Desconocida"}</span>
                        <span><i class="fas fa-ruler-vertical"></i> ${animal.tamano || "Mediano"}</span>
                    </p>
                    <div class="animal-actions">
                        <button class="btn btn-sm btn-info view-details" data-id="${animal.id}">Ver detalles</button>
                        <button class="btn btn-sm btn-primary adopt-button" data-id="${animal.id}">Adoptar</button>
                    </div>
                </div>
            </div>
        `
  })

  container.innerHTML = html

  // Añadir eventos a los botones
  addCardEventListeners()
}

function redirigirAFormulario(mascotaId) {
  if (!mascotaId) {
    console.error("🚨 No se pudo obtener el ID de la mascota.")
    return
  }
  console.log(`🐾 Redirigiendo al formulario de adopción con ID: ${mascotaId}`)
  window.location.href = `/formulario_adopcion?id=${mascotaId}`
}

// Añadir eventos a las tarjetas de animales
function addCardEventListeners() {
  // Eventos para botones de favoritos
  document.querySelectorAll(".favorite-toggle").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation() // Evitar que se abra el modal
      const animalId = this.dataset.id
      toggleFavorite(animalId)
      this.classList.toggle("active")
    })
  })

  // Eventos para botones de ver detalles
  document.querySelectorAll(".view-details").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation() // Evitar que el evento se propague a la tarjeta
      const animalId = this.dataset.id
      openAnimalModal(animalId)
    })
  })

  // Eventos para botones de adoptar
  document.querySelectorAll(".adopt-button").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation()
      const animalId = this.dataset.id
      redirigirAFormulario(animalId)
    })
  })

  // Hacer que toda la tarjeta sea clickeable para ver detalles
  document.querySelectorAll(".animal-card").forEach((card) => {
    card.addEventListener("click", function () {
      const animalId = this.dataset.id
      openAnimalModal(animalId)
    })
  })
}

// Alternar estado de favorito
function toggleFavorite(animalId) {
  const index = favorites.indexOf(animalId.toString())

  if (index === -1) {
    // Añadir a favoritos
    favorites.push(animalId.toString())
  } else {
    // Quitar de favoritos
    favorites.splice(index, 1)
  }

  saveFavorites()
}

// Actualizar UI del botón de favorito en el modal
function updateFavoriteButtonUI(button, animalId) {
  const isFavorite = favorites.includes(animalId.toString())

  button.innerHTML = isFavorite
    ? '<i class="fas fa-heart"></i> Quitar de favoritos'
    : '<i class="far fa-heart"></i> Añadir a favoritos'

  button.classList.toggle("favorited", isFavorite)
}

// Abrir modal con detalles del animal
async function openAnimalModal(animalId) {
  const modal = document.getElementById("animalModal") // Cambiado a 'animalModal'
  const modalName = document.getElementById("modal-animal-name")
  const modalImage = document.getElementById("modal-animal-image")
  const modalSpecies = document.getElementById("modal-animal-species")
  const modalAge = document.getElementById("modal-animal-age")
  const modalSize = document.getElementById("modal-animal-size")
  const modalBreed = document.getElementById("modal-animal-breed")
  const modalDescription = document.getElementById("modal-animal-description")
  const adoptButton = document.getElementById("adopt-button")
  const favoriteButton = document.getElementById("favorite-button")

  if (!modal || !modalName || !modalImage) return

  // Mostrar indicador de carga
  modalName.textContent = "Cargando..."
  modalImage.src = "/static/img/placeholder_pet.jpg"
  modalSpecies.textContent = ""
  modalAge.textContent = ""
  modalSize.textContent = ""
  modalBreed.textContent = ""
  modalDescription.textContent = "Cargando información..."

  // Mostrar el modal
  modal.style.display = "block"

  try {
    // Obtener detalles del animal
    const animalDetails = await apiConnector.getMascota(animalId)

    // Verificar si el animal existe
    if (!animalDetails) {
      throw new Error("No se encontró información del animal")
    }

    // Actualizar el contenido del modal con los detalles del animal
    modalName.textContent = animalDetails.nombre
    modalImage.src = animalDetails.imagen || "/static/img/placeholder_pet.jpg"
    modalSpecies.textContent = animalDetails.especie === "dog" ? "Perro" : "Gato"
    modalAge.textContent = animalDetails.edad || "Desconocida"
    modalSize.textContent = animalDetails.tamano || "Mediano"
    modalBreed.textContent = animalDetails.raza || "Mestizo"
    modalDescription.textContent = animalDetails.descripcion || "No hay información disponible"

    // Configurar botones
    const isFavorite = favorites.includes(animalId.toString())
    favoriteButton.innerHTML = isFavorite
      ? '<i class="fas fa-heart"></i> Quitar de favoritos'
      : '<i class="far fa-heart"></i> Añadir a favoritos'
    favoriteButton.classList.toggle("favorited", isFavorite)

    // Asignar eventos
    favoriteButton.onclick = function () {
      toggleFavorite(animalId)
      const newIsFavorite = favorites.includes(animalId.toString())
      this.innerHTML = newIsFavorite
        ? '<i class="fas fa-heart"></i> Quitar de favoritos'
        : '<i class="far fa-heart"></i> Añadir a favoritos'
      this.classList.toggle("favorited", newIsFavorite)
    }

    adoptButton.onclick = () => {
      verificarSesionYRedirigir(animalId)
    }

    // Establecer IDs para los botones
    adoptButton.dataset.animalId = animalId
    favoriteButton.dataset.animalId = animalId
  } catch (error) {
    console.error("Error al obtener detalles del animal:", error)
    // Mostrar mensaje de error en el modal
    modalName.textContent = "Error"
    modalDescription.textContent = "No se pudo cargar la información del animal. Por favor, intenta nuevamente."
  }
}
// Función para cerrar cualquier modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = "none"
  }
}

// Verificar sesión y redirigir al formulario de adopción (versión mejorada)
function handleLogin(formId) {
  const loginForm = document.getElementById(formId)
  if (!loginForm) return

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    try {
      const data = await apiConnector.login(email, password)

      // También guardar el ID y nombre del usuario si se necesita
      if (data.usuario_id) localStorage.setItem("usuario_id", data.usuario_id)
      if (data.nombre) localStorage.setItem("nombre_usuario", data.nombre)

      alert("Inicio de sesión exitoso")

      // Verificar si hay animal pendiente para adopción
      const animalId = sessionStorage.getItem("animalParaAdoptar")
      if (animalId) {
        sessionStorage.removeItem("animalParaAdoptar")
        window.location.href = `/formulario_adopcion?id=${animalId}`
      } else {
        window.location.href = "/" // Redirigir al home
      }
    } catch (error) {
      console.error("Error en el inicio de sesión:", error)
      alert("Error: " + error.message)
    }
  })
}

// Actualizar UI de paginación
function updatePaginationUI() {
  const paginationContainer = document.querySelector(".animals-pagination")
  if (!paginationContainer) return

  const prevButton = document.getElementById("prev-page")
  const nextButton = document.getElementById("next-page")
  const pageInfo = document.getElementById("page-indicator")

  if (prevButton) {
    prevButton.disabled = currentPage <= 1
  }

  if (nextButton) {
    nextButton.disabled = currentPage >= totalPages
  }

  if (pageInfo) {
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`
  }
}

// Filtrar por favoritos
function showFavorites() {
  if (favorites.length === 0) {
    const container = document.querySelector(".animals-container")
    if (container) {
      container.innerHTML = `
                <div class="no-results">
                    <i class="far fa-heart"></i>
                    <p>No tienes animales favoritos.</p>
                    <button id="show-all" class="btn btn-primary">Ver todos los animales</button>
                </div>
            `

      const showAllButton = document.getElementById("show-all")
      if (showAllButton) {
        showAllButton.addEventListener("click", () => {
          document.querySelector('.tab-button[data-category="all"]').click()
        })
      }
    }
    return
  }

  // Si tenemos los datos de todos los animales, filtramos para mostrar solo favoritos
  if (animalData.length > 0) {
    const favoriteAnimals = animalData.filter((animal) => favorites.includes(animal.id.toString()))
    renderAnimals(favoriteAnimals)
    return
  }

  // Si no tenemos datos, los solicitamos primero y luego filtramos
  fetchAnimals().then(() => {
    const favoriteAnimals = animalData.filter((animal) => favorites.includes(animal.id.toString()))
    renderAnimals(favoriteAnimals)
  })
}