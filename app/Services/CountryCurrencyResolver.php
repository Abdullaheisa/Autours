<?php

declare(strict_types=1);

namespace App\Services;

/**
 * Centralised ISO-3166-1 alpha-2 country code → ISO-4217 currency code
 * and country-name resolver.
 *
 * Every external-supplier branch sync command should call these static
 * methods instead of maintaining its own private mapping.
 */
class CountryCurrencyResolver
{
    /**
     * Resolve the ISO-4217 currency code for a given ISO-3166-1 alpha-2 country code.
     *
     * @param string $countryCode  Two-letter country code (e.g. "TR", "AE", "GR")
     * @return string              Three-letter currency code (e.g. "TRY", "AED", "EUR")
     */
    public static function resolveCurrency(string $countryCode): string
    {
        return match (strtoupper(trim($countryCode))) {
            // --- Middle East & Africa ---
            'AE' => 'AED',
            'BH' => 'BHD',
            'EG' => 'EGP',
            'JO' => 'JOD',
            'KE' => 'KES',
            'KW' => 'KWD',
            'MA' => 'MAD',
            'MU' => 'MUR',
            'OM' => 'OMR',
            'QA' => 'QAR',
            'SA' => 'SAR',
            'SC' => 'SCR',
            'TZ' => 'TZS',
            'ZA' => 'ZAR',
            'ZM' => 'ZMW',

            // --- Europe (Eurozone) ---
            'AT' => 'EUR',
            'BE' => 'EUR',
            'CY' => 'EUR',
            'DE' => 'EUR',
            'EE' => 'EUR',
            'ES' => 'EUR',
            'FI' => 'EUR',
            'FR' => 'EUR',
            'GR' => 'EUR',
            'HR' => 'EUR',
            'IE' => 'EUR',
            'IT' => 'EUR',
            'LT' => 'EUR',
            'LU' => 'EUR',
            'LV' => 'EUR',
            'ME' => 'EUR',
            'MF' => 'EUR',
            'MT' => 'EUR',
            'NL' => 'EUR',
            'PT' => 'EUR',
            'SI' => 'EUR',
            'SK' => 'EUR',
            'XK' => 'EUR',

            // --- Europe (non-Eurozone) ---
            'AL' => 'ALL',
            'AM' => 'AMD',
            'AZ' => 'AZN',
            'BA' => 'BAM',
            'BG' => 'BGN',
            'BY' => 'BYN',
            'CH' => 'CHF',
            'CZ' => 'CZK',
            'DK' => 'DKK',
            'GB' => 'GBP',
            'GE' => 'GEL',
            'HU' => 'HUF',
            'IS' => 'ISK',
            'MD' => 'MDL',
            'MK' => 'MKD',
            'NO' => 'NOK',
            'PL' => 'PLN',
            'RO' => 'RON',
            'RS' => 'RSD',
            'RU' => 'RUB',
            'SE' => 'SEK',
            'TR' => 'TRY',
            'UA' => 'UAH',

            // --- Americas ---
            'AR' => 'ARS',
            'CL' => 'CLP',
            'CO' => 'COP',
            'DO' => 'DOP',
            'GT' => 'GTQ',
            'MX' => 'MXN',
            'PA' => 'PAB',
            'PR' => 'USD',
            'US' => 'USD',
            'UY' => 'UYU',

            // --- Caribbean & Central America ---
            'AG' => 'XCD',
            'AI' => 'XCD',
            'AW' => 'AWG',
            'BB' => 'BBD',
            'BS' => 'BSD',
            'CW' => 'ANG',
            'GD' => 'XCD',
            'GP' => 'EUR',
            'JM' => 'JMD',
            'LC' => 'XCD',
            'SX' => 'ANG',
            'TT' => 'TTD',

            // --- Asia & Oceania ---
            'AU' => 'AUD',
            'FJ' => 'FJD',
            'LK' => 'LKR',
            'MY' => 'MYR',
            'NZ' => 'NZD',
            'UZ' => 'UZS',

            default => 'EUR',
        };
    }

