import { Controller, Get, Post, Body, Patch, Param, Res, Req, ParseIntPipe, NotFoundException, UseGuards, UnauthorizedException, BadRequestException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SignUpUserDto } from './dto/user-signup.dto';
import { User } from './entities/user.entity';
import { SignInUserDto } from './dto/user-signin.dto';
import { Response, Request } from 'express';
import { CurrentUser } from 'src/utility/decorators/current-user.decorators';
import { AuthentificationGuard } from 'src/utility/guards/authentification.guard';
import { AuthorizeRoles } from 'src/utility/decorators/authorize-roles.decorators';
import { UserRoles } from 'src/utility/common/user-roles.enum';
import { AuthorizeGuard } from 'src/utility/guards/authorization.guard';
import * as jwt from 'jsonwebtoken';
import { TokenService } from './token.service';
import { MoreThanOrEqual } from 'typeorm';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private tokenService: TokenService) {}

  @Post('register')
  async register(@Body() signUpUserDto: SignUpUserDto): Promise<{user: User}> {
    return {user: await this.usersService.register(signUpUserDto)};
  }

  @Post('login')
  async login(@Body() signInUserDto: SignInUserDto, 
    @Res({passthrough: true}) response: Response): Promise<{ token_access: string; user: User}> {
    const user = await this.usersService.login(signInUserDto);
    const token_access = await this.usersService.token_access(user);
    const refresh_token = await  this.usersService.refresh_token(user);

    const expiredAt =  new Date();
    expiredAt.setDate(expiredAt.getDate() + 7); // set expiration date for access token to be 1 week
    await this.tokenService.save({
      user_id: user.id,
      token: refresh_token,
      expiredAt
    })
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
    });
    return {token_access, user};
  }

  @AuthorizeRoles(UserRoles.ADMIN)
  @UseGuards(AuthentificationGuard,AuthorizeGuard)
  @Get('all')
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @AuthorizeRoles(UserRoles.ADMIN)
  @UseGuards(AuthentificationGuard,AuthorizeGuard)
  @Get(':id')
  async findOne(@Param('id',ParseIntPipe) id: string): Promise<User> {
    return this.usersService.findOne(+id);
  }

  @UseGuards(AuthentificationGuard)
  @Get('me/profile')
  async viewProfile(@CurrentUser() currentUser: User) {
    if (!currentUser) {
      throw new NotFoundException("No user logged in");
    }
    return await this.usersService.findOne(currentUser.id);
  }

  @UseGuards(AuthentificationGuard)
  @Patch('update/profile')
  async update(@Body() updateUserDto: UpdateUserDto, @CurrentUser() currentUser:User,):Promise<User> {
    const user = currentUser;
    return await this.usersService.update(updateUserDto, currentUser);
  }

  @Get('user')
  async user(@Req() request: Request) {
    try{
      const token_access = request.headers.authorization.replace('Bearer ', '');
      const decodedToken = jwt.verify(token_access, process.env.TOKEN_ACCESS_SECRET_KEY) as { id: string };
      console.log('Decoded Token:', decodedToken); // Afficher le token décodé dans la console
      const userId = parseInt(decodedToken.id, 10); // Convertir l'ID en nombre
      const user = await this.usersService.findOne(userId);
      return user;
    }catch(error){
        throw new UnauthorizedException();
    }
    
  }

  @Post('refresh')
  async refresh(@Req() request: Request, @Res({passthrough: true}) response: Response){
    const refreshToken = request.cookies['refresh_token'];
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token is missing');
      }
      const decodedToken = jwt.verify(refreshToken, process.env.TOKEN_ACCESS_SECRET_KEY) as { id: string; username: string };
      const user = await this.usersService.findOne(parseInt(decodedToken.id, 10));
      const tokenEntity = await this.tokenService.findOne({
        user_id: user.id,
        expiredAt: MoreThanOrEqual(new Date())
      });
      if(!tokenEntity){
        throw new UnauthorizedException('Refresh token is invalid');
      }
      const newAccessToken = jwt.sign({ id: user.id, username: user.username }, process.env.TOKEN_ACCESS_SECRET_KEY, { expiresIn: '30s' });
      return { token_access: newAccessToken };

  }

  @Post('logout')
  async logout(@Req() request: Request, @Res({passthrough: true}) response: Response) {
    const refreshToken = request.cookies['refresh_token'];
    await this.tokenService.delete({ token: refreshToken });
    
    response.clearCookie('refresh_token');
    return { message: 'Logout successful' };
  }

}
