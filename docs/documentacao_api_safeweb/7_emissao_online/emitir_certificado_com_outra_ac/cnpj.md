Emitir Certificado outra AC
Este Serviço retorna os dados da Solicitação do certificado a ser emitido, validando o id do Produto informado.

POST https://pss.safewebpss.com.br/Service/Microservice/Shared/Partner/api/EmitirCertificadoOnline
Exemplos de uso
C#
Node
var request = require("request");

var options = {
    method: "POST",
    url: "https://pss.safewebpss.com.br/Service/Microservice/Shared/Partner/api/EmitirCertificadoOnline",
    headers: {
      "content-type": "application/json",
      Authorization: "[INFORME_SEU_TOKEN]",
    },
  },
  body: '{\n    "idProduto": 123,"CnpjAR": 00000000000000,"Base64ChavePublica": base64chavepublicacertificado}';

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
JSON CNPJ
{
   "RazaoSocial": "Empresa",
   "CNPJ": "99999999999999",
   "CEI": "9999999999999",
   "Contato": {
       "Email": "contato@empresa.com"
   },
   "Titular": {
       "Nome": "JOÃO DA SILVA",
       "CPF": "99999999999",
       "DataNascimento": "9999-99-99",
       "Contato": {
           "Email": "contato@empresa.com"
       },
       "DocumentoIdentidade": {
           "TipoDocumento": "0",
           "Numero": "99999999999",
           "DigitoVerificador": "999",
           "Emissor": "9999"
       },
       "TituloEleitor": {
           "Municipio": "99",
           "Numero": "999999999",
           "Secao": "999",
           "Zona": "9999"
       },
       "NIS": "99999999999",
       "CAEPF": "9999999999999"
   },
   "idProduto": "13",
   "CnpjAR": "99999999999999",
   "Modelo": 2,
   "Tipo": 2,
   "Validade": 2
}
Copy to clipboardErrorCopied
Exemplos de saída em caso de erro
JSON
{
   "Message": "O Certificado selecionado não pode ser emitido de forma on-line.",
   "CustomErrorType": "ApplicationException",
   "CustomErrorCode": -2146232832
}
Copy to clipboardErrorCopied
Parâmetros do JSON:
Campo	Descrição	Valores	Tipo
Modelo	Modelo do produto do certificado.	1 = A1 / 2 = A3	Int
Tipo	Tipo do produto do certificado.	1 = eCPF / 2 = eCNPJ / 6 = e-PF / 7 = e-PJ	Int
Validade	Validade do produto do certificado.	1-5, sendo o número de anos	Int