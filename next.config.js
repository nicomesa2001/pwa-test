/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
	dest: 'public',
	register: true,
	skipWaiting: true,
	disable: process.env.NODE_ENV === 'development',
	fallbacks: {
		image: '/images/fallback.png',
		document: '/offline.html',
		font: '/fonts/fallback.woff2',
	},
	cacheOnFrontEndNav: true,
	runtimeCaching: [
		{
			urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
			handler: 'CacheFirst',
			options: {
				cacheName: 'google-fonts',
				expiration: {
					maxEntries: 20,
					maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
				},
			},
		},
		{
			urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
			handler: 'StaleWhileRevalidate',
			options: {
				cacheName: 'static-font-assets',
				expiration: {
					maxEntries: 20,
					maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
				},
			},
		},
		{
			urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
			handler: 'StaleWhileRevalidate',
			options: {
				cacheName: 'static-image-assets',
				expiration: {
					maxEntries: 64,
					maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
				},
			},
		},
		{
			urlPattern: /\/_next\/image\?url=.+$/i,
			handler: 'StaleWhileRevalidate',
			options: {
				cacheName: 'next-image',
				expiration: {
					maxEntries: 64,
					maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
				},
			},
		},
		{
			urlPattern: /\.(?:mp3|wav|ogg)$/i,
			handler: 'CacheFirst',
			options: {
				cacheName: 'static-audio-assets',
				expiration: {
					maxEntries: 32,
					maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
				},
			},
		},
		{
			urlPattern: /\.(?:js)$/i,
			handler: 'StaleWhileRevalidate',
			options: {
				cacheName: 'static-js-assets',
				expiration: {
					maxEntries: 32,
					maxAgeSeconds: 60 * 60 * 24 * 7 // 7 días
				},
			},
		},
		{
			urlPattern: /\.(?:css|less)$/i,
			handler: 'StaleWhileRevalidate',
			options: {
				cacheName: 'static-style-assets',
				expiration: {
					maxEntries: 32,
					maxAgeSeconds: 60 * 60 * 24 * 7 // 7 días
				},
			},
		},
		{
			urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
			handler: 'StaleWhileRevalidate',
			options: {
				cacheName: 'next-data',
				expiration: {
					maxEntries: 32,
					maxAgeSeconds: 60 * 60 // 1 hora
				},
			},
		},
		{
			urlPattern: /\/api\/.+$/i,
			handler: 'NetworkFirst',
			options: {
				cacheName: 'apis',
				expiration: {
					maxEntries: 16,
					maxAgeSeconds: 60 * 60 // 1 hora
				},
				networkTimeoutSeconds: 10 // timeout después de 10 segundos
			},
		},
		{
			urlPattern: /\/api\/auth\/.+$/i,
			handler: 'NetworkFirst',
			options: {
				cacheName: 'auth-api',
				expiration: {
					maxEntries: 16,
					maxAgeSeconds: 60 * 60 // 1 hora
				},
				networkTimeoutSeconds: 10 // timeout después de 10 segundos
			},
		},
		{
			urlPattern: /.*/i,
			handler: 'NetworkFirst',
			options: {
				cacheName: 'others',
				expiration: {
					maxEntries: 32,
					maxAgeSeconds: 60 * 60 // 1 hora
				},
				networkTimeoutSeconds: 10 // timeout después de 10 segundos
			},
		},
	],
})

module.exports = withPWA({
	reactStrictMode: true,
	swcMinify: true,
	compilerOptions: {
		removeConsole: process.env.NODE_ENV !== 'development',
	},
})
