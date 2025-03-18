document.addEventListener('DOMContentLoaded', function() {
    // Comprobar si ya se mostró antes (usando localStorage)
    const hasVisited = localStorage.getItem('hasVisitedMontañitaAdopta');
    
    // Solo mostrar el popup si es la primera visita (nunca ha visitado antes)
    if (!hasVisited) {
        setTimeout(function() {
            const welcomePopup = document.getElementById('welcome-popup');
            if (welcomePopup) {
                welcomePopup.style.display = 'block';
                // Guardar indicador de que ya visitó (usando un valor booleano o timestamp)
                localStorage.setItem('hasVisitedMontañitaAdopta', 'true');
            }
        }, 500);
    }
    
    // El resto del código para cerrar el popup queda igual
    const closeWelcome = document.querySelector('.close-welcome');
    if (closeWelcome) {
        closeWelcome.addEventListener('click', function() {
            document.getElementById('welcome-popup').style.display = 'none';
        });
    }
    
    const welcomeButton = document.getElementById('welcome-button');
    if (welcomeButton) {
        welcomeButton.addEventListener('click', function() {
            document.getElementById('welcome-popup').style.display = 'none';
        });
    }
    
    const welcomePopup = document.getElementById('welcome-popup');
    if (welcomePopup) {
        welcomePopup.addEventListener('click', function(event) {
            if (event.target === welcomePopup) {
                welcomePopup.style.display = 'none';
            }
        });
    }
});