import { Controller, Post, Body, BadRequestException, NotFoundException } from '@nestjs/common';
import { ResetService } from './reset.service';
import { MailerService } from '@nestjs-modules/mailer';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Controller()
export class ResetController {
  constructor(private resetService: ResetService, private mailerService: MailerService, private userService: UsersService) {}

  @Post('forgot')
  async forgotPassword(@Body('email') email: string) {
    const token = Math.random().toString(20).substring(2, 12); // generate random token for password recovery
    await this.resetService.save({
      token,
      email
    });

    const url = `http://localhost/3000/reset/${token}`; // TODO: add real URL to redirect user after clicking on the link
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset',
      html: `<a href="${url}">Click here to reset your password</a>`
    });
    return {message: `A link to reset your password has been sent to ${email}`}
  }

  @Post('reset')
  async resetPassword(@Body('token') token: string, @Body('password') password: string, @Body('confirm_password') confirm_password: string) {
    if(password != confirm_password) throw new BadRequestException("Passwords do not match");
    const reset = await this.resetService.findOne(token);
    if(!reset) throw new NotFoundException(`Invalid or expired token`);
    const user = await this.userService.findUserByEmail(reset.email)
    if(!user) throw new NotFoundException(`Account with the email does not exist`);
    await this.userService.UpdateUserPass(user.id, {password: await bcrypt.hash(password, 12)});
    return {message: "Password reset successfully"}
  }

}
