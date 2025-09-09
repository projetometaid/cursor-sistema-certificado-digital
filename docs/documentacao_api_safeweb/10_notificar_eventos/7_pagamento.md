Pagamento
​Evento ocorre quando o status do pagamento é modificado.

#	Campo	Descrição
1	formaPagamento	Forma do pagamento.

Opções
BOLETO, CARTAOCREDITO, CRIPTOMOEDA, CARTAODEBITO, TRANSFERENCIABANCARIA.
2	statusPagamento	Status do pagamento.

Opções
PENDENTE, PROCESSAMENTO, AUTORIZADO, DISPONÍVEL, EMDISPUTA, DEVOLVIDO, BAIXADO, RECUSADO, LIBERADO, EMCANCELAMENTO, CHARGEBACK
3	valorPagamento	Valor do pagamento.
4	voucherCodigo	Código do voucher
5	voucherValor	Valor do voucher
6	voucherPercentual	Percentual de desconto do voucher
7	bairro	Bairro
8	cep	CEP
9	cidade	Cidade
10	cidadeCodigo	Código da Cidade
11	complemento	Complemento
12	documento	Documento do cliente
13	email1	E-mail primário do cliente
14	email2	E-mail secundário do cliente
15	ie	Inscrição Estadual
16	endereco	Endereço
17	numero	Número
18	sacado	Sacado
19	uf	UF
20	ufCodigo	Código da UF
21	pais	País
22	paisCodigoAlpha3	Código Alpha3 do País
23	dtHoraEvento	Data e Hora do Evento
Exemplo JSON
JSON
{
   "formaPagamento":"BOLETO",
   "statusPagamento":"AUTORIZADO",
   "valorPagamento":150.0,
   "voucherCodigo":"200,00",
   "voucherValor":0.00,
   "voucherPercentual":100.00,
   "bairro":"Santana",
   "cep":"90620-000",
   "cidade":"Porto Alegre",
   "cidadeCodigo":4314902,
   "complemento":"",
   "documento":"98765432100",
   "email1":"email_principal@gmail.com",
   "email2":"email_seundario@gmail.com",
   "ie":"",
   "endereco":"Avenida Princesa Isabel",
   "numero":"828",
   "sacado":"João da Silva",
   "uf":"RS",
   "ufCodigo":"43",
   "pais":"Brasil",
   "paisCodigoAlpha3":"BRA",
   "dtHoraEvento":"2020-09-29T16:22:29.1442902-03:00"
}
Copy to clipboardErrorCopied
Reenvio de eventos

Os eventos enviados que ficarem com status de “Notificado”, ou seja, cujo retorno não foi de “sucesso” irá permanecer na fila para serem reenviados, após um período de tempo configurável pelo sistema. Esta ação de reenvio será disparada após uma quantidade de 3 (três) tentativas de envio terem se esgotado.