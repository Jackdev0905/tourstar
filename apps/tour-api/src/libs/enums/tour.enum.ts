import { registerEnumType } from '@nestjs/graphql';

export enum TourType {
	CITY = 'CITY',
	BEACH = 'BEACH',
	CULTURE = 'CULTURE',
	CRUISES = 'CRUISES',
	HIKING = 'HIKING',
	NATURE = 'NATURE',
}
registerEnumType(TourType, {
	name: 'TourType',
});

export enum TourStatus {
	ACTIVE = 'ACTIVE',
	SOLD = 'SOLD',
	DELETE = 'DELETE',
}
registerEnumType(TourStatus, {
	name: 'TourStatus',
});


export enum TourLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	GYEONGJU = 'GYEONGJU',
	GWANGJU = 'GWANGJU',
	CHONJU = 'CHONJU',
	DAEJON = 'DAEJON',
	JEJU = 'JEJU',
}
registerEnumType(TourLocation, {
	name: 'TourLocation',
});

export enum TourActivities {
  CULTURE = 'CULTURE',
  FOOD = 'FOOD',
  NATURE = 'NATURE',
  CITY = 'CITY',
  ENTERTAINMENT = 'ENTERTAINMENT',
  SHOPPING = 'SHOPPING',
  PHOTO = 'PHOTO',
  FAMILY = 'FAMILY',
  HISTORICAL = 'HISTORICAL',
  ADVENTURE = 'ADVENTURE',
  RELAX = 'RELAX',
  NIGHT = 'NIGHT',
  FESTIVAL = 'FESTIVAL',
}

registerEnumType(TourActivities, {
  name: 'TourActivities',
});

export enum TourLanguage {
  KOREAN = 'KOREAN',
  ENGLISH = 'ENGLISH',
  CHINESE = 'CHINESE',
  JAPANESE = 'JAPANESE',
  RUSSIAN = 'RUSSIAN',
  UZBEK = 'UZBEK',
}

registerEnumType(TourLanguage, {
  name: 'TourLanguage',
});

export enum AudienceType {
  SOLO = 'SOLO',
  COUPLE = 'COUPLE',
  FAMILY = 'FAMILY',
  GROUP = 'GROUP',
  SENIOR = 'SENIOR',
}

registerEnumType(AudienceType, {
  name: 'AudienceType',
});

export enum TourDurationType {
  SHORT = 'SHORT',           // < 4 soat
  HALF_DAY = 'HALF_DAY',     // ~4–6 soat
  FULL_DAY = 'FULL_DAY',     // 6–10 soat
  MULTI_DAY = 'MULTI_DAY',   // 2+ kun
}

registerEnumType(TourDurationType, {
  name: 'TourDurationType',
});

export enum TourIncludedOption {
  TRANSPORT = 'TRANSPORT',
  GUIDE = 'GUIDE',
  MEALS = 'MEALS',
  ENTRANCE_FEES = 'ENTRANCE_FEES',
  ACCOMMODATION = 'ACCOMMODATION',
}
registerEnumType(TourIncludedOption, { name: 'TourIncludedOption' });
