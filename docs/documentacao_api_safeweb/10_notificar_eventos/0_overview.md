Overview
Este projeto tem como objetivo a implementação de um serviço para notificação de eventos que implicam na atualização do status do Certificado, como os eventos de Validação, Verificação, Emissão e Revogação, isto é, a cada evento a Autoridade Certificadora receberá uma notificação sobre a alteração de status do Certificado.

O sistema irá enviar os eventos de modificação de status do certificado para as ACs do PSS para uma URL de retorno fornecida pelas Autoridades Certificadoras.

Premissas:

1. A autoridade certificadora deverá implementar uma URL (API ou Página em https) capaz de receber um Json via POST e retornar um objeto do tipo ​HTTP Response​. Será validado a notificação como sucesso de acordo com o http status.

2. Adicionar no XML da Solicitação (Protocolo) a URL que receberá as notificações de evento, através do parâmetro “UrlSolicitacao”.

Atributos de Entrada:

1. Disparo de um evento de alteração de status do certificado.

Lista de Abreviaturas e Siglas
Sigla	Descrição
AC	Autoridade Certificadora.
AR	Autoridade de Registro.
LA	Local de Atendimento.
AGR	Agente de Registro.
CD	Certificado Digital.
ITI	Instituto Nacional de Tecnologia da Informação.
GEDAR	Gestão Eletrônica de Documentos da Autoridade de Registro.
AVP	Agente de Validação Presencial.
A seguir serão descritos os requisitos do sistema, separados por módulos, bem como as respectivas regras de negócio que devem ser consideradas durante o desenvolvimento.