const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const express = require('express')
const pino = require('pino')

const app = express()
app.use(express.json())

let sock = null

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Kita akan render sendiri menggunakan qrcode-terminal
        logger: pino({ level: 'silent' })
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
            console.log("\n==================================================");
            console.log("📲 SCAN QR CODE INI MENGGUNAKAN WHATSAPP ANDA 📲");
            console.log("==================================================\n");
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('⚠️ Connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            if (shouldReconnect) {
                connectToWhatsApp()
            }
        } else if (connection === 'open') {
            console.log('✅ WhatsApp connected successfully!')
        }
    })

    sock.ev.on('creds.update', saveCreds)
}

connectToWhatsApp()

// API Endpoint for Go Backend
app.post('/send', async (req, res) => {
    try {
        const { target, message } = req.body

        if (!sock) {
            return res.status(500).json({ error: 'WhatsApp is not connected yet' })
        }

        if (!target || !message) {
            return res.status(400).json({ error: 'target and message are required' })
        }

        // Format number correctly (add @s.whatsapp.net)
        let formattedTarget = target.replace(/[^0-9]/g, '') // remove non-numeric chars
        if (formattedTarget.startsWith('0')) {
            formattedTarget = '62' + formattedTarget.substring(1)
        }
        if (!formattedTarget.includes('@s.whatsapp.net')) {
            formattedTarget = formattedTarget + '@s.whatsapp.net'
        }

        await sock.sendMessage(formattedTarget, { text: message })
        console.log(`✉️ Message sent successfully to ${target}`)
        res.json({ success: true, message: 'Message sent successfully' })
    } catch (error) {
        console.error('❌ Failed to send message:', error)
        res.status(500).json({ error: 'Failed to send message', details: error.message })
    }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`🚀 Baileys API server running on http://localhost:${PORT}`)
})
