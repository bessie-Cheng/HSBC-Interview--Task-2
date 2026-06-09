"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Property Valuation", href: "/property-valuation" },
  { name: "Market Analysis", href: "/market-analysis" },
];

export default function SimpleNavBar() {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-4 py-2 text-sm font-medium rounded-md transition-all
                  ${isActive 
                    ? "bg-black text-white font-bold" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }
                `}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}