<?php
/**
 * ConectaTEA - API de Login (Solicitar OTP)
 * POST /api/login.php
 */

require_once '../config/database.php';
require_once '../config/email.php';
require_once '../includes/functions.php';

configurarCORS();

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Método não permitido');
}

// Pegar dados do POST
$data = json_decode(file_get_contents('php://input'), true);

$email = isset($data['email']) ? sanitizar($data['email']) : null;

if (!$email) {
    jsonResponse(false, 'Email é obrigatório');
}

// Validar email
if (!validarEmail($email)) {
    jsonResponse(false, 'Email inválido');
}

// Conectar ao banco
$conn = getConnection();

// Verificar se usuário existe
$stmt = $conn->prepare("SELECT id, nome, email_verificado FROM usuarios WHERE email = ? AND status = 'ativo'");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    jsonResponse(false, 'Usuário não encontrado');
}

$usuario = $result->fetch_assoc();
$stmt->close();

// Verificar se email está verificado
if (!$usuario['email_verificado']) {
    jsonResponse(false, 'Email não verificado. Verifique seu email primeiro.');
}

// Gerar código OTP para login
$codigoOTP = gerarCodigoOTP();
$expiraEm = date('Y-m-d H:i:s', strtotime('+10 minutes'));
$ipAddress = $_SERVER['REMOTE_ADDR'];
$userAgent = $_SERVER['HTTP_USER_AGENT'];

$stmt = $conn->prepare("
    INSERT INTO otp_codes (email, codigo, tipo, expira_em, ip_address, user_agent)
    VALUES (?, ?, 'login', ?, ?, ?)
");
$stmt->bind_param("sssss", $email, $codigoOTP, $expiraEm, $ipAddress, $userAgent);
$stmt->execute();
$stmt->close();

$conn->close();

// Enviar email com código OTP
$emailEnviado = enviarOTP($email, $usuario['nome'], $codigoOTP, 'login');

if (!$emailEnviado) {
    jsonResponse(false, 'Erro ao enviar código de acesso');
}

// Retornar sucesso
jsonResponse(true, 'Código de acesso enviado para seu email!', [
    'email' => $email
]);

?>
