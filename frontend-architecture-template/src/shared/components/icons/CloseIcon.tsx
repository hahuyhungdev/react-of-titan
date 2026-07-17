// components/icons — SVG convert thành component.
// Pure: nhận SVGProps chuẩn, dùng currentColor để kế thừa màu từ context.
// Nếu icon set lớn → generate bằng SVGR thay vì viết tay.
import type { SVGProps } from 'react';

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}
