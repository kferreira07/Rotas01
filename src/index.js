const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

let motoristas = [];
let id = 1;

app.get('/', (req, res) => {
    res.send('API funcionando!');
});

app.post('/rotas_api/public/views', (req, res) => {
    const motorista = { id: id++, ...req.body };
    motoristas.push(motorista);
    console.log('Motorista Cadastrado:', motorista);
    res.status(201).json({ message: 'Motorista cadastrado!', motorista });
});


app.delete('/rotas_api/public/views/:id', (req, res) => {
    const index = motoristas.findIndex(m => m.id == req.params.id);
    if (index !== -1) {
        const deletedMotorista = motoristas.splice(index, 1);
        res.json({ message: 'Motorista excluído!', motorista: deletedMotorista[0] });
    } else {
        res.status(404).json({ message: 'Motorista não encontrado.' });
    }
});



// Rota GET para listar todos os motoristas
app.get('/rotas_api/public/views', (req, res) => {
    res.json(motoristas); // Retorna todos os motoritas
});

app.get('/rotas_api/public/views/:id', (req, res) => {
    const motorista = motoristas.find(m => m.id == req.params.id);
    if (motorista) {
        res.json(motorista);
    } else {
        res.status(404).json({ message: 'Motorista não encontrado.' });
    }
});

app.put('/rotas_api/public/views/:id', (req, res) => {
    const index = motoristas.findIndex(m => m.id == req.params.id);
    if (index !== -1) {
        motoristas[index] = { id: parseInt(req.params.id), ...req.body };
        res.json({ message: 'Motorista atualizado!', motorista: motoristas[index] });
    } else {
        res.status(404).json({ message: 'Motorista não encontrado.' });
    }
});

// Iniciar servidor com tratamento de erro
app.listen(PORT)
    .on('listening', () => {
        console.log(` Servidor rodando na porta ${PORT}`);
    })
    .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(` Porta ${PORT} já está em uso.`);
        } else {
            console.error('Erro ao iniciar o servidor:', err);
        }
    });


app.get('/motoristas', (req, res) => {
    db.query('SELECT * FROM motoristas', (err, results) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.json(results);
    });
});

