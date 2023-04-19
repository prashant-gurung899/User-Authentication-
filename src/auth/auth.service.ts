import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from 'src/types/token.type';
import { TOKENS } from 'src/config';
import { UserService } from 'src/user/user.service';
// import { argon2d } from 'argon2';
import * as argon from 'argon2';
import { SignInDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  // Generates Access & Refresh Token
  async generateTokens(payload): Promise<Tokens> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: TOKENS.ACCESS_TOKEN_SECRET,
      expiresIn: TOKENS.ACCESS_EXPIRES_IN,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: TOKENS.REFRESH_TOKEN_SECRET,
      expiresIn: TOKENS.REFRESH_EXPIRES_IN,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
  //prashant
  async validateUser(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);
    const hashPassword = await argon.verify(user.password, password);
    if (!user || !hashPassword) return false;
    return user;
  }

  async login(signInDto: SignInDto): Promise<any> {
    const user = await this.validateUser(signInDto.email, signInDto.password);
    if (!user) {
      return null;
    }
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: TOKENS.ACCESS_TOKEN_SECRET,
        expiresIn: TOKENS.ACCESS_EXPIRES_IN,
      }),
    };
  }
  // signup() {}
  async signup(
    name: string,
    email: string,
    password: string,
  ): Promise<any> {
    // Check if user with provided email already exists
    const existingUser = await this.userService.findOneByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash the password using argon2
    const hashedPassword = await argon.hash(password);

    // Create the user
    const createdUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate tokens for the user
    const tokens = await this.generateTokens({ email, sub: createdUser.id });

    // Return the tokens and user information
    return {
      user: createdUser,
      ...tokens,
    };
  }

  // forgetPassword() {}
}
