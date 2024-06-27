let express = require('express')
let {open} = require('sqlite')
let sqlite3 = require('sqlite3')

let app = express()
let path = require('path')
let db_path = path.join(__dirname, 'cricketTeam.db')
app.use(express.json())
let db = null

let initializeServerAndDb = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`The error is ${e.message}`)
    process.exit(1)
  }
}

initializeServerAndDb()

let convertCase = player => {
  return {
    playerId: player.player_id,
    playerName: player.player_name,
    jerseyNumber: player.jersey_number,
    role: player.role,
  }
}

app.get('/players/', async (request, response) => {
  let query = `select * from cricket_team;`
  let players = await db.all(query)
  response.send(players.map(eachPlayer => convertCase(eachPlayer)))
})

app.post('/players/', async (request, response) => {
  let playerDetails = request.body
  let {player_name, jersey_number, role} = playerDetails
  let insertQuery = `insert into cricket_team
      (player_name,jersey_number,role)
      values('${player_name}',${jersey_number},'${role}');`
  let insertOperation = await db.run(insertQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId', async (request, response) => {
  let {playerId} = request.params
  let specificPlayer = `select * from cricket_team
  where player_id = ${playerId}`
  let singlePlayer = await db.get(specificPlayer)
  let singlePlayerCase = convertCase(singlePlayer)
  response.send(singlePlayerCase)
})

app.put('/players/:playerId', async (request, response) => {
  let {playerId} = request.params
  let playerDetails = request.body
  let {player_name, jersey_number, role} = playerDetails
  let updateQuery = `update cricket_team 
  set player_name = '${player_name}',
      jersey_number =${jersey_number},
      role ='${role}' 
      where player_id =${playerId};`
  let insertOperation = await db.run(updateQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  let {playerId} = request.params
  let deleteQuery = `delete from cricket_team
  where player_id =${playerId};`
  let deleteOperation = db.run(deleteQuery)
  response.send('Player Removed')
})

module.exports = app
