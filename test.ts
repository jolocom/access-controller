import { openPort, streamValidator, printer } from './serial'

const port = openPort(115200, '/dev/tty.usbmodem0006834056531')

console.log('pipe')
port.stdout.pipe(printer)

console.log('write')

port.stdin.write(Buffer.from('henlo\n', 'ascii'), err => console.error(err && err.message))
console.log('end')
