import * as Lucide from 'lucide-react';

console.log('Search type:', typeof Lucide.Search);
console.log('Search prototype:', Object.getPrototypeOf(Lucide.Search));
console.log('Is constructor:', Lucide.Search.prototype?.constructor === Lucide.Search);
