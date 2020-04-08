
const users = []

const addUser = ({ id, username, room }) => {

    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if (!username || !room) {
        return {
            error: 'username and name are required!'
        }
    }


    //check for existing user 
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })



    //validate username
    if (existingUser) {
        return {
            error: 'Username already exist! Please try another username.'
        }
    }



    // store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

//remove user 
const removeUser = (id) => {

    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

//get user
const getUser = (id) => {
    return users.find((user) => user.id === id)

}

//getUsers in a room
const getUsersInRoom = (room) => {
    return users.filter((user) => { return user.room === room })

}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}