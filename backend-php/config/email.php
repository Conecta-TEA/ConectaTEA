<?php
/**
 * ConectaTEA - Configuração de Email (OTP)
 * Usa PHPMailer para enviar códigos de verificação
 */

// Instale o PHPMailer via Composer:
// composer require phpmailer/phpmailer

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Configurações de email (AJUSTE COM SUAS CREDENCIAIS)
define('EMAIL_HOST', 'smtp.gmail.com');
define('EMAIL_PORT', 587);
define('EMAIL_USER', 'matheuslucindo904@gmail.com');  // Seu email
define('EMAIL_PASS', 'SUA_SENHA_APP_GMAIL');  // Senha de app do Gmail
define('EMAIL_FROM', 'matheuslucindo904@gmail.com');
define('EMAIL_NAME', 'ConectaTEA');

/**
 * Enviar email com código OTP
 */
function enviarOTP($destinatario, $nomeDestinatario, $codigoOTP, $tipo = 'verificacao') {
    require '../vendor/autoload.php';  // Carrega PHPMailer
    
    $mail = new PHPMailer(true);
    
    try {
        // Configurações do servidor
        $mail->isSMTP();
        $mail->Host = EMAIL_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = EMAIL_USER;
        $mail->Password = EMAIL_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = EMAIL_PORT;
        $mail->CharSet = 'UTF-8';
        
        // Remetente
        $mail->setFrom(EMAIL_FROM, EMAIL_NAME);
        
        // Destinatário
        $mail->addAddress($destinatario, $nomeDestinatario);
        
        // Conteúdo do email
        $mail->isHTML(true);
        
        // Assunto baseado no tipo
        switch($tipo) {
            case 'login':
                $assunto = 'Seu Código de Acesso - ConectaTEA';
                $mensagem = 'Use este código para fazer login';
                break;
            case 'recuperacao':
                $assunto = 'Recuperação de Senha - ConectaTEA';
                $mensagem = 'Use este código para redefinir sua senha';
                break;
            default:
                $assunto = 'Bem-vindo ao ConectaTEA - Verifique seu Email';
                $mensagem = 'Use este código para ativar sua conta';
        }
        
        $mail->Subject = $assunto;
        $mail->Body = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;'>
                <h1 style='color: white; margin: 0;'>ConectaTEA</h1>
            </div>
            <div style='background: white; padding: 40px; border: 1px solid #e0e0e0;'>
                <h2 style='color: #333;'>Olá, {$nomeDestinatario}!</h2>
                <p style='color: #666; font-size: 16px;'>{$mensagem}:</p>
                <div style='background: #f5f5f5; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;'>
                    <h1 style='color: #667eea; font-size: 48px; letter-spacing: 10px; margin: 0;'>{$codigoOTP}</h1>
                </div>
                <p style='color: #999; font-size: 14px;'>Este código expira em 10 minutos.</p>
                <p style='color: #999; font-size: 14px;'>Se você não solicitou este código, ignore este email.</p>
            </div>
            <div style='background: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;'>
                <p style='color: #999; font-size: 12px; margin: 0;'>© " . date('Y') . " ConectaTEA. Todos os direitos reservados.</p>
            </div>
        </div>
        ";
        
        $mail->send();
        return true;
        
    } catch (Exception $e) {
        error_log("Erro ao enviar email: " . $mail->ErrorInfo);
        return false;
    }
}

/**
 * Gerar código OTP de 6 dígitos
 */
function gerarCodigoOTP() {
    return str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
}

?>
