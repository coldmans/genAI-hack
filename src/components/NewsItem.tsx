import React from 'react';
import { ChevronRight, Clock } from 'lucide-react';

interface News {
  id: string;
  title: string;
  source: string;
  time: string;
  category: string;
}

interface NewsItemProps {
  news: News;
}

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    지원금: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm',
    세금: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm',
    규제: 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-sm',
    노무: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm',
    위생: 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-sm',
  };
  return colors[category] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-sm';
};

export function NewsItem({ news }: NewsItemProps) {
  return (
    <button className="group relative overflow-hidden glass glass-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.01]">
      {/* 좌측 액센트 바 */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${getCategoryColor(
                news.category
              )}`}
            >
              {news.category}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-base leading-snug">
            {news.title}
          </h4>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{news.source}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {news.time}
            </span>
          </div>
        </div>
        <ChevronRight className="flex-shrink-0 w-5 h-5 text-gray-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-purple-500" />
      </div>
    </button>
  );
}
