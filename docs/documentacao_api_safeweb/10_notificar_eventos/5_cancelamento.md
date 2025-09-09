Cancelamento
​Evento ocorre através do Gedar AVP, Gedar ACI e monitor de revogação no momento de cancelamento do certificado.

#	Campo	Descrição
1	protocolo	Protocolo da solicitação.
2	evento	Evento de Cancelamento.
3	dtHoraEvento	Data e hora do evento.
4	responsavelEvento	AVP / ACI / Monitor Revogação / Titular
Exemplo JSON
JSON
{
"protocolo": "1000000000",
"evento": "Cancelamento",
"dtHoraEvento": "2018-04-19T17:17:43.511Z",
 "responsavelEvento": "ACI"
}