const express     = require('express')
const fs          = require('fs').promises
const WebSocket = require('ws')
const post        = require('./utilsPost.js')
const database    = require('./utilsMySQL.js')
const wait        = require('./utilsWait.js')
const webSockets  = require('./utilsWebSockets.js')
const { log } = require('console')

var db = new database()   // Database example: await db.query("SELECT * FROM test")
var ws = new webSockets()

// Start HTTP server
const app = express()
const port = process.env.PORT || 3000

// Publish static files from 'public' folder
app.use(express.static('public'))

let result = {}

// Activate HTTP server
const httpServer = app.listen(port, appListen)
function appListen () {
  console.log(`Listening for HTTP queries on: http://localhost:${port}`)
}

// Close connections when process is killed
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
function shutDown() {
  console.log('Received kill signal, shutting down gracefully');
  httpServer.close()
  db.end()
  ws.end()
  process.exit(0);
}

// Init objects
db.init({
  host: process.env.MYSQLHOST || "containers-us-west-128.railway.app",
  port: process.env.MYSQLPORT || 7219,
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "bdUIwVmp53UvoEx5he6j",
  database: process.env.MYSQLDATABASE || "railway"
})

ws.init(httpServer, port) 
ws.onConnection = (socket, id) => {
  // Aquest mètode es crida quan hi ha una nova connexió WebSocket
  console.log("WebSocket client connected")
}
ws.onMessage = async (socket, id, obj) => {
  // Aquest mètode es crida quan es rep un missatge per WebSocket
  if (obj.type == "bounce") {
    var rst = { type: "bounce", message: obj.message }
    socket.send(JSON.stringify(rst))
  
  } else if (obj.type == "broadcast") {
  
    var rst = { type: "broadcast", origin: id, message: obj.message }
    ws.broadcast(rst)
  
  } else if (obj.type == "private") {
  
    var rst = { type: "private", origin: id, destination: obj.destination, message: obj.message }
    ws.private(rst)
  }
  else if (obj.type=="newUser"){
    if(ws.socketsClients.size==1){
        let totemsDisponibles = await db.query("select nom from Ocupacions where id_cicle=(select id from Cicles where nom='"+obj.cicle+"')");
        let nombreTotemsDisponibles = totemsDisponibles.map(item => item.nom);
        for (let i = 0; i < 5; i++){
            let num = Math.floor(Math.random()*nombreTotemsDisponibles.length)
            ws.llistaTotems.push(totemsDisponibles[num].nom)
        }
        let totemsFalsos = await db.query("select nom from Ocupacions where id_cicle!=(select id from Cicles where nom='"+obj.cicle+"')");
        let nombreTotemsFalsos = totemsFalsos.map(item => item.nom);
        for (let i = 0; i < 5; i++){
            let num1 = Math.floor(Math.random()*nombreTotemsFalsos.length)
            ws.llistaTotems.push(totemsFalsos[num1].nom)
        }
    }
    else{
        let totemsDisponibles = await db.query("select nom from Ocupacions where id_cicle=(select id from Cicles where nom='"+obj.cicle+"')");
        let nombreTotemsDisponibles = totemsDisponibles.map(item => item.nom);
        for (let i = 0; i < 5; i++){
            let num = Math.floor(Math.random()*nombreTotemsDisponibles.length)
            ws.llistaTotems.push(totemsDisponibles[num].nom)
        }
    }
    ws.wss.clients.forEach(async (client) => {
        if (ws.socketsClients.get(client).id == obj.idClient && client.readyState === WebSocket.OPEN) {
            ws.users.push({id: obj.idClient, nom: obj.nom,cicle:obj.cicle})
            await db.query("insert into Connexions(nom,cicle,ip,connexio) values('"+obj.nom+"','"+obj.cicle+"','"+ws.ip+"',1);");
        }
    })
    result={status:"OK",type:"newClient",totems:ws.llistaTotems}
    ws.broadcast(result)
}
}

// Define routes
app.post('/get_families_professionals', getFamilies)
async function getFamilies (req, res) {

  let receivedPOST = await post.getPostObject(req)
  let result = { status: "ERROR", message: "Unkown type" }

  if (receivedPOST) {
    const families = await db.query("select nom from Families_Professionals");
    const nombreFamilies = families.map(item => item.nom);
    result = {status: "OK", message: "Les families",families: nombreFamilies}
    }

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(result))
}

// Define routes
app.post('/get_cicles', getCicles)
async function getCicles (req, res) {

  let receivedPOST = await post.getPostObject(req)
  let result = { status: "ERROR", message: "Unkown type" }

  if (receivedPOST) {
    const cont = await db.query("select count(*) as cont from Families_Professionals where nom='"+receivedPOST.nom+"'");
    if(cont[0]["cont"]>0){
      const id = await db.query("select id from Families_Professionals where nom='"+receivedPOST.nom+"'");
      const ciclos = await db.query("select nom from Cicles where id_familia_professional="+id[0]["id"]+"");
      const nombreCiclos = ciclos.map(item => item.nom);

      result = {status: "OK", message: "Si existeix la familia",ciclos: nombreCiclos}
    }else{
      result = {status: "ERROR", message: "No existeix la familia indicada"}
    }
  }

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(result))
}

