// Gerar código OTP de 6 dígitos
function gerarCodigoOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Verificar se OTP expirou
function otpExpirou(dataExpiracao) {
    return new Date() > new Date(dataExpiracao);
}

// Calcular data de expiração (10 minutos)
function calcularExpiracao() {
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() + 10);
    return agora;
}

module.exports = {
    gerarCodigoOTP,
    otpExpirou,
    calcularExpiracao
};
