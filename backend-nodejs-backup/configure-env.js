// configure-env.js - Script interativo para configurar .env
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const envPath = path.join(__dirname, '.env');

console.log('\n🔧 Configuração do ConectaTEA\n');
console.log('Este script vai ajudá-lo a configurar o arquivo .env\n');

// Função para fazer perguntas
function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function configure() {
    try {
        // 1. Senha do MySQL
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('1️⃣  MYSQL DATABASE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const dbPassword = await question('Digite a senha do MySQL (ou deixe vazio se não tiver): ');
        
        // 2. Email (opcional)
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('2️⃣  EMAIL (Gmail para envio de códigos OTP)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('ℹ️  Para gerar senha de app: https://myaccount.google.com/apppasswords\n');
        
        const configEmail = await question('Deseja configurar email agora? (s/n): ');
        
        let emailUser = 'seu-email@gmail.com';
        let emailPassword = 'sua-senha-de-app';
        
        if (configEmail.toLowerCase() === 's') {
            emailUser = await question('Email Gmail: ');
            emailPassword = await question('Senha de App Gmail: ');
        } else {
            console.log('⚠️  Email não configurado. Sistema de OTP não funcionará.');
        }

        // 3. JWT Secret
        const jwtSecret = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        
        // Criar conteúdo do .env
        const envContent = `# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações do Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=${dbPassword}
DB_NAME=conectatea
DB_PORT=3306

# JWT Secret
JWT_SECRET=${jwtSecret}

# Configurações de Email (usando Gmail como exemplo)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=${emailUser}
EMAIL_PASSWORD=${emailPassword}

# URL do Frontend
FRONTEND_URL=http://localhost:5500
`;

        // Salvar arquivo
        fs.writeFileSync(envPath, envContent);
        
        console.log('\n✅ Arquivo .env configurado com sucesso!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 PRÓXIMOS PASSOS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('1. Criar banco de dados:');
        console.log('   node setup-database.js\n');
        console.log('2. Iniciar servidor:');
        console.log('   npm start\n');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        rl.close();
    }
}

configure();
