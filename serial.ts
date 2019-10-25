import { spawn } from 'child_process'
import { Duplex } from 'stream'

const minicom = (baud: number, path: string) => spawn('minicom', ['-b', `${baud}`, '-o', '-D', path])

export const openPort = (baud: number, path: string) => {
    const b = minicom(baud, path)

    return new Duplex({
        read: b.stdout.read,
        write: b.stdin.write
    })
}

export const tokenDelimiter = options => new parsers.Readline(options)

export const tokenValidation = (validityCallback: (validity: boolean) => void): Writable => new Writable({
    write: (chunk: any, encoding: string, callback: (error?: Error) => void) =>
        JolocomLib.util.validateDigestable(JolocomLib.parse.interactionToken.fromJWT(chunk))
        .then(validityCallback)
})
