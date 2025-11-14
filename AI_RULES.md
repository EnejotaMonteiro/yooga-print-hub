# Regras para o Desenvolvimento com IA

Este documento descreve a stack tecnológica utilizada neste projeto e as diretrizes para o uso de bibliotecas, garantindo consistência e boas práticas de desenvolvimento.

## Stack Tecnológica

*   **React:** Biblioteca JavaScript para construção de interfaces de usuário interativas.
*   **TypeScript:** Superset do JavaScript que adiciona tipagem estática, melhorando a robustez e manutenibilidade do código.
*   **Vite:** Ferramenta de build rápida e leve para projetos web modernos.
*   **Tailwind CSS:** Framework CSS utilitário para estilização rápida e responsiva.
*   **shadcn/ui:** Coleção de componentes de UI reutilizáveis e acessíveis, construídos com Radix UI e estilizados com Tailwind CSS.
*   **Supabase:** Plataforma de backend open-source que oferece banco de dados PostgreSQL, autenticação, armazenamento e funções de Edge.
*   **React Router:** Biblioteca para roteamento declarativo em aplicações React.
*   **TanStack Query:** Biblioteca para gerenciamento de estado assíncrono, caching e sincronização de dados.
*   **Lucide React:** Biblioteca de ícones leves e personalizáveis.
*   **Sonner:** Biblioteca para notificações de toast elegantes e acessíveis.
*   **next-themes:** Biblioteca para gerenciar temas (claro/escuro) na aplicação.

## Regras de Uso de Bibliotecas

Para manter a consistência e a eficiência do projeto, siga as seguintes diretrizes ao utilizar as bibliotecas:

*   **Componentes de UI:**
    *   Priorize o uso dos componentes do `shadcn/ui` (`src/components/ui/`).
    *   Se um componente específico não estiver disponível ou precisar de personalização significativa, crie um novo componente em `src/components/` e estilize-o com Tailwind CSS.
*   **Estilização:**
    *   Utilize exclusivamente **Tailwind CSS** para toda a estilização. Evite estilos inline ou arquivos CSS separados para componentes, exceto para estilos globais em `src/index.css`.
*   **Gerenciamento de Estado:**
    *   Para estado local de componentes, use `useState` e `useReducer` do React.
    *   Para gerenciamento de estado assíncrono (busca de dados, cache, etc.), utilize **TanStack Query**.
*   **Roteamento:**
    *   Use **React Router** para toda a navegação na aplicação. Mantenha as definições de rotas em `src/App.tsx`.
*   **Backend, Banco de Dados e Autenticação:**
    *   Utilize **Supabase** para todas as interações de backend, incluindo autenticação, operações de banco de dados e funções de Edge.
    *   O cliente Supabase deve ser importado de `src/integrations/supabase/client.ts`.
*   **Ícones:**
    *   Use **Lucide React** para todos os ícones na aplicação.
*   **Notificações (Toasts):**
    *   Utilize a biblioteca **Sonner** para exibir notificações de toast.
*   **Funções Utilitárias:**
    *   Funções utilitárias gerais devem ser colocadas em `src/lib/utils.ts`.
*   **Hooks Customizados:**
    *   Todos os hooks customizados devem ser criados em `src/hooks/`.
*   **Temas (Dark Mode):**
    *   Utilize `next-themes` para gerenciar o tema da aplicação (claro/escuro). A classe `dark` será aplicada ao elemento `html`.