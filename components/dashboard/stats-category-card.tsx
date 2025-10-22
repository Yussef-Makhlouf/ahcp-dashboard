import React from 'react';
import { Users, MapPin, Home, Syringe, Heart, Bug, FlaskConical } from 'lucide-react';

interface StatsCategoryCardProps {
  title: string;
  color: string;
  stats: {
    servedOwners: number;
    visitedVillages: number;
    visitedHerds: number;
    animals: number;
  };
  icon: React.ReactNode;
  animalLabel?: string;
  categoryIcon?: React.ReactNode;
}

export function StatsCategoryCard({ 
  title, 
  color, 
  stats, 
  icon,
  animalLabel = "Animals",
  categoryIcon
}: StatsCategoryCardProps) {
  return (
    <div className="group flex items-center space-x-6 p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      {/* Enhanced Circular label with category icon */}
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-sm text-center relative shadow-lg group-hover:shadow-xl transition-all duration-300"
        style={{ backgroundColor: color }}
      >
        {categoryIcon && (
          <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            {categoryIcon}
          </div>
        )}
        <div className="text-xs leading-tight font-semibold">
          {title.split(' ').map((word, index) => (
            <div key={index}>{word}</div>
          ))}
        </div>
      </div>
      
      {/* Enhanced Stats grid */}
      <div className="flex-1 grid grid-cols-4 gap-6">
        <div className="text-center group/stat">
          <div className="flex justify-center mb-3 group-hover/stat:scale-110 transition-transform duration-200">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 group-hover/stat:text-blue-600 transition-colors duration-200">
            {stats.servedOwners.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 font-medium">Served Owners</div>
        </div>
        
        <div className="text-center group/stat">
          <div className="flex justify-center mb-3 group-hover/stat:scale-110 transition-transform duration-200">
            <div className="p-2 bg-red-50 rounded-lg">
              <MapPin className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 group-hover/stat:text-red-600 transition-colors duration-200">
            {stats.visitedVillages.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 font-medium">Visited Villages</div>
        </div>
        
        <div className="text-center group/stat">
          <div className="flex justify-center mb-3 group-hover/stat:scale-110 transition-transform duration-200">
            <div className="p-2 bg-green-50 rounded-lg">
              <Home className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 group-hover/stat:text-green-600 transition-colors duration-200">
            {stats.visitedHerds.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 font-medium">Visited Herds</div>
        </div>
        
        <div className="text-center group/stat">
          <div className="flex justify-center mb-3 group-hover/stat:scale-110 transition-transform duration-200">
            <div className="p-2 bg-amber-50 rounded-lg">
              {icon}
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 group-hover/stat:text-amber-600 transition-colors duration-200">
            {stats.animals.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 font-medium">{animalLabel}</div>
        </div>
      </div>
    </div>
  );
}
