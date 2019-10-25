import { spawn } from 'child_process'
import { Duplex, Writable } from 'stream'
import { parsers } from 'serialport'

const minicom = (baud: number, path: string) => spawn('minicom', ['-b', `${baud}`, '-o', '-D', path])

export const openPort = (baud: number, path: string) => {
    const minicomInstance = minicom(baud, path)

    return new Duplex({
        read: minicomInstance.stdout.read,
        write: minicomInstance.stdin.write,
        destroy: (err, callback) => minicomInstance.kill()
    })
}

const delimit = options => new parsers.Readline(options)

export const streamValidator = (validate: (jwt: string) => Promise<boolean>) =>
    (validityCallback: (validity: boolean) => void) => delimit({
    delimiter: '\n',
    encoding: 'ascii',
    includeDelimiter: false
    }).on("data", chunk => validate(chunk).then(validityCallback))
