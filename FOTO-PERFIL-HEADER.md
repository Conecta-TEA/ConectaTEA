# Foto de Perfil no Header - Implementação

## 📸 Funcionalidade

A foto de perfil do usuário agora aparece no header da aplicação, substituindo o ícone padrão quando disponível.

---

## 🔧 Implementação

### HTML (index.html)

```html
<a href="perfil.html" class="btn-perfil" title="Meu Perfil" id="btnPerfilHeader">
    <img src="" alt="Foto de perfil" id="headerProfileImage" style="display: none;">
    <i class="fas fa-user-circle" id="headerProfileIcon"></i>
</a>
```

**Elementos:**
- `headerProfileImage` - Tag `<img>` para exibir a foto
- `headerProfileIcon` - Ícone padrão (fallback)

---

### JavaScript

```javascript
// Carregar foto de perfil no header
const headerProfileImage = document.getElementById('headerProfileImage');
const headerProfileIcon = document.getElementById('headerProfileIcon');

if (usuario.foto_perfil) {
    headerProfileImage.src = usuario.foto_perfil;
    headerProfileImage.style.display = 'block';
    headerProfileIcon.style.display = 'none';
} else {
    headerProfileImage.style.display = 'none';
    headerProfileIcon.style.display = 'block';
}
```

**Lógica:**
1. Verifica se `usuario.foto_perfil` existe no localStorage
2. Se existe: mostra a imagem e esconde o ícone
3. Se não existe: mostra o ícone e esconde a imagem

---

### CSS (styles.css)

```css
.btn-perfil {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-perfil img {
    width: 40px;
    height: 40px;
    border-radius: 50%;        /* Foto circular */
    object-fit: cover;          /* Mantém proporção */
    border: 2px solid #a855f7;  /* Borda roxa */
}

.btn-perfil:hover img {
    border-color: #9333ea;
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
}
```

**Estilos:**
- Foto circular (50% border-radius)
- Tamanho fixo: 40x40px
- Borda roxa matching o tema
- Efeito hover com sombra

---

## 📊 Dados Necessários

### LocalStorage - Objeto `usuario`

```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@example.com",
  "foto_perfil": "uploads/perfil/foto123.jpg"  // ← Campo necessário
}
```

**Campo `foto_perfil`:**
- Caminho relativo ou URL completa da imagem
- Exemplos válidos:
  - `"uploads/perfil/usuario1.jpg"`
  - `"https://example.com/images/foto.jpg"`
  - `"data:image/jpeg;base64,/9j/4AAQ..."`

---

## 🎯 Comportamento

### Quando há foto:
```
┌──────────────────┐
│   [👤 FOTO]      │  ← Imagem circular 40x40
│   João Silva     │
│   Bem-vindo(a)!  │
└──────────────────┘
```

### Quando NÃO há foto:
```
┌──────────────────┐
│   [👤 ÍCONE]     │  ← Ícone FontAwesome
│   João Silva     │
│   Bem-vindo(a)!  │
└──────────────────┘
```

---

## 🔄 Atualização Dinâmica

Para atualizar a foto após upload:

```javascript
// Após upload bem-sucedido
const usuario = JSON.parse(localStorage.getItem('usuario'));
usuario.foto_perfil = 'uploads/perfil/nova_foto.jpg';
localStorage.setItem('usuario', JSON.stringify(usuario));

// Atualizar header
document.getElementById('headerProfileImage').src = usuario.foto_perfil;
document.getElementById('headerProfileImage').style.display = 'block';
document.getElementById('headerProfileIcon').style.display = 'none';
```

---

## ✅ Checklist de Verificação

- [x] HTML estruturado com img + icon
- [x] CSS para foto circular com borda
- [x] JavaScript para alternar entre foto/ícone
- [x] Fallback para ícone quando não há foto
- [x] Efeito hover na foto
- [x] Responsivo (40x40px)

---

## 🎨 Personalização

### Mudar tamanho:
```css
.btn-perfil img {
    width: 50px;   /* Aumentar */
    height: 50px;
}
```

### Mudar cor da borda:
```css
.btn-perfil img {
    border: 2px solid #10b981;  /* Verde */
}
```

### Adicionar efeito de animação:
```css
.btn-perfil img {
    transition: all 0.3s ease;
}

.btn-perfil:hover img {
    transform: scale(1.1) rotate(5deg);
}
```

---

## 📝 Observações

1. A foto é carregada do `localStorage` (campo `foto_perfil` do objeto `usuario`)
2. Se não houver foto, o ícone padrão é exibido
3. O mesmo sistema pode ser aplicado em outras páginas (especialistas.html, consultas.html, etc.)
4. A foto precisa estar acessível via URL ou caminho relativo
5. Suporta formatos: JPG, PNG, GIF, WebP, Base64

---

## 🚀 Próximos Passos

- [ ] Aplicar em todas as páginas do sistema
- [ ] Adicionar loading spinner durante carregamento da foto
- [ ] Implementar cache de imagens
- [ ] Adicionar preview ao fazer upload
- [ ] Comprimir imagens automaticamente

---

**Status:** ✅ Implementado e funcionando
**Páginas:** index.html
**Data:** 1 de novembro de 2025
