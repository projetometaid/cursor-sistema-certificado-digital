Validação Autônoma
Evento ocorre através da AR Eletrônica, no momento da validação.

#	Campo	Descrição
1	protocolo	Protocolo da solicitação.
2	evento	Evento de Validação Autônoma.
3	dtHoraEvento	Data e hora do evento.
4	dtLimiteVerificacao	Data limite da verificaçào.
5	nomeAutoridadeRegistro	Nome da Autoridade de Registro.
6	cnpjAutoridadeRegistro	CNPJ da Autoridade de Registro.
7	documento	Documento do responsável.
8	nomeRazaoSocial	Nome/Razão Social
9	numeroTitular	Número do endereço do titular.
10	logradouroTitular	Logradouro do endereço do titular.
11	complementoTitular	Complemento do endereço titular.
12	bairroTitular	Bairro do endereço do titular.
13	cepTitular	CEP do endereço do titular.
14	municipioTitular	Município do endereço titular.
15	siglaUFTitular	UF do endereço do titular.
16	email	E-mail do titular.
17	telefone	Telefone do titular.
18	validacaoExterna	Validação externa do evento.
19	comVerificacao	Identifica se será necessária a conferência de um agente de verificação.
Exemplo JSON
JSON
{
    "protocolo": "1000000000",
    "evento": "Validação Autônoma",
    "dtHoraEvento": "2018-04-19T17:17:43.511Z",
    "dtLimiteVerificacao": "2018-04-20T17:17:43.511Z",
    "nomeAutoridadeRegistro": "AR TESTE",
    "cnpjAutoridadeRegistro": "75815904000174",
    "documento": "12345678910",
    "nomeRazaoSocial": "FULANO DA SILVA",
    "numeroTitular":"828",
    "logradouroTitular":"AV. PRINCESA ISABEL",
    "complementoTitular":"Ap 501" 
    "bairroTitular":"SANTANA",
    "cepTitular":"96020000", 
    "nomeMunicipioTitular":"PORTO ALEGRE", 
    "siglaUFTitular":"RS", 
    "email":"​TESTE@SAFEWEB.COM.BR​", 
    "telefone":"5130180300",
    "validacaoExterna": false,    
    "comVerificacao": true 
}