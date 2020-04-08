const generateMessage = (username, message) => {
    return {
        username,
        text: message,
        createdAt: new Date().getTime()
    }
}

const generateOldMessage = (data) => {
    return {
        username: data.username,
        text: data.text,
        createdAt: data.createDate
    }

}

const generateLocationMessage = (username, url) => {
    return {
        username,
        text: url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateOldMessage,
    generateLocationMessage
}