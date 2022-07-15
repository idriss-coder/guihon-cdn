const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const busboy = require('connect-busboy')
const path = require('path')
const resizerController = require("./controller/resizerController")

const app = express()
const port = 5000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.use(busboy())
app.use(express.static(path.join(__dirname, 'public')));

app.use(resizerController)
app.use((req, res, _next) => {
  res.status(403).json({
    code: 403,
    status: 'Access refuser ',
    message: 'This is private CDN server for guihon'
  })
}, (err) => {
    console.log(err)
    }
)


app.listen(port, () => console.log(`CDN Listening on port ${port}`))

