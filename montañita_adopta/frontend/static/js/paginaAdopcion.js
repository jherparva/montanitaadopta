// Guardar como static/js/pagina_adopcion.js

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("advancedSearchForm");
    const modal = document.getElementById("searchModal");
    const closeModal = document.querySelector(".close");
    const modalResults = document.getElementById("modalResults");
    const speciesSelect = document.getElementById("species");
    const breedSelect = document.getElementById("breed");
    const ageSelect = document.getElementById("age");

    // Función para actualizar dinámicamente las razas según la especie
    function updateBreeds() {
        const species = speciesSelect.value;
        
        const dogBreeds = [
            { value: "labrador", text: "Labrador" },
            { value: "german_shepherd", text: "Pastor Alemán" },
            { value: "golden_retriever", text: "Golden Retriever" },
            { value: "bulldog", text: "Bulldog" }
        ];

        const catBreeds = [
            { value: "siamese", text: "Siamés" },
            { value: "persian", text: "Persa" },
            { value: "maine_coon", text: "Maine Coon" },
            { value: "bengal", text: "Bengalí" }
        ];

        // Limpiar y actualizar opciones de raza
        breedSelect.innerHTML = '<option value="">Seleccione una raza</option>';
        const breeds = species === "dog" ? dogBreeds : species === "cat" ? catBreeds : [];

        breeds.forEach(breed => {
            const option = document.createElement("option");
            option.value = breed.value;
            option.textContent = breed.text;
            breedSelect.appendChild(option);
        });
    }

    // Función para actualizar dinámicamente las edades según la especie
    function updateAges() {
        const species = speciesSelect.value;

        const dogAges = [
            { value: "puppy", text: "Cachorro" },
            { value: "adult", text: "Adulto" },
            { value: "senior", text: "Senior" }
        ];

        const catAges = [
            { value: "kitten", text: "Gatito" },
            { value: "adult", text: "Adulto" },
            { value: "senior", text: "Senior" }
        ];

        // Limpiar y actualizar opciones de edad
        ageSelect.innerHTML = '<option value="">Seleccione una edad</option>';
        const ages = species === "dog" ? dogAges : species === "cat" ? catAges : [];

        ages.forEach(age => {
            const option = document.createElement("option");
            option.value = age.value;
            option.textContent = age.text;
            ageSelect.appendChild(option);
        });
    }

    // Evento para actualizar razas y edades al cambiar la especie
    if (speciesSelect) {
        speciesSelect.addEventListener("change", function () {
            updateBreeds();
            updateAges();
        });
    }

    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
        
            let species = speciesSelect.value.toLowerCase().trim();
            let age = ageSelect.value.toLowerCase().trim();
            let size = document.getElementById("size").value.toLowerCase().trim();
            let breed = breedSelect.value.toLowerCase().trim();
        
            // Convertir especies en español a inglés
            if (species === "perro") species = "dog";
            if (species === "gato") species = "cat";
        
            try {
                const params = {
                    species: species,
                    age: age,
                    size: size,
                    breed: breed
                };
                
                const animals = await apiConnector.getMascotas(params);
                
                modalResults.innerHTML = animals.length === 0 
                    ? "<p>No se encontraron animales con esos filtros.</p>"
                    : animals.map(animal => `
                        <div class="animal-card">
                            <img src="${animal.imagen}" alt="${animal.nombre}">
                            <h4>${animal.nombre}</h4>
                            <p>${animal.descripcion}</p>
                            <button class="adoptarBtn" data-mascota-id="${animal.id}">
                                Adoptar
                            </button>
                        </div>
                    `).join("");
        
                modal.style.display = "flex";
                
                // Inicializar los botones de adopción después de cargar los resultados
                initAdoptionButtons();
            } catch (error) {
                console.error("Error al obtener los animales:", error);
                modalResults.innerHTML = `<p>Error al cargar los datos: ${error.message}</p>`;
            }
        });
    }

    // Cerrar modal cuando se hace clic fuera
    if (modal) {
        window.addEventListener("click", function (event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    }

    // Inicializar valores al cargar la página
    if (speciesSelect) {
        updateBreeds();
        updateAges();
    }
});

document.addEventListener("DOMContentLoaded", function () {
    initCarousels();
    initSearch();
    initSocialLogin();
    initAdoptionButtons();
});

function initAdoptionButtons() {
    // Seleccionar todos los botones de adopción
    const adoptarBtns = document.querySelectorAll(".adoptarBtn");
    if (adoptarBtns.length > 0) {
        adoptarBtns.forEach(btn => {
            // Asegurarse de que cada botón tenga el atributo data-mascota-id
            if (!btn.hasAttribute("data-mascota-id")) {
                console.error("Un botón de adopción no tiene ID de mascota asociado");
            }
            btn.addEventListener("click", verificarSesionYRedirigir);
        });
    }
}

