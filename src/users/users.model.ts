import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UsersSch {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  confirmPassword: string;
}

export const UsersSchema = SchemaFactory.createForClass(UsersSch);
