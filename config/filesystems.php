<?php

return [
    'default' => env('FILESYSTEM_DISK', 'local'),
    'disks' => [
        'local' => [
            'driver' => 'local',
            'root' => storage_path('app/private'),
            'serve' => true,
            'throw' => false,
        ],
        'public' => [
            'driver' => 'local',
            'root' => storage_path('app/public'),
            'url' => env('APP_URL').'/storage',
            'visibility' => 'public',
            'throw' => false,
        ],
        'signatures' => [
            'driver' => 'local',
            'root' => storage_path('app/public/signatures'),
            'url' => env('APP_URL').'/storage/signatures',
            'visibility' => 'public',
            'throw' => false,
        ],
        'stamps' => [
            'driver' => 'local',
            'root' => storage_path('app/public/stamps'),
            'url' => env('APP_URL').'/storage/stamps',
            'visibility' => 'public',
            'throw' => false,
        ],
    ],
    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],
];
