// ============================================================================
// main.ts
// จุดเริ่มต้นของแอปพลิเคชัน (Entry Point) เปรียบเทียบกับ `func main()` ใน Go (Gin):
// 1. `NestFactory.create(AppModule)` -> เทียบเท่า `r := gin.Default()`
// 2. `app.enableCors()`              -> เทียบเท่า `r.Use(cors.Default())`
// 3. `app.useGlobalPipes(...)`       -> เทียบเท่า Global Middleware สำหรับ Validate JSON Payload
//    และแปลงชนิดข้อมูลอัตโนมัติ (เหมือน `binding:"required"` ของ Go Validator)
// 4. `SwaggerModule.setup(...)`      -> เทียบเท่า `swaggo/gin-swagger` เปิดหน้า UI ที่ `/api/docs`
// ============================================================================

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // เปิดใช้งาน CORS เพื่อให้ Frontend (Next.js พอร์ต 3000) เรียก API ได้
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // ตั้งค่า Global ValidationPipe:
  // - whitelist: true -> ตัดฟิลด์แปลกปลอมที่ไม่ได้อยู่ใน DTO ทิ้งอัตโนมัติ (ปลอดภัยเหมือน Strict Struct Unmarshal ใน Go)
  // - transform: true -> แปลงชนิดข้อมูลจาก JSON/Query เป็นชนิดที่ระบุใน DTO อัตโนมัติ
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // ตั้งค่า Swagger OpenAPI Documentation (/api/docs)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('CardCraft — Gamified Pixel-Art RPG TOEIC 700+ API')
    .setDescription(
      'RESTful API สำหรับระบบฝึกคำศัพท์ Spell-Card, โจทย์ TOEIC (Listening/Reading), Boss Battle Mock Test และ 7-Tier Character Evolution',
    )
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  await app.listen(port, '0.0.0.0');

  console.log(`CardCraft Backend API running at: http://0.0.0.0:${port}`);
  console.log(`Swagger OpenAPI Docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
