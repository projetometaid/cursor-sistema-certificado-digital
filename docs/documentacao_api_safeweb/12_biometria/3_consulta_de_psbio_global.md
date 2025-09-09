PSBio Global
Este método verifica através do CPF informado se o titular possui biometria cadastrada na rede PSBio.

POST https://pss.safewebpss.com.br/Service/Microservice/Shared/Partner/api/psbio/consulta/biometria/global
Exemplos de uso
C#
Node
    var request = require("request");

    var options = { method: 'POST',
    url: 'https://pss.safewebpss.com.br/Service/Microservice/Shared/Partner/api/psbio/consulta/biometria/global',
    headers: {'content-type': 'application/json', 'Authorization': 'bearer [INFORME_SEU_TOKEN]'} },

    body: "{    "cpf": "55322901051"  }";

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
#	Cpf	String	CPF do usuário que deseja verificar se existe biometria.	Sim
Exemplos de JSON da solicitação
JSON
{
    "cpf":"55322901051",
}

Copy to clipboardErrorCopied
Exemplos de saída em caso de sucesso
OBJETO
 {
    "encontrado": true
 }
Copy to clipboardErrorCopied
Exemplos de saída em caso de erro
OBJETO
 {
    "mensagem": "Motivo do erro"
 }