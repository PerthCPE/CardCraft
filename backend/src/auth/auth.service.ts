// ============================================================================
// auth.service.ts
// Service จัดการการเข้าสู่ระบบและสมัครสมาชิกแบบแยก User
// ใช้ SHA-256 Hash สำหรับรหัสผ่าน ไม่ต้องพึ่งพา External Library เพิ่มเติม
// ============================================================================

import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * เข้ารหัสรหัสผ่านด้วย SHA-256
   */
  hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * สมัครสมาชิกผู้เล่นใหม่ (แยก Progress และสถิติของแต่ละคน)
   */
  async register(dto: RegisterDto) {
    const normalizedUsername = dto.username.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (existingUser) {
      throw new ConflictException(
        `ชื่อผู้ใช้ "${dto.username}" มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น`,
      );
    }

    const hashedPassword = this.hashPassword(dto.password);
    const displayName = dto.name?.trim() || dto.username.trim();

    const newUser = await this.prisma.user.create({
      data: {
        username: normalizedUsername,
        password: hashedPassword,
        name: displayName,
        targetScore: dto.targetScore ?? 700,
        currentEstimatedScore: 350, // ค่าเริ่มต้นสำหรับผู้เล่นใหม่ (Tier 2: Word Scout)
      },
    });

    return {
      message: 'สมัครสมาชิกสำเร็จ ยินดีต้อนรับสู่ CardCraft!',
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        targetScore: newUser.targetScore,
        currentEstimatedScore: newUser.currentEstimatedScore,
        createdAt: newUser.createdAt,
      },
    };
  }

  /**
   * เข้าสู่ระบบด้วย Username และ Password
   */
  async login(dto: LoginDto) {
    const normalizedUsername = dto.username.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (!user) {
      throw new UnauthorizedException('ไม่พบชื่อผู้ใช้นี้ในระบบ');
    }

    const hashedInput = this.hashPassword(dto.password);
    // รองรับทั้งแบบ hash และ plain text (กรณี fallback)
    const isPasswordValid =
      user.password === hashedInput || user.password === dto.password;

    if (!isPasswordValid) {
      throw new UnauthorizedException('รหัสผ่านไม่ถูกต้อง');
    }

    return {
      message: 'เข้าสู่ระบบสำเร็จ!',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        targetScore: user.targetScore,
        currentEstimatedScore: user.currentEstimatedScore,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * ตรวจสอบสถานะ User ปัจจุบัน
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('ไม่พบข้อมูลผู้เล่น');
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        targetScore: user.targetScore,
        currentEstimatedScore: user.currentEstimatedScore,
        createdAt: user.createdAt,
      },
    };
  }
}
