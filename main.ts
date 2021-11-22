function set_klaw (gape: number) {
    Kitronik_Move_Motor.writeServoPin(Kitronik_Move_Motor.ServoSelection.servo1, gape)
    move_motor_zip.setZipLedColor(2, heatmap(0, gape, 180))
    move_motor_zip.setZipLedColor(3, heatmap(0, gape, 180))
    move_motor_zip.show()
}
function Indicator (Colour: number, IsRight: number) {
    if (IsRight == 1) {
        move_motor_zip.setZipLedColor(1, Colour)
        move_motor_zip.setZipLedColor(2, Colour)
    } else {
        move_motor_zip.setZipLedColor(3, Colour)
        move_motor_zip.setZipLedColor(4, Colour)
    }
    move_motor_zip.show()
    basic.pause(500)
}
input.onButtonPressed(Button.A, function () {
    if (targetRightMotor == 0) {
        L_speed += -5
    } else {
        R_speed += -5
    }
    time_out = input.runningTime() + 2000
})
function alarm () {
    for (let index = 0; index < 4; index++) {
        Kitronik_Move_Motor.soundSiren(Kitronik_Move_Motor.OnOffSelection.On)
        basic.pause(1000)
        Kitronik_Move_Motor.soundSiren(Kitronik_Move_Motor.OnOffSelection.Off)
        basic.pause(1000)
    }
}
function heatmap (lo: number, val: number, hi: number) {
    mapped = Math.map(val, lo, hi, -320, 320)
    B = Math.trunc(Math.max(0, 255 - Math.abs(-192 - mapped)))
    G = Math.trunc(Math.max(0, 255 - Math.abs(64 - mapped)))
    R2 = 255 - B - G
    return (R2 * 256 + G) * 256 + B
}
input.onButtonPressed(Button.AB, function () {
    targetRightMotor = 1 - targetRightMotor
    time_out = input.runningTime() + 2000
})
input.onButtonPressed(Button.B, function () {
    if (targetRightMotor == 0) {
        L_speed += 5
    } else {
        R_speed += 5
    }
    time_out = input.runningTime() + 2000
})
function Go (L: number, R: number) {
    if (L > 2) {
        Kitronik_Move_Motor.motorOn(Kitronik_Move_Motor.Motors.MotorLeft, Kitronik_Move_Motor.MotorDirection.Forward, L)
    } else if (L < -2) {
        Kitronik_Move_Motor.motorOn(Kitronik_Move_Motor.Motors.MotorLeft, Kitronik_Move_Motor.MotorDirection.Reverse, 0 - L)
    } else {
        Kitronik_Move_Motor.motorOff(Kitronik_Move_Motor.Motors.MotorLeft)
    }
    if (R > 2) {
        Kitronik_Move_Motor.motorOn(Kitronik_Move_Motor.Motors.MotorRight, Kitronik_Move_Motor.MotorDirection.Forward, R)
    } else if (R < -2) {
        Kitronik_Move_Motor.motorOn(Kitronik_Move_Motor.Motors.MotorRight, Kitronik_Move_Motor.MotorDirection.Reverse, 0 - R)
    } else {
        Kitronik_Move_Motor.motorOff(Kitronik_Move_Motor.Motors.MotorRight)
    }
    move_motor_zip.setZipLedColor(0, heatmap(-100, L, 100))
    move_motor_zip.setZipLedColor(1, heatmap(-100, R, 100))
    move_motor_zip.show()
}
function setup () {
    L_speed = 0
    R_speed = 0
    Gape = 15
    targetRightMotor = 0
    move_motor_zip = Kitronik_Move_Motor.createMoveMotorZIPLED(4)
    Kitronik_Move_Motor.stop()
}
radio.onReceivedValue(function (name, value) {
    if (name == "L_speed") {
        L_speed = value
        move_motor_zip.setZipLedColor(0, heatmap(-100, L_speed, 100))
    } else if (name == "R_speed") {
        R_speed = value
        move_motor_zip.setZipLedColor(1, heatmap(-100, R_speed, 100))
    } else if (name == "Dial") {
        Gape = Math.trunc(Math.map(value, -120, 120, 15, 175))
    } else if (name == "Honk") {
        if (value == 1) {
            Kitronik_Move_Motor.beepHorn()
        }
    } else if (name == "Siren") {
        if (value == 1) {
            Kitronik_Move_Motor.soundSiren(Kitronik_Move_Motor.OnOffSelection.On)
        } else {
            Kitronik_Move_Motor.soundSiren(Kitronik_Move_Motor.OnOffSelection.Off)
        }
    } else if (name == "Indicate") {
        for (let index2 = 0; index2 <= 4; index2++) {
            Indicator(Kitronik_Move_Motor.colors(Kitronik_Move_Motor.ZipLedColors.Orange), value)
            Indicator(Kitronik_Move_Motor.colors(Kitronik_Move_Motor.ZipLedColors.Black), value)
        }
    } else if (name == "Claw") {
        Claw = Math.map(value, -120, 120, 0, 180)
        move_motor_zip.setZipLedColor(2, heatmap(0, Claw, 1023))
        move_motor_zip.setZipLedColor(3, heatmap(0, Claw, 1023))
    } else {
        alarm()
    }
    time_out = input.runningTime() + 2000
})
function flex_klaw (count: number) {
    for (let index = 0; index < count; index++) {
        Kitronik_Move_Motor.writeServoPin(Kitronik_Move_Motor.ServoSelection.servo1, 175)
        basic.pause(500)
        Kitronik_Move_Motor.writeServoPin(Kitronik_Move_Motor.ServoSelection.servo1, 10)
        basic.pause(500)
    }
}
let Gape = 0
let R2 = 0
let G = 0
let B = 0
let mapped = 0
let targetRightMotor = 0
let Claw = 0
let R_speed = 0
let L_speed = 0
let time_out = 0
let move_motor_zip: Kitronik_Move_Motor.MoveMotorZIP = null
move_motor_zip = Kitronik_Move_Motor.createMoveMotorZIPLED(4)
flex_klaw(3)
time_out = 0
L_speed = 0
R_speed = 0
Claw = 0
radio.setGroup(99)
setup()
flex_klaw(2)
time_out = input.runningTime() + 2000
basic.showIcon(IconNames.Heart)
basic.forever(function () {
    if (input.runningTime() < time_out) {
        set_klaw(Gape)
        Go(L_speed, R_speed)
    } else {
        basic.showIcon(IconNames.No)
        Kitronik_Move_Motor.stop()
        basic.pause(200)
        basic.clearScreen()
        basic.showString("" + convertToText(L_speed) + ":" + convertToText(R_speed) + "_" + convertToText(Gape))
    }
})
