function Set_Rmotor (Speed: number) {
    if (Speed > 10) {
        Kitronik_Move_Motor.motorOn(Kitronik_Move_Motor.Motors.MotorRight, Kitronik_Move_Motor.MotorDirection.Forward, Speed)
    } else if (Speed < -10) {
        Kitronik_Move_Motor.motorOn(Kitronik_Move_Motor.Motors.MotorRight, Kitronik_Move_Motor.MotorDirection.Reverse, 0 - Speed)
    } else {
        Kitronik_Move_Motor.motorOff(Kitronik_Move_Motor.Motors.MotorRight)
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
}
input.onButtonPressed(Button.A, function () {
    if (targetRightMotor == 0) {
        L_speed += -5
    } else {
        R_speed += -5
    }
    expiry_time = input.runningTime() + 2000
})
function perform_scans () {
    radio.setGroup(1)
    Scanning = 1
    basic.showArrow(ArrowNames.East)
    RadarScan()
    basic.showArrow(ArrowNames.West)
    LightScan()
    basic.showIcon(IconNames.Heart)
    radio.setGroup(99)
    Scanning = 0
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
    Kitronik_Move_Motor.spin(Kitronik_Move_Motor.SpinDirections.Right, 19)
    Dark = input.lightLevel()
    for (let Dark_index = 0; Dark_index <= 50; Dark_index++) {
        Shine = input.lightLevel()
        if (Shine < Dark) {
            Dark_count = Dark_index
            Dark = Shine
        }
        basic.pause(50)
    }
    Kitronik_Move_Motor.stop()
    Dark = Dark * 100 + Dark_count
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
    expiry_time = input.runningTime() + 2000
})
input.onButtonPressed(Button.B, function () {
    if (targetRightMotor == 0) {
        L_speed += 5
    } else {
        R_speed += 5
    }
    expiry_time = input.runningTime() + 2000
})
function setup () {
    radio.setGroup(99)
    L_speed = 0
    R_speed = 0
    new_Gape = 15
    Gape = 15
    Turning = 0
    Scanning = 0
    targetRightMotor = 0
    Vehicle_LEDs = Kitronik_Move_Motor.createMoveMotorZIPLED(4)
    Kitronik_Move_Motor.stop()
    NOW = input.runningTime()
    expiry_time = NOW + 2000
}
radio.onReceivedValue(function (name, value) {
    if (name == "L_speed") {
        if (value != L_speed) {
            L_speed = value
            Set_Lmotor(L_speed)
        }
    } else if (name == "R_speed") {
        if (value != R_speed) {
            R_speed = value
            Set_Rmotor(R_speed)
        }
    } else if (name == "Dial") {
        new_Gape = Math.trunc(Math.map(value, -120, 120, 15, 175))
        if (Gape != new_Gape) {
            Gape = new_Gape
            Kitronik_Move_Motor.writeServoPin(Kitronik_Move_Motor.ServoSelection.servo1, Gape)
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
        Turning = value * 2
    } else if (name == "Scan") {
        perform_scans()
        radio.sendValue("RadarMin", Near)
        radio.sendValue("DarkMin", Dark)
    } else {
        alarm()
    }
    expiry_time = input.runningTime() + 2000
})
function RadarScan () {
    Kitronik_Move_Motor.spin(Kitronik_Move_Motor.SpinDirections.Left, 18)
    Near = Kitronik_Move_Motor.measure()
    for (let Near_index = 0; Near_index <= 50; Near_index++) {
        Distance = Kitronik_Move_Motor.measure()
        if (Distance < Near) {
            Near_count = Near_index
            Near = Distance
        }
        basic.pause(50)
    }
    Kitronik_Move_Motor.stop()
    Near = Near * 100 + Near_count
}
function flex_klaw (count: number) {
    for (let index = 0; index < count; index++) {
        Kitronik_Move_Motor.writeServoPin(Kitronik_Move_Motor.ServoSelection.servo1, 175)
        basic.pause(500)
        Kitronik_Move_Motor.writeServoPin(Kitronik_Move_Motor.ServoSelection.servo1, 10)
        basic.pause(500)
    }
}
function Flash () {
    flash_time = input.runningTime() + 150
    if (Turning % 2 == 0) {
        flash_colour = Kitronik_Move_Motor.colors(Kitronik_Move_Motor.ZipLedColors.Black)
    } else {
        flash_colour = Kitronik_Move_Motor.rgb(255, 100, 0)
    }
    if (Turning > 0) {
        Vehicle_LEDs.setZipLedColor(1, flash_colour)
        Vehicle_LEDs.setZipLedColor(2, flash_colour)
        Turning += -1
    } else if (Turning < 0) {
        Vehicle_LEDs.setZipLedColor(0, flash_colour)
        Vehicle_LEDs.setZipLedColor(3, flash_colour)
        Turning += 1
    }
    Vehicle_LEDs.show()
}
function Map_LEDS () {
    if (Turning == 0) {
        Vehicle_LEDs.setZipLedColor(2, heatmap(0, Gape, 180))
        Vehicle_LEDs.setZipLedColor(3, heatmap(0, Gape, 180))
        Vehicle_LEDs.setZipLedColor(1, heatmap(-100, R_speed, 100))
        Vehicle_LEDs.setZipLedColor(0, heatmap(-100, L_speed, 100))
        Vehicle_LEDs.show()
    }
}
let flash_colour = 0
let flash_time = 0
let Near_count = 0
let Distance = 0
let Near = 0
let NOW = 0
let Vehicle_LEDs: Kitronik_Move_Motor.MoveMotorZIP = null
let Turning = 0
let Gape = 0
let new_Gape = 0
let R_byte = 0
let G_byte = 0
let B_byte = 0
let mapped = 0
let Dark_count = 0
let Shine = 0
let Dark = 0
let Scanning = 0
let expiry_time = 0
let R_speed = 0
let L_speed = 0
let targetRightMotor = 0
setup()
flex_klaw(3)
basic.showIcon(IconNames.Heart)
basic.forever(function () {
    NOW = input.runningTime()
    if (Scanning == 0 && NOW > expiry_time) {
        Kitronik_Move_Motor.stop()
        basic.showIcon(IconNames.No)
    }
    if (Turning == 0) {
        Map_LEDS()
    } else {
        if (NOW > flash_time) {
            Flash()
        }
    }
})
