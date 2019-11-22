import { Gpio } from 'onoff'

const validLED = new Gpio(16, 'out')
const invalidLED = new Gpio(2, 'out')

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

export const showSuccess = () => blinkRepeat(validLED)(500)(3)
export const showFailure = () => blinkRepeat(invalidLED)(500)(3)

showSuccess()
showFailure()
