Validar Certificado
Este serviço é responsável por validar se o certificado informado pode ter o seu período de uso renovado.

GET https://pss.safewebpss.com.br/service/microservice/shared/periodouso/api/certificado/integracao/validar/{protocolo}/{cpfCnpj}
Atenção! Para realizar esse passo você precisa ter o token de autenticação do serviço. Caso você ainda não tenha, entre em contato com a AC Safeweb solicitando o seu token.

Exemplos de uso
C#
Node
    var request = require("request");

    var options = { method: 'GET',
    url: 'https://pss.safewebpss.com.br/service/microservice/Shared/periodouso/api/certificado/integracao/validar/{protocolo}/{cpfCnpj}',
    headers: {'content-type': 'application/json', 'Authorization': '[INFORME_SEU_TOKEN]'},

    body: "{\n    \"authenticationType\": 5,\"code\": Chave de autenticação do PSC}";

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
#	cnpjAR	String	Atributo responsável por representar a AR que está fazendo a solicitação para obter os protudos
#	protocolo	String	Atributo responsável por representar o protocolo da solicitação vinculada ao certificado que deseja renovar o período de uso
#	cpfCnpj	String	Atributo responsável por representar o CPF do titular ou CNPJ da empresa informadas no momento da geração da solicitação
Exemplos de resposta em caso de sucesso
{
  "status": 200 -- Caso o certificado seja válido.
}
Copy to clipboardErrorCopied
{
   "status": 204 -- Caso o certificado não seja válido.
}
Copy to clipboardErrorCopied
Exemplos de resposta em caso de erro
JSON
 {
    "message": "Por favor, informe o code.",
    "status": 204    
}