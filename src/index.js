const express = require('express')
const { v4: uuidv4 } = require('uuid')
const app = express()

app.use(express.json())

const customers = [{
    name: "Bill", 
    cpf: "123456789"
}]

app.post('/account', (request, response) => {
    const { name , cpf } = request.body;

    const userExists = customers.some( customer => customer.cpf === cpf)

    if(userExists) {
        return response.status(400).json({error: "User already exists"})
    }

    customers.push({
        cpf: cpf,
        name:name,
        id: uuidv4(),
        statement: []
    })

    response.status(201).send({message: "Account created Successfully"})
});

app.listen(3333);