import hypercubeGenerator from './hypercube-generator';

const cities = [
  'Abu Dhabi',
  'Abuja',
  'Accra',
  'Adamstown',
  'Addis Ababa',
  'Algiers',
  'Alofi',
  'Amman',
  'Amsterdam',
  'Andorra la Vella',
  'Ankara',
  'Antananarivo',
  'Apia',
  'Ashgabat',
  'Asmara',
  'Astana',
  'Asunción',
  'Athens',
  'Avarua',
  'Baghdad',
  'Baku',
  'Bamako',
  'Bandar Seri Begawan',
  'Bangkok',
  'Bangui',
  'Banjul',
  'Basse-Terre',
  'Basseterre',
  'Beijing',
  'Beirut',
  'Belgrade',
  'Belmopan',
  'Berlin',
  'Bern',
  'Bishkek',
  'Bissau',
  'Bogotá',
  'Brasília',
  'Bratislava',
  'Brazzaville',
  'Bridgetown',
  'Brussels',
  'Bucharest',
  'Budapest',
  'Buenos Aires',
  'Bujumbura',
  'Cairo',
  'Canberra',
  'Caracas',
  'Castries',
  'Cayenne',
  'Charlotte Amalie',
  'Chișinău',
  'Cockburn Town',
  'Conakry',
  'Copenhagen',
  'Dakar',
  'Damascus',
  'Dhaka',
  'Dili',
  'Djibouti',
  'Dodoma',
  'Doha',
  'Douglas',
  'Dublin',
  'Dushanbe',
  'Edinburgh of the Seven Seas',
  'El Aioun',
  'Episkopi Cantonment',
  'Flying Fish Cove',
  'Fort-de-France',
  'Freetown',
  'Funafuti',
  'Gaborone',
  'George Town',
  'Georgetown',
  'Georgetown',
  'Gibraltar',
  'Grozny',
  'Guatemala City',
  'Gustavia',
  'Hagåtña',
  'Hamilton',
  'Hanga Roa',
  'Hanoi',
  'Harare',
  'Hargeisa',
  'Havana',
  'Helsinki',
  'Hong Kong',
  'Honiara',
  'Islamabad',
  'Jakarta',
  'Jamestown',
  'Jerusalem',
  'Juba',
  'Kabul',
  'Kampala',
  'Kathmandu',
  'Kiev',
  'Kigali',
  'King Edward Point',
  'Kingston',
  'Kingston',
  'Kingstown',
  'Kinshasa',
  'Kuala Lumpur',
  'Kuwait City',
  'Libreville',
  'Lilongwe',
  'Lima',
  'Lisbon',
  'Ljubljana',
  'Lomé',
  'London',
  'Luanda',
  'Lusaka',
  'Luxembourg',
  'Madrid',
  'Majuro',
  'Malabo',
  'Malé',
  'Mamoudzou',
  'Managua',
  'Manama',
  'Manila',
  'Maputo',
  'Marigot',
  'Maseru',
  'Mata-Utu',
  'Mbabane',
  'Mexico City',
  'Minsk',
  'Mogadishu',
  'Monaco',
  'Monrovia',
  'Montevideo',
  'Moroni',
  'Moscow',
  'Muscat',
  'Nairobi',
  'Nassau',
  'Naypyidaw',
  "N'Djamena",
  'New Delhi',
  'Ngerulmud',
  'Niamey',
  'Nicosia',
  'Nicosia',
  'Nouakchott',
  'Nouméa',
  'Nukuʻalofa',
  'Nuuk',
  'Oranjestad',
  'Oslo',
  'Ottawa',
  'Ouagadougou',
  'Pago Pago',
  'Palikir',
  'Panama City',
  'Papeete',
  'Paramaribo',
  'Paris',
  'Philipsburg',
  'Phnom Penh',
  'Plymouth',
  'Podgorica',
  'Port Louis',
  'Port Moresby',
  'Port Vila',
  'Port-au-Prince',
  'Port of Spain',
  'Porto-Novo',
  'Prague',
  'Praia',
  'Pretoria',
  'Pristina',
  'Pyongyang',
  'Quito',
  'Rabat',
  'Ramallah',
  'Reykjavík',
  'Riga',
  'Riyadh',
  'Road Town',
  'Rome',
  'Roseau',
  'Saint-Denis',
  'Saipan',
  'San José',
  'San Juan',
  'San Marino',
  'San Salvador',
  "Sana'a",
  'Santiago',
  'Santo Domingo',
  'São Tomé',
  'Sarajevo',
  'Singapore',
  'Skopje',
  'Sofia',
  'Sri Jayawardenepura Kotte',
  "St. George's",
  'St. Helier',
  "St. John's",
  'St. Peter Port',
  'St. Pierre',
  'Stanley',
  'Stepanakert',
  'Stockholm',
  'Sucre',
  'Sukhumi',
  'Suva',
  'Taipei',
  'Tallinn',
  'Tarawa',
  'Tashkent',
  'Tbilisi',
  'Tegucigalpa',
  'Tehran',
  'Thimphu',
  'Tirana',
  'Tiraspol',
  'Tokyo',
  'Tórshavn',
  'Tripoli',
  'Tskhinvali',
  'Tunis',
  'Ulaanbaatar',
  'Vaduz',
  'Valletta',
  'The Valley',
  'Vatican City',
  'Victoria',
  'Vienna',
  'Vientiane',
  'Vilnius',
  'Warsaw',
  'Washington, D.C.',
  'Wellington',
  'West Island',
  'Willemstad',
  'Windhoek',
  'Yamoussoukro',
  'Yaoundé',
  'Yaren',
  'Yerevan',
  'Zagreb',
];

