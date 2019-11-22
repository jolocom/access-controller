import { Gpio } from 'onoff'

// const validLED = new Gpio(16, 'out')
// const invalidLED = new Gpio(2, 'out')

let r = (s, e) => Array.from('x'.repeat(e - s), (_, i) => s + i);

const leds = r(0, 50).map(n => new Gpio(n, 'out'))

leds.map(led => led.write(1))
setTimeout(_ => leds.map(led => led.write(0)), 1000)

const blinkRepeat = led => time => n => {
  // turn led on
  led.write(0)
  setTimeout(_ => {
    // turn led off
    led.write(1)
    // repeat
    if (n > 0) setTimeout(_ => blinkRepeat(led)(time)(n - 1), time)
  }, time)
}

// export const showSuccess = () => blinkRepeat(validLED)(500)(3)
// export const showFailure = () => blinkRepeat(invalidLED)(500)(3)

