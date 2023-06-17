export default function genToken(len: number): string {
    const chrs:string = 'abdehkmnpswxzABDEFGHKMNPQRSTWXZ123456789'
    let str: string = ''
    for (let i = 0; i < len; i++) {
        let pos = Math.floor(Math.random() * chrs.length)
        str += chrs.substring(pos,pos+1)
    }
    
    return str
}