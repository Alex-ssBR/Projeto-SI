USE controledecasos;
-- Comandos para criar o banco de dados e as tabelas

-- Tabela para armazenar os casos
CREATE TABLE casos (
    id_caso INTEGER PRIMARY KEY AUTO_INCREMENT, 
    nome_solicitante VARCHAR(255) NOT NULL,
    ramal VARCHAR(20),
    secretaria VARCHAR(255),
    departamento VARCHAR(255),
    numero_patrimonio VARCHAR(50) NOT NULL,
    problema_descricao TEXT,
    solucao_descricao TEXT,
    status VARCHAR(20) NOT NULL, -- 'aberto' ou 'fechado'
    ultima_atualizacao DATETIME NOT NULL
);

-- Tabela para armazenar os avisos (mensagens do chat)
CREATE TABLE avisos (
    id_aviso INTEGER PRIMARY KEY AUTO_INCREMENT, 
    mensagem TEXT NOT NULL,
    timestamp_aviso DATETIME NOT NULL
);

-- Exemplo de inserção de dados na tabela 'casos'
INSERT INTO casos (nome_solicitante, ramal, secretaria, departamento, numero_patrimonio, problema_descricao, solucao_descricao, status, ultima_atualizacao)
VALUES ('João Silva', '1234', 'TI', 'Suporte', '12345', 'Computador não liga', 'Troca de fonte', 'fechado', '2023-10-26 10:00:00');

-- Exemplo de inserção de dados na tabela 'avisos'
INSERT INTO avisos (mensagem, timestamp_aviso)
VALUES ('Bem-vindo ao sistema de chamados!', '2023-10-26 09:30:00');

SELECT * FROM casos;
SELECT * FROM avisos;
