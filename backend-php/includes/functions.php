<?php
/**
 * ConectaTEA - Funções Auxiliares
 */

/**
 * Retornar resposta JSON
 */
function jsonResponse($success, $message, $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

/**
 * Validar email
 */
function validarEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

/**
 * Hashear senha (bcrypt)
 */
function hashSenha($senha) {
    return password_hash($senha, PASSWORD_BCRYPT, ['cost' => 10]);
}

/**
 * Verificar senha
 */
function verificarSenha($senha, $hash) {
    return password_verify($senha, $hash);
}

/**
 * Sanitizar string
 */
function sanitizar($string) {
    return htmlspecialchars(strip_tags(trim($string)), ENT_QUOTES, 'UTF-8');
}

/**
 * Gerar token JWT simples (para sessão)
 */
function gerarToken($usuarioId) {
    $secret = 'conectatea_secret_2024';  // Use uma chave secreta forte
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'usuario_id' => $usuarioId,
        'exp' => time() + (7 * 24 * 60 * 60)  // 7 dias
    ]);
    
    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode($payload);
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = base64UrlEncode($signature);
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function base64UrlEncode($text) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($text));
}

/**
 * Verificar token JWT
 */
function verificarToken($token) {
    $secret = 'conectatea_secret_2024';
    
    $tokenParts = explode('.', $token);
    if (count($tokenParts) !== 3) {
        return false;
    }
    
    $header = base64_decode($tokenParts[0]);
    $payload = base64_decode($tokenParts[1]);
    $signatureProvided = $tokenParts[2];
    
    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode($payload);
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = base64UrlEncode($signature);
    
    if ($base64UrlSignature !== $signatureProvided) {
        return false;
    }
    
    $payloadData = json_decode($payload, true);
    
    // Verificar expiração
    if ($payloadData['exp'] < time()) {
        return false;
    }
    
    return $payloadData['usuario_id'];
}

/**
 * Verificar autenticação (middleware)
 */
function verificarAutenticacao() {
    $headers = getallheaders();
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
    
    if (!$token) {
        jsonResponse(false, 'Token não fornecido');
    }
    
    $usuarioId = verificarToken($token);
    
    if (!$usuarioId) {
        jsonResponse(false, 'Token inválido ou expirado');
    }
    
    return $usuarioId;
}

/**
 * Configurar CORS
 */
function configurarCORS() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    
    // Responder OPTIONS (preflight)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

?>
