# Scoppia Gourmet

Páginas: início (/), itens individuais (/cardapio), combos (/combos), pedido (/pedido), conta e histórico (/minha-conta), administração (/admin) e consulta administrativa de pedidos (/admin/pedidos).

Cadastro: exige login ChatGPT. CPF validado pelos dígitos verificadores, normalizado e indexado por HMAC-SHA256 com segredo CUSTOMER_CPF_KEY. Apenas os dois últimos dígitos são armazenados para exibição; o CPF completo não é armazenado ou enviado ao WhatsApp. Não trocar o segredo sem uma estratégia de migração, pois os índices dependem dele. O login vincula o cadastro à conta; não é uma validação oficial da titularidade do CPF. Alteração de CPF ou transferência entre contas exige atendimento e não tem endpoint público.

Histórico: cada pedido mantém uma cópia dos itens, preços em centavos e dados de entrega. Fica vinculado ao cliente autenticado. O endpoint do cliente ignora identificadores externos e filtra a própria conta; a busca por CPF só existe na API administrativa. Cadastro, histórico e resultados administrativos usam Cache-Control privado/no-store.

Finalização: salva o cadastro e um pedido aguardando confirmação, depois prepara a mensagem para (11) 98894-4648. O cliente toca em Enviar no WhatsApp. Não há confirmação automática de envio. A equipe confirma o pedido e registra a previsão na administração; o cliente vê essas atualizações no histórico. Repetições do mesmo requestId retornam o mesmo pedido. Pedidos feitos antes desta funcionalidade não foram importados.

Disponibilidade, clientes e pedidos persistem em D1. Aplique as migrations de drizzle no banco local; a publicação aplica as migrations hospedadas. CUSTOMER_CPF_KEY deve ser configurado como segredo de runtime; .dev.vars é ignorado pelo Git.

Admin: conta ChatGPT scoppiagourmet@gmail.com. Sem login, clientes consultam o cardápio, mas precisam entrar para registrar pedidos e consultar dados.

Verificações: node node_modules/typescript/bin/tsc --noEmit; com servidor local ativo: node verify.mjs, node verify-pages.mjs e node verify-customers.mjs. Estes testes não enviam mensagens. verify-customers cria dados sintéticos apenas no banco local.

## Integração com Vercel

/conectar inicia uma autorização com PKCE após o login ChatGPT. O código opaco dura 120 segundos e só pode ser trocado uma vez, com o verificador correto. /api/bridge/exchange emite uma sessão assinada com HMAC para a aplicação Vercel. O callback carrega apenas código e estado, sem CPF ou identidade. As rotas de dados aceitam a sessão pelo cabeçalho x-scoppia-session, validando assinatura e expiração; a identidade fornecida pelo ChatGPT Sites continua funcionando.

Segredos adicionais: SCOPPIA_BRIDGE_SECRET (mesmo valor na Vercel e neste backend) e SCOPPIA_VERCEL_ORIGIN (origem de produção permitida para o callback). A Vercel guarda a sessão em cookie HttpOnly/Secure/SameSite=Lax, bloqueia requisições de escrita de outra origem e encaminha somente os endpoints permitidos. O banco e o segredo CUSTOMER_CPF_KEY permanecem neste serviço.
