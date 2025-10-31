import os
from dotenv import load_dotenv

load_dotenv() # Carrega as variáveis do .env

class Config:
    # Configurações do Banco de Dados MySQL
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'sua_senha_mysql') # ALTERE PARA SUA SENHA REAL
    MYSQL_DB = os.getenv('MYSQL_DB', 'controledecasos')
    
    # Chave secreta para segurança do Flask (troque por uma string longa e aleatória em produção)
    SECRET_KEY = os.getenv('SECRET_KEY', 'uma_chave_secreta_muito_segura_e_longa_aqui')

    # Credenciais de login (APENAS PARA EXEMPLO, NÃO USE EM PRODUÇÃO REAL!)
    VALID_USERNAME = os.getenv('VALID_USERNAME', 'adm')
    VALID_PASSWORD = os.getenv('VALID_PASSWORD', '123')