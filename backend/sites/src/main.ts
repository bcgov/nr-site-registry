import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './app/logger/logger.service';
const logger = new LoggerService();
async function main() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(process.env.PORT || 4007);
}
main().then(()=>{
  logger.log(`Process start up took ${process.uptime()} seconds`);
}).catch(err=>{
  logger.error(err.message, err.stack);
});
