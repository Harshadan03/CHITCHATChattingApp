const express = require('express')
const app = express()
const http = require('http')
const path = require('path')
const ip = require('ip')
const socketIo = require('socket.io')
const Filter = require('bad-words')



const uri = process.env.MONGODB_URL || "mongodb://localhost:5000/"

const { generateMessage, generateLocationMessage, generateOldMessage } = require('./utils/messages')
const { getUser, getUsersInRoom, addUser, removeUser } = require('./utils/users')

const server = http.createServer(app)

const io = socketIo(server)
const port = process.env.PORT || 7000

const publicDirectory = path.join(__dirname, "../public")

const mongoClient = require('mongodb').MongoClient
//connect to db
mongoClient.connect(uri, { useUnifiedTopology: true }, function (err, db) {
    if (err) {
        throw err;
    }
    console.log('Mongo connected.....')
    let dbo = db.db('chatroomdb')
    let chat = dbo.collection('chats')

    io.on('connection', (socket) => {
        console.log('A new websocket connection.')


        socket.on('join', (options, callback) => {
            const { error, user } = addUser({ id: socket.id, ...options })
            if (error) {
                return callback(error)
            }
            socket.join(user.room)
            socket.emit('message', generateMessage("Admin", "Welcome!"))
            socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.username} has joined.`))



            //get chats from mongod collection
            chat.find({ room: user.room }).limit(100).sort({ _id: 1 }).toArray(function (err, res) {
                if (err) {
                    throw err
                }

                //Emit the message
                if (res.length) {
                    for (let i = 0; i < res.length; i++) {
                        socket.emit('message', generateOldMessage(res[i]))
                    }
                }
            })

            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
            callback()
        })




        socket.on('sendMessage', (msg, callback) => {

            const user = getUser(socket.id)
            let filter = new Filter()

            if (filter.isProfane(msg)) {
                return callback('profane word not allowed')
            }

            //insert messages
            chat.insertOne({ username: user.username, room: user.room, text: msg, createdDate: new Date().getTime() }, function () {


                io.to(user.room).emit('message', generateMessage(user.username, msg))

            })

            callback()
        })

        socket.on('sendLocation', (location, callback) => {
            const user = getUser(socket.id)

            //we r broadcasting the location msg as link to Google map
            io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
            callback()
        })
        socket.on('disconnect', () => {
            const user = removeUser(socket.id)

            if (user) {
                socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.username} user has left`))
                io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
            }

        })

    })

})

app.use(express.static(publicDirectory))

server.listen(port, function () {
    console.log(`Server is listening at http://${ip.address()}:${port}`)
})