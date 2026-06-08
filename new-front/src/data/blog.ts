export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    image?: string;
    role?: string;
  };
  date: string;
  category: string;
  image: string;
  readingTime: string;
  faqs?: { q: string; a: string }[];
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'car-rental-dubai-prices-requirements-2026',
    title: 'Car Rental in Dubai: Prices, Requirements, and Best Options in 2026',
    excerpt: 'Planning a trip to Dubai? Learn everything you need to know about renting a car, from costs to legal requirements and top agencies.',
    category: 'Country Travel Guides',
    date: 'May 7, 2026',
    author: { name: 'Waleed Al Naggar', image: '/img/authors/waleed.jpg' },
    image: 'https://images.unsplash.com/photo-1517672651691-24622a91b550?q=80&w=2000&auto=format&fit=crop',
    readingTime: '8 min read',
    content: `
      <p>Renting a car in Dubai is one of the best ways to explore the city and its surrounding areas. Whether you're here for business or leisure, having your own set of wheels gives you the freedom to move at your own pace.</p>
      <h2>What are the requirements?</h2>
      <p>To rent a car in Dubai, you typically need a valid driving license, a passport, and a credit card for the security deposit. If you are a visitor, an International Driving Permit (IDP) might be required depending on your home country.</p>
      <h2>Average Costs</h2>
      <p>Prices vary based on the car type and rental duration. Economy cars can start from $30/day, while luxury SUVs can go up to $500/day or more.</p>
    `,
    faqs: [
      { q: 'Can I rent a car with a US license?', a: 'Yes, US citizens can rent cars in Dubai using their valid US driving license without an IDP.' },
      { q: 'Is insurance mandatory?', a: 'Yes, basic insurance is mandatory for all rental cars in the UAE.' }
    ]
  },
  {
    id: '2',
    slug: 'daily-vs-monthly-car-rental-uae',
    title: 'Daily vs Monthly Car Rental in UAE: Which Option Offers Better Value?',
    excerpt: 'We compare the pros and cons of daily and monthly rentals to help you decide which one suits your budget and needs better.',
    category: 'Money Saving Tips',
    date: 'April 16, 2026',
    author: { name: 'Yomna Ayman', image: '/img/authors/yomna.jpg' },
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=2000&auto=format&fit=crop',
    readingTime: '6 min read',
    content: `
      <p>Choosing between a daily and monthly rental depends on your stay duration and usage frequency. Monthly rentals often come with significant discounts and lower daily rates.</p>
      <h2>Pros of Monthly Rentals</h2>
      <ul>
        <li>Significant cost savings (up to 40% off daily rates)</li>
        <li>Less paperwork and renewals</li>
        <li>Convenience for long-term stays</li>
      </ul>
    `,
  },
  {
    id: '3',
    slug: 'car-rental-security-deposit-explained',
    title: 'Car Rental Security Deposit Explained: What You Need to Know Before You Book',
    excerpt: 'Confused about security deposits? We explain how they work, why they are required, and how to get yours back quickly.',
    category: 'Money Saving Tips',
    date: 'April 5, 2026',
    author: { name: 'Waleed Al Naggar', image: '/img/authors/waleed.jpg' },
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2000&auto=format&fit=crop',
    readingTime: '10 min read',
    content: `
      <p>When renting a car, one of the most common concerns travelers face is the car rental security deposit. It may seem like an unnecessary hold on your money, but in reality, it plays a crucial role in the rental process.</p>
      <h2>What is a Car Rental Security Deposit?</h2>
      <p>A car rental security deposit is a temporary amount held by the rental company to cover any potential costs that may occur during your rental period, such as traffic fines, fuel charges, or minor damages.</p>
      <h2>How it Works</h2>
      <p>The amount is usually blocked on your credit card and released once the car is returned in the same condition.</p>
    `,
  },
  {
    id: '4',
    slug: 'uae-car-rental-insurance-guide',
    title: 'UAE Car Rental Insurance Guide | What You Need to Know',
    excerpt: 'Everything you need to know about CDW, PAI, and Theft Waiver when renting a car in the United Arab Emirates.',
    category: 'Country Travel Guides',
    date: 'April 4, 2026',
    author: { name: 'Waleed Al Naggar', image: '/img/authors/waleed.jpg' },
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2000&auto=format&fit=crop',
    readingTime: '7 min read',
    content: `
      <p>Insurance is a vital part of any car rental agreement. In the UAE, basic third-party insurance is mandatory, but there are several optional covers you should consider.</p>
      <h2>Collision Damage Waiver (CDW)</h2>
      <p>CDW reduces your financial liability in case of an accident. It is highly recommended for peace of mind.</p>
    `,
  }
];
