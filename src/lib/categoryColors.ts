// Helper para obter as classes de cor para badges de categoria
export const getCategoryBadgeClasses = (colorClass: string): string => {
  const colorMap: Record<string, string> = {
    'text-teal-800': 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-300',
    'text-blue-800': 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300',
    'text-red-800': 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300',
    'text-purple-800': 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300',
    'text-orange-800': 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-300',
    'text-green-800': 'bg-green-50 hover:bg-green-100 text-green-700 border-green-300',
    'text-pink-800': 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-300',
    'text-indigo-800': 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-300',
  };

  return colorMap[colorClass] || 'bg-green-50 hover:bg-green-100 text-green-700 border-green-300';
};
