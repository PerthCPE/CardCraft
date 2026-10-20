// ============================================================================
// register.dto.ts
// DTO สำหรับการสมัครสมาชิกแบบง่าย (Username + Password + Name)
// ============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'warrior700', description: 'ชื่อผู้ใช้สำหรับเข้าสู่ระบบ (ไม่ซ้ำ)' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกชื่อผู้ใช้' })
  @MinLength(3, { message: 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร' })
  username: string;

  @ApiProperty({ example: '123456', description: 'รหัสผ่าน' })
  @IsString()
  @MinLength(4, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร' })
  password: string;

  @ApiPropertyOptional({ example: 'Rune Challenger', description: 'ชื่อตัวละคร / Display Name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 700, description: 'เป้าหมายคะแนน TOEIC (ค่าเริ่มต้นคือ 700)' })
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(990)
  targetScore?: number;
}
