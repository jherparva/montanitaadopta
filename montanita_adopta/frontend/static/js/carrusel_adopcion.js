// Eliminar las líneas de importación al principio del archivo
// import { apiConnector } from "./apiConnector.js"
// import { redirigirAFormulario } from "./utils.js"

// Usar directamente la variable global apiConnector que ya está definida en api_connector.js

// Estado global para carruseles
let carouselDogs = [] // Perros para el carrusel
let carouselCats = [] // Gatos para el carrusel
const currentSlideIndex = { dogCarousel: 0, catCarousel: 0 } // Para hacer seguimiento del slide actual
const autoRotateIntervals = {} // Para almacenar los intervalos de rotación automática

// Cargar carruseles al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
  // Cargar animales para los carruseles
  fetchCarouselAnimals()

  // Añadir manejo de eventos para los botones de navegación de carrusel
  document.addEventListener("click", (e) => {
    if (e.target.matches(".carousel-control.prev") || e.target.matches(".carousel-control.next")) {
      const direction = e.target.classList.contains("prev") ? "prev" : "next"
      const carouselId = e.target.closest(".carousel").id
      moveSlide(carouselId, direction)

      // Reiniciar el temporizador automático cuando se hace clic manual
      resetAutoRotate(carouselId)
    }
  })

  // Añadir evento para ajustar el carrusel cuando cambia el tamaño de la ventana
  window.addEventListener("resize", () => {
    // Actualizar carruseles para ajustar la visualización móvil/escritorio
    if (document.getElementById("dogCarousel")) {
      moveSlide("dogCarousel", "current") // 'current' para no cambiar la posición
    }
    if (document.getElementById("catCarousel")) {
      moveSlide("catCarousel", "current")
    }
  })
})

// Función para cargar animales para el carrusel desde la API
async function fetchCarouselAnimals() {
  try {
    // Obtener perros para el carrusel (6 perros)
    const dogsParams = {
      species: "dog",
      limit: 6,
    }
    const dogsResult = await apiConnector.getMascotas(dogsParams)
    carouselDogs = dogsResult.items || dogsResult

    // Obtener gatos para el carrusel (6 gatos)
    const catsParams = {
      species: "cat",
      limit: 6,
    }
    const catsResult = await apiConnector.getMascotas(catsParams)
    carouselCats = catsResult.items || catsResult

    // Actualizar los carruseles
    updateDogCarousel()
    updateCatCarousel()

    // Iniciar rotación automática
    startAutoRotate("dogCarousel")
    startAutoRotate("catCarousel")
  } catch (error) {
    console.error("Error al obtener animales para carrusel:", error)
  }
}

// Función para actualizar el carrusel de perros
function updateDogCarousel() {
  const dogCarousel = document.querySelector("#dogCarousel .carousel-container")
  if (!dogCarousel) return

  // Limpiar el carrusel
  dogCarousel.innerHTML = ""

  // Añadir los perros al carrusel
  carouselDogs.forEach((dog, index) => {
    const item = document.createElement("div")
    item.className = `carousel-item ${index === 0 || index === 1 ? "active" : ""}`

    // Usar directamente la URL de imagen proporcionada por la API
    // La API ya incluye la ruta /static/imagenes/ en el campo imagen
    let imagenUrl = dog.imagen || "/static/img/placeholder_pet.jpg"

    // Si no es una URL completa, añadir el dominio base
    if (imagenUrl && !imagenUrl.startsWith("http")) {
      // Extraer el nombre del archivo
      let fileName
      if (imagenUrl.includes("/")) {
        const pathParts = imagenUrl.split("/")
        fileName = pathParts[pathParts.length - 1]
      } else {
        fileName = imagenUrl
      }

      // Intentar con la primera letra en mayúscula
      const capitalizedFileName = fileName.charAt(0).toUpperCase() + fileName.slice(1)

      // Construir la URL completa
      imagenUrl = `${apiConnector.imageBaseURL}/static/imagenes/${capitalizedFileName}`
    }

    console.log("URL de imagen en carrusel de perros:", imagenUrl)

    item.innerHTML = `
            <div class="animal">
                <img src="${imagenUrl}" alt="${dog.nombre}" onerror="this.onerror=null; this.src='/static/img/placeholder_pet.jpg';">
                <h4>${dog.nombre}</h4>
                <p>${dog.descripcion ? dog.descripcion.substring(0, 30) + "..." : "Un perro esperando un hogar..."}</p>
                <button class="adoptarBtn" data-mascota-id="${dog.id}" type="button">
                    <i class="fas fa-paw"></i> Adoptar
                </button>
            </div>
        `

    dogCarousel.appendChild(item)
  })

  // Añadir eventos a los botones de adoptar
  dogCarousel.querySelectorAll(".adoptarBtn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const mascotaId = this.getAttribute("data-mascota-id")
      console.log(`🐾 Redirigiendo directamente al formulario de adopción con ID: ${mascotaId}`)
      verificarSesionYRedirigir(mascotaId)
    })
  })
}

