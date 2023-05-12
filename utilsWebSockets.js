// Description: WebSocket server for the app

const WebSocket = require('ws')
const { v4: uuidv4 } = require('uuid')
const database    = require('./utilsMySQL.js')
const wait        = require('./utilsWait.js')

var db = new database() 
let result = {}
let llistaTotems = []
let llistaClients = []
class Obj {

    init (httpServer, port) {      

        // Define empty callbacks
        this.onConnection = (socket, id) => {}
        this.onMessage = (socket, id, obj) => { }

        // Run WebSocket server
        this.wss = new WebSocket.Server({ server: httpServer })
        this.socketsClients = new Map()
        console.log(`Listening for WebSocket queries on ${port}`)
        db.init({
            host: process.env.MYSQLHOST || "containers-us-west-186.railway.app",
            port: process.env.MYSQLPORT || 5617,
            user: process.env.MYSQLUSER || "root",
            password: process.env.MYSQLPASSWORD || "PubfEcTuGwZJ3sADED8K",
            database: process.env.MYSQLDATABASE || "railway"
          })
        this.numTotems=0
        this.llistaTotems = new Map()
        // What to do when a websocket client connects
        this.wss.on('connection', (ws) => { this.newConnection(ws) })
    }

    end () {
        this.wss.close()
    }

    // A websocket client connects
    newConnection (ws) {

        console.log("Client connected")
        // Add client to the clients list
        const id = uuidv4()
        const color = Math.floor(Math.random() * 360)
        const metadata = { id, color}
        this.ip=ws._socket.remoteAddress
        this.users = []
        this.socketsClients.set(ws, metadata)
        
        if(this.socketsClients.size==1){
            this.numTotems=this.numTotems+10
        }
        else{
            this.numTotems=this.numTotems+5
        }
        // Send clients list to everyone
        this.sendClients()
        // What to do when a client is disconnected
        ws.on("close", async () => { 
            if(this.socketsClients.size==1){
                this.numTotems=0
                llistaTotems={}
            }
            console.log(this.users);
            var count=0
            await Promise.all(
                this.users.map(async (user)=> {
                if (this.socketsClients.get(ws).id == user.id) {
                    this.users.slice(count,1)
                    await db.query("INSERT INTO Connexions(nom,cicle,ip,connexio) VALUES('"+user.nom+"','"+user.cicle+"','"+this.ip+"',0);")
                }
                count+=1
            }))
            this.socketsClients.delete(ws)
        })

        // What to do when a client message is received
        ws.on('message', (bufferedMessage) => { this.newMessage(ws, id, bufferedMessage)})
    }

    // Send clientsIds to everyone connected with websockets
    sendClients () {
        var clients = []
        this.socketsClients.forEach((value, key) => {
            clients.push(value.id)
        })
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                var id = this.socketsClients.get(client).id
                var messageAsString = JSON.stringify({ type: "clients", id: id, list: clients })
                client.send(messageAsString)
            }
        })
    }
  
    // Send a message to all websocket clients
    broadcast (obj) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                var messageAsString = JSON.stringify(obj)
                client.send(messageAsString)
            }
        })
    }
  
    // Send a private message to a specific websocket client
    private (obj) {
        this.wss.clients.forEach((client) => {
            if (this.socketsClients.get(client).id == obj.destination && client.readyState === WebSocket.OPEN) {
                var messageAsString = JSON.stringify(obj)
                client.send(messageAsString)
                return
            }
        })
    }

    // A message is received from a websocket client
    newMessage (ws, id, bufferedMessage) {
        var messageAsString = bufferedMessage.toString()
        var messageAsObject = {}
            
        try { messageAsObject = JSON.parse(messageAsString) } 
        catch (e) { console.log("Could not parse bufferedMessage from WS message") }

        if (this.onMessage && typeof this.onMessage === "function") {
            this.onMessage(ws, id, messageAsObject)
        }
    }
}

module.exports = Obj
