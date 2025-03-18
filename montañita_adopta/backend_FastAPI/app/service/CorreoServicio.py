# Importar los módulos necesarios
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart



# Configurar los datos del servidor SMTP
email_user = 'tu_correo@gmail.com'  # Cambiar por tu correo electrónico
email_password = 'tu_contraseña'    # Cambiar por tu contraseña
email_send = 'destinatario@example.com'  # Cambiar por el correo del destinatario

# Función para enviar correo
def enviar_correo(correo):
    # Configurar el mensaje
    msg = MIMEMultipart()
    msg['From'] = correo.sender
    msg['To'] = email_send
    msg['Subject'] = correo.subject
    msg.attach(MIMEText(correo.msg_body, 'plain'))

    # Iniciar la conexión con el servidor SMTP de Gmail
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(email_user, email_password)
        text = msg.as_string()
        server.sendmail(email_user, email_send, text)
        server.quit()
        return "Correo enviado"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"No se pudo enviar el correo: {str(e)}")




