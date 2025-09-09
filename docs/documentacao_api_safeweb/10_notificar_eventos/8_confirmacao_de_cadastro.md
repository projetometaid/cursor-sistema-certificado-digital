Confirmação de Cadastro
Evento ocorre no final da video conferência.

#	Campo	Descrição
1	evento	Descrição do evento
2	protocolo	Protocolo da solitação
3	responsavelEvento	Agente de registro responsável pelo evento
4	acao	Ação realizada
5	nomeAutoridadeRegistro	Nome da Autoridade de Registro
6	cnpjAutoridadeRegistro	Cnpj da Autoridade de Registro
7	localAtendimento	Local do atendimento
8	apelidoPosto	Exibe o apelido e a UF do Local de Atendimento que realizou a validação do Certificado Digital
9	tipoMatch	Exibe o tipo de match biométrico realizado com o titular do Certificado Digital
10	comVerificacao	Informa se o Certificado Digital foi emitido com ou sem a etapa de verificação
11	descricao	Exibe o motivo de cancelamento da vídeo informado pelo Agente de Registro
Exemplo JSON
JSON
{
   "evento":"Confirmação de Cadastro",
   "protocolo":"7001083528",
   "responsavelEvento":"JOÃO DA SILVA:98765432100",
   "acao":"Aprovado",
   "nomeAutoridadeRegistro":"AUTORIDADE DE REGISTRO",
   "cnpjAutoridadeRegistro":"20085105000106",
   "apelidoPosto": "AR FUTURA (INSTALAÇÃO TÉCNICA)",
   "tipoMatch": "Match em base local da AC (Reaproveitamento de dossiê)",
   "comVerificacao": "true",
   "descricao":"Troca de produto"
}
Copy to clipboardErrorCopied
Reenvio de eventos

Os eventos enviados que ficarem com status de “Notificado”, ou seja, cujo retorno não foi de “sucesso” irá permanecer na fila para serem reenviados, após um período de tempo configurável pelo sistema. Esta ação de reenvio será disparada após uma quantidade de 3 (três) tentativas de envio terem se esgotado.