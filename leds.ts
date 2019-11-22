import { Gpio } from 'onoff'

const LED = new Gpio(29, 'out')

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

export const showSuccess = () => blinkRepeat(LED)(500)(3)
export const showFailure = () => blinkRepeat(LED)(500)(1)

