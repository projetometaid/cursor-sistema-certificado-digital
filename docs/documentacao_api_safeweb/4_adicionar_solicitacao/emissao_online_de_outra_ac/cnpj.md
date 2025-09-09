Emissão On-line de outra AC
Este Serviço gera uma nova solicitação do tipo de emissão passado no JSON e retorna o número do Protocolo.

Atenção! Antes de “Adicionar a Solicitação” você deve chamar o método Emitir Certificado de outra AC.

POST https://pss.safewebpss.com.br/Service/Microservice/Shared/Partner/api/Add/5
Exemplos de uso
C#
Node
    var request = require("request");
    var options = { method: 'POST',
    url: 'https://pss.safewebpss.com.br/Service/Microservice/Shared/Partner/api/Add/5',
    headers: {'content-type': 'application/json', headers: { 'Authorization': '[INFORME_SEU_TOKEN]'} },

    body: "JsonSolicitacao";
    request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
    });
Copy to clipboardErrorCopied
JavaScript
PHP
Ruby
CNPJ
#	Atributo	Tipo	Descrição	Obrigatório
#	Base64ChavePublica	String	Chave pública do certificado em base64.	S
#	RazaoSocial	String	Razão social da empresa.	S
#	NomeFantasia	String	Nome fantasia da empresa.	S
#	CNPJ	String	CNPJ da empresa.	S
#	CodigoParceiro	String	Código de identificação do parceiro integrador.	S
#	EmissaoPropria	Boolean	Flag para indicar se é uma emissão própria ou de outra AC.	S
#	idProduto	String	Id do produto cujo tipo de emissão seja Emissão On-line.	S
#	CnpjAR	String	Cnpj da Autoridade de registro que ficará vinculada a solicitação.	S
#	idLocalAtendimento	Int	Produto com Modelo A3 - Local de atendimento que ficará vinculado ao certificado.
S
#	UrlSolicitacao	String	Se informado irá colocar esta url para o serviço de notificação evento.	N
#	ProdutoValor	String	Valor do Produto.	N
#	ProdutoDescricao	String	Descrição do Produto.	N
Titular 	Object	Objeto de retorno da requisição.	
Contato 	Object	Objeto de retorno da requisição.	
DDD	String	DDD do responsável.	S
Telefone	String	Telefone do responsável.	S
Email	String	E-mail do responsável.	S
Endereco 	Object	Objeto de retorno da requisição.	
Logradouro	String	Logradouro do responsável.	S
Numero	String	Número do logradouro do responsável.	S
Complemento	String	Complemento do endereço.	N
Bairro	String	Bairro do endereço.	S
UF	String	Sigla da UF do responsável.	S
CodigoIbgeUF	String	Código IBGE da UF do responsável.	N
Cidade	String	Nome da cidade do responsável.	S
CodigoIbgeMunicipio	String	Código IBGE da cidade do responsável.	N
CEP	String	CEP do responsável.	S
Contato 	Object	Objeto de retorno da requisição.	
DDD	String	DDD da empresa.	S
Telefone	String	Telefone da empresa.	S
Email	String	E-mail da empresa.	S
Endereco 	Object	Objeto de retorno da requisição.	
Logradouro	String	Logradouro da empresa.	S
Numero	String	Número do logradouro da empresa.	S
Complemento	String	Complemento do endereço da empresa.	N
Bairro	String	Bairro do endereço da empresa.	S
UF	String	Sigla da UF da empresa.	S
CodigoIbgeUF	String	Código IBGE da UF da empresa.	N
Cidade	String	Nome da cidade da empresa.	S
CodigoIbgeMunicipio	String	Código IBGE da cidade da empresa.	N
CEP	String	CEP da empresa.	S
#	Parametro1	String	Atributo livre para uso de informações adicionais.	N
#	Parametro2	String	Atributo livre para uso de informações adicionais.	N
#	Parametro3	String	Atributo livre para uso de informações adicionais.	N
#	Parametro4	String	Atributo livre para uso de informações adicionais.	N
#	Parametro5	String	Atributo livre para uso de informações adicionais.	N
#	Parametro6	String	Atributo livre para uso de informações adicionais.	N
#	Parametro7	String	Atributo livre para uso de informações adicionais.	N
#	Parametro8	String	Atributo livre para uso de informações adicionais.	N
#	Parametro9	String	Atributo livre para uso de informações adicionais.	N
#	Parametro10	String	Atributo livre para uso de informações adicionais.	N
#	Parametro11	String	Atributo livre para uso de informações adicionais.	N
#	Parametro12	String	Atributo livre para uso de informações adicionais.	N
#	Parametro13	String	Atributo livre para uso de informações adicionais.	N
#	Parametro14	String	Atributo livre para uso de informações adicionais.	N
#	Parametro15	String	Atributo livre para uso de informações adicionais.	N
#	Parametro16	String	Atributo livre para uso de informações adicionais.	N
#	Parametro17	String	Atributo livre para uso de informações adicionais.	N
#	Parametro18	String	Atributo livre para uso de informações adicionais.	N
#	Parametro19	String	Atributo livre para uso de informações adicionais.	N
#	Parametro20	String	Atributo livre para uso de informações adicionais.	N
#	Parametro21	String	Atributo livre para uso de informações adicionais.	N
#	Parametro22	String	Atributo livre para uso de informações adicionais.	N
#	Parametro23	String	Atributo livre para uso de informações adicionais.	N
#	Parametro24	String	Atributo livre para uso de informações adicionais.	N
#	Parametro25	String	Atributo livre para uso de informações adicionais.	N
Exemplos de JSON da solicitação
JSON CNPJ
{
  "Base64ChavePublica": "base64chavepublicacertificado",
  "EmissaoPropria": false,
  "idProduto": "27975",
  "CnpjAR":"99999999999999",
  "CodigoParceiro": "ABC123",
  "idLocalAtendimento": 123,
  "RazaoSocial": "NOME DA EMPRESA",
  "NomeFantasia": "NOME FANTASIA DA EMPRESA",
  "CNPJ": "99999999999999",
  "Titular": {
      "Contato": {
          "DDD": "99",
          "Telefone": "99999999",
          "Email": "nome@dominio.com.br"
      },
      "Endereco": {
          "Logradouro": "Av. Princesa Isabel",
          "Numero": "999",
          "Complemento": "",
          "Bairro": "Santana",
          "UF": "RS",
          "Cidade": "PORTO ALEGRE",
          "CodigoIbgeMunicipio": "4314902",
          "CodigoIbgeUF": "43",
          "CEP": "90035002"
      }
  },
  "Contato": {
      "DDD": "99",
      "Telefone": "99999999",
      "Email": "nome@dominio.com.br"
  },
  "Endereco": {
      "Logradouro": "Av. Princesa Isabel",
      "Numero": "999",
      "Complemento": "",
      "Bairro": "Santana",
      "UF": "RS",
      "Cidade": "PORTO ALEGRE",
      "CodigoIbgeMunicipio": "4314902",
      "CodigoIbgeUF": "43",
      "CEP": "90035002"
  }
}
Copy to clipboardErrorCopied
Exemplos de saída em caso de sucesso
STRING
"7001081984";
Copy to clipboardErrorCopied
Exemplos de saída em caso de erro
JSON
{
   "Message": "O Produto deve ser informado.",
   "CustomErrorType": "ApplicationException",
   "CustomErrorCode": -2146232832
}