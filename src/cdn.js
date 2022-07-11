const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const resizerController = require("./controller/resizerController")

const app = express()
const port = 5000

app.use(bodyParser.json())
app.use(cors())

app.use(resizerController)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    code: 200,
    message: 'This is private CDN server for guihon'
  })
}, (err) => {
    console.log(err)
    }
)


app.listen(port, () => console.log(`CDN Listening on port ${port}`))

