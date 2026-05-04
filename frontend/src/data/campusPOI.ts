// src/data/campusPOI.ts
// ─────────────────────────────────────────────────────────────────────────────
// Campus Points of Interest — Bowen University, Iwo, Osun State
// All coordinates verified against OpenStreetMap / Google Maps
// Add new locations as needed — they will auto-appear in search & map
// ─────────────────────────────────────────────────────────────────────────────

export interface POI {
  id:       string;
  name:     string;
  shortName?: string;       // optional short label for map marker
  category: POICategory;
  lat:      number;
  lng:      number;
  description?: string;
}

export type POICategory =
  | 'academic'
  | 'hostel'
  | 'food'
  | 'admin'
  | 'sports'
  | 'religious'
  | 'health'
  | 'gate'
  | 'other';

export const campusPOIs: POI[] = [
  // ── GATES ────────────────────────────────────────────────────────────────
  {
    id:          'gate-main',
    name:        'Bowen University Main Gate',
    shortName:   'Main Gate',
    category:    'gate',
    lat:         7.6212150531601015,
    lng:         4.190553487189928,
    description: 'Primary entrance to Bowen University',
  },

    // ── ACADEMIC ─────────────────────────────────────────────────────────────
    {
    id:          'dept',
    name:        'Department Of Music ',
    shortName:   'Department Of Music',
    category:    'academic',
    lat:         7.625136129614281,
    lng:         4.191875760931262,
    description: 'Department Of Music ',
    },
    {
    id:          'dept',
    name:        'Bowen University Performing Art Theatre',
    shortName:   'Performing Art Theatre',
    category:    'academic',
    lat:         7.625535105212177,
    lng:         4.19179981089141,
    description: 'Bowen University Performing Art Theatre',
    },
    {
    id:          'dept',
    name:        'Department Of Music ',
    shortName:   'Department Of Music',
    category:    'sports',
    lat:         7.625136129614281,
    lng:         4.191875760931262,
    description: 'Department Of Music ',
    },
    {
    id:          'dept',
    name:        'Department Of Music ',
    shortName:   'Department Of Music',
    category:    'sports',
    lat:         7.625136129614281,
    lng:         4.191875760931262,
    description: 'Department Of Music ',
},
  {
    id:          'dept',
    name:        'Department of Communication And Performing Arts',
    shortName:   'Communication & Performing Arts',
    category:    'academic',
    lat:         7.625471217766791,
    lng:         4.191755894790855,
    description: 'Department of Communication And Performing Arts',
  },

  {
  id:          'dept',
  name:        'Department of Chemistry and Industrial Chemistry',
  shortName:   'Chemistry & Industrial Chemistry',
  category:    'academic',
  lat:         7.622190993159984,
  lng:         4.203785076015844,
  description: 'Department of Chemistry and Industrial Chemistry',
},

{
  id:          'dept',
  name:        'College of Computing and Communication Studies',
  shortName:   'Computing & Communication Studies',
  category:    'academic',
  lat:         7.6215395125591865,
  lng:         4.2040689432141845,
  description: 'College of Computing and Communication Studies',
},

{
  id:          'dept',
  name:        'College of Social and Management Sciences',
  shortName:   'College of Social & Management Sciences',
  category:    'academic',
  lat:         7.621421846825818,
  lng:         4.202308889985465,
  description: 'College of Social and Management Sciences',
},

 {
   id:          'dept',
   name:        'Bowen Faculty of Law',
   shortName:   'Bowen Faculty of Law',
   category:    'academic',
   lat:          7.621076988974575,
   lng:         4.2055334754820075,
   description: 'Bowen Faculty of Law',
 },

 {
  id:          'dept',
  name:        'College of Health Sciences, Bowen University',
  shortName:   'College of Health Sciences, Bowen University',
  category:    'academic',
  lat:          7.6191608625370755,
  lng:         4.207216691846845,
  description: 'College of Health Sciences, Bowen University',
},

{
  id:          'dept',
  name:        'Physiology Department, Bowen University',
  shortName:   'Physiology Department',
  category:    'academic',
  lat:          7.618890402003763,
  lng:         4.2071995706540894,
  description: 'Physiology Department, Bowen University',
},

{
  id:          'dept',
  name:        'Agric Faculty',
  shortName:   'Agric Faculty',
  category:    'academic',
  lat:          7.622253333397827,
  lng:         4.206681658386545,
  description: 'Agric Faculty',
},

{
  id:          'dept',
  name:        'Department of Political Science and Law',
  shortName:   'Political Science and Law',
  category:    'academic',
  lat:          7.621395364925869,
  lng:         4.201820596899722,
  description: 'Department of Political Science and Law',
},

  {
    id:          'ict-centre',
    name:        'New Horizon',
    shortName:   'New Horizon',
    category:    'academic',
    lat:         7.622086395388646,
    lng:         4.1960933225869965,
    description: 'New Horizon Center',
  },
  {
    id:          'library',
    name:        'Bowen University Library (Timothy Olagbemiro)',
    shortName:   'Library',
    category:    'academic',
    lat:         7.619054069766914,
    lng:         4.201074715073106,
    description: 'Main university library',
  },
  {
    id:          'ict-centre',
    name:        'CBT Center',
    shortName:   'CBT Center',
    category:    'academic',
    lat:         7.623814409012425,
    lng:         4.192483797665192,
    description: 'Computer Examination Center',
  },

  // ── HOSTELS ───────────────────────────────────────────────────────────────
  {
    id:          'hostel-boys',
    name:        'Boys hostel - UPE 3',
    shortName:   'UPE 3',
    category:    'hostel',
    lat:         7.622382139963477,
    lng:         4.192026065341369,
    description: 'Male student hostel located near the main gate - UPE 3',
  },
  {
    id:          'hostel-boys1',
    name:        'Boys hostel - UPE 2',
    shortName:   'UPE 2',
    category:    'hostel',
    lat:         7.622834086157544,
    lng:         4.192106531610721,
    description: 'Male student hostel located near the main gate - UPE 2',
  },
  {
    id:          'hostel-girls',
    name:        'Girls hostel - UPE 1',
    shortName:   'UPE 1',
    category:    'hostel',
    lat:         7.623387054969519,
    lng:         4.192417667852217,
    description: 'Female student hostel located near the main gate - UPE 1',
  },
  {
    id:          'hostel-girls1',
    name:        'Girls hostel - Sadler',
    shortName:   'Sadler',
    category:    'hostel',
    lat:         7.62409777777998,
    lng:         4.193042070416604,
    description: 'Sadler Female Hostel',
  },
  {
    id:          'hostel-girls2',
    name:        'Girls hostel - Block',
    shortName:   'Block Hostel',
    category:    'hostel',
    lat:         7.626049874717736,
    lng:         4.192775263308408,
    description: 'Female student hostel — Block Hostel',
  },
  {
    id:          'hostel-girls3',
    name:        'Block A Hostel',
    shortName:   'Block A',
    category:    'hostel',
    lat:         7.627243993022501,
    lng:         4.19257599173433,
    description: 'Female student hostel - Block A hostel ',
  },
  {
  id:          'hostel-girls4',
  name:        'Block G Hostel',
  shortName:   'Block G',
  category:    'hostel',
  lat:         7.626630351459452,
  lng:         4.192710502653159,
  description: 'Female student hostel - Block G hostel ',
},
{
    id:          'hostel-girls5',
    name:        'Storey Hostel',
    shortName:   'Storey',
    category:    'hostel',
    lat:         7.627782190760336,
    lng:         4.191975747803458,
    description: 'Female student hostel - Storey Building hostel ',
},
{
    id:          'hostel-boys2',
    name:        'Mark Hall',
    shortName:   'Mark Hall',
    category:    'hostel',
    lat:         7.623804528296291,
    lng:         4.2039628536712295,
    description: 'Make student Hostel - Mark Hall ',
},
{
    id:          'hostel-boys3',
    name:        'John Hall',
    shortName:   'John Hall',
    category:    'hostel',
    lat:         7.624017689843217,
    lng:         4.2047974884771735,
    description: 'Male student Hostel - John Hall ',
},
{
    id:          'hostel-boys4',
    name:        'Luke Hall',
    shortName:   'Luke Hall',
    category:    'hostel',
    lat:         7.6238021606050275,
    lng:         4.204804657206343,
    description: 'Male student Hostel - Luke Hall',
},
{
    id:          'hostel-boys5',
    name:        'Mattew Hall',
    shortName:   'Mattew Hall',
    category:    'hostel',
    lat:         7.623636368047005,
    lng:         4.203979580705959,
    description: 'Male student Hostel - Mattew Hall ',
},
{
    id:          'hostel-boys6',
    name:        'NH boys (Gamaliel Onosode Hall)',
    shortName:   'NH boys',
    category:    'hostel',
    lat:         7.624107315973326,
    lng:         4.206416294911321,
    description: 'NH boys (Gamaliel Onosode Hall) ',
},
{
    id:          'hostel-girls6',
    name:        'NH girls Ademola Ishola',
    shortName:   'NH girls',
    category:    'hostel',
    lat:         7.617783930223185,
    lng:         4.203694088403214,
    description: 'NH girls (Ademola Ishola Hall) ',
},
{
    id:          'hostel-girls7',
    name:        'Bowen Smart Hostel (288 and 150)',
    shortName:   'Bowen Smart Hostel',
    category:    'hostel',
    lat:         7.617263781690854,
    lng:         4.20659652932801,
    description: 'Bowen Smart Hostel (288 and 150) ',
},



  // ── Cabside/Walking Park/Toilet Building ──────────────────────────────────────────────────────────
  {
    id:          'cabside',
    name:        'Cabside Old Site',
    shortName:   'Cabside 1',
    category:    'other',
    lat:         7.6255067469028734,
    lng:         4.193782850159826,
    description: 'Cabside Old Site',
},
{
    id:          'toilet',
    name:        'Chapel Toilet',
    shortName:   'Chapel Toilet',
    category:    'other',
    lat:         7.620086195023413,
    lng:         4.203538257683886,
    description: 'Chapel Toilet',
},
{
    id:          'radio-station',
    name:        'Bowen Radio 101.9 FM',
    shortName:   'Bowen Radio 101.9 FM',
    category:    'other',
    lat:         7.6214533940271805,
    lng:         4.203168819053362,
    description: 'Bowen Radio 101.9 FM',
},
{
    id:          'substation',
    name:        'Bowen Power Substation',
    shortName:   'Bowen Power Substation',
    category:    'other',
    lat:         7.622692886383841,
    lng:         4.1997688680397305,
    description: 'Bowen Power Substation',
},
{
    id:          'school',
    name:        'Bowen University Staff School',
    shortName:   'Bowen Staff School',
    category:    'other',
    lat:         7.62663960010711,
    lng:         4.191624022957971,
    description: 'Bowen University Staff School',
},
{
    id:          'school',
    name:        'Bowen University International School',
    shortName:   'Bowen University International School',
    category:    'other',
    lat:         7.624831706310616,
    lng:         4.190002099701546,
    description: 'Bowen University International School',
},
{
    id:          'farm',
    name:        'Farm house',
    shortName:   'Farm house',
    category:    'other',
    lat:         7.623556134955069,
    lng:         4.193254282474476,
    description: 'Farm house',
},
{
    id:          'outlet',
    name:        'Osas Brands Bowen Outlet',
    shortName:   'Osas Brands Bowen Outlet',
    category:    'other',
    lat:         7.62483322203672,
    lng:         4.193499596960087,
    description: 'Osas Brands Bowen Outlet',
},

{
    id:          'outlet',
    name:        'Beauty by Myra (Bupaf side)',
    shortName:   'Beauty by Myra',
    category:    'other',
    lat:         7.618442072716023,
    lng:         4.201434594761022,
    description: 'Beauty by Myra (Bupaf side)',
},

{
    id:          'park',
    name:        'Walking park (New site)',
    shortName:   'Walking park',
    category:    'other',
    lat:         7.619165707033225,
    lng:         4.203538564452921,
    description: 'Walking park (New site)',
},


  // ── FOOD & SHOPS ──────────────────────────────────────────────────────────
  {
    id:          'cafeteria',
    name:        'Kemi Bee Cafeteria',
    shortName:   'Kemi Bee',
    category:    'food',
    lat:         7.624740162539664,
    lng:         4.193292369095619,
    description: 'Kemi Bee Cafeteria - Affordable student food stalls',
  },
  {
    id:          'cafeteria1',
    name:        'Divine Cafe (Oungbona) Cafeteria',
    shortName:   'Divine Cafe',
    category:    'food',
    lat:         7.624635138225803,
    lng:         4.193440580610336,
    description: 'Divine Cafe (Oungbona) Cafeteria - Affordable student food stalls',
  },
  {
    id:          'cafeteria2',
    name:        'Sumptuous Cafetaria',
    shortName:   'Sumptuous',
    category:    'food',
    lat:         7.625896300265839,
    lng:         4.192333670448269,
    description: 'Sumptuous Cafetaria - Affordable student food stalls',
  },
  {
  id:          'cafeteria3',
  name:        'Blessed Cafe',
  shortName:   'Blessed Cafe',
  category:    'food',
  lat:         7.622977464293937,
  lng:         4.205268033716404,
  description: 'Blessed Cafe - Affordable student food stalls',
},
{
  id:          'cafeteria4',
  name:        'Y2K Cafetaria',
  shortName:   'Y2K Cafe',
  category:    'food',
  lat:         7.622578597521572,
  lng:         4.205277177238811,
  description: 'Y2K Cafetaria - Affordable student food stalls',
},
{
  id:          'cafeteria5',
  name:        'Buwa Cafetaria',
  shortName:   'Buwa Cafe',
  category:    'food',
  lat:         7.622517940915883,
  lng:         4.205503950359968,
  description: 'Buwa Cafetaria - Affordable student food stalls',
},
{
  id:          'cafeteria6',
  name:        'Christoy Cafe',
  shortName:   'Christoy',
  category:    'food',
  lat:         7.6180553222629515,
  lng:         4.2024112088836105,
  description: 'Christoy Cafe - Affordable student snacks and drink/icecream stalls',
},
{
  id:          'cafeteria7',
  name:        'Jubilee Cafe',
  shortName:   'Jubilee',
  category:    'food',
  lat:         7.618157039900834,
  lng:         4.202641265788344,
  description: 'Jubilee Cafe- Affordable student food stalls',
},
{
  id:          'cafeteria8',
  name:        'BBSF Cafetaria',
  shortName:   'BBSF',
  category:    'food',
  lat:         7.619494893451556,
  lng:         4.205879656403949,
  description: 'BBSF Cafetaria - Affordable student food stalls',
},

    // ── BOOKSHOP (Adjust the longitude and latitude) ────────────────────────────────────────────────────────────────

    {
  id:          'bookshop',
  name:        'Bowen University Bookshop',
  shortName:   'Bookshop',
  category:    'academic',
  lat:         7.625896300265839,
  lng:         4.192333670448269,
  description: 'Bowen University Bookshop - Academic and general books',
},

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  {
    id:          'senate-building',
    name:        'Senate(Main) Administration Building',
    shortName:   'Senate Block',
    category:    'admin',
    lat:         7.621896477051703,
    lng:         4.200801951213831,
    description: 'Senate Chamber ',
  },
  {
    id:          'Old Admin building',
    name:        'Old Admin Building',
    shortName:   'Old Admin',
    category:    'admin',
    lat:         7.623475533738776,
    lng:         4.189509519054507,
    description: 'Old administration building housing various offices',
  },
  {
    id:          "Vice Chancellor's building",
    name:        "Vice Chancellor's Building",
    shortName:   "VC's building",
    category:    'admin',
    lat:         7.623304613106539,
    lng:         4.1909679547722485,
    description: 'Vice Chancellor’s office and administrative headquarters',
  },
  {
  id:          "Bowen University Guest House",
  name:        "Bowen University Guest House",
  shortName:   "Guest House",
  category:    'admin',
  lat:         7.6215714229822344,
  lng:         4.198235713504577,
  description: 'Bowen University Guest House - Accommodation for visitors and guests',
},

  // ── HEALTH ────────────────────────────────────────────────────────────────
  {
    id:          'health-centre',
    name:        'Bowen University Clinic',
    shortName:   'Clinic',
    category:    'health',
    lat:         7.625630457813526,
    lng:         4.190807397009521,
    description: 'Medical facility for students and staff',
  },

  // ── RELIGIOUS ─────────────────────────────────────────────────────────────
  {
    id:          'chapel',
    name:        'Bowen University Worship Center (Chapel)',
    shortName:   'Chapel',
    category:    'religious',
    lat:         7.619976236791676,
    lng:         4.202386890980859,
    description: 'Main worship centre on campus',
  },
  {
  id:          'chapel',
  name:        'Old Alma Rhom Chapel',
  shortName:   'Alma Rhom Chapel',
  category:    'religious',
  lat:         7.624260111135714,
  lng:         4.190184953847593,
  description: 'Old Alma Rhom Chapel',
},

  // ── SPORTS ───────────────────────────────────────────────────────────────
  {
    id:          'Football Field (Old site)',
    name:        'Football Field (Old site)',
    shortName:   'Football Field',
    category:    'sports',
    lat:         7.6246868947633,
    lng:         4.192501077115162,
    description: 'Football pitch, basketball courts, and volleyball courts',
  },

    // ── Halls ───────────────────────────────────────────────────────────────

  {
  id:          "halls",
  name:        "BACOSA Building",
  shortName:   "BACOSA building",
  category:    'admin',
  lat:         7.624101361034257,
  lng:         4.191791632842637,
  description: 'Vice Chancellor’s office and administrative headquarters',
},
 {
   id:          'halls',
   name:        'New Lecture Theatre(Old Site)',
   shortName:   'NLT(Old Site)',
   category:    'academic',
   lat:          7.6261604482917935,
   lng:         4.192070264176971,
   description: 'New Lecture Theatre (Old Site)',
 },
 {
  id:          'halls',
  name:        'Olaosebikan Lecture Hall',
  shortName:   'Olaosebikan Lecture Hall',
  category:    'academic',
  lat:         7.623814409012425,
  lng:         4.192483797665192,
  description: 'Sciences, Math & Computer Science departments',
},
{
  id:          'halls',
  name:        'AGA Lecture Hall',
  shortName:   'AGA Lecture Hall',
  category:    'academic',
  lat:         7.625758266554455,
  lng:         4.1919157781003715,
  description: 'AGA Lecture Hall',
},
 {
   id:          'halls',
   name:        'New Lecture Theatre(Old Site)',
   shortName:   'NLT(Old Site)',
   category:    'academic',
   lat:          7.6261604482917935,
   lng:         4.192070264176971,
   description: 'New Lecture Theatre (Old Site)',
 },
  {
   id:          'halls',
   name:        'Chris Alabi Lecture Theatre',
   shortName:   'Chris Alabi Lecture Theatre',
   category:    'academic',
   lat:          7.621563387975949,
   lng:         4.202142133280826,
   description: 'Chris Alabi Lecture Theatre',
 },


];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Search POIs by name (case-insensitive) */
export const searchPOIs = (query: string): POI[] => {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return campusPOIs.filter(
    p =>
      p.name.toLowerCase().includes(q) ||
      p.shortName?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
  );
};

/** Get all POIs in a category */
export const getPOIsByCategory = (category: POICategory): POI[] =>
  campusPOIs.filter(p => p.category === category);

/** Get a single POI by id */
export const getPOIById = (id: string): POI | undefined =>
  campusPOIs.find(p => p.id === id);

/** Category display labels */
export const categoryLabels: Record<POICategory, string> = {
  academic:  'Academic',
  hostel:    'Hostels',
  food:      'Food & Shops',
  admin:     'Administration',
  sports:    'Sports',
  religious: 'Religious',
  health:    'Health',
  gate:      'Gates',
  other:     'Other',
};

/** Category emoji icons for map markers */
export const categoryIcons: Record<POICategory, string> = {
  academic:  '🎓',
  hostel:    '🏠',
  food:      '🍽️',
  admin:     '🏛️',
  sports:    '⚽',
  religious: '⛪',
  health:    '🏥',
  gate:      '🚪',
  other:     '📍',
};