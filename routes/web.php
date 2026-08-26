<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SampleRequestController;
use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\DispatchController;
use App\Http\Controllers\SignOffController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('dashboard'));

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
});

Route::post('/logout', [LoginController::class, 'destroy'])->name('logout')->middleware('auth');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Sample Requests
    Route::get('/requests/create', [SampleRequestController::class, 'create'])->name('requests.create');
    Route::post('/requests', [SampleRequestController::class, 'store'])->name('requests.store');
    Route::post('/requests/{sampleRequest}/submit', [SampleRequestController::class, 'submit'])->name('requests.submit');
    Route::get('/requests/{sampleRequest}', [SampleRequestController::class, 'show'])->name('requests.show');

    // Approval (Manager only)
    Route::middleware('role:manager')->prefix('approvals')->group(function () {
        Route::get('/', [ApprovalController::class, 'index'])->name('approvals.index');
        Route::get('/{sampleRequest}', [ApprovalController::class, 'show'])->name('approvals.show');
        Route::put('/{sampleRequest}', [ApprovalController::class, 'update'])->name('approvals.update');
    });

    // Dispatch
    Route::prefix('dispatch')->group(function () {
        Route::get('/', [DispatchController::class, 'index'])->name('dispatch.index');
        Route::get('/{sampleRequest}', [DispatchController::class, 'show'])->name('dispatch.show');
        Route::post('/{sampleRequest}', [DispatchController::class, 'dispatch'])->name('dispatch.dispatch');
    });

    // Sign-Off
    Route::prefix('sign-off')->group(function () {
        Route::get('/{sampleRequest}', [SignOffController::class, 'show'])->name('signoff.show');
        Route::post('/{sampleRequest}', [SignOffController::class, 'store'])->name('signoff.store');
    });

    // Admin
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/', [AdminController::class, 'index'])->name('admin.index');
        Route::get('/export', [AdminController::class, 'export'])->name('admin.export');
    });
});
