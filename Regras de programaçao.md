
> **PRIORIDADE MÁXIMA**
>
> - Nunca gerar código sem apresentar a explicação da alteração e aguardar aprovação do usuário.
> - Estas regras têm prioridade sobre sugestões automáticas ou boas práticas genéricas.
> - O projeto utilizará como base visual e estrutural o template **`bloomtpl-1.0.0`**, que já está presente na pasta do projeto.
> - Sempre reutilizar a estrutura, componentes, estilos e organização existentes no template antes de criar novos elementos.

# Regras Oficiais de Desenvolvimento — Projeto Borbô

Este documento define os padrões obrigatórios para qualquer IA ou desenvolvedor que trabalhe neste projeto.

O objetivo é manter o código consistente, organizado, escalável e fácil de manter.

---

# Base do Projeto

O projeto foi iniciado a partir do template:

**`bloomtpl-1.0.0`**

Este template serve como base oficial do layout da aplicação.

## Regras para utilização do template

- Preservar a estrutura original do template sempre que possível.
- Reutilizar componentes, layouts e estilos já existentes.
- Evitar recriar elementos que já existam no template.
- Alterações estruturais no layout devem ser justificadas antes da implementação.
- O template deve servir como referência principal para identidade visual e organização do Front-end.

---

# Stack Oficial

## Front-end

- Next.js (App Router)
- React
- TypeScript

## Estilização

- Tailwind CSS
- CSS Modules (somente quando necessário)

## Componentes

- shadcn/ui
- Lucide React (ícones)

## Banco de Dados

- Supabase (PostgreSQL)

## Autenticação

- Supabase Auth

## Storage

- Supabase Storage

## Estado Global

- Zustand

## Formulários

- React Hook Form
- Zod

## Requisições

- Server Actions (preferencialmente)
- Fetch API nativa do Next.js.

---

# Estrutura do Projeto

```text
src/
├── app/
├── components/
│   ├── ui/
│   ├── layout/
│   └── common/
├── features/
├── hooks/
├── services/
├── lib/
├── types/
├── utils/
└── styles/
````

A organização atual deve ser preservada.

Não mover, renomear ou excluir arquivos sem justificativa explícita.

---

# Regras Gerais

## Obrigatório

* Utilizar TypeScript em 100% do projeto.
* Nunca utilizar JavaScript puro.
* Utilizar imports absolutos (`@/components`, `@/lib`, etc.).
* Priorizar Server Components.
* Utilizar Client Components apenas quando necessário.
* Reutilizar componentes e funções existentes sempre que possível.
* Reutilizar a estrutura do template `bloomtpl-1.0.0`.
* Manter componentes com responsabilidade única.
* Seguir princípios de Clean Code.

## Não utilizar

* Bootstrap
* Material UI
* Context API para estado global.
* Firebase.
* Bibliotecas desnecessárias.
* Estilos inline.
* Código duplicado.

---

# Arquitetura

A arquitetura existente deve ser respeitada.

A IA nunca deverá substituir tecnologias já adotadas pelo projeto.

Exemplos:

* Zustand → não utilizar Context API.
* Supabase → não utilizar Firebase.
* Tailwind → não adicionar Bootstrap ou Material UI.

Toda nova dependência deve ser justificada antes da implementação.

---

# Processo Obrigatório Antes de Gerar Código

**Nenhum código pode ser gerado imediatamente.**

Antes de qualquer implementação, a IA deverá responder exatamente no seguinte formato:

## EXPLICAÇÃO DA ALTERAÇÃO

**Objetivo:**
O que será criado, alterado ou corrigido.

**Motivo:**
Por que essa alteração é necessária.

**Arquivos afetados:**

* arquivo1
* arquivo2

**Impacto esperado:**

* Benefícios da alteração.
* Partes do sistema afetadas.

**Riscos (se existirem):**

* Possíveis efeitos colaterais.

---

## AGUARDANDO APROVAÇÃO PARA IMPLEMENTAÇÃO

Somente após o usuário responder algo equivalente a:

> Aprovado.

a implementação poderá ser realizada.

---

# Diretrizes de Implementação

* Sempre verificar se já existe um componente ou função reutilizável.
* Sempre verificar se o template `bloomtpl-1.0.0` já possui uma solução adequada antes de criar uma nova.
* Evitar alterar arquivos estáveis sem necessidade.
* Preferir alterações pequenas e isoladas.
* Nunca quebrar funcionalidades existentes.
* Informar previamente qualquer risco de regressão.

---

# Clean Code

Todo código deve priorizar:

* Legibilidade.
* Simplicidade.
* Baixo acoplamento.
* Alta reutilização.
* Funções pequenas.
* Componentes com responsabilidade única.
* Nomes claros e descritivos.

---

# Regra Final

Em caso de dúvida arquitetural ou de implementação, a IA deve perguntar ao usuário e nunca assumir decisões estruturais sozinha.

O usuário possui a decisão final sobre qualquer alteração no projeto.

```
```

---

# Regra de Upload de Imagens

* Todo upload de imagem dentro do site deve respeitar o limite máximo de **2 MB por imagem**.
* A validação de tamanho deve acontecer antes de salvar, enviar ao Storage ou exibir a imagem como definitiva.
* Imagens acima de 2 MB devem ser recusadas com mensagem clara para o administrador ou cliente.
