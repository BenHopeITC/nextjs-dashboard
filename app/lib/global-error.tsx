// To handle errors within the root layout or template, use a variation of error.js called global-error.js.
// global-error.js is only enabled in production. In development, our error overlay will show instead.

'use client'; // Error components must be Client Components

import { useEffect } from 'react';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <h2>
          Something went wrong! Global error!! Should use error.tsx in parent
          folder when error in child&apos;s layout.js or template.js
        </h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
