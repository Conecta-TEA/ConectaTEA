// Script para testar recuperação de senha
const db = require('./config/database-sqlite');

console.log('\n📊 Verificando usuários cadastrados...\n');

try {
    const usuarios = db.prepare('SELECT id, nome, email FROM usuarios LIMIT 5').all();
    
    if (usuarios.length === 0) {
        console.log('⚠️  Nenhum usuário cadastrado ainda.');
        console.log('\n💡 Para testar a recuperação de senha:');
        console.log('1. Cadastre-se em: http://localhost:5500/cadastro.html');
        console.log('2. Use um email REAL para receber o código OTP');
        console.log('3. Depois teste a recuperação em: http://localhost:5500/esqueci-senha.html\n');
    } else {
        console.log(`✅ ${usuarios.length} usuário(s) encontrado(s):\n`);
        
        usuarios.forEach((u, i) => {
            console.log(`${i + 1}. Nome: ${u.nome}`);
            console.log(`   Email: ${u.email}`);
            console.log(`   ID: ${u.id}\n`);
        });

        console.log('🔐 Para testar a recuperação de senha:');
        console.log('1. Abra: http://localhost:5500/login.html');
        console.log('2. Clique em "Esqueci minha senha"');
        console.log('3. Digite um dos emails acima');
        console.log('4. Verifique sua caixa de entrada (e spam!)');
        console.log('5. Use o código de 6 dígitos para redefinir a senha\n');
    }

    // Verificar OTPs pendentes
    const otps = db.prepare(`
        SELECT email, codigo, tipo, 
               CASE 
                   WHEN expira_em > datetime('now') THEN 'Válido'
                   ELSE 'Expirado'
               END as status
        FROM otp_codes 
        WHERE usado = 0 
        ORDER BY criado_em DESC 
        LIMIT 5
    `).all();

    if (otps.length > 0) {
        console.log('📧 Códigos OTP pendentes:\n');
        otps.forEach((otp, i) => {
            console.log(`${i + 1}. Email: ${otp.email}`);
            console.log(`   Código: ${otp.codigo}`);
            console.log(`   Tipo: ${otp.tipo}`);
            console.log(`   Status: ${otp.status}\n`);
        });
    }

} catch (error) {
    console.error('❌ Erro ao consultar banco:', error);
}

process.exit(0);
