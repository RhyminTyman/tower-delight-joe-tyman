import "@/styles/globals.css";

export const Document: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Tower Delight | Driver Workflow</title>
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
    <body className="bg-background text-foreground font-sans antialiased">
      <div id="root">{children}</div>
      <script type="module" dangerouslySetInnerHTML={{ __html: `import("/src/client.tsx")` }} />
    </body>
  </html>
);
