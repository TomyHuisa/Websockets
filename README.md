# Sistema de Chat Web

Un sistema de chat web en tiempo real construido con JavaScript vanilla, HTML, CSS y Node.js con WebSockets.

## 🚀 Características

- **Interfaz web moderna** con diseño responsive
- **Comunicación en tiempo real** usando WebSockets
- **Múltiples usuarios** simultáneos
- **Lista de usuarios** actualizada en tiempo real
- **Comandos de chat** (/help, /clear, /users)
- **Notificaciones** de entrada/salida de usuarios
- **Reconexión automática** en caso de pérdida de conexión
- **Diseño responsive** para móviles y escritorio

## 📦 Instalación

1. **Instalar Node.js** (versión 16 o superior)

2. **Clonar o descargar** los archivos del proyecto

3. **Instalar dependencias**:
   \`\`\`bash
   npm install
   \`\`\`

## 🎮 Uso

### Iniciar el Servidor

\`\`\`bash
npm start
\`\`\`

El servidor se iniciará en http://localhost:3000

### Acceder al Chat

1. Abre tu navegador web
2. Ve a http://localhost:3000
3. Ingresa tu nombre de usuario
4. ¡Comienza a chatear!

### Comandos del Servidor (Terminal)

Mientras el servidor está ejecutándose, puedes usar estos comandos en la terminal:

- \`/broadcast <mensaje>\` - Enviar mensaje a todos los usuarios
- \`/users\` - Mostrar usuarios conectados
- \`/help\` - Mostrar ayuda
- \`/quit\` - Cerrar servidor

### Comandos del Cliente (Chat Web)

- \`/help\` - Mostrar ayuda
- \`/clear\` - Limpiar el área de mensajes
- \`/users\` - Mostrar lista de usuarios conectados

## 🎯 Funcionalidades

### ✅ Implementadas

- **Conexión WebSocket** en tiempo real
- **Interfaz web** moderna y responsive
- **Validación de nombres** de usuario únicos
- **Lista de usuarios** en tiempo real
- **Mensajes diferenciados** por usuario
- **Notificaciones del sistema**
- **Comandos de chat**
- **Reconexión automática**
- **Scroll automático** de mensajes
- **Timestamps** en mensajes
- **Modal de ayuda**

### 🎨 Diseño

- **Gradientes modernos** y colores atractivos
- **Animaciones suaves** para mensajes
- **Indicador de estado** de conexión
- **Panel lateral** de usuarios
- **Diseño responsive** para móviles
- **Scrollbars personalizados**

## 🛠️ Arquitectura

- **server.js**: Servidor Node.js con Express y WebSockets
- **index.html**: Interfaz principal del chat
- **client.js**: Lógica del cliente en JavaScript vanilla
- **style.css**: Estilos CSS con diseño moderno
- **package.json**: Configuración y dependencias

## 🌐 Tecnologías Utilizadas

- **Backend**: Node.js, Express, WebSockets (ws)
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Comunicación**: WebSockets para tiempo real
- **Diseño**: CSS Grid, Flexbox, Gradientes

## 📱 Responsive Design

El chat funciona perfectamente en:
- **Escritorio** (1200px+)
- **Tablet** (768px - 1199px)
- **Móvil** (hasta 767px)

## 🔧 Personalización

Puedes modificar fácilmente:
- **Colores y temas** en \`style.css\`
- **Puerto del servidor** en \`server.js\`
- **Comandos disponibles** en \`client.js\`
- **Límites de caracteres** para mensajes
- **Funcionalidades adicionales**

## 🚀 Despliegue

Para desplegar en producción:

1. **Configurar variables de entorno**
2. **Usar HTTPS/WSS** para conexiones seguras
3. **Configurar proxy reverso** (nginx)
4. **Usar PM2** para gestión de procesos

¡Disfruta chateando! 💬
