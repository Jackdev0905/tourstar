import { registerEnumType } from '@nestjs/graphql';

export enum MyBooked {
	PAUSED = 'PAUSED',
	PROCESS = 'PROCESS',
	FINISHED = 'FINISHED',
}
registerEnumType(MyBooked, {
	name: 'MyBooked',
});
