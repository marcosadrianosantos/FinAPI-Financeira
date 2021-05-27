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

function verifyIfNotExistsAccountCPF(request,response,next){
    const { cpf } = request.body;

    const customersAlreadyExists = customers.some(
        (customers) => customers.cpf === cpf
    );

    if(customersAlreadyExists)
        return response.status(400).json({error: "Usuário já existente!"});

    
    return next();

}

function getBalance(statement){
    const balance = statement.reduce((acc, operation) =>{
        if(operation.type === 'credit')
            return acc + operation.amount;
        else
            return acc - operation.amount;    
        
    }, 0);

    return balance;
}

app.post("/account", verifyIfNotExistsAccountCPF, (request, response) =>{
    const { cpf, name } = request.body;

// some é usado para verificar se existe ou não existe
    // const customersAlreadyExists = customers.some(
    //     (customers) => customers.cpf === cpf
    // );

    // if(customersAlreadyExists)
    //     return response.status(400).json({error: "Usuário já existente!"});

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

app.post("/deposit", verifyIfExistsAccountCPF, (request, response) =>{
    const { description, amount } = request.body;

    const { customer } = request;

    const statementOperation = {
        description,
        amount, 
        created_at: new Date(),
        type: "credit"
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();
});

app.post("/withdraw",verifyIfExistsAccountCPF,(request, response) =>{
    const { amount } = request.body;
    const { customer } = request;

    const balance = getBalance(customer.statement);

    if(balance < amount)
        return response.status(400).json({erro: "Dinheiro insuficiente"})
    
    const statementOperation = {
            amount, 
            created_at: new Date(),
            type: "debit"
    }; 

    customer.statement.push(statementOperation);
    
    return response.status(201).send();

});

app.get("/statement/date", verifyIfExistsAccountCPF, (request, response) =>{
    const { customer } = request;
    const { date } = request.query;

    const dateFormat = new Date(date + " 00:00");

    const statement = customer.statement.filter((statement) => statement.created_at.toDateString() === new Date(dateFormat).toDateString());

    return response.json(statement);
});


app.put("/account", verifyIfExistsAccountCPF, (request, response) =>{
    const { name } = request.body;
    const { customer } = request;

    customer.name = name;

    return response.status(201).send();
});

app.get("/account", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;

    return response.json(customer);
})

app.delete("/account", verifyIfExistsAccountCPF, (request, response) =>{
    const { customer } = request;

    // splice => remoção
    customers.splice(customer, 1);

    return response.status(200).json(customers);

});

app.get("/balance", verifyIfExistsAccountCPF, (request, response) =>{
    const{ customer } = request;
    const balance = getBalance(customer.statement);

    return response.json(balance);
});

app.listen(3333);