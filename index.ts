import * as SP from 'serialport';
import { JolocomLib } from "jolocom-lib"

const seed = "a".repeat(64)
const pword = "b".repeat(64)

const vkp = JolocomLib.KeyProvider.fromSeed(Buffer.from(seed, 'hex'), pword)

const setupPort = (port: SP.PortInfo) => new SP(port.comName, {
    baudRate: 1000000,
    autoOpen: false,
    rtscts: true
}, err => err ? console.error(err.toString()) : null)

const configPort = (sp: SP) => (cb: (line: string) => void) => sp.pipe(new SP.parsers.Readline({
    delimiter: '\n',
    encoding: 'ascii',
    includeDelimiter: false
})).on("data", cb)

const openPort = (sp: SP) => (initialWrite: string) => sp.open(err => sp.write(initialWrite) && err ? console.error(err.toString()) : null)

JolocomLib.registries.jolocom.create().authenticate(vkp, {
    derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
    encryptionPass: pword
}).then(async (idw) => {
    console.log("id created")

    SP.list()
        .then(spInfos => spInfos.filter(info => info.comName.includes("/dev/tty.usbmodem"))
              .map(setupPort)
              .map(sp => configPort(sp)(console.log) && sp)
              .map(openPort)
              .map(write => write("henlo")))
        .catch(err => err ? console.error(err.toString()) : null)


}).catch(console.error)
