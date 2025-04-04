from flask import Flask, render_template, request, redirect, url_for, flash, session, send_from_directory
import requests
import jwt
import time
import os
from flask_session import Session  
from functools import wraps

app = Flask(__name__)
# Usar variable de entorno para la clave secreta
app.secret_key = os.environ.get('SECRET_KEY', '9b73f2a1bdd7ae163444473d29a6885ffa22ab26117068f72a5a56a74d12d1fc')

# Configuración de sesión para producción
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = "filesystem"
# Hacer la sesión más segura en producción
app.config["SESSION_COOKIE_SECURE"] = os.environ.get('FLASK_ENV') == 'production'
app.config["SESSION_COOKIE_HTTPONLY"] = True
Session(app)

# URL de la API en producción
API_URL = os.environ.get('API_URL', 'https://montanitaadopta.onrender.com/adoptme/api/v1/')

# Crear directorio para imágenes temporales
os.makedirs('temp_images', exist_ok=True)
os.makedirs('static/profile_photos', exist_ok=True)

def obtener_usuario_desde_sesion():
    """Obtiene el usuario autenticado desde la sesión haciendo una petición al backend."""
    token = session.get('token')
    if not token:
        return None
    
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(API_URL + 'auth/me', headers=headers, timeout=5)
        
        if response.status_code == 200:
            user_data = response.json()
            session['usuario_nombre'] = user_data.get('nombre', 'Usuario')
            session['usuario_foto'] = user_data.get('foto_perfil', None)
            return user_data.get('nombre', 'Usuario')
        else:
            flash("Sesión no válida, inicia sesión nuevamente.", "error")
            session.pop('token', None)
            return None
    except requests.exceptions.RequestException as e:
        flash(f"Error al comunicarse con el servidor: {str(e)}", "error")
        return None

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not obtener_usuario_desde_sesion():
            flash("Debes iniciar sesión primero.", "error")
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    usuario_nombre = obtener_usuario_desde_sesion()
    usuario_foto = session.get('usuario_foto')
    return render_template('index.html', usuario_nombre=usuario_nombre, usuario_foto=usuario_foto)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        correo = request.form['correo']
        contraseña = request.form['password']
        payload = {'username': correo, 'password': contraseña}

        try:
            response = requests.post(API_URL + 'auth/token', data=payload)
            
            if response.status_code == 200:
                # Asegúrate de obtener el token correcto y guardarlo tal cual
                token_data = response.json()
                token = token_data.get('access_token')
                if token:
                    session['token'] = token
                    
                    # Obtener datos del usuario
                    headers = {'Authorization': f'Bearer {token}'}
                    user_response = requests.get(API_URL + 'auth/me', headers=headers)
                    
                    if user_response.status_code == 200:
                        user_data = user_response.json()
                        session['usuario_nombre'] = user_data.get('nombre', 'Usuario')
                        session['usuario_foto'] = user_data.get('foto_perfil')
                        
                    flash('Inicio de sesión exitoso', 'success')
                    return redirect(url_for('index'))
                else:
                    flash('No se recibió un token válido', 'error')
            else:
                flash(f"Error en el inicio de sesión: {response.json().get('detail', 'Error desconocido')}", 'error')
        except Exception as e:
            flash(f"Ocurrió un error al intentar iniciar sesión: {e}", 'error')

    return render_template('index.html')

@app.route('/profile')
@login_required
def profile():
    usuario_nombre = obtener_usuario_desde_sesion()
    usuario_foto = session.get('usuario_foto')
    return render_template('index.html', usuario_nombre=usuario_nombre, usuario_foto=usuario_foto)

