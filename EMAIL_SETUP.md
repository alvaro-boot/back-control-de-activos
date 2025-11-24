# Configuración de Email

El sistema de envío de correos está implementado usando **Nodemailer** con soporte para múltiples proveedores gratuitos.

## 🚀 Modo Desarrollo (Automático)

En modo desarrollo, el sistema usa **Ethereal Email** automáticamente sin necesidad de configuración. Los emails se generan y puedes verlos en: https://ethereal.email

**No necesitas configurar nada** - simplemente inicia el servidor y los emails funcionarán.

## 📧 Opciones para Producción

### 1. Gmail (Gratis)

**Límite:** 500 emails/día

**Pasos:**
1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Activa la verificación en 2 pasos
3. Genera una "App Password": https://myaccount.google.com/apppasswords
4. Configura en `config.yaml`:

```yaml
email:
  provider: "gmail"
  user: "tu-email@gmail.com"
  password: "tu-app-password-de-16-caracteres"
  from: "noreply@tudominio.com"
  fromName: "Sistema de Control de Activos"
```

### 2. Resend (Recomendado - Gratis)

**Límite:** 3,000 emails/mes gratis

**Pasos:**
1. Regístrate en: https://resend.com
2. Crea un API Key en: https://resend.com/api-keys
3. Configura en `config.yaml`:

```yaml
email:
  provider: "resend"
  apiKey: "re_xxxxxxxxxxxxx"
  from: "noreply@tudominio.com"
  fromName: "Sistema de Control de Activos"
```

### 3. SendGrid (Gratis)

**Límite:** 100 emails/día gratis

**Pasos:**
1. Regístrate en: https://sendgrid.com
2. Crea un API Key
3. Configura en `config.yaml`:

```yaml
email:
  provider: "smtp"
  host: "smtp.sendgrid.net"
  port: 587
  secure: false
  user: "apikey"
  password: "tu-api-key-de-sendgrid"
  from: "noreply@tudominio.com"
  fromName: "Sistema de Control de Activos"
```

### 4. Mailgun (Gratis)

**Límite:** 5,000 emails/mes gratis (primeros 3 meses)

**Pasos:**
1. Regístrate en: https://www.mailgun.com
2. Obtén tus credenciales SMTP
3. Configura en `config.yaml`:

```yaml
email:
  provider: "smtp"
  host: "smtp.mailgun.org"
  port: 587
  secure: false
  user: "postmaster@tudominio.mailgun.org"
  password: "tu-password-de-mailgun"
  from: "noreply@tudominio.com"
  fromName: "Sistema de Control de Activos"
```

### 5. SMTP Personalizado

Si tienes tu propio servidor SMTP:

```yaml
email:
  provider: "smtp"
  host: "smtp.tudominio.com"
  port: 587
  secure: false  # true para puerto 465
  user: "usuario@smtp.tudominio.com"
  password: "tu-contraseña"
  from: "noreply@tudominio.com"
  fromName: "Sistema de Control de Activos"
```

## 📝 Ejemplo de Configuración Completa

```yaml
# Configuración del Frontend
frontend:
  url: "https://tu-dominio.com"

# Configuración de Email
email:
  provider: "resend"  # o "gmail", "smtp"
  from: "noreply@tudominio.com"
  fromName: "Sistema de Control de Activos"
  
  # Para Resend:
  apiKey: "re_xxxxxxxxxxxxx"
  
  # Para Gmail:
  # user: "tu-email@gmail.com"
  # password: "tu-app-password"
  
  # Para SMTP personalizado:
  # host: "smtp.tudominio.com"
  # port: 587
  # secure: false
  # user: "usuario@smtp.tudominio.com"
  # password: "tu-contraseña"
```

## ✅ Verificación

Después de configurar, reinicia el servidor y solicita una recuperación de contraseña. Deberías recibir el email según el proveedor configurado.

## 🔍 Troubleshooting

- **En desarrollo:** Los emails se muestran en los logs con un enlace a Ethereal Email
- **En producción:** Verifica que las credenciales sean correctas
- **Gmail:** Asegúrate de usar una "App Password", no tu contraseña normal
- **Resend:** Verifica que el dominio esté verificado si usas un dominio personalizado

