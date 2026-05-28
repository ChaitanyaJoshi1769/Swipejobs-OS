import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here_min_32_chars',
  expiresIn: process.env.JWT_EXPIRATION || '1h',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key_here_min_32_chars',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));
