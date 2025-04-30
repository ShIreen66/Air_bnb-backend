const Redis = require('ioredis')

const cacheClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
})
 
cacheClient.on("connect", () => {
    console.log("connected to redis")
})

cacheClient.on("error", () => {
    console.log("Error during redis connection :->")
})



module.exports = cacheClient