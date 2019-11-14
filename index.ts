import * as SP from 'serialport';
import { streamValidator } from './serial'
import { JolocomLib } from 'jolocom-lib'
import { CredentialResponse } from 'jolocom-lib/js/interactionTokens/credentialResponse'
import { InteractionType } from 'jolocom-lib/js/interactionTokens/types'
import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet';

import {
    seed,
    password,
    doorMapping
} from './config'

const vkp = JolocomLib.KeyProvider.fromSeed(Buffer.from(seed, 'hex'), password)

// Credential request definition
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

const writeToken = (callbackURL: string, issuer: string) => (idw: IdentityWallet) => async (port: SP) => port.write(
    await idw.create.interactionTokens.request.share(
        credReqAttrs(callbackURL, issuer),
        password
    ).then(t => t.encode() + '\n')
)

JolocomLib.registries.jolocom.create().authenticate(vkp, {
  derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
  encryptionPass: password
}).then(async (idw) => {

  // partially apply so we dont always need all the args (they never change)
  const writeConstToken = writeToken('ble', 'did')(idw)

  // for each doorID, open the corrosponding serial port
  Object.keys(doorMapping)
    .map(door => {
      const port = setupPort(doorMapping[door])

      // pipe the output of the port through the stream validator
      port.pipe(streamValidator((jwt: string) => {
        console.log(`token received: ${Date.now()}`)
        // parse the recieved token and ensure it's a credential response
        const token = JolocomLib.parse.interactionToken.fromJWT<CredentialResponse>(jwt)

        if (token.interactionType !== InteractionType.CredentialResponse)
          return Promise.resolve(false)

        // ensure the response contains an accessKey credential
        const accessCred = token.interactionToken.suppliedCredentials.find(c => c.type.includes('AccessKey', 1))

        if (!accessCred || !accessCred.claim || !accessCred.claim.token)
          return Promise.resolve(false)

        try {
          // test for doorID membership in the accessKey credential
          const access: string[] = (accessCred.claim.token as string).split(',')

          if (!access.includes(door))
            return Promise.resolve(false)

          // return validation result
          return JolocomLib.util.validateDigestable(token)
        } catch (err) {
          return Promise.resolve(false)
        }
      })(async valid => {
        // act on the validity of the token recieved
        console.log(`validity determined: ${Date.now()}`)
        if (valid) {
          console.log(`Door ${door} valid`)
        } else {
          console.log(`Door ${door} invalid`)
        }

        // write a new request token to the relayer
        writeConstToken(port)
      }))

      // write the initial request token on port opening
      port.open(async err => {
        if (err) console.error(err)
        writeConstToken(port)
      })

    })
}).catch(console.error)
