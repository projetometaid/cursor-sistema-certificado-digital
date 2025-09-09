Renovar Certificado de outra AC
Este Serviço retorna os dados da Solicitação do certificado a ser renovado, validando o id do Produto informado.

POST https://pss.safewebpss.com.br/Service/Microservice/Shared/Partner/api/RenovarCertificado
Exemplos de uso
C#
Node
    var request = require("request");

    var options = { method: 'POST',
    url: 'https://pss.safewebpss.com.br/Service/Microservice/Shared/Partner/api/RenovarCertificado',
    headers: {'content-type': 'application/json', 'Authorization': '[INFORME_SEU_TOKEN]'} },

    body: "{\n    \"idProduto\": 123,\"CnpjAR\": 00000000000000,\"Base64ChavePublica\": base64chavepublicacertificado}";

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
#	idProduto	String	Id do produto da Autoridade de Registro.
#	CnpjAR	String	CNPJ da Autoridade de Registro que está vinculado o produto.
#	Base64ChavePublica	String	Chave pública do certificado em base64.
Exemplos de saída em caso de sucesso
JSON CPF
{
    "Nome": "JOÃO DA SILVA",
    "CPF": "99999999999",
    "DataNascimento": "9999-99-99",
    "Contato": {
        "Email": "nome@dominio.com.br"
    },
    "DocumentoIdentidade": {
        "TipoDocumento": "0",
        "Numero": "31059220212",
        "DigitoVerificador": "1",
        "Emissor": "SSPRS"
    },
    "TituloEleitor": {
        "Municipio": "PORTO ALEGRE",
        "Numero": "201459323242",
        "Secao": "3333",
        "Zona": "001"
    },
    "NIS": "00000000000",
    "CEI": "000000000000",
    "CAEPF": "000000000000",
    "idProduto": "13",
    "CnpjAR": "0343489339385",
    "Modelo": 2,
    "Tipo": 1,
    "Validade": 2
}
Copy to clipboardErrorCopied
JSON CNPJ
Exemplos de saída em caso de erro
JSON
{
    "Message": "O Certificado selecionado não pode ser renovado de forma on-line.",
    "CustomErrorType": "ApplicationException",
    "CustomErrorCode": -2146232832
}
Copy to clipboardErrorCopied
Parâmetros do JSON:
Campo	Descrição	Valores	Tipo
Modelo	Modelo do produto do certificado.	1 = A1 / 2 = A3	Int
Tipo	Tipo do produto do certificado.	1 = eCPF / 2 = eCNPJ	Int
Validade	Validade do produto do certificado.	1-5, sendo o número de anos	Int