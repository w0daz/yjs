import { Server } from '@hocuspocus/server'
import { SQLite } from '@hocuspocus/extension-sqlite'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

const fetchSupabaseJson = async (url, token) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnonKey,
      Accept: 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Unauthorized')
  }

  return response.json()
}

const verifySupabaseToken = async (token) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  return fetchSupabaseJson(`${supabaseUrl}/auth/v1/user`, token)
}

const ensureRoomMember = async (roomId, userId, token) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return
  }

  const encodedRoom = encodeURIComponent(roomId)
  const encodedUser = encodeURIComponent(userId)
  const url = `${supabaseUrl}/rest/v1/room_members?select=room_id&room_id=eq.${encodedRoom}&user_id=eq.${encodedUser}`
  const data = await fetchSupabaseJson(url, token)

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Unauthorized')
  }
}

const server = new Server({
  port: process.env.PORT || 1234,
  
  extensions: [
    new SQLite({
      database: 'db.sqlite'
    })
  ],

  async onAuthenticate({ token, documentName }) {
    try {
      if (supabaseUrl && supabaseAnonKey) {
        if (!token) {
          throw new Error('Missing token')
        }

        const user = await verifySupabaseToken(token)
        await ensureRoomMember(documentName, user.id, token)
      }
    } catch (error) {
      console.error('Auth failed', {
        documentName,
        message: error?.message || String(error)
      })
      throw error
    }
  },

  async onConnect() {
    console.log('Client connected')
  }
})

server.listen()