// Estado global para carruseles
let carouselDogs = []; // Perros para el carrusel
let carouselCats = []; // Gatos para el carrusel
let currentSlideIndex = {'dogCarousel': 0, 'catCarousel': 0}; // Para hacer seguimiento del slide actual
let autoRotateIntervals = {}; // Para almacenar los intervalos de rotación automática

// Cargar carruseles al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
    // Cargar animales para los carruseles
    fetchCarouselAnimals();
    
    // Añadir manejo de eventos para los botones de navegación de carrusel
    document.addEventListener('click', function(e) {
        if (e.target.matches('.carousel-control.prev') || e.target.matches('.carousel-control.next')) {
            const direction = e.target.classList.contains('prev') ? 'prev' : 'next';
            const carouselId = e.target.closest('.carousel').id;
            moveSlide(carouselId, direction);
            
            // Reiniciar el temporizador automático cuando se hace clic manual
            resetAutoRotate(carouselId);
        }
    });
    
    // Añadir evento para ajustar el carrusel cuando cambia el tamaño de la ventana
    window.addEventListener('resize', function() {
        // Actualizar carruseles para ajustar la visualización móvil/escritorio
        if (document.getElementById('dogCarousel')) {
            moveSlide('dogCarousel', 'current'); // 'current' para no cambiar la posición
        }
        if (document.getElementById('catCarousel')) {
            moveSlide('catCarousel', 'current');
        }
    });
});

// Función para cargar animales para el carrusel desde la API
async function fetchCarouselAnimals() {
    try {
        // Obtener perros para el carrusel (6 perros)
        const dogsParams = {
            species: 'dog',
            limit: 6
        };
        const dogsResult = await apiConnector.getMascotas(dogsParams);
        carouselDogs = dogsResult.items || dogsResult;
        
        // Obtener gatos para el carrusel (6 gatos)
        const catsParams = {
            species: 'cat',
            limit: 6
        };
        const catsResult = await apiConnector.getMascotas(catsParams);
        carouselCats = catsResult.items || catsResult;
        
        // Actualizar los carruseles
        updateDogCarousel();
        updateCatCarousel();
        
        // Iniciar rotación automática
        startAutoRotate('dogCarousel');
        startAutoRotate('catCarousel');
    } catch (error) {
        console.error('Error al obtener animales para carrusel:', error);
    }
}

// Función para actualizar el carrusel de perros
function updateDogCarousel() {
    const dogCarousel = document.querySelector('#dogCarousel .carousel-container');
    if (!dogCarousel) return;
    
    // Limpiar el carrusel
    dogCarousel.innerHTML = '';
    
    // Añadir los perros al carrusel
    carouselDogs.forEach((dog, index) => {
        const item = document.createElement('div');
        item.className = `carousel-item ${index === 0 || index === 1 ? 'active' : ''}`;
        
        item.innerHTML = `
            <div class="animal">
                <img src="${dog.imagen || '/static/img/placeholder_pet.jpg'}" alt="${dog.nombre}">
                <h4>${dog.nombre}</h4>
                <p>${dog.descripcion ? dog.descripcion.substring(0, 30) + '...' : 'Un perro esperando un hogar...'}</p>
                <button class="adoptarBtn" data-mascota-id="${dog.id}" type="button">
                    <i class="fas fa-paw"></i> Adoptar
                </button>
            </div>
        `;
        
        dogCarousel.appendChild(item);
    });
    
    // Añadir eventos a los botones de adoptar
    dogCarousel.querySelectorAll('.adoptarBtn').forEach(btn => {
        btn.addEventListener('click', function() {
            const mascotaId = this.getAttribute("data-mascota-id");
            console.log(`🐾 Redirigiendo directamente al formulario de adopción con ID: ${mascotaId}`);
            redirigirAFormulario(mascotaId);
        });
    });
    
    
}

