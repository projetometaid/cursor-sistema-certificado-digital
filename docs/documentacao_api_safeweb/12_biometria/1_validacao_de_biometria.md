Validação de Biometria
Este método verifica através do CPF informado se o titular possui biometria cadastrada para a primeira emissão.

https://pss.safewebpss.com.br/Service/Microservice/Shared/Partner/api/ValidateBiometry/{CPF}
Exemplos de uso
C#
Node
    var request = require("request");

    var options = { method: 'GET',
    url: 'https://pss.safewebpss.com.br/Service/Microservice/Shared/Partner/api/ValidateBiometry/{CPF}',
      headers: {'Authorization': '[INFORME_SEU_TOKEN]'} },
    };

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
#	CPF	String	CPF do usuário que deseja realizar uma solicitação.
Exemplos de JSON da solicitação
JSON
{
    "CPF":"99999999999"
}

Copy to clipboardErrorCopied
Exemplos de saída em caso de sucesso
JSON
 {
    true
 }
Copy to clipboardErrorCopied
Exemplos de saída em caso de erro
JSON
 {
    "message": "Motivo do erro"
 }