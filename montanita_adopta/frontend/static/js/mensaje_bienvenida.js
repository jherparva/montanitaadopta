document.addEventListener('DOMContentLoaded', function() {
    // Verificamos si el usuario ha iniciado sesión comprobando el token JWT
    const isLoggedIn = checkIfUserIsLoggedIn();
    
    // Mostrar el popup solo si NO ha iniciado sesión
    if (!isLoggedIn) {
        setTimeout(function() {
            const welcomePopup = document.getElementById('welcome-popup');
            if (welcomePopup) {
                welcomePopup.style.display = 'block';
            }
        }, 500);
    }
    
    // El resto del código para cerrar el popup queda igual...
});

// Función para verificar si el usuario ha iniciado sesión
function checkIfUserIsLoggedIn() {
    // Verificar si existe un token JWT en localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        return false; // No hay token, usuario no está autenticado
    }
    
    // Opcionalmente, puedes verificar si el token no está expirado
    // Esto requiere decodificar el JWT en el cliente
    try {
        // Decodificación simple del JWT (solo la parte del payload)
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Verificar si el token ha expirado
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
            // Token expirado, eliminar y considerar como no autenticado
            localStorage.removeItem('authToken');
            return false;
        }
        
        // Token válido y no expirado
        return true;
    } catch (error) {
        console.error('Error al verificar el token:', error);
        // En caso de error, mejor eliminar el token y considerar como no autenticado
        localStorage.removeItem('authToken');
        return false;
    }
}