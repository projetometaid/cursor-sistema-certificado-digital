Verificação
Evento ocorre através do Gedar ACI no momento da ação do ACI: aprovado, revogado e cancelado.

#	Campo	Descrição
1	protocolo	Protocolo da solicitação.
2	evento	Evento de Verificação.
3	dtHoraEvento	Data e hora do evento.
4	responsavelEvento	Responsável pelo evento.
5	nomeAutoridadeRegistro	Nome da autoridade de registro.
6	cnpjAutoridadeRegistro	CNPJ da autoridade de registro.
7	acao	Aprovado / Cancelado / Revogado
8	motivoRecusa	Exibe a descrição da observação informada pelo Agente de Registro, referente a verificação realizada.
9	dtAcao	Data ação de Aprovado / Cancelado / Revogado.
10	dtAberturaProtocolo	Data de abertura para conferência.
11	razaoSocialPosto	Exibe o nome do Local de Atendimento que realizou a verificação do Certificado Digital.
12	apelidoPosto	Exibe o apelido e a UF do Local de Atendimento que realizou a validação do Certificado Digital.
Exemplo JSON
JSON
{
    "protocolo": "1000000000",
    "evento": "verificacao",
    "dtHoraEvento": "2018-04-19T17:17:43.511Z", 
    "responsavelEvento": "FULANO DE SOUZA:12345678910", 
    "acao": "aprovado",
    "motivoRecusa": "motivo da revogação",
    "dtAcao": "2018-04-20T17:17:43.511Z",
    "dtAberturaProtocolo": "2018-04-20T17:25:43.511Z",
    "nomeAutoridadeRegistro": "AR TESTE",
    "cnpjAutoridadeRegistro": "71815904000174",
    "razaoSocialPosto": "AR FUTURA",
    "apelidoPosto": "AR FUTURA (INSTALAÇÃO TÉCNICA)"
}