const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public', 'views',)));

// Inicia o servidor na porta 3000
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
