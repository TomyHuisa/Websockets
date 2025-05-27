export interface ChatMessage {
  type: "message" | "user_joined" | "user_left" | "server_message" | "user_list"
  username?: string
  content?: string
  users?: string[]
  timestamp: number
}

export interface ClientInfo {
  username: string
  socket: any
}
