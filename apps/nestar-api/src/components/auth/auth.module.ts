import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';

@Module({
  providers: [AuthService],
  exports: [AuthService] // boshqa model ichida ishlatish uchun export qilindi -- member.model.ts
})
export class AuthModule {}


