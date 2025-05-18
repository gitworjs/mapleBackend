import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    password: string;

    /*
    역할 
    user 사용자 
    operator 이벤트/보상 등록
    auditor 보상이력 조회만 가능
    admin 모든기능 접근 가능
    */
    @Prop({ required: true })
    role: string;

    @Prop({
      type: [{
        missionname: { type: String },
        missionstatus: { type: String },
        valueStatus:{type: String},
        misssioncondition: { type: String }
      }],
      required: true,
    })
    mission: { missionname: string; missionstatus: string, valueStatus: string, misssioncondition: string}[];
}

export const UserSchema = SchemaFactory.createForClass(User);
