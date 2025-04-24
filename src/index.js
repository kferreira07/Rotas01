const express = require('express');
const cors = require('cors');
const connection = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


// Teste simples
app.get('/', (req, res) => {
    res.send('API funcionando!');
});

// Cadastrar motorista no banco de dados
app.post('/motoristas', (req, res) => {
    const {
        nome,
        rg,
        uf,
        email,
        cep,
        complemento,
        dataNascimento,
        telefone,
        cnh,
        categoriaCnh,
        vencimentoCnh,
        nomeMae,
        cidade,
        endereco,
        numero,
        pais,
        observacoes
    } = req.body;

    const query = `
        INSERT INTO motoristas (
            nome, rg, uf, email, cep, complemento, dataNascimento, telefone,
            cnh, categoriaCnh, vencimentoCnh, nomeMae, cidade, endereco, numero, pais, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(query, [
        nome, rg, uf, email, cep, complemento, dataNascimento, telefone,
        cnh, categoriaCnh, vencimentoCnh, nomeMae, cidade, endereco, numero, pais, observacoes
    ], (err, result) => {
        if (err) {
            console.error('Erro ao inserir motorista:', err);
            return res.status(500).json({ erro: err.message });
        }
        res.status(201).json({ message: 'Motorista cadastrado com sucesso!', id: result.insertId });
    });
});

// Listar todos os motoristas
app.get('/motoristas', (req, res) => {
    connection.query('SELECT * FROM motoristas', (err, results) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.json(results);
    });
});

// Obter um motorista por ID
app.get('/motoristas/:id', (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM motoristas WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Motorista não encontrado.' });
        }
        res.json(results[0]);
    });
});

// Atualizar motorista
app.put('/motoristas/:id', (req, res) => {
    const id = req.params.id;
    const dados = req.body;

    const query = `
        UPDATE motoristas SET ?
        WHERE id = ?
    `;

    connection.query(query, [dados, id], (err, result) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Motorista não encontrado.' });
        }
        res.json({ message: 'Motorista atualizado com sucesso!' });
    });
});

// Deletar motorista
app.delete('/motoristas/:id', (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM motoristas WHERE id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Motorista não encontrado.' });
        }
        res.json({ message: 'Motorista excluído com sucesso!' });
    });
});

// Iniciar servidor
app.listen(PORT)
    .on('listening', () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
    })
    .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Porta ${PORT} já está em uso.`);
        } else {
            console.error('❌ Erro ao iniciar o servidor:', err);
        }
    });
// página que usa para emprestar ou devolver carro o <select>

app.get('/api/motoristas', (req, res) => {
    const sql = 'SELECT id, nome FROM motoristas';
    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        res.json(results);
    });
});




//  empréstar de veículos
app.post('/emprestar', (req, res) => {
    const { gestor, motorista, telefone, carro, odometro, evento, dataEmprestimo } = req.body;

    // salvar os dados no banco de dados
    const query = `
        INSERT INTO emprestimos (gestor, motorista, telefone, carro, odometro, evento, dataEmprestimo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(query, [gestor, motorista, telefone, carro, odometro, evento, dataEmprestimo], (err, result) => {
        if (err) {
            console.error('Erro ao registrar empréstimo:', err);
            return res.status(500).send('Erro ao registrar empréstimo');
        }
        res.status(201).send('Empréstimo registrado com sucesso!');
    });
});

app.post('/carros', (req, res) => {
    const {
        marca,
        modelo,
        fabricacao,
        cor,
        placa,
        renavan,
        chassi,
        quilometragem,
        tipoCombustivel,
        transmissao,
        valor,
        foto,
        observacoes,
    } = req.body;

    const query = `
        INSERT INTO carros (
            marca, modelo, fabricacao, cor, placa, renavan, chassi, quilometragem,
            tipoCombustivel, transmissao, valor, foto, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(query, [
        marca, modelo, fabricacao, cor, placa, renavan, chassi, quilometragem,
        tipoCombustivel, transmissao, valor, foto, observacoes
    ], (err, result) => {
        if (err) {
            console.error('Erro ao inserir Carro:', err);
            return res.status(500).json({ erro: err.message });
        }
        res.status(201).json({ message: 'Carro cadastrado com sucesso!', id: result.insertId });
    });
});
