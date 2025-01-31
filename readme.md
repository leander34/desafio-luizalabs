### DESAFIO TÉCNICO LUIZA LABS
# 🏗 Processamento de Arquivos Desnormalizados com Streams e Microserviços


🚀 Projeto desenvolvido para processar arquivos desnormalizados em formato .txt de forma eficiente, otimizando a leitura e escrita por meio de streams e distribuindo a carga entre microsserviços para garantir escalabilidade e desempenho.

Decidi desenvolver o sistema em microsserviços, pois isso possibilita o processamento de uma grande quantidade de dados, de maneira mais performática e distribuída, evitando sobrecarga em um único serviço. Na sessão de arquitetura existe uma **Imagem do System Design** que ilustra em mais detalhes como funciona todo fluxo de processamento do arquivo e como os microsserviços foram estruturados.


# Como Rodar o Projeto 🚀
## 📌 Pré-requisitos
1. Ter o **Docker** instalado na máquina.
2. Preencher as variáveis de ambiente (renomeie o arquivo **.env.example** de cada pasta para **.env** maior facilidade). Faça as alterações nos seguintes arquivos:
  - `./api/.env`
  - `./workers/process-files/.env`
  - `./workers/process-rows/.env `
   
## Comandos Para Rodar o Projeto
1. Renomeie os arquivos **.env.example** para **.env**
2. Execute o seguinte comando `docker-compose up -d`


## 🔑 Como deve ficar o .env de cada pasta
### `./api/.env`
```bash
   NODE_ENV="development"
   DATABASE_URL="mysql://root:rootpassword@mysql:3306/desafio_labs" 
   RABBITMQ_URL="amqp://user:password@rabbitmq:5672"
   PORT=3000
   QUEUE_PROCESS_FILES="PROCESS.FILES"
   QUEUE_PROCESS_ROWS="PROCESS.ROWS"

   STORAGE_PROVIDER="MINIO"
   STORAGE_ENDPOINT="http://minio:9000"
   STORAGE_PORT="9000"
   STORAGE_ACCESS_KEY="minioadmin"
   STORAGE_SECRET_KEY="minioadmin"
   STORAGE_BUCKET_NAME="desafio-labs"        
   STORAGE_REGION="us-east-1"

   REDIS_HOST="redis"
   REDIS_PORT=6379
   REDIS_DB=0
```
### `./workers/process-files/.env`

```bash
   NODE_ENV="development"
   RABBITMQ_URL="amqp://user:password@rabbitmq:5672"
   QUEUE_NAME="PROCESS.FILES"
   ROW_PROCESSING_QUEUE="PROCESS.ROWS"
   API_URL="http://api:3000"

   STORAGE_PROVIDER="MINIO"
   STORAGE_ENDPOINT="http://minio:9000"
   STORAGE_PORT="9000"
   STORAGE_ACCESS_KEY="minioadmin"
   STORAGE_SECRET_KEY="minioadmin"
   STORAGE_BUCKET_NAME="desafio-labs"
   STORAGE_REGION="us-east-1"
```

### `./workers/process-rows/.env`

```bash
   NODE_ENV="development"
   RABBITMQ_URL="amqp://user:password@rabbitmq:5672"
   QUEUE_NAME="PROCESS.ROWS"
   API_URL="http://api:3000"
```
## ✅ Como executar os testes
### Para executar os testes da API:
Para gerar arquivos de coverage `docker exec -it api-s3kzfsoz34 npm run test:coverage`
Para apenas rodar os testes `docker exec -it api-s3kzfsoz34 npm run test`

### Para executar os testes do worker-process-files:
Para gerar arquivos de coverage `docker exec -it worker-process-files-s3kzfsoz34 npm run test:coverage`
Para apenas rodar os testes `docker exec -it worker-process-files-s3kzfsoz34 npm run test`

### Para executar os testes do worker-process-rows:
Para gerar arquivos de coverage `docker exec -it worker-process-rows-s3kzfsoz34 npm run test:coverage`
Para apenas rodar os testes `docker exec -it worker-process-rows-s3kzfsoz34 npm run test`

# Enviar requisições para API usando CURL
### Endpoint GET `/files/order`
Endpoint usado para fazer upload dos arquivos .txt
Formatos validos: Apenas ".txt"
```bash
   curl -X POST http://localhost:3000/files/order \
     -F "arquivo=@caminho/do/arquivo.txt"
```
### Endpoint `/users/orders`
Endpoint de retorno dos dados normalizados em JSON
```bash
   curl -X GET http://localhost:3000/users/orders
```
 Alguns filtros disponíveis:
