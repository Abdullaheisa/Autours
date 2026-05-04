<?php

namespace Tests\Feature;

use Tests\TestCase;

class SitemapTest extends TestCase
{
    public function test_sitemap_endpoint_returns_xml(): void
    {
        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
        $response->assertSee('<?xml version="1.0" encoding="UTF-8"?>', false);
        $response->assertSee('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', false);
    }

    public function test_sitemap_contains_key_public_urls(): void
    {
        $response = $this->get('/sitemap.xml');

        $response->assertSee('<loc>' . url('/') . '</loc>', false);
        $response->assertSee('<loc>' . url('/blogs') . '</loc>', false);
        $response->assertSee('<loc>' . url('/contact-us') . '</loc>', false);
    }
}

