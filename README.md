# What's sb_aircon

sb_aircon is command line JavaScript which sends SwitchBot Hub command.

As I wanted to control an air conditioner in my work room, I developed it ONLY just for air conditioner remote.

Though the script contains SwitchBot class which can send any command to SwitchBot cloud, sb_aircon is not for general purpose.

# Getting Started

```bach
$ npm install
```

and then, *edit sb_aircon.conf.js to fit to what you want*.

## params in sb_aircon.conf.js

* **token**: token string which you can get from SwitchBot app (to obtain token, see [SwitchBot official Github > Getting Started](https://github.com/OpenWonderLabs/SwitchBotAPI#getting-started) section)

* **deviceName** name of your *air conditioner*. it is what you set to your SwitchBot app as your virtual remote control device.

# How to use

```bach
$ node ab_aircon.js         # show help
$ node ab_aircon.js turnOn  # for turn on air conditioner
$ node ab_aircon.js turnOff # for turn off air conditioner 
$ node ab_aircon.js setAll 26,2,2,on  # 26 degree, cool, low fan speed, and power on
```

# Reference
Refer to official [SwitchBot developer Github](https://github.com/OpenWonderLabs/SwitchBotAPI).


# License 
MIT license
