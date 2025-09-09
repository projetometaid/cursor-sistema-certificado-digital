Primeira Emissão
Inclui uma solicitação de primeira emissão no Hope para passar pelo processo de videoconferência.

POST https://pss.safewebpss.com.br/Service/Microservice/Hope/Shared/api/integration/solicitation
Exemplos de uso
C#
Node
    var request = require("request");

    var options = { method: 'POST',
    url: 'https://pss.safewebpss.com.br/Service/Microservice/Hope/Shared/api/integration/solicitation',
    headers: {'content-type': 'application/json', 'Authorization': 'bearer [INFORME_SEU_TOKEN]'} },

    body: "{\n    \"protocol\": 1000000001, \"attendancePlaceId \": 348, \"aciRemocalCandidate: false\"  }"};

    request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
    });
Copy to clipboardErrorCopied
JavaScript
PHP
Ruby
Parâmetros do Objeto
#	Atributo	Tipo	Descrição	Obrigatório	
#	protocol	String	Protocolo da Solicitação.	Sim
#	attendancePlaceId	Int	Id do Local de Atendimento para onde será redirecionado no Hope.	Não
#	aciRemovalCandidate	Boolean	Indica se a solicitação será feita com ou sem ACI.	Não
Exemplos de JSON da solicitação
JSON
{
    "protocol":"1000000001",
    "attendancePlaceId": 348,
    "aciRemovalCandidate": false
}
Copy to clipboardErrorCopied
Exemplos de saída em caso de sucesso
OBJETO
 {
    "aciRemovalCandidate": false,
    "url": "Url para o cliente enviar os documentos",
    "emailSend": false,
 }
Copy to clipboardErrorCopied
Parâmetros do objeto de retorno
#	Atributo	Tipo	Descrição	Obrigatório	
#	aciRemovalCandidate	Boolean	Indica se a solicitação será feita com ou sem ACI.	Sim
#	url	String	URL para envio de documentação.	Não
#	emailSend	Boolean	Parâmetro para identificar se já houve o envio de email pelo Hope.	Sim
Exemplos de saída em caso de erro
OBJETO
 {
    "message": "Motivo do erro"
 }