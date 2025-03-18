// Guardar este archivo como carousel-effects.js
document.addEventListener('DOMContentLoaded', function() {
    // Configurar la velocidad del carrusel (en milisegundos)
    const carousel = document.getElementById('carouselExampleIndicators');
    if (carousel) {
        // Crear una instancia del carrusel y configurar la velocidad
        const carouselInstance = new bootstrap.Carousel(carousel, {
            interval: 3000  // Cambia a 2 segundos (ajusta este valor según necesites)
        });
    }
    
    // Actualiza los títulos y descripciones del carrusel con contenido relevante
    const carouselTitles = [
        'Adopta una nueva vida',
        'Cambia su destino',
        'Encuentra tu compañero ideal',
        'Dale un hogar a quien lo necesita',
        'Una familia para cada mascota',
        'Ellos esperan por ti',
        'Amor de cuatro patas',
        'Montañita Adopta'
    ];
    
    const carouselDescriptions = [
        'Cada adopción cambia dos vidas: la tuya y la del de tu nueva mascota.',
        'Nuestros amigos peludos buscan una familia que les brinde el amor que merecen.',
        'Descubre la alegría de dar un hogar a quien realmente lo necesita.',
        'La felicidad tiene cuatro patas y está esperando por ti en Montañita Adopta.',
        'Juntos podemos crear un futuro mejor para los animales de La Montañita.',
        'Tu hogar puede ser el refugio que un animal ha estado esperando.',
        'No compres, adopta. Hay miles de corazones latiendo en busca de un hogar.',
        'Únete a nuestra comunidad y forma parte del cambio que queremos ver.'
    ];
    
    // Obtener todos los elementos de título y descripción del carrusel
    const titles = document.querySelectorAll('.carousel-caption h5');
    const descriptions = document.querySelectorAll('.carousel-caption p');
    
    // Actualizar el contenido
    titles.forEach((title, index) => {
        if (index < carouselTitles.length) {
            title.textContent = carouselTitles[index];
        }
    });
    
    descriptions.forEach((desc, index) => {
        if (index < carouselDescriptions.length) {
            desc.textContent = carouselDescriptions[index];
        }
    });
    
    // Efecto de parallax para las imágenes del carrusel
    const carouselItems = document.querySelectorAll('.carousel-item');
    
    function handleParallax() {
        const scrollTop = window.pageYOffset;
        const parallaxOffset = scrollTop * 0.4;
        
        carouselItems.forEach(item => {
            if (item.querySelector('img')) {
                item.querySelector('img').style.transform = `translateY(-${parallaxOffset}px)`;
            }
        });
    }
    
    // Solo aplicar el efecto si el carrusel está en el viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= -rect.height &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) * 1.5 &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // Mejorar el rendimiento con throttle
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                const carousel = document.getElementById('carouselExampleIndicators');
                if (carousel && isInViewport(carousel)) {
                    handleParallax();
                }
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Opcional: Añadir efecto de preloader/fade-in para el carrusel
    if (carousel) {
        carousel.style.opacity = '0';
        carousel.style.transition = 'opacity 1s ease';
        
        // Mostrar el carrusel con una animación suave
        setTimeout(() => {
            carousel.style.opacity = '1';
        }, 300);
    }
});