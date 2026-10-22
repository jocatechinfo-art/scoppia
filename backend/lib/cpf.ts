export function normalizeCpf(value:unknown):string{
 if(typeof value!=='string'||!/^[-.\d\s]+$/.test(value))throw Error('Informe um CPF válido.');
 const cpf=value.replace(/\D/g,'');if(cpf.length!==11||/^(\d)\1{10}$/.test(cpf))throw Error('Informe um CPF válido.');
 for(let n=9;n<11;n++){let sum=0;for(let i=0;i<n;i++)sum+=Number(cpf[i])*(n+1-i);const digit=(sum*10)%11%10;if(digit!==Number(cpf[n]))throw Error('Informe um CPF válido.');}return cpf;
}
