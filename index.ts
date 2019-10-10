import * as SP from 'serialport';
import { JolocomLib } from "jolocom-lib"

const portAddrs = process.env.PORT || "/dev/cu.usbmodem0006835297371"

const seed = "a".repeat(64)
const pword = "b".repeat(64)

const vkp = JolocomLib.KeyProvider.fromSeed(Buffer.from(seed, 'hex'), pword)

JolocomLib.registries.jolocom.create().authenticate(vkp, {
    derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
    encryptionPass: pword
}).then(async (idw) => {
    console.log("id created")

    const port = new SP(portAddrs, {
        baudRate:115200
    }, (err) => {
        if (err) console.error(err.toString())
    })

    const parser = new SP.parsers.Readline({
        delimiter: "\n",
        encoding: "ascii",
        includeDelimiter: false
    })

    port.pipe(parser)

    port.write(await idw.create.interactionTokens.request.auth({
        callbackURL: 'https://google.com',
        description: 'henlo via ble'
    }, pword).then(t => t.encode()))

    port.write('\n')

    port.on("error", (d) => console.error(d))

    parser.on("data", async (data) => {
        console.log(`received: ${data}`)

        // send back new one
        // port.write(await idw.create.interactionTokens.request.auth({
            // callbackURL: 'https://google.com',
            // description: 'henlo via ble'
        // }, pword).then(t => t.encode()))
        // validate received
        // try {
            // idw.validateJWT(JolocomLib.parse.interactionToken.fromJWT(data))
            // console.log("valid")
        // } catch (err) {
            // console.error(err.toString())
        // } finally {
            // console.log("token checked")
        // }
    })
}).catch(console.error)
