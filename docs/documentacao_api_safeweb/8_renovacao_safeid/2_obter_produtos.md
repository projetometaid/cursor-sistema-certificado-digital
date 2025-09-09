Obter produtos
Este serviço é responsável por obter os produtos de acordo com os períodos disponíveis.

GET https://pss.safewebpss.com.br/service/microservice/shared/periodouso/api/produto/getopcoesrenovacaosafeid/{cnpjAR}/{protocolo}/{cpfCnpj}
Atenção! Para realizar esse passo você precisa ter o token de autenticação do serviço. Caso você ainda não tenha, entre em contato com a AC Safeweb solicitando o seu token.

Exemplos de uso
C#
Node
    var request = require("request");

    var options = { method: 'GET',
    url: 'https://pss.safewebpss.com.br/Service/Microservice/Shared/periodouso/api/produto/GetOpcoesRenovacaoSafeId/{cnpjAR}/{protocolo}/{cpfCnpj}',
    headers: {'content-type': 'application/json', 'Authorization': '[INFORME_SEU_TOKEN]' },

    body: "{\n    \"authenticationType\": 5,\"code\": Chave de autenticação do PSC}";

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
#	cnpjAR	String	Atributo responsável por representar a AR que está fazendo a solicitação para obter os protudos
#	protocolo	String	Atributo responsável por representar o protocolo da solicitação vinculada ao certificado que deseja renovar o período de uso
#	cpfCnpj	String	Atributo responsável por representar o CPF do titular ou CNPJ da empresa informadas no momento da geração da solicitação
Exemplos de resposta em caso de sucesso
{
   "Protocolo": "1002159969",
   "ProdutoAtual": "Período de uso de 1 ano",
   "Titular": "FULANO DA SILVA",
   "CpfCnpj": "02625645054",
   "InicioValidadeCertificado": "2021-02-03T14:45:00",
   "FimValidadeCertificado": "2026-02-03T14:45:00",
   "InicioUltimoPeriodoDeUso": "2021-02-03T14:45:00",
   "FimUltimoPeriodoDeUso": "2022-02-03T14:45:00",
   "OpcoesRenovacao": [
       {
           "IdProduto": 345,
           "Valor": 50,
           "Descricao": "Período de uso de 4 meses",
           "PeriodoRenovacao": "4 meses",
           "IdProdutoTipo": 1 -- E-CPF
       },
       {
           "IdProduto": 837,
           "Valor": 150,
           "Descricao": "Período de uso de 1 ano",
           "PeriodoRenovacao": "365 dias",
           "IdProdutoTipo": 2 -- E-CPF
       }
   ]
}
Copy to clipboardErrorCopied
Exemplos de resposta em caso de erro
JSON
{
    "Message": "Safeid não encontrado na base de dados.",
    "CustomErrorType": "ApplicationException",
    "CustomErrorCode": -2146232832
}