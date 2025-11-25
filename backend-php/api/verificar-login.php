<?php
/**
 * ConectaTEA - API de Verificar OTP de Login
 * POST /api/verificar-login.php
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
    AND tipo = 'login'
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

// Buscar dados completos do usuário
$stmt = $conn->prepare("
    SELECT u.id, u.nome, u.email, u.tipo_usuario, u.telefone, u.foto_perfil,
           e.especialidade, e.registro_profissional
    FROM usuarios u
    LEFT JOIN especialistas e ON u.id = e.usuario_id
    WHERE u.email = ?
");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$usuario = $result->fetch_assoc();
$stmt->close();

// Criar sessão
$token = gerarToken($usuario['id']);
$expiraEm = date('Y-m-d H:i:s', strtotime('+7 days'));
$ipAddress = $_SERVER['REMOTE_ADDR'];
$userAgent = $_SERVER['HTTP_USER_AGENT'];

$stmt = $conn->prepare("
    INSERT INTO sessoes (usuario_id, token, expira_em, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?)
");
$stmt->bind_param("issss", $usuario['id'], $token, $expiraEm, $ipAddress, $userAgent);
$stmt->execute();
$stmt->close();

$conn->close();

// Retornar sucesso
jsonResponse(true, 'Login realizado com sucesso!', [
    'token' => $token,
    'usuario' => $usuario
]);

?>
