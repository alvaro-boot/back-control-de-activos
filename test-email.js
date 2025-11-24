// Script de prueba para verificar el envío de emails con Gmail
const nodemailer = require('nodemailer');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// Cargar configuración
const configPath = path.join(__dirname, 'config.yaml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

const emailConfig = config.email;

console.log('📧 Configuración de Email:');
console.log('Provider:', emailConfig.provider);
console.log('User:', emailConfig.user);
console.log('Password length:', emailConfig.password?.length || 0);
console.log('Password (primeros 4 chars):', emailConfig.password?.substring(0, 4) || 'N/A');
console.log('From:', emailConfig.from);
console.log('FromName:', emailConfig.fromName);
console.log('');
console.log('⚠️  IMPORTANTE: Las App Passwords de Google tienen 16 caracteres.');
console.log('   Si tu contraseña tiene menos, está incompleta.\n');

// Crear transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailConfig.user,
    pass: emailConfig.password,
  },
});

async function testEmail() {
  try {
    console.log('🔍 Verificando conexión con Gmail...');
    await transporter.verify();
    console.log('✅ Conexión verificada exitosamente!\n');

    console.log('📤 Enviando email de prueba...');
    const info = await transporter.sendMail({
      from: `"${emailConfig.fromName}" <${emailConfig.from}>`,
      to: emailConfig.user, // Enviar a sí mismo para prueba
      subject: 'Prueba de Email - Sistema de Control de Activos',
      html: `
        <h2>Email de Prueba</h2>
        <p>Si recibes este email, la configuración de Gmail está funcionando correctamente.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</p>
      `,
      text: 'Si recibes este email, la configuración de Gmail está funcionando correctamente.',
    });

    console.log('✅ Email enviado exitosamente!');
    console.log('Message ID:', info.messageId);
    console.log('\n📬 Revisa tu bandeja de entrada en:', emailConfig.user);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nDetalles del error:');
    console.error(error);
    
    if (error.code === 'EAUTH') {
      console.error('\n💡 Solución:');
      console.error('1. Verifica que la App Password sea correcta');
      console.error('2. Asegúrate de que la verificación en 2 pasos esté activada');
      console.error('3. Genera una nueva App Password en: https://myaccount.google.com/apppasswords');
    }
  }
}

testEmail();

