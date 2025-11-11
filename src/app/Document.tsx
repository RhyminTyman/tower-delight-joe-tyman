export const Document: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Tower Delight | Driver Workflow</title>
      <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp"></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
                  },
                  colors: {
                    brand: {
                      DEFAULT: '#1F4F8A',
                      foreground: '#F7FBFF'
                    },
                    accent: {
                      DEFAULT: '#F5A524',
                      foreground: '#0B1A2E'
                    }
                  }
                }
              }
            }
          `,
        }}
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link rel="modulepreload" href="/src/client.tsx" />
    </head>
    <body className="bg-slate-900 text-slate-100 font-sans antialiased">
      <div id="root">{children}</div>
      <script>import("/src/client.tsx")</script>
    </body>
  </html>
);
