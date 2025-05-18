import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    //유저등록
    @Post('userRegister')
    register(@Body() body: { username: string; password: string, role: string, mission: { missionname: string; missionstatus: string, misssioncondition: string }[] }) {
        return this.authService.register(
            body.username,
            body.password,
            body.role,
            body.mission
        );
    }

    //유저로그인, 토큰 확인
    @Post('userLogin')
    login(@Body() body: { username: string; password: string }) {
        return this.authService.login(body.username, body.password);
    }


    //이벤트 등록
    @UseGuards(JwtAuthGuard)
    @Post('eventRegistration')
    eventRegistration(@Body() body: { username: string; eventname: string, valueSuccess: string }) {
        return this.authService.eventRegistration(
            body.username,
            body.eventname,
            body.valueSuccess
        );
    }

    //이벤트목록 조회
    @UseGuards(JwtAuthGuard)
    @Post('eventSelectList')
    eventSelectList(@Body() body: { username: string; password: string }) {
        return this.authService.eventSelectList(
            body.username
        );
    }

    //이벤트 보상등록
    @UseGuards(JwtAuthGuard)
    @Post('eventCompensation')
    eventCompensation(@Body() body: { username: string; eventname: string; compensation:{ name: string; quantity: string }[]}) {
        return this.authService.eventCompensation(
            body.username,
            body.eventname,
            body.compensation
        );
    }

    //이벤트 유저참여
    @UseGuards(JwtAuthGuard)
    @Post('eventUserParticipation')
    eventUserParticipation(@Body() body: { username: string; eventname: string; mission: { missionname: string; missionstatus: string, valueStatus: string, misssioncondition: string }[]}) {
        return this.authService.eventUserParticipation(
            body.username,
            body.eventname,
            body.mission
        );
    }

    //이벤트보상 목록조회 


    //유저 보상 요청
    @UseGuards(JwtAuthGuard)
    @Post('userCompensation')
    userEventCompensation(@Body() body: { username: string; eventname: string; valueStatus: string; }) {
        return this.authService.userEventCompensation(
            body.username,
            body.eventname,
            body.valueStatus
        )
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@Req() req) {
        return req.user;
  }
}
