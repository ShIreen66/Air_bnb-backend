require('dotenv').config()
const app = require('./src/app.js')
const connectToDB = require('./src/config/db/db.js')
const PORT = process.env.PORT || 4000



app.listen(`${PORT}`, () => {
    connectToDB()
    console.log(`Server is running on http://localhost:${PORT}`)
})


