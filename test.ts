import { openPort, streamValidator, printer } from './serial'

const port = openPort(115200, '/dev/tty.usbmodem0006834056531')

console.log('pipe')
// port.pipe(printer)

console.log('write')

port.write('henlo\n')
console.log('end')
