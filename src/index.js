const express = require('express')
const { v4: uuidv4 } = require('uuid')
const app = express()

app.use(express.json())

const customers = [{
    cpf: "123456789",
    name: "Bill",
    id:"testID",
    statement: []
}]

function checkUserExistance(request, response, next) {
    const { cpf } = request.headers

    const customer = customers.find(customer => customer.cpf === cpf)

    if(!customer) return response.status(404).json({message: "User not found!"})

    request.customer = customer

    return next()
}

app.post('/account', (request, response) => {
    const { name , cpf } = request.body;

    const userExists = customers.some(customer => customer.cpf === cpf)

    if(userExists) {
        return response.status(400).json({error: "User already exists"})
    }

    customers.push({
        cpf: cpf,
        name:name,
        id: uuidv4(),
        statement: []
    })

    return response.status(201).send({message: "Account created Successfully"})
});

app.get('/statement', checkUserExistance, (request, response) => {
    const customer = request

    return response.status(200).json(customer.statement)
})

app.post('/deposit', checkUserExistance, (request, response) => {
    const customer = request
    const { description, amount } = request.body

})

app.listen(3333);