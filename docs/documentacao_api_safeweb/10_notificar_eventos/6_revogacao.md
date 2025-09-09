Revogação
​Evento ocorre através do Gedar AVP, Gedar ACI, página de revogação e monitor de revogação no momento da revogação do certificado.

#	Campo	Descrição
1	protocolo	Protocolo da solicitação.
2	evento	Evento de Revogação.
3	dtHoraEvento	Data e hora do evento.
4	responsavelEvento	AVP / ACI / Monitor Revogação / Titular
Exemplo JSON
JSON
{
    "protocolo": "1000000000",
    "evento": "revogacao",
    "dtHoraEvento": "2018-04-19T17:17:43.511Z",
    "responsavelEvento": "ACI"
}
Copy to clipboardErrorCopied
Reenvio de eventos

Os eventos enviados que ficarem com status de “Notificado”, ou seja, cujo retorno não foi de “sucesso” irá permanecer na fila para serem reenviados, após um período de tempo configurável pelo sistema. Esta ação de reenvio será disparada após uma quantidade de 3 (três) tentativas de envio terem se esgotado.