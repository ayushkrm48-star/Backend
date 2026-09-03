// WE WILL need some command so that our application start listening / following the evn variables
require('dotenv').config();

const express = require('express');
const app = express()
const port = 3000

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

app.get('/' , (request , response) => {
    response.send("Hello World");
})


// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })

app.listen(process.env.PORT , () => {
    console.log(`App is Listening on ${process.env.PORT}`);ah
})
// Server start karo aur port 3000 par incoming requests ka wait karo

app.get('/ayush', (req , res) => {
    res.send("<h1> Hello , I am Ayush & i  AM learning backend for the very first time </h1>");
})
// agr main apna application firse restart nhi kiya toh ye repsonse nhi aayega 

