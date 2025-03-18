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
            storyDiv.innerHTML = `
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

// 📝 Envío de historias con validación
function initStorySubmission() {
    const storyForm = document.getElementById("storyForm");
    if (!storyForm) return;

    const submissionMessage = document.getElementById("submissionMessage");
    if (!submissionMessage) return;

    storyForm.addEventListener("submit", async function (e) {
        e.preventDefault();
    
        if (!apiConnector.token) {
            alert("No estás autenticado. Por favor, inicia sesión para enviar una historia.");
            window.location.href = "/login";
            return;
        }
    
        // Extraer los datos del formulario manualmente
        const data = {
            title: document.getElementById("title").value.trim(),
            content: document.getElementById("story").value.trim(),
        };
    
        try {
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