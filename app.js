const express     = require('express')
const fs          = require('fs').promises

const post        = require('./utilsPost.js')
const database    = require('./utilsMySQL.js')
const wait        = require('./utilsWait.js')
const webSockets  = require('./utilsWebSockets.js')

var db = new database()   // Database example: await db.query("SELECT * FROM test")
var ws = new webSockets()

// Start HTTP server
const app = express()
const port = process.env.PORT || 3000

// Publish static files from 'public' folder
app.use(express.static('public'))

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
  host: process.env.MYSQLHOST || "containers-us-west-168.railway.app",
  port: process.env.MYSQLPORT || 5657,
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "2nhSo0brHkHt78S9xV12",
  database: process.env.MYSQLDATABASE || "railway"
})

ws.init(httpServer, port) 
ws.onConnection = (socket, id) => {
  // Aquest mètode es crida quan hi ha una nova connexió WebSocket
  console.log("WebSocket client connected")
}
ws.onMessage = (socket, id, obj) => {
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
      await db.query("insert into Ranking(alies,cicle, puntuacio, temps, encerts, errades) values('"+ receivedPOST.alies+"',"+ id[0]["id"]+", "+puntuacion+", '"+ receivedPOST.temps +"', "+ receivedPOST.encerts +", "+receivedPOST.errades+");");

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