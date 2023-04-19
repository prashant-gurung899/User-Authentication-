import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.guard';
import { SignInDto } from './dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @UseGuards(LocalAuthGuard)
  signin(@Body() signInDto: SignInDto) {
    return this.authService.login(signInDto);
  }

  // @Post('signup')
  // signup() {}
  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;
    const user = await this.authService.signup(name, email, password);
    return user;
  }

  @Post('forget-password')
  forgetPassword() {}
}
