const { create, benny } = require('@open-wa/wa-automate')
const welcome = require('./lib/welcome')
const bennymsg = require('./bennymsg')
const options = require('./options')

const start = async (uwak = new uwak()) => {
        console.log('[SERVER] Server Started!')
        // Force it to keep the current session
        uwak.onStateChanged((state) => {
            console.log('[benny State]', state)
            if (state === 'CONFLICT' || state === 'UNLAUNCHED') uwak.forceRefocus()
        })
        // listening on message
        uwak.onMessage((async (message) => {
            uwak.getAmountOfLoadedMessages()
            .then((msg) => {
                if (msg >= 500) {
                    uwak.cutMsgCache()
                }
            })
            uwakmsg(uwak, message)
        }))

        uwak.onGlobalParicipantsChanged((async (heuh) => {
            await welcome(uwak, heuh)
            //left(benny, heuh)
            }))
        
        uwak.onAddedToGroup(((chat) => {
            let totalMem = chat.groupMetadata.participants.length
            if (totalMem < 0) { 
            	uwak.sendText(chat.id, `Cih member nya cuma ${totalMem}, Kalo mau invite bot, minimal jumlah mem ada 0`).then(() => uwak.leaveGroup(chat.id)).then(() => uwak.deleteChat(chat.id))
            } else {
                uwak.sendText(chat.groupMetadata.id, `Halo warga grup *${chat.contact.name}* terimakasih sudah menginvite bot ini, untuk melihat menu silahkan kirim *!help*`)
            }
        }))

        /*uwak.onAck((x => {
            const { from, to, ack } = x
            if (x !== 3) uwak.sendSeen(to)
        }))*/

        // listening on Incoming Call
        uwak.onIncomingCall(( async (call) => {
            await uwak.sendText(call.peerJid, 'Maaf, saya tidak bisa menerima panggilan. nelfon = block!')
            .then(() => uwak.contactBlock(call.peerJid))
        }))
    }

create('Benny', options(true, start))
    .then(uwak => start(uwak))
    .catch((error) => console.log(error))
