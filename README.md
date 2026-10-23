# Scoppia Gourmet

Sistema com páginas de cardápio, combos, pedido, cadastro por CPF, histórico e administração.

## Publicação

A raiz é uma aplicação Next.js para Vercel. O diretório backend contém a fonte do serviço de dados e autenticação hospedado em ChatGPT Sites/Cloudflare Workers. O banco atual permanece no backend, preservando cadastros, pedidos e disponibilidade.

Produção na Vercel: https://scoppia-gourmet.vercel.app
Backend: https://scoppia-gourmet-cardapio.califanirodrigo.chatgpt.site

Variáveis de produção: APP_ORIGIN, SCOPPIA_BACKEND_ORIGIN e SCOPPIA_BRIDGE_SECRET. O segredo de integração deve ser configurado nos dois serviços; nunca versionado. O segredo CUSTOMER_CPF_KEY e o banco D1 permanecem no backend. Não mover ou trocar esse segredo sem migrar os índices CPF.

Instalar: npm ci. Desenvolvimento: npm run dev. Verificação: npm run check. Build: npm run build.

Login: /signin-with-chatgpt inicia autorização com PKCE no serviço existente. Um código opaco de uso único é trocado no servidor; a sessão fica em cookie HttpOnly/Secure. CPF e identidade não aparecem na URL do callback. As APIs são intermediadas pelo servidor Next.js com uma lista explícita de rotas e proteção de origem para alterações.

Pedido: salvo como aguardando confirmação antes de abrir o WhatsApp. O cliente precisa enviar a mensagem. Administrador scoppiagourmet@gmail.com confirma o pedido e registra a previsão em /admin/pedidos. Clientes consultam /minha-conta. Nenhum pedido é marcado automaticamente como confirmado.

Validação local: verify-bridge.mjs testa o fluxo entre Next.js local em 3000 e backend local em 5173, com mocks de login do starter e dados sintéticos. Não executa envio de mensagens. O banco local e os segredos não fazem parte deste repositório.


## Acesso do cliente por CPF e senha

Clientes usam `/entrar`, com Better Auth e senha de no mínimo 10 caracteres. O CPF é indexado por HMAC; senhas usam o hash com salt da biblioteca e sessões ficam em cookie HttpOnly/Secure. A administração continua autenticada separadamente e restrita ao e-mail autorizado.

Cadastros antigos e recuperação: após verificar a identidade no atendimento, o administrador gera um código em `/admin/pedidos`. O cliente informa CPF, código e nova senha em Minha conta → Esqueci a senha / cadastro antigo. O código expira em 30 minutos, é de uso único e a recuperação revoga as sessões anteriores. Pedidos históricos e identificadores de clientes são preservados.

Endereços novos usam CEP, rua, número, complemento, bairro, cidade e UF. Endereços antigos continuam registrados e devem ser completados com CEP na próxima atualização. O calendário e a API exigem sete dias de antecedência, calculados no fuso de São Paulo. As migrações 0006/0007 acrescentam tabelas e campos sem apagar os registros existentes.
