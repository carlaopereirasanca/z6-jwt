
// Importa o framework express:
import express from "express";

// Cria uma nova aplicação Express:
const app = express();


// Middlewares são executados NA ORDEM em que aparecem no código.


// Primeiro middleware a ser executado.
//
// Este é um middleware interno do Express (bultin) que permite que 
// a aplicação processe dados JSON recebidos no corpo das requisições.
// Middlewares internos chamam next() automaticamente.
//
// O middleware express.json() é responsável por:
//   - Analisar (parse) o corpo das requisições que contêm dados JSON;
//   - Transformar esses dados JSON em um objeto JavaScript;
//   - Disponibilizar esse objeto através de req.body.
//
// Sem o express.json():
//   - O req.body seria undefined

//app.use( express.json() );


// Segundo middleware a ser executado.
// Este é um middleware personalizado que registra 
// o timestamp atual toda vez que uma requisição é feita.
// A função next() passa o controle para o próximo middleware.

app.use( (req, res, next) => {

    console.log('Tempo:', Date.now());
    next();
});
  

// Terceiro middleware a ser executado.
// Outro middleware personalizado que registra 
// o método HTTP da requisição (GET, POST, etc.).
// Também passa o controle adiante com next().

app.use( (req, res, next) => {

    console.log('Método da requisição:', req.method);
    next();
});


// Tratamento da rota /, nos métodos put e post.
//
// Se o middleware express.json() estiver ativo,
// vai retornar o objeto json enviado na requisição.
//
// Senão, não vai retornar nada.

app.put('/', (req, res) => {

    res.send(req.body);
});
  
app.post('/', (req, res) => {

    res.send(req.body);
});



// Executa o servidor:

app.listen( 3000, () => {
        console.log("Servidor ativo e aguardando requisições...");
    }
);


