Renovar Certificado com Produto
Este Serviço retorna os dados da Solicitação do certificado a ser renovado, validando o id do Produto informado.

GET https://pss.safewebpss.com.br/Service/Microservice/Shared/Partner/api/RenovarCertificado/{numeroSerie}/{idProduto}/{cnpjAr}
Exemplos de uso
C#
Node
    var request = require("request");

    var options = { method: 'GET',
    url: 'https://pss.safewebpss.com.br/Service/Microservice/Shared/Partner/api/RenovarCertificado/{numeroSerie}/{idProduto}/{cnpjAr}',
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
Parâmetros da Query
#	Atributo	Tipo	Descrição	Obrigatório
#	numeroSerie	String	Número de série.	S
#	idProduto	String	Id do produto da Autoridade de Registro.	S
#	cnpjAr	String	CNPJ da Autoridade de Registro.	S
Exemplos de saída em caso de sucesso
JSON CPF
{
    "Nome": "JOÃO DA SILVA",
    "CPF": "99999999999",
    "DataNascimento": "9999-99-99",
    "idLocalAtendimento": 123,
    "Contato": {
        "DDD": "99",
        "Telefone": "99999999",
        "Email": "nome@dominio.com.br"
    },
    "Endereco": {
        "Logradouro": "Av. Princesa Isabel",
        "Numero": "999",
        "Complemento": "",
        "Bairro": "SANTANA",
        "Cidade": "PORTO ALEGRE",
        "UF": "RS",
        "CodigoIbgeMunicipio": "4314902",
        "CodigoIbgeUF": "43",
        "CEP": "90620000"
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
    "Protocolo": "1000000001",
    "idProduto": "13",
    "CnpjAR": "0343489339385",
    "Modelo": 2,
    "Tipo": 1,
    "Validade": 2,
    "Parametro1": "Parametro1",
    "Parametro2": "Parametro2",
    "Parametro3": "Parametro3",
    "Parametro4": "Parametro4",
    "Parametro5": "Parametro5",
    "Parametro6": "Parametro6",
    "Parametro7": "Parametro7",
    "Parametro8": "Parametro8",
    "Parametro9": "Parametro9",
    "Parametro10": "Parametro10",
    "Parametro11": "Parametro11",
    "Parametro12": "Parametro12",
    "Parametro13": "Parametro13",
    "Parametro14": "Parametro14",
    "Parametro15": "Parametro15",
    "Parametro16": "Parametro16",
    "Parametro17": "Parametro17",
    "Parametro18": "Parametro18",
    "Parametro19": "Parametro19",
    "Parametro20": "Parametro20",
    "Parametro21": "Parametro21",
    "Parametro22": "Parametro22",
    "Parametro23": "Parametro23",
    "Parametro24": "Parametro24",
    "Parametro25": "Parametro25",
    "ProdutoValor": "ProdutoValor",
    "ProdutoDescricao": "ProdutoDescricao"
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