    /**
     * Resolve the full country name for a given ISO-3166-1 alpha-2 country code.
     *
     * @param string $countryCode  Two-letter country code
     * @return string              Full country name, or the raw code if unknown
     */
    public static function resolveCountryName(string $countryCode): string
    {
        $code = strtoupper(trim($countryCode));

        if (empty($code)) {
            return '';
        }

        return match ($code) {
            // --- Middle East & Africa ---
            'AE' => 'United Arab Emirates',
            'BH' => 'Bahrain',
            'EG' => 'Egypt',
            'JO' => 'Jordan',
            'KE' => 'Kenya',
            'KW' => 'Kuwait',
            'MA' => 'Morocco',
            'MU' => 'Mauritius',
            'MW' => 'Malawi',
            'OM' => 'Oman',
            'QA' => 'Qatar',
            'SA' => 'Saudi Arabia',
            'SC' => 'Seychelles',
            'TZ' => 'Tanzania',
            'ZA' => 'South Africa',
            'ZM' => 'Zambia',

            // --- Europe ---
            'AL' => 'Albania',
            'AM' => 'Armenia',
            'AT' => 'Austria',
            'AZ' => 'Azerbaijan',
            'BA' => 'Bosnia and Herzegovina',
            'BE' => 'Belgium',
            'BG' => 'Bulgaria',
            'BY' => 'Belarus',
            'CH' => 'Switzerland',
            'CY' => 'Cyprus',
            'CZ' => 'Czech Republic',
            'DE' => 'Germany',
            'DK' => 'Denmark',
            'EE' => 'Estonia',
            'ES' => 'Spain',
            'FI' => 'Finland',
            'FR' => 'France',
            'GB' => 'United Kingdom',
            'GE' => 'Georgia',
            'GR' => 'Greece',
            'HR' => 'Croatia',
            'HU' => 'Hungary',
            'IE' => 'Ireland',
            'IS' => 'Iceland',
            'IT' => 'Italy',
            'LT' => 'Lithuania',
            'LU' => 'Luxembourg',
            'LV' => 'Latvia',
            'MD' => 'Moldova',
            'ME' => 'Montenegro',
            'MF' => 'Saint Martin',
            'MK' => 'North Macedonia',
            'MT' => 'Malta',
            'NL' => 'Netherlands',
            'NO' => 'Norway',
            'PL' => 'Poland',
            'PT' => 'Portugal',
            'RO' => 'Romania',
            'RS' => 'Serbia',
            'RU' => 'Russia',
            'SE' => 'Sweden',
            'SI' => 'Slovenia',
            'SK' => 'Slovakia',
            'SX' => 'Sint Maarten',
            'TR' => 'Turkey',
            'UA' => 'Ukraine',
            'XK' => 'Kosovo',

            // --- Americas & Caribbean ---
            'AG' => 'Antigua and Barbuda',
            'AI' => 'Anguilla',
            'AR' => 'Argentina',
            'AW' => 'Aruba',
            'BB' => 'Barbados',
            'BS' => 'Bahamas',
            'CL' => 'Chile',
            'CO' => 'Colombia',
            'CW' => 'Curaçao',
            'DO' => 'Dominican Republic',
            'GD' => 'Grenada',
            'GP' => 'Guadeloupe',
            'GT' => 'Guatemala',
            'JM' => 'Jamaica',
            'LC' => 'St. Lucia',
            'MX' => 'Mexico',
            'PA' => 'Panama',
            'PR' => 'Puerto Rico',
            'SX' => 'Sint Maarten',
            'TT' => 'Trinidad and Tobago',
            'US' => 'United States',
            'UY' => 'Uruguay',

            // --- Asia & Oceania ---
            'AU' => 'Australia',
            'FJ' => 'Fiji',
            'LK' => 'Sri Lanka',
            'MY' => 'Malaysia',
            'NZ' => 'New Zealand',
            'UZ' => 'Uzbekistan',

            default => $code,
        };
    }

    /**
     * Resolve the ISO-4217 currency code from a full country name.
     *
     * Useful for suppliers (like Jimpisoft) that detect country by name
     * rather than by ISO code.
     *
     * @param string $countryName  Full country name (e.g. "Turkey", "United Arab Emirates")
     * @return string              Three-letter currency code
     */
    public static function resolveCurrencyByCountryName(string $countryName): string
    {
        $code = self::resolveCountryCode($countryName);

        return self::resolveCurrency($code);
    }

    /**
     * Reverse-lookup: full country name → ISO-3166-1 alpha-2 code.
     *
     * Falls back to '' if the name is not recognised.
     *
     * @param string $countryName
     * @return string
     */
    public static function resolveCountryCode(string $countryName): string
    {
        return match (strtolower(trim($countryName))) {
            'united arab emirates', 'uae' => 'AE',
            'bahrain' => 'BH',
            'egypt' => 'EG',
            'jordan' => 'JO',
            'kuwait' => 'KW',
            'morocco' => 'MA',
            'mauritius' => 'MU',
            'oman' => 'OM',
            'qatar' => 'QA',
            'saudi arabia' => 'SA',
            'seychelles' => 'SC',
            'south africa' => 'ZA',
            'albania' => 'AL',
            'armenia' => 'AM',
            'austria' => 'AT',
            'azerbaijan' => 'AZ',
            'bosnia and herzegovina', 'bosnia' => 'BA',
            'belgium' => 'BE',
            'bulgaria' => 'BG',
            'belarus' => 'BY',
            'switzerland' => 'CH',
            'cyprus' => 'CY',
            'czech republic', 'czechia' => 'CZ',
            'germany' => 'DE',
            'denmark' => 'DK',
            'estonia' => 'EE',
            'spain' => 'ES',
            'finland' => 'FI',
            'france' => 'FR',
            'united kingdom', 'uk' => 'GB',
            'georgia' => 'GE',
            'greece' => 'GR',
            'croatia' => 'HR',
            'hungary' => 'HU',
            'ireland' => 'IE',
            'iceland' => 'IS',
            'italy' => 'IT',
            'lithuania' => 'LT',
            'luxembourg' => 'LU',
            'latvia' => 'LV',
            'moldova' => 'MD',
            'montenegro' => 'ME',
            'saint martin' => 'MF',
            'north macedonia', 'macedonia' => 'MK',
            'malta' => 'MT',
            'netherlands' => 'NL',
            'norway' => 'NO',
            'poland' => 'PL',
            'portugal' => 'PT',
            'romania' => 'RO',
            'serbia' => 'RS',
            'russia' => 'RU',
            'sweden' => 'SE',
            'slovenia' => 'SI',
            'slovakia' => 'SK',
            'sint maarten' => 'SX',
            'turkey' => 'TR',
            'ukraine' => 'UA',
            'kosovo' => 'XK',
            'argentina' => 'AR',
            'chile' => 'CL',
            'colombia' => 'CO',
            'dominican republic' => 'DO',
            'guatemala' => 'GT',
            'mexico' => 'MX',
            'panama' => 'PA',
            'puerto rico' => 'PR',
            'united states', 'usa' => 'US',
            'uruguay' => 'UY',
            'australia' => 'AU',
            'sri lanka' => 'LK',
            'malaysia' => 'MY',
            'new zealand' => 'NZ',
            'uzbekistan' => 'UZ',
            default => '',
        };
    }
}
