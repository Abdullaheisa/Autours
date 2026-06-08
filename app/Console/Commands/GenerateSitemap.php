<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Blog;
use App\Models\BlogCategory;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

class GenerateSitemap extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sitemap:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate public/sitemap.xml from dynamic content (blogs, pages, etc.)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        try {
            $xml = $this->buildXml();
            $path = public_path('sitemap.xml');

            file_put_contents($path, $xml);

            $this->info("Sitemap generated: {$path}");
            Log::info('Sitemap generated successfully.', ['path' => $path]);

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('Sitemap generation failed: ' . $e->getMessage());
            Log::error('Sitemap generation failed', ['error' => $e->getMessage()]);

            return self::FAILURE;
        }
    }

    /**
     * Build the sitemap XML string.
     */
    private function buildXml(): string
    {
        $urls = $this->staticUrls();

        // ------------------------------------------------------------------
        // Blog posts
        // ------------------------------------------------------------------
        Blog::query()
            ->where('is_published', true)
            ->whereNotNull('slug')
            ->where('slug', '!=', '')
            ->select(['slug', 'updated_at', 'created_at'])
            ->orderByDesc('updated_at')
            ->chunk(100, function ($blogs) use (&$urls) {
                foreach ($blogs as $blog) {
                    $lastModified = $blog->updated_at ?? $blog->created_at;

                    $urls[] = [
                        'loc'        => url('/blogs/' . $blog->slug),
                        'lastmod'    => $lastModified ? $lastModified->toAtomString() : null,
                        'changefreq' => 'weekly',
                        'priority'   => '0.70',
                    ];
                }
            });

        // ------------------------------------------------------------------
        // Blog categories
        // ------------------------------------------------------------------
        BlogCategory::query()
            ->where('activation', true)
            ->select(['id', 'updated_at', 'created_at'])
            ->orderByDesc('updated_at')
            ->chunk(100, function ($categories) use (&$urls) {
                foreach ($categories as $category) {
                    $lastModified = $category->updated_at ?? $category->created_at;

                    $urls[] = [
                        'loc'        => url('/blogs?category=' . $category->id),
                        'lastmod'    => $lastModified ? $lastModified->toAtomString() : null,
                        'changefreq' => 'weekly',
                        'priority'   => '0.60',
                    ];
                }
            });

        $xmlLines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ];

        foreach ($urls as $url) {
            $xmlLines[] = '  <url>';
            $xmlLines[] = '    <loc>' . $this->escapeForXml($url['loc']) . '</loc>';

            if (! empty($url['lastmod'])) {
                $xmlLines[] = '    <lastmod>' . $this->escapeForXml($url['lastmod']) . '</lastmod>';
            }

            if (! empty($url['changefreq'])) {
                $xmlLines[] = '    <changefreq>' . $this->escapeForXml($url['changefreq']) . '</changefreq>';
            }

            if (! empty($url['priority'])) {
                $xmlLines[] = '    <priority>' . $this->escapeForXml($url['priority']) . '</priority>';
            }

            $xmlLines[] = '  </url>';
        }

        $xmlLines[] = '</urlset>';

        return implode("\n", $xmlLines);
    }

    /**
     * Static/public pages that never change.
     *
     * @return array<int, array<string, string|null>>
     */
    private function staticUrls(): array
    {
        return [
            [
                'loc'        => url('/'),
                'changefreq' => 'daily',
                'priority'   => '1.00',
            ],
            [
                'loc'        => url('/v2'),
                'changefreq' => 'weekly',
                'priority'   => '0.80',
            ],
            [
                'loc'        => url('/about-us'),
                'changefreq' => 'monthly',
                'priority'   => '0.70',
            ],
            [
                'loc'        => url('/why_autours'),
                'changefreq' => 'monthly',
                'priority'   => '0.70',
            ],
            [
                'loc'        => url('/where-we-are'),
                'changefreq' => 'monthly',
                'priority'   => '0.70',
            ],
            [
                'loc'        => url('/contact-us'),
                'changefreq' => 'monthly',
                'priority'   => '0.60',
            ],
            [
                'loc'        => url('/blogs'),
                'changefreq' => 'daily',
                'priority'   => '0.90',
            ],
        ];
    }

    /**
     * Escape a string for safe XML output.
     */
    private function escapeForXml(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_COMPAT, 'UTF-8');
    }
}
