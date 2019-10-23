import * as SP from 'serialport';
import { JolocomLib } from "jolocom-lib"
import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet';
import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken';
import { CredentialResponse } from 'jolocom-lib/js/interactionTokens/credentialResponse';

const seed = "a".repeat(64)
const pword = "b".repeat(64)

const vkp = JolocomLib.KeyProvider.fromSeed(Buffer.from(seed, 'hex'), pword)

const setupPort = (port: SP.PortInfo) => new SP(port.comName, {
  baudRate: 1000000,
  autoOpen: false,
  rtscts: false
}, err => err ? console.error(err.toString()) : null)

const configPort = (sp: SP) => (cb: (line: string) => void) => sp.pipe(new SP.parsers.Readline({
  delimiter: '\n',
  encoding: 'ascii',
  includeDelimiter: false
})).on("data", cb)

const openPort = (sp: SP) => (initialWrite: string) => sp.open(err => sp.write(initialWrite) && err ? console.error(err.toString()) : null)

const parseAndHandle = (onValid, onInvalid) => idw => async (response: string) => console.log(response)//handleResponse(onValid, onInvalid)(idw)(JolocomLib.parse.interactionToken.fromJWT(response))

const handleResponse = (onValid: (jwt: JSONWebToken<CredentialResponse>) => void,
  onInvalid: (jwt: JSONWebToken<CredentialResponse>) => void) =>
  (idw: IdentityWallet) => async (response: JSONWebToken<CredentialResponse>) =>
    idw.validateJWT(response)
      .then(_ => onValid(response))
      .catch(_ => onInvalid(response))

JolocomLib.registries.jolocom.create().authenticate(vkp, {
  derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
  encryptionPass: pword
}).then(async (idw) => {

  SP.list()
    .then(spInfos => spInfos.filter(info => info.comName.includes("/dev/tty.usbmodem"))
      .map(setupPort)
      .map(sp => configPort(sp)(parseAndHandle(
        jwt => console.log("valid"),
        jwt => console.log("invalid")
      )(idw)) && sp)
      .map(openPort)
      .map(async (write) => write("henlo".repeat(20))))
    .catch(err => err ? console.error(err.toString()) : null)

}).catch(console.error)
