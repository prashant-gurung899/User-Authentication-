import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TOKENS } from 'src/config';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt.guard';
import { UserService } from 'src/user/user.service';
import { LocalAuthGuard } from './guards/local.guard';
import { LocalStrategy } from './strategy/local.strategy';

// @Module({
//   controllers: [AuthController],
//   providers: [AuthService]
// })

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: TOKENS.ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: TOKENS.ACCESS_EXPIRES_IN },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard,LocalStrategy, UserService],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
