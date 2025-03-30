(function () {
    // Función para actualizar el menú dependiendo de si el usuario está autenticado
    function updateMenu(userData) {
        const userMenu = document.getElementById("user-menu");
        const loginMenu = document.getElementById("login-menu");
        const userNameElement = document.getElementById("user-name");

        // Si el usuario está autenticado
        if (userData) {
            userMenu.style.display = "inline-block"; // Mostrar el menú del usuario
            loginMenu.style.display = "none"; // Ocultar el menú de login
            userNameElement.innerText = userData.nombre; // Mostrar solo el nombre del usuario

        } else {
            userMenu.style.display = "none"; // Ocultar el menú del usuario
            loginMenu.style.display = "inline-block"; // Mostrar el menú de login
        }
    }

    // Función para abrir un modal
    function openModal(modalId) {
        var modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = "block";
        }
    }

    // Función para cerrar un modal
    function closeModal(modalId) {
        var modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = "none";
        }
    }

    // Hacer accesibles las funciones globalmente
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.showModal = openModal; // Compatibilidad con `showModal()`

    // Cerrar modal al hacer clic fuera del contenido
    window.onclick = function (event) {
        var modals = document.querySelectorAll(".modal");
        modals.forEach(function (modal) {
            // Si el clic fue fuera del modal, cerramos el modal
            if (event.target === modal) {
                closeModal(modal.id);  // Cerramos el modal específico
            }
        });
    };

    // Hacer accesible la función `updateMenu` globalmente
    window.updateMenu = updateMenu;

    // Función para cerrar sesión
    document.getElementById("logout-button").addEventListener("click", function () {
        // Eliminar el token y los datos del usuario del localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("userData");

        // Actualizar el menú
        updateMenu(null); // Actualiza el menú al estado de "no autenticado"

        // Cerrar cualquier modal abierto
        closeModal("userMenuModal"); // Ajusta el ID del modal según sea necesario

        // Evitar redirección, solo actualizar la interfaz
        // Aquí no se realiza la redirección a /login, solo se actualiza el estado del menú
    });

})();

flatpickr("#register-fecha-nacimiento", {
    dateFormat: "Y-m-d", // Puedes cambiar el formato de fecha si lo necesitas
    allowInput: true,    // Permitir entrada manual
    minDate: "1900-01-01", // Fecha mínima si lo necesitas
    maxDate: "2025-12-31", // Fecha máxima si lo necesitas
});

