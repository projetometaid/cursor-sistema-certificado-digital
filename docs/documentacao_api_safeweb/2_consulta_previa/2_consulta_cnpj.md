Consulta CNPJ
Este Serviço realiza a consulta prévia na RFB e retorna a Razão Social da empresa.

POST https://pss.safewebpss.com.br/Service/Microservice/Shared/ConsultaPrevia/api/RealizarConsultaPrevia

Exemplos de uso
C#
Node
    var request = require("request");
    var options = { method: 'POST',
    url: 'https://pss.safewebpss.com.br/Service/Microservice/Shared/ConsultaPrevia/api/RealizarConsultaPrevia',
    headers: {'content-type': 'application/json', headers: { 'Authorization': '[INFORME_SEU_TOKEN]'} },

    body: "JsonConsultaCNPJ";
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
#	CNPJ	String	Documento da empresa.	S
#	CPF	String	CPF do responsável da empresa.	S
#	DocumentoTipo	String	1 - Tipo documento CPF / 2 - Tipo documento CNPJ.	S
#	DtNascimento	Date	Data de nascimento do responsável pela empresa.	S
Exemplos de JSON da solicitação
JSON CNPJ
{​​​​​​​​
  "CNPJ": "99999999999999",
  "CPF": "99999999999",
  "DocumentoTipo" : "2",
  "DtNascimento": "1986-04-08"
}​​​​​​​​
Copy to clipboardErrorCopied
Exemplos de saída em caso de sucesso
JSON
{
    "Codigo": 0,
    "Mensagem": "MARCOS DA SILVA ME"
}
Copy to clipboardErrorCopied
Exemplos de saída em caso de erro
JSON
{
    "Codigo": 27,
    "Mensagem": "O CPF do responsável informado não é igual ao do responsável pela empresa nas bases de dados da RFB. Emissão do certificado não permitida."
}