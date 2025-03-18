window.addEventListener('DOMContentLoaded', (event) => {
    const mq980 = window.matchMedia("(max-width: 980px)"); // Se define correctamente
    const mq720 = window.matchMedia("(max-width: 720px)");

    function moveImage() {
        const box1 = document.querySelector('.box_1:nth-child(4)');
        const box2 = document.querySelector('.box:nth-child(3)');
        if (box1 && box2) {
            box2.insertAdjacentElement('beforebegin', box1);
        } else {
            console.warn("No se encontraron los elementos .box_1 o .box en el DOM.");
        }
    }

    if (mq980.matches || mq720.matches) {
        moveImage();
    }

    mq980.addEventListener('change', (event) => {
        if (event.matches) {
            moveImage();
        }
    });

    mq720.addEventListener('change', (event) => {
        if (event.matches) {
            moveImage();
        }
    });
});
