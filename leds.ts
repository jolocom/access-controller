import * as fs from 'fs'

const LED = path => ({
    on: () => fs.writeFileSync(path, Buffer.from('1')),
    off: () => fs.writeFileSync(path, Buffer.from('0'))
})

const greenLED = LED('/sys/class/leds/led0/brightness')
const redLED = LED('/sys/class/leds/led1/brightness')

const blinkRepeat = led => time => n => {
    // turn led on
    led.on()
    setTimeout(_ => {
        // turn led off
        led.off()
        // repeat
        if (n > 0) setTimeout(_ => blinkRepeat(led)(time)(n - 1), time)
    }, time)
}

export const showSuccess = () => blinkRepeat(greenLED)(500)(3)
export const showFailure = () => blinkRepeat(redLED)(500)(3)
