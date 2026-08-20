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
            $subscriber = Subscriber::where('email', $request->email)->first();
            
            if ($subscriber) {
                if ($request->has('country') && !empty($request->country)) {
                    $subscriber->country = $request->input('country');
                    $subscriber->save();
                }
            } else {
                $createData = ['email' => $request->email, 'type' => 'offers'];
                if ($request->has('country') && !empty($request->country)) {
                    $createData['country'] = $request->input('country');
                }
                $subscriber = Subscriber::create($createData);
                event(new SendEmailEvent($request->type, $request->email));
            }
        }
        if ($request->type == 'supplier') {
            $updateData = ['type' => 'supplier'];
            if ($request->has('country') && !empty($request->country)) {
                $updateData['country'] = $request->country ?? $request->input('country');
            }

            $subscriber = Subscriber::updateOrCreate(
                ['email' => $request->email],
                $updateData
            );
            if ($subscriber->wasRecentlyCreated || $subscriber->wasChanged('type')) {
                event(new SendEmailEvent($request->type, $request->email));
            }
        }
        return response()->json(['status' => 1]);
    }

    public function destroy(\Illuminate\Http\Request $request)
    {
        Subscriber::where('id', $request->id)->delete();
        return Subscriber::all();
    }

}
