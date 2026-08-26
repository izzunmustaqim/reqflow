<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>{{ config('app.name', 'Sample Management') }}</title>
    @viteReactRefresh
    @vite(['resources/js/app.tsx'])
    @inertiaHead
</head>
<body class="font-sans antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    @inertia
</body>
</html>
