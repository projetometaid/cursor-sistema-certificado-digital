Incluir Solicitação de Período de Uso
Este serviço é responsável por incluir a solicitação de um período de uso.

POST https://pss.safewebpss.com.br/service/microservice/shared/periodouso/api/solicitacao/integracaoar/periodouso
Exemplos de uso
C#
Node
    var request = require("request");

    var options = { method: 'GET',
    url: 'https://pss.safewebpss.com.br/service/microservice/shared/periodouso/api/solicitacao/integracaoar/periodouso',
    headers: {'content-type': 'application/json', 'Authorization': '[INFORME_SEU_TOKEN]'},

    body: "{\n    \"IdEntidadeProduto\": 5,\"CnpjAR\": "95347212000156", \"Protocolo\": "1000000000", \"CPFContador\": "12312312387"}";

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
#	IdEntidadeProduto	String	Atributo responsável por representar o produto adquirido pelo cliente
#	CnpjAR	String	Atributo responsável por representar CNPJ da AR responsável por efetuar a venda
#	Protocolo	String	Atributo responsável por representar o protocolo da solicitação origem (Protocolo que foi gerado na primeira compra)
#	CPFContador	String	Atributo responsável por representar CPF do contador
Exemplos de resposta em caso de sucesso
{
  "status": 200 
}
Copy to clipboardErrorCopied
{
   "status": 204 
}
Copy to clipboardErrorCopied
