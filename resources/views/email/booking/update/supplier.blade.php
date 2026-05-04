<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.1/css/all.min.css"
      integrity="sha256-2XFplPlrFClt0bIdPgpz8H7ojnk10H69xRqd9+uTShA=" crossorigin="anonymous"/>
<link rel="stylesheet" href="http://staging.autours.net/assets/css/styles.css"/>
<div class="container">
    <div class="card">
        <div class="card-body">
            <div class="invoice-title">
                <h3>Hi {{json_decode($body)->customer->name}} !</h3>
                <h4 class="float-end font-size-15">Invoice {{json_decode($body)->order_number}} <span
                            class="badge bg-success font-size-12 ms-2">Paid</span></h4>
                <div class="mb-4">
                    <h2 class="mb-1 text-muted">autours.net</h2>
                </div>
                <div class="text-muted">
                    <p class="mb-1">{{json_decode($body)->customer->address}}</p>
                    <p class="mb-1"><i class="uil uil-envelope-alt me-1"></i>{{json_decode($body)->customer->email}}</p>
                    <p><i class="uil uil-phone me-1"></i>{{json_decode($body)->customer->phone_num}}</p>
                </div>
            </div>

            <hr class="my-4">
            <p>This a confirmation to your reservation and here is the details:</p>
            <p>The car model is {{json_decode($body)->vehicle->name}}</p>
            <img src="{{base_path('/img/vehicles/') . json_decode($body)->vehicle->photo}}" height="100"
                 width="150"/>
            <div class="row">
                <div class="col-sm-6">
                    <div class="text-muted">
                        <h5 class="font-size-16 mb-3">Billed To:</h5>
                        <h5 class="font-size-15 mb-2">Autours</h5>
                        <p class="mb-1">4068 Post Avenue Newfolden, MN 56738</p>
                        <p class="mb-1">PrestonMiller@armyspy.com</p>
                        <p>001-234-5678</p>
                    </div>
                </div>
                <!-- end col -->
                <div class="col-sm-6">
                    <div class="text-muted text-sm-end">
                        <div>
                            <h5 class="font-size-15 mb-1">Invoice No:</h5>
                            <p>{{json_decode($body)->order_number}}</p>
                        </div>
                        <div class="mt-4">
                            <h5 class="font-size-15 mb-1">Invoice Date:</h5>
                            <p>{{\Carbon\Carbon::parse(json_decode($body)->created_at)->toDateString()}}</p>
                        </div>
                        <div class="mt-4">
                            <h5 class="font-size-15 mb-1">Order No:</h5>
                            <p>#{{json_decode($body)->id}}</p>
                        </div>
                    </div>
                </div>
                <!-- end col -->
            </div>
            <!-- end row -->

            <div class="py-2">
                <h5 class="font-size-15">Order Summary</h5>

                <div class="table-responsive">
                    <table class="table align-middle table-nowrap table-centered mb-0">
                        <thead>
                        <tr>
                            <th style="width: 70px;">No.</th>
                            <th>Vehicle model</th>
                            <th>Price Per Night</th>
                            <th>Number Of days</th>
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
            </div>
        </div>
    </div>
</div>
<style>
    body {
        margin-top: 20px;
        background-color: #eee;
    }

    .card {
        box-shadow: 0 20px 27px 0 rgb(0 0 0 / 5%);
    }

    .card {
        position: relative;
        display: flex;
        flex-direction: column;
        min-width: 0;
        word-wrap: break-word;
        background-color: #fff;
        background-clip: border-box;
        border: 0 solid rgba(0, 0, 0, .125);
        border-radius: 1rem;
    }
</style>
