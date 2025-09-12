# Infra (Terraform) — AWS

Provisiona:
- S3 (site estático) + CloudFront (HTTPS) para Admin.
- EC2 (Ubuntu) com Nginx proxy para /api → Node (Express) e proxies Safeweb/Assertiva.

## Pré-requisitos
- Terraform >= 1.6
- AWS credenciais configuradas (perfil padrão)

## Variáveis

- `project_name` (default: `sistema-certificado`)
- `aws_region` (default: `us-east-1`)
- `repo_url` (obrigatória) — URL https do GitHub
- `dotenv` — conteúdo do `.env` (string). Sugestão: `terraform.tfvars` com base64 do arquivo.
- `api_port` (3000), `assertiva_port` (3001), `safeweb_port` (3003)

Exemplo `terraform.tfvars`:

```hcl
repo_url     = "https://github.com/projetometaid/cursor-sistema-certificado-digital.git"
project_name = "sistema-certificado"
dotenv       = "${filebase64("../../config/.env.prod")}" # ajuste o caminho
```

## Passos

```bash
terraform init
terraform apply -auto-approve \
  -var repo_url="https://github.com/projetometaid/cursor-sistema-certificado-digital.git"
```

Saídas:
- `admin_url` — URL HTTPS CloudFront (ex.: https://dxxxxxx.cloudfront.net)
- `api_public_ip` — IP público do EC2 (p/ troubleshooting)

## Observações
- O Admin é servido pelo CloudFront do bucket S3; o backend exposto via Nginx em `http://EC2:80/api/`.
- Configure no frontend `VITE_API_BASE_URL=/api` para que as chamadas apontem para o mesmo host.
- Em produção com domínio próprio: crie um ACM + CloudFront com domínio e redirecione `/api` para um ALB/EC2 conforme necessidade.
