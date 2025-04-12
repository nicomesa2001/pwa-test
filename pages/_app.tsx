import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/context/AuthContext'
import { BankProvider } from '@/context/BankContext'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ThemeProvider
			attribute='class'
			defaultTheme='system'
			disableTransitionOnChange
		>
			<AuthProvider>
				<BankProvider>
					<Component {...pageProps} />
				</BankProvider>
			</AuthProvider>
		</ThemeProvider>
	)
}