// Función para actualizar el carrusel de gatos
function updateCatCarousel() {
    const catCarousel = document.querySelector('#catCarousel .carousel-container');
    if (!catCarousel) return;
    
    // Limpiar el carrusel
    catCarousel.innerHTML = '';
    
    // Añadir los gatos al carrusel
    carouselCats.forEach((cat, index) => {
        const item = document.createElement('div');
        item.className = `carousel-item ${index === 0 || index === 1 ? 'active' : ''}`;
        
        item.innerHTML = `
            <div class="animal">
                <img src="${cat.imagen || '/static/img/placeholder_pet.jpg'}" alt="${cat.nombre}">
                <h4>${cat.nombre}</h4>
                <p>${cat.descripcion ? cat.descripcion.substring(0, 30) + '...' : 'Un gato esperando un hogar...'}</p>
                <button class="adoptarBtn" data-mascota-id="${cat.id}" type="button">
                    <i class="fas fa-paw"></i> Adoptar
                </button>
            </div>
        `;
        
        catCarousel.appendChild(item);
    });
    
    // Añadir eventos a los botones de adoptar
    catCarousel.querySelectorAll('.adoptarBtn').forEach(btn => {
        btn.addEventListener('click', function() {
            const mascotaId = this.getAttribute("data-mascota-id");
            console.log(`🐾 Redirigiendo directamente al formulario de adopción con ID: ${mascotaId}`);
            redirigirAFormulario(mascotaId);
        });
    });
}

// Función corregida para mover el carrusel
function moveSlide(carouselId, direction) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    
    const container = carousel.querySelector('.carousel-container');
    const slides = carousel.querySelectorAll('.carousel-item');
    if (slides.length === 0) return;
    
    // Calculate how many items to show at once (2 on desktop, 1 on mobile)
    const isMobile = window.innerWidth <= 600;
    const itemsPerView = isMobile ? 1 : 2;
    
    // Remove 'active' class from all slides
    slides.forEach(slide => slide.classList.remove('active'));
    
    // If 'current', keep the same index
    if (direction !== 'current') {
        if (direction === 'prev') {
            currentSlideIndex[carouselId] = (currentSlideIndex[carouselId] - 1 + slides.length) % slides.length;
        } else if (direction === 'next') {
            currentSlideIndex[carouselId] = (currentSlideIndex[carouselId] + 1) % slides.length;
        }
    }
    
    // Add 'active' class to the new current slides
    for (let i = 0; i < itemsPerView; i++) {
        const index = (currentSlideIndex[carouselId] + i) % slides.length;
        slides[index].classList.add('active');
    }
}

// Función para iniciar la rotación automática
function startAutoRotate(carouselId) {
    // Detener cualquier intervalo existente
    stopAutoRotate(carouselId);
    
    // Iniciar un nuevo intervalo (cada 5 segundos)
    autoRotateIntervals[carouselId] = setInterval(() => {
        moveSlide(carouselId, 'next');
    }, 5000);
}

// Función para detener la rotación automática
function stopAutoRotate(carouselId) {
    if (autoRotateIntervals[carouselId]) {
        clearInterval(autoRotateIntervals[carouselId]);
        delete autoRotateIntervals[carouselId];
    }
}

// Función para reiniciar la rotación automática después de una interacción manual
function resetAutoRotate(carouselId) {
    stopAutoRotate(carouselId);
    startAutoRotate(carouselId);
}

// Funciones de navegación para usar con botones HTML
window.prevSlide = function(carouselId) {
    moveSlide(carouselId, 'prev');
    resetAutoRotate(carouselId);
};

window.nextSlide = function(carouselId) {
    moveSlide(carouselId, 'next');
    resetAutoRotate(carouselId);
};

// Función para inicializar carruseles (puede ser llamada desde HTML)
window.initCarousels = function() {
    if (document.getElementById('dogCarousel')) {
        moveSlide('dogCarousel', 'current');
        startAutoRotate('dogCarousel');
    }
    if (document.getElementById('catCarousel')) {
        moveSlide('catCarousel', 'current');
        startAutoRotate('catCarousel');
    }
};

// Función auxiliar para verificar sesión y redirigir
function verificarSesionYRedirigir(mascotaId) {
    const estaLogueado = sessionStorage.getItem('usuarioActual') || localStorage.getItem('usuarioActual');
    
    if (estaLogueado) {
        // El usuario está logueado, redirigir al formulario de adopción
        window.location.href = `/formulario-adopcion/${mascotaId}`;
    } else {
        // El usuario no está logueado, mostrar modal de login
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            // Guarda el ID del animal para después de iniciar sesión
            sessionStorage.setItem('animalParaAdoptar', mascotaId);
            loginModal.style.display = 'block';
        } else {
            alert('Debes iniciar sesión para adoptar un animal.');
        }
    }
}