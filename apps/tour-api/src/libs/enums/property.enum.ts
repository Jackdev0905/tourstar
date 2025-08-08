import { registerEnumType } from '@nestjs/graphql';

export enum PropertyType {
	CITY = 'CITY',
	BEACH = 'BEACH',
	CULTURE = 'CULTURE',
	CRUISES = 'CRUISES',
	HIKING = 'HIKING',
	NATURE = 'NATURE',
}
registerEnumType(PropertyType, {
	name: 'PropertyType',
});

export enum PropertyStatus {
	ACTIVE = 'ACTIVE',
	SOLD = 'SOLD',
	DELETE = 'DELETE',
}
registerEnumType(PropertyStatus, {
	name: 'PropertyStatus',
});


export enum PropertyLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	GYEONGJU = 'GYEONGJU',
	GWANGJU = 'GWANGJU',
	CHONJU = 'CHONJU',
	DAEJON = 'DAEJON',
	ULSAN = 'ULSAN',
	JEJU = 'JEJU',
}
registerEnumType(PropertyLocation, {
	name: 'PropertyLocation',
});

export enum PropertyActivities {
  HIKING = 'HIKING',
  SWIMMING = 'SWIMMING',
  CYCLING = 'CYCLING',
  SKIING = 'SKIING',
  CAMPING = 'CAMPING',
  SIGHTSEEING = 'SIGHTSEEING',
  SHOPPING = 'SHOPPING',
  DINING = 'DINING',
  BOATING = 'BOATING',
  RELAXATION = 'RELAXATION',
  ADVENTURE = 'ADVENTURE',
  FITNESS = 'FITNESS',
}

registerEnumType(PropertyActivities, {
  name: 'PropertyActivities',
});

export enum PropertyLanguage {
  KOREAN = 'KOREAN',
  ENGLISH = 'ENGLISH',
  CHINESE = 'CHINESE',
  JAPANESE = 'JAPANESE',
  RUSSIAN = 'RUSSIAN',
  UZBEK = 'UZBEK',
}

registerEnumType(PropertyLanguage, {
  name: 'PropertyLanguage',
});

export enum PropertyTargetAudience {
  FAMILIES = 'FAMILIES',
  COUPLES = 'COUPLES',
  BACKPACKERS = 'BACKPACKERS',
  SOLO_TRAVELERS = 'SOLO_TRAVELERS',
  BUSINESS_TRAVELERS = 'BUSINESS_TRAVELERS',
  SENIORS = 'SENIORS',
  STUDENTS = 'STUDENTS',
  LUXURY_TRAVELERS = 'LUXURY_TRAVELERS',
  ADVENTURE_SEEKERS = 'ADVENTURE_SEEKERS',
  ECO_TOURISTS = 'ECO_TOURISTS',
}

registerEnumType(PropertyTargetAudience, {
  name: 'PropertyTargetAudience',
});

// export enum PropertyDuration {
//   SHORT = 'SHORT',           // < 4 soat
//   HALF_DAY = 'HALF_DAY',     // ~4–6 soat
//   FULL_DAY = 'FULL_DAY',     // 6–10 soat
//   MULTI_DAY = 'MULTI_DAY',   // 2+ kun
// }

// registerEnumType(PropertyDuration, {
//   name: 'PropertyDuration',
// });

export enum PropertyIncludedOption {
  TRANSPORT = 'TRANSPORT',
  GUIDE = 'GUIDE',
  MEALS = 'MEALS',
 	ENTRY_FEE = 'ENTRY_FEE',
 	HOTEL = 'HOTEL',
  INSURANCE = 'INSURANCE',
  DRINKS = 'DRINKS',
  EQUIPMENT = 'EQUIPMENT', // e.g., ski gear, snorkel, etc.
  WIFI = 'WIFI',
  PARKING = 'PARKING',
}

registerEnumType(PropertyIncludedOption, { name: 'PropertyIncludedOption' });
