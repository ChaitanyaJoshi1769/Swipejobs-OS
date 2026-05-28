import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private organizationsService: OrganizationsService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    // Create organization
    const organization = await this.organizationsService.create({
      name: registerDto.organization_name,
      slug: registerDto.organization_slug,
    });

    // Create user
    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      first_name: registerDto.first_name,
      last_name: registerDto.last_name,
      user_type: registerDto.user_type || 'employer',
      organization_id: organization.id,
    });

    // Generate tokens
    const tokens = await this.authService.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
      ...tokens,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: any,
  ) {
    const ipAddress = request.ip;
    const userAgent = request.get('user-agent');

    const user = await this.usersService.findByEmail(loginDto.email);
    const tokens = await this.authService.login(
      loginDto,
      ipAddress,
      userAgent,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        organization_id: user.organization_id,
      },
      ...tokens,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: any) {
    await this.authService.logout(req.user.id);
  }
}
