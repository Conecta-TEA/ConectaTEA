<?php
/**
 * ConectaTEA - API de Verificação de Email (OTP)
 * POST /api/verificar-email.php
 */

require_once '../config/database.php';
require_once '../includes/functions.php';

configurarCORS();

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Método não permitido');
}

// Pegar dados do POST
$data = json_decode(file_get_contents('php://input'), true);

$email = isset($data['email']) ? sanitizar($data['email']) : null;
$codigo = isset($data['codigo']) ? sanitizar($data['codigo']) : null;

if (!$email || !$codigo) {
    jsonResponse(false, 'Email e código são obrigatórios');
}

// Conectar ao banco
$conn = getConnection();

// Buscar código OTP válido
$stmt = $conn->prepare("
    SELECT id FROM otp_codes
    WHERE email = ?
    AND codigo = ?
    AND tipo = 'verificacao'
    AND usado = FALSE
    AND expira_em > NOW()
    ORDER BY criado_em DESC
    LIMIT 1
");
$stmt->bind_param("ss", $email, $codigo);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    jsonResponse(false, 'Código inválido ou expirado');
}

$otpData = $result->fetch_assoc();
$otpId = $otpData['id'];
$stmt->close();

// Marcar código como usado
$stmt = $conn->prepare("UPDATE otp_codes SET usado = TRUE WHERE id = ?");
$stmt->bind_param("i", $otpId);
$stmt->execute();
$stmt->close();

// Marcar email como verificado
$stmt = $conn->prepare("UPDATE usuarios SET email_verificado = TRUE WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->close();

// Buscar dados do usuário
$stmt = $conn->prepare("SELECT id, nome, email, tipo_usuario FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$usuario = $result->fetch_assoc();
$stmt->close();

$conn->close();

// Gerar token de sessão
$token = gerarToken($usuario['id']);

// Retornar sucesso
jsonResponse(true, 'Email verificado com sucesso!', [
    'token' => $token,
    'usuario' => $usuario
]);

?>
