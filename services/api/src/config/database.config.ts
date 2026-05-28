import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'swipejobs',
  password: process.env.DATABASE_PASSWORD || 'swipejobs_dev_password',
  name: process.env.DATABASE_NAME || 'swipejobs_os',
  url: process.env.DATABASE_URL,
}));
