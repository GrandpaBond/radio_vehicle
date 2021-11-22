def set_klaw(gape: number):
    Kitronik_Move_Motor.write_servo_pin(Kitronik_Move_Motor.ServoSelection.SERVO1,
        max(min(175, gape), 10))
def heatmap(lo: number, val: number, hi: number):
    global mapped, B, G, R2
    mapped = Math.map(val, lo, hi, -320, 320)
    B = int(max(0, 255 - abs(-192 - mapped)))
    G = int(max(0, 255 - abs(64 - mapped)))
    R2 = 255 - B - G
    return (R2 * 256 + G) * 256 + B
def flash_right():
    pass
def flash_left():
    pass
def Go(L: number, R: number):
    if L > 5:
        Kitronik_Move_Motor.motor_on(Kitronik_Move_Motor.Motors.MOTOR_LEFT,
            Kitronik_Move_Motor.MotorDirection.FORWARD,
            L)
    elif L < -5:
        Kitronik_Move_Motor.motor_on(Kitronik_Move_Motor.Motors.MOTOR_LEFT,
            Kitronik_Move_Motor.MotorDirection.REVERSE,
            0 - L)
    else:
        Kitronik_Move_Motor.motor_off(Kitronik_Move_Motor.Motors.MOTOR_LEFT)
    if R > 5:
        Kitronik_Move_Motor.motor_on(Kitronik_Move_Motor.Motors.MOTOR_RIGHT,
            Kitronik_Move_Motor.MotorDirection.FORWARD,
            R)
    elif R < -5:
        Kitronik_Move_Motor.motor_on(Kitronik_Move_Motor.Motors.MOTOR_RIGHT,
            Kitronik_Move_Motor.MotorDirection.REVERSE,
            0 - R)
    else:
        Kitronik_Move_Motor.motor_off(Kitronik_Move_Motor.Motors.MOTOR_RIGHT)

def on_received_value(name, value):
    global OK, L_speed, R_speed, Gape, time_out
    OK = 1
    if name == "L_speed":
        L_speed = value
        move_motor_zip.set_zip_led_color(0, heatmap(-100, L_speed, 100))
    elif name == "R_speed":
        R_speed = value
        move_motor_zip.set_zip_led_color(1, heatmap(-100, R_speed, 100))
    elif name == "Dial":
        Gape = Math.map(value, -120, 120, 0, 180)
        move_motor_zip.set_zip_led_color(2, heatmap(0, Gape, 180))
        move_motor_zip.set_zip_led_color(3, heatmap(0, Gape, 180))
    elif name == "Honk":
        if value == 1:
            Kitronik_Move_Motor.beep_horn()
    else:
        OK = 0
    time_out = input.running_time() + 500
radio.on_received_value(on_received_value)

def flex_klaw(count: number):
    for index in range(count):
        Kitronik_Move_Motor.write_servo_pin(Kitronik_Move_Motor.ServoSelection.SERVO1, 175)
        basic.pause(500)
        Kitronik_Move_Motor.write_servo_pin(Kitronik_Move_Motor.ServoSelection.SERVO1, 10)
        basic.pause(500)
R2 = 0
G = 0
B = 0
mapped = 0
time_out = 0
Gape = 0
R_speed = 0
L_speed = 0
OK = 0
move_motor_zip: Kitronik_Move_Motor.MoveMotorZIP = None
move_motor_zip = Kitronik_Move_Motor.create_move_motor_zipled(4)
Kitronik_Move_Motor.motor_balance(Kitronik_Move_Motor.SpinDirections.LEFT, 5)
flex_klaw(2)
OK = 0
L_speed = 0
R_speed = 0
Gape = 0
radio.set_group(99)
time_out = input.running_time() + 500
Kitronik_Move_Motor.stop()

def on_forever():
    global time_out
    if OK == 1:
        Go(L_speed, R_speed)
        set_klaw(Gape)
    if input.running_time() > time_out:
        Kitronik_Move_Motor.motor_off(Kitronik_Move_Motor.Motors.MOTOR_LEFT)
        Kitronik_Move_Motor.motor_off(Kitronik_Move_Motor.Motors.MOTOR_RIGHT)
        basic.show_string("" + convert_to_text(L_speed) + "/" + convert_to_text(R_speed) + "/" + convert_to_text(Gape))
        time_out = input.running_time() + 500
basic.forever(on_forever)
