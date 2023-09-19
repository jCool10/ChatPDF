import app from './app'
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

const PORT = 5000

const server = app.listen(PORT, () => console.log(`Server start with ${PORT}`))

process.on('SIGINT', () => server.close(() => console.log('Exit Server express')))
