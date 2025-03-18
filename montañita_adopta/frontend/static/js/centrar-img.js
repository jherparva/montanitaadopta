window.addEventListener('DOMContentLoaded', (event) => {
    const mq720 = window.matchMedia("(max-width: 720px)");
    const mq980 = window.matchMedia("(max-width: 980px)");

    // Función para ajustar el tamaño y centrar las imágenes
    function ajustarImagenes() {
        var anchoVentana = window.innerWidth;
        var imagenes = document.querySelectorAll('.box_1 img, .box img');

        imagenes.forEach(function(img) {
            if (anchoVentana <= 720) {
                img.style.maxWidth = '40%'; // Reducir tamaño al 40% en 720px o menos
            } else {
                img.style.maxWidth = '100%'; // Restaurar tamaño completo
            }

            // Centrar la imagen horizontalmente
            img.style.display = 'block';
            img.style.marginLeft = 'auto';
            img.style.marginRight = 'auto';
        });
    }

    // Función para mover la imagen y ocultarla en 720px
    function moveImage() {
        const box1 = document.querySelector('.box_1:nth-child(4)');
        const box2 = document.querySelector('.box:nth-child(3)');
        if (box1 && box2) {
            box2.insertAdjacentElement('beforebegin', box1);
        }
    }

    // Llamar a las funciones cuando se cargue completamente la página
    window.addEventListener('load', () => {
        ajustarImagenes();
        if (mq980.matches || mq720.matches) {
            moveImage();
        }
    });

    // Llamar a las funciones cuando la ventana cambie de tamaño
    window.addEventListener('resize', () => {
        ajustarImagenes();
        if (mq980.matches || mq720.matches) {
            moveImage();
        }
    });
});
