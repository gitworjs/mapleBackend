import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Event extends Document {
    @Prop({ required: true })
    username: string;

    @Prop({ required: true, unique: true  })
    eventname: string;

    @Prop({ required: true })
    valueSuccess: string;

    @Prop({ required: true })
    date: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
