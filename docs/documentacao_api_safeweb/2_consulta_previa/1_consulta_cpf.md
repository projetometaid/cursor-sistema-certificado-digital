Consulta CPF
Este Serviço realiza a consulta prévia na RFB e retorna o nome do titular.

POST https://pss.safewebpss.com.br/Service/Microservice/Shared/ConsultaPrevia/api/RealizarConsultaPrevia

Exemplos de uso
C#
Node
    var request = require("request");
    var options = { method: 'POST',
    url: 'https://pss.safewebpss.com.br/Service/Microservice/Shared/ConsultaPrevia/api/RealizarConsultaPrevia',
    headers: {'content-type': 'application/json', headers: { 'Authorization': '[INFORME_SEU_TOKEN]'} },

    body: "JsonConsultaCPF";
    request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
    });
Copy to clipboardErrorCopied
JavaScript
PHP
Ruby
Parâmetros do Objeto
CPF
#	Atributo	Tipo	Descrição	Obrigatório
#	CPF	String	CPF do responsável.	S
#	DocumentoTipo	String	1 - Tipo documento CPF / 2 - Tipo documento CNPJ.	S
#	DtNascimento	Date	Data de nascimento do responsável pela empresa.	S
Exemplos de JSON da solicitação
JSON CPF
{​​​​​​​​
  "CPF": "99999999999",
  "DocumentoTipo" : "1",
  "DtNascimento": "1986-04-08"
}​​​​​​​​
Copy to clipboardErrorCopied
Exemplos de saída em caso de sucesso
JSON
{
    "Codigo": 0,
    "Mensagem": "MARCOS DA SILVA"
}
Copy to clipboardErrorCopied
Exemplos de saída em caso de erro
JSON
{
    "Codigo": 4,
    "Mensagem": "A data de nascimento informada é divergente da existente nas bases de dados da RFB.Emissão do certificado não permitida."
}