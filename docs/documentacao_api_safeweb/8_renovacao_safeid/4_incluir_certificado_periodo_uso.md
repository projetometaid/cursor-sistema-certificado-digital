Incluir Certificado Período de Uso
Este serviço é responsável por incluir um certificado vinculado a solicitação de um período incluída no passo anterior.

POST https://pss.safewebpss.com.br/service/microservice/shared/periodouso/api/certificado/integracaoar/periodouso
Exemplos de uso
C#
Node
    var request = require("request");

    var options = { method: 'GET',
    url: 'https://pss.safewebpss.com.br/service/microservice/shared/periodouso/api/certificado/integracaoar/periodouso',
    headers: {'content-type': 'application/json', 'Authorization': '[INFORME_SEU_TOKEN]'},

    body: "{\n    \"IdSolicitacaoPeriodoUso\": 5 }";

    request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
    });
Copy to clipboardErrorCopied
JavaScript
PHP
Ruby
Parâmetros da Query
#	Atributo	Tipo	Descrição
#	IdSolicitacaoPeriodoUso	String	Atributo responsável por representar o a solicitação do período de uso gerada no passo anterior.
Exemplos de resposta em caso de sucesso
{
  "status": 200 
}
Copy to clipboardErrorCopied
{
   "status": 204 
}