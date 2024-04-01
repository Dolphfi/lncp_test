import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { SignUpUserDto } from './dto/user-signup.dto';
import * as bcrypt from 'bcrypt';
import { SignInUserDto } from './dto/user-signin.dto';
import { sign } from 'jsonwebtoken';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User)
    private usersRepository: Repository<User>,
  ){}

  async register(signUpUserDto: SignUpUserDto): Promise<User>{
    const userExists = await this.findUserByEmail(signUpUserDto.email)
    if (userExists) throw new BadRequestException('Email is Already available')
    if(signUpUserDto.password != signUpUserDto.confirm_password){
      throw new BadRequestException('Confirm Passwords do not match')
    }
    const usernameUser = await this.usersRepository.findOne({where:{username:signUpUserDto.username}})
    if (usernameUser) {
      throw new BadRequestException('Username is Already available')
    }
    delete signUpUserDto.confirm_password;
    const salt = await bcrypt.genSalt()
    signUpUserDto.password = await bcrypt.hash(signUpUserDto.password, salt)
    let user = this.usersRepository.create(signUpUserDto);
    user = await this.usersRepository.save(user);
    return user;
  }

  async login(signInUserDto: SignInUserDto): Promise<User>{
    const userExists = await this.usersRepository.createQueryBuilder('users')
    .addSelect('users.password')
    .where('users.username= :username',{ username: signInUserDto.username })
    .getOne();
    if (!userExists) throw new BadRequestException('Invalid Credentials')
    const passwordIsValid = await bcrypt.compare(signInUserDto.password, userExists.password)
    if (!passwordIsValid) throw new BadRequestException('Invalid Credentials')
    // const IsActive
    return userExists;
  }

  async token_access(userentity:User): Promise<string>{
    return sign({id:userentity.id,username:userentity.username},process.env.TOKEN_ACCESS_SECRET_KEY,{expiresIn:process.env.TOKEN_ACCESS_EXPIRES});
  }

  async refresh_token(userentity:User): Promise<string>{
    return sign({ id: userentity.id, username: userentity.username },process.env.TOKEN_ACCESS_SECRET_KEY);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({where: {id:id}});
    if(!user) throw new NotFoundException("User not Found")
    return user;
  }

  async UpdateUserPass(id:number, options){
    return this.usersRepository.update(id, options)
  }

  async findUserByEmail(email:string){
    return await this.usersRepository.findOneBy({email})
  }

  async findUserByUsername(username:string){
    return await this.usersRepository.findOneBy({username})
  }

  async update(updateUserDto: UpdateUserDto, currentUser:User,): Promise<User> {
    const user = await this.findOne(currentUser.id);
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const userWithSameEmail = await this.usersRepository.findOne({ where :{email: updateUserDto.email} });
      if (userWithSameEmail && userWithSameEmail.id !== user.id) {
          throw new BadRequestException('Email is already in use');
      }
    }
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const userWithSameUsername = await this.usersRepository.findOne({ where: { username: updateUserDto.username } });
      if (userWithSameUsername && userWithSameUsername.id !== user.id) {
          throw new BadRequestException('Username is already in use');
      }
  }
    if(updateUserDto.password != updateUserDto.confirm_password){
      throw new BadRequestException('Confirm Passwords do not match')
    }
    delete updateUserDto.confirm_password;
    const salt = await bcrypt.genSalt()
    updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt)
    Object.assign(user,updateUserDto)
    return await this.usersRepository.save(user);
  }
}
