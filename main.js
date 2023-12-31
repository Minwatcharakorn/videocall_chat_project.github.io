const APP_ID = "e83b916113d04fac970b45cfbde29930"
const TOKEN = "007eJxTYODmmJLndzt/dnxdq5C0x9Ip91MSWJkb34kbWaZPZnus4q7AkGphnGRpaGZoaJxiYJKWmGxpbpBkYpqclpSSamRpaWyQaPsjpSGQkcHkgDITIwMEgvgsDLmJmXkMDAAvQhum"
const CHANNEL = "main"


const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

const iconElement = document.createElement("i");

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {

    client.on('user-published', handleUserJoined)
    
    client.on('user-left', handleUserLeft)
    
    let UID = await client.join(APP_ID, CHANNEL, TOKEN, null)

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks() 

    let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}"></div>
                  </div>`
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    localTracks[1].play(`user-${UID}`)
    
    await client.publish([localTracks[0], localTracks[1]])
}

let joinStream = async () => {
    await joinAndDisplayLocalStream()
    document.getElementById('join-btn').style.display = 'none'
    document.getElementById('stream-controls').style.display = 'flex'
}

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user 
    await client.subscribe(user, mediaType)

    if (mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player != null){
            player.remove()
        }

        player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"></div> 
                 </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio'){
        user.audioTrack.play()
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async () => {
    for(let i = 0; localTracks.length > i; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
    document.getElementById('join-btn').style.display = 'block'
    document.getElementById('stream-controls').style.display = 'none'
    document.getElementById('video-streams').innerHTML = ''
    
    // เปลี่ยนไอคอนเป็น "fas fa-sign-in-alt"
    document.getElementById('leave-icon').style.fontSize = '24px';
    document.getElementById('leave-icon').classList.add('fa-sign-in-alt')
    document.getElementById('leave-icon').classList.remove('fa-sign-out-alt')
}

let toggleMic = async (e) => {
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.innerText = ' Mic on'
        e.target.style.backgroundColor = '#8fce00'
        
        document.getElementById('mic-icon').style.fontSize = '24px';
        document.getElementById('mic-icon').classList.add('fa-microphone')
        document.getElementById('mic-icon').classList.remove('fa-microphone-slash')
    } else {
        await localTracks[0].setMuted(true)
        e.target.innerText = ' Mic off'
        e.target.style.backgroundColor = '#EE4B2B'
        
        document.getElementById('mic-icon').style.fontSize = '24px';
        document.getElementById('mic-icon').classList.add('fa-microphone-slash')
        document.getElementById('mic-icon').classList.remove('fa-microphone')
    }
}


let toggleCamera = async (e) => {
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.innerText = ' Camera ON'
        e.target.style.backgroundColor = '#8fce00'
        // เปลี่ยนไอคอนเป็น "fas fa-video"
        document.getElementById('camera-icon').style.fontSize = '24px';
        document.getElementById('camera-icon').classList.add('fa-video')
        document.getElementById('camera-icon').classList.remove('fa-video-slash')
    }else{
        await localTracks[1].setMuted(true)
        e.target.innerText = ' Camera OFF'
        e.target.style.backgroundColor = '#EE4B2B'
        // เปลี่ยนไอคอนเป็น "fas fa-video-slash"
        document.getElementById('camera-icon').style.fontSize = '24px';
        document.getElementById('camera-icon').classList.add('fa-video-slash')
        document.getElementById('camera-icon').classList.remove('fa-video')
    }
}

document.getElementById('join-btn').addEventListener('click', joinStream)
document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)