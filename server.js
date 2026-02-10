import { Server } from '@hocuspocus/server'
import { SQLite } from '@hocuspocus/extension-sqlite'

const server = new Server({
  port: process.env.PORT || 1234,
  
  extensions: [
    new SQLite({
      database: 'db.sqlite',
      sqlite: 'better-sqlite3' // Add this line
    })
  ],

  async onConnect() {
    console.log('Client connected')
  }
})

server.listen()