const express = require('express');
const cors = require('cors');
const path = require('path');
const connection = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Rota de teste
app.get('/', (req, res) => res.send('API funcionando!'));



// CRUD CARROS


// Cadastrar carro
app.post('/carros', (req, res) => {
    const {
        foto, marca, modelo, fabricacao, cor, placa, renavan, chassi,
        quilometragem, tipoCombustivel, transmissao, valor, observacoes
    } = req.body;

    const query = `
        INSERT INTO carros (
            foto, marca, modelo, fabricacao, cor, placa, renavan, chassi,
            quilometragem, tipoCombustivel, transmissao, valor, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(query, [
        foto, marca, modelo, fabricacao, cor, placa, renavan, chassi,
        quilometragem, tipoCombustivel, transmissao, valor, observacoes
    ], (err, result) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.status(201).json({ message: 'Carro cadastrado com sucesso!', id: result.insertId });
    });
});

// Buscar todos
app.get('/buscarcarros', (req, res) => {
    connection.query('SELECT * FROM carros', (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar dados.' });
        res.json(results);
    });
});
app.get('/tablecarros', (req, res) => {
    connection.query('SELECT * FROM carros', (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar dados.' });
        res.json(results);
    });
});
app.get('/carros/:id', (req, res) => {
    const { id } = req.params;
    connection.query('SELECT * FROM carros WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar o carro.' });
        if (results.length === 0) return res.status(404).json({ error: 'Carro não encontrado.' });
        res.json(results[0]);
    });
});
app.put('/carros/:id', (req, res) => {
    const id = req.params.id;
    connection.query('UPDATE carros SET ? WHERE id = ?', [req.body, id], (err, result) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Veículo não encontrado.' });
        res.json({ message: 'Veículo atualizado com sucesso!' });
    });
});
app.delete('/carros/:id', (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM carros WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Veículo não encontrado.' });
        res.json({ message: 'Veículo excluído com sucesso!' });
    });
});



// CRUD MOTORISTAS


app.post('/motoristas', (req, res) => {
    const dados = req.body;
    const query = `
        INSERT INTO motoristas (
            nome, rg, uf, email, cep, complemento, dataNascimento, telefone,
            cnh, categoriaCnh, vencimentoCnh, nomeMae, cidade, endereco, numero, pais, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(query, [
        dados.nome, dados.rg, dados.uf, dados.email, dados.cep, dados.complemento, dados.dataNascimento, dados.telefone,
        dados.cnh, dados.categoriaCnh, dados.vencimentoCnh, dados.nomeMae, dados.cidade, dados.endereco, dados.numero, dados.pais, dados.observacoes
    ], (err, result) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.status(201).json({ message: 'Motorista cadastrado com sucesso!', id: result.insertId });
    });
});

app.get('/motoristas', (req, res) => {
    connection.query('SELECT * FROM motoristas', (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(results);
    });
});
app.get('/motoristas/:id', (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM motoristas WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Motorista não encontrado.' });
        res.json(results[0]);
    });
});
app.put('/motoristas/:id', (req, res) => {
    const id = req.params.id;
    connection.query('UPDATE motoristas SET ? WHERE id = ?', [req.body, id], (err, result) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Motorista não encontrado.' });
        res.json({ message: 'Motorista atualizado com sucesso!' });
    });
});
app.delete('/motoristas/:id', (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM motoristas WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Motorista não encontrado.' });
        res.json({ message: 'Motorista excluído com sucesso!' });
    });
});

// Para <select> em formulários
app.get('/api/motoristas', (req, res) => {
    connection.query('SELECT id, nome FROM motoristas', (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        res.json(results);
    });
});



// EVENTOS (empréstimo e devolução)


app.post('/emprestar', (req, res) => {
    const { gestor, motorista, telefone, carro, odometro, tipo, data_hora } = req.body;
    if (!gestor || !motorista || !carro || !data_hora)
        return res.status(400).send('Campos obrigatórios faltando');

    const query = `INSERT INTO eventos (gestor, motorista, telefone, carro, odometro, tipo, data_hora) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    connection.query(query, [gestor, motorista, telefone, carro, odometro, tipo, data_hora], (err) => {
        if (err) return res.status(500).send('Erro ao registrar empréstimo');
        res.status(201).send('Empréstimo registrado com sucesso!');
    });
});

app.post('/devolver', (req, res) => {
    const { gestor, motorista, telefone, carro, odometro, tipo, data_hora } = req.body;
    if (!gestor || !motorista || !carro || !data_hora)
        return res.status(400).send('Campos obrigatórios faltando');

    const query = `INSERT INTO eventos (gestor, motorista, telefone, carro, odometro, tipo, data_hora) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    connection.query(query, [gestor, motorista, telefone, carro, odometro, tipo, data_hora], (err) => {
        if (err) return res.status(500).send('Erro ao registrar devolução');
        res.status(201).send('Devolução registrada com sucesso!');
    });
});

app.get('/eventos', (req, res) => {
    connection.query('SELECT * FROM eventos', (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar dados.' });
        res.json(results);
    });
});



// GESTOR: Cadastro e Login


app.post('/cadastrase',
    body('email').isEmail().withMessage('E-mail inválido.'),
    body('cpf').matches(/^\d{11}$/).withMessage('CPF deve ter 11 dígitos.'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres.'),
    async (req, res) => {
        const erros = validationResult(req);
        if (!erros.isEmpty()) return res.status(400).json({ erro: erros.array()[0].msg });

        const { nome, sobrenome, telefone, cpf, email, senha } = req.body;
        const senha_hash = await bcrypt.hash(senha, 10);

        const sql = `INSERT INTO gestor (nome, sobrenome, telefone, cpf, email, senha_hash) VALUES (?, ?, ?, ?, ?, ?)`;
        connection.query(sql, [nome, sobrenome, telefone, cpf, email, senha_hash], (err) => {
            if (err) return res.status(500).json({ erro: 'Erro ao salvar no banco.' });
            res.status(201).json({ message: 'Gestor cadastrado com sucesso!' });
        });
    }
);

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ message: 'Forneça e-mail e senha.' });

    connection.query('SELECT * FROM gestor WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Erro interno do servidor.' });
        if (results.length === 0) return res.status(401).json({ message: 'Usuário não encontrado.' });

        const gestor = results[0];
        const senhaValida = await bcrypt.compare(senha, gestor.senha_hash);
        if (!senhaValida) return res.status(401).json({ message: 'Senha incorreta.' });

        const token = jwt.sign({ gestorId: gestor.id }, 'segredo_jwt', { expiresIn: '1h' });
        res.json({ success: true, message: 'Login bem-sucedido!', token });
    });
});




// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
