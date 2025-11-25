// seed-forum.js - Popular fórum com posts de exemplo
const db = require('./config/database-sqlite');

const postsExemplo = [
    {
        titulo: 'Dicas para lidar com crises sensoriais',
        conteudo: 'Gostaria de compartilhar algumas estratégias que funcionam muito bem com meu filho durante crises sensoriais. Primeiro, sempre tento identificar o gatilho (luz, som, textura). Depois, levo para um ambiente calmo e uso técnicas de respiração profunda. Alguém mais tem dicas?',
        categoria: 'Dicas',
        tags: 'sensorial, crises, estratégias',
        autor_id: 1
    },
    {
        titulo: 'Como foi o diagnóstico do seu filho?',
        conteudo: 'Olá pessoal! Estou no processo de avaliação do meu filho de 3 anos e gostaria de saber como foi a experiência de vocês. Quanto tempo levou? Quais profissionais procuraram primeiro? Qualquer informação ajuda muito!',
        categoria: 'Duvidas',
        tags: 'diagnóstico, avaliação, início',
        autor_id: 1
    },
    {
        titulo: 'Conquista da semana: primeira palavra! 🎉',
        conteudo: 'Estou tão emocionada que preciso compartilhar! Depois de 2 anos de fonoterapia, meu filho falou a primeira palavra hoje: "mamãe". Não desistam, cada criança tem seu tempo. Acreditem no potencial dos seus filhos!',
        categoria: 'Relatos',
        tags: 'conquista, fala, fonoterapia',
        autor_id: 1
    },
    {
        titulo: 'Lista de livros sobre TEA para pais',
        conteudo: 'Montei uma lista de livros que me ajudaram muito:\n\n1. "O Cérebro Autista" - Temple Grandin\n2. "Convivendo com Autismo e Síndrome de Asperger" - Chris Williams\n3. "Mundo Singular" - Ana Beatriz Barbosa Silva\n\nAlguém tem outras recomendações?',
        categoria: 'Recursos',
        tags: 'livros, leitura, conhecimento',
        autor_id: 1
    },
    {
        titulo: 'Experiência com ABA - vale a pena?',
        conteado: 'Meu filho começou a terapia ABA há 3 meses e estamos vendo resultados incríveis! Ele está mais comunicativo, menos agitado e aprendendo coisas novas todos os dias. Alguém mais tem experiência com essa terapia?',
        categoria: 'Terapias',
        tags: 'ABA, terapia, resultados',
        autor_id: 1
    },
    {
        titulo: 'Grupo de apoio para mães - vamos nos apoiar?',
        conteudo: 'Criei esse post para conectar mães que estão passando pelos mesmos desafios. Às vezes só precisamos desabafar com quem realmente entende. Vamos trocar experiências, dicas e principalmente, apoio emocional!',
        categoria: 'Suporte',
        tags: 'apoio, mães, comunidade',
        autor_id: 1
    },
    {
        titulo: 'Inclusão escolar - sua experiência?',
        conteudo: 'Estou pesquisando escolas para meu filho e queria saber: como tem sido a experiência de vocês com inclusão? A escola está preparada? Tem mediador? Compartilhem suas histórias, boas e ruins!',
        categoria: 'Duvidas',
        tags: 'escola, inclusão, educação',
        autor_id: 1
    }
];

const respostasExemplo = [
    {
        post_id: 1,
        autor_id: 1,
        conteudo: 'Ótimas dicas! Aqui em casa também usamos fones com cancelamento de ruído quando vamos a lugares barulhentos. Ajuda muito!'
    },
    {
        post_id: 2,
        autor_id: 1,
        conteudo: 'O diagnóstico do meu filho levou cerca de 6 meses. Começamos com neuropediatra, depois psicóloga e fonoaudióloga. Paciência é essencial nesse processo!'
    },
    {
        post_id: 3,
        autor_id: 1,
        conteudo: 'Parabéns! Que emoção! Essas conquistas são tão especiais. Continuem firmes na terapia! 💙'
    }
];

console.log('🌱 Populando fórum com posts de exemplo...');

try {
    // Limpar posts existentes (apenas para desenvolvimento)
    // db.prepare('DELETE FROM forum_respostas').run();
    // db.prepare('DELETE FROM forum_posts').run();

    // Inserir posts
    postsExemplo.forEach(post => {
        try {
            db.prepare(`
                INSERT INTO forum_posts (autor_id, titulo, conteudo, categoria, tags)
                VALUES (?, ?, ?, ?, ?)
            `).run(post.autor_id, post.titulo, post.conteudo, post.categoria, post.tags);
            console.log(`✅ Post criado: ${post.titulo}`);
        } catch (error) {
            console.log(`ℹ️  Post já existe: ${post.titulo}`);
        }
    });

    // Inserir respostas
    respostasExemplo.forEach(resposta => {
        try {
            db.prepare(`
                INSERT INTO forum_respostas (post_id, autor_id, conteudo)
                VALUES (?, ?, ?)
            `).run(resposta.post_id, resposta.autor_id, resposta.conteudo);
            console.log(`✅ Resposta adicionada ao post ${resposta.post_id}`);
        } catch (error) {
            console.log(`ℹ️  Resposta já existe no post ${resposta.post_id}`);
        }
    });

    console.log('');
    console.log('✨ Fórum populado com sucesso!');
    console.log('📊 Total de posts:', db.prepare('SELECT COUNT(*) as count FROM forum_posts').get().count);
    console.log('💬 Total de respostas:', db.prepare('SELECT COUNT(*) as count FROM forum_respostas').get().count);

} catch (error) {
    console.error('❌ Erro ao popular fórum:', error);
}
