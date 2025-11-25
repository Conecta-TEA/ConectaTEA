<?php
/**
 * ConectaTEA - API de Cadastro
 * POST /api/cadastro.php
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

// Validar dados obrigatórios
$nome = isset($data['nome']) ? sanitizar($data['nome']) : null;
$email = isset($data['email']) ? sanitizar($data['email']) : null;
$senha = isset($data['senha']) ? $data['senha'] : null;
$tipo_usuario = isset($data['tipo_usuario']) ? sanitizar($data['tipo_usuario']) : 'paciente';

if (!$nome || !$email || !$senha) {
    jsonResponse(false, 'Nome, email e senha são obrigatórios');
}

// Validar email
if (!validarEmail($email)) {
    jsonResponse(false, 'Email inválido');
}

// Validar senha (mínimo 6 caracteres)
if (strlen($senha) < 6) {
    jsonResponse(false, 'Senha deve ter no mínimo 6 caracteres');
}

// Conectar ao banco
$conn = getConnection();

// Verificar se email já existe
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    jsonResponse(false, 'Email já cadastrado');
}
$stmt->close();

// Hashear senha
$senhaHash = hashSenha($senha);

// Inserir usuário
$stmt = $conn->prepare("
    INSERT INTO usuarios (nome, email, senha, tipo_usuario, telefone, email_verificado, status)
    VALUES (?, ?, ?, ?, ?, FALSE, 'ativo')
");

$telefone = isset($data['telefone']) ? sanitizar($data['telefone']) : null;

$stmt->bind_param("sssss", $nome, $email, $senhaHash, $tipo_usuario, $telefone);

if (!$stmt->execute()) {
    jsonResponse(false, 'Erro ao criar usuário');
}

$usuarioId = $conn->insert_id;
$stmt->close();

// Se for especialista, criar registro na tabela especialistas
if ($tipo_usuario === 'especialista') {
    $especialidade = isset($data['especialidade']) ? sanitizar($data['especialidade']) : 'Psicologia';
    $registro_profissional = isset($data['registro_profissional']) ? sanitizar($data['registro_profissional']) : null;
    
    $stmt = $conn->prepare("
        INSERT INTO especialistas (usuario_id, especialidade, registro_profissional)
        VALUES (?, ?, ?)
    ");
    $stmt->bind_param("iss", $usuarioId, $especialidade, $registro_profissional);
    $stmt->execute();
    $stmt->close();
}

// Gerar código OTP para verificação de email
$codigoOTP = gerarCodigoOTP();
$expiraEm = date('Y-m-d H:i:s', strtotime('+10 minutes'));
$ipAddress = $_SERVER['REMOTE_ADDR'];
$userAgent = $_SERVER['HTTP_USER_AGENT'];

$stmt = $conn->prepare("
    INSERT INTO otp_codes (email, codigo, tipo, expira_em, ip_address, user_agent)
    VALUES (?, ?, 'verificacao', ?, ?, ?)
");
$stmt->bind_param("sssss", $email, $codigoOTP, $expiraEm, $ipAddress, $userAgent);
$stmt->execute();
$stmt->close();

$conn->close();

// Enviar email com código OTP
$emailEnviado = enviarOTP($email, $nome, $codigoOTP, 'verificacao');

if (!$emailEnviado) {
    jsonResponse(false, 'Usuário criado mas erro ao enviar email de verificação');
}

// Retornar sucesso
jsonResponse(true, 'Cadastro realizado com sucesso! Verifique seu email.', [
    'usuario_id' => $usuarioId,
    'email' => $email,
    'tipo_usuario' => $tipo_usuario,
    'requer_verificacao' => true
]);

?>
