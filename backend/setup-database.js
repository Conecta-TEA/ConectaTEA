// setup-database.js - Script para criar o banco de dados automaticamente
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    console.log('🔧 Iniciando configuração do banco de dados...\n');

    // Conectar ao MySQL sem especificar o banco (para criar o banco)
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306
        });

        console.log('✓ Conectado ao MySQL');

        // Criar banco de dados se não existir
        const dbName = process.env.DB_NAME || 'conectatea';
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`✓ Banco de dados "${dbName}" criado/verificado`);

        // Usar o banco de dados
        await connection.query(`USE ${dbName}`);
        console.log(`✓ Usando banco de dados "${dbName}"`);

        // Ler e executar o arquivo database.sql
        const sqlPath = path.join(__dirname, 'database.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Dividir em comandos individuais (separados por ;)
        const commands = sql
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

        console.log(`\n📝 Executando ${commands.length} comandos SQL...\n`);

        let successCount = 0;
        for (const command of commands) {
            try {
                await connection.query(command);
                
                // Extrair nome da tabela ou operação
                const match = command.match(/CREATE TABLE IF NOT EXISTS `?(\w+)`?|INSERT INTO `?(\w+)`?/i);
                if (match) {
                    const tableName = match[1] || match[2];
                    const operation = command.startsWith('INSERT') ? 'Dados inseridos em' : 'Tabela criada';
                    console.log(`  ✓ ${operation}: ${tableName}`);
                }
                successCount++;
            } catch (error) {
                console.error(`  ✗ Erro ao executar comando:`, error.message);
            }
        }

        console.log(`\n✓ ${successCount}/${commands.length} comandos executados com sucesso`);

        // Verificar tabelas criadas
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`\n📊 Tabelas no banco de dados (${tables.length}):`);
        tables.forEach((table, index) => {
            const tableName = Object.values(table)[0];
            console.log(`  ${index + 1}. ${tableName}`);
        });

        console.log('\n🎉 Configuração do banco de dados concluída com sucesso!\n');

    } catch (error) {
        console.error('\n❌ Erro ao configurar banco de dados:', error.message);
        console.error('\n⚠️  Verifique:');
        console.error('   1. MySQL está rodando');
        console.error('   2. Credenciais no arquivo .env estão corretas');
        console.error('   3. Usuário tem permissão para criar bancos de dados\n');
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Executar setup
setupDatabase().catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
});
