const socket = io()

//elements
const $MessageForm = document.querySelector('#msg-form')
const $MessageFormInput = $MessageForm.querySelector('input')
const $MessageFormButton = $MessageForm.querySelector('button')
const $LocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $chatSidebar = document.querySelector('#sidebar')

//templates
const MessageTemplate = document.querySelector('#message-template').innerHTML
const LocationTemplate = document.querySelector('#location-template').innerHTML
const SidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix:true})


const autoScroll = ()=>{
    //new message 
    const $newMessage = $messages.lastElementChild

    //height of the new message
    //get the style of the new msg from css by the method provided by browser
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin


    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of container
    const containerHeight = $messages.scrollHeight

    //How far i have scroll?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight-newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}


socket.on('message',(s)=>{
   
    let html = Mustache.render(MessageTemplate,{
        username:s.username,
        message: s.text,
        createdAt : moment(s.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
     console.log(s)
     autoScroll()
})

$MessageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
     
    //disable the form until the message is sent
     $MessageFormButton.setAttribute('disabled','disabled')
    
    let message = e.target.elements.msg.value
    socket.emit('sendMessage',message,(error)=>{

        //again enable it when ack is received that msg sent
        $MessageFormButton.removeAttribute('disabled')
        $MessageFormInput.value=''
        $MessageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log("Message delivered!")
    })
})

$LocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by user browser')
    }
    
    //disable location btn once clicked
    $LocationButton.setAttribute('disabled','disabled')

    //this method doesnt support promises
    navigator.geolocation.getCurrentPosition((position)=>{
           let location = {
                latitude : position.coords.latitude,
                longitude : position.coords.longitude
            }
            socket.emit('sendLocation',location,()=>{
                //enable the location btn when location sent
                $LocationButton.removeAttribute('disabled')
                console.log("Location Sent")
            })
    })
})

socket.on('locationMessage',(locationLink)=>{

    let html = Mustache.render(LocationTemplate,{ 
        username : locationLink.username,
        url:locationLink.text, 
        createdAt: moment(locationLink.createdAt).format('h:mm a') })
    $messages.insertAdjacentHTML('beforeend',html)
    console.log(locationLink.text)
    autoScroll()
})

socket.emit('join',{username, room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})

socket.on('roomData',({room,users})=>{
     
    let html = Mustache.render(SidebarTemplate,{ room:room,users:users})
    $chatSidebar.innerHTML = html
    console.log(room)
     console.log(users)
})