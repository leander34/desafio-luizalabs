1. Titulo do projeto.
2. Falar em poucas palavras sobre o projeto.
3. O que é necessario para rodar o projeto
   1. docker
   2. rodar tal comando
   3. ai entrar no minIo
4. Como rodar o projeto
5. Como deve ficar o .env de cada pasta
6. Como executar os teste
   1. Entre em cada pasta e execute o comando
   2. colar - comando para executar teste na api, comando para executar os teste no worker tal
7. Chamar para api usando CURL
8. no retorna da api tal adicionei mais um campo pensando nisso e naquilo
9.  Tecnilogias utilizadas
10. Estrutura do Projeto (pastas e código)
11. Colocar imagem da estrutra
12. Decisões Técnicas e Arquiteturais
   1. usei tal coisa por que Facilita consultas complexas no MySQL.
Segurança com validação de dados embutida.
Melhor DX (Developer Experience) para manutenção do código.
   1. usei principos de solid e clean arquitectura poq isso permite um código mais testavel, extensivel e manutenivel
   2. optei pelo Fastify no back-end pela performance e suporte a validação nativa.
   3. obtei por usar um processo em microsservicoes pq isso permite que eu possa adicionar mais processo ao fluxo e processar as mensagens em qualquer lingguem
   4. usei redis para cachar os dados mais frequentemente consultados, pq isso deixa api mais rapida, consome menos recurso do banco e melhora a experiencia de uso
   5. use o rabbitMQ pq
   6. dividi em dois microsserviços pois assim se exisir mais um worker que processa aquele arquivo e gera outra saida e facil de adicionar
   7. use o prisma pq
   8. use o docker pq permite criar ambientes isolado e que rodem em qualquer maquina ...
   9.  usei MinIo pq ele permite ...
1.  Possiveis Melhorias Futuras (Demonstra visão e planejamento!)
2.  Autor





### DESAFIO TECNICO LUZIA LABS
# 🏗 Processamento de Arquivos Desnormalizados com Streams e Microserviços

🚀 Projeto desenvolvido para processar arquivos desnormalizados em formato TXT de forma eficiente, otimizando a leitura e escrita por meio de streams e distribuindo a carga entre microsserviços para garantir escalabilidade e desempenho.

![Tela Inicial](images/2.png)

----------------------------
# 🛠 Tecnologias Utilizadas

🔹 Back-end:
Node.js: Ideal para operações que utilizam streams e entrada/saída de dados.
Fastify: APIs leves e rápidas. Melhor suporte ao TypeScript. Alto modularidade e isolamento de escopo com plugins.
Streams nativas do Node.js: para processar arquivos sem sobrecarregar a memória.
Prisma ORM: (armazenamento otimizado)

🔹 Infraestrutura:
Docker + Docker Compose: para facilitar a orquestração dos serviços.
Redis: cache para otimizar buscas frequentes.
RabbitMQ: mensageria para distribuir tarefas entre os workers.
MySQL: Banco de dados relacional utilizado para armazenar dados estruturados.
MinIo: Armazenamento de objetos auto-hospedado e totalmente compativel com o s3. Ideal para ambientes de desenvolvimento.

🔹 Testes:
Vitest: testes unitários e de integração
Supertest: testes de API


Escolhi essas tecnlogias por que elas combinam....
----------------------------



optei por um ter um campo quantity para processar possiveis produtos com mesmo valor em um mesmo pedido para 
Perguntas
por que usar um orm








-------------------------------------
🔍 Fluxo de Processamento
1️⃣ O usuário faz upload do arquivo CSV.
2️⃣ O sistema processa linha por linha usando streams (sem carregar o arquivo inteiro na RAM).
3️⃣ Cada linha é enviada para um microserviço via RabbitMQ para processamento assíncrono.
4️⃣ Os resultados são armazenados no MySQL.

Fluxo de Dados
Upload de Arquivo: O usuário envia um arquivo desnormalizado via API Fastify.
Armazenamento de Arquivos: O arquivo é enviado para o MinIO para ser armazenado e acessado posteriormente.
Armazenamento do arquivo: O arquivo é salvo usando em um storage s3 complatible auto-hospodedo

Processamento com Streams: O arquivo é lido em chunks e os dados são processados utilizando Streams.
Enfileiramento com RabbitMQ: As partes do arquivo processado são enviadas para RabbitMQ, que distribui as tarefas entre os workers disponíveis.
Armazenamento e Cache: Dados estruturados são armazenados no MySQL e cacheados no Redis para otimizar consultas.






 Melhorias Futuras
📌 Adição de suporte a outros formatos de arquivo (JSON, XML).
📌 Monitoramento de fila no Prometheus + Grafana.



# 🚀 3. Como Rodar o Projeto
- Ter docker instalado na maquina.
- Preencher as variaveis de ambiente (descomente o arquivo **.env.example** para maior facilidade). Essas são as pastas que prencisão de configurar as variaveis de ambiente:
  - api/.env
  - workers/process-files/.env
  - workers/process-rows/.env
- **importante** Acessar portal do Minio no navegador (http://localhost:9001) para criar as API KEYs.
- Colocar as API KEYs no **.env** da **api** e do **workers/process-files**
 
Abaixo 

## PASSO A PASSO DETALHADO


🏗 6. Decisões Técnicas e Arquiteturais



 1. Melhorias Futuras

# 🔍 Testes
O projeto utiliza Vitest para testes automatizados, garantindo que todas as funcionalidades estejam funcionando corretamente antes de qualquer alteração significativa no código. Para rodar os testes, basta executar:

docker exec

### Configuração variaveis de ambiente
Essas são variaveis que precisam estar ativas
Você pode renomeada a pasta "**.env.example**" para "**.env**"

🔑 Pasta **api**
DB_HOST: Endereço do banco de dados MySQL.
DB_USER: Usuário do banco de dados.
DB_PASSWORD: Senha do banco de dados.
REDIS_HOST: Endereço do servidor Redis.
RABBITMQ_URL: URL do RabbitMQ.
MINIO_ENDPOINT: Endpoint do MinIO.
API_KEY: Chave de autenticação para a API.





### Entre em cada container e execute o comando
No **container da API** execute o seguinte comando:
```bash
   docker exec it npm run test
```

No **container do worker-process-files** execute o seguinte comando:
```bash
   docker exec -it npm run test
```

No **container do worker-process-rows** execute o seguinte comando:
```bash
   docker exec -it npm run test
```