import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  login(usuario: string, password: string): { accessToken: string } {
    const demoUser = this.configService.get<string>('DEMO_USER', 'recepcion');
    const demoPassword = this.configService.get<string>('DEMO_PASSWORD', 'clinica123');
    if (usuario !== demoUser || password !== demoPassword) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const payload = { sub: usuario, rol: 'recepcion' };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
