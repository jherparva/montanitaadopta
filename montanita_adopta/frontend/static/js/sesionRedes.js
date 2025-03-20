document.addEventListener("DOMContentLoaded", function () {
    // Inicializa el botón de Google Sign-In
    google.accounts.id.initialize({
        client_id: "373637505294-0havcaleq8bobimbts8353etmn0ahb7e.apps.googleusercontent.com",
        callback: handleCredentialResponse,
        auto_select: false
    });

    // Renderizar el botón de Google
    google.accounts.id.renderButton(
        document.querySelector(".social-login.google"),
        { theme: "outline", size: "large", type: "standard" }
    );

    // Manejo del token de Google
    function handleCredentialResponse(response) {
        if (response.credential) {
            loginWithGoogle(response.credential);
        } else {
            console.error("Error en la autenticación de Google.");
            showError("No se pudo autenticar con Google. Intenta de nuevo.");
        }
    }

    // Función para enviar el id_token al backend y hacer login
    async function loginWithGoogle(id_token) {
        try {
            const response = await fetch("https://montanitaadopta.onrender.com/adoptme/api/v1/auth/google-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id_token: id_token }),
                credentials: "include" // Important for cookies
            });

            const data = await response.json();

            if (response.ok && data.access_token) {
                localStorage.setItem("token", data.access_token);
                showSuccess("Inicio de sesión exitoso con Google");
                window.location.href = "https://webmontanitaadopta.onrender.com/"; // Redirigir a la página principal
            } else {
                showError(data.message || "Error al iniciar sesión con Google. Por favor, intenta de nuevo.");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            showError("Error de conexión con el servidor.");
        }
    }

    // Remove the direct click event since the Google button is now self-contained
    // (The renderButton function creates a button that handles clicks automatically)
});

// Facebook initialization
document.addEventListener("DOMContentLoaded", function () {
    window.fbAsyncInit = function () {
        FB.init({
            appId: 'TU_APP_ID_DE_FACEBOOK', // Sustituye con tu App ID
            cookie: true,
            xfbml: true,
            version: 'v11.0'
        });
    };

    // Cargar el SDK de Facebook
    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    // Event listener para el botón de Facebook
    document.querySelector(".social-login.facebook").addEventListener("click", function () {
        FB.login(function (response) {
            if (response.authResponse) {
                console.log("Usuario conectado con Facebook");
                var accessToken = response.authResponse.accessToken;
                loginWithFacebook(accessToken);
            } else {
                console.log("Error en el inicio de sesión con Facebook");
                showError("No se pudo autenticar con Facebook. Intenta de nuevo.");
            }
        }, { scope: 'email' });
    });

    // Función para enviar el accessToken al backend y hacer login
    async function loginWithFacebook(accessToken) {
        try {
            const response = await fetch("https://montanitaadopta.onrender.com/adoptme/api/v1/auth/facebook-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ access_token: accessToken }),
                credentials: "include" // Important for cookies
            });

            const data = await response.json();

            if (response.ok && data.access_token) {
                localStorage.setItem("token", data.access_token);
                showSuccess("Inicio de sesión exitoso con Facebook");
                window.location.href = "https://webmontanitaadopta.onrender.com/"; // Redirigir a la página principal
            } else {
                showError(data.message || "Error al iniciar sesión con Facebook");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            showError("Error de conexión con el servidor.");
        }
    }
});

// Utility functions for displaying messages
function showError(message) {
    alert(message); // You can replace this with a more user-friendly notification
}

function showSuccess(message) {
    alert(message); // You can replace this with a more user-friendly notification
}