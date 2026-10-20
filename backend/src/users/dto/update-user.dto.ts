// ============================================================================
// update-user.dto.ts
// เปรียบเทียบกับ Go (Gin):
// ใน Gin เราใช้ Struct Tag เช่น:
//   type UpdateUserRequest struct {
//       Name                  *string `json:"name" binding:"omitempty,min=2"`
//       TargetScore           *int    `json:"targetScore" binding:"omitempty,min=250,max=990"`
//       CurrentEstimatedScore *int    `json:"currentEstimatedScore" binding:"omitempty,min=0,max=990"`
//   }
// ใน NestJS เราใช้ Class + Decorators จาก `class-validator` และ `@nestjs/swagger`
// เมื่อทำงานร่วมกับ Global ValidationPipe จะตรวจค่าอัตโนมัติเหมือน `c.ShouldBindJSON(&req)`
// ============================================================================

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Alden the High Paladin' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 700, minimum: 250, maximum: 990 })
  @IsOptional()
  @IsInt()
  @Min(250)
  @Max(990)
  targetScore?: number;

  @ApiPropertyOptional({
    example: 725,
    minimum: 0,
    maximum: 990,
    description: 'คะแนนประเมินปัจจุบัน (0-990) สำหรับอัปเดตหรือจำลองระดับ Tier',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(990)
  currentEstimatedScore?: number;
}
