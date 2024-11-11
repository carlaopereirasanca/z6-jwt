
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Cria o aplicativo express:
const app = express();

// Middleware express.json() que vai ser aplicado
// em todas as rotas:
app.use( express.json() );

// Array para simular um banco de dados de usuários:
const users = [];



// Rota register, para criar o usuário:

app.post('/register', async(req,res) => {

    const {username, password} = req.body;

    const hashedPassword = await bcrypt.hash(password,10);

    users.push( {username, password: hashedPassword} );
    console.log(users);

    res.status(201).send('User registered');

});



// Rota login, para retornar o jwt:

app.post('/login', async(req,res) => {

    const {username, password} = req.body;

    // Procurar o usuário e senha na "base de dados":
    const user = users.find( user => user.username === username );

    // Se não achou, ou a senha decriptografada não é a correta,
    // retorna erro:

    if ( !user || !( await bcrypt.compare(password, user.password) ) ) {

        return res.status(401).send('Login Incorreto!');
    }

    // Se está tudo ok, crie e retorna o jwt:

    const token = jwt.sign(
        { username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h', algorithm: 'HS256' }
    );

    res.json(token);
    console.log('Login efetuado pelo usuário ' + user.username);

});



// Middleware para verificar o jwt.
// O token vem no 'authorization header', na forma
// bearer blablabla.
// Vamos quebrar no espaço e pegar o elemento [1] (o token).

const authenticateJWT = (req, res, next) => {

    const authHeader = req.header('Authorization');
    console.log('Authorization: ' + authHeader);

    let token;
    
    if (authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length === 2) {
            token = parts[1];
        }
    }
    
    if (!token) {
        return res.status(401).send('Acesso negado. Token não fornecido.');
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

        if (err) {

            if (err.name === 'TokenExpiredError') {
                return res.status(401).send('Acesso negado. Token expirado.');

            } else if (err.name === 'JsonWebTokenError') {
                return res.status(403).send('Acesso negado. Token inválido.');

            } else {
                return res.status(403).send('Acesso negado. Erro na verificação do token.');
            }
        }

        req.user = user;

        const issuedAtISO = new Date(user.iat * 1000).toISOString();
        const expiresAtISO = new Date(user.exp * 1000).toISOString();

        console.log(`Token validado para usuário: ${user.username}
            Emitido em: ${issuedAtISO}
            Expira em: ${expiresAtISO}
        `);

        next();
    });

}



/* / AQUI O MIDDLEWARE ESTÁ SENDO APLICADO APENAS PARA ESTA ROTA.
// SE QUISER QUE SEJA APLICADO EM TODAS, PRECISA USAR O APP.USE

app.get('/protected', authenticateJWT, (req,res) => {

    console.log("Usuário autorizado:" + req.user);
    res.send('Você conseguiu acessar uma rota protegida');
});*/


// Aplica o middleware em todas as rotas que vierem depois:
app.use(authenticateJWT);

// Agora todas estas rotas usarão o middleware automaticamente:

app.get('/protected1', (req,res) => {
    res.send('Rota protegida 1');
});

app.get('/protected2', (req,res) => {
    res.send('Rota protegida 2');
});

app.get('/protected3', (req,res) => {
    res.send('Rota protegida 3');
});










app.listen( 3000,

    () => {
        console.log("Servidor ativo e aguardando requisições...");
    }

);

