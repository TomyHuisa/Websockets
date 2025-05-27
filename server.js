import { WebSocketServer } from "ws"
import express from "express"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import http from "http"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

class ChatServer {
  constructor(port = 3000) {
    this.clients = new Map()
    this.app = express()
    this.server = http.createServer(this.app)
    this.wss = new WebSocketServer({ server: this.server })

    this.setupExpress()
    this.setupWebSocket()
    this.startServer(port)
  }

  setupExpress() {
    // Servir archivos estáticos
    this.app.use(express.static(__dirname))

    // Ruta principal
    this.app.get("/", (req, res) => {
      res.sendFile(join(__dirname, "index.html"))
    })
  }

  setupWebSocket() {
    this.wss.on("connection", (ws) => {
      console.log("🔗 Nueva conexión establecida")

      // Enviar mensaje de bienvenida
      this.sendToClient(ws, {
        type: "server_message",
        content: "Bienvenido al chat. Por favor, ingresa tu nombre de usuario:",
        timestamp: Date.now(),
      })

      ws.on("message", (data) => {
        this.handleMessage(ws, data.toString())
      })

      ws.on("close", () => {
        this.handleDisconnection(ws)
      })

      ws.on("error", (error) => {
        console.error("❌ Error en WebSocket:", error)
      })
    })
  }

  handleMessage(ws, message) {
    try {
      const data = JSON.parse(message)
      const clientInfo = this.clients.get(ws)

      switch (data.type) {
        case "message":
          if (clientInfo && data.content) {
            this.broadcastMessage({
              type: "message",
              username: clientInfo.username,
              content: data.content,
              timestamp: Date.now(),
            })
            console.log(`💬 ${clientInfo.username}: ${data.content}`)
          }
          break

        case "user_joined":
          if (data.username && !this.isUsernameTaken(data.username)) {
            // Registrar cliente
            this.clients.set(ws, {
              username: data.username,
              socket: ws,
            })

            // Confirmar registro al usuario
            this.sendToClient(ws, {
              type: "user_registered",
              username: data.username,
              timestamp: Date.now(),
            })

            // Notificar a todos sobre el nuevo usuario
            this.broadcastMessage({
              type: "user_joined",
              username: data.username,
              content: `${data.username} se ha unido al chat`,
              timestamp: Date.now(),
            })

            // Enviar lista de usuarios
            this.sendUserList()

            console.log(`✅ Usuario "${data.username}" se unió al chat`)
          } else {
            // Nombre de usuario ya existe
            this.sendToClient(ws, {
              type: "username_error",
              content: "Ese nombre de usuario ya está en uso. Por favor, elige otro:",
              timestamp: Date.now(),
            })
          }
          break
      }
    } catch (error) {
      console.error("❌ Error procesando mensaje:", error)
    }
  }

  handleDisconnection(ws) {
    const clientInfo = this.clients.get(ws)

    if (clientInfo) {
      // Notificar a todos sobre la desconexión
      this.broadcastMessage({
        type: "user_left",
        username: clientInfo.username,
        content: `${clientInfo.username} ha salido del chat`,
        timestamp: Date.now(),
      })

      console.log(`❌ Usuario "${clientInfo.username}" se desconectó`)
      this.clients.delete(ws)

      // Actualizar lista de usuarios
      this.sendUserList()
    } else {
      console.log("🔌 Conexión cerrada (usuario no registrado)")
    }
  }

  isUsernameTaken(username) {
    for (const client of this.clients.values()) {
      if (client.username === username) {
        return true
      }
    }
    return false
  }

  sendToClient(ws, message) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  broadcastMessage(message) {
    const messageStr = JSON.stringify(message)

    for (const [ws, clientInfo] of this.clients) {
      try {
        if (ws.readyState === ws.OPEN) {
          ws.send(messageStr)
        }
      } catch (error) {
        console.error(`❌ Error enviando mensaje a ${clientInfo.username}:`, error)
        this.clients.delete(ws)
      }
    }
  }

  sendUserList() {
    const users = Array.from(this.clients.values()).map((client) => client.username)
    const userListMessage = {
      type: "user_list",
      users: users,
      count: users.length,
      timestamp: Date.now(),
    }

    this.broadcastMessage(userListMessage)
  }

  sendServerMessage(content) {
    this.broadcastMessage({
      type: "server_message",
      content: content,
      timestamp: Date.now(),
    })

    console.log(`📢 Mensaje del servidor: ${content}`)
  }

  getConnectedUsers() {
    return Array.from(this.clients.values()).map((client) => client.username)
  }

  getClientCount() {
    return this.clients.size
  }

  startServer(port) {
    this.server.listen(port, () => {
      console.log(`🚀 Servidor de chat iniciado en http://localhost:${port}`)
      console.log(`📡 WebSocket servidor en ws://localhost:${port}`)
      console.log(`🌐 Abre tu navegador en http://localhost:${port}`)
    })
  }
}

// Inicializar servidor
const chatServer = new ChatServer(3000)

// Comandos del servidor desde la terminal
process.stdin.setEncoding("utf8")
process.stdin.on("readable", () => {
  const chunk = process.stdin.read()
  if (chunk !== null) {
    const input = chunk.toString().trim()

    if (input.startsWith("/broadcast ")) {
      const message = input.substring(11)
      chatServer.sendServerMessage(message)
    } else if (input === "/users") {
      const users = chatServer.getConnectedUsers()
      console.log(`👥 Usuarios conectados (${chatServer.getClientCount()}): ${users.join(", ")}`)
    } else if (input === "/help") {
      console.log(`
📋 Comandos disponibles:
  /broadcast <mensaje> - Enviar mensaje a todos los usuarios
  /users              - Mostrar usuarios conectados
  /help               - Mostrar esta ayuda
  /quit               - Cerrar servidor
      `)
    } else if (input === "/quit") {
      console.log("🛑 Cerrando servidor...")
      process.exit(0)
    }
  }
})

console.log(`
📋 Comandos disponibles:
  /broadcast <mensaje> - Enviar mensaje a todos los usuarios
  /users              - Mostrar usuarios conectados
  /help               - Mostrar esta ayuda
  /quit               - Cerrar servidor
`)
