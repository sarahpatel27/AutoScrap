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
    areas: ["Cambridge City Centre", "Chesterton", "Cherry Hinton", "Ely", "Newmarket", "Histon", "Girton", "Milton"],
  },
  liverpool: {
    code: "LIV",
    description: "Collection services available across supported South Liverpool districts.",
    areas: ["Garston", "Speke", "Grassendale", "Hale"],
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

export const CITY_CONTENT_OVERRIDES = {
  cambridge: {
    title: 'Scrap My Car Cambridge | Free Collection | MyAutoScrap',
    description: 'Scrap your car in Cambridge with MyAutoScrap. Get a fast online valuation and free collection across supported areas in and around Cambridge.',
    h1: 'Scrap My Car in Cambridge',
    heroCopy: 'Looking to scrap an old, damaged or MOT-failed vehicle in Cambridge? Enter your vehicle registration and collection postcode to calculate an estimated scrap value and confirm free collection availability across Cambridge and supported surrounding areas.',
    collectionHeading: 'Free Scrap Car Collection in Cambridge',
    collectionCopy: [
      'Arranging scrap car collection in Cambridge is straightforward with MyAutoScrap. Whether your vehicle is parked at a residential property in Chesterton, Cherry Hinton, or Trumpington, or situated near commercial premises around the Cambridge Science Park or Newmarket Road, our licensed recovery partners collect your vehicle directly with no hidden transport fees.',
      'Scrap car valuations are calculated based on your vehicle weight and current price-per-tonne scrap metal rates for supported Cambridgeshire areas. Collection is free across confirmed postcode districts, meaning you do not have to drive an unroadworthy or uninsured car across busy ring roads or through city access restrictions.'
    ],
    coverageHeading: 'Areas We Cover Around Cambridge',
    coverageIntro: 'We arrange free vehicle collection across Cambridge and supported surrounding districts, including Chesterton, Cherry Hinton, Histon, Girton, Milton, Waterbeach, Ely, and Newmarket. Enter your registration and postcode in the quote tool to verify collection availability for your exact street address.',
    conditionHeading: 'Scrapping Non-Running, Damaged or MOT-Failed Cars in Cambridge',
    conditionCopy: [
      'Many vehicles retired in Cambridge are non-starters, mechanical breakdowns, or have failed an annual MOT with repair estimates exceeding the vehicle\'s market value. You do not need a valid MOT or road tax to scrap your vehicle through MyAutoScrap.',
      'Our collection drivers operate recovery equipment designed to safely load rolling and non-running vehicles from private driveways, garages, and accessible off-street parking. Please let our team know during collection scheduling if your vehicle has flat tyres, steering lock issues, or restricted driveway access.'
    ],
    faqsHeading: 'Cambridge Scrap Car FAQs',
    faqs: [
      [
        'Which areas of Cambridge are covered for free scrap car collection?',
        'We arrange free scrap car collection across supported Cambridge postal districts including CB1, CB3, CB4, CB5, and surrounding towns and villages such as Histon, Girton, Milton, Waterbeach, Ely, and Newmarket. Enter your full postcode in our quote tool to verify coverage for your specific address.'
      ],
      [
        'How do I get an online scrap car quote for my Cambridge vehicle?',
        'Enter your vehicle registration and Cambridge collection postcode into our online quotation tool. We use your vehicle specifications and applicable regional scrap metal rates to calculate an estimated valuation before you submit your enquiry.'
      ],
      [
        'Can you collect a car that does not run or has failed its MOT in Cambridge?',
        'Yes. Vehicles do not require an active MOT, insurance, or road tax to be collected for scrap. Our recovery partners collect non-running and accident-damaged vehicles directly from your address, saving you recovery and transport costs.'
      ],
      [
        'What documents do I need to scrap my car in Cambridge?',
        'You will need your V5C registration certificate (logbook) and photo identification such as a UK driving licence or passport. If your V5C is missing, you can still proceed by providing proof of ownership and valid ID so our licensed recovery team can verify keeper details.'
      ],
      [
        'How and when is payment made for my scrap car?',
        'Under the Scrap Metal Dealers Act 2013, paying cash for scrap metal or scrap vehicles is illegal in England. Payment is made securely via electronic bank transfer upon vehicle collection and inspection, ensuring direct, traceable payment before the driver leaves.'
      ]
    ],
    nearbyLocations: [
      { name: 'Peterborough', slug: 'peterborough' },
      { name: 'Ipswich', slug: 'ipswich' }
    ]
  },
  ipswich: {
    title: 'Scrap My Car Ipswich | Free Collection | MyAutoScrap',
    description: 'Scrap your car in Ipswich with MyAutoScrap. Get a fast online valuation and free collection across supported areas in and around Ipswich.',
    h1: 'Scrap My Car in Ipswich',
    heroCopy: 'Looking to scrap an old, damaged or MOT-failed vehicle in the Ipswich region? Enter your vehicle registration and collection postcode to receive an estimated scrap valuation and check collection availability across supported postal areas.',
    collectionHeading: 'Free Scrap Car Collection in Supported Ipswich & Regional Areas',
    collectionCopy: [
      'MyAutoScrap arranges free scrap car collection across confirmed regional service locations, currently supporting postcode district IP27. Collection is completely free with no hidden transport fees, meaning you do not need to drive or deliver an unroadworthy car yourself.',
      'Our online quotation tool uses your vehicle registration and exact collection postcode to calculate an estimated valuation based on raw vehicle weight and current price-per-tonne scrap metal rates. Because coverage across the wider Suffolk and Ipswich area is determined by active collection partner boundaries, entering your postcode is the essential step to confirm service availability for your vehicle.'
    ],
    coverageHeading: 'Supported Postcode Coverage Around Ipswich',
    coverageIntro: 'Vehicle collection is currently active in supported regional postal districts, including IP27. Collection availability depends strictly on your exact outward postcode. Use the registration and postcode quote tool above to verify whether your specific address is within our active collection network.',
    conditionHeading: 'Scrapping Non-Running, Damaged or MOT-Failed Cars',
    conditionCopy: [
      'We regularly collect non-runners, accident-damaged cars, insurance write-offs, and vehicles that have failed their annual MOT test. An active MOT, road tax, or insurance is not required for your vehicle to be collected by our licensed recovery partners.',
      'Recovery vehicles are equipped to safely load non-running vehicles directly from residential driveways, garages, and accessible off-street parking. Please notify our team when scheduling your booking if your vehicle has missing wheels, flat tyres, or restricted access.'
    ],
    faqsHeading: 'Ipswich Scrap Car FAQs',
    faqs: [
      [
        'Which postcodes are covered for scrap car collection under Ipswich?',
        'We currently provide scrap car collection in supported regional postal districts including IP27. Because collection availability is determined by partner boundaries, not all postal districts across the wider Ipswich and Suffolk area are currently active. Please enter your full postcode in our quote tool to confirm availability for your specific address.'
      ],
      [
        'How is my scrap car valuation calculated?',
        'Your scrap car valuation is estimated using your vehicle’s registration details, kerb weight, and the applicable price-per-tonne scrap metal rates for supported regional areas. The final price depends on the vehicle’s verified condition and complete status upon collection inspection.'
      ],
      [
        'Can you collect a car without an MOT or road tax?',
        'Yes. Vehicles do not need a valid MOT or current road tax to be collected for scrap. Our licensed recovery partners collect non-running and accident-damaged vehicles directly from your location, provided there is suitable access for recovery equipment.'
      ],
      [
        'What documents do I need to scrap my car?',
        'You will need your V5C registration document (logbook) and valid photo identification such as a UK driving licence or passport. If your V5C is missing, you can still scrap your car by providing proof of ownership and photo ID so our recovery team can confirm keeper details.'
      ],
      [
        'How and when will I be paid for my scrap vehicle?',
        'In accordance with the Scrap Metal Dealers Act 2013, paying cash for scrap cars is illegal in England and Wales. Payment is processed securely via electronic bank transfer directly into your nominated account upon vehicle inspection and collection before the driver departs.'
      ]
    ],
    nearbyLocations: [
      { name: 'Cambridge', slug: 'cambridge' },
      { name: 'Peterborough', slug: 'peterborough' }
    ]
  },
  'milton-keynes': {
    title: 'Scrap My Car Milton Keynes | Free Collection | MyAutoScrap',
    description: 'Scrap your car in Milton Keynes with MyAutoScrap. Get a fast online valuation and free collection across supported areas in and around Milton Keynes.',
    h1: 'Scrap My Car in Milton Keynes',
    heroCopy: 'Looking to scrap an old, damaged or MOT-failed vehicle? Enter your vehicle registration and collection postcode to calculate an estimated scrap value and verify free collection availability across our active regional collection network.',
    collectionHeading: 'Free Scrap Car Collection in Supported Regional Districts',
    collectionCopy: [
      'MyAutoScrap arranges free scrap car collection across confirmed regional service areas, currently supporting postal districts MK40, MK41, MK42, MK43, MK44 and MK45. Free vehicle collection is included with no separate transport charges, so you never have to transport an unroadworthy or uninsured vehicle yourself.',
      'Estimated valuations are calculated using your vehicle registration details, kerb weight, and applicable price-per-tonne scrap metal rates for supported collection areas. Because our active collection network covers specific regional postal districts in the MK40–MK45 area rather than all postcodes across the wider Milton Keynes area, entering your exact collection postcode is the essential first step to confirm service availability.'
    ],
    coverageHeading: 'Supported Postcode Districts Around Milton Keynes',
    coverageIntro: 'Vehicle collection is currently active across supported regional postal districts: MK40, MK41, MK42, MK43, MK44 and MK45. Collection availability depends strictly on your exact outward postcode. Use the registration and postcode quote tool above to confirm whether your specific street address is within our active collection network.',
    conditionHeading: 'Scrapping Non-Running, Damaged or MOT-Failed Cars',
    conditionCopy: [
      'We regularly collect mechanical write-offs, non-starters, accident-damaged vehicles, and cars that have failed their annual MOT test where the cost of necessary repairs exceeds vehicle value. An active MOT certificate, road tax, or insurance is not required for scrap vehicle collection.',
      'Our recovery partners operate specialized collection vehicles equipped with winches to safely retrieve non-running and rolling vehicles from residential driveways, private garages, and accessible off-street parking. Please inform our collection team when arranging your booking if your vehicle has flat tyres, steering lock issues, or restricted driveway access.'
    ],
    faqsHeading: 'Milton Keynes Scrap Car FAQs',
    faqs: [
      [
        'Which postcode districts are covered for scrap car collection under Milton Keynes?',
        'We currently provide free vehicle collection across confirmed regional postal districts: MK40, MK41, MK42, MK43, MK44 and MK45. Because coverage is determined by active collection partner boundaries, central Milton Keynes urban postcodes (such as MK1–MK19) are not currently active in our collection network. Please enter your full postcode in the quote tool to verify coverage for your exact address.'
      ],
      [
        'How is my scrap car valuation calculated?',
        'Your scrap valuation is calculated based on your vehicle registration details, recorded vehicle kerb weight, and the configured price-per-tonne scrap metal rate for your collection area. The online valuation provides an upfront estimate, with the final payment confirmed based on vehicle completeness and verified physical condition.'
      ],
      [
        'Can you collect a car that is non-running or without a valid MOT?',
        'Yes. Vehicles do not require an active MOT, insurance, or road tax to be collected for scrap. Our licensed recovery partners collect non-running, damaged, and SORN vehicles directly from your address with no collection charges.'
      ],
      [
        'What documents do I need to scrap my vehicle?',
        'You will need your V5C registration document (logbook) and a valid form of photo identification (such as a UK driving licence or passport). If your V5C logbook is missing, you can still scrap your vehicle by providing proof of ownership along with valid photo ID so our recovery driver can verify keeper identity.'
      ],
      [
        'Are there collection fees, and how is payment processed?',
        'Vehicle collection is 100% free with no hidden transport fees across all supported MK40–MK45 postal districts. Under the Scrap Metal Dealers Act 2013, cash payments for scrap cars are illegal in England and Wales. Payment is processed securely via electronic bank transfer upon vehicle inspection and handover before the recovery driver departs.'
      ]
    ],
    nearbyLocations: [
      { name: 'Cambridge', slug: 'cambridge' },
      { name: 'Peterborough', slug: 'peterborough' }
    ]
  },
  peterborough: {
    title: 'Scrap My Car Peterborough | Free Collection | MyAutoScrap',
    description: 'Scrap your car in Peterborough with MyAutoScrap. Get a fast online valuation and free collection across Peterborough and supported surrounding areas.',
    h1: 'Scrap My Car in Peterborough',
    heroCopy: 'Need to scrap or sell an old, damaged or MOT-failed car in Peterborough? Enter your registration and postcode for a fast scrap valuation and check collection availability in your area.',
    collectionHeading: 'Free Scrap Car Collection in Peterborough',
    collectionCopy: [
      'If you\'re looking to scrap cars in Peterborough or need to dispose of an old, non-running vehicle, MyAutoScrap provides a straightforward way to arrange scrap car collection. We collect vehicles across Peterborough and supported surrounding areas including Bretton, Werrington, Orton, Hampton, Yaxley, Whittlesey, and Stamford.',
      'Collection is completely free with no separate collection charges. You do not need to deliver the vehicle yourself—our recovery driver collects it directly from your home, workplace, or driveway.'
    ],
    coverageHeading: 'Areas We Cover Around Peterborough',
    coverageIntro: 'We collect vehicles across Peterborough and supported surrounding areas including Hampton, Whittlesey, Yaxley, Stamford, Bretton, Werrington and Orton. The registration and postcode quote tool above remains the authoritative way to confirm collection availability for your exact address.',
    conditionHeading: 'Scrapping Non-Running or MOT-Failed Cars in Peterborough',
    conditionCopy: [
      'Many vehicles scrapped in Peterborough are non-runners or have failed their MOT test. If the cost of necessary repairs outweighs what the vehicle is worth, scrapping is often the most practical choice.',
      'Non-running and MOT-failed vehicles can be collected directly from your location, so you do not need to drive the vehicle to a scrap yard. An active MOT is not required for collection.'
    ],
    faqsHeading: 'Peterborough Scrap Car FAQs',
    faqs: [
      [
        'Do you collect scrap cars in Peterborough?',
        'Yes. We arrange free scrap car collection across Peterborough and supported surrounding areas including Hampton, Werrington, Bretton, Orton, Yaxley, Whittlesey and Stamford. Enter your postcode in the quote tool to confirm availability for your address.'
      ],
      [
        'How do I get a scrap car quote in Peterborough?',
        'Enter your vehicle registration and collection postcode into the online quote form. The vehicle details are used to provide an estimated scrap value before you continue with your enquiry.'
      ],
      [
        'Can you collect a non-running or MOT-failed car in Peterborough?',
        'Yes. Non-running and MOT-failed vehicles can be collected directly from your location, so you do not need to drive the vehicle to a scrap yard.'
      ],
      [
        'Is scrap car collection free in Peterborough?',
        'Yes. Scrap car collection is free across supported Peterborough service areas, with no separate collection charge.'
      ],
      [
        'How is payment made?',
        'Payment is made by bank transfer as part of the vehicle collection process.'
      ]
    ]
  },
  liverpool: {
    title: 'Scrap My Car Liverpool | Free Collection | MyAutoScrap',
    description: 'Scrap your car in Liverpool with MyAutoScrap. Get a fast online valuation and free collection across supported areas in and around Liverpool.',
    h1: 'Scrap My Car in Liverpool',
    heroCopy: 'Looking to scrap an old, damaged or MOT-failed car in Liverpool? Enter your vehicle registration and collection postcode to calculate an estimated scrap value and confirm free collection availability across supported South Liverpool areas.',
    collectionHeading: 'Free Scrap Car Collection in Supported South Liverpool Districts',
    collectionCopy: [
      'MyAutoScrap provides free scrap car collection across active service locations in South Liverpool, currently supporting postcode districts L19 and L24, including Garston, Speke, Grassendale, and Hale. Vehicle collection is completely free with no hidden transport fees, so you never need to drive an unroadworthy or uninsured vehicle yourself.',
      'Our online quotation system calculates estimated scrap values based on your vehicle registration details, kerb weight, and current scrap metal rates. Because active collection coverage is focused on specific South Liverpool districts rather than the entire metropolitan area, entering your exact postcode in our quote tool confirms immediate service availability.'
    ],
    coverageHeading: 'Supported Postcode Districts Around Liverpool',
    coverageIntro: 'Scrap car collection is currently active across supported South Liverpool postal districts: L19 and L24, covering Garston, Speke, Grassendale, and Hale. Service availability depends strictly on your outward postcode. Use the registration and postcode quote tool above to confirm whether your address is within our active collection network.',
    conditionHeading: 'Scrapping Non-Running, Damaged or MOT-Failed Cars in Liverpool',
    conditionCopy: [
      'We regularly collect non-starters, accident-damaged vehicles, insurance write-offs, and cars that have failed their annual MOT test where repair estimates exceed the vehicle’s market value. You do not need valid road tax, insurance, or an active MOT to scrap your car through MyAutoScrap.',
      'Our collection partners operate specialized recovery vehicles equipped to load non-running and rolling cars safely from private driveways, residential parking, or business premises. Please let us know if your vehicle has flat tyres, missing wheels, or restricted driveway access when scheduling collection.'
    ],
    faqsHeading: 'Liverpool Scrap Car FAQs',
    faqs: [
      [
        'Which Liverpool postcode districts are covered for free scrap car collection?',
        'We currently provide free scrap car collection in supported South Liverpool postal districts: L19 and L24, covering areas such as Garston, Speke, Grassendale, and Hale. Other Liverpool postal districts are not currently active in our collection network. Enter your full postcode in our quote tool to verify coverage for your specific address.'
      ],
      [
        'How do I get an online scrap car valuation for my Liverpool vehicle?',
        'Enter your vehicle registration and collection postcode into our online valuation tool. We assess your vehicle specifications, weight, and regional scrap metal market rates to provide an upfront valuation estimate before you submit your enquiry.'
      ],
      [
        'Can you collect a car that does not run or has failed its MOT in Liverpool?',
        'Yes. An active MOT, road tax, or insurance is not required for scrap car collection. Our licensed recovery partners collect non-running, SORN, and MOT-failed vehicles directly from your address at no additional cost.'
      ],
      [
        'What documents do I need to scrap my car in Liverpool?',
        'You will need your V5C registration certificate (logbook) and valid photo identification such as a UK driving licence or passport. If your V5C is missing, you can still scrap your vehicle by providing proof of ownership along with valid photo ID so our recovery driver can verify keeper identity.'
      ],
      [
        'How is payment made for my scrap car in Liverpool?',
        'Under the Scrap Metal Dealers Act 2013, paying cash for scrap vehicles is illegal in England. Payment is made securely via electronic bank transfer upon vehicle inspection and handover before the recovery driver departs.'
      ]
    ],
    nearbyLocations: [
      { name: 'Chester', slug: 'chester' },
      { name: 'Warrington', slug: 'warrington' }
    ]
  },
  warrington: {
    title: 'Scrap My Car Warrington | Free Collection | MyAutoScrap',
    description: 'Scrap your car in Warrington with MyAutoScrap. Get a fast online valuation and free collection across supported areas in and around Warrington.',
    h1: 'Scrap My Car in Warrington',
    heroCopy: 'Looking to scrap an old, damaged or MOT-failed vehicle? Enter your vehicle registration and collection postcode to calculate an estimated scrap value and confirm free collection availability across our active regional collection network.',
    collectionHeading: 'Free Scrap Car Collection in Supported Warrington & Regional Districts',
    collectionCopy: [
      'MyAutoScrap arranges free scrap car collection across confirmed regional service locations, currently supporting postal districts WA6 and WA7, covering Frodsham, Helsby, and Runcorn. Collection is completely free with no hidden transport fees, so you do not need to transport an unroadworthy or uninsured vehicle yourself.',
      'Our online quotation tool uses your vehicle registration and outward postcode to calculate an estimated valuation based on recorded vehicle weight and current price-per-tonne scrap metal rates. Because active collection coverage is currently focused on regional districts WA6 and WA7 rather than central Warrington urban postcodes (WA1–WA5), entering your exact postcode is the essential step to verify service availability.'
    ],
    coverageHeading: 'Supported Postcode Districts Around Warrington',
    coverageIntro: 'Vehicle collection is currently active across supported regional postal districts: WA6 and WA7, covering Frodsham, Helsby, and Runcorn. Collection availability depends strictly on your outward postcode. Use the registration and postcode quote tool above to confirm whether your specific street address is within our active collection network.',
    conditionHeading: 'Scrapping Non-Running, Damaged or MOT-Failed Cars',
    conditionCopy: [
      'We collect non-starters, mechanical write-offs, accident-damaged vehicles, and cars that have failed their annual MOT test where repair costs exceed the vehicle value. A valid MOT, road tax, or insurance is not required for scrap vehicle collection.',
      'Our licensed recovery partners operate recovery vehicles equipped to retrieve rolling and non-running cars directly from residential driveways, private garages, and accessible off-street parking. Please let our team know if your vehicle has flat tyres, steering lock issues, or restricted driveway access.'
    ],
    faqsHeading: 'Warrington Scrap Car FAQs',
    faqs: [
      [
        'Which postcode districts are covered for scrap car collection under Warrington?',
        'We currently provide free vehicle collection across confirmed regional postal districts WA6 and WA7, covering Frodsham, Helsby, and Runcorn. Central Warrington urban postcodes (such as WA1 to WA5) are not currently active in our collection network. Enter your full postcode in our quote tool to verify coverage for your exact address.'
      ],
      [
        'How is my scrap car valuation calculated in Warrington?',
        'Your scrap valuation is calculated using your vehicle registration details, recorded vehicle kerb weight, and configured price-per-tonne scrap metal rates for your collection area. The online valuation provides an upfront estimate, with final payment confirmed upon vehicle handover.'
      ],
      [
        'Can you collect a non-running or MOT-failed car in Warrington?',
        'Yes. Vehicles do not require an active MOT, insurance, or road tax to be collected for scrap. Our recovery partners collect non-running and accident-damaged vehicles directly from your address with no collection charges.'
      ],
      [
        'What documents are required to scrap my car?',
        'You will need your V5C registration certificate (logbook) and valid photo identification, such as a UK driving licence or passport. If your V5C is misplaced, you can still proceed by providing proof of ownership and photo ID so our recovery driver can verify keeper identity.'
      ],
      [
        'How and when is payment made for my scrap car?',
        'Under the Scrap Metal Dealers Act 2013, paying cash for scrap vehicles is illegal throughout England and Wales. Payment is transferred securely via electronic bank transfer directly into your account upon vehicle inspection before the driver departs.'
      ]
    ],
    nearbyLocations: [
      { name: 'Chester', slug: 'chester' },
      { name: 'Liverpool', slug: 'liverpool' },
      { name: 'Crewe', slug: 'crewe' }
    ]
  },
  llandudno: {
    title: 'Scrap My Car Llandudno | Free Collection | MyAutoScrap',
    description: 'Scrap your car in Llandudno with MyAutoScrap. Get a fast online valuation and free collection across supported areas in and around Llandudno.',
    h1: 'Scrap My Car in Llandudno',
    heroCopy: 'Looking to scrap an old, damaged or MOT-failed vehicle in North East Wales? Enter your vehicle registration and collection postcode to calculate an estimated scrap valuation and verify free collection availability across our active regional network.',
    collectionHeading: 'Free Scrap Car Collection in Supported North East Wales Districts',
    collectionCopy: [
      'MyAutoScrap arranges free scrap car collection across active regional service locations under our Llandudno hub, currently supporting postal districts LL11, LL12, LL13, LL14, LL15, LL16, LL20, and LL21. This network covers Wrexham, Ruthin, Denbigh, Llangollen, and Corwen across North East Wales. Vehicle collection is completely free with no hidden transport fees.',
      'Our online quotation tool calculates estimated valuations using your vehicle registration details, kerb weight, and current scrap metal price-per-tonne rates. Because active collection is concentrated in North East Wales districts rather than coastal Llandudno town (LL30), entering your exact collection postcode is the essential step to confirm service availability for your vehicle.'
    ],
    coverageHeading: 'Supported Postcode Districts Around Llandudno & North East Wales',
    coverageIntro: 'Vehicle collection is currently active across supported regional postal districts: LL11, LL12, LL13, LL14, LL15, LL16, LL20, and LL21, serving Wrexham, Denbigh, Ruthin, Llangollen, and Corwen. Service availability depends strictly on your outward postcode. Use the quote tool above to confirm whether your specific address is within our active collection network.',
    conditionHeading: 'Scrapping Non-Running, Damaged or MOT-Failed Cars',
    conditionCopy: [
      'We regularly collect non-runners, accident-damaged vehicles, insurance salvage, and cars that have failed their annual MOT test where repairs are no longer cost-effective. You do not need a valid MOT, road tax, or insurance to scrap your vehicle.',
      'Our licensed collection partners operate recovery vehicles capable of loading non-running cars from rural driveways, residential streets, and accessible private land. Please inform our team when arranging collection if your vehicle has flat tyres, steering issues, or restricted lane access.'
    ],
    faqsHeading: 'Llandudno Scrap Car FAQs',
    faqs: [
      [
        'Which postcode districts are covered for scrap car collection under Llandudno?',
        'We currently provide free vehicle collection across confirmed regional postal districts in North East Wales: LL11, LL12, LL13, LL14, LL15, LL16, LL20, and LL21, covering Wrexham, Ruthin, Denbigh, Llangollen, and Corwen. Coastal Llandudno town postcodes (such as LL30) are not currently active in our collection network. Please enter your full postcode in the quote tool to verify coverage for your exact address.'
      ],
      [
        'How is my scrap car valuation calculated?',
        'Your scrap valuation is calculated based on your vehicle registration details, recorded vehicle kerb weight, and current price-per-tonne scrap metal rates for your collection area. The online valuation provides an upfront estimate before you confirm your booking.'
      ],
      [
        'Can you collect a car that does not start or has failed its MOT?',
        'Yes. An active MOT certificate, road tax, or insurance is not required for vehicle collection. Our recovery partners collect non-running and accident-damaged cars directly from your address at no charge.'
      ],
      [
        'What documents do I need to scrap my vehicle?',
        'You will need your V5C registration certificate (logbook) and valid photo identification, such as a UK driving licence or passport. If your V5C logbook is missing, you can still scrap your car by providing proof of ownership and photo ID so our recovery driver can verify keeper identity.'
      ],
      [
        'How is payment processed for scrap cars in Wales?',
        'In compliance with the Scrap Metal Dealers Act 2013, paying cash for scrap vehicles is illegal in Wales and England. Payment is made securely via electronic bank transfer directly to your account upon vehicle inspection and handover.'
      ]
    ],
    nearbyLocations: [
      { name: 'Chester', slug: 'chester' },
      { name: 'Shrewsbury', slug: 'shrewsbury' }
    ]
  },
  shrewsbury: {
    title: 'Scrap My Car Shrewsbury | Free Collection | MyAutoScrap',
    description: 'Scrap your car in Shrewsbury with MyAutoScrap. Get a fast online valuation and free collection across supported areas in and around Shrewsbury.',
    h1: 'Scrap My Car in Shrewsbury',
    heroCopy: 'Looking to scrap an old, damaged or MOT-failed vehicle in Shropshire? Enter your vehicle registration and collection postcode to calculate an estimated scrap value and verify free collection availability across our active regional network.',
    collectionHeading: 'Free Scrap Car Collection in Supported Shrewsbury & North Shropshire Districts',
    collectionCopy: [
      'MyAutoScrap provides free scrap car collection across active service locations in Shrewsbury and North Shropshire, currently supporting postal districts SY1, SY4, SY10, SY11, SY12, SY13, and SY14. This covers northern Shrewsbury, Wem, Shawbury, Oswestry, Ellesmere, Whitchurch, and Malpas. Free collection is included with no separate transport charges.',
      'Our online valuation system calculates estimates based on your vehicle registration details, kerb weight, and current price-per-tonne scrap metal rates. Because active collection is currently focused on northern Shrewsbury and North Shropshire districts rather than southern Shrewsbury postcodes (SY2, SY3), entering your outward postcode in our quote tool confirms immediate service availability.'
    ],
    coverageHeading: 'Supported Postcode Districts Around Shrewsbury',
    coverageIntro: 'Vehicle collection is currently active across supported Shropshire postal districts: SY1, SY4, SY10, SY11, SY12, SY13, and SY14, serving Shrewsbury North, Wem, Shawbury, Oswestry, Ellesmere, Whitchurch, and Malpas. Service availability depends strictly on your outward postcode. Use the registration and postcode quote tool above to verify whether your specific address is within our active collection network.',
    conditionHeading: 'Scrapping Non-Running, Damaged or MOT-Failed Cars in Shropshire',
    conditionCopy: [
      'We regularly collect mechanical write-offs, non-starters, accident-damaged vehicles, and cars that have failed their annual MOT test where repair costs outweigh vehicle value. A valid MOT certificate, road tax, or insurance is not required for scrap car collection.',
      'Our collection partners operate specialized recovery vehicles equipped to retrieve non-running and rolling cars from private driveways, residential streets, and rural properties. Please let our team know when booking if your vehicle has flat tyres, steering lock issues, or restricted lane access.'
    ],
    faqsHeading: 'Shrewsbury Scrap Car FAQs',
    faqs: [
      [
        'Which postcode districts are covered for scrap car collection under Shrewsbury?',
        'We currently provide free scrap car collection across supported postal districts in northern Shrewsbury and North Shropshire: SY1, SY4, SY10, SY11, SY12, SY13, and SY14, covering Shrewsbury North, Wem, Shawbury, Oswestry, Ellesmere, Whitchurch, and Malpas. Southern Shrewsbury districts (such as SY2 and SY3) are not currently active in our collection network. Enter your full postcode in our quote tool to verify coverage for your specific address.'
      ],
      [
        'How is my scrap car valuation calculated in Shrewsbury?',
        'Your valuation is calculated using your vehicle registration details, recorded vehicle kerb weight, and configured price-per-tonne scrap metal rates for supported Shropshire areas. The online valuation provides an upfront estimate before you confirm your booking.'
      ],
      [
        'Can you collect a car that does not run or has no MOT in Shropshire?',
        'Yes. An active MOT, road tax, or insurance is not required for scrap vehicle collection. Our licensed recovery partners collect non-running, SORN, and accident-damaged cars directly from your location with no transport fees.'
      ],
      [
        'What paperwork do I need to scrap my car?',
        'You will need your V5C registration certificate (logbook) and valid photo identification such as a UK driving licence or passport. If your V5C is missing, you can still scrap your car by providing proof of ownership and photo ID so our driver can verify keeper identity.'
      ],
      [
        'How is payment handled when I scrap my car?',
        'Under the Scrap Metal Dealers Act 2013, paying cash for scrap vehicles is illegal in England. Payment is made securely via electronic bank transfer directly to your account upon vehicle inspection and collection before the driver departs.'
      ]
    ],
    nearbyLocations: [
      { name: 'Crewe', slug: 'crewe' },
      { name: 'Chester', slug: 'chester' },
      { name: 'Llandudno', slug: 'llandudno' }
    ]
  },
  crewe: {
    title: 'Scrap My Car Crewe | Free Collection | MyAutoScrap',
    description: 'Scrap your car in Crewe with MyAutoScrap. Get a fast online valuation and free collection across supported areas in and around Crewe.',
    h1: 'Scrap My Car in Crewe',
    heroCopy: 'Looking to scrap an old, damaged or MOT-failed car in Cheshire? Enter your vehicle registration and collection postcode to calculate an estimated scrap value and confirm free collection availability across our active regional network.',
    collectionHeading: 'Free Scrap Car Collection Across Crewe & South Cheshire',
    collectionCopy: [
      'MyAutoScrap provides free scrap car collection across active service locations in South and Mid Cheshire, supporting postal districts CW1, CW2, CW3, CW5, CW6, CW7, CW8, CW9, and CW10. This provides broad coverage across Crewe, Nantwich, Winsford, Northwich, Middlewich, Tarporley, and Madeley. Vehicle collection is completely free with no hidden transport fees.',
      'Our online valuation system calculates estimates based on your vehicle registration details, kerb weight, and current price-per-tonne scrap metal rates. Because active collection is determined by verified regional partner boundaries, entering your exact collection postcode in our quote tool confirms immediate service availability.'
    ],
    coverageHeading: 'Supported Postcode Districts Around Crewe & Cheshire',
    coverageIntro: 'Vehicle collection is currently active across supported Cheshire postal districts: CW1, CW2, CW3, CW5, CW6, CW7, CW8, CW9, and CW10, covering Crewe, Nantwich, Madeley, Tarporley, Winsford, Northwich, and Middlewich. Service availability depends strictly on your outward postcode. Use the registration and postcode quote tool above to confirm whether your specific street address is within our active collection network.',
    conditionHeading: 'Scrapping Non-Running, Damaged or MOT-Failed Cars in Crewe',
    conditionCopy: [
      'We regularly collect non-starters, mechanical write-offs, accident-damaged vehicles, and cars that have failed their annual MOT test where necessary repair bills exceed vehicle value. You do not need a valid MOT certificate, road tax, or insurance to scrap your vehicle through MyAutoScrap.',
      'Our licensed recovery partners operate recovery vehicles equipped to retrieve rolling and non-running cars directly from residential driveways, private garages, and accessible off-street parking. Please let our collection team know if your vehicle has flat tyres, steering lock issues, or restricted driveway access.'
    ],
    faqsHeading: 'Crewe Scrap Car FAQs',
    faqs: [
      [
        'Which postcode districts are covered for scrap car collection under Crewe?',
        'We provide free scrap car collection across confirmed Cheshire postal districts: CW1, CW2, CW3, CW5, CW6, CW7, CW8, CW9, and CW10, covering Crewe, Nantwich, Madeley, Tarporley, Winsford, Northwich, and Middlewich. Enter your full postcode in our quote tool to confirm coverage for your specific address.'
      ],
      [
        'How is my scrap car valuation calculated in Crewe?',
        'Your scrap valuation is calculated using your vehicle registration details, recorded vehicle kerb weight, and configured price-per-tonne scrap metal rates for supported Cheshire areas. The online valuation gives you an upfront estimate before you submit your enquiry.'
      ],
      [
        'Can you collect a car that does not start or has failed its MOT in Crewe?',
        'Yes. An active MOT, road tax, or insurance is not required for scrap vehicle collection. Our recovery partners collect non-running, SORN, and accident-damaged cars directly from your location with no transport fees.'
      ],
      [
        'What documents do I need to scrap my car in Crewe?',
        'You will need your V5C registration certificate (logbook) and valid photo identification such as a UK driving licence or passport. If your V5C is missing, you can still scrap your car by providing proof of ownership and photo ID so our recovery driver can verify keeper identity.'
      ],
      [
        'How and when is payment made for my scrap car?',
        'Under the Scrap Metal Dealers Act 2013, cash payments for scrap cars are illegal in England and Wales. Payment is made securely via electronic bank transfer upon vehicle inspection and collection before the recovery driver departs.'
      ]
    ],
    nearbyLocations: [
      { name: 'Chester', slug: 'chester' },
      { name: 'Warrington', slug: 'warrington' },
      { name: 'Shrewsbury', slug: 'shrewsbury' }
    ]
  },
  chester: {
    title: 'Scrap My Car Chester | Free Collection | MyAutoScrap',
    description: 'Scrap your car in Chester with MyAutoScrap. Get a fast online valuation and free collection across supported areas in and around Chester.',
    h1: 'Scrap My Car in Chester',
    heroCopy: 'Looking to scrap an old, damaged or MOT-failed vehicle in Chester, the Wirral, or Flintshire? Enter your vehicle registration and collection postcode to calculate an estimated scrap value and confirm free collection availability across our active regional network.',
    collectionHeading: 'Free Scrap Car Collection Across Chester, the Wirral & Flintshire',
    collectionCopy: [
      'MyAutoScrap provides free scrap car collection across active service locations in Chester, West Cheshire, the Wirral, and Flintshire, supporting 20 postal districts: CH1, CH2, CH3, CH4, CH5, CH6, CH7, CH8, CH41, CH42, CH43, CH44, CH49, CH60, CH61, CH62, CH63, CH64, CH65, and CH66. Free vehicle collection is included with no separate transport charges.',
      'Our online quotation tool calculates estimated valuations using your vehicle registration details, kerb weight, and configured price-per-tonne scrap metal rates. Because active collection is determined by verified regional partner boundaries across Chester, Deeside, Ellesmere Port, and the Wirral, entering your exact collection postcode confirms immediate service availability.'
    ],
    coverageHeading: 'Supported Postcode Districts Around Chester & Regional Areas',
    coverageIntro: 'Vehicle collection is currently active across 20 supported postal districts: CH1, CH2, CH3, CH4 (Chester), CH5, CH6, CH7, CH8 (Deeside, Flint, Mold, Holywell), CH41, CH42, CH43, CH44, CH49, CH60, CH61, CH62, CH63 (Birkenhead, Wallasey, Wirral), and CH64, CH65, CH66 (Neston, Ellesmere Port). Service availability depends strictly on your outward postcode. Use the quote tool above to confirm whether your specific address is within our active collection network.',
    conditionHeading: 'Scrapping Non-Running, Damaged or MOT-Failed Cars in Chester',
    conditionCopy: [
      'We regularly collect mechanical write-offs, non-starters, accident-damaged vehicles, and cars that have failed their annual MOT test where necessary repair bills exceed vehicle value. A valid MOT certificate, road tax, or insurance is not required for scrap car collection.',
      'Our licensed recovery partners operate recovery vehicles equipped to retrieve rolling and non-running cars from residential driveways, private garages, and commercial premises. Please let our collection team know if your vehicle has flat tyres, steering lock issues, or restricted driveway access.'
    ],
    faqsHeading: 'Chester Scrap Car FAQs',
    faqs: [
      [
        'Which postcode districts are covered for scrap car collection under Chester?',
        'We provide free scrap car collection across 20 confirmed postal districts: CH1, CH2, CH3, CH4 (Chester), CH5, CH6, CH7, CH8 (Flintshire & Deeside), CH41, CH42, CH43, CH44, CH49, CH60, CH61, CH62, CH63 (Wirral), and CH64, CH65, CH66 (Ellesmere Port & Neston). Enter your full postcode in our quote tool to verify coverage for your specific address.'
      ],
      [
        'How is my scrap car valuation calculated in Chester?',
        'Your scrap valuation is calculated based on your vehicle registration details, recorded vehicle kerb weight, and configured price-per-tonne scrap metal rates for supported regional areas. The online valuation provides an upfront estimate before you confirm your collection booking.'
      ],
      [
        'Can you collect a car that does not start or has no MOT in Chester?',
        'Yes. An active MOT certificate, road tax, or insurance is not required for vehicle collection. Our licensed recovery partners collect non-running, SORN, and accident-damaged cars directly from your location with no transport fees.'
      ],
      [
        'What documents do I need to scrap my vehicle in Chester?',
        'You will need your V5C registration certificate (logbook) and valid photo identification such as a UK driving licence or passport. If your V5C logbook is missing, you can still scrap your car by providing proof of ownership and photo ID so our recovery driver can verify keeper identity.'
      ],
      [
        'How and when is payment processed for my scrap car?',
        'Under the Scrap Metal Dealers Act 2013, cash payments for scrap cars are illegal in England and Wales. Payment is processed securely via electronic bank transfer upon vehicle inspection and handover before the recovery driver departs.'
      ]
    ],
    nearbyLocations: [
      { name: 'Liverpool', slug: 'liverpool' },
      { name: 'Crewe', slug: 'crewe' },
      { name: 'Warrington', slug: 'warrington' }
    ]
  }
};

export function getDefaultCityFaqs(cityName) {
  const city = cityName || 'your area';
  return [
    [
      `How do I scrap my car in ${city}?`,
      `To scrap your car in ${city}, simply enter your vehicle registration and collection postcode into our online quote tool for a fast scrap valuation. Once accepted, free collection is arranged from your address.`
    ],
    [
      `How do I get a scrap car quote in ${city}?`,
      `Enter your vehicle registration and collection postcode into our online valuation form to receive an instant scrap car quote for ${city} with no obligation.`
    ],
    [
      `Can you collect a non-running or MOT-failed car in ${city}?`,
      `Yes. Non-running or MOT-failed vehicles do not need to be driven to a scrap yard. Free collection can be arranged directly from your location where supported in and around ${city}.`
    ],
    [
      `Is scrap car collection free in ${city}?`,
      `Yes. Free scrap car collection is provided across supported locations in and around ${city}, with no hidden fees or separate transport charges.`
    ],
    [
      `How is payment handled when I scrap my car?`,
      `Payment is made securely by bank transfer upon collection of your scrap car, in full compliance with the Scrap Metal Dealers Act.`
    ]
  ];
}

export function formatCityLocation(city) {
  const slug = (city.slug || city.name.toLowerCase().replace(/\s+/g, "-")).toLowerCase();
  const postcodes = Array.isArray(city.postcodes) ? city.postcodes : [];
  const postcodesText = postcodes.length > 0 ? postcodes.join(", ") : "";

  const staticFallback = CITY_METADATA_FALLBACKS[slug];

  // Preserve verified readable named areas if they exist in static fallback data
  const hasFallbackNamedAreas = Array.isArray(staticFallback?.areas) && staticFallback.areas.length > 0;
  const namedAreas = hasFallbackNamedAreas ? staticFallback.areas : [];

  const fallback = staticFallback || {
    code: postcodesText || city.name.slice(0, 3).toUpperCase(),
    description: `Scrap car collection available across ${city.name} and surrounding areas.`,
    areas: [],
  };

  return {
    id: city.id || slug,
    city: city.name,
    name: city.name,
    slug,
    postcodes,
    namedAreas,
    hasNamedAreas: namedAreas.length > 0,
    code: city.code || (postcodesText || fallback.code),
    description: city.description || fallback.description,
    // If verified readable named areas exist in fallback, prioritize them; otherwise use verified postcodes
    areas: namedAreas.length > 0 ? namedAreas : (postcodes.length > 0 ? postcodes : []),
    ratePerTon: city.ratePerTon || 235,
    dealerCount: city.dealerCount || 0,
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
