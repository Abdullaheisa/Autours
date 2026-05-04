
<html lang="en">

<head>

    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
    <title>Autours</title>
    <link rel="icon" type="image/x-icon" href="{{url('/images/favicon512*256.png')}}" sizes="32x32">
    <link rel="stylesheet" href="{{url('assets/css/styles.css')}}" />
{{--    <link rel="stylesheet" href="{{url('assets/css/spinner.css')}}" />--}}
    <link rel="stylesheet" href="{{url('assets/css/fontawesome/css/fontawesome.min.css')}}" />
    <link rel="stylesheet" href="{{url('assets/css/fontawesome/css/solid.min.css')}}" />
    <link rel="stylesheet" href="{{url('assets/css/fontawesome/css/brands.min.css')}}" />
    <link rel="stylesheet" href="{{url('assets/css/fontawesome/css/all.min.css')}}" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <meta name="google-site-verification" content="FxPJTO-NvFJRMu_l6bfJ5gStyUaVAjBDUHuqI3KAAf8" />
    <meta name="description" content="Autours offers reliable car rental and travel services with competitive prices, easy booking, and trusted support. Book your ride today.">

    <meta name="keywords" content="car rental, autours, rent a car, travel services, vehicle booking">

    <meta name="robots" content="index, follow">

    <link rel="canonical" href="{{ url()->current() }}">

    @vite('resources/js/app.js')
    @inertiaHead
</head>
<body>
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
    fbq('track', 'PageView');
</script>

<script>
    fbq('track', 'ViewContent', {
        content_name: '',
        content_category: '',
        content_ids: ['']
    });
</script>


<script>
    document.getElementById("book-btn").addEventListener("click", function() {
        fbq('track', 'InitiateCheckout', {
            content_name: '',
            content_category: ''
        });
    });
</script>



<script>
    fbq('trackCustom', 'StartBooking', {
        tour_name: ''
    });
</script>


<script>
    document.getElementById("booking-form").addEventListener("submit", function() {
        fbq('track', 'AddToCart', {
            content_name: ''
        });
    });
</script>


<script>
    fbq('track', 'Purchase', {
        value:
        currency: 'USD',
        content_name: ''
    });
</script>

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
    fbq('init', '1313651383940831');
    fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
               src="https://www.facebook.com/tr?id=1313651383940831&ev=PageView&noscript=1"
    /></noscript>
<!-- End Meta Pixel Code -->
</html>
