import { Server } from '@hocuspocus/server'
import { SQLite } from '@hocuspocus/extension-sqlite'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

const verifySupabaseToken = async (token) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnonKey
    }
  })

  if (!response.ok) {
    throw new Error('Unauthorized')
  }

  return response.json()
}

const server = new Server({
  port: process.env.PORT || 1234,
  
  extensions: [
    new SQLite({
      database: 'db.sqlite'
    })
  ],

  async onConnect({ requestParameters }) {
    if (supabaseUrl && supabaseAnonKey) {
      const token = requestParameters.get('token')
      if (!token) {
        throw new Error('Unauthorized')
      }

      await verifySupabaseToken(token)
    }

    console.log('Client connected')
  }
})

server.listen()