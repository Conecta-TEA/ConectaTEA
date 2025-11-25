// placeholder.js - Gera placeholders SVG quando imagens externas falham

document.addEventListener('DOMContentLoaded', () => {
    // Substituir todas as imagens do placeholder que falharam
    const images = document.querySelectorAll('img[src*="via.placeholder.com"]');
    
    images.forEach(img => {
        // Extrair informações da URL
        const url = new URL(img.src);
        const path = url.pathname.split('/');
        const size = path[1]; // ex: 300x200
        const [width, height] = size.split('x').map(Number);
        const colors = path[2]; // ex: 667eea/ffffff
        const [bg, fg] = colors.split('/');
        const text = url.searchParams.get('text') || img.alt || 'Imagem';
        
        // Criar SVG placeholder
        const svg = createPlaceholderSVG(width, height, `#${bg}`, `#${fg}`, text);
        
        // Converter SVG para Data URL
        const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        // Substituir src da imagem
        img.src = svgUrl;
        
        // Limpar blob URL quando a imagem for removida
        img.addEventListener('load', () => {
            setTimeout(() => URL.revokeObjectURL(svgUrl), 100);
        });
    });
});

function createPlaceholderSVG(width, height, bgColor, fgColor, text) {
    // Decodificar texto (substituir + por espaço)
    const decodedText = decodeURIComponent(text.replace(/\+/g, ' '));
    
    // Calcular tamanho da fonte baseado nas dimensões
    const fontSize = Math.min(width, height) / 10;
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="${width}" height="${height}" fill="${bgColor}"/>
        <text x="50%" y="50%" 
              font-family="Arial, sans-serif" 
              font-size="${fontSize}" 
              fill="${fgColor}" 
              text-anchor="middle" 
              dominant-baseline="middle">
            ${decodedText}
        </text>
    </svg>`;
}

// Exportar função para uso manual se necessário
window.createPlaceholder = createPlaceholderSVG;