// Función para actualizar el carrusel de gatos
function updateCatCarousel() {
  const catCarousel = document.querySelector("#catCarousel .carousel-container")
  if (!catCarousel) return

  // Limpiar el carrusel
  catCarousel.innerHTML = ""

  // Añadir los gatos al carrusel
  carouselCats.forEach((cat, index) => {
    const item = document.createElement("div")
    item.className = `carousel-item ${index === 0 || index === 1 ? "active" : ""}`

    // Usar directamente la URL de imagen proporcionada por la API
    // La API ya incluye la ruta /static/imagenes/ en el campo imagen
    let imagenUrl = cat.imagen || "/static/img/placeholder_pet.jpg"

    // Si no es una URL completa, añadir el dominio base
    if (imagenUrl && !imagenUrl.startsWith("http")) {
      // Extraer el nombre del archivo
      let fileName
      if (imagenUrl.includes("/")) {
        const pathParts = imagenUrl.split("/")
        fileName = pathParts[pathParts.length - 1]
      } else {
        fileName = imagenUrl
      }

      // Intentar con la primera letra en mayúscula
      const capitalizedFileName = fileName.charAt(0).toUpperCase() + fileName.slice(1)

      // Construir la URL completa
      imagenUrl = `${apiConnector.imageBaseURL}/static/imagenes/${capitalizedFileName}`
    }

    console.log("URL de imagen en carrusel de gatos:", imagenUrl)

    item.innerHTML = `
            <div class="animal">
                <img src="${imagenUrl}" alt="${cat.nombre}" onerror="this.onerror=null; this.src='/static/img/placeholder_pet.jpg';">
                <h4>${cat.nombre}</h4>
                <p>${cat.descripcion ? cat.descripcion.substring(0, 30) + "..." : "Un gato esperando un hogar..."}</p>
                <button class="adoptarBtn" data-mascota-id="${cat.id}" type="button">
                    <i class="fas fa-paw"></i> Adoptar
                </button>
            </div>
        `

    catCarousel.appendChild(item)
  })

  // Añadir eventos a los botones de adoptar
  catCarousel.querySelectorAll(".adoptarBtn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const mascotaId = this.getAttribute("data-mascota-id")
      console.log(`🐾 Redirigiendo directamente al formulario de adopción con ID: ${mascotaId}`)
      verificarSesionYRedirigir(mascotaId)
    })
  })
}

// Función corregida para mover el carrusel
function moveSlide(carouselId, direction) {
  const carousel = document.getElementById(carouselId)
  if (!carousel) return

  const container = carousel.querySelector(".carousel-container")
  const slides = carousel.querySelectorAll(".carousel-item")
  if (slides.length === 0) return

  // Calculate how many items to show at once (2 on desktop, 1 on mobile)
  const isMobile = window.innerWidth <= 600
  const itemsPerView = isMobile ? 1 : 2

  // Remove 'active' class from all slides
  slides.forEach((slide) => slide.classList.remove("active"))

  // If 'current', keep the same index
  if (direction !== "current") {
    if (direction === "prev") {
      currentSlideIndex[carouselId] = (currentSlideIndex[carouselId] - 1 + slides.length) % slides.length
    } else if (direction === "next") {
      currentSlideIndex[carouselId] = (currentSlideIndex[carouselId] + 1) % slides.length
    }
  }

  // Add 'active' class to the new current slides
  for (let i = 0; i < itemsPerView; i++) {
    const index = (currentSlideIndex[carouselId] + i) % slides.length
    slides[index].classList.add("active")
  }
}

// Función para iniciar la rotación automática
function startAutoRotate(carouselId) {
  // Detener cualquier intervalo existente
  stopAutoRotate(carouselId)

  // Iniciar un nuevo intervalo (cada 5 segundos)
  autoRotateIntervals[carouselId] = setInterval(() => {
    moveSlide(carouselId, "next")
  }, 5000)
}

// Función para detener la rotación automática
function stopAutoRotate(carouselId) {
  if (autoRotateIntervals[carouselId]) {
    clearInterval(autoRotateIntervals[carouselId])
    delete autoRotateIntervals[carouselId]
  }
}

// Función para reiniciar la rotación automática después de una interacción manual
function resetAutoRotate(carouselId) {
  stopAutoRotate(carouselId)
  startAutoRotate(carouselId)
}

// Funciones de navegación para usar con botones HTML
window.prevSlide = (carouselId) => {
  moveSlide(carouselId, "prev")
  resetAutoRotate(carouselId)
}

window.nextSlide = (carouselId) => {
  moveSlide(carouselId, "next")
  resetAutoRotate(carouselId)
}

// Función para inicializar carruseles (puede ser llamada desde HTML)
window.initCarousels = () => {
  if (document.getElementById("dogCarousel")) {
    moveSlide("dogCarousel", "current")
    startAutoRotate("dogCarousel")
  }
  if (document.getElementById("catCarousel")) {
    moveSlide("catCarousel", "current")
    startAutoRotate("catCarousel")
  }
}

// Función auxiliar para verificar sesión y redirigir
function verificarSesionYRedirigir(mascotaId) {
  const estaLogueado = sessionStorage.getItem("usuarioActual") || localStorage.getItem("usuarioActual")

  if (estaLogueado) {
    // El usuario está logueado, redirigir al formulario de adopción
    redirigirAFormulario(mascotaId)
  } else {
    // El usuario no está logueado, mostrar modal de login
    const loginModal = document.getElementById("loginModal")
    if (loginModal) {
      // Guarda el ID del animal para después de iniciar sesión
      sessionStorage.setItem("animalParaAdoptar", mascotaId)
      loginModal.style.display = "block"
    } else {
      alert("Debes iniciar sesión para adoptar un animal.")
    }
  }
}

// Reemplazar la función redirigirAFormulario que estaba siendo importada
// con una definición local

// Función para redirigir al formulario de adopción
function redirigirAFormulario(mascotaId) {
  if (!mascotaId) {
    console.error("🚨 No se pudo obtener el ID de la mascota.")
    return
  }
  console.log(`🐾 Redirigiendo al formulario de adopción con ID: ${mascotaId}`)
  window.location.href = `/formulario_adopcion?id=${mascotaId}`
}

