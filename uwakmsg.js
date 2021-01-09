const { decryptMedia } = require('@open-wa/wa-decrypt')
const fs = require('fs-extra')
const axios = require('axios')
const moment = require('moment-timezone')
const get = require('got')
const fetch = require('node-fetch')
const color = require('./lib/color')
const { spawn, exec } = require('child_process')
const nhentai = require('nhentai-js')
const { API } = require('nhentai-api')
const { liriklagu, quotemaker, randomNimek, fb, sleep, jadwalTv, ss } = require('./lib/functions')
const { help, snk, info, donate, readme, listChannel } = require('./lib/help')
const { stdout } = require('process')
const nsfw_ = JSON.parse(fs.readFileSync('./lib/NSFW.json'))
const welkom = JSON.parse(fs.readFileSync('./lib/welcome.json'))
const { RemoveBgResult, removeBackgroundFromImageBase64, removeBackgroundFromImageFile } = require('remove.bg')
const _biodata = JSON.parse(fs.readFileSync('./ingfo/biodata.json'))
const _registered = JSON.parse(fs.readFileSync('./ingfo/registered.json'))
const _premium = JSON.parse(fs.readFileSync('./lib/premium.json'))
const ban = JSON.parse(fs.readFileSync('./lib/banned.json'))

moment.tz.setDefault('Asia/Jakarta').locale('id')

