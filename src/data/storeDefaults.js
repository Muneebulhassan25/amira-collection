import { categories, products } from './products.js';

const collectionDescriptions = {
  'new-arrivals': 'The latest pieces added to the studio edit.',
  dresses: 'Considered silhouettes for everyday plans and special moments.',
  abayas: 'Graceful layers with room to move through the day.',
  sets: 'Easy pairings designed to work beautifully together or apart.',
  scarves: 'Soft finishing touches and considered everyday layers.',
  swimwear: 'Modest swimwear and coordinated pieces for time by the water.',
  'winter-collection': 'Warm layers, tactile knits, and pieces for cooler days.',
  'gift-items': 'Thoughtful small pieces to share or keep close.',
  sale: 'Pieces explicitly marked for sale or with a valid sale price.',
};

export function createDefaultStoreData() {
  const featuredProductIds = products.slice(0, 4).map((item) => item.id);
  const collectionRecords = categories.filter((item) => item.id !== 'all').map((item) => ({
    id: item.id,
    title: item.name,
    description: collectionDescriptions[item.id] || '',
    image: item.image,
    displayStatus: 'published',
    featuredOnHomepage: true,
  }));
  collectionRecords.unshift({ id: 'new-arrivals', title: 'New Arrivals', description: collectionDescriptions['new-arrivals'], image: products[0].image, displayStatus: 'published', featuredOnHomepage: false });
  return {
    version: 1,
    products: products.map((product) => ({
      ...product,
      images: product.images?.length ? [...product.images] : [product.image],
      sku: product.sku || '',
      inventoryQuantity: Number.isInteger(product.inventoryQuantity) ? product.inventoryQuantity : null,
      status: product.status || 'published',
      featured: product.featured ?? featuredProductIds.includes(product.id),
      onSale: product.onSale === true,
      tags: Array.isArray(product.tags) ? [...product.tags] : [],
    })),
    collections: collectionRecords,
    homepage: {
      announcementText: 'A considered collection for the moments that matter · Welcome to our studio',
      heroHeading: 'Wear what',
      heroEmphasis: 'feels like you.',
      heroSubtitle: 'Thoughtful silhouettes, beautiful textures, and room to move through your day.',
      heroImageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2200&q=90',
      heroCtaText: 'Discover the collection',
      heroCtaLink: '#/collections/new-arrivals',
      featuredCollectionIds: collectionRecords.filter((item) => item.id !== 'new-arrivals').map((item) => item.id),
      featuredProductIds,
      newArrivalProductIds: products.filter((item) => item.isNewArrival).map((item) => item.id),
      sections: { hero: true, commitments: true, collections: true, arrivals: true, story: true, featured: true, quote: true, newsletter: true },
    },
    settings: {
      storeName: 'AMIRA Collection',
      contactEmail: '',
      contactPhone: '',
      instagramUrl: '',
      facebookUrl: '',
      currency: 'CAD',
    },
  };
}
