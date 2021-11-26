function set_klaw (gape: number) {
    Kitronik_Move_Motor.writeServoPin(Kitronik_Move_Motor.ServoSelection.servo1, gape)
    if (TurnRight == 0) {
        Vehicle_LEDs.setZipLedColor(2, heatmap(0, gape, 180))
        Vehicle_LEDs.setZipLedColor(3, heatmap(0, gape, 180))
        Vehicle_LEDs.show()
    }
}
function Set_Rmotor (Speed: number) {
    if (Speed > 10) {
        Kitronik_Move_Motor.motorOn(Kitronik_Move_Motor.Motors.MotorRight, Kitronik_Move_Motor.MotorDirection.Forward, Speed)
    } else if (Speed < -10) {
        Kitronik_Move_Motor.motorOn(Kitronik_Move_Motor.Motors.MotorRight, Kitronik_Move_Motor.MotorDirection.Reverse, 0 - Speed)
    } else {
        Kitronik_Move_Motor.motorOff(Kitronik_Move_Motor.Motors.MotorRight)
    }
    if (TurnRight == 0) {
        Vehicle_LEDs.setZipLedColor(1, heatmap(-100, Speed, 100))
        Vehicle_LEDs.show()
    }
}
function Set_Lmotor (Speed: number) {
    if (Speed > 10) {
        Kitronik_Move_Motor.motorOn(Kitronik_Move_Motor.Motors.MotorLeft, Kitronik_Move_Motor.MotorDirection.Forward, Speed)
    } else if (Speed < -10) {
        Kitronik_Move_Motor.motorOn(Kitronik_Move_Motor.Motors.MotorLeft, Kitronik_Move_Motor.MotorDirection.Reverse, 0 - Speed)
    } else {
        Kitronik_Move_Motor.motorOff(Kitronik_Move_Motor.Motors.MotorLeft)
    }
    if (TurnRight == 0) {
        Vehicle_LEDs.setZipLedColor(0, heatmap(-100, Speed, 100))
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
function Indicate2 (TurnR: number) {
    for (let flash = 0; flash <= 6; flash++) {
        Flash(Kitronik_Move_Motor.colors(Kitronik_Move_Motor.ZipLedColors.Orange), TurnR)
        Flash(Kitronik_Move_Motor.colors(Kitronik_Move_Motor.ZipLedColors.Black), TurnR)
    }
}
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
function setup () {
    L_speed = 0
    L_now = 0
    R_speed = 0
    R_now = 0
    Gape = 15
    Gape_now = 15
    TurnRight = 0
    targetRightMotor = 0
    Vehicle_LEDs = Kitronik_Move_Motor.createMoveMotorZIPLED(4)
    Kitronik_Move_Motor.stop()
}
radio.onReceivedValue(function (name, value) {
    heartbeat = 1
    if (name == "L_speed") {
        if (value != L_speed) {
            L_speed = value
            Set_Lmotor(value)
        }
    } else if (name == "R_speed") {
        if (value != R_speed) {
            R_speed = value
            Set_Rmotor(value)
        }
    } else if (name == "Dial") {
        Gape = Math.trunc(Math.map(value, -120, 120, 15, 175))
        if (Gape != Gape_now) {
            set_klaw(Gape)
            Gape_now = Gape
        }
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
        TurnRight = value * 2 - 1
        Indicate2(TurnRight)
        TurnRight = 0
    } else if (name == "Claw") {
        Gape = Math.map(value, -120, 120, 0, 180)
        if (TurnRight == 0) {
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
function Flash (Colour: number, RightSide: number) {
    if (RightSide == 1) {
        Vehicle_LEDs.setZipLedColor(1, Colour)
        Vehicle_LEDs.setZipLedColor(2, Colour)
    } else {
        Vehicle_LEDs.setZipLedColor(0, Colour)
        Vehicle_LEDs.setZipLedColor(3, Colour)
    }
    Vehicle_LEDs.show()
    basic.pause(500)
}
function beat_heart () {
    heart = 0 - heart
    if (heart == 1) {
        basic.showIcon(IconNames.Heart)
    } else if (heart == -1) {
        basic.showIcon(IconNames.SmallHeart)
    } else {
        basic.showIcon(IconNames.No)
    }
}
let heart = 0
let Near_count = 0
let Distance = 0
let Near = 0
let Gape_now = 0
let Gape = 0
let R_now = 0
let L_now = 0
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
let Vehicle_LEDs: Kitronik_Move_Motor.MoveMotorZIP = null
let TurnRight = 0
let heartbeat = 0
let time_out = 0
radio.setGroup(99)
setup()
flex_klaw(2)
time_out = input.runningTime() + 10000
heartbeat = input.runningTime() + 500
basic.showIcon(IconNames.Heart)
basic.forever(function () {
    if (input.runningTime() > heartbeat) {
        beat_heart()
        heartbeat = input.runningTime() + 500
    }
    if (input.runningTime() > time_out) {
        Kitronik_Move_Motor.stop()
        heartbeat = 0
    }
    basic.pause(200)
})
