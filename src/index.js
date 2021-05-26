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
app.post("/account", (request, response) =>{
    const { cpf, name } = request.body;

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


app.listen(3333);