Validação
Evento ocorre através do Gedar AVP, no momento da validação presencial.

#	Campo	Descrição
1	protocolo	Protocolo da solicitação.
2	evento	Evento de Validação.
3	dtHoraEvento	Data e hora do evento.
4	responsavelEvento	Responsável pelo evento.
5	validacaoExterna	Validação externa do evento.
6	localAtendimento	Local de atendimento.
7	dtLimiteVerificacao	Data limite da verificaçào.
8	nomeAutoridadeRegistro	Nome da Autoridade de Registro.
9	cnpjAutoridadeRegistro	CNPJ da Autoridade de Registro.
10	comVerificacao	Identifica se será necessária a conferência de um agente de verificação.
11	tipoMatch	Exibe o tipo de match biométrico realizado com o titular do Certificado Digital
12	apelidoPosto	Exibe o apelido e a UF do Local de Atendimento que realizou a validação do Certificado Digital.
13	tipoEmissao	Exibe se o tipo de emissão realizada foi Presencial, Videoconferência, Certificado Digital ou Emissão Online.
Exemplo JSON
JSON
{
    "protocolo": "1000000000",
    "evento": "validacao",
    "dtHoraEvento": "2018-04-19T17:17:43.511Z", 
    "responsavelEvento": "FULANO DA SILVA:12345678910", 
    "validacaoExterna": "false",
    "localAtendimento": "POSTO PROVISÓRIO XYZ", 
    "dtLimiteVerificacao": "2018-04-20T17:17:43.511Z",
    "nomeAutoridadeRegistro": "AR TESTE",
    "cnpjAutoridadeRegistro": "75815904000174",
    "comVerificacao": "true",
    "tipoMatch": "Match em base local da AC (Reaproveitamento de dossiê)",
    "apelidoPosto": "AR FUTURA (INSTALAÇÃO TÉCNICA)",
    "tipoEmissao": "Emissão presencial"
}