module.exports = msgHandler = async (benny, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, chatId, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName } = sender
        pushname = pushname || verifiedName
        const commands = caption || body || ''
        const command = commands.toLowerCase().split(' ')[0] || ''
        const args =  commands.split(' ')

        const msgs = (message) => {
            if (command.startsWith('#')) {
                if (message.length >= 10){
                    return `${message.substr(0, 15)}`
                }else{
                    return `${message}`
                }
            }
        }

        const mess = {
            wait: '[ WAIT ] Sedang di proses⏳ silahkan tunggu sebentar',
            error: {
                St: '[❗] Kirim gambar dengan caption *#sticker* atau tag gambar yang sudah dikirim',
                Qm: '[❗] Terjadi kesalahan, mungkin themenya tidak tersedia!',
                Yt3: '[❗] Terjadi kesalahan, tidak dapat meng konversi ke mp3!',
                Yt4: '[❗] Terjadi kesalahan, mungkin error di sebabkan oleh sistem.',
                Ig: '[❗] Terjadi kesalahan, mungkin karena akunnya private',
                Ki: '[❗] Bot tidak bisa mengeluarkan admin group!',
                Ad: '[❗] Tidak dapat menambahkan target, mungkin karena di private',
                Iv: '[❗] Link yang anda kirim tidak valid!'
            }
        }

        const time = moment(t * 1000).format('DD/MM HH:mm:ss')
        const botNumber = await uwak.getHostNumber()
        const blockNumber = await uwak.getBlockedIds()
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await uwak.getGroupAdmins(groupId) : ''
        const isGroupAdmins = isGroupMsg ? groupAdmins.includes(sender.id) : false
        const isBotGroupAdmins = isGroupMsg ? groupAdmins.includes(botNumber + '@c.us') : false
        const pilotNumber = '628xxxxxx@c.us'
        const isPilot = sender.id === pilotNumber
        const isBlocked = blockNumber.includes(sender.id)
		const isRegistered = _registered.includes(sender.id)
		const isPremium = _premium.includes(sender.id)
        const isNsfw = isGroupMsg ? nsfw_.includes(chat.id) : false
		const isQuotedImage = quotedMsg && quotedMsg.type === 'image'
		const q = args.join(' ')
		const isBanned = ban.includes(chatId)
        const uaOverride = 'WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
        const isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi)
        if (!isGroupMsg && command.startsWith('#')) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(msgs(command)), 'from', color(pushname))
        if (isGroupMsg && command.startsWith('#')) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(msgs(command)), 'from', color(pushname), 'in', color(formattedTitle))
        //if (!isGroupMsg && !command.startsWith('#')) console.log('\x1b[1;33m~\x1b[1;37m>', '[\x1b[1;31mMSG\x1b[1;37m]', time, color(body), 'from', color(pushname))
        //if (isGroupMsg && !command.startsWith('#')) console.log('\x1b[1;33m~\x1b[1;37m>', '[\x1b[1;31mMSG\x1b[1;37m]', time, color(body), 'from', color(pushname), 'in', color(formattedTitle))
        if (isBlocked) return
        //if (!isOwner) return
        switch(command) {
			//if (!isRegistered)
        case '#sticker':
        case '#stiker':
				    if (!isRegistered) return uwak.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (isMedia && type === 'image') {
                const mediaData = await decryptMedia(message, uaOverride)
                const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                await uwak.sendImageAsSticker(from, imageBase64)
            } else if (quotedMsg && quotedMsg.type == 'image') {
                const mediaData = await decryptMedia(quotedMsg, uaOverride)
                const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                await uwak.sendImageAsSticker(from, imageBase64)
            } else if (args.length === 2) {
                const url = args[1]
                if (url.match(isUrl)) {
                    await uwak.sendStickerfromUrl(from, url, { method: 'get' })
                        .catch(err => console.log('Caught exception: ', err))
                } else {
                    uwak.reply(from, mess.error.Iv, id)
                }
            } else {
                    uwak.reply(from, mess.error.St, id)
            }
            break
        case '#stickergif':
		case '#gifsticker':
		if (!isPremium) return uwak.sendText(from, `Nomor kamu belum terdaftar sebagai user premium. Hubungi owner untuk mendaftar!`)
		if (!isRegistered) return uwak.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (isMedia) {
                if (mimetype === 'video/mp4' && message.duration < 20 || mimetype === 'image/gif' && message.duration < 20) {
                    const mediaData = await decryptMedia(message, uaOverride)
                    uwak.reply(from, '[WAIT] Sedang di proses⏳ silahkan tunggu ± 1 min!', id)
                    const filename = `./media/aswu.${mimetype.split('/')[1]}`
                    await fs.writeFileSync(filename, mediaData)
                    await exec(`gify ${filename} ./media/output.gif --fps=60 --scale=240:240`, async function (error, stdout, stderr) {
                        const gif = await fs.readFileSync('./media/output.gif', { encoding: "base64" })
                        await uwak.sendImageAsSticker(from, `data:image/gif;base64,${gif.toString('base64')}`)
                    })
                } else (
                    uwak.reply(from, '[❗] Kirim video dengan caption *#stickerGif* max 10 sec!', id)
                )
            }
            break
        case '#donasi':
        case '#donate':
		if (!isRegistered) return uwak.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            uwak.sendLinkWithAutoPreview(from, `https://youtube.com/c/bennyhidayat`)
            break
        case '#tts':
		if (!isRegistered) return uwak.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (args.length === 1) return uwak.reply(from, 'Kirim perintah *#tts [id, en, jp, ar] [teks]*, contoh *#tts id halo semua*')
            const ttsId = require('node-gtts')('id')
            const ttsEn = require('node-gtts')('en')
	    const ttsJp = require('node-gtts')('ja')
            const ttsAr = require('node-gtts')('ar')
            const dataText = body.slice(8)
            if (dataText === '') return uwak.reply(from, 'Baka?', id)
            if (dataText.length > 65536) return uwak.reply(from, 'Teks terlalu panjang!', id)
            var dataBhs = body.slice(5, 7)
	    if (dataBhs == 'id') {
                ttsId.save('./media/tts/resId.mp3', dataText, function () {
                    uwak.sendPtt(from, './media/tts/resId.mp3', id)
                })
            } else if (dataBhs == 'en') {
                ttsEn.save('./media/tts/resEn.mp3', dataText, function () {
                    uwak.sendPtt(from, './media/tts/resEn.mp3', id)
                })
            } else if (dataBhs == 'jp') {
                ttsJp.save('./media/tts/resJp.mp3', dataText, function () {
                    uwak.sendPtt(from, './media/tts/resJp.mp3', id)
                })
	    } else if (dataBhs == 'ar') {
                ttsAr.save('./media/tts/resAr.mp3', dataText, function () {
                    uwak.sendPtt(from, './media/tts/resAr.mp3', id)
                })
            } else {
                uwak.reply(from, 'Masukkan data bahasa : [id] untuk indonesia, [en] untuk inggris, [jp] untuk jepang, dan [ar] untuk arab', id)
            }
            break
        case '#nulis':
		if (!isRegistered) return uwak.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (args.length === 1) return uwak.reply(from, 'Kirim perintah *#nulis [teks]*', id)
            const text = body.slice(7)
            uwak.reply(from, mess.wait, id)
            const splitText = text.replace(/(\S+\s*){1,10}/g, '$&\n')
            const fixHeight = splitText.split('\n').slice(0, 25).join('\n')
            spawn('convert', [
                './media/img/before.jpg',
                '-font',
                'Indie-Flower',
                '-size',
                '700x960',
                '-pointsize',
                '25',
                '-interline-spacing',
                '1',
                '-annotate',
                '+170+222',
                fixHeight,
                './media/img/after.jpg'
            ])
            .on('error', () => uwak.reply(from, 'Error gan', id))
            .on('exit', () => {
                uwak.sendImage(from, './media/img/after.jpg', 'nulis.jpg', 'Nih mhank', id)
            })
            break
			case '#play':
			if (!isRegistered) return uwak.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (args.length == 0) return uwak.reply(from, `Untuk mencari lagu dari youtube\n\nPenggunaan: #play judul lagu`, id)
            axios.get(`https://arugaytdl.herokuapp.com/search?q=${body.slice(6)}`)
            .then(async (res) => {
                await uwak.sendFileFromUrl(from, `${res.data[0].thumbnail}`, ``, `Lagu ditemukan\n\nJudul: ${res.data[0].title}\nDurasi: ${res.data[0].duration}detik\nUploaded: ${res.data[0].uploadDate}\nView: ${res.data[0].viewCount}\n\nsedang dikirim`, id)
				rugaapi.ytmp3(`https://youtu.be/${res.data[0].id}`)
				.then(async(res) => {
					if (res.status == 'error') return uwak.sendFileFromUrl(from, `${res.link}`, '', `${res.error}`)
					await uwak.sendFileFromUrl(from, `${res.thumb}`, '', `Lagu ditemukan\n\nJudul ${res.title}\n\nSabar lagi dikirim`, id)
					await uwak.sendFileFromUrl(from, `${res.link}`, '', '', id)
					.catch(() => {
						uwak.reply(from, `URL INI ${args[0]} SUDAH PERNAH DI DOWNLOAD SEBELUMNYA ..URL AKAN RESET SETELAH 60 MENIT`, id)
					})
				})
            })
            .catch(() => {
                uwak.reply(from, 'Ada yang Error!', id)
            })
            break
        case '#ytmp3':
		if (!isRegistered) return uwak.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (args.length === 1) return uwak.reply(from, 'Kirim perintah *#ytmp3 [linkYt]*, untuk contoh silahkan kirim perintah *#readme*')
            let isLinks = args[1].match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)
            if (!isLinks) return uwak.reply(from, mess.error.Iv, id)
            try {
                uwak.reply(from, mess.wait, id)
                const resp = await get.get('https://api-zefian.glitch.me/api/yta?url='+ args[1]).json()
                if (resp.error) {
                    uwak.reply(from, resp.error, id)
                } else {
                    const { title, thumb, filesize, result } = await resp
                    if (Number(filesize.split(' MB')[0]) >= 60.00) return uwak.reply(from, 'Maaf durasi video sudah melebihi batas maksimal!', id)
                    uwak.sendFileFromUrl(from, thumb, 'thumb.jpg', `➸ *Title* : ${title}\n➸ *Filesize* : ${filesize}\n\nSilahkan tunggu sebentar proses pengiriman file membutuhkan waktu beberapa menit.`, id)
                    await uwak.sendFileFromUrl(from, result, `${title}.mp3`, '', id).catch(() => uwak.reply(from, mess.error.Yt3, id))
                }
            } catch (err) {
                uwak.sendText(ownerNumber, 'Error ytmp3 : '+ err)
                uwak.reply(from, mess.error.Yt3, id)
            }
            break
        case '#ytmp4':
		if (!isRegistered) return uwak.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (args.length === 1) return uwak.reply(from, 'Kirim perintah *#ytmp4 [linkYt]*, untuk contoh silahkan kirim perintah *#readme*')
            let isLin = args[1].match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)
            if (!isLin) return uwak.reply(from, mess.error.Iv, id)
            try {
                uwak.reply(from, mess.wait, id)
                const ytv = await get.get('https://api-zefian.glitch.me/api/ytv?url='+ args[1]).json()
                if (ytv.error) {
                    uwak.reply(from, ytv.error, id)
                } else {
                    if (Number(ytv.filesize.split(' MB')[0]) > 40.00) return uwak.reply(from, 'Maaf durasi video sudah melebihi batas maksimal!', id)
                    uwak.sendFileFromUrl(from, ytv.thumb, 'thumb.jpg', `➸ *Title* : ${ytv.title}\n➸ *Filesize* : ${ytv.filesize}\n\nSilahkan tunggu sebentar proses pengiriman file membutuhkan waktu beberapa menit.`, id)
                    await uwak.sendFileFromUrl(from, ytv.result, `${ytv.title}.mp4`, '', id).catch(() => uwak.reply(from, mess.error.Yt4, id))
                }
            } catch (er) {
                uwak.sendText(ownerNumber, 'Error ytmp4 : '+ er)
                uwak.reply(from, mess.error.Yt4, id)
            }
            break
		case '#tutorial':
		if (!isRegistered) return uwak.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
		uwak.sendLinkWithAutoPreview(from, `https://www.youtube.com/watch?v=sRm-5CExOCs`)
		break
		case '#bot':
		if (!isRegistered) return uwak.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
		benny.sendLinkWithAutoPreview(from, `https://github.com/bennyganteng/BennyBOT`)
		break
        case '#wiki':
            if (args.length === 1) return uwak.reply(from, 'Kirim perintah *#wiki [query]*\nContoh : *#wiki asu*', id)
            const query_ = body.slice(6)
            const wiki = await get.get('https://api-zefian.glitch.me/api/wiki?q='+ query_).json()
            if (wiki.error) {
                uwak.reply(from, wiki.error, id)
            } else {
                uwak.reply(from, `➸ *Query* : ${query_}\n\n➸ *Result* : ${wiki.result}`, id)
            }
            break
		/*case '#lapor':
		case '#report':
		uwak.sendMessageTo('6288212149329@c.us')
		break*/
        case '#cuaca':
		if (!isRegistered) return uwak.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (args.length === 1) return uwak.reply(from, 'Kirim perintah *#cuaca [tempat]*\nContoh : *#cuaca tangerang', id)
            const tempat = body.slice(7)
            const weather = await get.get('https://api-zefian.glitch.me/api/cuaca?q='+ tempat).json()
            if (weather.error) {
                uwak.reply(from, weather.error, id)
            } else {
                uwak.reply(from, `➸ tempat : ${weather.result.tempat}\n\n➸ Angin : ${weather.result.angin}\n➸ Cuaca : ${weather.result.cuaca}\n➸ Deskripsi : ${weather.result.desk}\n➸ Kelembapan : ${weather.result.kelembapan}\n➸ Suhu : ${weather.result.suhu}\n➸ Udara : ${weather.result.udara}`, id)
            }
            break
        case '#fb':
            if (args.length === 1) return uwak.reply(from, 'Kirim perintah *#fb [linkFb]* untuk contoh silahkan kirim perintah *#readme*', id)
            if (!args[1].includes('facebook.com')) return uwak.reply(from, mess.error.Iv, id)
            uwak.reply(from, mess.wait, id)
            const epbe = await fb(args[1])
            uwak.sendFileFromUrl(from, epbe.url, `Cuih${epbe.exts}`, epbe.capt, id)
            break
        case '#owner':
            uwak.sendContact(from, '6282111538078@c.us')
            break
        case '#ig':
		if (!isRegistered) return uwak.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (args.length === 1) return uwak.reply(from, 'Kirim perintah *#ig [linkIg]* untuk contoh silahkan kirim perintah *#readme*')
            if (!args[1].match(isUrl) && !args[1].includes('instagram.com')) return uwak.reply(from, mess.error.Iv, id)
            try {
                uwak.reply(from, mess.wait, id)
                const resp = await get.get('https://api-zefian.glitch.me/api/ig?url='+ args[1]).json()
                if (resp.result.includes('.mp4')) {
                    var ext = '.mp4'
                } else {
                    var ext = '.jpg'
                }
                await uwak.sendFileFromUrl(from, resp.result, `igeh${ext}`, '', id)
            } catch {
                uwak.reply(from, mess.error.Ig, id)
                }
            break
        case '#nsfw':
		if (!isRegistered) return uwak.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (!isGroupMsg) return uwak.reply(from, 'Perintah ini hanya bisa di gunakan dalam group!', id)
            if (!isGroupAdmins) return uwak.reply(from, 'Perintah ini hanya bisa di gunakan oleh Admin group!', id)
            if (args.length === 1) return uwak.reply(from, 'Pilih enable atau disable!', id)
            if (args[1].toLowerCase() === 'enable') {
                nsfw_.push(chat.id)
                fs.writeFileSync('./lib/NSFW.json', JSON.stringify(nsfw_))
                uwak.reply(from, 'NSWF Command berhasil di aktifkan di group ini! kirim perintah *#nsfwMenu* untuk mengetahui menu', id)
            } else if (args[1].toLowerCase() === 'disable') {
                nsfw_.splice(chat.id, 1)
                fs.writeFileSync('./lib/NSFW.json', JSON.stringify(nsfw_))
                uwak.reply(from, 'NSFW Command berhasil di nonaktifkan di group ini!', id)
            } else {
                uwak.reply(from, 'Pilih enable atau disable udin!', id)
            }
            break
        case '#welcome':
		if (!isRegistered) return uwak.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (!isGroupMsg) return uwak.reply(from, 'Perintah ini hanya bisa di gunakan dalam group!', id)
            if (args.length === 1) return uwak.reply(from, 'Pilih enable atau disable!', id)
            if (args[1].toLowerCase() === 'enable') {
                welkom.push(chat.id)
                fs.writeFileSync('./lib/welcome.json', JSON.stringify(welkom))
                uwak.reply(from, 'Fitur welcome berhasil di aktifkan di group ini!', id)
            } else if (args[1].toLowerCase() === 'disable') {
                welkom.splice(chat.id, 1)
                fs.writeFileSync('./lib/welcome.json', JSON.stringify(welkom))
                uwak.reply(from, 'Fitur welcome berhasil di nonaktifkan di group ini!', id)
            } else {
                uwak.reply(from, 'Pilih enable atau disable udin!', id)
            }
            break
        case '#nsfwmenu':
            if (!isNsfw) return
            uwak.reply(from, '1. #randomHentai\n2. #randomNsfwNeko', id)
            break
        case '#igstalk':
		if (!isRegistered) return uwak.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (args.length === 1)  return uwak.reply(from, 'Kirim perintah *#igStalk @username*\nConntoh *#igStalk @duar_amjay*', id)
            const stalk = await get.get('https://api-zefian.glitch.me/api/stalk?username='+ args[1]).json()
            if (stalk.error) return uwak.reply(from, stalk.error, id)
            const { Biodata, Jumlah_Followers, Jumlah_Following, Jumlah_Post, Name, Username, Profile_pic } = stalk
            const caps = `➸ *Nama* : ${Name}\n➸ *Username* : ${Username}\n➸ *Jumlah Followers* : ${Jumlah_Followers}\n➸ *Jumlah Following* : ${Jumlah_Following}\n➸ *Jumlah Postingan* : ${Jumlah_Post}\n➸ *Biodata* : ${Biodata}`
            await benny.sendFileFromUrl(from, Profile_pic, 'Profile.jpg', caps, id)
            break
        case '#infogempa':
		if (!isRegistered) return uwak.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            const bmkg = await get.get('https://api-zefian.glitch.me/api/infogempa').json()
            const { potensi, koordinat, lokasi, kedalaman, magnitude, waktu, map } = bmkg
            const hasil = `*${waktu}*\n📍 *Lokasi* : *${lokasi}*\n〽️ *Kedalaman* : *${kedalaman}*\n💢 *Magnitude* : *${magnitude}*\n🔘 *Potensi* : *${potensi}*\n📍 *Koordinat* : *${koordinat}*`
            uwak.sendFileFromUrl(from, map, 'shakemap.jpg', hasil, id)
            break
        case '#anime':
		if (!isRegistered) return uwak.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (args.length === 1) return uwak.reply(from, 'Kirim perintah *#anime [query]*\nContoh : *#anime darling in the franxx*', id)
            const animek = await get.get('https://api-zefian.glitch.me/api/kuso?q=' + body.slice(7)).json()
            if (animek.error) return uwak.reply(from, animek.error, id)
            const res_animek = `${animek.result}\n\n${animek.sinopsis}`
            uwak.sendFileFromUrl(from, animek.thumb, 'dewabatch.jpg', res_animek, id)
            break
		case '#anime2':
		if (!isRegistered) return uwak.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (args.length === 1) return uwak.reply(from, 'Kirim perintah *#anime [query]*\nContoh : *#anime darling in the franxx*', id)
            const animeku = await get.get('https://api-zefian.glitch.me/api/dewabatch?q=' + body.slice(7)).json()
            if (animeku.error) return uwak.reply(from, animeku.error, id)
            const res_animeku = `${animeku.result}\n\n${animeku.sinopsis}`
            uwak.sendFileFromUrl(from, animeku.thumb, 'dewabatch.jpg', res_animeku, id)
            break
        case '#nh':
		if (!isRegistered) return uwak.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (!isPilot) return
            //if (isGroupMsg) return uwak.reply(from, 'Sorry this command for private chat only!', id)
            if (args.length === 2) {
                const nuklir = body.split(' ')[1]
                benny.reply(from, mess.wait, id)
                const cek = await nhentai.exists(nuklir)
                if (cek === true)  {
                    try {
                        const api = new API()
                        const pic = await api.getBook(nuklir).then(book => {
                            return api.getImageURL(book.cover)
                        })
                        const dojin = await nhentai.getDoujin(nuklir)
                        const { title, details, link } = dojin
                        const { parodies, tags, artists, groups, languages, categories } = await details
                        var teks = `*Title* : ${title}\n\n*Parodies* : ${parodies}\n\n*Tags* : ${tags.join(', ')}\n\n*Artists* : ${artists.join(', ')}\n\n*Groups* : ${groups.join(', ')}\n\n*Languages* : ${languages.join(', ')}\n\n*Categories* : ${categories}\n\n*Link* : ${link}`
                        exec('nhentai --id=' + nuklir + ` -P mantap.pdf -o ./hentong/${nuklir}.pdf --format `+ `${nuklir}.pdf`, (error, stdout, stderr) => {
                            benny.sendFileFromUrl(from, pic, 'hentod.jpg', teks, id).then(() => 
                            benny.sendFile(from, `./hentong/${nuklir}.pdf/${nuklir}.pdf.pdf`, `${title}.pdf`, '', id)).catch(() => 
                            benny.sendFile(from, `./hentong/${nuklir}.pdf/${nuklir}.pdf.pdf`, `${title}.pdf`, '', id))
                            /*if (error) {
                                console.log('error : '+ error.message)
                                return
                            }
                            if (stderr) {
                                console.log('stderr : '+ stderr)
                                return
                            }
                            console.log('stdout : '+ stdout)*/
                            })
                    } catch (err) {
                        benny.reply(from, '[❗] Terjadi kesalahan, mungkin kode nuklir salah', id)
                    }
                } else {
                    benny.reply(from, '[❗] Kode nuClear Salah!')
                }
            } else {
                benny.reply(from, '[ WRONG ] Kirim perintah *#nh [nuClear]* untuk contoh kirim perintah *#readme*')
            }
        	break
        case '#brainly':
						    if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (args.length >= 2){
                const BrainlySearch = require('./lib/brainly')
                let tanya = body.slice(9)
                let jum = Number(tanya.split('.')[1]) || 2
                if (jum > 10) return benny.reply(from, 'Max 10!', id)
                if (Number(tanya[tanya.length-1])){
                    tanya
                }
                benny.reply(from, `➸ *Pertanyaan* : ${tanya.split('.')[0]}\n\n➸ *Jumlah jawaban* : ${Number(jum)}`, id)
                await BrainlySearch(tanya.split('.')[0],Number(jum), function(res){
                    res.forEach(x=>{
                        if (x.jawaban.fotoJawaban.length == 0) {
                            benny.reply(from, `➸ *Pertanyaan* : ${x.pertanyaan}\n\n➸ *Jawaban* : ${x.jawaban.judulJawaban}\n`, id)
                        } else {
                            benny.reply(from, `➸ *Pertanyaan* : ${x.pertanyaan}\n\n➸ *Jawaban* : ${x.jawaban.judulJawaban}\n\n➸ *Link foto jawaban* : ${x.jawaban.fotoJawaban.join('\n')}`, id)
                        }
                    })
                })
            } else {
                benny.reply(from, 'Usage :\n#brainly [pertanyaan] [.jumlah]\n\nEx : \n#brainly NKRI .2', id)
            }
            break
        case '#wait':
						    if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (isMedia && type === 'image' || quotedMsg && quotedMsg.type === 'image') {
                if (isMedia) {
                    var mediaData = await decryptMedia(message, uaOverride)
                } else {
                    var mediaData = await decryptMedia(quotedMsg, uaOverride)
                }
                const fetch = require('node-fetch')
                const imgBS4 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                benny.reply(from, 'Searching....', id)
                fetch('https://trace.moe/api/search', {
                    method: 'POST',
                    body: JSON.stringify({ image: imgBS4 }),
                    headers: { "Content-Type": "application/json" }
                })
                .then(respon => respon.json())
                .then(resolt => {
                	if (resolt.docs && resolt.docs.length <= 0) {
                		benny.reply(from, 'Maaf, saya tidak tau ini anime apa', id)
                	}
                    const { is_adult, title, title_chinese, title_romaji, title_english, episode, similarity, filename, at, tokenthumb, anilist_id } = resolt.docs[0]
                    teks = ''
                    if (similarity < 0.92) {
                    	teks = '*Saya memiliki keyakinan rendah dalam hal ini* :\n\n'
                    }
                    teks += `➸ *Title Japanese* : ${title}\n➸ *Title chinese* : ${title_chinese}\n➸ *Title Romaji* : ${title_romaji}\n➸ *Title English* : ${title_english}\n`
                    teks += `➸ *Ecchi* : ${is_adult}\n`
                    teks += `➸ *Eps* : ${episode.toString()}\n`
                    teks += `➸ *Kesamaan* : ${(similarity * 100).toFixed(1)}%\n`
                    var video = `https://media.trace.moe/video/${anilist_id}/${encodeURIComponent(filename)}?t=${at}&token=${tokenthumb}`;
                    benny.sendFileFromUrl(from, video, 'nimek.mp4', teks, id).catch(() => {
                        benny.reply(from, teks, id)
                    })
                })
                .catch(() => {
                    benny.reply(from, 'Error !', id)
                })
            } else {
                benny.sendFile(from, './media/img/tutod.jpg', 'Tutor.jpg', 'Neh contoh mhank!', id)
            }
            break
        case '#quotemaker':
						    if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            arg = body.trim().split('|')
            if (arg.length >= 4) {
                benny.reply(from, mess.wait, id)
                const quotes = arg[1]
                const author = arg[2]
                const theme = arg[3]
                await quotemaker(quotes, author, theme).then(amsu => {
                    benny.sendFile(from, amsu, 'quotesmaker.jpg','neh...').catch(() => {
                       benny.reply(from, mess.error.Qm, id)
                    })
                })
            } else {
                benny.reply(from, 'Usage: \n#quotemaker |teks|watermark|theme\n\nEx :\n#quotemaker |ini contoh|bicit|random', id)
            }
            break
        case '#linkgroup':
						    if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (!isBotGroupAdmins) return benny.reply(from, 'Perintah ini hanya bisa di gunakan ketika bot menjadi admin', id)
            if (isGroupMsg) {
                const inviteLink = await benny.getGroupInviteLink(groupId);
                benny.sendLinkWithAutoPreview(from, inviteLink, `\nLink group *${name}*`)
            } else {
            	benny.reply(from, 'Perintah ini hanya bisa di gunakan dalam group!', id)
            }
            break
        case '#bc':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (!isPilot) return benny.reply(from, 'Perintah ini hanya untuk Owner bot!', id)
            let msg = body.slice(4)
            const chatz = await benny.getAllChatIds()
            for (let ids of chatz) {
                var cvk = await benny.getChatById(ids)
                if (!cvk.isReadOnly) await benny.sendText(ids, `[ UWAK BOT Broadcast ]\n\n${msg}`)
            }
            benny.reply(from, 'Broadcast Success!', id)
            break
        case '#adminlist':
						    if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (!isGroupMsg) return benny.reply(from, 'Perintah ini hanya bisa di gunakan dalam group!', id)
            let mimin = ''
            for (let admon of groupAdmins) {
                mimin += `➸ @${admon.replace(/@c.us/g, '')}\n` 
            }
            await sleep(2000)
            await benny.sendTextWithMentions(from, mimin)
            break
        case '#mentionall':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (!isGroupMsg) return benny.reply(from, 'Perintah ini hanya bisa di gunakan dalam group!', id)
            if (!isGroupAdmins) return benny.reply(from, 'Perintah ini hanya bisa di gunakan oleh admin group', id)
            const groupMem = await benny.getGroupMembers(groupId)
            let hehe = '╔══✪〘 Mention All 〙✪══\n'
            for (let i = 0; i < groupMem.length; i++) {
                hehe += '╠➥'
                hehe += ` @${groupMem[i].id.replace(/@c.us/g, '')}\n`
            }
            hehe += '╚═〘 BENNY BOT 〙'
            await sleep(2000)
            await benny.sendTextWithMentions(from, hehe)
            break
		case '#ban':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if(!isPilot) return benny.reply(from, 'Perintah *!ban* hanya untuk Owner bot!', message.id)
            for (let i = 0; i < mentionedJidList.length; i++) {
                ban.push(mentionedJidList[i])
                fs.writeFileSync('./lib/banned.json', JSON.stringify(ban))
                benny.reply(from, 'Succes ban target!', message.id)
            }
            break
        case '#kickall':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (!isGroupMsg) return benny.reply(from, 'Perintah ini hanya bisa di gunakan dalam group!', id)
            if (!isBotGroupAdmins) return benny.reply(from, 'Perintah ini hanya bisa di gunakan ketika bot menjadi admin', id)
            const allMem = await benny.getGroupMembers(groupId)
            for (let i = 0; i < allMem.length; i++) {
                    await benny.removeParticipant(groupId, allMem[i].id)
            }
            benny.reply(from, 'Succes kick all member', id)
            break
        case '#leaveall':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (!isPilot) return benny.reply(from, 'Perintah ini hanya untuk Owner bot', id)
            const allChats = await benny.getAllChatIds()
            const allGroups = await benny.getAllGroups()
            for (let gclist of allGroups) {
                await benny.sendText(gclist.contact.id, `Maaf bot sedang pembersihan, total chat aktif : ${allChats.length}`)
                await benny.leaveGroup(gclist.contact.id)
            }
            benny.reply(from, 'Succes leave all group!', id)
            break
        case '#clearall':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (!isPilot) return benny.reply(from, 'Perintah ini hanya untuk Owner bot', id)
            const allChatz = await benny.getAllChats()
            for (let dchat of allChatz) {
                await benny.deleteChat(dchat.id)
            }
            benny.reply(from, 'Succes clear all chat!', id)
            break
        case '#add':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            const orang = args[1]
            if (!isGroupMsg) return benny.reply(from, 'Fitur ini hanya bisa di gunakan dalam group', id)
            if (args.length === 1) return benny.reply(from, 'Untuk menggunakan fitur ini, kirim perintah *#add* 628xxxxx', id)
            if (!isGroupAdmins) return benny.reply(from, 'Perintah ini hanya bisa di gunakan oleh admin group', id)
            if (!isBotGroupAdmins) return benny.reply(from, 'Perintah ini hanya bisa di gunakan ketika bot menjadi admin', id)
            try {
                await benny.addParticipant(from,`${orang}@c.us`)
            } catch {
                benny.reply(from, mess.error.Ad, id)
            }
            break
        case '#kick':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (!isGroupMsg) return benny.reply(from, 'Fitur ini hanya bisa di gunakan dalam group', id)
            if (!isGroupAdmins) return benny.reply(from, 'Perintah ini hanya bisa di gunakan oleh admin group', id)
            if (!isBotGroupAdmins) return benny.reply(from, 'Perintah ini hanya bisa di gunakan ketika bot menjadi admin', id)
            if (mentionedJidList.length === 0) return benny.reply(from, 'Untuk menggunakan Perintah ini, kirim perintah *#kick* @tagmember', id)
            await benny.sendText(from, `Perintah diterima, mengeluarkan:\n${mentionedJidList.join('\n')}`)
            for (let i = 0; i < mentionedJidList.length; i++) {
                if (groupAdmins.includes(mentionedJidList[i])) return benny.reply(from, mess.error.Ki, id)
                await benny.removeParticipant(groupId, mentionedJidList[i])
            }
            break
        case '#leave':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (!isGroupMsg) return benny.reply(from, 'Perintah ini hanya bisa di gunakan dalam group', id)
            if (!isPilot) return benny.reply(from, 'Perintah ini hanya bisa di gunakan oleh owner bot', id)
            await benny.sendText(from,'Dadah').then(() => benny.leaveGroup(groupId))
            break
        case '#promote':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (!isGroupMsg) return benny.reply(from, 'Fitur ini hanya bisa di gunakan dalam group', id)
            if (!isGroupAdmins) return benny.reply(from, 'Fitur ini hanya bisa di gunakan oleh admin group', id)
            if (!isBotGroupAdmins) return benny.reply(from, 'Fitur ini hanya bisa di gunakan ketika bot menjadi admin', id)
            if (mentionedJidList.length === 0) return benny.reply(from, 'Untuk menggunakan fitur ini, kirim perintah *#promote* @tagmember', id)
            if (mentionedJidList.length >= 2) return benny.reply(from, 'Maaf, perintah ini hanya dapat digunakan kepada 1 user.', id)
            if (groupAdmins.includes(mentionedJidList[0])) return benny.reply(from, 'Maaf, user tersebut sudah menjadi admin.', id)
            await benny.promoteParticipant(groupId, mentionedJidList[0])
            await benny.sendTextWithMentions(from, `Perintah diterima, menambahkan @${mentionedJidList[0]} sebagai admin.`)
            break
		case '#linkgrup':
		 if (!isGroupMsg) return benny.reply(from, `Perintah ini hanya bisa digunakan didalam grup`)
			 if (!isBotGroupAdmins) return benny.reply(from, `Perintah ini hanya bisa digunakan ketika bot menjadi admin`)
		   const linke = await benny.getGroupInviteLink(groupId)
		const msgu = `Link group: *${formattedTitle}*\n\n| ${linke}`
		   benny.reply(from, msgu, id)
		   break
        case '#demote':
            if (!isGroupMsg) return benny.reply(from, 'Fitur ini hanya bisa di gunakan dalam group', id)
            if (!isGroupAdmins) return benny.reply(from, 'Fitur ini hanya bisa di gunakan oleh admin group', id)
            if (!isBotGroupAdmins) return benny.reply(from, 'Fitur ini hanya bisa di gunakan ketika bot menjadi admin', id)
            if (mentionedJidList.length === 0) return benny.reply(from, 'Untuk menggunakan fitur ini, kirim perintah *#demote* @tagadmin', id)
            if (mentionedJidList.length >= 2) return benny.reply(from, 'Maaf, perintah ini hanya dapat digunakan kepada 1 orang.', id)
            if (!groupAdmins.includes(mentionedJidList[0])) return benny.reply(from, 'Maaf, user tersebut tidak menjadi admin.', id)
            await benny.demoteParticipant(groupId, mentionedJidList[0])
            await benny.sendTextWithMentions(from, `Perintah diterima, menghapus jabatan @${mentionedJidList[0]}.`)
            break
        case '#join':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
		    if (!isPremium) return benny.sendText(from, `Nomor kamu belum terdaftar sebagai user premium. Hubungi owner untuk mendaftar!`)
            if (args.length === 1) return benny.reply(from, 'Kirim perintah *#join* linkgroup\n\nEx:\n#join https://chat.whatsapp.com/blablablablablabla', id)
            const link = body.slice(6)
		    //const key = args[2]
            const tGr = await benny.getAllGroups()
            const minMem = 0
            const isLink = link.match(/(https:\/\/chat.whatsapp.com)/gi)
            const check = await benny.inviteInfo(link)
            if (!isLink) return benny.reply(from, 'Ini link? 👊🤬', id)
			//if (key !== 'lG') return client.reply(from, '*key* salah! silahkan chat owner bot unruk mendapatkan key yang valid', id)
            if (tGr.length > 500) return benny.reply(from, 'Maaf jumlah group sudah maksimal!', id)
            if (check.size < minMem) return benny.reply(from, 'Member group tidak melebihi 30, bot tidak bisa masuk', id)
            if (check.status === 200) {
                await benny.joinGroupViaLink(link).then(() => benny.reply(from, 'Bot akan segera masuk!'))
            } else {
                benny.reply(from, 'Link group tidak valid!', id)
            }
            break
        case '#delete':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (!isGroupMsg) return benny.reply(from, 'Fitur ini hanya bisa di gunakan dalam group', id)
            if (!isGroupAdmins) return benny.reply(from, 'Fitur ini hanya bisa di gunakan oleh admin group', id)
            if (!quotedMsg) return benny.reply(from, 'Salah!!, kirim perintah *#delete [tagpesanbot]*', id)
            if (!quotedMsgObj.fromMe) return benny.reply(from, 'Salah!!, Bot tidak bisa mengahpus chat user lain!', id)
            benny.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
            break
			case '#antikasar':
			if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
			if (!isGroupMsg) return benny.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
			if (args.length !== 1) return benny.reply(from, `Untuk mengaktifkan Fitur Kata Kasar pada Group Chat\n\nApasih kegunaan Fitur Ini? Apabila seseorang mengucapkan kata kasar akan mendapatkan denda\n\nPenggunaan\n#antikasar on --mengaktifkan\n#antikasar off --nonaktifkan\n\n#reset --reset jumlah denda`, id)
			if (args[0] == 'on') {
				ngegas.push(chatId)
				fs.writeFileSync('./settings/ngegas.json', JSON.stringify(ngegas))
				benny.reply(from, 'Fitur Anti Kasar sudah di Aktifkan', id)
			} else if (args[0] == 'off') {
				let nixx = ngegas.indexOf(chatId)
				ngegas.splice(nixx, 1)
				fs.writeFileSync('./settings/ngegas.json', JSON.stringify(ngegas))
				benny.reply(from, 'Fitur Anti Kasar sudah di non-Aktifkan', id)
			} else {
				benny.reply(from, `Untuk mengaktifkan Fitur Kata Kasar pada Group Chat\n\nApasih kegunaan Fitur Ini? Apabila seseorang mengucapkan kata kasar akan mendapatkan denda\n\nPenggunaan\n#antikasar on --mengaktifkan\n#antikasar off --nonaktifkan\n\n${prefix}reset --reset jumlah denda`, id)
			}
			break
		case '#homebot':
			benny.sendLinkWithAutoPreview(from, `https://chat.whatsapp.com/DyLb768sfPDB2SHpxUuDDO`)
			break
			case '#setprofile':
			if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
			if (!isGroupMsg) return benny.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup!', id)
            if (!isGroupAdmins) return benny.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup!', id)
            if (!isBotGroupAdmins) return benny.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup!', id)
			if (isMedia && type == 'image' || isQuotedImage) {
				const dataMedia = isQuotedImage ? quotedMsg : message
				const _mimetype = dataMedia.mimetype
				const mediaData = await decryptMedia(dataMedia, uaOverride)
				const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
				await benny.setGroupIcon(groupId, imageBase64)
			} else if (args.length === 1) {
				if (!isUrl(url)) { await benny.reply(from, 'Maaf, link yang kamu kirim tidak valid.', id) }
				benny.setGroupIconByUrl(groupId, url).then((r) => (!r && r !== undefined)
				? benny.reply(from, 'Maaf, link yang kamu kirim tidak memuat gambar.', id)
				: benny.reply(from, 'Berhasil mengubah profile group', id))
			} else {
				benny.reply(from, `Commands ini digunakan untuk mengganti icon/profile group chat\n\n\nPenggunaan:\n1. Silahkan kirim/reply sebuah gambar dengan caption ${prefix}setprofile\n\n2. Silahkan ketik ${prefix}setprofile linkImage`)
			}
			break
        case '#getses': 
			if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            const sesPic = await benny.getSnapshot()
            benny.sendFile(from, sesPic, 'session.png', 'Neh...', id)
            break
        case '#lirik':
