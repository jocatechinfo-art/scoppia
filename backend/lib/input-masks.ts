/** Presentation only: server validation remains authoritative. */
export type InputMask = 'cpf' | 'cep' | 'phone';
export function maskCpf(value:string){const d=value.replace(/\D/g,'').slice(0,11);return d.replace(/^(\d{3})(\d)/,'$1.$2').replace(/^(\d{3}\.\d{3})(\d)/,'$1.$2').replace(/(\d{3}\.\d{3}\.\d{3})(\d)/,'$1-$2')}
export function maskCep(value:string){return value.replace(/\D/g,'').slice(0,8).replace(/^(\d{5})(\d)/,'$1-$2')}
export function maskPhone(value:string){let d=value.replace(/\D/g,'');if(d.startsWith('0055'))d=d.slice(2);d=d.slice(0,13);const international=d.length>11&&d.startsWith('55');if(d.length>11&&!international)return d;const prefix=international?'+55 ':'';if(international)d=d.slice(2);if(!d)return '';if(d.length<3)return prefix+'('+d;const area='('+d.slice(0,2)+') ',number=d.slice(2);return prefix+area+(number.length>4?number.slice(0,number.length>8?5:4)+'-'+number.slice(number.length>8?5:4):number)}
export function applyInputMask(value:string,mask:InputMask){return mask==='cpf'?maskCpf(value):mask==='cep'?maskCep(value):maskPhone(value)}
export function whatsappPhone(value:string){let d=value.replace(/\D/g,'');if(d.startsWith('0055'))d=d.slice(2);if(d.length===10||d.length===11)d='55'+d;return /^55[1-9]\d{9,10}$/.test(d)?d:null}
