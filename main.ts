function Indicate (Colour: number, TurnRight: number) {
    if (TurnRight == 1) {
        Vehicle_LEDs.setZipLedColor(1, Colour)
        Vehicle_LEDs.setZipLedColor(2, Colour)
    } else {
        Vehicle_LEDs.setZipLedColor(0, Colour)
        Vehicle_LEDs.setZipLedColor(3, Colour)
    }
    Vehicle_LEDs.show()
    basic.pause(500)
}
function set_klaw (gape: number) {
    Kitronik_Move_Motor.writeServoPin(Kitronik_Move_Motor.ServoSelection.servo1, gape)
    if (Flashing == 0) {
        Vehicle_LEDs.setZipLedColor(2, heatmap(0, gape, 180))
        Vehicle_LEDs.setZipLedColor(3, heatmap(0, gape, 180))
        Vehicle_LEDs.show()
    }
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
function LightScan () {
    Kitronik_Move_Motor.stop()
    Dark = input.lightLevel()
    Go(15, -15)
    for (let index = 0; index <= 50; index++) {
        basic.pause(100)
        Shine = input.lightLevel()
        if (Shine < Dark) {
            Dark_count = index
            Dark = Shine
        }
    }
    Kitronik_Move_Motor.stop()
    return Dark * 100 + Dark_count
}
function heatmap (lo: number, val: number, hi: number) {
    mapped = Math.map(val, lo, hi, -320, 320)
    B_byte = Math.trunc(Math.max(0, 255 - Math.abs(-192 - mapped)))
    G_byte = Math.trunc(Math.max(0, 255 - Math.abs(64 - mapped)))
    R_byte = 255 - B_byte - G_byte
    return (R_byte * 256 + G_byte) * 256 + B_byte
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
    Vehicle_LEDs.setZipLedColor(0, heatmap(-100, L, 100))
    Vehicle_LEDs.setZipLedColor(1, heatmap(-100, R, 100))
    Vehicle_LEDs.show()
}
function setup () {
    L_speed = 0
    R_speed = 0
    Gape = 15
    Flashing = 0
    targetRightMotor = 0
    Vehicle_LEDs = Kitronik_Move_Motor.createMoveMotorZIPLED(4)
    heart = 1
    Kitronik_Move_Motor.stop()
}
radio.onReceivedValue(function (name, value) {
    heart = 1
    if (name == "L_speed") {
        L_speed = value
        if (Flashing != -1) {
            Vehicle_LEDs.setZipLedColor(0, heatmap(-100, L_speed, 100))
        }
    } else if (name == "R_speed") {
        R_speed = value
        if (Flashing != 1) {
            Vehicle_LEDs.setZipLedColor(1, heatmap(-100, R_speed, 100))
        }
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
        Flashing = value * 2 - 1
        for (let flash = 0; flash <= 6; flash++) {
            Indicate(Kitronik_Move_Motor.colors(Kitronik_Move_Motor.ZipLedColors.Orange), value)
            Indicate(Kitronik_Move_Motor.colors(Kitronik_Move_Motor.ZipLedColors.Black), value)
        }
        Flashing = 0
    } else if (name == "Claw") {
        Gape = Math.map(value, -120, 120, 0, 180)
        if (Flashing == 0) {
            Vehicle_LEDs.setZipLedColor(2, heatmap(0, Gape, 1023))
            Vehicle_LEDs.setZipLedColor(3, heatmap(0, Gape, 1023))
        }
    } else if (name == "Scan") {
        radio.sendValue("RadarMin", RadarScan())
        radio.sendValue("DarkMin", LightScan())
    } else {
        alarm()
    }
    Vehicle_LEDs.show()
    time_out = input.runningTime() + 2000
})
function RadarScan () {
    Kitronik_Move_Motor.stop()
    Near = Kitronik_Move_Motor.measure()
    Go(-15, 15)
    for (let index = 0; index <= 50; index++) {
        basic.pause(100)
        Distance = Kitronik_Move_Motor.measure()
        if (Distance < Near) {
            Near_count = index
            Near = Distance
        }
    }
    Kitronik_Move_Motor.stop()
    return Near * 100 + Near_count
}
function flex_klaw (count: number) {
    for (let index = 0; index < count; index++) {
        Kitronik_Move_Motor.writeServoPin(Kitronik_Move_Motor.ServoSelection.servo1, 175)
        basic.pause(500)
        Kitronik_Move_Motor.writeServoPin(Kitronik_Move_Motor.ServoSelection.servo1, 10)
        basic.pause(500)
    }
}
let Near_count = 0
let Distance = 0
let Near = 0
let heart = 0
let Gape = 0
let R_byte = 0
let G_byte = 0
let B_byte = 0
let mapped = 0
let Dark_count = 0
let Shine = 0
let Dark = 0
let R_speed = 0
let L_speed = 0
let targetRightMotor = 0
let Flashing = 0
let Vehicle_LEDs: Kitronik_Move_Motor.MoveMotorZIP = null
let time_out = 0
radio.setGroup(99)
setup()
flex_klaw(2)
time_out = input.runningTime() + 10000
basic.showIcon(IconNames.Heart)
basic.forever(function () {
    if (input.runningTime() < time_out) {
        Go(L_speed, R_speed)
        set_klaw(Gape)
    } else {
        Kitronik_Move_Motor.stop()
        heart = 0
        basic.showIcon(IconNames.No)
    }
    basic.pause(200)
})
