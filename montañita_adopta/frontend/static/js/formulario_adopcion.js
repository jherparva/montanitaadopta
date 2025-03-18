document.addEventListener('DOMContentLoaded', function() {
    // Obtener el ID de la mascota de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const mascotaId = urlParams.get('id');
    
    if (!mascotaId) {
        console.error("Error: No se proporcionó un ID de mascota");
        alert("Error: No se ha seleccionado ninguna mascota para adoptar");
        window.location.href = '/adoptar'; // Redirigir a la página de adopción
        return;
    }
    
    // Cargar datos de la mascota usando la API
    apiConnector.getMascota(mascotaId)
        .then(mascota => {
            if (!mascota) {
                throw new Error('No se encontró la mascota');
            }
            
            // Actualizar el campo oculto con el ID
            document.getElementById('mascota-id').value = mascota.id;
            
            // Actualizar la información visible de la mascota
            document.querySelector('.mascota-details h3').textContent = mascota.nombre;
            document.querySelector('.mascota-details p:nth-child(2)').innerHTML = 
                `<i class="fas fa-birthday-cake"></i> Edad: ${mascota.edad || 'No especificada'}`;
            document.querySelector('.mascota-details p:nth-child(3)').innerHTML = 
                `<i class="fas fa-paw"></i> Raza: ${mascota.raza || 'No especificada'}`;
            document.querySelector('.mascota-details p:nth-child(4)').innerHTML =
                `<i class="fas fa-venus-mars"></i> Sexo: ${mascota.sexo || 'No especificado'}`;
            
            // Actualizar la imagen de la mascota
            if (mascota.imagen) {
                document.querySelector('.mascota-img').src = mascota.imagen;
                document.querySelector('.mascota-img').alt = mascota.nombre;
            }
            
            // Actualizar el nombre en el campo del formulario
            document.getElementById('nombre-companero').value = mascota.nombre;
        })
        .catch(error => {
            console.error('Error al cargar los datos de la mascota:', error);
            alert('No se pudo cargar la información de la mascota. Por favor, intente nuevamente.');
            window.location.href = '/adoptar';
        });
    
    // Configurar el envío del formulario
    document.getElementById('formulario-adopcion').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Verificar que hay un ID de mascota
        const mascotaId = document.getElementById('mascota-id').value;
        if (!mascotaId) {
            alert('Error: No se ha seleccionado ninguna mascota');
            return;
        }
        
        // Convertir FormData a un objeto regular
        const formData = new FormData(this);
        const formDataObj = {};
        formData.forEach((value, key) => {
            formDataObj[key] = value;
        });
        
        // Enviar el objeto de datos usando la API
        apiConnector.enviarSolicitudAdopcion(formDataObj)
            .then(response => {
                alert('¡Solicitud enviada con éxito! Nos pondremos en contacto contigo pronto.');
                window.location.href = '/'; // Redirigir al inicio
            })
            .catch(error => {
                console.error('Error al enviar la solicitud:', error);
                alert('Error al enviar la solicitud. Por favor, intente nuevamente.');
            });
    });
});

