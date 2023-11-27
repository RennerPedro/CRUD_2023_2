const express = require('express');
const app = express();
const sql = require('mssql');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());

app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type',
    credentials: true,
    optionsSuccessStatus: 204, // Responda com 204 No Content para as solicitações OPTIONS
}));

app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Credentials', true);
    res.send();
});

app.use((req, res, next) => {
    console.log('Recebendo requisição:', req.method, req.url);
    res.header('Access-Control-Allow-Origin', '*'); // ou o endereço do seu frontend
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Credentials', true);
    next();
});


const config = {
    server: 'DESKTOP-554J6HQ',
    database: 'teste',
    port: 1433,
    user: 'sa',
    password: 'pedro74',
    trustServerCertificate: true,
    options: {
        cryptoCredentialsDetails: {
            minVersion: 'TLSv1',
            trustServerCertificate: true,
        }
    }
};

// Função para conectar ao banco de dados
const connectToDatabase = async () => {
    try {
        await sql.connect(config);
        console.log('Conectado ao SQL Server');
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    }
};

// Conectar ao banco de dados ao iniciar o servidor
connectToDatabase();



app.get('/api/produtos', async (req, res) => {
    try {
        const result_produto = await sql.query`SELECT Produto.*, Marca.Nome AS NomeMarca, Categoria.Tipo_produto AS NomeCategoria
        FROM Produto
        LEFT JOIN Marca ON Produto.idMarca = Marca.ID
        LEFT JOIN Categoria ON Produto.idCategoria = Categoria.ID`;
        res.json(result_produto.recordset);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos.', details: error.message });
    }
});

// Rota para obter todas as Categorias
app.get('/api/categorias', async (req, res) => {
    try {
        const result_categoria = await sql.query`SELECT * FROM Categoria`;
        res.json(result_categoria.recordset);
        console.log(result_categoria.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar categorias.', details: error.message });
    }
});

// Rota para obter todas as Marcas
app.get('/api/marcas', async (req, res) => {
    try {
        const result_marca = await sql.query`SELECT * FROM Marca`;
        res.json(result_marca.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar marcas.', details: error.message });
    }
});

// Rota para adicionar um novo Produto
app.post('/api/produtos', async (req, res) => {
    try {
        const { Nome, Preco, Quantidade, idCategoria, idMarca } = req.body;

        const result = await sql.query`
            INSERT INTO Produto (Nome, Preco, Quantidade, idCategoria, idMarca)
            VALUES (${Nome}, ${Preco}, ${Quantidade}, ${idCategoria}, ${idMarca})
        `;

        if (result.rowsAffected[0] === 1) {
            console.log('Novo produto inserido com sucesso!');
            res.sendStatus(201);
        } else {
            console.error('Falha ao inserir novo produto.');
            res.sendStatus(500);
        }
    } catch (error) {
        console.error('Erro ao inserir produto:', error);
        res.status(500).json({ error: 'Erro ao inserir produto.', details: error.message });
    }
});

app.delete('/api/produtos/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const result = await sql.query`
            DELETE FROM Produto
            WHERE ID = ${productId}
        `;

        console.log(result); // Adicione esta linha para verificar o resultado

        if (result.rowsAffected[0] === 1) {
            console.log('Produto excluído com sucesso!');
            res.sendStatus(200);
        } else {
            console.error('Produto não encontrado ou falha ao excluir.');
            res.sendStatus(404); // Produto não encontrado
        }
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        res.status(500).json({ error: 'Erro ao excluir produto.', details: error.message });
    }
});

// ...

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
    
