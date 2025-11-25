<?php
/**
 * ConectaTEA - Configuração de Banco de Dados
 * MySQL Workbench 8.0
 */

// Configurações do banco (AJUSTE CONFORME SEU AMBIENTE)
define('DB_HOST', 'localhost');      // Host do MySQL
define('DB_USER', 'root');           // Usuário do MySQL
define('DB_PASS', '');               // Senha do MySQL (deixe vazio se não tiver)
define('DB_NAME', 'conectatea');     // Nome do banco de dados
define('DB_PORT', '3306');           // Porta padrão MySQL

// Criar conexão
function getConnection() {
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
        
        // Verificar conexão
        if ($conn->connect_error) {
            throw new Exception("Erro de conexão: " . $conn->connect_error);
        }
        
        // Definir charset UTF-8
        $conn->set_charset("utf8mb4");
        
        return $conn;
        
    } catch (Exception $e) {
        die(json_encode([
            'success' => false,
            'message' => 'Erro ao conectar com banco de dados',
            'error' => $e->getMessage()
        ]));
    }
}

// Testar conexão
function testConnection() {
    $conn = getConnection();
    $result = $conn->query("SELECT 1");
    $conn->close();
    return $result !== false;
}

?>
