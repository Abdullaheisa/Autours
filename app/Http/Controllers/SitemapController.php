<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Support\Facades\Cache;
use Throwable;

class SitemapController extends Controller
{
    public function index()
    {
        $xml = Cache::remember('sitemap.xml', now()->addMinutes(30), function () {
            return $this->buildXml();
        });

        return response($xml, 200)
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    private function buildXml(): string
    {
        $urls = $this->staticUrls();

        try {
            $blogs = Blog::query()
                ->where('is_published', true)
                ->whereNotNull('slug')
                ->where('slug', '!=', '')
                ->select(['slug', 'updated_at', 'created_at'])
                ->orderByDesc('updated_at')
                ->get();

            foreach ($blogs as $blog) {
                $lastModified = $blog->updated_at ?? $blog->created_at;

                $urls[] = [
                    'loc' => url('/blogs/' . $blog->slug),
                    'lastmod' => $lastModified ? $lastModified->toAtomString() : null,
                    'changefreq' => 'weekly',
                    'priority' => '0.70',
                ];
            }
        } catch (Throwable $exception) {
            report($exception);
        }

        $xmlLines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ];

        foreach ($urls as $url) {
            $xmlLines[] = '  <url>';
            $xmlLines[] = '    <loc>' . $this->escapeForXml($url['loc']) . '</loc>';

            if (!empty($url['lastmod'])) {
                $xmlLines[] = '    <lastmod>' . $this->escapeForXml($url['lastmod']) . '</lastmod>';
            }

            if (!empty($url['changefreq'])) {
                $xmlLines[] = '    <changefreq>' . $this->escapeForXml($url['changefreq']) . '</changefreq>';
            }

            if (!empty($url['priority'])) {
                $xmlLines[] = '    <priority>' . $this->escapeForXml($url['priority']) . '</priority>';
            }

            $xmlLines[] = '  </url>';
        }

        $xmlLines[] = '</urlset>';

        return implode("\n", $xmlLines);
    }

    private function staticUrls(): array
    {
        return [
            [
                'loc' => url('/'),
                'changefreq' => 'daily',
                'priority' => '1.00',
            ],
            [
                'loc' => url('/v2'),
                'changefreq' => 'weekly',
                'priority' => '0.80',
            ],
            [
                'loc' => url('/about-us'),
                'changefreq' => 'monthly',
                'priority' => '0.70',
            ],
            [
                'loc' => url('/why_autours'),
                'changefreq' => 'monthly',
                'priority' => '0.70',
            ],
            [
                'loc' => url('/where-we-are'),
                'changefreq' => 'monthly',
                'priority' => '0.70',
            ],
            [
                'loc' => url('/contact-us'),
                'changefreq' => 'monthly',
                'priority' => '0.60',
            ],
            [
                'loc' => url('/blogs'),
                'changefreq' => 'daily',
                'priority' => '0.90',
            ],
        ];
    }

    private function escapeForXml(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_COMPAT, 'UTF-8');
    }
}

