const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurar transporte de email
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true para 465, false para outras portas
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verificar configuração
transporter.verify(function(error, success) {
    if (error) {
        console.log('❌ Erro na configuração de email:', error);
    } else {
        console.log('✅ Servidor de email pronto');
    }
});

// Função para enviar email com código OTP
async function enviarEmailOTP(email, codigo, tipo, nome) {
    let assunto, mensagem;

    switch(tipo) {
        case 'verificacao':
            assunto = '🔐 Código de Verificação - ConectaTEA';
            mensagem = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);">
                    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                                <span style="color: white; font-size: 30px;">🧩</span>
                            </div>
                            <h1 style="color: #a855f7; margin: 0;">ConectaTEA</h1>
                            <p style="color: #718096; margin: 5px 0 0 0;">Apoio para famílias</p>
                        </div>
                        
                        <h2 style="color: #2d3748; margin-bottom: 20px;">Olá${nome ? ', ' + nome : ''}!</h2>
                        
                        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                            Use o código abaixo para verificar seu email e ativar sua conta:
                        </p>
                        
                        <div style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
                            <p style="color: white; font-size: 14px; margin: 0 0 10px 0; opacity: 0.9;">Seu código de verificação</p>
                            <h1 style="color: white; font-size: 48px; letter-spacing: 10px; margin: 0; font-weight: bold;">${codigo}</h1>
                        </div>
                        
                        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="color: #92400e; margin: 0; font-size: 14px;">
                                <strong>⚠️ Importante:</strong> Este código expira em 10 minutos e só pode ser usado uma vez.
                            </p>
                        </div>
                        
                        <p style="color: #718096; font-size: 14px; margin-top: 30px;">
                            Se você não solicitou este código, por favor ignore este email.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                        
                        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                            © 2025 ConectaTEA - Todos os direitos reservados
                        </p>
                    </div>
                </div>
            `;
            break;

        case 'login':
            assunto = '🔑 Código de Login - ConectaTEA';
            mensagem = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);">
                    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                                <span style="color: white; font-size: 30px;">🧩</span>
                            </div>
                            <h1 style="color: #a855f7; margin: 0;">ConectaTEA</h1>
                        </div>
                        
                        <h2 style="color: #2d3748; margin-bottom: 20px;">Olá${nome ? ', ' + nome : ''}!</h2>
                        
                        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                            Use o código abaixo para fazer login na sua conta:
                        </p>
                        
                        <div style="background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
                            <p style="color: white; font-size: 14px; margin: 0 0 10px 0; opacity: 0.9;">Código de acesso</p>
                            <h1 style="color: white; font-size: 48px; letter-spacing: 10px; margin: 0; font-weight: bold;">${codigo}</h1>
                        </div>
                        
                        <p style="color: #718096; font-size: 14px;">
                            Este código expira em 10 minutos.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                        
                        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                            © 2025 ConectaTEA - Todos os direitos reservados
                        </p>
                    </div>
                </div>
            `;
            break;

        case 'recuperacao':
            assunto = '🔄 Código de Recuperação - ConectaTEA';
            mensagem = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);">
                    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981 0%, #34d399 100%); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                                <span style="color: white; font-size: 30px;">🔄</span>
                            </div>
                            <h1 style="color: #a855f7; margin: 0;">ConectaTEA</h1>
                        </div>
                        
                        <h2 style="color: #2d3748; margin-bottom: 20px;">Recuperação de Senha</h2>
                        
                        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                            Use o código abaixo para redefinir sua senha:
                        </p>
                        
                        <div style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
                            <p style="color: white; font-size: 14px; margin: 0 0 10px 0; opacity: 0.9;">Código de recuperação</p>
                            <h1 style="color: white; font-size: 48px; letter-spacing: 10px; margin: 0; font-weight: bold;">${codigo}</h1>
                        </div>
                        
                        <p style="color: #718096; font-size: 14px;">
                            Este código expira em 10 minutos.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                        
                        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                            © 2025 ConectaTEA - Todos os direitos reservados
                        </p>
                    </div>
                </div>
            `;
            break;
    }

    const mailOptions = {
        from: `"ConectaTEA" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: assunto,
        html: mensagem
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        return false;
    }
}

module.exports = {
    transporter,
    enviarEmailOTP
};