if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (args.length == 1) return benny.reply(from, 'Kirim perintah *#lirik [optional]*, contoh *#lirik aku bukan boneka*', id)
            const lagu = body.slice(7)
            const lirik = await liriklagu(lagu)
            benny.reply(from, lirik, id)
            break
		 case '#daftar':
                if (isRegistered) return benny.sendText(from, `Selamat nomor kamu sudah terdaftar! Ketik #help untuk perintah bot :)`)
                if (!q.includes('|')) return benny.sendText(from, `Format salah!`)
                const dataDiri = q.split('|').join('-')
                if (!dataDiri) return await benny.reply(from, `Format salah!`)
                _registered.push(sender.id)
                _biodata.push(dataDiri)
                fs.writeFileSync('./ingfo/registered.json', JSON.stringify(_registered))
                fs.writeFileSync('./ingfo/biodata.json', JSON.stringify(_biodata))
                await benny.sendText(from, `Selamat! Kamu telah terdaftar.\nKetik *#help* untuk perintah bot!`)
            break
        case '#chord':
				if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (args.length === 1) return benny.reply(from, 'Kirim perintah *#chord [query]*, contoh *#chord aku bukan boneka*', id)
            const query__ = body.slice(7)
            const chord = await get.get('https://api-zefian.glitch.me/api/chord?q='+ query__).json()
            if (chord.error) return benny.reply(from, chord.error, id)
            benny.reply(from, chord.result, id)
            break
        case '#listdaerah':
				if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            const listDaerah = await get('https://api-zefian.glitch.me/api/daerah').json()
            benny.reply(from, listDaerah, id)
            break
        case '#listblock':
				if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            let hih = `This is list of blocked number\nTotal : ${blockNumber.length}\n`
            for (let i of blockNumber) {
                hih += `➸ @${i.replace(/@c.us/g,'')}\n`
            }
            benny.sendTextWithMentions(from, hih, id)
            break
        case '#jadwalshalat':
				if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (args.length === 1) return benny.reply(from, '[❗] Kirim perintah *#jadwalShalat [daerah]*\ncontoh : *#jadwalShalat Tangerang*\nUntuk list daerah kirim perintah *#listDaerah*')
            const daerah = body.slice(14)
            const jadwalShalat = await get.get(`https://api-zefian.glitch.me/api/jadwalshalat?daerah=${daerah}`).json()
            if (jadwalShalat.error) return benny.reply(from, jadwalShalat.error, id)
            const { Imsyak, Subuh, Dhuha, Dzuhur, Ashar, Maghrib, Isya } = await jadwalShalat
            arrbulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
            tgl = new Date().getDate()
            bln = new Date().getMonth()
            thn = new Date().getFullYear()
            const resultJadwal = `Jadwal shalat di ${daerah}, ${tgl}-${arrbulan[bln]}-${thn}\n\nImsyak : ${Imsyak}\nSubuh : ${Subuh}\nDhuha : ${Dhuha}\nDzuhur : ${Dzuhur}\nAshar : ${Ashar}\nMaghrib : ${Maghrib}\nIsya : ${Isya}`
            benny.reply(from, resultJadwal, id)
            break
        case '#listchannel':
				if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            benny.reply(from, listChannel, id)
            break
        case '#jadwaltv':
				if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (args.length === 1) return benny.reply(from, 'Kirim perintah *#jadwalTv [channel]*', id)
            const query = body.slice(10).toLowerCase()
            const jadwal = await jadwalTv(query)
            benny.reply(from, jadwal, id)
            break
        case '#jadwaltvnow':
				if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            const jadwalNow = await get.get('https://api.haipbis.xyz/jadwaltvnow').json()
            benny.reply(from, `Jam : ${jadwalNow.jam}\n\nJadwalTV : ${jadwalNow.jadwalTV}`, id)
            break
        case '#loli':
				if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            const loli = await get.get('https://mhankbarbar.herokuapp.com/api/randomloli').json()
            benny.sendFileFromUrl(from, loli.result, 'loli.jpeg', 'Lolinya om', id)
            break
        case '#waifu':
				if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            const waifu = await get.get('https://api-zefian.glitch.me/api/waifu').json()
            benny.sendFileFromUrl(from, waifu.image, 'Waifu.jpg', `➸ Name : ${waifu.name}\n➸ Description : ${waifu.desc}\n\n➸ Source : ${waifu.source}`, id)
            break
        case '#husbu':
				if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            const diti = fs.readFileSync('./lib/husbu.json')
            const ditiJsin = JSON.parse(diti)
            const rindIndix = Math.floor(Math.random() * ditiJsin.length)
            const rindKiy = ditiJsin[rindIndix]
            benny.sendFileFromUrl(from, rindKiy.image, 'Husbu.jpg', rindKiy.teks, id)
            break
        case '#randomhentai':
				if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (isGroupMsg) {
                if (!isNsfw) return benny.reply(from, 'Command/Perintah NSFW belum di aktifkan di group ini!', id)
                const hentai = await randomNimek('hentai')
                if (hentai.endsWith('.png')) {
                    var ext = '.png'
                } else {
                    var ext = '.jpg'
                }
                benny.sendFileFromUrl(from, hentai, `Hentai${ext}`, 'Hentai!', id)
                break
            } else {
                const hentai = await randomNimek('hentai')
                if (hentai.endsWith('.png')) {
                    var ext = '.png'
                } else {
                    var ext = '.jpg'
                }
                benny.sendFileFromUrl(from, hentai, `Hentai${ext}`, 'Hentai!', id)
            }
        case '#randomnsfwneko':
				if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            if (isGroupMsg) {
                if (!isNsfw) return benny.reply(from, 'Command/Perintah NSFW belum di aktifkan di group ini!', id)
                const nsfwneko = await randomNimek('nsfw')
                if (nsfwneko.endsWith('.png')) {
                    var ext = '.png'
                } else {
                    var ext = '.jpg'
                }
                benny.sendFileFromUrl(from, nsfwneko, `nsfwNeko${ext}`, 'Nsfwneko!', id)
            } else {
                const nsfwneko = await randomNimek('nsfw')
                if (nsfwneko.endsWith('.png')) {
                    var ext = '.png'
                } else {
                    var ext = '.jpg'
                }
                benny.sendFileFromUrl(from, nsfwneko, `nsfwNeko${ext}`, 'Nsfwneko!', id)
            }
            break
        case '#randomnekonime':
				if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            const nekonime = await get.get('https://api-zefian.glitch.me/api/nekonime').json()
            if (nekonime.result.endsWith('.png')) {
                var ext = '.png'
            } else {
                var ext = '.jpg'
            }
            benny.sendFileFromUrl(from, nekonime.result, `Nekonime${ext}`, 'Nekonime!', id)
            break
        case '#randomtrapnime':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            const trap = await randomNimek('trap')
            if (trap.endsWith('.png')) {
                var ext = '.png'
            } else {
                var ext = '.jpg'
            }
            benny.sendFileFromUrl(from, trap, `trapnime${ext}`, 'Trapnime!', id)
            break
        case '#randomanime':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            const nime = await randomNimek('anime')
            if (nime.endsWith('.png')) {
                var ext = '.png'
            } else {
                var ext = '.jpg'
            }
            benny.sendFileFromUrl(from, nime, `Randomanime${ext}`, 'Randomanime!', id)
            break
        case '#inu':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            const list = ["https://cdn.shibe.online/shibes/247d0ac978c9de9d9b66d72dbdc65f2dac64781d.jpg","https://cdn.shibe.online/shibes/1cf322acb7d74308995b04ea5eae7b520e0eae76.jpg","https://cdn.shibe.online/shibes/1ce955c3e49ae437dab68c09cf45297d68773adf.jpg","https://cdn.shibe.online/shibes/ec02bee661a797518d37098ab9ad0c02da0b05c3.jpg","https://cdn.shibe.online/shibes/1e6102253b51fbc116b887e3d3cde7b5c5083542.jpg","https://cdn.shibe.online/shibes/f0c07a7205d95577861eee382b4c8899ac620351.jpg","https://cdn.shibe.online/shibes/3eaf3b7427e2d375f09fc883f94fa8a6d4178a0a.jpg","https://cdn.shibe.online/shibes/c8b9fcfde23aee8d179c4c6f34d34fa41dfaffbf.jpg","https://cdn.shibe.online/shibes/55f298bc16017ed0aeae952031f0972b31c959cb.jpg","https://cdn.shibe.online/shibes/2d5dfe2b0170d5de6c8bc8a24b8ad72449fbf6f6.jpg","https://cdn.shibe.online/shibes/e9437de45e7cddd7d6c13299255e06f0f1d40918.jpg","https://cdn.shibe.online/shibes/6c32141a0d5d089971d99e51fd74207ff10751e7.jpg","https://cdn.shibe.online/shibes/028056c9f23ff40bc749a95cc7da7a4bb734e908.jpg","https://cdn.shibe.online/shibes/4fb0c8b74dbc7653e75ec1da597f0e7ac95fe788.jpg","https://cdn.shibe.online/shibes/125563d2ab4e520aaf27214483e765db9147dcb3.jpg","https://cdn.shibe.online/shibes/ea5258fad62cebe1fedcd8ec95776d6a9447698c.jpg","https://cdn.shibe.online/shibes/5ef2c83c2917e2f944910cb4a9a9b441d135f875.jpg","https://cdn.shibe.online/shibes/6d124364f02944300ae4f927b181733390edf64e.jpg","https://cdn.shibe.online/shibes/92213f0c406787acd4be252edb5e27c7e4f7a430.jpg","https://cdn.shibe.online/shibes/40fda0fd3d329be0d92dd7e436faa80db13c5017.jpg","https://cdn.shibe.online/shibes/e5c085fc427528fee7d4c3935ff4cd79af834a82.jpg","https://cdn.shibe.online/shibes/f83fa32c0da893163321b5cccab024172ddbade1.jpg","https://cdn.shibe.online/shibes/4aa2459b7f411919bf8df1991fa114e47b802957.jpg","https://cdn.shibe.online/shibes/2ef54e174f13e6aa21bb8be3c7aec2fdac6a442f.jpg","https://cdn.shibe.online/shibes/fa97547e670f23440608f333f8ec382a75ba5d94.jpg","https://cdn.shibe.online/shibes/fb1b7150ed8eb4ffa3b0e61ba47546dd6ee7d0dc.jpg","https://cdn.shibe.online/shibes/abf9fb41d914140a75d8bf8e05e4049e0a966c68.jpg","https://cdn.shibe.online/shibes/f63e3abe54c71cc0d0c567ebe8bce198589ae145.jpg","https://cdn.shibe.online/shibes/4c27b7b2395a5d051b00691cc4195ef286abf9e1.jpg","https://cdn.shibe.online/shibes/00df02e302eac0676bb03f41f4adf2b32418bac8.jpg","https://cdn.shibe.online/shibes/4deaac9baec39e8a93889a84257338ebb89eca50.jpg","https://cdn.shibe.online/shibes/199f8513d34901b0b20a33758e6ee2d768634ebb.jpg","https://cdn.shibe.online/shibes/f3efbf7a77e5797a72997869e8e2eaa9efcdceb5.jpg","https://cdn.shibe.online/shibes/39a20ccc9cdc17ea27f08643b019734453016e68.jpg","https://cdn.shibe.online/shibes/e67dea458b62cf3daa4b1e2b53a25405760af478.jpg","https://cdn.shibe.online/shibes/0a892f6554c18c8bcdab4ef7adec1387c76c6812.jpg","https://cdn.shibe.online/shibes/1b479987674c9b503f32e96e3a6aeca350a07ade.jpg","https://cdn.shibe.online/shibes/0c80fc00d82e09d593669d7cce9e273024ba7db9.jpg","https://cdn.shibe.online/shibes/bbc066183e87457b3143f71121fc9eebc40bf054.jpg","https://cdn.shibe.online/shibes/0932bf77f115057c7308ef70c3de1de7f8e7c646.jpg","https://cdn.shibe.online/shibes/9c87e6bb0f3dc938ce4c453eee176f24636440e0.jpg","https://cdn.shibe.online/shibes/0af1bcb0b13edf5e9b773e34e54dfceec8fa5849.jpg","https://cdn.shibe.online/shibes/32cf3f6eac4673d2e00f7360753c3f48ed53c650.jpg","https://cdn.shibe.online/shibes/af94d8eeb0f06a0fa06f090f404e3bbe86967949.jpg","https://cdn.shibe.online/shibes/4b55e826553b173c04c6f17aca8b0d2042d309fb.jpg","https://cdn.shibe.online/shibes/a0e53593393b6c724956f9abe0abb112f7506b7b.jpg","https://cdn.shibe.online/shibes/7eba25846f69b01ec04de1cae9fed4b45c203e87.jpg","https://cdn.shibe.online/shibes/fec6620d74bcb17b210e2cedca72547a332030d0.jpg","https://cdn.shibe.online/shibes/26cf6be03456a2609963d8fcf52cc3746fcb222c.jpg","https://cdn.shibe.online/shibes/c41b5da03ad74b08b7919afc6caf2dd345b3e591.jpg","https://cdn.shibe.online/shibes/7a9997f817ccdabac11d1f51fac563242658d654.jpg","https://cdn.shibe.online/shibes/7221241bad7da783c3c4d84cfedbeb21b9e4deea.jpg","https://cdn.shibe.online/shibes/283829584e6425421059c57d001c91b9dc86f33b.jpg","https://cdn.shibe.online/shibes/5145c9d3c3603c9e626585cce8cffdfcac081b31.jpg","https://cdn.shibe.online/shibes/b359c891e39994af83cf45738b28e499cb8ffe74.jpg","https://cdn.shibe.online/shibes/0b77f74a5d9afaa4b5094b28a6f3ee60efcb3874.jpg","https://cdn.shibe.online/shibes/adccfdf7d4d3332186c62ed8eb254a49b889c6f9.jpg","https://cdn.shibe.online/shibes/3aac69180f777512d5dabd33b09f531b7a845331.jpg","https://cdn.shibe.online/shibes/1d25e4f592db83039585fa480676687861498db8.jpg","https://cdn.shibe.online/shibes/d8349a2436420cf5a89a0010e91bf8dfbdd9d1cc.jpg","https://cdn.shibe.online/shibes/eb465ef1906dccd215e7a243b146c19e1af66c67.jpg","https://cdn.shibe.online/shibes/3d14e3c32863195869e7a8ba22229f457780008b.jpg","https://cdn.shibe.online/shibes/79cedc1a08302056f9819f39dcdf8eb4209551a3.jpg","https://cdn.shibe.online/shibes/4440aa827f88c04baa9c946f72fc688a34173581.jpg","https://cdn.shibe.online/shibes/94ea4a2d4b9cb852e9c1ff599f6a4acfa41a0c55.jpg","https://cdn.shibe.online/shibes/f4478196e441aef0ada61bbebe96ac9a573b2e5d.jpg","https://cdn.shibe.online/shibes/96d4db7c073526a35c626fc7518800586fd4ce67.jpg","https://cdn.shibe.online/shibes/196f3ed10ee98557328c7b5db98ac4a539224927.jpg","https://cdn.shibe.online/shibes/d12b07349029ca015d555849bcbd564d8b69fdbf.jpg","https://cdn.shibe.online/shibes/80fba84353000476400a9849da045611a590c79f.jpg","https://cdn.shibe.online/shibes/94cb90933e179375608c5c58b3d8658ef136ad3c.jpg","https://cdn.shibe.online/shibes/8447e67b5d622ef0593485316b0c87940a0ef435.jpg","https://cdn.shibe.online/shibes/c39a1d83ad44d2427fc8090298c1062d1d849f7e.jpg","https://cdn.shibe.online/shibes/6f38b9b5b8dbf187f6e3313d6e7583ec3b942472.jpg","https://cdn.shibe.online/shibes/81a2cbb9a91c6b1d55dcc702cd3f9cfd9a111cae.jpg","https://cdn.shibe.online/shibes/f1f6ed56c814bd939645138b8e195ff392dfd799.jpg","https://cdn.shibe.online/shibes/204a4c43cfad1cdc1b76cccb4b9a6dcb4a5246d8.jpg","https://cdn.shibe.online/shibes/9f34919b6154a88afc7d001c9d5f79b2e465806f.jpg","https://cdn.shibe.online/shibes/6f556a64a4885186331747c432c4ef4820620d14.jpg","https://cdn.shibe.online/shibes/bbd18ae7aaf976f745bc3dff46b49641313c26a9.jpg","https://cdn.shibe.online/shibes/6a2b286a28183267fca2200d7c677eba73b1217d.jpg","https://cdn.shibe.online/shibes/06767701966ed64fa7eff2d8d9e018e9f10487ee.jpg","https://cdn.shibe.online/shibes/7aafa4880b15b8f75d916b31485458b4a8d96815.jpg","https://cdn.shibe.online/shibes/b501169755bcf5c1eca874ab116a2802b6e51a2e.jpg","https://cdn.shibe.online/shibes/a8989bad101f35cf94213f17968c33c3031c16fc.jpg","https://cdn.shibe.online/shibes/f5d78feb3baa0835056f15ff9ced8e3c32bb07e8.jpg","https://cdn.shibe.online/shibes/75db0c76e86fbcf81d3946104c619a7950e62783.jpg","https://cdn.shibe.online/shibes/8ac387d1b252595bbd0723a1995f17405386b794.jpg","https://cdn.shibe.online/shibes/4379491ef4662faa178f791cc592b52653fb24b3.jpg","https://cdn.shibe.online/shibes/4caeee5f80add8c3db9990663a356e4eec12fc0a.jpg","https://cdn.shibe.online/shibes/99ef30ea8bb6064129da36e5673649e957cc76c0.jpg","https://cdn.shibe.online/shibes/aeac6a5b0a07a00fba0ba953af27734d2361fc10.jpg","https://cdn.shibe.online/shibes/9a217cfa377cc50dd8465d251731be05559b2142.jpg","https://cdn.shibe.online/shibes/65f6047d8e1d247af353532db018b08a928fd62a.jpg","https://cdn.shibe.online/shibes/fcead395cbf330b02978f9463ac125074ac87ab4.jpg","https://cdn.shibe.online/shibes/79451dc808a3a73f99c339f485c2bde833380af0.jpg","https://cdn.shibe.online/shibes/bedf90869797983017f764165a5d97a630b7054b.jpg","https://cdn.shibe.online/shibes/dd20e5801badd797513729a3645c502ae4629247.jpg","https://cdn.shibe.online/shibes/88361ee50b544cb1623cb259bcf07b9850183e65.jpg","https://cdn.shibe.online/shibes/0ebcfd98e8aa61c048968cb37f66a2b5d9d54d4b.jpg"]
            let kya = list[Math.floor(Math.random() * list.length)]
            benny.sendFileFromUrl(from, kya, 'Dog.jpeg', 'Inu')
            break
        case '#neko':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            q2 = Math.floor(Math.random() * 900) + 300;
            q3 = Math.floor(Math.random() * 900) + 300;
            benny.sendFileFromUrl(from, 'http://placekitten.com/'+q3+'/'+q2, 'neko.png','Neko ')
            break
        case '#pokemon':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            q7 = Math.floor(Math.random() * 890) + 1;
            benny.sendFileFromUrl(from, 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/'+q7+'.png','Pokemon.png',)
            break
        case '#ss':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            const _query = body.slice(4)
            if (!_query.match(isUrl)) return benny.reply(from, mess.error.Iv, id)
            if (args.length === 1) return benny.reply(from, 'Kirim perintah *#ss [web]*\nContoh *#ss https://google.com*', id)
            await ss(_query).then(() => benny.sendFile(from, './media/img/screenshot.jpeg', 'ss.jpeg', '', id))
            .catch(() => benny.reply(from, `Error tidak dapat mengambil screenshot website ${_query}`, id))
            break
        case '#quote':
        case '#quotes':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            const quotes = await get.get('https://mhankbarbar.herokuapp.com/api/randomquotes').json()
            benny.reply(from, `➸ *Quotes* : ${quotes.quotes}\n➸ *Author* : ${quotes.author}`, id)
            break
        case '#quotesnime':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            const skya = await get.get('https://mhankbarbar.herokuapp.com/api/quotesnime/random').json()
            skya_ = skya.data
            benny.reply(from, `➸ *Quotes* : ${skya_.quote}\n➸ *Character* : ${skya_.character}\n➸ *Anime* : ${skya_.anime}`, id)
            break
        case '#meme':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            const response = await axios.get('https://meme-api.herokuapp.com/gimme/wholesomeanimemes');
            const { postlink, title, subreddit, url, nsfw, spoiler } = response.data
            benny.sendFileFromUrl(from, `${url}`, 'meme.jpg', `${title}`)
            break
        case '#help':
		case '#menu':
		case '#command':
		case '#perintah':
	    if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
	    return await benny.reply(from, help, id)
            break
        case '#readme':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            benny.reply(from, readme, id)
            break			
		case 'p':
		case 'Woy':
		case 'woy':
		case 'Bot':
		case 'bot':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
		    benny.sendText(from, 'Bot aktif ketik #help untuk melihat list Bot ini')
			break
		case '#stat': {
            const loadedMsg = await benny.getAmountOfLoadedMessages()
            const chatIds = await benny.getAllChatIds()
            const groups = await benny.getAllGroups()
            const blok = await benny.getBlockedIds()
            benny.sendText(from, `Status :\n- ${loadedMsg} Loaded Messages\n- ${groups.length} Group Chats\n- ${blok.length} Kontak Terblokir\n- ${chatIds.length - groups.length} Personal Chats\n- ${chatIds.length} Total Chats`)
            }
			break
		case 'assalamualaikum':
		case 'asalamualaikum':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
		    benny.sendText(from, 'Waalaikumsalam', id)
			break
			case '#antivirtex':
			return await benny.reply(from, `\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nhttps://youtube.com/c/Uwak%20Cyber\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n`, id)
			break
		case 'makasih':
		case 'terima kasih':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
		    return await benny.reply(from, 'Sama Sama Bre', id)
			break
		case '#daftarpremium':
		if (isPremium) return benny.sendText(from, `Nomor kamu sudah terdaftar di user premium`)
          const key = args[1]
	  if (key !== 'javascript') return benny.reply(from, '*key* salah! silahkan chat owner bot unruk mendapatkan key yang valid', id)
	   _premium.push(sender.id)
   fs.writeFileSync('./lib/premium.json', JSON.stringify(_premium))
   return await benny.reply(from, 'Selamat nomor anda telah terdaftar sebagai premium user gunakan fitur premium dengan bijak. \n Terima Kasih', id)
   break
   case '#info':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            benny.sendLinkWithAutoPreview(from, 'https://github.com/cari%20bot%20sendiri%20lah%20tolol', info)
            break
        case '#snk':
		if (!isRegistered) return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
            benny.reply(from, snk, id)
            break
			//return benny.sendText(from, `Nomor kamu belum terdafar! \n\nSilahkan register dengan format:\n*#daftar* <nama | daerah>\n\nTanpa tanda <>`)
        }
    } catch (err) {
        console.log(color('[ERROR]', 'red'), err)
        //benny.kill().then(a => console.log(a))
    }
}
