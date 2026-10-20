// ============================================================================
// login.dto.ts
// DTO สำหรับการเข้าสู่ระบบแบบง่าย (Username + Password)
// ============================================================================

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'hero', description: 'ชื่อผู้ใช้สำหรับเข้าสู่ระบบ' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกชื่อผู้ใช้' })
  username: string;

  @ApiProperty({ example: '123456', description: 'รหัสผ่าน' })
  @IsString()
  @MinLength(4, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร' })
  password: string;
}