// Define routes
app.post('/set_record', setRecord)
async function setRecord (req, res) {

  let receivedPOST = await post.getPostObject(req)
  let result = { status: "ERROR", message: "Unkown type" }

  if (receivedPOST) {
    const cont = await db.query("select count(*) as cont from Cicles where nom='"+receivedPOST.cicle+"'");
    if(cont[0]["cont"]>0){
      const id = await db.query("select id from Cicles where nom='"+receivedPOST.cicle+"'");
      var tempsLimit = 600;
      let puntuacion=0;
      let [horas, minutos, segundos] = receivedPOST.temps.split(":");
      let segundosTotales = parseInt(horas) * 3600 + parseInt(minutos) * 60 + parseInt(segundos);
      let segundosRestantes=tempsLimit-segundosTotales;
      if(segundosTotales<tempsLimit){
        puntuacion=(receivedPOST.encerts*(150+(segundosRestantes)))-(receivedPOST.errades*Math.round((segundosTotales)/4));
      }
      else{
        puntuacion=(receivedPOST.encerts*150)-(receivedPOST.errades*Math.round(tempsLimit/4));
      }
      if(puntuacion<0){
        puntuacion=0;
      }
      await db.query("insert into Ranking(alies,cicle, puntuacio, temps, encerts, errades, visible, ip_jugador, dispositiu) values('"+ receivedPOST.alies+"',"+ id[0]["id"]+", "+puntuacion+", '"+ receivedPOST.temps +"', "+ receivedPOST.encerts +", "+receivedPOST.errades+", 1, '"+receivedPOST.ip+"','"+receivedPOST.dispositiu+"');");

      result = {status: "OK", message: "S'ha afegit el record"}
    }else{
      result = {status: "ERROR", message: "No existeix el cicle indicat"}
    }
  }

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(result))
}

app.post('/get_ranking',getRanking)
async function getRanking(req,res){
  let receivedPOST = await post.getPostObject(req)
  let result = { status: "ERROR", message: "Unkown type" }
  let ranking = [];
  if(receivedPOST){
    if(receivedPOST.limitElements<=20){
      ranking = await db.query("SELECT * FROM Ranking WHERE visible=1 ORDER BY Puntuacio desc LIMIT "+receivedPOST.limitInici+", "+receivedPOST.limitElements+";")
    }
    else if(receivedPOST.limitElements>20){
      ranking = await db.query("SELECT * FROM Ranking WHERE visible=1 ORDER BY Puntuacio desc LIMIT "+receivedPOST.limitInici+", 20;")
    }
    result = {status: "OK", message: "El ranking", ranking: ranking}
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(result))
}

app.post('/get_all_rankings',getAllRanking)
async function getAllRanking(req,res){
  let receivedPOST = await post.getPostObject(req)
  let result = { status: "ERROR", message: "Unkown type" }
  if(receivedPOST){
    let ranking = await db.query("SELECT * FROM Ranking;")

    for (let jugador of ranking) {
      let nomCicle = await db.query("SELECT nom FROM Cicles where id="+jugador.cicle+";")
      jugador.cicle = nomCicle[0]["nom"];
    }

    result = {status: "OK", message: "Totes les dades del ranking", ranking: ranking}
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(result))
}

app.post('/update_visible',updateVisible)
async function updateVisible(req,res){
  let receivedPOST = await post.getPostObject(req)
  let result = { status: "ERROR", message: "Unkown type" }
  if(receivedPOST){
    if (receivedPOST.visible=="Si"){
      await db.query("UPDATE Ranking SET visible=1 where id="+receivedPOST.id+";")
    }else if(receivedPOST.visible=="No"){
      await db.query("UPDATE Ranking SET visible=0 where id="+receivedPOST.id+";")
    }

    result = {status: "OK", message: "Visibilitat modificada correctament"}
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(result))
}

app.post('/totems',totems)
async function totems(req,res){
  let receivedPOST = await post.getPostObject(req)
  let result = { status: "ERROR", message: "Unkown type" }
  if(receivedPOST){
    let totemsDisponibles = await db.query("select nom from Ocupacions where id_cicle=(select id from Cicles where nom='"+receivedPOST.cicle+"')");
    const nombreTotemsDisponibles = totemsDisponibles.map(item => item.nom);

    let totemsFalsos = await db.query("select nom from Ocupacions where id_cicle!=(select id from Cicles where nom='"+receivedPOST.cicle+"')");
    const nombreTotemsFalsos = totemsFalsos.map(item => item.nom);

    result = {status: "OK", message: "Totems", correctos: nombreTotemsDisponibles, falsos: nombreTotemsFalsos}
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(result))
}