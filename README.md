# GameMath

GameMath é uma ferramenta web educativa para apoiar alunos do 4º ano do Ensino Fundamental na prática de multiplicação e divisão.

O MVP prevê uma área do aluno para jogar e uma área do professor para acompanhar o desempenho dos alunos vinculados por código. As perguntas e explicações serão fornecidas pelo grupo de Pedagogia parceiro do projeto.

## Tecnologias

- Astro
- JavaScript
- Supabase: autenticação e banco de dados

## Requisitos

- Node.js 22.12.0 ou superior
- npm
- Git

O Docker Desktop será necessário para iniciar o Supabase localmente. Para executar apenas o Astro conectado ao projeto Supabase hospedado, não é necessário iniciar o Docker.

## Preparar o projeto

Clone o repositório e entre na pasta do projeto. Depois, instale as dependências:

```powershell
npm install
```

Crie seu arquivo local de configuração a partir do exemplo:

```powershell
Copy-Item .env.example .env.local
```

Abra `.env.local` e preencha `PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_PUBLISHABLE_KEY` com os dados de conexão do projeto Supabase.

**Não envie `.env.local` ao GitHub.** O arquivo contém configurações locais. O `.env.example` pode ser compartilhado porque não contém valores.

## Executar o Astro

Inicie o servidor local:

```powershell
npm run dev
```

O terminal mostrará o endereço local para abrir no navegador. Para encerrar o servidor, pressione `Ctrl+C`.

## Comandos disponíveis

```powershell
npm run dev
npm run build
npm run preview
```

## Banco de dados e Supabase CLI

A estrutura inicial do banco está registrada em `supabase/migrations/`. As alterações futuras no banco devem ser registradas em novas migrações e enviadas ao repositório para que o grupo possa acompanhá-las.

Para comandos da Supabase CLI que alterem o banco remoto, confirme antes que está usando o projeto correto e que a migração foi revisada.

## Estrutura atual

- `src/pages/`: páginas do site
- `src/components/`: componentes reutilizáveis
- `src/layouts/`: estrutura compartilhada das páginas
- `src/lib/`: conexão do Astro com serviços do projeto
- `supabase/migrations/`: histórico da estrutura do banco
- `supabase/functions/`: funções de servidor do Supabase