// Central static metadata helpers for city descriptions and areas
export const CITY_METADATA_FALLBACKS = {
  doncaster: {
    code: "DON",
    description: "Scrap car collection available across Doncaster and South Yorkshire.",
    areas: ["Doncaster City Centre", "Armthorpe", "Bawtry", "Bentley", "Thorne", "Conisbrough", "Mexborough", "Edlington"],
  },
  leicester: {
    code: "LEI",
    description: "Fast scrap vehicle collection across Leicester and Leicestershire.",
    areas: ["Leicester City Centre", "Oadby", "Wigston", "Loughborough", "Hinckley", "Syston", "Birstall", "Enderby"],
  },
  peterborough: {
    code: "PBO",
    description: "Reliable scrap car collection throughout Peterborough and surrounding areas.",
    areas: ["Peterborough City Centre", "Hampton", "Whittlesey", "Yaxley", "Stamford", "Bretton", "Werrington", "Orton"],
  },
  london: {
    code: "LDN",
    description: "Scrap car collection available throughout London and surrounding Greater London areas.",
    areas: ["Central London", "North London", "South London", "East London", "West London", "Croydon", "Enfield", "Harrow"],
  },
  cambridge: {
    code: "CBG",
    description: "Convenient scrap car collection across Cambridge and Cambridgeshire.",
    areas: ["Cambridge City Centre", "Chesterton", "Cherry Hinton", "Ely", "Newmarket", "Histon", "Girton", "Fulbourn"],
  },
  liverpool: {
    code: "LIV",
    description: "Collection services available throughout Liverpool and Merseyside.",
    areas: ["Liverpool City Centre", "Bootle", "Aintree", "Anfield", "Allerton", "Wavertree", "Kirkdale", "Toxteth"],
  },
  manchester: {
    code: "MAN",
    description: "Reliable scrap car collection throughout Manchester and nearby towns.",
    areas: ["Manchester City Centre", "Salford", "Stockport", "Oldham", "Rochdale", "Bolton", "Bury", "Trafford"],
  },
  birmingham: {
    code: "BIR",
    description: "Reliable vehicle recycling and scrap car collection across Birmingham and the West Midlands.",
    areas: ["Birmingham City Centre", "Solihull", "Sutton Coldfield", "Edgbaston", "Harborne", "Erdington"],
  },
};

/**
 * Transforms a dynamic database city into a rich location object with display metadata
 */
export function formatCityLocation(city) {
  const slug = (city.slug || city.name.toLowerCase().replace(/\s+/g, "-")).toLowerCase();
  const fallback = CITY_METADATA_FALLBACKS[slug] || {
    code: city.name.slice(0, 3).toUpperCase(),
    description: `Fast and free scrap car collection across ${city.name} and surrounding areas.`,
    areas: [`${city.name} City Centre`, "Surrounding Districts", "Local Boroughs"],
  };

  return {
    id: city.id,
    city: city.name,
    name: city.name,
    slug,
    code: fallback.code,
    description: fallback.description,
    areas: fallback.areas,
    ratePerTon: city.ratePerTon || 235,
    isActive: city.isActive !== false,
  };
}

export const reviews = [
  { name: "James W.", rating: 5, date: "12 July 2026", vehicle: "Ford Focus 2012", text: "Very straightforward. I received a fair estimate, the collection was arranged quickly, and the driver was professional." },
  { name: "Sarah K.", rating: 5, date: "28 June 2026", vehicle: "Vauxhall Corsa 2010", text: "The quote process took only a few minutes. The team kept me updated and collected the car at the agreed time." },
  { name: "David M.", rating: 4, date: "3 June 2026", vehicle: "Volkswagen Golf 2009", text: "Good communication and no hidden collection charge. The final price matched the vehicle condition I submitted." },
];

export const faqs = [
  [
    "How much is my scrap car worth?",
    "The value of your scrap car depends on your vehicle’s make, model, weight, condition, and live UK scrap metal market rates. Enter your registration and collection postcode to receive an instant, accurate scrap estimate in seconds.",
  ],
  [
    "Do you collect non-running cars?",
    "Yes! We collect non-running, damaged, written-off, and MOT-failed vehicles. Enter your registration to receive an instant, accurate scrap estimate.",
  ],
  [
    "Is collection free?",
    "Yes, vehicle collection is 100% free with no hidden fees or collection charges across all our supported UK locations.",
  ],
  [
    "How quickly can you collect my car?",
    "Collection is typically arranged within 24 to 48 hours. Our team will contact you after you submit your quote to arrange a convenient collection date and time slot that suits your schedule.",
  ],
  [
    "Do I need my V5C?",
    "Having your V5C logbook makes the process faster, but if it is lost or misplaced, we can still process your scrap vehicle as long as you provide valid photo ID and proof of ownership.",
  ],
  [
    "Can I scrap a car without an MOT?",
    "Yes! An MOT is not required to scrap your car because our recovery driver will collect the vehicle directly from your home, workplace, or driveway.",
  ],
  [
    "Can I scrap an accident-damaged car?",
    "Yes, we accept write-offs, accident-damaged, insurance salvage, and complete or incomplete vehicles regardless of their condition.",
  ],
  [
    "How is the scrap price calculated?",
    "Your scrap price is calculated using your vehicle’s weight, current scrap metal market price per tonne, plus any applicable condition bonuses (such as alloy wheels) or deductions for missing major components.",
  ],
];
