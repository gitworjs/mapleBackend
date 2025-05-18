import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class EventCompensation extends Document {
    @Prop({ required: true })
    username: string;

    @Prop({ required: true, unique: true  })
    eventname: string;

    @Prop({
      type: [{
        name: { type: String, required: true },
        quantity: { type: String, required: true },
      }],
      required: true,
    })
    compensation: { name: string; quantity: string }[];

    @Prop({ required: true })
    date: Date;
}

export const EventCompensationSchema = SchemaFactory.createForClass(EventCompensation);
