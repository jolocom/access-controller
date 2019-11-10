import * as SP from 'serialport';
import { streamValidator } from './serial'
import { JolocomLib } from 'jolocom-lib'
import { constraintFunctions } from 'jolocom-lib/js/interactionTokens/credentialRequest'
import { CredentialResponse } from 'jolocom-lib/js/interactionTokens/credentialResponse'
import { InteractionType } from 'jolocom-lib/js/interactionTokens/types'

const seed = "a".repeat(64)
const pword = "b".repeat(64)

const vkp = JolocomLib.KeyProvider.fromSeed(Buffer.from(seed, 'hex'), pword)
const doorID = '1'

const credReqAttrs = (callback: string, issuer: string) => ({
    callbackURL: callback,
    credentialRequirements: [{
        type: ['Credential', 'AccessKey'],
        constraints: [
            // constraintFunctions.is('issuer', issuer)
        ]
    }]
})

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
    const token = JolocomLib.parse.interactionToken.fromJWT<CredentialResponse>(jwt)
    if (token.interactionType !== InteractionType.CredentialResponse)
      return Promise.resolve(false)

    const accessCred = token.interactionToken.suppliedCredentials.find(c => c.type.includes('AccessKey', 1))

    if (!accessCred || !accessCred.claim || !accessCred.claim.token)
      return Promise.resolve(false)

    try {
      const access: string[] = (accessCred.claim.token as string).split(',')
      console.log(access)

      if (!access.includes(doorID))
         return Promise.resolve(false)
      
      return JolocomLib.util.validateDigestable(token)
    } catch (err) {
      return Promise.resolve(false)
    }
  })(async valid => {
    valid
      ? console.log("valid")
      : console.log("invalid")
    port.write(await idw.create.interactionTokens.request.share(
        credReqAttrs('https://henlo.com', 'did'),
        pword
    ).then(t => t.encode() + '\n'))
  }))

  port.open(async err => {
    console.error(err)
    port.write(await idw.create.interactionTokens.request.share(
        credReqAttrs('https://henlo.com', 'did'),
        pword
    ).then(t => t.encode() + '\n'))
  })

}).catch(console.error)
