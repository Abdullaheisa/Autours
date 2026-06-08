import { assets } from '@/config/assets';

export interface Country {
  id: string;
  name: string;
  image: string;
  code: string;
}

export const countries: Country[] = [
  { id: 'bahrain', name: 'Bahrain', image: assets.countries.bahrain, code: 'BH' },
  { id: 'egypt', name: 'Egypt', image: assets.countries.egypt, code: 'EG' },
  { id: 'jordan', name: 'Jordan', image: assets.countries.jordan, code: 'JO' },
  { id: 'kuwait', name: 'Kuwait', image: assets.countries.kuwait, code: 'KW' },
  { id: 'oman', name: 'Oman', image: assets.countries.oman, code: 'OM' },
  { id: 'qatar', name: 'Qatar', image: assets.countries.qatar, code: 'QA' },
  { id: 'saudi', name: 'Saudi Arabia', image: assets.countries.saudi, code: 'SA' },
  { id: 'uae', name: 'UAE', image: assets.countries.uae, code: 'AE' },
];
