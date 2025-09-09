Listar Produtos
Este Serviço retorna os dados dos produtos pelo CNPJ da AR e Tipo de Emissão informados.

GET https://pss.safewebpss.com.br/Service/Microservice/Shared/Product/api/GetListProdutoByAR/{idTipoEmissao}/{CnpjAR}
Exemplos de uso
C#
Node
    var request = require("request");

    var options = { method: 'GET',
    url: 'https://pss.safewebpss.com.br/Service/Microservice/Shared/Product/api/GetListProdutoByAR/{idTipoEmissao}/{CnpjAR}',
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
#	Atributo	Tipo	Descrição
#	idTipoEmissao	Int	Tipo de emissão vinculado ao produto.
1 = Emissão presencial / 2 = Renovação on-line / 3 = Emissão videoconferência
#	CnpjAR	String	CNPJ da Autoridade de Registro que está vinculado o produto.
Exemplos de saída em caso de sucesso
JSON PRODUTO
[
    {
        "idProduto": 1,
        "Nome": "e-CPF A1",
        "Descricao": "e-CNPJ A1",
        "idTipoEmissao": 1,
        "TipoEmissao": "Emissão presencial",
        "ProdutoModelo": "A1",
        "ProdutoValidade": "1 Ano",
        "ProdutoTipo": "e-CNPJ",
        "MidiaTipo": "Cartão",
        "Modelo": 1,
        "Validade": 1,
        "Tipo": 2,
        "Midia": 1,
        "NomeAutoridadeRegistro": "AR TESTE",
        "CnpjAR": "20085105000106",
        "NomeAutoridadeCertificadora": "AC TESTE"
    },
    {
        "idProduto": 2,
        "Nome": "e-CNPJ A1",
        "Descricao": "e-CNPJ A1 1 Ano",
        "idTipoEmissao": 1,
        "TipoEmissao": "Emissão videoconferência",
        "ProdutoModelo": "A1",
        "ProdutoValidade": "1 Ano",
        "ProdutoTipo": "e-CNPJ",
        "MidiaTipo": null,
        "Modelo": 1,
        "Validade": 1,
        "Tipo": 2,
        "Midia": null,
        "NomeAutoridadeRegistro": "AR TESTE",
        "CnpjAR": "111111111111",
        "NomeAutoridadeCertificadora": "AC TESTE"
    }
]
Copy to clipboardErrorCopied
Exemplos de saída em caso de erro
JSON
{
    "Message": "O CNPJ da Autoridade de Registro deve ser informado.",
    "CustomErrorType": "ApplicationException",
    "CustomErrorCode": -2146232832
}