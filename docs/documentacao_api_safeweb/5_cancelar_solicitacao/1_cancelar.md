Cancelar Solicitação
Este Serviço realiza o cancelamento de uma Solicitação

POST https://pss.safewebpss.com.br/Service/Microservice/Shared/Partner/api/CancelarSolicitacao
Exemplos de uso
C#
Node
var request = require("request");

var options = {
    method: "POST",
    url: "https://pss.safewebpss.com.br/Service/Microservice/Shared/Partner/api/CancelarSolicitacao",
    headers: {
      "content-type": "application/json",
      Authorization: "[INFORME_SEU_TOKEN]",
    },
  },
  body: '{\n    "Protocolo": 1000000001,"CnpjAR": 00000000000000, "idJustificativa": 4}';

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
Copy to clipboardErrorCopied
JavaScript
PHP
Ruby
Parâmetros do Objeto
CNPJ
#	Atributo	Tipo	Descrição	Obrigatório
#	Protocolo	String	Número do protocolo da solicitação a ser cancelado.	S
#	CnpjAR	String	Documento da Autoridade de Registro vinculada ao protocolo a ser cancelado	S
#	idJustificativa	int	4 - Cancelado Via API.	S
Exemplos de saída em caso de sucesso
JSON
{
   "sucesso": true
}
Copy to clipboardErrorCopied
Exemplos de saída em caso de erro
JSON
{
   "Message": "Protocolo de outra AR",
   "CustomErrorType": "ApplicationException",
   "CustomErrorCode": -2146232832
}
Copy to clipboardErrorCopied
{
   "Message": "Protocolo já foi cancelado",
   "CustomErrorType": "ApplicationException",
   "CustomErrorCode": -2146232832
}