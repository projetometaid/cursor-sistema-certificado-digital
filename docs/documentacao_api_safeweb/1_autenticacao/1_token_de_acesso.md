Gerar token de acesso
Este método gera o token JWT para informar nos demais endpoints.

Credenciais
A autenticação é feita pelo padrão Basic Authentication.
Ele é incluído no header da requisição HTTP dessa maneira: Authorization: Basic {credenciais em base 64 no formato usuário:senha}

Atenção! A informação das Credenciais de acesso é definido pela Safeweb e só poderá ser obtido através de contato direto.

https://pss.safewebpss.com.br/Service/Microservice/Shared/HubAutenticacao/Autenticacoes/api/autorizacao/token
Exemplos de uso
C#
Node
    var request = require("request");

    var options = { method: 'POST',
    url: 'https://pss.safewebpss.com.br/Service/Microservice/Shared/HubAutenticacao/Autenticacoes/api/autorizacao/token',
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
Exemplos de saída em caso de sucesso
JSON
 {
    "tokenAcesso": "eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ.HxmX3muHBEUgERp7o6RTkwk9Y3iORPk50iSA72eFczySDK4oJ0lKZrir9FMX-6MAFVrFlfiUZtf6Fv4_XYk_pdKdaqqX7b29Ysten7xmWvnBPGBmBvJmSlSoHLRARf5blhC8QBtjikdxUUcU0VAGMRrCl4YCz27AfyRNjwbWVzaUJ80Y6O5FdXr4TgS5FtJkzd0pUWYVcm1-mJoeODqA_kS1TEEIcdZQmCE0-agujqMfTVrzOjKje8HwStLpnPDPMiPdHXzE40Jd9cAcLnxU8RDXHzFMjCBC62ex42n1wUOQSzVmQdlfS-UUrO80F347WFEaFdfN430Dfc0JlvcqzA.WyOgP6HeY1tnij6g.hcqsjzVjAfR-RbK258G_54AQMiAQqrfZrBt_pygBvk_bdlLIG_I0MxKyALRSm5ZOIBCAFvpa6FTtFYqB9P_5NpX8j6bpGHQcG9eX6INWu1tvqwki8N1mb2G2Z-RioT999IqyqXANLZHS9jPHa-PMJ2-Kl_McrsW01S1xqFeJj12o4Mv1uAcx4mN_AhizhPXCS5To9y5T499TqBM.ivys0YeXDksOQgtdSSwWoA",
    "expiraEm": 1705322482
 }
Copy to clipboardErrorCopied
Exemplos de saída em caso de erro
JSON
 {
  "sucesso": false,
  "mensagem": "Motivo do erro"
 }