- start_date: '2021-06-02' - Formato -> 'YYYY-MM-DD'
- end_date: '2021-10-10' - Formato -> 'YYYY-MM-DD'
- order_id
- page 
- size -> min: 1 | max: 500
Existe a opção de paginar e limitar a quantidade de dados que vem no retorno, por padrão traz 500 users.
Existe validação de formato para os campos "start_date" e "end_date"
Por exemplo -> formato inválido: DD/MM/YYYY
Caso você envie uma data com valores de dia ou mês não permidos como por exemplo 2021-04-32, o sistema converte essa data para 2021-05-01. Vale para o mês também.
Para enviar com os filtros tente:
```bash
   curl -X GET "http://localhost:3000/users/orders?start_date=2021-05-10&end_date=2021-07-10"
```
Você pode ter notado que adicionei um novo campo "**quantity**" que representa a quantidade de um produto no **pedido**. Essa quantidade somente será incrementa se o campo "**order_id**", "**product_id**" e "**value**" foram idênticos. Isso não acontece nesses arquivos, mas pode ser que, em algum momento, existam linhas em que acontece esse conflito. Já pensando nesse casso, resolvi implementar dessa forma.

# 🛠 Tecnologias Utilizadas

🔹 Back-end:
Node.js: Ideal para operações que utilizam streams e entrada/saída de dados.
Fastify: APIs leves e rápidas. Melhor suporte ao TypeScript. Alto modularidade e isolamento de escopo com plugins.
Streams nativas do Node.js: para processar arquivos sem sobrecarregar a memória.
Prisma ORM: (armazenamento otimizado)

🔹 Infraestrutura:
Docker + Docker Compose: para facilitar a orquestração dos serviços.
RabbitMQ: mensageria para distribuir tarefas entre os workers.
MySQL: Banco de dados relacional utilizado para armazenar dados estruturados.
MinIo: Armazenamento de objetos auto-hospedado e totalmente compativel com o s3. Ideal para ambientes de desenvolvimento.

🔹 Testes:
Vitest: testes unitários e de integração

# Estrutura do Projeto (arquitetura)
Nesse projeto segui uma padronização nas pastas para deixar o código mais modular possível e fácil de extender. Também segui bons princípios na escrita do código, usando SOLID, clean architecture.
Foi mais ou menos assim como pensei:
### Camada de aplicação: 
Os use-cases orquestram as regras de negócio e fazem chamadas para o repository.
Alguns exemplos de como funciona:
- `create-customer`: Conhece a lógica para criar um cliente.
- `create-order`: Conhece a lógica para criar um pedido.
   - Nesse use case, por exemplo, existe a necessidade de que o cliente exista antes de você criar um pedido para ele. Então, é necessário chamar alguém externo para fazer essa validação, ou seja, consultar o banco de dados, mas o use case não pode acessar o banco de dados diretamente, então ele pede para o repository fazer isso. A camada de aplicação se comunica com coisas externas, mas não faz isso diretamente, sempre usa uma interface de comunicação.
- `get-order`: Conhece a lógica para recuperar os dados de um pedido, mas precisa comunicar com o mundo externo usando os repositories para buscar esses dados no banco de dados.

### Camada de domínio:
E nas entities que as regras de negócio deveriam estar e elas não podem depender de coisas externas, apenas pontos centrais do negócio.

### Camada de infra/adapters:
Coloquei tantos os controllers quanto as implementações dos repositories aqui. Nessa pasta é onde a comunição entre o sistema e o mundo externo acontece.
Uma interface de comunicação com o mundo pode ser o controller que receber requisições http e chama os casos de uso.
Podemos essa organização acontecendo no PrismaCustomerRepository que impletamenta o CustomerReposity usando o prisma para se comunicar com o banco de dados, essa impletação deve acontecer quando estamos pensando na infra.
Também temos nessa pasta arquivos como o `ordersRoutes` dentro dessa pasta que conecta os controllers do o framework fastify.

A separação garante que o Domínio e Aplicação não dependam da infraestrutura, tornando o código mais modular, testável, fácil de evoluir e agnóstico ao framework.

![system design](images/pastas.jpg)

# Decisões Técnicas e Arquiteturais

