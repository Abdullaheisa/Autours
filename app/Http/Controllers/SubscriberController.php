<?php

namespace App\Http\Controllers;

use App\Events\SendEmailEvent;
use App\Http\Requests\SendEmailRequest;
use App\Models\Subscriber;

class SubscriberController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function __construct()
    {
    }

    public function index()
    {
        return Subscriber::all();
    }
    public function sendEmail(SendEmailRequest $request)
    {
        if ($request->type == 'offers') {

            Subscriber::query()->insert([
                'email' => $request->email,
                'type' => 'offers',
                'created_at' => now(),
                'updated_at' => now()
            ]);
            event(new SendEmailEvent($request->type, $request->email));
        }
        if ($request->type == 'supplier') {
            Subscriber::query()->insert([
                'email' => $request->email,
                'type' => 'supplier',
                'country' => $request->country ?? $request->input('country'),
                'created_at' => now(),
                'updated_at' => now()
            ]);
            event(new SendEmailEvent($request->type, $request->email));
        }
        return response()->json(['status' => 1]);
    }

    public function destroy(\Illuminate\Http\Request $request)
    {
        Subscriber::where('id', $request->id)->delete();
        return Subscriber::all();
    }

}
