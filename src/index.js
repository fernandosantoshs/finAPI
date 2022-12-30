const express = require("express");
const { v4: uuidv4 } = require("uuid");
const app = express();

app.use(express.json());

const customers = [
  {
    cpf: "123456789",
    name: "Bill",
    id: "testID",
    statement: [{
      "description": "Projeto finAPI",
      "amount": 12000,
      "createdAt": "2022-12-26T15:11:40.727Z",
      "type": "credit"
    }],
  },
];

function checkUserExistance(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) return response.status(404).json({ message: "User not found!" });

  request.customer = customer;

  return next()
}

function getBalance(statement) {
  const balance = statement.reduce((acc, currentStatement) => {
    if (currentStatement.type == "credit") {
      return acc + currentStatement.amount
    } else {
      return acc - currentStatement.amount
    }
  }, 0);
  
  return balance
}

app.get("/account", checkUserExistance, (request, response) => {
  const { customer } = request;

  response.status(200).send(customer)
});

app.post("/account", (request, response) => {
  const { name, cpf } = request.body;

  const userAlreadyExists = customers.some((customer) => customer.cpf === cpf);

  if (userAlreadyExists) return response.status(400).json({ error: "User already exists" });
  
  customers.push({
    cpf: cpf,
    name: name,
    id: uuidv4(),
    statement: [],
  });
  
  return response.status(201).send({ message: "Account created Successfully" })
});

app.put("/account", checkUserExistance, (request, response) => {
  const { customer } = request;
  const { name } = request.body;

  customer.name = name;

  response.status(200).json({message: "Account uptaded successfully"})
});

app.delete("/account", checkUserExistance, (request, response) => {
  const { customer } = request;
  const customerIndex = customers.find(requestCustomer => customer.id === requestCustomer.id)

  customers.splice(customerIndex, 1)
  
  response.status(204).send()
});

app.get("/statement", checkUserExistance, (request, response) => {
  const { customer } = request;
  
  return response.status(200).json(customer.statement)
});

app.get("/statement/date", checkUserExistance, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const formatedQueryDate = new Date(date)

  const statementByDate = customer.statement.map(statement => {
    const formatedStatementDate = new Date(statement.createdAt)

    if (formatedStatementDate >= formatedQueryDate) {
      return statement
    }
  })

  if (statementByDate.length <= 1) {
    return response.send(200).json({message: "No statement for period"})
  }
  response.status(200).send(statementByDate)
});

app.post("/deposit", checkUserExistance, (request, response) => {
  const { customer } = request;
  const { description, amount } = request.body;
  
  if (Number(amount) < 0) amount = Math.abs(amount);
  
  const depositTransaction = {
    description: description,
    amount: amount,
    createdAt: new Date(),
    type: "credit",
  };
  
  customer.statement.push(depositTransaction)
  
  return response.status(201).send(depositTransaction)
});

app.post("/withdraw", checkUserExistance, (request, response) => {
  const { customer } = request;
  const { amount } = request.body;
  
  amount = Math.abs(amount)
  
  const balance = getBalance(customer.statement);
  
  if (balance < amount) return response.status(400).json({ error: "Insufficient funds!" });
  
  const withdrawTransaction = {
    description: "withdraw",
    amount,
    createdAt: new Date(),
    type: "debit",
  };
  
  customer.statement.push(withdrawTransaction)
  
  return response.status(201).send()
});

app.get("/balance", checkUserExistance, (request, response) => {
  const { customer } = request;

  const balance = getBalance(customer.statement)

  response.status(200).json(balance)
})

app.listen(3333);