1. Optei por usar um ORM pela facilidade de integração com o banco de dados e por deixar o código mais legível e intuitivo. A grande vantagem de usar um ORM é que ele traz agilidade nas operações com o banco de dados, oferecendo abstrações para CRUDs, por exemplo. Isso elimina grande parte da necessidade de escrever query manuais. Essas vantagens me permitiram gastar mais tempo em desenvolver uma boa arquitetura de microsserviços. Além disso, o Prisma ORM permite integração com diferentes bancos de dados sem grandes alterações, segurança com validação de dados embutida, além de entregar uma melhor developer experience para manutenção do código.
2. Usar princípios de SOLID e clean architecture permitiu que o código fosse menos acoplado, mais testável, extensível e manutenível. Com isso, não será difícil adicionar novas funcionalidades ao sistema.
3. Uma das partes mais desafiadoras com certeza foi os microsserviços, transformar todo esse processamento de arquivos desnormalizados em uma operação assíncrona, com filas e streams de dados, permitiu que múltiplos arquivos fossem processados sem nenhuma perda de dados. Além de que, agora, podemos facilmente adicionar mais processos nesse fluxo, com outros tipos de operação e até mesmo linguagens de programação diferentes para os workers.
4. A escolha de dividir em dois microsserviços veio pela facilidade de integrar um novo worker no fluxo para, por exemplo, processar esses arquivos e gerar outro tipo de saída.
5. A Escolha do RabbitMQ foi por ele ser um serviço de message broker, leve, confiável e escalável. O RabbitMQ oferece tudo isso, melhorando a resiliência da aplicação e evitando a perda de mensagens, já que ele trabalha com o conceito de acknowledgment e retry.
6. Usei o docker no projeto, pois ele permite a orquestração dos serviços e garante que o ambiente seja idêntico em todas as máquinas e servidores. Além de facilitar a escalabilidade com containers isolados.
7. O MinIO permite criar um ambiente 100% compatível com o s3, mas na sua MÁQUINA LOCAL, isso fez todo o sentido para o desenvolvimento e em produção não precisamos nenhuma configuração adicional.

   
# ✅ Vantagens da Arquitetura Atual
Desacoplamento → O serviço que lê o arquivo não precisa saber quem vai processar as linhas, tornando o sistema mais modular.

Escalabilidade → Se houver muitos arquivos ou linhas, basta aumentar a quantidade de consumidores (workers) para processar mais rápido.

Tolerância a falhas → Se um consumidor cair, as mensagens ficam na fila e podem ser processadas assim que ele voltar.

Balanceamento de carga → RabbitMQ distribui as mensagens entre os consumidores ativos, evitando sobrecarga em um único serviço.

Retry automático → Se um consumidor falha ao processar uma linha, a mensagem pode ser reenviada para ser processada novamente.

# 📈 Benefícios para o Negócio
Aumento de Capacidade → Com a fila desacoplando leitura e processamento, a empresa pode lidar com arquivos maiores sem travar o sistema.

Redução de Custos → Como o processamento fica distribuído, é possível escalar apenas onde for necessário, evitando desperdício de infraestrutura.

Entrega mais rápida → Processamento paralelo significa que resultados chegam antes, melhorando a experiência do usuário.

# 🚀 Melhorias Futuras
📌 Adição de suporte a outros formatos de arquivo (JSON, XML).

📌 Monitoramento de fila no Prometheus + Grafana.


# Imagem do System Design
![system design](images/system-design.png)

## 🔍 Fluxo de Processamento
- **Upload de Arquivo**: O usuário envia um arquivo desnormalizado via API Fastify.
- **Processamento na API**: O arquivo é enviado para o MinIO para ser armazenado e acessado posteriormente, os meta dados do arquivo são salvos no MySQL e uma mensagem com o id od arquivo é pública na fila PROCESS.FILES.
- **No worker process files**: O arquivo é recuperado do bucket, lido em chunks e os dados são processados utilizando Streams, o que torna o uso de RAM baixíssimo. Posteriormente, uma mensagem é publicada na fila PROCESS.ROWS com a linha crua. Cada linha é enviada para um microsserviço via RabbitMQ para processamento assíncrono.
- **Enfileiramento com RabbitMQ**: As partes do arquivo processado são enviadas para RabbitMQ, que distribui as tarefas entre os workers disponíveis.
No worker process rows: Cada linha é recebida, processada e validada de maneira que não ocorra perdas. Esse worker faz chamadas via http para a API para salvar cada linha no banco de dados. Como trabalhamos com IDs únicos no banco de dados, nenhum dado é duplicado.
Armazenamento: Dados estruturados são armazenados no MySQL.

# Autor

**Nome**: Leander Silveira Santos

**LinkedIn**: https://www.linkedin.com/in/leander-silveira/

**Github**: https://github.com/leander34

