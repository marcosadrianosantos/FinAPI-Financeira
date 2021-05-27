const { request, response } = require("express");
const { v4: uuidV4 } = require("uuid")
const express = require("express");

const app = express();

app.use(express.json());

const customers = [];
/**
 * cpf - string
 * name - string
 * id - uuid
 * statement []
 */

//Middleware
function verifyIfExistsAccountCPF(request, response, next){
    const { cpf } = request.headers;

    const customer = customers.find(
        (customers) => customers.cpf === cpf);

    if(!customer)
        return response.status(400).json({error: "Usuário não existe!"});

    request.customer = customer;
    return next();
}

app.post("/account", (request, response) =>{
    const { cpf, name } = request.body;

// some é usado para verificar se existe ou não existe
    const customersAlreadyExists = customers.some(
        (customers) => customers.cpf === cpf
    );

    if(customersAlreadyExists)
        return response.status(400).json({error: "Usuário já existente!"});

    customers.push({
        cpf,
        name,
        id: uuidV4(),
        statement: [],
    });
    return response.status(201).send();
});

//usa está versão de usar a chamada do MiddleWare quando eu desejo que todas rotas utilizem desta função
// app.use(verifyIfExistsAccountCPF);

app.get("/statement", verifyIfExistsAccountCPF, (request, response) =>{
    // const { cpf } = request.params;
//     const { cpf } = request.headers;

// // find é usado quando precisamos retornar todo o objeto
//     const customer = customers.find(
//         (customers) => customers.cpf === cpf);

    // if(!customer)
    //     return response.status(400).json({error: "Usuário não existe!"});
    const { customer } = request;

    return response.json(customer.statement);
});

app.listen(3333);