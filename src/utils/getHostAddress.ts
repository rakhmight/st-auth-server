import os from 'os'

export default function ():string{
    const ifaces = os.networkInterfaces()

    const target = ifaces.Ethernet!.find(item => item.family == 'IPv4')

    return target!.address
}