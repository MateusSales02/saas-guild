-- Migration: Criar tabela password_reset_tokens para recuperação de senha
-- Data: 2025-12-04

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_password_reset_tokens_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Comentários
COMMENT ON TABLE password_reset_tokens IS 'Tokens para recuperação de senha dos usuários';
COMMENT ON COLUMN password_reset_tokens.token IS 'Token único gerado para reset de senha (32 bytes hex)';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Data de expiração do token (1 hora após geração)';
COMMENT ON COLUMN password_reset_tokens.used IS 'Flag indicando se o token já foi utilizado';
