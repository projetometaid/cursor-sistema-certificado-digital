Liberar Emissão
Este Serviço atualiza a flag de liberado na solicitação, flag utilzada para validar se há pagamento no momento da emissão.

Atenção! Apenas para solicitações PJ/e-CNPJ com o produto cujo o tipo de emissão seja Emissão On-line e a
solicitação de emissão já exista.

POST https://pss.safewebpss.com.br/Service/Microservice/Shared/Partner/api/UpdateLiberacao
Exemplos de uso
C#
Node
    var request = require("request");

    var options = { method: 'POST',
    url: 'https://pss.safewebpss.com.br/Service/Microservice/Shared/Partner/api/UpdateLiberacao',
    headers: {'content-type': 'application/json', 'Authorization': '[INFORME_SEU_TOKEN]'} },

    body: "{\n    \"Protocolo\": 1000000001,\"CNPJ\": 00000000000000}"};

    request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
    });
Copy to clipboardErrorCopied
JavaScript
PHP
Ruby
Parâmetros do Objeto
#	Atributo	Tipo	Descrição
#	Protocolo	String	Protocolo da Solicitação.
#	CNPJ	String	CNPJ da AR da Solicitação.
Exemplos de JSON da solicitação
JSON
{
   "Protocolo":"1000000001",
   "CNPJ" :  "1111111100011"
}

Copy to clipboardErrorCopied
Exemplos de saída em caso de sucesso
BOOLEAN
true;
Copy to clipboardErrorCopied
Exemplos de saída em caso de erro
BOOLEAN
false;