const teamNames = [
  'City',
  'United',
  'Bears',
  'Cowboys',
  'Rookies',
  'Tigers',
  'Lions',
  'Bunnies',
  'Leafs',
  'Hawks',
  'Lazors',
  "Sharks with frickin' laser beams",
  'Bulldogs',
  'Sharks',
  'Eagles',
  'Redskins',
  'Rangers',
  'Owls',
  'Spikes',
  'Quakers',
  'Saints',
  'Seals',
  'Shrimps',
  'Vikings',
  'Wolves',
  'Seagulls',
  'Glassboys',
  'Daggers',
  'Addicks',
  'Beavers',
  'Swans',
  'Meat Commission',
  'and the Gang',
  'Chefs',
  'Pigs',
  'Titans',
  'Buccaneers',
  'Broncos',
  'Chargers',
  'Packers',
  '49ers',
  'Lakers',
  'Patriots',
  'Jets',
  'Red Sox',
  'Texans',
  'Ravens',
  'Golden Knights',
];

const sportsAbbreviations = [
  'FC',
  'Club',
  'FCB',
  'BC',
  'Soccer Club',
  'SC',
  'Football Club',
  'Ball Club',
  'HC',
  'Hockey Club',
  'AC',
  'Athletic Club',
];

const alphabetUpperCase = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

const alphabetLowerCase = alphabetUpperCase.map((a) => a.toLowerCase());

function dataRangePointCallback(strings, dimensions, dataRange) {
  const dataRangeMultipler = dataRange[1] - dataRange[0];
  return (x) => (x < dimensions ? strings.pop() : Math.random() * dataRangeMultipler + dataRange[0]);
}

function stringsRowCallback(dimensions, sorted) {
  return (r) => {
    let strings = [];
    if (sorted) {
      strings = r.splice(0, dimensions);
      r.sort((a, b) => a - b);
    }

    return strings.concat(r);
  };
}

function sortTableAlphabetically(table) {
  const data = table;
  const defs = data.splice(0, 1);
  data.sort((a, b) => {
    if (a[0] < b[0]) {
      return -1;
    }
    if (a[0] > b[0]) {
      return 1;
    }
    return 0;
  });

  return defs.concat(data);
}

function generateRandomSubset(subsetRange, set) {
  if (!Number.isNaN(subsetRange) && subsetRange < set.length && subsetRange > 0) {
    const setCopy = set.slice();
    const subset = [];
    for (let i = 0; i < subsetRange; i++) {
      const n = Math.round(Math.random() * (setCopy.length - 1));
      subset.push(setCopy.splice(n, 1)[0]);
    }
    return subset;
  }
  return set;
}

/**
 * Generate a random string
 *
 * @param  {Array} args     A set of arrays to randomly join data.
 * Adds strings based on input order, starting with first parameter
 * @return {String}          String randomly generated from input
 */
export function stringGenerator(joinChar, ...args) {
  return args
    .map((a) => {
      const aryIndex = Math.round(Math.random() * (a.length - 1));
      return a[aryIndex];
    })
    .join(joinChar);
}

