import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
class UserSch
{
    @Prop({ required: true })
    userId: string;
}

export const UserSchema = SchemaFactory.createForClass(UserSch);