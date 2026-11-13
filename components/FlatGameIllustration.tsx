import React from 'react';
import { Bus, Ambulance, Car, Users, Store, PackageOpen, Utensils, HeartPulse, Banknote } from 'lucide-react';

export function FlatGameIllustration({ title, className = 'w-10 h-10' }: { title: string; className?: string }) {
  const text = title.toLowerCase();
  const Icon = /bus|volunteer/.test(text) ? Bus
    : /rescue|transport/.test(text) ? Ambulance
    : /auto|cab/.test(text) ? Car
    : /bystander|community|coordinate|rush|customer|promotion/.test(text) ? Users
    : /stock|restock|inventory/.test(text) ? PackageOpen
    : /stall|entrance|location|corner|booth/.test(text) ? Store
    : /food|feed|kaka/.test(text) ? Utensils
    : /care|treat|medicine|diagnostic|vet/.test(text) ? HeartPulse : Banknote;
  return <svg viewBox="0 0 100 90" className={className} role="img" aria-label={title}>
    <ellipse cx="50" cy="80" rx="40" ry="6" fill="#10243c" opacity=".25" />
    <path d="M12 28Q12 10 31 10H70Q88 10 88 28V59Q88 77 70 77H31Q12 77 12 59Z" fill="#63c5b2" />
    <path d="M12 55H88V59Q88 77 70 77H31Q12 77 12 59Z" fill="#36a698" />
    <circle cx="80" cy="14" r="9" fill="#f8c64e" />
    <Icon x="24" y="20" width="52" height="52" stroke="#173b4b" fill="#fff0c8" strokeWidth="1.6" />
  </svg>;
}
