import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schema/user.schema';
import { Event } from '../schema/event.schema';
import * as bcrypt from 'bcrypt';
import { EventCompensation } from 'src/schema/eventCompensation.schema';

@Injectable()
export class AuthService {
  constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Event.name) private eventModel: Model<Event>,
        @InjectModel(EventCompensation.name) private eventCompensationModel: Model<EventCompensation>,
        private jwtService: JwtService,
  ) {}

    //회원가입
    async register(username: string, password: string, role:string, mission: {missionname: string; missionstatus: string, misssioncondition: string }[]) {
        const hash = await bcrypt.hash(password, 10);
        const user = new this.userModel({ username, password: hash, role, mission });
        return user.save();
    }

    //로그인
    async login(username: string, password: string) {
        const user = await this.userModel.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { username: user.username, sub: user._id, role: user.role };
        return { access_token: this.jwtService.sign(payload) };
    }
    
    //이벤트 신규등록
    async eventRegistration(username: string, eventname: string, valueSuccess: string) {
        const roles = (await this.userModel.findOne({ username }).select('role'))?.role;
        
        if (roles == 'admin' || roles == 'operator') {
            const event = await this.eventModel.create({
                username: username,  
                eventname: eventname,
                valueSuccess: valueSuccess,
                date: new Date(),
            });
            return event;
        } else {
            return { error: "권한이 없습니다."};
        }
    }

    //이벤트신규 보상등록
    async eventCompensation(username: string, eventname: string, compensation: { name: string; quantity: string }[]) {
        const roles = (await this.userModel.findOne({ username }).select('role'))?.role;
        const event = await this.eventModel.findOne({ eventname }).select('eventname').lean() as { eventname: string } | null;
        console.log(event?.eventname);

        const eventCompensation = await this.eventCompensationModel.findOne({ eventname }).select('eventname').lean() as { eventname: string } | null;
        const eventCompensationname = await this.eventCompensationModel
                                        .findOne({ eventname })
                                        .select('eventname compensation') // compensation 필드 추가 선택
                                        .lean() as { eventname: string; compensation: { name: string; quantity: string }[] };

        if (roles == 'admin' || roles == 'operator') {
            if (event?.eventname == eventname && eventCompensation?.eventname == null) {
                const event = await this.eventCompensationModel.create({
                    username: username,
                    eventname: eventname,
                    compensation: compensation, //{보상이름,보상수량}
                    date: new Date()
                });
                return event;
            } else if (eventCompensation?.eventname == eventname && eventCompensation?.eventname != null) {
                // const nameList = compensation.map(c => c.name);
                const compensationList = eventCompensationname.compensation; // 전체 compensation 배열
                const nameList = compensationList.map(c => c.name); // name 값만 추출

                //입력된 값
                const inputList = compensation;  
                const inputNames = inputList.map(c => c.name);

                // 등록된 것과 입력된 것 합치기
                const combinedNames = [...nameList, ...inputNames];

                // 중복 있는지 체크
                const hasDuplicate = combinedNames.length !== new Set(combinedNames).size;

                if (hasDuplicate){
                    return "보상이름이 중복되었습니다.";
                }

                const event = await this.eventCompensationModel.updateOne(
                    { username: username, eventname: eventname },
                    { $push: { compensation: compensation } }, 
                    { $set: { date: new Date() } }
                );
                return event;
            } else if (event?.eventname != eventname){
                return { error: "등록된 이벤트가 없습니다." };
            }
        } else {
            return { error: "권한이 없습니다."};
        }
    }

    //이벤트목록 조회
    async eventSelectList(username: string){
        const user = (await this.userModel.findOne({ username }).select('role'))?.role;
        console.log(user);
        if (!user) {
            return { error: 'User not found'};
        }
        if (user =='admin') {
            return await this.eventModel.find();
        } else {
            return await this.eventModel.find({ username });
        }
    }

    //사용자 이벤트 참여
    async eventUserParticipation(username: string, eventname: string, mission: { missionname: string, valueStatus: string, missionstatus: string, misssioncondition: string }[]) {
        console.log("이벤트 참여 유저가 ");
        const user = await this.userModel.findOne({ username });
        console.log(username);

        if (!user) {
            throw new Error("유저가 존재하지 않습니다.");
        }
        const existingMissions = user?.mission || [];

        for (const missionUpdate of mission) {
            // 기존 미션 중 missionname이 같은 항목 찾기
            const existingIndex = existingMissions.findIndex(m => m.missionname === missionUpdate.missionname);

            if (existingIndex >= 0) {
                // 중복 missionname 있으면 업데이트
                existingMissions[existingIndex] = {
                ...existingMissions[existingIndex],
                ...missionUpdate,
                }
            } else {
                if (user?.username == username) {
                    const event = await this.userModel.updateOne(
                        { username: username},
                        { $push: { mission: { $each: mission } } }
                    );
                    return event;
                }
            }
        }
          // 3. 수정된 미션 배열 DB에 한 번에 업데이트
        const updateResult = await this.userModel.updateOne(
            { username },
            { mission: existingMissions }
        );
        return updateResult;
    }

    //유저 보상 요청
    async userEventCompensation(username: string, eventname:string, valueStatus: string) {
        const user = await this.userModel.findOne({ username });
        const event = await this.eventModel.findOne({ eventname });
        const missionNames = user?.mission.map(c => c.missionname) || [];
        const missionValseStatus = user?.mission.map(c => c.missionstatus) || [];
        const targetMission = user?.mission.find(m => m.missionname === eventname);
                
        if (missionNames.includes(eventname)) {
            if (targetMission?.missionstatus.toLowerCase() === "false") {
                console.log("미션 진행 필요 (false 상태)");
                
                    if (event?.valueSuccess == valueStatus) {
                        const sueecss = user?.mission.map(c => c.valueStatus);
                        if (sueecss?.includes(valueStatus)) {
                            console.log("test5");
                            const result = await this.userModel.updateOne(
                                { username: username },
                                { $set: { "mission.$[elem].missionstatus": "True" } },
                                {
                                    arrayFilters: [
                                        { "elem.missionname": eventname }  // eventname에 해당하는 mission만 대상
                                    ]
                                }
                            );
                            return result;
                        }
                    }else {
                        console.log("아직 값이 부족합니다.")
                        return { error: "아직 값이 부족합니다." };
                    }
                } else {
                // 넘어가기
                console.log("이미 완료된 미션 (true 상태)");
                return { error: "이미 받은 미션보상입니다." };
            }
        } else {
                console.log("해당 미션 없음");
                return { error: "해당 미션 없음" };
            
            }
        
        //valueStatus 값이 event의 valueStatus 값이랑 동일한지 체크
    }

    async validateUser(userId: string) {
        return this.userModel.findById(userId).select('-password');
    }
}
