Emissão
Evento ocorre através do Gedar AVP e do assistente de certificado digital no momento da emissão do certificado.

#	Campo	Descrição
1	protocolo	Protocolo da solicitação.
2	evento	Evento de Emissão.
3	dtHoraEvento	Data e hora do evento.
4	responsavelEvento	AVP / Titular.
5	inicioValidade	Início da validade.
6	fimValidade	Término da validade.
7	numeroSerie	Exibe o número de série do Certificado Digital.
8	tipoEmissao	Exibe se o tipo de emissão realizada foi Presencial, Videoconferência, Certificado Digital ou Emissão Online.
Exemplo JSON
JSON
{
    "protocolo": "1000000000",
    "evento": "emissao",
    "dtHoraEvento": "2018-04-19T17:17:43.511Z", 
    "responsavelEvento": "TITULAR", 
    "inicioValidade": "2018-04-19T17:17:43.511Z", 
    "fimValidade": "2019-04-19T17:17:43.511Z",
    "numeroSerie": "4a637da64a24c1e1",
    "tipoEmissao": "Emissão presencial"
}