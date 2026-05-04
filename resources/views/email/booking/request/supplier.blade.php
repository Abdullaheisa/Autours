<html lang="en">
<head>
    <link rel="stylesheet" href="{{url('assets/css/styles.css')}}" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.1/css/all.min.css" integrity="sha256-2XFplPlrFClt0bIdPgpz8H7ojnk10H69xRqd9+uTShA=" crossorigin="anonymous"/>
</head>
<body>
<div class="container">
    <div class="card">
        <div class="card-body">

            <div class="table-responsive mb-5">
                <div class="col-md-12">
                    <div class="text-muted ">
                        <table class="table align-middle table-nowrap table-centered mb-0">

                            <thead>
                            <tr>
                                <img src="{{url('images/favicon.png')}}" width="100" height="100"/>
                            </tr>
                            </thead>
                        </table>
                        <table class="table align-middle table-nowrap table-centered mb-0">
                            <thead>
                            <tr>
                                <th style="width: 250px;"><h3>Hi {{json_decode($body)->customer->name}} !</h3></th>
                                <th style="width: 250px;"><h4>Invoice {{json_decode($body)->order_number}} </h4></th>
                                <th style="width: 250px;"><span class="badge bg-warning font-size-12 ms-2">Pending  </span></th>
                            </tr>
                            </thead>
                        </table>
                    </div>
                </div>
            </div>
            <h3>This is a Rental Request from : {{json_decode($body)->customer->name}} </h3>
            <thead>
            <tr>
                <th style="width: 250px;"><p class="mb-1">{{json_decode($body)->customer->address}}</p>
                </th>
                <th style="width: 250px;"><p>Email:<i
                            class="uil uil-envelope-alt me-1"></i>{{json_decode($body)->customer->email}}
                    </p></th>
                <th style="width: 250px;"><p>Phone:<i
                            class="uil uil-phone me-1"></i>{{json_decode($body)->customer->phone_num}}
                    </p></th>
            </tr>
            </thead>
            <div class="table-responsive mb-5">
                <div class="col-md-12">
                    <div class="text-muted">

                        <table class="table table-nowrap table-centered mb-0">

                            <div class="row">
                                <div class="col-md-6">
                                    <img src="{{url('img/vehicles').'/' . json_decode($body)->vehicle->photo}}"
                                         height="200"
                                         width="320"/>
                                </div>
                                <div class="col-md-6">
                                    <div class="text-muted">

                                    </div>
                                </div>
                            </div>
                            <thead>
                            <tr>
                                <th class="row"><p>The Car model is {{json_decode($body)->vehicle->name}}</p></th>
                                <th class="row"><p>Billed To: Autours</p></th>
                            </tr>
                            </thead>
                            <thead>
                            <tr>
                                <th class="row" style="width: 800px"><h5 class="col-md-2">Pick-up:</h5>
                                    <p class="col-md-8">{{json_decode($body)->branch->adresse}}</p></th>
                                <th class="row" style="width: 800px"><h5 class="col-md-2">Drop-off:</h5>
                                    <p class="col-md-8">{{json_decode($body)->branch->adresse}}</p></th>
                            </tr>
                            </thead>
                        </table>
                    </div>
                </div>
            </div>


            <div class="table-responsive mb-5">
                <div class="col-md-12">
                    <div class="text-muted text-sm-end">
                        <table class="table align-middle table-nowrap table-centered mb-0">

                            <!-- end col -->

                            <thead>
                            <tr>
                                <th style="width: 250px;">Order No:</th>
                                <th style="width: 250px;">Invoice No:</th>
                                <th style="width: 250px;">Invoice Date:</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td style="width: 250px;">#{{json_decode($body)->id}}</td>
                                <td style="width: 250px;">
                                    <div>
                                        {{json_decode($body)->order_number}}
                                    </div>
                                </td>
                                <td style="width: 250px;">{{\Carbon\Carbon::parse(json_decode($body)->created_at)->toDateString()}}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <!-- end col -->
            <!-- end row -->

            <div class="py-2">
                <h5 class="font-size-15">Order Summary</h5>

                <div class="table-responsive">
                    <table class="table align-middle table-nowrap table-centered mb-0">
                        <thead>
                        <tr>
                            <th style="width: 100px;">No.</th>
                            <th style="width: 200px;">Vehicle model</th>
                            <th style="width: 200px;">Price Per Night</th>
                            <th style="width: 200px;">Number Of days</th>
                            <th class="text-end" style="width: 120px;">Total</th>
                        </tr>
                        </thead><!-- end thead -->
                        <tbody>
                        <tr>
                            <th scope="row">01</th>
                            <td>
                                <div>
                                    <h5 class="text-truncate font-size-14 mb-1">{{json_decode($body)->vehicle->name}}</h5>
                                </div>
                            </td>
                            <td>{{ json_decode($body)->currency . ' ' . (json_decode($body)->price / json_decode($body)->number_of_days)}}</td>
                            <td>{{json_decode($body)->number_of_days}}</td>
                            <td class="text-end">{{ json_decode($body)->currency . ' ' .json_decode($body)->price}}</td>
                        </tr>
                        <!-- end tr -->
                        <!-- end tr -->
                        <tr>
                            <th scope="row" colspan="4" class="text-end">Sub Total</th>
                            <td class="text-end">{{ json_decode($body)->currency . ' ' .json_decode($body)->price }}</td>
                        </tr>
                        <!-- end tr -->
                        <tr>
                            <th scope="row" colspan="4" class="border-0 text-end">
                                Discount :
                            </th>
                            <td class="border-0 text-end"> {{json_decode($body)->currency . ' '}}0</td>
                        </tr>

                        <tr>
                            <th scope="row" colspan="4" class="border-0 text-end">
                                Tax
                            </th>
                            <td class="border-0 text-end">{{json_decode($body)->currency . ' '}}0</td>
                        </tr>
                        <!-- end tr -->
                        <tr>
                            <th scope="row" colspan="4" class="border-0 text-end">Total</th>
                            <td class="border-0 text-end"><h4
                                    class="m-0 fw-semibold">{{json_decode($body)->currency . ' ' . json_decode($body)->price}}</h4>
                            </td>
                        </tr>
                        <!-- end tr -->
                        </tbody><!-- end tbody -->
                    </table><!-- end table -->
                </div><!-- end table responsive -->
                <div class="d-print-none mt-4">
                    <div class="float-end">
                        <a href="javascript:window.print()" class="btn btn-success me-1"><i class="fa fa-print"></i></a>
                    </div>
                </div>

                <thead>
                <tr>
                    <th class="row"> <h5 >You Should take an action</h5></th>
                    <th class="row"><div class="col-md-2">
                            <a class="btn btn-success" href="{{url('/booking/update-status?status=2&request=').
                                base64_encode(json_encode(json_decode($body)->request))}}" target="_blank" > Approve</a>
                            <a class="btn btn-danger"
                               href="{{url('/booking/update-status?status=5&request='). base64_encode(json_encode(json_decode($body)->request))}}"
                               target="_blank" > Reject</a>
                        </div>
                    </th>
                </tr>
                </thead>
            </div>
        </div>

    </div>
</div>
</body>
</html>
