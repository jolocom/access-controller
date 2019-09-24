import * as SP from 'serialport';
import { JolocomLib } from "jolocom-lib"

const portAddrs = process.env.PORT || "/dev/ttyACM0"

const seed = "a".repeat(64)
const pword = "b".repeat(64)

const vkp = JolocomLib.KeyProvider.fromSeed(Buffer.from(seed, 'hex'), pword)

const idw = JolocomLib.registries.jolocom.create().authenticate(vkp, {
    derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
    encryptionPass: pword
})

const port = new SP(portAddrs, {
    baudRate:115200
}, console.log)

const parser = new SP.parsers.Readline({
    delimiter: "\n",
    encoding: "ascii",
    includeDelimiter: false
})

port.pipe(parser)

parser.on("data", data => {
    console.log(`recieved: ${data}`)
    // send back new one and validate/act on recieved
})

console.log("done")
