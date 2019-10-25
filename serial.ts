import { spawn } from 'child_process'
import { Duplex, Writable } from 'stream'
import { parsers } from 'serialport'
import { JolocomLib } from 'jolocom-lib'

const minicom = (baud: number, path: string) => spawn('minicom', ['-b', `${baud}`, '-o', '-D', path])

export const openPort = (baud: number, path: string) => {
    const minicomInstance = minicom(baud, path)

    return new Duplex({
        read: minicomInstance.stdout.read,
        write: minicomInstance.stdin.write,
        destroy: (err, callback) => minicomInstance.kill()
    })
}

export const tokenDelimiter = options => new parsers.Readline(options)

export const tokenValidation = (validityCallback: (validity: boolean) => void): Writable => new Writable({
    write: (chunk: any, encoding: string, callback: (error?: Error) => void) =>
        JolocomLib.util.validateDigestable(JolocomLib.parse.interactionToken.fromJWT(chunk))
        .then(validityCallback)
})
