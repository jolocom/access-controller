import { spawn } from 'child_process'

const minicom = (baud: number, path: string) => spawn('minicom', ['-b', `${baud}`, '-o', '-D', path])

const board = minicom(115200, '/dev/tty.usbmodem0006835297371')

board.stdout.on('data', d => console.log(d.toString()))

board.stdin.write('henlo'.repeat(150) + '\n')
