import * as SP from 'serialport';
import { streamValidator } from './serial'
import { JolocomLib } from "jolocom-lib"

const seed = "a".repeat(64)
const pword = "b".repeat(64)

const vkp = JolocomLib.KeyProvider.fromSeed(Buffer.from(seed, 'hex'), pword)

const setupPort = (port: string) => new SP(port, {
    baudRate: 115200,
    autoOpen: false,
    rtscts: false
}, err => err ? console.error(err.toString()) : null)

JolocomLib.registries.jolocom.create().authenticate(vkp, {
    derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
    encryptionPass: pword
}).then(async (idw) => {

    const port = setupPort('/dev/ttyACM0')

    port.pipe(streamValidator((jwt: string) => {
        console.log(jwt)
        try {
            return JolocomLib.util.validateDigestable(JolocomLib.parse.interactionToken.fromJWT(jwt))
        } catch (err) {
            return false
        }
    })(valid => valid
       ? console.log("valid")
       : console.log("invalid")))

    port.open(async err => {
        console.error(err)
        port.write(await idw.create.interactionTokens.request.auth({
            callbackURL: 'ble lol',
            description: 'ble lol'
        }, pword).then(t => t.encode() + '\n'))
    })

}).catch(console.error)
