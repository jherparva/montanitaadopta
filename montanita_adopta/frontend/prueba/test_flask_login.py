from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

def test_login():
    driver = webdriver.Chrome()
    
    # Abre la página
    driver.get("http://127.0.0.1:3000/")
    
    # Espera explícita para asegurarse de que la página ha cargado completamente
    time.sleep(3)  # Espera 3 segundos para que la página cargue

    try:
        # Hacemos clic en el enlace para abrir el modal, usando el XPath con 'contains'
        login_button = driver.find_element(By.XPATH, "//a[contains(text(),'LOGIN')]")
        login_button.click()

        time.sleep(2) 

         # Hacemos clic en el enlace para abrir el modal
        login_button = driver.find_element(By.XPATH, "//a[@onclick=\"showModal('login')\"]")
        login_button.click()

        # Espera para que el modal de login cargue
        time.sleep(2)  # Espera 2 segundos para que el modal se cargue

        # Encuentra los campos de entrada para el correo y la contraseña
        email_input = driver.find_element(By.NAME, "correo")
        password_input = driver.find_element(By.NAME, "password")

        # Llena los campos con los datos de prueba
        email_input.send_keys("juan.perez@examples.com")
        password_input.send_keys("12345")

        # Espera antes de enviar los datos (opcional)
        time.sleep(5)  # Espera 1 segundo antes de enviar la contraseña

        # Enviar los datos
        password_input.send_keys(Keys.RETURN)

        # Espera para que la página procese el inicio de sesión y muestre el mensaje de éxito
        time.sleep(10)  # Espera 3 segundos para ver el mensaje de éxito

         # Verifica si el inicio de sesión fue exitoso buscando en el contenedor de mensajes flash
        success_message = driver.find_element(By.CLASS_NAME, "alert-info")
        assert "Inicio de sesión exitoso" in success_message.text

    except Exception as e:
        print(f"Error: {e}")
    
    finally:
        driver.quit()

def test_register():
    driver = webdriver.Chrome()

    # Abre la página
    driver.get("http://127.0.0.1:3000/")

    # Espera explícita para asegurarse de que la página ha cargado completamente
    time.sleep(3)  # Espera 3 segundos para que la página cargue

    try:
        # Hacemos clic en el enlace para abrir el modal, usando el XPath con 'contains'
        login_button = driver.find_element(By.XPATH, "//a[contains(text(),'LOGIN')]")
        login_button.click()

         # Hacemos clic en el enlace para abrir el modal
        login_button = driver.find_element(By.XPATH, "//a[@onclick=\"showModal('register')\"]")
        login_button.click()

        # Espera para que el modal de registro cargue
        time.sleep(2)

        # Encuentra los campos de entrada para los datos del registro
        name_input = driver.find_element(By.ID, "nombres")
        postal_code_input = driver.find_element(By.ID, "codigo-postal")
        prefix_input = driver.find_element(By.ID, "prefijo")
        role_select = driver.find_element(By.ID, "rol")
        password_input = driver.find_element(By.ID, "passwords")
        email_input = driver.find_element(By.ID, "email")
        address_input = driver.find_element(By.ID, "direccions")
        phone_input = driver.find_element(By.ID, "telefonos")
        country_input = driver.find_element(By.ID, "pais")
        confirm_password_input = driver.find_element(By.ID, "confirm-password")

        # Llena los campos con los datos de prueba
        name_input.send_keys("Juan Perez")
        postal_code_input.send_keys("12345")
        prefix_input.send_keys("57")
        role_select.send_keys(Keys.ARROW_DOWN)  # Selecciona el rol "Usuario"
        password_input.send_keys("12345")
        email_input.send_keys("juan.perez@examples.com")
        address_input.send_keys("Calle Ficticia 123")
        phone_input.send_keys("3001234567")
        country_input.send_keys("Colombia")
        confirm_password_input.send_keys("12345")

        # Espera antes de enviar los datos (opcional)
        time.sleep(10)  # Espera 1 segundo antes de enviar el formulario

        # Envía el formulario
        confirm_password_input.send_keys(Keys.RETURN)

        # Espera para que la página procese el registro y muestre el mensaje de éxito
        time.sleep(10)  # Espera 3 segundos para ver el mensaje de éxito

        # Verifica si el registro fue exitoso buscando el mensaje de éxito
        success_message = driver.find_element(By.CLASS_NAME, "alert-info")
        assert "Registro exitoso" in success_message.text



    except Exception as e:
        print(f"Error: {e}")

    finally:
        driver.quit()

# Ejecuta la prueba de registro
test_register()

test_login()
