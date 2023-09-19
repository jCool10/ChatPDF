import mongoose from 'mongoose'
import { MONGODB_URL } from '~/constants'

const mongoURL = MONGODB_URL

class Database {
  static instance: any
  constructor() {
    this.connect()
  }

  connect(type = 'mongodb') {
    // eslint-disable-next-line no-constant-condition
    if (1 === 1) {
      mongoose.set('debug', true)
      mongoose.set('debug', { color: true })
    }
    mongoose
      .connect(mongoURL)
      .then((_) => console.log('Connected Mongo DB Success'))
      .catch((err) => console.log(err))
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }
}

const instanceMongodb = Database.getInstance()

export default instanceMongodb
