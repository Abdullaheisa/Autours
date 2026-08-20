<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
    @if(isset($page['props']['initialBlog']))
        <title>{{ $page['props']['initialBlog']['title'] ?? 'Blog Details' }} - Autours</title>
        <meta name="description" content="{{ $page['props']['initialBlog']['meta_description'] ?? strip_tags(Str::limit($page['props']['initialBlog']['content'], 150)) }}">
        <meta property="og:title" content="{{ $page['props']['initialBlog']['title'] ?? '' }}">
        @if(!empty($page['props']['initialBlog']['image']))
            <meta property="og:image" content="{{ url('/img/blogs/' . $page['props']['initialBlog']['image']) }}">
        @endif
    @else
        <title>Autours</title>
        <meta name="description" content="Autours offers reliable car rental and travel services with competitive prices, easy booking, and trusted support. Book your ride today.">
    @endif

    <link rel="icon" href="{{url('/favicon.ico')}}" sizes="any">
    <link rel="apple-touch-icon" href="{{url('/images/favicon512_256.png')}}">
    <link rel="stylesheet" href="{{url('assets/css/styles.css')}}" />
{{--    <link rel="stylesheet" href="{{url('assets/css/spinner.css')}}" />--}}
    <link rel="stylesheet" href="{{url('assets/css/fontawesome/css/fontawesome.min.css')}}" />
    <link rel="stylesheet" href="{{url('assets/css/fontawesome/css/solid.min.css')}}" />
    <link rel="stylesheet" href="{{url('assets/css/fontawesome/css/brands.min.css')}}" />
    <link rel="stylesheet" href="{{url('assets/css/fontawesome/css/all.min.css')}}" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <meta name="google-site-verification" content="FxPJTO-NvFJRMu_l6bfJ5gStyUaVAjBDUHuqI3KAAf8" />

    <meta name="keywords" content="car rental, autours, rent a car, travel services, vehicle booking">

    <meta name="robots" content="index, follow">

    <link rel="canonical" href="{{ url()->current() }}">
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1377275434528711');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1377275434528711&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->
    @vite('resources/js/app.js')
    @inertiaHead
</head>
<body>
@if(isset($page['props']['initialBlog']))
    <!-- SEO Content Fallback for Crawlers that do not execute JavaScript -->
    <noscript>
        <article>
            <h1>{{ $page['props']['initialBlog']['title'] }}</h1>
            <p>By {{ $page['props']['initialBlog']['author'] }}</p>
            <div>{!! $page['props']['initialBlog']['content'] !!}</div>
        </article>
    </noscript>
@endif
@inertia
</body>
<script src="{{url('assets/libs/jquery/dist/jquery.min.js')}}"></script>
<script src="{{url('assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js')}}"></script>
<script src="{{url('assets/js/sidebarmenu.js')}}"></script>
<script src="{{url('assets/js/app.min.js')}}"></script>
<script src="{{url('assets/libs/apexcharts/dist/apexcharts.min.js')}}"></script>
<script src="{{url('assets/libs/simplebar/dist/simplebar.js')}}"></script>
<script src="{{url('assets/js/dashboard.js')}}"></script>

<script>
    if (typeof fbq !== 'undefined') {
        fbq('track', 'ViewContent', {
            content_name: '',
            content_category: '',
            content_ids: ['']
        });

        fbq('trackCustom', 'StartBooking', {
            tour_name: ''
        });

        fbq('track', 'Purchase', {
            value: 0,
            currency: 'USD',
            content_name: ''
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        var bookBtn = document.getElementById("book-btn");
        if (bookBtn) {
            bookBtn.addEventListener("click", function() {
                if (typeof fbq !== 'undefined') {
                    fbq('track', 'InitiateCheckout', {
                        content_name: '',
                        content_category: ''
                    });
                }
            });
        }

        var bookingForm = document.getElementById("booking-form");
        if (bookingForm) {
            bookingForm.addEventListener("submit", function() {
                if (typeof fbq !== 'undefined') {
                    fbq('track', 'AddToCart', {
                        content_name: ''
                    });
                }
            });
        }
    });
</script>
</body>
</html>
