// Inicialización de la funcionalidad de historias de éxito al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    loadApprovedStories();
    initStorySubmission();
});

// 📖 Carga historias aprobadas
async function loadApprovedStories() {
    try {
        const data = await apiConnector.getSuccessStories();
        const storiesContainer = document.getElementById("stories-container");
        if (!storiesContainer) return;
        storiesContainer.innerHTML = "";

        if (data.length === 0) {
            storiesContainer.innerHTML = "<p>No hay historias disponibles en este momento.</p>";
            return;
        }

        data.forEach(story => {
            const storyDiv = document.createElement("div");
            storyDiv.classList.add("story");
            storyDiv.setAttribute("data-id", story.id);
            
            // Añadir imagen si está disponible
            const imageHtml = story.image_url 
                ? `<img src="${story.image_url}" alt="Imagen de historia" class="story-image">`
                : '';
            
            storyDiv.innerHTML = `
                ${imageHtml}
                <p class="story-preview">${story.preview}</p>
                <p class="story-full" style="display: none;">${story.full_story}</p>
                <button class="expand-story" onclick="toggleStory(${story.id})">Leer más</button>
            `;
            storiesContainer.appendChild(storyDiv);
        });
    } catch (error) {
        console.error("Error al cargar historias:", error);
    }
}

// Función para mostrar u ocultar la historia completa
function toggleStory(id) {
    const storyFull = document.querySelector(`.story[data-id='${id}'] .story-full`);
    const button = document.querySelector(`.story[data-id='${id}'] .expand-story`);

    if (storyFull.style.display === "none") {
        storyFull.style.display = "block";
        button.textContent = "Leer menos";
    } else {
        storyFull.style.display = "none";
        button.textContent = "Leer más";
    }
}

// 📝 Subir imagen
async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    
    try {
        const response = await fetch("/adoptme/api/v1/success_stories/upload_image/", {
            method: "POST",
            body: formData
        });
        
        if (!response.ok) {
            throw new Error("Error al subir la imagen");
        }
        
        const data = await response.json();
        return data.image_url; // Devuelve la URL de la imagen subida
    } catch (error) {
        console.error("Error al subir imagen:", error);
        throw error;
    }
}

// 📝 Envío de historias con validación y soporte para imagen
function initStorySubmission() {
    const storyForm = document.getElementById("storyForm");
    if (!storyForm) return;

    const submissionMessage = document.getElementById("submissionMessage");
    if (!submissionMessage) return;

    // Añadir input para imagen
    const imageInput = document.createElement("input");
    imageInput.type = "file";
    imageInput.id = "storyImage";
    imageInput.accept = "image/*";
    imageInput.style.display = "block";
    imageInput.style.margin = "10px 0";
    
    // Insertar input de imagen antes del botón de submit
    const submitButton = storyForm.querySelector('button[type="submit"]');
    submitButton.parentNode.insertBefore(imageInput, submitButton);

    storyForm.addEventListener("submit", async function (e) {
        e.preventDefault();
    
        if (!apiConnector.token) {
            alert("No estás autenticado. Por favor, inicia sesión para enviar una historia.");
            window.location.href = "/login";
            return;
        }
    
        // Extraer los datos del formulario
        const data = {
            title: document.getElementById("title").value.trim(),
            content: document.getElementById("story").value.trim(),
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim()
        };
    
        try {
            // Subir imagen si está presente
            let imageUrl = null;
            const imageFile = document.getElementById("storyImage").files[0];
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }
    
            // Añadir URL de imagen a los datos si existe
            if (imageUrl) {
                data.image_url = imageUrl;
            }
    
            const response = await apiConnector.post("success_stories", data);
            
            submissionMessage.textContent = "✅ Tu historia ha sido enviada para revisión.";
            submissionMessage.style.color = "green";
            submissionMessage.style.display = "block";
            
            storyForm.reset();
            
            setTimeout(() => { submissionMessage.style.display = "none"; }, 5000);
        } catch (error) {
            console.error("Error en el envío de historia:", error);
            submissionMessage.textContent = "❌ Error al enviar la historia.";
            submissionMessage.style.color = "red";
            submissionMessage.style.display = "block";
        }
    });    
}

// Video gallery functionality (existing code)
document.addEventListener("DOMContentLoaded", function() {
    const videoButtons = document.querySelectorAll('.video-btn');
    const videoPlayer = document.querySelector('.video-gallery video');
    
    videoButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Actualizar botón activo
            document.querySelector('.video-btn.active').classList.remove('active');
            this.classList.add('active');
            
            // Cambiar fuente del video
            const videoSrc = this.getAttribute('data-video');
            videoPlayer.querySelector('source').src = "{{ url_for('static', filename='videos/') }}" + videoSrc;
            videoPlayer.load();
            videoPlayer.play();
        });
    });
});