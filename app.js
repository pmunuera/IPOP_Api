const express     = require('express')
const fs          = require('fs').promises

const webSockets  = require('./appWS.js')
const post        = require('./utilsPost.js')
const database    = require('./utilsMySQL.js')
const wait        = require('./utilsWait.js')

var db = new database()   // Database example: await db.query("SELECT * FROM test")
var ws = new webSockets()

// Start HTTP server
const app = express()
const port = process.env.PORT || 3000

// Publish static files from 'public' folder
app.use(express.static('public'))

// Activate HTTP server
const httpServer = app.listen(port, appListen)
//console.log(httpServer);
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
  host: process.env.MYSQLHOST || "localhost",
  port: process.env.MYSQLPORT || 3306,
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "",
  database: process.env.MYSQLDATABASE || "IPOP"
})
ws.init(httpServer, port, db)


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
      // const id = await db.query("select id from Families_Professionals where nom='"+receivedPOST.nom+"'");
      // const ciclos = await db.query("select nom from Cicles where id_familia_professional="+id[0]["id"]+"");
      // const nombreCiclos = ciclos.map(item => item.nom);
      await db.query("insert into Ranking(alies,cicle, puntuacio, temps, encerts, errades) values('"+ receivedPOST.alies+"','"+ receivedPOST.name+"', 18, '"+ receivedPOST.temps +"', "+ receivedPOST.encerts +", '"+receivedPOST.errades+"');");

      result = {status: "OK", message: "Si existeix el cicle"}
    }else{
      result = {status: "ERROR", message: "No existeix el cicle indicat"}
    }
  }

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(result))
}