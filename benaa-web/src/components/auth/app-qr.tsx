"use client";

import { QRCodeSVG } from "qrcode.react";

export function AppQr({ value }: { value: string }) {
  return <QRCodeSVG value={value} size={220} bgColor="#FFFFFF" fgColor="#14171A" level="M" marginSize={2} />;
}
