export const paymentMethods=[
 {id:'pix',label:'PIX',networks:['PIX']},
 {id:'credito',label:'Cartão de crédito',networks:['Visa','Mastercard','Elo']},
 {id:'debito',label:'Cartão de débito',networks:['Visa','Mastercard','Elo']},
 {id:'alelo_refeicao',label:'Alelo Refeição',networks:['Alelo Refeição']},
 {id:'alelo_alimentacao',label:'Alelo Alimentação',networks:['Alelo Alimentação']}
] as const;
export function paymentLabel(value:unknown){return value==='dinheiro'?'Dinheiro':paymentMethods.find(p=>p.id===value)?.label}
