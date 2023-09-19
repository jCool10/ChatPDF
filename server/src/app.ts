import compression from 'compression'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import router from './routers'
import { notFoundError, returnError } from './middleware/errorHandle.middleware'
import { config } from 'dotenv'
import cors from 'cors'
import instanceMongodb from './dbs/mongodb'

config()

const app: express.Application = express()
// console.log(process.env.OPENAI_API_KEY)

// Database.connect()
instanceMongodb

app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(bodyParser.json({ limit: '100mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }))
app.use(cors())

app.use('/api', router)

// const apiKey = process.env.OPENAI_API_KEY
// console.log(apiKey)

app.use(notFoundError)

app.use(returnError)

export default app
