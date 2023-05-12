// Description: WebSocket server for the app

const WebSocket = require('ws')
const { v4: uuidv4 } = require('uuid');
const { log } = require('forever');
const wait = require('./utilsWait.js')
const database    = require('./utilsMySQL.js')
var db = new database()   // Database example: await db.query("SELECT * FROM test")
let result = {}
let llistaTotems = []
let numTotems = 0
let llistaClients = []
class Obj {

    init (httpServer, port, db) {

        // Set reference to database
        this.db = db

        // Run WebSocket server
        this.wss = new WebSocket.Server({ server: httpServer })
        this.socketsClients = new Map()
        console.log(`Listening for WebSocket queries on ${port}`)

        // What to do when a websocket client connects
        this.wss.on('connection', (ws) => { this.newConnection(ws) })

        this.wss.on('greet', function(data) {
            console.log(data);
            this.wss.emit('respond', { hello: 'Hey!' });
          });
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
        var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
        const metadata = { id, color,ip }
        this.socketsClients.set(ws, metadata)
        
        if(this.socketsClients.size==1){
            numTotems=numTotems+10
        }
        else{
            numTotems=numTotems+5
        }
        ws.send('paella')
        this.broadcast(numTotems)
        // Send clients list to everyone
        this.sendClients()
        // What to do when a client is disconnected
        ws.on("close", () => { 
            if(this.socketsClients.size==1){
                numTotems=0
                llistaTotems={}
            }
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
                var messageAsString = JSON.stringify({ status:"Clients",type: "clients", id: id, list: clients })
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
    async newMessage (ws, id, bufferedMessage) {
        var messageAsString = bufferedMessage.toString()
        var messageAsObject = {}
            
        try { messageAsObject = JSON.parse(messageAsString) } 
        catch (e) { console.log("Could not parse bufferedMessage from WS message") }

        if (messageAsObject.type == "bounce") {
            var rst = { type: "bounce", message: messageAsObject.message }
            ws.send(JSON.stringify(rst))

        } else if (messageAsObject.type == "broadcast") {

            var rst = { type: "broadcast", origin: id, message: messageAsObject.message }
            this.broadcast(rst)

        } else if (messageAsObject.type == "private") {

            var rst = { type: "private", origin: id, destination: messageAsObject.destination, message: messageAsObject.message }
            this.private(rst)
        }
        else if (messageAsObject.type=="newUser"){
            if(this.this.socketsClients.size==1){
                let totemsDisponibles = await db.query("select nom from Ocupacions where id_cicle=(select id from Cicles where nom='"+messageAsObject.cicle+"')");
                let nombreTotemsDisponibles = totemsDisponibles.map(item => item.nom);
                for (let i = 0; i < 5; i++){
                    let num = Math.floor(Math.random()*nombreTotemsDisponibles)
                    llistaTotems.push(totemsDisponibles[num].nom)
                }
                let totemsFalsos = await db.query("select nom from Ocupacions where id_cicle!=(select id from Cicles where nom='"+messageAsObject.cicle+"')");
                let nombreTotemsFalsos = totemsFalsos.map(item => item.nom);
                for (let i = 0; i < 5; i++){
                    let num1 = Math.floor(Math.random()*nombreTotemsFalsos)
                    llistaTotems.push(totemsDisponibles[num1].nom)
                }
            }
            else{
                let totemsDisponibles = await db.query("select nom from Ocupacions where id_cicle=(select id from Cicles where nom='"+messageAsObject.cicle+"')");
                let nombreTotemsDisponibles = totemsDisponibles.map(item => item.nom);
                for (let i = 0; i < 5; i++){
                    let num = Math.floor(Math.random()*nombreTotemsDisponibles)
                    llistaTotems.push(totemsDisponibles[num].nom)
                }
            }
            this.wss.clients.forEach((client) => {
                if (this.socketsClients.get(client).id == obj.idClient && client.readyState === WebSocket.OPEN) {
                    var ip = this.socketsClients.get(client).ip
                    let newClient = {ip: ip,nom:messageAsObject.nom,cicle:messageAsObject.cicle}
                    llistaClients.push(newClient)
                }
            })
            result={status:"OK",numTotems:numTotems,totems:llistaTotems}
            this.broadcast(result)
        }
    }
    
}

module.exports = Obj
