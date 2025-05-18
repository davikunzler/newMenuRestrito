const express = require('express');
const cors = require('cors');
const connection = require('./db_config')

const app = express();
app.use(express.json());
app.use(cors());



app.post('/cadastrarCliente', (req, res) => {
    const {email, nome, senha, cidade, filtros} = req.body;
    
    if(!email || !nome || !senha || !cidade || !filtros){
        return res.status(400).send({message: 'Todos campos são obrigatórios!'});
    }

connection.query(
    'INSERT INTO clientes (email_cliente, nome_cliente, senha_cliente, cidade, filtro_cliente) VALUES (?, ?, ?, ?, ?)', 
    [email, nome, senha, cidade, filtros],
    (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar novo perfil no DB', err);
            return res.status(500).send({ message: 'Erro no servidor ao cadastrar' });
        }
        res.status(201).send({ message: 'Usuário cadastrado com sucesso!' });
    }
);
});
//////

app.post('/cadastrarEstabele', (req, res) => {
    const {nome, email, senha, cidade, descricao, filtros} = req.body;
    
    if(!nome || !email || !senha || !cidade || !descricao || !filtros){
        return res.status(400).send({message: 'Todos campos são obrigatórios!'});
    }

connection.query(
    'INSERT INTO estabelecimentos (nome_estabelecimento, email_estabelecimento, senha_estabelecimento, cidade_estabelecimento, descricao, filtros_estabelecimento) VALUES (?, ?, ?, ?, ?, ?)', 
    [nome, email, senha, cidade, descricao, filtros],
    (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar novo estabelecimanto no DB', err);
            return res.status(500).send({ message: 'Erro no servidor ao cadastrar' });
        }
        res.status(201).send({ message: 'Estabelecimento cadastrado com sucesso!' });
    }
);
});

//////
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    // Primeiro, tenta como cliente
    const clienteQuery = 'SELECT * FROM clientes WHERE email_cliente = ? AND senha_cliente = ?';
    connection.query(clienteQuery, [email, senha], (err, clienteResults) => {
        if (err) {
            console.error("Erro ao buscar cliente no banco:", err);
            return res.status(500).json({ success: false, message: 'Erro no servidor' });
        }

        if (clienteResults.length > 0) {
            return res.json({ success: true, tipo: 'cliente', message: 'Login como cliente bem sucedido' });
        }

        // Senão, tenta como estabelecimento
        const estabeleQuery = 'SELECT * FROM estabelecimentos WHERE email_estabelecimento = ? AND senha_estabelecimento = ?';
        connection.query(estabeleQuery, [email, senha], (err, estabeleResults) => {
            if (err) {
                console.error("Erro ao buscar estabelecimento no banco:", err);
                return res.status(500).json({ success: false, message: 'Erro no servidor' });
            }

            if (estabeleResults.length > 0) {
                return res.json({ success: true, tipo: 'estabelecimento', message: 'Login como estabelecimento bem sucedido' });
            }

            // Se não encontrou em nenhum dos dois:
            res.json({ success: false, message: 'Email ou senha incorretos' });
        });
    });
});



app.get('/pesquisarEstabelecimentos', (req, res) => {
    const termo = req.query.q;

    if (!termo) {
        return res.status(400).json({ message: 'Termo de busca não fornecido.' });
    }

    const query = `
        SELECT * FROM estabelecimentos 
        WHERE nome_estabelecimento LIKE ?
    `;

    const likeTerm = `%${termo}%`;

    connection.query(query, [likeTerm], (err, results) => {
        if (err) {
            console.error("Erro na pesquisa:", err);
            return res.status(500).json({ message: 'Erro ao realizar a pesquisa.' });
        }

        res.json(results);
    });
});






app.listen(3001, () => console.log(`Servidor rodando na porta 3001`))