@app.route('/logout')
def logout():
    session.pop('token', None)  
    session.pop('usuario_nombre', None)
    session.pop('usuario_foto', None)
    flash('Has cerrado sesión', 'success')
    return redirect(url_for('index'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        nombre = request.form['nombre']
        correo_electronico = request.form['correo_electronico']
        direccion = request.form['direccion']
        codigo_postal = request.form['codigo_postal']
        telefono = request.form['telefono']
        contrasena = request.form['contrasena']
        confirmar_contrasena = request.form['confirmar_contrasena']

        if contrasena != confirmar_contrasena:
            flash('Las contraseñas no coinciden', 'error')
            return redirect(url_for('register'))

        payload = {
            'nombre': nombre,
            'apellido': "",
            'contrasenia': contrasena,
            'correo': correo_electronico,
            'direccion': direccion,
            'codigo_postal': codigo_postal,
            'telefono': telefono,
            'edad': 0,
            'jwt': ""
        }

        try:
            response = requests.post(API_URL + 'auth/register', json=payload)
            if response.status_code == 200:
                token = response.json().get('access_token')
                session['token'] = token  
                flash('Registro exitoso', 'success')
                return redirect(url_for('index'))
            else:
                flash(f"Error en el registro: {response.json().get('error', 'Error desconocido')}", 'error')
        except Exception as e:
            flash(f"Ocurrió un error al intentar registrarse: {e}", 'error')

    return render_template('index.html')

@app.route('/adopcion')
def adopcion():
    usuario_nombre = obtener_usuario_desde_sesion()
    usuario_foto = session.get('usuario_foto')
    return render_template('adopcion.html', usuario_nombre=usuario_nombre, usuario_foto=usuario_foto)

@app.route('/formulario_adopcion')
def formulario_adopcion():
    usuario_nombre = obtener_usuario_desde_sesion()
    usuario_foto = session.get('usuario_foto')
    mascota_id = request.args.get('id', default=None, type=int)

    mascota = None  # Inicializar la variable
    if mascota_id:
        # Llamar a la API para obtener los datos de la mascota
        try:
            response = requests.get(f"{API_URL}mascotas/{mascota_id}")
            if response.status_code == 200:
                mascota = response.json()
            else:
                flash("No se encontró la mascota seleccionada.", "error")
        except requests.exceptions.RequestException:
            flash("Error al conectar con el servidor.", "error")

    return render_template('formulario_adopcion.html', usuario_nombre=usuario_nombre, usuario_foto=usuario_foto, mascota=mascota)

@app.route('/donaciones')
def donaciones():
    usuario_nombre = obtener_usuario_desde_sesion()
    usuario_foto = session.get('usuario_foto')
    return render_template('donaciones.html', usuario_nombre=usuario_nombre, usuario_foto=usuario_foto)

@app.route('/donar', methods=['GET', 'POST'])
@login_required
def donar():
    usuario_nombre = obtener_usuario_desde_sesion()
    usuario_foto = session.get('usuario_foto')
    if request.method == 'POST':
        return redirect(url_for('index'))
    return render_template('donar.html', usuario_nombre=usuario_nombre, usuario_foto=usuario_foto)

@app.route('/voluntario')
def voluntario():
    usuario_nombre = obtener_usuario_desde_sesion()
    usuario_foto = session.get('usuario_foto')
    return render_template('voluntario.html', usuario_nombre=usuario_nombre, usuario_foto=usuario_foto)

@app.route('/contacto')
def contacto():
    usuario_nombre = obtener_usuario_desde_sesion()
    usuario_foto = session.get('usuario_foto')
    return render_template('contacto.html', usuario_nombre=usuario_nombre, usuario_foto=usuario_foto)

@app.route('/historias_exito')
def historias_exito():
    usuario_nombre = obtener_usuario_desde_sesion()
    usuario_foto = session.get('usuario_foto')
    return render_template('historias_exito.html', usuario_nombre=usuario_nombre, usuario_foto=usuario_foto)

# Ruta para servir imágenes de perfil desde el backend
# # Ruta para servir imágenes de perfil desde el backend
# @app.route('/proxy/profile_photos/<path:filename>')
# def proxy_profile_photo(filename):
#     """
#     Proxy para obtener imágenes de perfil desde el backend
#     """
#     try:
#         # Construir la URL completa al backend
#         backend_url = f"https://montanitaadopta.onrender.com/static/profile_photos/{filename}"
        
#         # Hacer una solicitud al backend para obtener la imagen
#         response = requests.get(backend_url, stream=True)
        
#         if response.status_code == 200:
#             # Crear directorio temporal si no existe
#             os.makedirs('temp_images', exist_ok=True)
            
#             # Guardar la imagen temporalmente
#             temp_path = os.path.join('temp_images', filename)
#             with open(temp_path, 'wb') as f:
#                 for chunk in response.iter_content(chunk_size=8192):
#                     f.write(chunk)
            
#             # Servir la imagen desde el directorio temporal
#             return send_from_directory('temp_images', filename, 
#                                       mimetype=response.headers.get('Content-Type', 'image/jpeg'))
#         else:
#             # Si no se encuentra la imagen, devolver una imagen por defecto
#             return send_from_directory('static', 'default_profile.jpg')
#     except Exception as e:
#         print(f"Error al obtener imagen de perfil: {e}")
#         return send_from_directory('static', 'default_profile.jpg')