// 🎠 Inicializa los carruseles con cambio automático
function initCarousels() {
    document.querySelectorAll(".carousel").forEach(carousel => {
        const id = carousel.id;
        const container = carousel.querySelector(".carousel-container");
        const items = carousel.querySelectorAll(".carousel-item");
        
        if (items.length <= 1) return; // Si solo hay un elemento, no necesitamos carrusel
        
        let currentIndex = 0;
        
        // Configurar el primer elemento como activo
        items.forEach((item, index) => {
            if (index === 0) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });

        // Función para actualizar la posición del carrusel
        function updateCarousel() {
            const offset = -currentIndex * 100;
            container.style.transform = `translateX(${offset}%)`;
            
            // Actualizar clases activas
            items.forEach((item, index) => {
                if (index === currentIndex) {
                    item.classList.add("active");
                } else {
                    item.classList.remove("active");
                }
            });
        }

        // Función para avanzar al siguiente slide
        function nextSlide() {
            currentIndex = (currentIndex < items.length - 1) ? currentIndex + 1 : 0;
            updateCarousel();
        }

        // Función para retroceder al slide anterior
        function prevSlide() {
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : items.length - 1;
            updateCarousel();
        }

        // Configurar intervalo para cambio automático
        let autoSlideInterval = setInterval(nextSlide, 3000);

        // Configurar controladores de navegación
        const prevButton = carousel.querySelector(".prev");
        const nextButton = carousel.querySelector(".next");

        if (prevButton) {
            prevButton.addEventListener("click", function() {
                prevSlide();
                resetInterval();
            });
        }

        if (nextButton) {
            nextButton.addEventListener("click", function() {
                nextSlide();
                resetInterval();
            });
        }

        // Resetear el intervalo cuando se hace clic en los botones
        function resetInterval() {
            clearInterval(autoSlideInterval);
            autoSlideInterval = setInterval(nextSlide, 3000);
        }

        // Pausar el carrusel al pasar el mouse por encima
        carousel.addEventListener("mouseenter", function() {
            clearInterval(autoSlideInterval);
        });

        // Reanudar el carrusel al quitar el mouse
        carousel.addEventListener("mouseleave", function() {
            autoSlideInterval = setInterval(nextSlide, 3000);
        });

        // Guardar las funciones en el objeto window para permitir control externo
        window[`nextSlide_${id}`] = nextSlide;
        window[`prevSlide_${id}`] = prevSlide;
    });
}

function redirigirAFormulario(mascotaId) {
    if (!mascotaId) {
        console.error("🚨 No se pudo obtener el ID de la mascota.");
        return;
    }
    console.log(`🐾 Redirigiendo al formulario de adopción con ID: ${mascotaId}`);
    window.location.href = `/formulario_adopcion?id=${mascotaId}`;
}

// Funciones adicionales que serían implementadas en el código real
function initSearch() {
    // Implementación de la funcionalidad de búsqueda
    console.log("Inicializando búsqueda...");
}

// 🔑 Inicializa el inicio de sesión con redes sociales
function initSocialLogin() {
    if (typeof gapi !== 'undefined') {
        window.onload = function () {
            gapi.load('auth2', function () {
                gapi.auth2.init({ client_id: "373637505294-0havcaleq8bobimbts8353etmn0ahb7e.apps.googleusercontent.com" });
            });
        };
    }

    if (typeof FB !== 'undefined') {
        window.fbAsyncInit = function () {
            FB.init({
                appId: "TU_APP_ID",
                cookie: true,
                xfbml: true,
                version: "v12.0"
            });
        };
    }

    // Cargar SDK de Facebook si no está cargado
    (function (d, s, id) {
        let js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    // Añadir evento al botón de login con Google
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', function() {
            window.location.href = `${apiConnector.baseURL}/auth/google`;
        });
    }
}

// Función para manejar el inicio de sesión
function handleLogin(formId) {
    const loginForm = document.getElementById(formId);
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const data = await apiConnector.login(email, password);
            
            // También guardar el ID y nombre del usuario si se necesita
            if (data.usuario_id) localStorage.setItem('usuario_id', data.usuario_id);
            if (data.nombre) localStorage.setItem('nombre_usuario', data.nombre);
            
            alert('Inicio de sesión exitoso');
            
            // Verificar si hay animal pendiente para adopción
            const animalId = sessionStorage.getItem('animalParaAdoptar');
            if (animalId) {
                sessionStorage.removeItem('animalParaAdoptar');
                window.location.href = `/formulario_adopcion?id=${animalId}`;
            } else {
                window.location.href = '/'; // Redirigir al home
            }
        } catch (error) {
            console.error('Error en el inicio de sesión:', error);
            alert('Error: ' + error.message);
        }
    });
}

// Función para manejar el registro
function handleRegistration(formId) {
    const registroForm = document.getElementById(formId);
    if (!registroForm) return;

    registroForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre').value;
        const apellido = document.getElementById('apellido').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const direccion = document.getElementById('direccion').value;
        const telefono = document.getElementById('telefono').value;
        const fechaNacimiento = document.getElementById('fecha_nacimiento').value;
        
        const userData = {
            nombre: nombre,
            apellido: apellido,
            correo: email,
            contrasenia: password,
            direccion: direccion,
            telefono: telefono,
            fecha_nacimiento: fechaNacimiento
        };
        
        try {
            await apiConnector.register(userData);
            alert('Registro exitoso. Por favor inicia sesión.');
        } catch (error) {
            console.error('Error en el registro:', error);
            alert('Error: ' + error.message);
        }
    });
}

// Inicializar los formularios cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    handleLogin('loginForm');
    handleRegistration('registroForm');
});