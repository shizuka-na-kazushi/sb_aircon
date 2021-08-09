
const axios = require('axios').default
const token = require('./sb_aircon.conf').token
const myDeviceName = require('./sb_aircon.conf').deviceName
const Path = require('path')

class SwitchBot {
  constructor() {
    this.axios = axios
    this.deviceList = null
    this.infraredRemoteList = null
  }

  GetDevices() {
    let _self = this
    return new Promise(function(resolve, reject) {
   
      _self.axios({
        method: 'GET',
        url: 'https://api.switch-bot.com/v1.0/devices',
        headers: {
          'Authorization': token,
        }
      }).then((response) => {
        let sbres = response.data
        if (sbres.statusCode != 100) {
          reject(new Error(sbres.message))
        } else {
          _self.deviceList = sbres.body.deviceList
          _self.infraredRemoteList = sbres.body.infraredRemoteList
          resolve(sbres.body)
        }
      })
    })
  }

  GetInfraredRemoteDeviceByName(deviceName) {
    let array = this.infraredRemoteList.filter((e) => e.deviceName == deviceName)
    return (array.length <= 0) ? null : array[0]
  }

  ExecCommand(device, command, params) {
    let _self = this
    return new Promise(function(resolve, reject) {

      console.log(`going to send command: ${command}${(params) ? ' with ' + params : ''}`)

      _self.axios({
        method: 'POST',
        url: `https://api.switch-bot.com/v1.0/devices/${device.deviceId}/commands`,
        headers: {
          'Authorization': token,
        },
        data: {
          command: command,
          parameter: params,
          commandType: 'command',
        },
      }).then((response) => {
        let sbres = response.data
        if (sbres.statusCode) {
          resolve(sbres)
        } else {
          console.log(`statusCode{${sbres.statusCode}}: ${sbres.message}`)
          reject(new Error(`statusCode{${sbres.statusCode}}: ${sbres.message}`))
        }
      })

    })
  }
}

function debug_print_devices(res) {
  console.log('----devices----')
  res.deviceList.forEach(element => {
    console.log('deviceId: ' + element.deviceId)
    console.log('  deviceName: ' + element.deviceName)
    console.log('  deviceType: ' + element.deviceType)
  })
  console.log('----infrared devices----')
  res.infraredRemoteList.forEach(element => {
    console.log('deviceId: ' + element.deviceId)
    console.log('  deviceName: ' + element.deviceName)
    console.log('  remoteType: ' + element.remoteType)
  })
}

function sendSwitchBotCommand(command, params) {
  return new Promise(function(resolve, reject) {

    let sb = new SwitchBot() 
    sb.GetDevices().then(res => {

      // debug_print_devices(res)
     
    let device = sb.GetInfraredRemoteDeviceByName(myDeviceName)
    sb.ExecCommand(device, command, params).then((sbres) => {
      if (sbres.statusCode == 100)
        resolve(sbres)
      else 
        reject(new Error(`SwitchBot error: statusCode - ${sbres.statusCode} : ${sbres.message}`))
     }).catch((e) => {
        reject(e)
     })
    })
  })
}


function print_help() {
  let program = Path.basename(process.argv[1])
  let help = `
    Usage: 
    
      $ node ${program} command parameter

      * turn on air conditioner 
        $ node ${program} turnOn
      * turn off air conditioner
        $ node ${program} turnOff
      * change parameters
        $ node ${program} setAll {temperature},{mode},{fan speed},{power state}
          temperature: (integer)
          mode:        1 (auto), 2 (cool), 3 (dry), 4 (fan), 5 (heat)
          fan speed:   1 (auto), 2 (low), 3 (medium), 4 (high)
          power state: on, off
        ex, $ node ${program} setAll 26,2,2,on
          indicates: 26 deg., cool, low fan speed, power on
  `
  console.log(help)
}

function print_unknown_command(cmd) {
  let unknown_command = `
    ${cmd}: unknown command.

  `
  console.log(unknown_command)
  print_help()
}

function selectCommand(cmd) {
  const valid_commands = [
    {cmd: 'turnOn',   param_required: 0},
    {cmd: 'turnOff',  param_required: 0}, 
    {cmd: 'setAll',   param_required: 1}
  ]
  return valid_commands.filter((e) => e.cmd == cmd)
}

if(process.argv.length < 3) {
  print_help()
  process.exit(1)
}

let cmd_array = selectCommand(process.argv[2])
if (cmd_array.length < 0) {
  print_unknown_command(process.argv[2])
  process.exit(2)
}

let cmd_req = cmd_array[0]
if (cmd_req.param_required && process.argv.length < 4) {
  print_need_param(process.argv[2])
  process.exit(3)
}

let promise = null
if(cmd_req.param_required) {
  promise = sendSwitchBotCommand(process.argv[2], process.argv[3])
} else {
  promise = sendSwitchBotCommand(process.argv[2])
}

promise.then((sbres) => {
  console.log('ok!')
  process.exit(0)
}).catch((e) => {
  console.log(e.message)
  process.exit(-1)
})