/**
 * Generate a random set of strings
 *
 * @param  {Numbers} count  Number of names to generate
 * @param  {Array} args     A set of arrays to randomly join data.
 * Adds strings based on input order, starting with first parameter
 * @return {Array}          Array of randomly generated strings
 */
export function stringsGenerator(count, joinChar, ...args) {
  const names = [];
  for (let i = 0; i < count; i++) {
    let name = stringGenerator(joinChar, ...args);
    let c = 5;
    while (names.indexOf(name) !== -1 && c > 0) {
      name = stringGenerator(joinChar, ...args);
      c--;
    }

    names.push(name);
  }

  return names;
}

export function stringssGenerator(dimz, rows, joinChar, ...args) {
  const names = [];

  function randomName() {
    let name = stringGenerator(';', ...args);
    let c = 5;
    while (names.indexOf(name.replace(/;/g, joinChar)) !== -1 && c > 0) {
      name = stringGenerator(';', ...args);
      c--;
    }
    return name;
  }
  for (let i = 0; i < rows; i++) {
    let name;
    let splitNames = [];
    for (let d = 0; d < dimz; d++) {
      if (d === 0) {
        name = randomName();
        splitNames = name.split(';');
      } else if (splitNames[d - 1]) {
        name = splitNames[d - 1];
      } else {
        name = randomName();
      }
      names.push(name.replace(/;/g, joinChar));
    }
  }

  return names;
}

/**
 * Generate data set with random sport team names, for usage with generateDataFromArray
 *
 * @param  {Integer} dimensions The number of dimensions to be generated
 * @param  {Integer} measures   The number of measures
 * @param  {Integer} rows       The number of rows
 * @param  {Boolean} sorted     If the rows are supposed to be sorted or not
 * @return {Array}              2d Array
 */
export function generateTeamNameData({
  dimensions = 1,
  measures = 1,
  rows = 5,
  sorted = true,
  sortAlphabetically = true,
  dataRange = [0, 1000],
  uniqueCities = cities.length,
  uniqueTeamNames = teamNames.length,
  uniqueAbbr = sportsAbbreviations.length,
}) {
  const subsetCities = generateRandomSubset(uniqueCities, cities);
  const subsetNames = generateRandomSubset(uniqueTeamNames, teamNames);
  const subsetAbbr = generateRandomSubset(uniqueAbbr, sportsAbbreviations);

  const names = stringssGenerator(dimensions, rows + 1, ' ', ...[subsetCities, subsetNames, subsetAbbr]);

  const table = hypercubeGenerator.generateCustomData(
    dimensions,
    measures,
    rows,
    stringsRowCallback(dimensions, sorted),
    dataRangePointCallback(names, dimensions, dataRange)
  );

  return sortAlphabetically ? sortTableAlphabetically(table) : table;
}

/**
 * Generate data set with random strings as dimension values, for usage with generateDataFromArray
 *
 * @param  {Integer} dimensions The number of dimensions to be generated
 * @param  {Integer} measures   The number of measures
 * @param  {Integer} rows       The number of rows
 * @param  {Boolean} sorted     If the rows are supposed to be sorted or not
 * @return {Array}              2d Array
 */
export function generateRandomStringData({
  dimensions = 1,
  measures = 1,
  rows = 5,
  chars = 3,
  joinChar = '',
  sortAlphabetically = true,
  sorted = true,
  dataRange = [0, 1000],
  upperCase = true,
}) {
  const mek = Array(chars)
    .fill(undefined)
    .map(() => (upperCase ? alphabetUpperCase : alphabetLowerCase));
  const strings = stringsGenerator(dimensions * rows + 1, joinChar, ...mek);

  const table = hypercubeGenerator.generateCustomData(
    dimensions,
    measures,
    rows,
    stringsRowCallback(dimensions, sorted),
    dataRangePointCallback(strings, dimensions, dataRange)
  );

  return sortAlphabetically ? sortTableAlphabetically(table) : table;
}

export default {
  generateTeamNameData,
  generateRandomStringData,
  stringGenerator,
  stringsGenerator,
  stringSets: {
    cities,
    teamNames,
    sportsAbbreviations,
    alphabetUpperCase,
    alphabetLowerCase,
  },
};
