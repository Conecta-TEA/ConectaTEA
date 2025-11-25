// test-mysql-password.js - Testa senhas comuns do MySQL
const mysql = require('mysql2/promise');

const senhasComuns = [
    '',           // Sem senha
    'root',       // Senha padrão
    'admin',      // Admin
    'password',   // Password
    '123456',     // Numérica
    'mysql',      // MySQL
    'toor',       // Root invertido
    'P@ssw0rd',   // Password com variação
];

async function testarSenhas() {
    console.log('\n🔍 Testando senhas comuns do MySQL...\n');
    
    for (let i = 0; i < senhasComuns.length; i++) {
        const senha = senhasComuns[i];
        const senhaDisplay = senha === '' ? '(vazia)' : senha;
        
        try {
            process.stdout.write(`${i + 1}. Testando senha: ${senhaDisplay}... `);
            
            const connection = await mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: senha,
                port: 3306
            });
            
            console.log('✅ FUNCIONOU!');
            console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`🎉 SENHA ENCONTRADA: ${senhaDisplay}`);
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
            console.log(`Configure no arquivo .env:`);
            console.log(`DB_PASSWORD=${senha}\n`);
            
            await connection.end();
            process.exit(0);
            
        } catch (error) {
            console.log('❌');
        }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Nenhuma senha comum funcionou');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Opções:');
    console.log('1. Veja o arquivo MYSQL_PASSWORD.md para resetar a senha');
    console.log('2. Lembre-se da senha que você definiu na instalação');
    console.log('3. Use o MySQL Workbench para conectar e descobrir\n');
}

testarSenhas().catch(error => {
    console.error('Erro:', error.message);
    process.exit(1);
});
