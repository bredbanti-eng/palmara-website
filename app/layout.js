import './globals.css';

export const metadata = {
  title: 'Palmara — palm reading from a photo',
  description:
    "Upload a photo of your palm and get a warm, personalized palm reading based on traditional palmistry hand shapes. Your photo never leaves your device.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
