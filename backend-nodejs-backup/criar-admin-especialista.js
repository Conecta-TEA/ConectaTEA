// Script para criar usuário especialista master admin
const db = require('./config/database-sqlite');
const bcrypt = require('bcryptjs');

console.log('🔧 Criando usuário especialista master admin...\n');

try {
    // Verificar se já existe
    const usuarioExistente = db.prepare('SELECT id FROM usuarios WHERE email = ?').get('admin@especialista.com');
    
    if (usuarioExistente) {
        console.log('⚠️  Usuário admin@especialista.com já existe!');
        console.log('📧 Email: admin@especialista.com');
        console.log('🔑 Senha: admin123\n');
        db.close();
        process.exit(0);
    }
    
    // Criar senha hash
    const senhaHash = bcrypt.hashSync('admin123', 10);
    
    // Inserir usuário especialista
    const result = db.prepare(`
        INSERT INTO usuarios (
            nome, 
            email, 
            senha, 
            telefone,
            data_nascimento,
            tipo_usuario, 
            email_verificado, 
            status,
            especialidade,
            registro_profissional,
            descricao_profissional,
            valor_consulta,
            aprovado
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        'Dr. Admin Master',
        'admin@especialista.com',
        senhaHash,
        '(11) 99999-9999',
        '1980-01-01',
        'especialista',
        1,
        'ativo',
        'Psicologia Clínica e TEA',
        'CRP 06/123456',
        'Especialista Master em Transtorno do Espectro Autista com mais de 20 anos de experiência. Coordenador da equipe de especialistas do ConectaTEA.',
        250.00,
        1
    );
    
    console.log('✅ Usuário especialista criado com sucesso!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 CREDENCIAIS DO ESPECIALISTA MASTER ADMIN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@especialista.com');
    console.log('🔑 Senha: admin123');
    console.log('👨‍⚕️  Nome: Dr. Admin Master');
    console.log('🎓 Especialidade: Psicologia Clínica e TEA');
    console.log('📋 Registro: CRP 06/123456');
    console.log('💰 Valor Consulta: R$ 250,00');
    console.log('✅ Email Verificado: Sim');
    console.log('✅ Aprovado: Sim');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔗 Acesse: http://localhost:3000/login.html');
    console.log('📌 Após login, será redirecionado para: http://localhost:3000/especialista-dashboard.html\n');
    
} catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
    process.exit(1);
}

db.close();
