import { spawn } from 'child_process'
import { Duplex } from 'stream'

const minicom = (baud: number, path: string) => spawn('minicom', ['-b', `${baud}`, '-o', '-D', path])

const getPort = (baud: number, path: string) => {
    const b = minicom(baud, path)

    return new Duplex({
        read: b.stdout.read,
        write: b.stdin.write
    })
}
