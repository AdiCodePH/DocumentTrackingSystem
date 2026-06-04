<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocumentFileController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('login');
});

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.store');
Route::get('/logout', [AuthController::class, 'logout']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/dashboard', function () {
    return view('welcome');
})->middleware('auth')->name('dashboard');

Route::get('/admin', function () {
    return redirect('dashboard');
})->middleware('auth')->name('admin');

Route::get('/super-admin', function () {
    if (Auth::user()->role !== 'super-admin') {
        abort(403, 'Only super-admin accounts can access approvals.');
    }

    return view('super-admin');
})->middleware('auth')->name('super-admin');

Route::get('/super-admin.html', function () {
    return redirect('super-admin');
});

Route::get('/CSS/main.css', function () {
    return response()->file(resource_path('css/main.css'), [
        'Content-Type' => 'text/css; charset=UTF-8',
    ]);
});

Route::get('/Js/Script.js', function () {
    return response()->file(resource_path('js/Script.js'), [
        'Content-Type' => 'application/javascript; charset=UTF-8',
    ]);
});

Route::get('/Js/super-admin.js', function () {
    return response()->file(resource_path('js/super-admin.js'), [
        'Content-Type' => 'application/javascript; charset=UTF-8',
    ]);
});

Route::prefix('api/files')->middleware('auth')->group(function () {
    Route::get('/', [DocumentFileController::class, 'index']);
    Route::post('/', [DocumentFileController::class, 'store']);
    Route::patch('/{documentFile:tracking_no}/request-release', [DocumentFileController::class, 'requestRelease']);
    Route::patch('/{documentFile:tracking_no}/release', [DocumentFileController::class, 'release']);
    Route::patch('/{documentFile:tracking_no}/approve-release', [DocumentFileController::class, 'approveRelease']);
    Route::patch('/{documentFile:tracking_no}/return-to-received', [DocumentFileController::class, 'returnToReceived']);
});
