class ChatClient {
  constructor() {
    this.ws = null
    this.username = ""
    this.isConnected = false
    this.isRegistered = false

    this.initializeElements()
    this.setupEventListeners()
    this.connect()
  }

  initializeElements() {
    // Elementos del DOM
    this.connectionStatus = document.getElementById("connectionStatus")
    this.statusText = document.getElementById("statusText")
    this.messagesContainer = document.getElementById("messagesContainer")
    this.usernameForm = document.getElementById("usernameForm")
    this.messageForm = document.getElementById("messageForm")
    this.usernameInput = document.getElementById("usernameInput")
    this.messageInput = document.getElementById("messageInput")
    this.joinButton = document.getElementById("joinButton")
    this.sendButton = document.getElementById("sendButton")
    this.usersList = document.getElementById("usersList")
    this.usersCount = document.getElementById("usersCount")
    this.helpModal = document.getElementById("helpModal")
    this.closeModal = document.getElementById("closeModal")
  }

  setupEventListeners() {
    // Botón de unirse al chat
    this.joinButton.addEventListener("click", () => {
      this.joinChat()
    })

    // Enter en el input de username
    this.usernameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.joinChat()
      }
    })

    // Botón de enviar mensaje
    this.sendButton.addEventListener("click", () => {
      this.sendMessage()
    })

    // Enter en el input de mensaje
    this.messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.sendMessage()
      }
    })

    // Modal de ayuda
    this.closeModal.addEventListener("click", () => {
      this.helpModal.style.display = "none"
    })

    // Cerrar modal al hacer click fuera
    window.addEventListener("click", (e) => {
      if (e.target === this.helpModal) {
        this.helpModal.style.display = "none"
      }
    })
  }

  connect() {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const wsUrl = `${protocol}//${window.location.host}`

      this.updateConnectionStatus("connecting", "Conectando...")

      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.isConnected = true
        this.updateConnectionStatus("connected", "Conectado")
        console.log("✅ Conectado al servidor")
      }

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data))
      }

      this.ws.onclose = () => {
        this.isConnected = false
        this.isRegistered = false
        this.updateConnectionStatus("disconnected", "Desconectado")
        this.showMessage("system", "Conexión perdida. Intentando reconectar...")

        // Intentar reconectar después de 3 segundos
        setTimeout(() => {
          if (!this.isConnected) {
            this.connect()
          }
        }, 3000)
      }

      this.ws.onerror = (error) => {
        console.error("❌ Error de WebSocket:", error)
        this.showMessage("system", "Error de conexión")
      }
    } catch (error) {
      console.error("❌ Error conectando:", error)
      this.updateConnectionStatus("disconnected", "Error de conexión")
    }
  }

  updateConnectionStatus(status, text) {
    const statusDot = this.connectionStatus.querySelector(".status-dot")
    statusDot.className = `status-dot ${status}`
    this.statusText.textContent = text
  }

  handleMessage(message) {
    switch (message.type) {
      case "server_message":
        this.showMessage("server", message.content)
        break

      case "username_error":
        this.showMessage("system", message.content)
        this.usernameInput.focus()
        break

      case "user_registered":
        this.username = message.username
        this.isRegistered = true
        this.showMessage("system", `Te has unido al chat como "${message.username}"`)
        this.switchToMessageMode()
        break

      case "message":
        if (message.username && message.content) {
          const messageType = message.username === this.username ? "user" : "other"
          this.showMessage(messageType, message.content, message.username)
        }
        break

      case "user_joined":
        if (message.content) {
          this.showMessage("system", `🟢 ${message.content}`)
        }
        break

      case "user_left":
        if (message.content) {
          this.showMessage("system", `🔴 ${message.content}`)
        }
        break

      case "user_list":
        this.updateUsersList(message.users, message.count)
        break
    }
  }

  showMessage(type, content, username = null) {
    const messageDiv = document.createElement("div")
    messageDiv.className = `message ${type}`

    let messageHTML = ""

    if (type === "user" || type === "other") {
      const time = new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })

      messageHTML = `
                <div class="message-header">
                    ${username}
                    <span class="message-time">${time}</span>
                </div>
                <div>${this.escapeHtml(content)}</div>
            `
    } else {
      messageHTML = this.escapeHtml(content)
    }

    messageDiv.innerHTML = messageHTML

    // Limpiar mensaje de bienvenida si existe
    const welcomeMessage = this.messagesContainer.querySelector(".welcome-message")
    if (welcomeMessage) {
      welcomeMessage.remove()
    }

    this.messagesContainer.appendChild(messageDiv)
    this.scrollToBottom()
  }

  updateUsersList(users, count) {
    this.usersCount.textContent = `${count} usuario${count !== 1 ? "s" : ""}`

    this.usersList.innerHTML = ""
    users.forEach((user) => {
      const li = document.createElement("li")
      li.textContent = user
      if (user === this.username) {
        li.style.fontWeight = "bold"
        li.style.color = "#4facfe"
      }
      this.usersList.appendChild(li)
    })
  }

  joinChat() {
    const username = this.usernameInput.value.trim()

    if (!username) {
      alert("Por favor, ingresa un nombre de usuario")
      return
    }

    if (!this.isConnected) {
      alert("No hay conexión al servidor")
      return
    }

    this.sendToServer({
      type: "user_joined",
      username: username,
      timestamp: Date.now(),
    })

    this.joinButton.disabled = true
    this.usernameInput.disabled = true
  }

  switchToMessageMode() {
    this.usernameForm.style.display = "none"
    this.messageForm.style.display = "flex"
    this.messageInput.focus()
  }

  sendMessage() {
    const content = this.messageInput.value.trim()

    if (!content) return

    // Verificar comandos
    if (content.startsWith("/")) {
      this.handleCommand(content)
      this.messageInput.value = ""
      return
    }

    if (!this.isConnected || !this.isRegistered) {
      alert("No estás conectado al chat")
      return
    }

    this.sendToServer({
      type: "message",
      content: content,
      timestamp: Date.now(),
    })

    this.messageInput.value = ""
  }

  handleCommand(command) {
    const cmd = command.toLowerCase()

    switch (cmd) {
      case "/help":
        this.helpModal.style.display = "block"
        break

      case "/clear":
        this.messagesContainer.innerHTML = ""
        this.showMessage("system", "Chat limpiado")
        break

      case "/users":
        const userCount = this.usersList.children.length
        const users = Array.from(this.usersList.children).map((li) => li.textContent)
        this.showMessage("system", `Usuarios conectados (${userCount}): ${users.join(", ")}`)
        break

      default:
        this.showMessage("system", `Comando desconocido: ${command}. Usa /help para ver comandos disponibles.`)
        break
    }
  }

  sendToServer(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }
}

// Inicializar el cliente cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
  new ChatClient()
})
