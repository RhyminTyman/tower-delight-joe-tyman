import styles from "@/styles/globals.css?url";
// @ts-ignore - Vite will resolve this import correctly
import clientEntry from "@/client.tsx?url";

export const Document: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // In development, use source path; in production, use built path
  const clientPath = import.meta.env.DEV ? "/src/client.tsx" : clientEntry;
  
  return (
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
        <link rel="stylesheet" href={styles} />
        <link rel="modulepreload" href={clientPath} />
      </head>
      <body className="bg-background text-foreground font-sans antialiased">
        <div id="root">{children}</div>
        <script type="module" dangerouslySetInnerHTML={{ __html: `import("${clientPath}")` }} />
      </body>
    </html>
  );
};
