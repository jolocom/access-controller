import * as SP from 'serialport';

const portAddrs = process.env.PORT || "/dev/ttyACM0"

const port = new SP(portAddrs, {
    baudRate:115200
}, console.log)

const parser = new SP.parsers.Readline({
    delimiter: "\n",
    encoding: "ascii",
    includeDelimiter: false
})

port.pipe(parser)

parser.on("data", data => {
    console.log(data)
    // send back new one and validate/act on recieved
})

console.log("done")
